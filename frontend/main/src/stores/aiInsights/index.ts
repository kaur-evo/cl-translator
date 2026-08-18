import { defineStore } from 'pinia';
import { isValid, parseISO } from 'date-fns';

import aiInsightsApi from '@/api/aiInsightsApi';
import statisticsApi from '@/api/statisticsApi';
import { handleAiInsightsError, extractErrorCode } from '@/helpers/aiInsights/errorHandler';
import { MIN_NOTES_FOR_ELIGIBILITY } from '@/constants/aiInsights';
import dimension from '@/stores/reportsConfig/constants/dimension';
import measure from '@/stores/reportsConfig/constants/measure';
import { TOTAL } from '@/stores/reportsConfig/constants/granularity';
import type {
  EligibleStation,
  StopReasonEligibility,
} from '@/api/types/aiInsights';

export interface AiInsightsState {
  eligibleStationsMap: Record<string, StopReasonEligibility>;
  lastEligibleStationsFetchKey: string | null;

  menuOpen: boolean;
  selectedStopReasonId: number | null;
  selectedStationId: number | null;

  analyzing: boolean;
  lastRequestId: string | null;

  emailConfirmationOpen: boolean;
}

// ReportData response row shape — dimension fields are arrays, measure fields are scalars
interface ReportDataRow {
  station: string[];
  stationId: number[];
  comment: string[];
  commentId: number[];
  // Required in the API request dimensions/groupBy to avoid backend 500 errors,
  // but not read by transformToEligibleStationsMap.
  commentgroup: string[];
  commentgroupId: number[];
  notescount: number;
}

/**
 * Transforms reportdata rows into the eligibleStationsMap structure.
 * Unwraps array-wrapped dimension fields and filters by MIN_NOTES_FOR_ELIGIBILITY.
 */
export function transformToEligibleStationsMap(
  rows: ReportDataRow[],
): Record<string, StopReasonEligibility> {
  const map: Record<string, StopReasonEligibility> = {};

  for (const row of rows) {
    if (row.notescount < MIN_NOTES_FOR_ELIGIBILITY) continue;

    const commentId = row.commentId?.[0];
    const stationId = row.stationId?.[0];
    const stationName = row.station?.[0];
    const stopReasonName = row.comment?.[0];
    if (commentId === undefined || stationId === undefined || stationName === undefined) continue;

    const key = String(commentId);
    map[key] ??= {
      stopReasonId: commentId,
      stopReasonName: stopReasonName ?? null,
      stations: [],
    };
    map[key].stations.push({
      id: stationId,
      name: stationName,
      noteCount: row.notescount,
    });
  }

  for (const entry of Object.values(map)) {
    entry.stations.sort((a, b) => a.name.localeCompare(b.name));
  }
  return map;
}

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const isValidISODate = (date: string): boolean => ISO_DATE_REGEX.test(date) && isValid(parseISO(date));
const areValidIds = (ids: number[]): boolean => ids.every((id) => Number.isInteger(id) && id > 0);

/** Keys excluded from filters/inverseFilter because they are top-level request fields */
const SUBMIT_EXCLUDED_FILTER_KEYS = ['commentId', 'stationId'] as const;

