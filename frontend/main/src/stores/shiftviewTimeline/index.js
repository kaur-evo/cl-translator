import { defineStore } from 'pinia';
import { DateTime } from 'luxon';
import { toRaw } from 'vue';

import stateUpdateHelper from '@/helpers/incremental/incrementalStateHelper';
import routesApi from '@/api/routesApi';
import useShiftStore from '@/stores/shift';
import useStationStore from '@/stores/station';
import useCommentStore from '@/stores/comment';
import useUserPreferencesStore from '@/stores/userPreferences';

const useShiftviewTimelineStore = defineStore('shiftviewTimeline', {
  state: () => ({
    timeline: [],
    teamTimeline: [],
    operatorTimeline: [],
    performanceLossTimeline: [],
    batches: new Map(),
    yellowSlices: [],
    batchTargetFlags: [],
    batchQtyBeforeShift: { producedQty: 0, scrapQty: 0 },
    currentRoute: null,
  }),
  actions: {
    setTimelineFakeState({ sliceUpdates, finishedCB }) {
      const shiftStore = useShiftStore();
      const stationStore = useStationStore();
      const { commentsRealMap } = useCommentStore();
      const timezone = stationStore.lineviewStation.zoneId;

      const { transformedTimeline, batchTargetFlags } = stateUpdateHelper(
        this.timeline,
        sliceUpdates,
        this.batches,
        commentsRealMap,
        shiftStore.$state,
        timezone,
        this.batchQtyBeforeShift,
      );
      window.WorkerService
        .process('processTimelineStatistics', {
          timeline: transformedTimeline,
          timezone,
          shift: toRaw(shiftStore.$state),
        })
        .then(({ statistics, shift }) => {
          if (shift.shift.version !== shiftStore.shift.version) return;
          this.timeline = transformedTimeline;
          this.batchTargetFlags = batchTargetFlags;
          shiftStore.statisticsRaw = statistics;
          if (finishedCB) finishedCB();
        });
    },
    setTimelineState({
      batches, teamTimeline, performanceLossTimeline, timeline,
    }) {
      if (batches) {
        const batchList = batches.length ? batches.reverse() : [];
        this.batches = new Map(batchList.map((batch) => [batch.id, batch]));
      }
      if (teamTimeline) {
        this.teamTimeline = teamTimeline;
      }
      if (performanceLossTimeline) {
        this.performanceLossTimeline = performanceLossTimeline;
      }
      if (timeline) {
        this.timeline = timeline;
      }
    },
    setBatches(batches) {
      const batchList = batches.length ? batches.reverse() : [];
      this.batches = new Map(batchList.map((batch) => [batch.id, batch]));
    },
    setBatchQtyBeforeShift(batchQtyBeforeShift) {
      if (batchQtyBeforeShift === null) {
        this.batchQtyBeforeShift = { producedQty: 0, scrapQty: 0 };
      } else {
        this.batchQtyBeforeShift = batchQtyBeforeShift;
      }
    },
    async fetchCurrentRoute() {
      const stationStore = useStationStore();
      const routes = await routesApi.getRoutes({
        stationId: stationStore.lineviewStation.id,
        productId: this.currentBatch.productId,
      });
      this.currentRoute = routes[0] ?? null;
    },
    setYellowSlices(slices) {
      this.yellowSlices = slices;
    },
  },
  getters: {
    shiftScrapDisplayValue() {
      return this.getShiftDisplayValue('scrapQty', 'scrapAltQty');
    },
    shiftTotalDisplayValue() {
      return this.getShiftDisplayValue('quantity', 'quantityAlt');
    },
    getShiftDisplayValue() {
      return (mainKey, altKey) => {
        const { usePrimaryUnit } = useUserPreferencesStore().viewSettings;
        const shiftStore = useShiftStore();
        const key = usePrimaryUnit ? mainKey : altKey;
        return shiftStore.statistics?.shiftTotal?.[key] || 0;
      };
    },
    currentBatch: (state) => state.batches.values().next().value || {},
    slicesByType: (state) => {
      const slices = {
        products: [],
        commented: [],
        uncommented: [],
        planned: [],
        plannedInclInOee: [],
        plannedExclInOee: [],
        productChanges: [],
      };
      state.timeline.forEach((slice) => {
        if (slice.isProductChange) {
          slices.productChanges.push(slice);
        }
        switch (slice.type) {
          case 'PRODUCT':
            slices.products.push(slice);
            break;
          case 'STOPPAGE':
            if (slice.commentId === 0) {
              slices.uncommented.push(slice);
            } else {
              slices.commented.push(slice);
            }
            break;
          case 'STANDBY':
            if (slice.includeInOee) {
              slices.plannedInclInOee.push(slice);
            } else {
              slices.plannedExclInOee.push(slice);
            }
            slices.planned.push(slice);
            break;
          default:
            break;
        }
      });
      return slices;
    },
    speedlossSlices() {
      const stationStore = useStationStore();
      const { zoneId } = stationStore.lineviewStation;
      const { timeline, performanceLossTimeline } = this;
      return timeline.reduce((acc, slice) => {
        if (slice.yellowEnd) {
          const yellowEnd = DateTime.fromISO(slice.yellowEnd, { zone: zoneId });
          const sliceStart = DateTime.fromISO(slice.sliceStartTmISO, { zone: zoneId });
          const sliceCopy = { ...slice };
          sliceCopy.yellowDuration = yellowEnd.diff(sliceStart, 'seconds').toObject().seconds;

          const perfLoss = performanceLossTimeline.find(
            (loss) => {
              const lossStart = DateTime.fromISO(loss.startTimeISO, { zone: zoneId });
              const lossEnd = DateTime.fromISO(loss.endTimeISO, { zone: zoneId });
              return lossStart <= sliceStart && yellowEnd <= lossEnd;
            },
          );
          if (perfLoss) {
            sliceCopy.perfLossCommentId = perfLoss.commentId;
            sliceCopy.perfLossTimelineStart = perfLoss.startTimeISO;
            sliceCopy.perfLossPositionId = perfLoss.positionId;
            sliceCopy.perfLossNotes = perfLoss.notes;
          } else {
            sliceCopy.perfLossCommentId = 0;
            sliceCopy.perfLossTimelineStart = slice.sliceStartTmISO;
            sliceCopy.perfLossPositionId = 0;
            sliceCopy.perfLossNotes = '';
          }
          acc.push(sliceCopy);
        }
        return acc;
      }, []);
    },
    yellowRanges() {
      let lastBatch = null;
      let lastTimelineStart = null;
      const result = [];
      this.speedlossSlices.forEach((slice) => {
        if (slice.batchId !== lastBatch || slice.perfLossTimelineStart !== lastTimelineStart) {
          lastBatch = slice.batchId;
          lastTimelineStart = slice.perfLossTimelineStart;
          result.push({
            batchId: slice.batchId,
            perfLossCommentId: slice.perfLossCommentId,
            perfLossTimelineStart: slice.perfLossTimelineStart,
            yellowSlices: [slice],
          });
        } else {
          result[result.length - 1].yellowSlices.push(slice);
        }
      });
      return result;
    },
    hourYellowSlices: (state) => {
      const hourYellowSlices = new Map();
      state.yellowSlices.forEach((slice) => {
        const { hourStart } = slice;
        const hourArray = hourYellowSlices.get(hourStart) || [];
        hourArray.push(slice);
        hourYellowSlices.set(hourStart, hourArray);
      });
      return hourYellowSlices;
    },
  },
});

export default useShiftviewTimelineStore;
