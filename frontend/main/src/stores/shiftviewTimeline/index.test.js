import { setActivePinia, createPinia } from 'pinia';

import useShiftviewTimelineStore from '.';

import useShiftStore from '@/stores/shift';

vi.mock('@/api/routesApi');
vi.mock('@/helpers/incremental/incrementalStateHelper');

vi.mock('@/stores/station', () => ({
  default: vi.fn(() => ({ lineviewStation: { zoneId: 'UTC' } })),
  __esModule: true,
}));

vi.mock('@/stores/shift', () => ({
  default: vi.fn(() => ({
    statistics: {},
    $state: {},
    shift: { version: 1 },
  })),
  __esModule: true,
}));

vi.mock('@/stores/comment', () => ({
  default: vi.fn(() => ({ commentsRealMap: new Map() })),
  __esModule: true,
}));

vi.mock('@/stores/userPreferences', () => ({
  default: vi.fn(() => ({ viewSettings: { usePrimaryUnit: true } })),
  __esModule: true,
}));

describe('useShiftviewTimelineStore', () => {
  let store;

  beforeEach(() => {
    vi.clearAllMocks();
    setActivePinia(createPinia());
    store = useShiftviewTimelineStore();
  });

  describe('initial state', () => {
    test('has correct default values', () => {
      expect(store.timeline).toEqual([]);
      expect(store.teamTimeline).toEqual([]);
      expect(store.operatorTimeline).toEqual([]);
      expect(store.performanceLossTimeline).toEqual([]);
      expect(store.batches).toEqual(new Map());
      expect(store.yellowSlices).toEqual([]);
      expect(store.batchTargetFlags).toEqual([]);
      expect(store.batchQtyBeforeShift).toEqual({ producedQty: 0, scrapQty: 0 });
      expect(store.currentRoute).toBeNull();
    });
  });

  describe('actions', () => {
    test('setTimelineState with all data', () => {
      store.setTimelineState({
        batches: [{ id: 2 }, { id: 1 }],
        teamTimeline: [{ id: 1 }],
        performanceLossTimeline: [{ id: 1 }],
        timeline: [{ id: 1 }],
      });
      expect(store.batches).toBeInstanceOf(Map);
      expect(store.teamTimeline).toEqual([{ id: 1 }]);
      expect(store.performanceLossTimeline).toEqual([{ id: 1 }]);
      expect(store.timeline).toEqual([{ id: 1 }]);
    });

    test('setTimelineState with partial data', () => {
      store.timeline = [{ id: 'old' }];
      store.setTimelineState({ batches: [{ id: 1 }] });
      expect(store.timeline).toEqual([{ id: 'old' }]);
      expect(store.batches.has(1)).toBe(true);
    });

    test('setBatchQtyBeforeShift with null', () => {
      store.setBatchQtyBeforeShift(null);
      expect(store.batchQtyBeforeShift).toEqual({ producedQty: 0, scrapQty: 0 });
    });

    test('setBatchQtyBeforeShift with value', () => {
      store.setBatchQtyBeforeShift({ producedQty: 10, scrapQty: 2 });
      expect(store.batchQtyBeforeShift).toEqual({ producedQty: 10, scrapQty: 2 });
    });
  });

  describe('getters', () => {
    test('currentBatch returns first batch or empty object', () => {
      expect(store.currentBatch).toEqual({});
      store.batches = new Map([[1, { id: 1, name: 'Batch 1' }]]);
      expect(store.currentBatch).toEqual({ id: 1, name: 'Batch 1' });
    });

    test('slicesByType categorizes timeline slices', () => {
      store.timeline = [
        { type: 'PRODUCT', isProductChange: false },
        { type: 'PRODUCT', isProductChange: true },
        { type: 'STOPPAGE', commentId: 0 },
        { type: 'STOPPAGE', commentId: 5 },
        { type: 'STANDBY', includeInOee: true },
        { type: 'STANDBY', includeInOee: false },
      ];
      const result = store.slicesByType;
      expect(result.products).toHaveLength(2);
      expect(result.uncommented).toHaveLength(1);
      expect(result.commented).toHaveLength(1);
      expect(result.planned).toHaveLength(2);
      expect(result.plannedInclInOee).toHaveLength(1);
      expect(result.plannedExclInOee).toHaveLength(1);
      expect(result.productChanges).toHaveLength(1);
    });

    test('speedlossSlices', () => {
      store.timeline = [
        {
          type: 'PRODUCT',
          duration: 600,
          sliceStartTmISO: '2020-12-12T11:00:00.000Z',
          sliceEndTmISO: '2020-12-12T11:10:00.000Z',
          yellowEnd: '2020-12-12T11:08:20.000Z',
        },
        {
          type: 'PRODUCT',
          duration: 60,
          sliceStartTmISO: '2020-12-12T11:30:00.000Z',
          sliceEndTmISO: '2020-12-12T11:31:00.000Z',
        },
      ];
      store.performanceLossTimeline = [
        {
          startTimeISO: '2020-12-12T11:00:00.000Z',
          endTimeISO: '2020-12-12T11:34:00.000Z',
          commentId: 0,
          positionId: 0,
          notes: '',
        },
      ];
      const result = store.speedlossSlices;
      expect(result).toHaveLength(1);
      expect(result[0].yellowDuration).toBe(500);
      expect(result[0].perfLossCommentId).toBe(0);
    });

    test('yellowRanges groups speedloss slices', () => {
      store.timeline = [
        {
          batchId: 1,
          sliceStartTmISO: '2020-12-12T11:00:00.000Z',
          sliceEndTmISO: '2020-12-12T11:10:00.000Z',
          yellowEnd: '2020-12-12T11:08:20.000Z',
        },
        {
          batchId: 1,
          sliceStartTmISO: '2020-12-12T11:10:00.000Z',
          sliceEndTmISO: '2020-12-12T11:20:00.000Z',
          yellowEnd: '2020-12-12T11:18:20.000Z',
        },
      ];
      store.performanceLossTimeline = [
        {
          startTimeISO: '2020-12-12T11:00:00.000Z',
          endTimeISO: '2020-12-12T11:34:00.000Z',
          commentId: 0,
          positionId: 0,
          notes: '',
        },
      ];
      const result = store.yellowRanges;
      expect(result).toHaveLength(1);
      expect(result[0].yellowSlices).toHaveLength(2);
    });

    test('yellowRanges without any speedloss slices', () => {
      store.timeline = [];
      store.performanceLossTimeline = [];
      expect(store.yellowRanges).toEqual([]);
    });

    test('hourYellowSlices', () => {
      expect(store.hourYellowSlices).toEqual(new Map());
      store.yellowSlices = [
        { hourStart: '2023-31-08T12:00:00.000Z', id: 1 },
        { hourStart: '2023-31-08T13:00:00.000Z', id: 2 },
      ];
      expect(store.hourYellowSlices).toEqual(new Map([
        ['2023-31-08T12:00:00.000Z', [{ hourStart: '2023-31-08T12:00:00.000Z', id: 1 }]],
        ['2023-31-08T13:00:00.000Z', [{ hourStart: '2023-31-08T13:00:00.000Z', id: 2 }]],
      ]));
    });

    test('getShiftDisplayValue when main unit is used', () => {
      useShiftStore.mockReturnValue({
        statistics: {
          shiftTotal: {
            quantity: 1342, scrapQty: 22, quantityAlt: 13.42, scrapAltQty: 0.22,
          },
        },
      });
      expect(store.getShiftDisplayValue('quantity', 'quantityAlt')).toBe(1342);
      expect(store.getShiftDisplayValue('scrapQty', 'scrapAltQty')).toBe(22);
    });
  });
});