const useAiInsightsStore = defineStore('aiInsights', {
  state: (): AiInsightsState => ({
    eligibleStationsMap: {},
    lastEligibleStationsFetchKey: null,

    menuOpen: false,
    selectedStopReasonId: null,
    selectedStationId: null,

    analyzing: false,
    lastRequestId: null,

    emailConfirmationOpen: false,
  }),

  getters: {
    getStationsForStopReason: (state: AiInsightsState) => (stopReasonId: number): EligibleStation[] => {
      const eligibility = state.eligibleStationsMap[String(stopReasonId)];
      if (!eligibility) return [];
      return eligibility.stations;
    },

    hasEligibleStations: (state: AiInsightsState) => (stopReasonId: number | null): boolean => {
      if (stopReasonId === null) return false;
      const eligibility = state.eligibleStationsMap[String(stopReasonId)];
      if (!eligibility) return false;
      return eligibility.stations.length > 0;
    },

    selectedStation(state: AiInsightsState): EligibleStation | null {
      if (!state.selectedStopReasonId || !state.selectedStationId) return null;
      const eligibility = state.eligibleStationsMap[String(state.selectedStopReasonId)];
      if (!eligibility) return null;
      return eligibility.stations.find((s) => s.id === state.selectedStationId) ?? null;
    },

    selectedStopReasonName(state: AiInsightsState): string {
      if (!state.selectedStopReasonId) return '';
      const eligibility = state.eligibleStationsMap[String(state.selectedStopReasonId)];
      return eligibility?.stopReasonName ?? '';
    },
  },

  actions: {
    async fetchEligibleStations({
      stopReasonIds,
      startDate,
      endDate,
      filters,
      inverseFilter,
    }: {
      stopReasonIds: number[];
      startDate: string;
      endDate: string;
      filters: Record<string, unknown>;
      inverseFilter: string[];
    }) {
      if (stopReasonIds.length === 0) return;
      if (!areValidIds(stopReasonIds)) {
        console.warn('fetchEligibleStations called with invalid stopReasonIds', stopReasonIds);
        return;
      }
      if (!isValidISODate(startDate) || !isValidISODate(endDate)) {
        console.warn('fetchEligibleStations called with invalid dates', { startDate, endDate });
        return;
      }

      // Dedup: key covers only stopReasonIds + date range. Callers MUST call
      // clearEligibleStations when filters/inverseFilter change, as those are not in the key.
      const fetchKey = `${[...stopReasonIds].sort((a, b) => a - b).join(',')}_${startDate}_${endDate}`;
      if (this.lastEligibleStationsFetchKey === fetchKey) return;

      // Set key BEFORE the await to block duplicate in-flight requests
      this.lastEligibleStationsFetchKey = fetchKey;
      try {
        const response = await statisticsApi.getReportData({
          dimensions: [dimension.STATION, dimension.COMMENT, dimension.COMMENT_GROUP],
          // stopcount and stoptype are required by the backend alongside notescount to avoid 500 errors
          measures: [measure.STOP_COUNT, measure.NOTES_COUNT, measure.STOP_TYPE],
          groupBy: [dimension.STATION, dimension.COMMENT, dimension.COMMENT_GROUP],
          granularity: TOTAL,
          filters: {
            ...filters,
            commentId: stopReasonIds,
          },
          inverseFilter,
          range: { start: startDate, end: endDate },
        });

        const eligibility = transformToEligibleStationsMap(response.results);
        this.eligibleStationsMap = { ...this.eligibleStationsMap, ...eligibility };
      } catch (error) {
        // Reset key on failure so a retry with the same params is allowed
        this.lastEligibleStationsFetchKey = null;
        // No dialog is open here, so snackbar is the correct notification surface
        await handleAiInsightsError(extractErrorCode(error), error);
      }
    },

    /**
     * Clears the eligible stations map and, if the menu is open, closes it first
     * to prevent a (0,0) positioning flash when the anchor DOM element is
     * destroyed during the subsequent table re-render.
     */
    clearEligibleStations() {
      if (this.menuOpen) {
        this.menuOpen = false;
        this.selectedStopReasonId = null;
        this.selectedStationId = null;
      }
      this.eligibleStationsMap = {};
      this.lastEligibleStationsFetchKey = null;
    },

    async submitAnalysis({ startDate, endDate, filters, inverseFilter }: {
      startDate: string;
      endDate: string;
      filters?: Record<string, unknown>;
      inverseFilter?: string[];
    }): Promise<boolean> {
      if (!this.selectedStopReasonId || !this.selectedStationId) return false;
      if (!isValidISODate(startDate) || !isValidISODate(endDate)) return false;

      // Remove excluded keys — they are separate top-level request fields
      const sanitizedFilters = filters ? { ...filters } : undefined;
      if (sanitizedFilters) {
        for (const key of SUBMIT_EXCLUDED_FILTER_KEYS) {
          delete sanitizedFilters[key];
        }
      }
      const sanitizedInverseFilter = inverseFilter?.filter(
        (key) => !(SUBMIT_EXCLUDED_FILTER_KEYS as readonly string[]).includes(key),
      );

      this.analyzing = true;

      try {
        const response = await aiInsightsApi.analyzeNotes({
          stationId: this.selectedStationId,
          stopReasonId: this.selectedStopReasonId,
          startDate,
          endDate,
          ...(sanitizedFilters && Object.keys(sanitizedFilters).length > 0 && { filters: sanitizedFilters }),
          ...(sanitizedInverseFilter && sanitizedInverseFilter.length > 0 && { inverseFilter: sanitizedInverseFilter }),
        });
        this.lastRequestId = response.requestId;

        this.menuOpen = false;
        this.selectedStopReasonId = null;
        this.selectedStationId = null;

        this.emailConfirmationOpen = true;

        return true;
      } catch (error) {
        const errorCode = extractErrorCode(error);
        await handleAiInsightsError(errorCode, error);
        return false;
      } finally {
        this.analyzing = false;
      }
    },

    openMenu(stopReasonId: number) {
      this.selectedStopReasonId = stopReasonId;
      this.menuOpen = true;

      // Auto-select the first station (pre-sorted alphabetically in transformToEligibleStationsMap)
      const eligibility = this.eligibleStationsMap[String(stopReasonId)];
      const stations = eligibility?.stations ?? [];
      this.selectedStationId = stations[0]?.id ?? null;
    },

    closeMenu() {
      this.menuOpen = false;
      this.selectedStopReasonId = null;
      this.selectedStationId = null;
    },

    closeEmailConfirmation() {
      this.emailConfirmationOpen = false;
    },

    selectStation(stationId: number | null) {
      this.selectedStationId = stationId;
    },
  },
});

export default useAiInsightsStore;
