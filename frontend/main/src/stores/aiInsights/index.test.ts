import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { flushPromises } from '@vue/test-utils';

import useAiInsightsStore, { transformToEligibleStationsMap } from './index';

import aiInsightsApi from '@/api/aiInsightsApi';
import statisticsApi from '@/api/statisticsApi';
import useGenericNotificationStore from '@/stores/genericNotification';
vi.mock('@/api/aiInsightsApi');
vi.mock('@/api/statisticsApi', () => ({ default: { getReportData: vi.fn() } }));
vi.mock('@/services/i18n', () => ({ default: { global: { t: (key: string) => key } } }));

describe('aiInsights store', () => {
  let store: ReturnType<typeof useAiInsightsStore>;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useAiInsightsStore();
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('has all boolean flags initially false', () => {
      expect(store.menuOpen).toBe(false);
      expect(store.analyzing).toBe(false);
      expect(store.emailConfirmationOpen).toBe(false);
    });

    it('has all nullable fields initially null', () => {
      expect(store.selectedStopReasonId).toBeNull();
      expect(store.selectedStationId).toBeNull();
      expect(store.lastRequestId).toBeNull();
    });

    it('has empty eligible stations map', () => {
      expect(store.eligibleStationsMap).toStrictEqual({});
    });

    it('has lastEligibleStationsFetchKey initially null', () => {
      expect(store.lastEligibleStationsFetchKey).toBeNull();
    });
  });

  describe('getters', () => {
    it('hasEligibleStations returns true when stations exist (server pre-filtered)', () => {
      store.eligibleStationsMap = {
        5: {
          stopReasonId: 5, stopReasonName: 'Jamup',
          stations: [{ id: 1, name: 'Station A', noteCount: 100 }],
        },
      };
      expect(store.hasEligibleStations(5)).toBe(true);
    });

    it('hasEligibleStations returns false when stations array is empty', () => {
      store.eligibleStationsMap = {
        5: {
          stopReasonId: 5, stopReasonName: 'Test',
          stations: [],
        },
      };
      expect(store.hasEligibleStations(5)).toBe(false);
    });

    it('hasEligibleStations returns false for non-existent stopReasonId', () => {
      expect(store.hasEligibleStations(999)).toBe(false);
    });

    it('hasEligibleStations returns false for null stopReasonId', () => {
      expect(store.hasEligibleStations(null)).toBe(false);
    });

    it('getStationsForStopReason returns all stations (server pre-filtered by minNotes)', () => {
      store.eligibleStationsMap = {
        5: {
          stopReasonId: 5, stopReasonName: 'Jamup',
          stations: [
            { id: 1, name: 'Station A', noteCount: 100 },
            { id: 2, name: 'Station B', noteCount: 60 },
            { id: 3, name: 'Station C', noteCount: 50 },
          ],
        },
      };
      const result = store.getStationsForStopReason(5);
      expect(result).toHaveLength(3);
      expect(result.map((s: { id: number }) => s.id)).toStrictEqual([1, 2, 3]);
    });

    it('getStationsForStopReason returns empty array for non-existent stopReasonId', () => {
      expect(store.getStationsForStopReason(999)).toStrictEqual([]);
    });

    it('selectedStation resolves full station object', () => {
      store.eligibleStationsMap = {
        5: {
          stopReasonId: 5, stopReasonName: 'Jamup',
          stations: [{ id: 1, name: 'Station A', noteCount: 100 }],
        },
      };
      store.selectedStopReasonId = 5;
      store.selectedStationId = 1;
      expect(store.selectedStation).toStrictEqual({ id: 1, name: 'Station A', noteCount: 100 });
    });

    it('selectedStation returns null when nothing selected', () => {
      expect(store.selectedStation).toBeNull();
    });

    it('selectedStation returns null when stationId does not match any station', () => {
      store.eligibleStationsMap = {
        5: {
          stopReasonId: 5, stopReasonName: 'Jamup',
          stations: [{ id: 1, name: 'Station A', noteCount: 100 }],
        },
      };
      store.selectedStopReasonId = 5;
      store.selectedStationId = 999;
      expect(store.selectedStation).toBeNull();
    });

    it('selectedStopReasonName returns name when selection exists', () => {
      store.eligibleStationsMap = {
        5: {
          stopReasonId: 5, stopReasonName: 'Jamup',
          stations: [{ id: 1, name: 'Station A', noteCount: 100 }],
        },
      };
      store.selectedStopReasonId = 5;
      expect(store.selectedStopReasonName).toBe('Jamup');
    });

    it('selectedStopReasonName returns empty string when nothing selected', () => {
      expect(store.selectedStopReasonName).toBe('');
    });

    it('selectedStopReasonName returns empty string for non-existent stopReasonId', () => {
      store.selectedStopReasonId = 999;
      expect(store.selectedStopReasonName).toBe('');
    });

    it('selectedStopReasonName returns empty string when stopReasonName is null', () => {
      store.eligibleStationsMap = {
        5: { stopReasonId: 5, stopReasonName: null, stations: [] },
      };
      store.selectedStopReasonId = 5;
      expect(store.selectedStopReasonName).toBe('');
    });
  });

  describe('actions acting as mutations', () => {
    it('openMenu + merge preserves existing keys and adds new ones', () => {
      store.eligibleStationsMap = {
        1: { stopReasonId: 1, stopReasonName: 'Old', stations: [] },
      };
      store.eligibleStationsMap = {
        ...store.eligibleStationsMap,
        2: { stopReasonId: 2, stopReasonName: 'New', stations: [] },
      };
      expect(Object.keys(store.eligibleStationsMap)).toHaveLength(2);
      expect(store.eligibleStationsMap['1']).toBeDefined();
      expect(store.eligibleStationsMap['2']).toBeDefined();
    });

    it('merge overwrites existing key with same id', () => {
      store.eligibleStationsMap = {
        1: { stopReasonId: 1, stopReasonName: 'Old', stations: [] },
      };
      store.eligibleStationsMap = {
        ...store.eligibleStationsMap,
        1: { stopReasonId: 1, stopReasonName: 'Updated', stations: [] },
      };
      expect(store.eligibleStationsMap['1']?.stopReasonName).toBe('Updated');
    });

    it('openMenu auto-selects the first station when stations are available', () => {
      store.eligibleStationsMap = {
        42: {
          stopReasonId: 42,
          stopReasonName: 'Machine jam',
          stations: [
            { id: 1, name: 'Alpha Station', noteCount: 60 },
            { id: 2, name: 'Beta Station', noteCount: 80 },
          ],
        },
      };

      store.openMenu(42);

      expect(store.selectedStationId).toBe(1);
      expect(store.menuOpen).toBe(true);
      expect(store.selectedStopReasonId).toBe(42);
    });

    it('openMenu sets selectedStationId to null when no stations exist for stop reason', () => {
      store.eligibleStationsMap = {};

      store.openMenu(99);

      expect(store.selectedStationId).toBeNull();
    });
  });

  describe('actions', () => {
    describe('fetchEligibleStations', () => {
      const defaultPayload = {
        stopReasonIds: [10, 20],
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        filters: { stationId: [1, 2], factoryId: [1] },
        inverseFilter: [],
      };

      it('calls statisticsApi.getReportData with correct payload', async () => {
        vi.mocked(statisticsApi.getReportData).mockResolvedValue({ results: [] });

        await store.fetchEligibleStations(defaultPayload);

        expect(statisticsApi.getReportData).toHaveBeenCalledWith({
          dimensions: ['station', 'comment', 'commentgroup'],
          measures: ['stopcount', 'notescount', 'stoptype'],
          groupBy: ['station', 'comment', 'commentgroup'],
          granularity: 'total',
          filters: {
            stationId: [1, 2],
            factoryId: [1],
            commentId: [10, 20],
          },
          inverseFilter: [],
          range: { start: '2024-01-01', end: '2024-01-31' },
        });
      });

      it('transforms reportdata rows into eligibleStationsMap', async () => {
        vi.mocked(statisticsApi.getReportData).mockResolvedValue({
          results: [
            {
              station: ['Station A'], stationId: [1],
              comment: ['Stop 1'], commentId: [10],
              commentgroup: ['Group 1'], commentgroupId: [100],
              notescount: 75,
            },
            {
              station: ['Station B'], stationId: [2],
              comment: ['Stop 1'], commentId: [10],
              commentgroup: ['Group 1'], commentgroupId: [100],
              notescount: 60,
            },
          ],
        });

        await store.fetchEligibleStations(defaultPayload);

        const map = store.eligibleStationsMap;
        const entry = map['10'];
        expect(entry).toBeDefined();
        expect(entry?.stopReasonId).toBe(10);
        expect(entry?.stopReasonName).toBe('Stop 1');
        expect(entry?.stations).toHaveLength(2);
      });

      it('filters out rows with notescount below MIN_NOTES_FOR_ELIGIBILITY', async () => {
        vi.mocked(statisticsApi.getReportData).mockResolvedValue({
          results: [
            {
              station: ['Station A'], stationId: [1],
              comment: ['Stop 1'], commentId: [10],
              commentgroup: ['Group 1'], commentgroupId: [100],
              notescount: 49,
            },
            {
              station: ['Station B'], stationId: [2],
              comment: ['Stop 1'], commentId: [10],
              commentgroup: ['Group 1'], commentgroupId: [100],
              notescount: 50,
            },
          ],
        });

        await store.fetchEligibleStations(defaultPayload);

        const map = store.eligibleStationsMap;
        const stations = map['10']?.stations;
        expect(stations).toHaveLength(1);
        expect(stations?.[0]?.name).toBe('Station B');
      });

      it('handles empty results', async () => {
        vi.mocked(statisticsApi.getReportData).mockResolvedValue({ results: [] });

        await store.fetchEligibleStations(defaultPayload);

        expect(Object.keys(store.eligibleStationsMap)).toHaveLength(0);
      });

      it('merges new data into existing map', async () => {
        store.eligibleStationsMap = {
          1: { stopReasonId: 1, stopReasonName: 'Existing', stations: [] },
        };
        vi.mocked(statisticsApi.getReportData).mockResolvedValue({
          results: [
            {
              station: ['Station A'], stationId: [1],
              comment: ['New'], commentId: [2],
              commentgroup: ['Group 1'], commentgroupId: [100],
              notescount: 60,
            },
          ],
        });

        await store.fetchEligibleStations({
          ...defaultPayload, stopReasonIds: [2],
        });

        expect(store.eligibleStationsMap['1']).toBeDefined();
        expect(store.eligibleStationsMap['2']).toBeDefined();
      });

      it('sets lastEligibleStationsFetchKey on successful response', async () => {
        vi.mocked(statisticsApi.getReportData).mockResolvedValue({ results: [] });

        await store.fetchEligibleStations(defaultPayload);

        // Store builds the key internally: sorted IDs + date range
        expect(store.lastEligibleStationsFetchKey).toBe('10,20_2024-01-01_2024-01-31');
      });

      it('clears lastEligibleStationsFetchKey on error', async () => {
        store.lastEligibleStationsFetchKey = 'old-key';
        vi.mocked(statisticsApi.getReportData).mockRejectedValue(new Error('fail'));

        await store.fetchEligibleStations(defaultPayload);

        expect(store.lastEligibleStationsFetchKey).toBeNull();
      });

      it('skips API call when stopReasonIds is empty', async () => {
        await store.fetchEligibleStations({
          ...defaultPayload, stopReasonIds: [],
        });
        expect(statisticsApi.getReportData).not.toHaveBeenCalled();
      });

      it('skips API call when startDate is invalid', async () => {
        await store.fetchEligibleStations({
          ...defaultPayload, startDate: 'not-a-date',
        });
        expect(statisticsApi.getReportData).not.toHaveBeenCalled();
      });

      it('skips API call when endDate is invalid', async () => {
        await store.fetchEligibleStations({
          ...defaultPayload, endDate: 'not-a-date',
        });
        expect(statisticsApi.getReportData).not.toHaveBeenCalled();
      });

      it('skips API call when stopReasonIds contain non-integer values', async () => {
        await store.fetchEligibleStations({
          ...defaultPayload, stopReasonIds: [1.5, 2],
        });
        expect(statisticsApi.getReportData).not.toHaveBeenCalled();
      });

      it('skips API call when stopReasonIds contain zero', async () => {
        await store.fetchEligibleStations({
          ...defaultPayload, stopReasonIds: [0, 1],
        });
        expect(statisticsApi.getReportData).not.toHaveBeenCalled();
      });

      it('skips API call when stopReasonIds contain negative values', async () => {
        await store.fetchEligibleStations({
          ...defaultPayload, stopReasonIds: [-1, 2],
        });
        expect(statisticsApi.getReportData).not.toHaveBeenCalled();
      });

      it('skips API call when startDate is a valid format but invalid calendar date', async () => {
        await store.fetchEligibleStations({
          ...defaultPayload, startDate: '2024-02-31',
        });
        expect(statisticsApi.getReportData).not.toHaveBeenCalled();
      });

      it('skips API call when endDate has invalid month', async () => {
        await store.fetchEligibleStations({
          ...defaultPayload, endDate: '2024-13-01',
        });
        expect(statisticsApi.getReportData).not.toHaveBeenCalled();
      });

      it('skips API call when fetchKey matches lastEligibleStationsFetchKey', async () => {
        vi.mocked(statisticsApi.getReportData).mockResolvedValue({ results: [] });

        await store.fetchEligibleStations(defaultPayload);
        expect(statisticsApi.getReportData).toHaveBeenCalledTimes(1);

        await store.fetchEligibleStations(defaultPayload);
        expect(statisticsApi.getReportData).toHaveBeenCalledTimes(1);
      });

      it('blocks duplicate requests while first is in-flight', async () => {
        let resolveApi: (value: { results: never[] }) => void;
        vi.mocked(statisticsApi.getReportData).mockReturnValue(
          new Promise((resolve) => {
            resolveApi = resolve;
          }),
        );

        const firstCall = store.fetchEligibleStations(defaultPayload);
        const secondCall = store.fetchEligibleStations(defaultPayload);

        expect(statisticsApi.getReportData).toHaveBeenCalledTimes(1);

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        resolveApi!({ results: [] });
        await firstCall;
        await secondCall;

        expect(statisticsApi.getReportData).toHaveBeenCalledTimes(1);
        expect(store.lastEligibleStationsFetchKey).toBe('10,20_2024-01-01_2024-01-31');
      });

      it('resets fetchKey on error so retry is allowed', async () => {
        vi.mocked(statisticsApi.getReportData).mockRejectedValueOnce(new Error('Network'));

        await store.fetchEligibleStations(defaultPayload);
        expect(store.lastEligibleStationsFetchKey).toBeNull();

        vi.mocked(statisticsApi.getReportData).mockResolvedValueOnce({ results: [] });
        await store.fetchEligibleStations(defaultPayload);
        expect(statisticsApi.getReportData).toHaveBeenCalledTimes(2);
      });

      it('handles API errors by showing notification', async () => {
        const notificationStore = useGenericNotificationStore();
        const openNotification = vi.spyOn(notificationStore, 'openNotification');
        vi.mocked(statisticsApi.getReportData).mockRejectedValue({
          response: { data: { errorCode: 'INTERNAL_ERROR', status: 'error', message: 'fail' } },
        });

        await store.fetchEligibleStations(defaultPayload);
        await flushPromises();

        expect(openNotification).toHaveBeenCalledWith(
          expect.objectContaining({ type: 'error' }),
        );
      });
    });

    describe('clearEligibleStations', () => {
      it('clears the eligible stations map and fetch key', () => {
        store.eligibleStationsMap = {
          1: { stopReasonId: 1, stopReasonName: 'Test', stations: [] },
        };
        store.lastEligibleStationsFetchKey = 'some-key';

        store.clearEligibleStations();

        expect(store.eligibleStationsMap).toStrictEqual({});
        expect(store.lastEligibleStationsFetchKey).toBeNull();
      });

      it('closes an open menu before clearing stations to prevent positioning flash', () => {
        store.menuOpen = true;
        store.selectedStopReasonId = 5;
        store.selectedStationId = 1;

        store.clearEligibleStations();

        expect(store.menuOpen).toBe(false);
        expect(store.selectedStopReasonId).toBeNull();
        expect(store.selectedStationId).toBeNull();
        expect(store.eligibleStationsMap).toStrictEqual({});
      });

      it('does not fire CLOSE_MENU when menu is already closed', () => {
        store.menuOpen = false;
        store.selectedStopReasonId = null;

        store.clearEligibleStations();

        // Menu state should remain unchanged (already closed)
        expect(store.menuOpen).toBe(false);
        expect(store.eligibleStationsMap).toStrictEqual({});
      });
    });

    describe('submitAnalysis', () => {
      beforeEach(() => {
        store.eligibleStationsMap = {
          5: {
            stopReasonId: 5, stopReasonName: 'Jamup',
            stations: [{ id: 1, name: 'Station A', noteCount: 100 }],
          },
        };
        store.selectedStopReasonId = 5;
        store.selectedStationId = 1;
        store.menuOpen = true;
      });

      it('derives stationId and stopReasonId from state and sends to API', async () => {
        vi.mocked(aiInsightsApi.analyzeNotes).mockResolvedValue({ status: 'accepted', message: 'ok', requestId: 'req-1' });

        await store.submitAnalysis({
          startDate: '2024-01-01', endDate: '2024-12-31',
        });

        expect(aiInsightsApi.analyzeNotes).toHaveBeenCalledWith({
          stationId: 1, stopReasonId: 5, startDate: '2024-01-01', endDate: '2024-12-31',
        });
      });

      it('closes menu and opens email confirmation on success', async () => {
        vi.mocked(aiInsightsApi.analyzeNotes).mockResolvedValue({ status: 'accepted', message: 'ok', requestId: 'req-1' });

        const result = await store.submitAnalysis({
          startDate: '2024-01-01', endDate: '2024-12-31',
        });

        expect(result).toBe(true);
        expect(store.lastRequestId).toBe('req-1');
        expect(store.menuOpen).toBe(false);
        expect(store.emailConfirmationOpen).toBe(true);
      });

      it('resets analyzing to false after success', async () => {
        vi.mocked(aiInsightsApi.analyzeNotes).mockResolvedValue({ status: 'accepted', message: 'ok', requestId: 'req-1' });

        await store.submitAnalysis({
          startDate: '2024-01-01', endDate: '2024-12-31',
        });

        expect(store.analyzing).toBe(false);
      });

      it('shows snackbar error on failure via handleAiInsightsError', async () => {
        const notificationStore = useGenericNotificationStore();
        const openNotification = vi.spyOn(notificationStore, 'openNotification');
        vi.mocked(aiInsightsApi.analyzeNotes).mockRejectedValue({
          response: { data: { status: 'error', errorCode: 'QUEUE_FULL', message: 'Too many' } },
        });

        const result = await store.submitAnalysis({
          startDate: '2024-01-01', endDate: '2024-12-31',
        });
        await flushPromises();

        expect(result).toBe(false);
        expect(openNotification).toHaveBeenCalledWith(
          expect.objectContaining({ type: 'error' }),
        );
      });

      it('resets analyzing to false after failure', async () => {
        vi.mocked(aiInsightsApi.analyzeNotes).mockRejectedValue({
          response: { data: { status: 'error', errorCode: 'QUEUE_FULL', message: 'Too many' } },
        });

        await store.submitAnalysis({
          startDate: '2024-01-01', endDate: '2024-12-31',
        });

        expect(store.analyzing).toBe(false);
      });

      it('returns false when no station selected', async () => {
        store.selectedStopReasonId = null;
        store.selectedStationId = null;

        const result = await store.submitAnalysis({
          startDate: '2024-01-01', endDate: '2024-12-31',
        });

        expect(result).toBe(false);
        expect(aiInsightsApi.analyzeNotes).not.toHaveBeenCalled();
      });

      it('returns false when only selectedStopReasonId is null', async () => {
        store.selectedStopReasonId = null;
        store.selectedStationId = 1;

        const result = await store.submitAnalysis({
          startDate: '2024-01-01', endDate: '2024-12-31',
        });

        expect(result).toBe(false);
        expect(aiInsightsApi.analyzeNotes).not.toHaveBeenCalled();
      });

      it('returns false when only selectedStationId is null', async () => {
        store.selectedStopReasonId = 5;
        store.selectedStationId = null;

        const result = await store.submitAnalysis({
          startDate: '2024-01-01', endDate: '2024-12-31',
        });

        expect(result).toBe(false);
        expect(aiInsightsApi.analyzeNotes).not.toHaveBeenCalled();
      });

      it('returns false when startDate is invalid', async () => {
        const result = await store.submitAnalysis({
          startDate: 'bad-date', endDate: '2024-12-31',
        });

        expect(result).toBe(false);
        expect(aiInsightsApi.analyzeNotes).not.toHaveBeenCalled();
      });

      it('returns false when endDate is invalid', async () => {
        const result = await store.submitAnalysis({
          startDate: '2024-01-01', endDate: 'bad-date',
        });

        expect(result).toBe(false);
        expect(aiInsightsApi.analyzeNotes).not.toHaveBeenCalled();
      });

      it('passes filters and inverseFilter to analyzeNotes API', async () => {
        vi.mocked(aiInsightsApi.analyzeNotes).mockResolvedValue({ status: 'accepted', message: 'ok', requestId: 'req-1' });

        await store.submitAnalysis({
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          filters: { productId: [10], operatorId: [20] },
          inverseFilter: ['operatorId'],
        });

        expect(aiInsightsApi.analyzeNotes).toHaveBeenCalledWith(
          expect.objectContaining({
            filters: { productId: [10], operatorId: [20] },
            inverseFilter: ['operatorId'],
          }),
        );
      });

      it('strips commentId from filters before sending to API', async () => {
        vi.mocked(aiInsightsApi.analyzeNotes).mockResolvedValue({ status: 'accepted', message: 'ok', requestId: 'req-1' });

        await store.submitAnalysis({
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          filters: { productId: [10], commentId: [5] },
        });

        const callArgs = vi.mocked(aiInsightsApi.analyzeNotes).mock.calls[0]?.[0];
        expect(callArgs?.filters).toEqual({ productId: [10] });
        expect(callArgs?.filters).not.toHaveProperty('commentId');
      });

      it('strips stationId from filters before sending to API', async () => {
        vi.mocked(aiInsightsApi.analyzeNotes).mockResolvedValue({ status: 'accepted', message: 'ok', requestId: 'req-1' });

        await store.submitAnalysis({
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          filters: { productId: [10], stationId: [1, 2] },
        });

        const callArgs = vi.mocked(aiInsightsApi.analyzeNotes).mock.calls[0]?.[0];
        expect(callArgs?.filters).toEqual({ productId: [10] });
        expect(callArgs?.filters).not.toHaveProperty('stationId');
      });

      it('omits filters from payload when filters object is empty after stripping', async () => {
        vi.mocked(aiInsightsApi.analyzeNotes).mockResolvedValue({ status: 'accepted', message: 'ok', requestId: 'req-1' });

        await store.submitAnalysis({
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          filters: { commentId: [5], stationId: [1] },
        });

        const callArgs = vi.mocked(aiInsightsApi.analyzeNotes).mock.calls[0]?.[0];
        expect(callArgs).toBeDefined();
        expect(callArgs).not.toHaveProperty('filters');
      });

      it('omits inverseFilter from payload when array is empty', async () => {
        vi.mocked(aiInsightsApi.analyzeNotes).mockResolvedValue({ status: 'accepted', message: 'ok', requestId: 'req-1' });

        await store.submitAnalysis({
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          inverseFilter: [],
        });

        const callArgs = vi.mocked(aiInsightsApi.analyzeNotes).mock.calls[0]?.[0];
        expect(callArgs).toBeDefined();
        expect(callArgs).not.toHaveProperty('inverseFilter');
      });

      it('strips commentId and stationId from inverseFilter', async () => {
        vi.mocked(aiInsightsApi.analyzeNotes).mockResolvedValue({ status: 'accepted', message: 'ok', requestId: 'req-1' });

        await store.submitAnalysis({
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          filters: { factoryId: [1], commentId: [5], stationId: [1] },
          inverseFilter: ['factoryId', 'commentId', 'stationId'],
        });

        const callArgs = vi.mocked(aiInsightsApi.analyzeNotes).mock.calls[0]?.[0];
        expect(callArgs?.filters).not.toHaveProperty('commentId');
        expect(callArgs?.filters).not.toHaveProperty('stationId');
        expect(callArgs?.inverseFilter).toStrictEqual(['factoryId']);
      });

      it('omits inverseFilter when all keys are sanitized out', async () => {
        vi.mocked(aiInsightsApi.analyzeNotes).mockResolvedValue({ status: 'accepted', message: 'ok', requestId: 'req-1' });

        await store.submitAnalysis({
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          filters: { factoryId: [1] },
          inverseFilter: ['commentId', 'stationId'],
        });

        const callArgs = vi.mocked(aiInsightsApi.analyzeNotes).mock.calls[0]?.[0];
        expect(callArgs).not.toHaveProperty('inverseFilter');
      });

      it('works without filters (backward compatible)', async () => {
        vi.mocked(aiInsightsApi.analyzeNotes).mockResolvedValue({ status: 'accepted', message: 'ok', requestId: 'req-1' });

        await store.submitAnalysis({
          startDate: '2024-01-01',
          endDate: '2024-12-31',
        });

        expect(aiInsightsApi.analyzeNotes).toHaveBeenCalledWith({
          stationId: 1,
          stopReasonId: 5,
          startDate: '2024-01-01',
          endDate: '2024-12-31',
        });
      });
    });

    describe('menu management', () => {
      it('openMenu sets stopReasonId and clears previous selection', () => {
        store.selectedStationId = 99;
        store.openMenu(5);

        expect(store.menuOpen).toBe(true);
        expect(store.selectedStopReasonId).toBe(5);
        expect(store.selectedStationId).toBeNull();
      });

      it('closeMenu clears all menu state', () => {
        store.menuOpen = true;
        store.selectedStopReasonId = 5;
        store.selectedStationId = 1;

        store.closeMenu();

        expect(store.menuOpen).toBe(false);
        expect(store.selectedStopReasonId).toBeNull();
        expect(store.selectedStationId).toBeNull();
      });

      it('selectStation sets the station id', () => {
        store.selectStation(42);

        expect(store.selectedStationId).toBe(42);
      });

      it('closeEmailConfirmation clears email confirmation state', () => {
        store.emailConfirmationOpen = true;

        store.closeEmailConfirmation();

        expect(store.emailConfirmationOpen).toBe(false);
      });
    });
  });

  describe('transformToEligibleStationsMap', () => {
    const makeRow = (overrides = {}) => ({
      station: ['Station A'],
      stationId: [1],
      comment: ['Stop reason 1'],
      commentId: [10],
      commentgroup: ['Group 1'],
      commentgroupId: [100],
      notescount: 60,
      ...overrides,
    });

    it('unwraps array-wrapped dimension fields', () => {
      const result = transformToEligibleStationsMap([makeRow()]);

      const entry = result['10'];
      expect(entry).toBeDefined();
      expect(entry?.stopReasonId).toBe(10);
      expect(entry?.stopReasonName).toBe('Stop reason 1');
      expect(entry?.stations).toStrictEqual([
        { id: 1, name: 'Station A', noteCount: 60 },
      ]);
    });

    it('filters out rows below MIN_NOTES_FOR_ELIGIBILITY', () => {
      const rows = [
        makeRow({ notescount: 49 }),
        makeRow({ stationId: [2], station: ['Station B'], notescount: 50 }),
      ];

      const result = transformToEligibleStationsMap(rows);

      expect(result['10']?.stations).toHaveLength(1);
      expect(result['10']?.stations[0]?.name).toBe('Station B');
    });

    it('skips rows with undefined commentId or stationId', () => {
      const rows = [
        makeRow({ commentId: [] }),
        makeRow({ stationId: [] }),
        makeRow({ station: [] }),
      ];

      const result = transformToEligibleStationsMap(rows);

      expect(Object.keys(result)).toHaveLength(0);
    });

    it('groups multiple stations under the same stop reason', () => {
      const rows = [
        makeRow({ stationId: [1], station: ['Station A'] }),
        makeRow({ stationId: [2], station: ['Station B'], notescount: 80 }),
        makeRow({ stationId: [3], station: ['Station C'], commentId: [20], comment: ['Other reason'] }),
      ];

      const result = transformToEligibleStationsMap(rows);

      expect(result['10']?.stations).toHaveLength(2);
      expect(result['10']?.stations.map((s) => s.id)).toStrictEqual([1, 2]);
      expect(result['20']?.stations).toHaveLength(1);
      expect(result['20']?.stations[0]?.id).toBe(3);
    });

    it('sorts stations alphabetically by name', () => {
      const rows = [
        makeRow({ stationId: [3], station: ['Zulu Station'], notescount: 70 }),
        makeRow({ stationId: [1], station: ['Alpha Station'], notescount: 90 }),
        makeRow({ stationId: [2], station: ['Mike Station'], notescount: 55 }),
      ];

      const result = transformToEligibleStationsMap(rows);

      expect(result['10']?.stations.map((s) => s.name)).toStrictEqual([
        'Alpha Station', 'Mike Station', 'Zulu Station',
      ]);
    });

    it('returns empty map for empty input', () => {
      const result = transformToEligibleStationsMap([]);

      expect(result).toStrictEqual({});
    });

    it('handles missing comment field gracefully', () => {
      const result = transformToEligibleStationsMap([makeRow({ comment: [] })]);

      const entry = result['10'];
      expect(entry).toBeDefined();
      expect(entry?.stopReasonName).toBeNull();
      expect(entry?.stations).toHaveLength(1);
    });
  });
});
