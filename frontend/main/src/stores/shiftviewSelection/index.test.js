import { setActivePinia, createPinia } from 'pinia';

import useShiftviewSelectionStore from '.';

const {
  profileMock,
  stationMock,
  timelineMock,
  notificationMock,
} = vi.hoisted(() => ({
  profileMock: { isReadOnly: false },
  stationMock: { lineviewStation: { zoneId: 'UTC' } },
  timelineMock: {
    timeline: [],
    batches: new Map(),
    slicesByType: { products: [], commented: [], planned: [] },
    speedlossSlices: [],
    yellowRanges: [],
  },
  notificationMock: { notifyError: vi.fn() },
}));

vi.mock('@/services/i18n', () => ({
  default: { global: { t: (key) => key } },
  __esModule: true,
}));

vi.mock('@/stores/profile', () => ({ default: vi.fn(() => profileMock), __esModule: true }));
vi.mock('@/stores/station', () => ({ default: vi.fn(() => stationMock), __esModule: true }));
vi.mock('@/stores/shiftviewTimeline', () => ({ default: vi.fn(() => timelineMock), __esModule: true }));
vi.mock('@/stores/genericNotification', () => ({ default: vi.fn(() => notificationMock), __esModule: true }));

describe('useShiftviewSelectionStore', () => {
  let store;

  beforeEach(() => {
    vi.clearAllMocks();
    profileMock.isReadOnly = false;
    stationMock.lineviewStation = { zoneId: 'UTC' };
    timelineMock.timeline = [];
    timelineMock.batches = new Map();
    timelineMock.slicesByType = { products: [], commented: [], planned: [] };
    timelineMock.speedlossSlices = [];
    timelineMock.yellowRanges = [];
    setActivePinia(createPinia());
    store = useShiftviewSelectionStore();
  });

  describe('initial state', () => {
    test('has correct default values', () => {
      expect(store.shiftviewSelectionType).toBeNull();
      expect(store.bracketRange).toEqual({});
      expect(store.hasSelectedEndChanged).toBe(false);
      expect(store.clickSelectedSlices).toEqual({});
      expect(store.selectedPinItems).toEqual([]);
    });
  });

  describe('clearSliceSelection', () => {
    test('resets all selection fields', () => {
      store.shiftviewSelectionType = 'testtype';
      store.bracketRange = { selectedRange: ['start', 'end'] };
      store.hasSelectedEndChanged = true;
      store.clickSelectedSlices = { 1: { id: 1 } };
      store.clearSliceSelection();
      expect(store.shiftviewSelectionType).toBeNull();
      expect(store.bracketRange).toEqual({});
      expect(store.hasSelectedEndChanged).toBe(false);
      expect(store.clickSelectedSlices).toEqual({});
    });
  });

  describe('setBracketRange', () => {
    test('coerces STANDBY type to STOPPAGE', () => {
      const range = {
        selectedRange: ['2020-12-12T12:13:12.000Z', '2020-12-12T13:14:15.000Z'],
        type: 'STANDBY',
      };
      store.setBracketRange(range);
      expect(store.shiftviewSelectionType).toBe('STOPPAGE');
      expect(store.bracketRange).toEqual(range);
    });

    test('preserves STOPPAGE type', () => {
      store.setBracketRange({ type: 'STOPPAGE' });
      expect(store.shiftviewSelectionType).toBe('STOPPAGE');
    });

    test('preserves PRODUCT type', () => {
      store.setBracketRange({ type: 'PRODUCT' });
      expect(store.shiftviewSelectionType).toBe('PRODUCT');
    });

    test('sets hasSelectedEndChanged when end time changes', () => {
      store.setBracketRange({
        type: 'STOPPAGE',
        selectedRange: ['2020-12-12T12:13:12.000+00:00', '2020-12-12T13:14:15.000+00:00'],
      });
      store.setBracketRange({
        type: 'STOPPAGE',
        selectedRange: ['2020-12-12T12:13:12.000+00:00', '2020-12-12T13:13:00.000+00:00'],
      });
      expect(store.hasSelectedEndChanged).toBe(true);
    });

    test('leaves hasSelectedEndChanged false when end unchanged', () => {
      store.setBracketRange({
        type: 'STOPPAGE',
        selectedRange: ['2020-12-12T12:13:12.000+00:00', '2020-12-12T13:14:15.000+00:00'],
      });
      store.setBracketRange({
        type: 'STOPPAGE',
        selectedRange: ['2020-12-12T12:00:00.000+00:00', '2020-12-12T13:14:15.000+00:00'],
      });
      expect(store.hasSelectedEndChanged).toBe(false);
    });
  });

  describe('toggleSlice', () => {
    test('adds and removes slices; clears type when empty', () => {
      store.shiftviewSelectionType = 'STOPPAGE';
      store.toggleSlice({ id: 1 });
      expect(store.clickSelectedSlices).toEqual({ 1: { id: 1 } });
      store.toggleSlice({ id: 2 });
      expect(store.clickSelectedSlices).toEqual({ 1: { id: 1 }, 2: { id: 2 } });
      store.toggleSlice({ id: 1 });
      expect(store.clickSelectedSlices).toEqual({ 2: { id: 2 } });
      store.toggleSlice({ id: 2 });
      expect(store.clickSelectedSlices).toEqual({});
      expect(store.shiftviewSelectionType).toBeNull();
    });
  });

  describe('pin selection', () => {
    test('selectPin sets items and type', () => {
      const pinItems = [{ id: 1 }, { id: 2 }];
      store.selectPin(pinItems);
      expect(store.selectedPinItems).toEqual(pinItems);
      expect(store.shiftviewSelectionType).toBe('pin');
    });

    test('clearPinSelection resets pin state', () => {
      store.selectedPinItems = [{ id: 1 }];
      store.shiftviewSelectionType = 'pin';
      store.clearPinSelection();
      expect(store.selectedPinItems).toEqual([]);
      expect(store.shiftviewSelectionType).toBeNull();
    });
  });

  describe('selectSlice', () => {
    test('returns early for null slice', async () => {
      await store.selectSlice(null);
      expect(store.shiftviewSelectionType).toBeNull();
    });

    test('notifies error when user is read-only', async () => {
      profileMock.isReadOnly = true;
      await store.selectSlice({ id: 1, type: 'PRODUCT' });
      expect(notificationMock.notifyError).toHaveBeenCalledWith('You are in read-only mode');
      expect(store.shiftviewSelectionType).toBeNull();
    });

    test('routes SLOW parent to yellow-range selection', async () => {
      const slice = {
        id: 1,
        type: 'PRODUCT',
        parent: { type: 'SLOW', batchId: 'b1', sliceStartTmISO: '2020-01-01T10:00:00.000Z' },
      };
      timelineMock.speedlossSlices = [
        { batchId: 'b1', sliceStartTmISO: '2020-01-01T10:00:00.000Z', yellowEnd: '2020-01-01T10:05:00.000Z', perfLossTimelineStart: '2020-01-01T10:00:00.000Z' },
      ];
      timelineMock.yellowRanges = [
        {
          batchId: 'b1',
          perfLossTimelineStart: '2020-01-01T10:00:00.000Z',
          yellowSlices: [{ sliceStartTmISO: '2020-01-01T10:00:00.000Z', yellowEnd: '2020-01-01T10:05:00.000Z' }],
        },
      ];
      await store.selectSlice(slice);
      expect(store.shiftviewSelectionType).toBe('SLOW');
    });

    test('routes isYellowRange slices to yellow-range selection', async () => {
      const slice = {
        id: 1,
        type: 'PRODUCT',
        isYellowRange: true,
        yellowSlices: [{ sliceStartTmISO: '2020-01-01T10:00:00.000Z', yellowEnd: '2020-01-01T10:05:00.000Z' }],
      };
      await store.selectSlice(slice);
      expect(store.shiftviewSelectionType).toBe('SLOW');
      expect(store.bracketRange.startTime).toBe('2020-01-01T10:00:00.000Z');
    });

    test('routes PRODUCT slice through selectProductSlice', async () => {
      const slice = {
        id: 1,
        type: 'PRODUCT',
        batchId: 'b1',
        sliceStartTmISO: '2020-01-01T10:00:00.000Z',
        sliceEndTmISO: '2020-01-01T10:05:00.000Z',
        duration: 300,
      };
      timelineMock.batches = new Map([['b1', {
        startTimeISO: '2020-01-01T09:00:00.000Z',
        endTimeISO: '2020-01-01T12:00:00.000Z',
      }]]);
      timelineMock.slicesByType.products = [
        { sliceStartTmISO: '2020-01-01T09:30:00.000Z', sliceEndTmISO: '2020-01-01T10:00:00.000Z' },
        slice,
      ];
      timelineMock.timeline = [slice, { duration: 400, type: 'PRODUCT' }];
      await store.selectSlice(slice);
      expect(store.shiftviewSelectionType).toBe('PRODUCT');
      expect(store.bracketRange.id).toBe(1);
    });

    test('routes non-PRODUCT, non-yellow slice through selectStoppage', async () => {
      const slice = {
        id: 1,
        type: 'STOPPAGE',
        sliceStartTmISO: '2020-01-01T10:00:00.000Z',
        sliceEndTmISO: '2020-01-01T10:05:00.000Z',
      };
      timelineMock.timeline = [slice];
      await store.selectSlice(slice);
      expect(store.shiftviewSelectionType).toBe('STOPPAGE');
    });
  });

  describe('selectProductSlice', () => {
    test('deselects when clicking the already-selected slice', async () => {
      store.bracketRange = { id: 1 };
      await store.selectProductSlice({ id: 1 });
      expect(store.bracketRange).toEqual({});
    });

    test('uses yellowEnd for greenStart when yellowEnd differs from sliceEnd', async () => {
      const slice = {
        id: 1,
        type: 'PRODUCT',
        batchId: 'b1',
        sliceStartTmISO: '2020-01-01T10:00:00.000Z',
        sliceEndTmISO: '2020-01-01T10:05:00.000Z',
        yellowEnd: '2020-01-01T10:03:00.000Z',
        duration: 300,
      };
      timelineMock.batches = new Map([['b1', {
        startTimeISO: '2020-01-01T09:00:00.000Z',
        endTimeISO: '2020-01-01T12:00:00.000Z',
      }]]);
      timelineMock.slicesByType.products = [
        { sliceStartTmISO: '2020-01-01T09:30:00.000Z', sliceEndTmISO: '2020-01-01T10:00:00.000Z' },
        slice,
      ];
      timelineMock.timeline = [slice];
      await store.selectProductSlice(slice);
      expect(store.bracketRange.selectedRange[0]).toBe('2020-01-01T10:03:00.000Z');
    });

    test('uses firstProductSlice when batch started before first product', async () => {
      const slice = {
        id: 1,
        type: 'PRODUCT',
        batchId: 'b1',
        sliceStartTmISO: '2020-01-01T10:00:00.000Z',
        sliceEndTmISO: '2020-01-01T10:05:00.000Z',
        duration: 300,
      };
      timelineMock.batches = new Map([['b1', {
        startTimeISO: '2020-01-01T08:00:00.000Z',
        endTimeISO: '2020-01-01T12:00:00.000Z',
      }]]);
      timelineMock.slicesByType.products = [
        { sliceStartTmISO: '2020-01-01T09:30:00.000Z', sliceEndTmISO: '2020-01-01T10:00:00.000Z' },
        slice,
      ];
      timelineMock.timeline = [slice];
      await store.selectProductSlice(slice);
      expect(store.bracketRange.startTime).toBe('2020-01-01T09:30:00.000Z');
    });

    test('uses lastProductSlice end when batch has no endTimeISO', async () => {
      const slice = {
        id: 1,
        type: 'PRODUCT',
        batchId: 'b1',
        sliceStartTmISO: '2020-01-01T10:00:00.000Z',
        sliceEndTmISO: '2020-01-01T10:05:00.000Z',
        duration: 300,
      };
      timelineMock.batches = new Map([['b1', { startTimeISO: '2020-01-01T09:00:00.000Z', endTimeISO: '' }]]);
      timelineMock.slicesByType.products = [slice];
      timelineMock.timeline = [slice];
      await store.selectProductSlice(slice);
      expect(store.bracketRange.id).toBe(1);
    });

    test('caps greenEnd when next slice is short', async () => {
      const slice = {
        id: 0,
        type: 'PRODUCT',
        batchId: 'b1',
        sliceStartTmISO: '2020-01-01T10:00:00.000Z',
        sliceEndTmISO: '2020-01-01T10:05:00.000Z',
        duration: 300,
      };
      timelineMock.batches = new Map([['b1', {
        startTimeISO: '2020-01-01T09:00:00.000Z',
        endTimeISO: '2020-01-01T12:00:00.000Z',
      }]]);
      timelineMock.slicesByType.products = [slice];
      timelineMock.timeline = [slice, { duration: 5, type: 'STOP' }];
      await store.selectProductSlice(slice);
      expect(store.bracketRange.selectedRange[1]).toBe('2020-01-01T10:05:00.000Z');
    });

    test('adds 10-second buffer to greenStart for long slices without yellowEnd', async () => {
      const slice = {
        id: 1,
        type: 'PRODUCT',
        batchId: 'b1',
        sliceStartTmISO: '2020-01-01T10:00:00.000Z',
        sliceEndTmISO: '2020-01-01T10:05:00.000Z',
        duration: 300,
      };
      timelineMock.batches = new Map([['b1', {
        startTimeISO: '2020-01-01T09:00:00.000Z',
        endTimeISO: '2020-01-01T12:00:00.000Z',
      }]]);
      timelineMock.slicesByType.products = [slice];
      timelineMock.timeline = [slice];
      await store.selectProductSlice(slice);
      expect(store.bracketRange.selectedRange[0]).toContain('10:00:10');
    });
  });

  describe('selectStoppage', () => {
    test('clears existing non-STOPPAGE selection before toggling', async () => {
      store.shiftviewSelectionType = 'PRODUCT';
      const slice = { id: 1, type: 'STOPPAGE', sliceStartTmISO: '2020-01-01T10:00:00.000Z', sliceEndTmISO: '2020-01-01T10:05:00.000Z' };
      timelineMock.timeline = [slice];
      await store.selectStoppage(slice);
      expect(store.shiftviewSelectionType).toBe('STOPPAGE');
    });

    test('clears selection when toggling deselects last slice', async () => {
      store.clickSelectedSlices = { 1: { id: 1 } };
      store.shiftviewSelectionType = 'STOPPAGE';
      store.bracketRange = { type: 'STOPPAGE' };
      timelineMock.timeline = [{ id: 1, type: 'STOP' }];
      await store.selectStoppage({ id: 1, type: 'STOP' });
      expect(store.bracketRange).toEqual({});
    });

    test('groups commented slices by joinId', async () => {
      timelineMock.slicesByType.commented = [
        { id: 1, joinId: 'j1', type: 'STOP', sliceStartTmISO: '2020-01-01T10:00:00.000Z', sliceEndTmISO: '2020-01-01T10:01:00.000Z' },
        { id: 2, joinId: 'j1', type: 'STOP', sliceStartTmISO: '2020-01-01T10:01:00.000Z', sliceEndTmISO: '2020-01-01T10:02:00.000Z' },
      ];
      timelineMock.timeline = timelineMock.slicesByType.commented;
      await store.selectStoppage({ id: 1, type: 'STOP', joinId: 'j1' });
      expect(Object.keys(store.clickSelectedSlices)).toHaveLength(2);
      expect(store.bracketRange.type).toBe('STOPPAGE');
    });

    test('groups STANDBY-planned slices by joinId', async () => {
      timelineMock.slicesByType.planned = [
        { id: 3, joinId: 'jp', type: 'STANDBY', sliceStartTmISO: '2020-01-01T10:00:00.000Z', sliceEndTmISO: '2020-01-01T10:01:00.000Z' },
      ];
      timelineMock.timeline = timelineMock.slicesByType.planned;
      await store.selectStoppage({ id: 3, type: 'STANDBY', joinId: 'jp' });
      expect(store.clickSelectedSlices[3]).toBeDefined();
    });

    test('sets single-slice bracketRange with full timeline bounds', async () => {
      const product = { id: 0, type: 'PRODUCT', sliceStartTmISO: '2020-01-01T09:00:00.000Z', sliceEndTmISO: '2020-01-01T09:30:00.000Z' };
      const stop = { id: 1, type: 'STOP', sliceStartTmISO: '2020-01-01T09:30:00.000Z', sliceEndTmISO: '2020-01-01T09:35:00.000Z' };
      const stop2 = { id: 2, type: 'STOP', sliceStartTmISO: '2020-01-01T09:35:00.000Z', sliceEndTmISO: '2020-01-01T09:40:00.000Z' };
      timelineMock.timeline = [product, stop, stop2];
      await store.selectStoppage(stop);
      expect(store.bracketRange.id).toBe(1);
      expect(store.bracketRange.startTime).toBe('2020-01-01T09:30:00.000Z');
      expect(store.bracketRange.endTime).toBe('2020-01-01T09:40:00.000Z');
    });

    test('bypasses joinId grouping when slice is a pin', async () => {
      const slice = { id: 1, type: 'STOPPAGE', joinId: 'j1', isPin: true, sliceStartTmISO: '2020-01-01T10:00:00.000Z', sliceEndTmISO: '2020-01-01T10:01:00.000Z' };
      timelineMock.timeline = [slice];
      await store.selectStoppage(slice);
      expect(store.clickSelectedSlices[1]).toEqual(slice);
    });
  });

  describe('selectYellowRange', () => {
    test('yellow range on an isYellowRange slice uses its yellowSlices', async () => {
      const slice = {
        isYellowRange: true,
        yellowSlices: [
          { sliceStartTmISO: '2020-01-01T10:00:00.000Z', yellowEnd: '2020-01-01T10:02:00.000Z' },
          { sliceStartTmISO: '2020-01-01T10:02:00.000Z', yellowEnd: '2020-01-01T10:05:00.000Z' },
        ],
      };
      await store.selectYellowRange(slice);
      expect(store.bracketRange.startTime).toBe('2020-01-01T10:00:00.000Z');
      expect(store.bracketRange.endTime).toBe('2020-01-01T10:05:00.000Z');
    });

    test('yellow range via parent uses speedlossSlices and yellowRanges', async () => {
      const slice = {
        parent: {
          batchId: 'b1',
          sliceStartTmISO: '2020-01-01T10:00:00.000Z',
        },
      };
      const speedloss = {
        batchId: 'b1',
        sliceStartTmISO: '2020-01-01T10:00:00.000Z',
        yellowEnd: '2020-01-01T10:05:00.000Z',
        perfLossTimelineStart: '2020-01-01T10:00:00.000Z',
      };
      timelineMock.speedlossSlices = [speedloss];
      timelineMock.yellowRanges = [
        {
          batchId: 'b1',
          perfLossTimelineStart: '2020-01-01T10:00:00.000Z',
          yellowSlices: [{ sliceStartTmISO: '2020-01-01T10:00:00.000Z', yellowEnd: '2020-01-01T10:05:00.000Z' }],
        },
      ];
      await store.selectYellowRange(slice);
      expect(store.shiftviewSelectionType).toBe('SLOW');
    });
  });

  describe('selectSliceOnLeft / selectSliceOnRight', () => {
    test('selectSliceOnLeft picks previous slice from timeline', async () => {
      const a = { id: 0, type: 'STOPPAGE', sliceStartTmISO: '2020-01-01T10:00:00.000Z', sliceEndTmISO: '2020-01-01T10:01:00.000Z' };
      const b = { id: 1, type: 'STOPPAGE', sliceStartTmISO: '2020-01-01T10:01:00.000Z', sliceEndTmISO: '2020-01-01T10:02:00.000Z' };
      timelineMock.timeline = [a, b];
      store.clickSelectedSlices = { 1: b };
      store.bracketRange = {
        selectedRange: ['2020-01-01T10:01:00.000Z', '2020-01-01T10:02:00.000Z'],
      };
      store.shiftviewSelectionType = 'STOPPAGE';
      await store.selectSliceOnLeft();
      expect(store.shiftviewSelectionType).toBe('STOPPAGE');
    });

    test('selectSliceOnRight picks next slice from timeline', async () => {
      const a = { id: 0, type: 'STOPPAGE', sliceStartTmISO: '2020-01-01T10:00:00.000Z', sliceEndTmISO: '2020-01-01T10:01:00.000Z' };
      const b = { id: 1, type: 'STOPPAGE', sliceStartTmISO: '2020-01-01T10:01:00.000Z', sliceEndTmISO: '2020-01-01T10:02:00.000Z' };
      timelineMock.timeline = [a, b];
      store.clickSelectedSlices = { 0: a };
      store.bracketRange = {
        selectedRange: ['2020-01-01T10:00:00.000Z', '2020-01-01T10:01:00.000Z'],
      };
      store.shiftviewSelectionType = 'STOPPAGE';
      await store.selectSliceOnRight();
      expect(store.shiftviewSelectionType).toBe('STOPPAGE');
    });
  });

  describe('getters', () => {
    test('isSelectionActive', () => {
      expect(store.isSelectionActive).toBe(false);
      store.shiftviewSelectionType = 'PRODUCT';
      expect(store.isSelectionActive).toBe(true);
    });

    test('firstSelectedSlice returns empty object when no selection', () => {
      expect(store.firstSelectedSlice).toEqual({});
    });

    test('firstSelectedSlice returns first of click-selected slices', () => {
      store.clickSelectedSlices = {
        1: { id: 1, sliceStartTmISO: '2020-01-01T10:00:00.000Z' },
      };
      expect(store.firstSelectedSlice.id).toBe(1);
    });

    test('bracketSelectedSlices returns [] when no range', () => {
      expect(store.bracketSelectedSlices).toEqual([]);
    });

    test('bracketSelectedSlices filters timeline for STOPPAGE', () => {
      store.shiftviewSelectionType = 'STOPPAGE';
      store.bracketRange = { selectedRange: ['2020-01-01T10:00:00.000Z', '2020-01-01T10:10:00.000Z'] };
      timelineMock.timeline = [
        { id: 0, type: 'STOP', sliceStartTmISO: '2020-01-01T10:00:00.000Z', sliceEndTmISO: '2020-01-01T10:02:00.000Z' },
        { id: 1, type: 'PRODUCT', sliceStartTmISO: '2020-01-01T10:02:00.000Z', sliceEndTmISO: '2020-01-01T10:04:00.000Z' },
        { id: 2, type: 'STOP', sliceStartTmISO: '2020-01-01T10:04:00.000Z', sliceEndTmISO: '2020-01-01T10:06:00.000Z' },
      ];
      expect(store.bracketSelectedSlices.map((s) => s.id)).toEqual([0, 2]);
    });

    test('bracketSelectedSlices filters timeline for PRODUCT', () => {
      store.shiftviewSelectionType = 'PRODUCT';
      store.bracketRange = { selectedRange: ['2020-01-01T10:00:00.000Z', '2020-01-01T10:10:00.000Z'] };
      timelineMock.timeline = [
        { id: 0, type: 'PRODUCT', sliceStartTmISO: '2020-01-01T10:00:00.000Z', sliceEndTmISO: '2020-01-01T10:05:00.000Z' },
        { id: 1, type: 'STOP', sliceStartTmISO: '2020-01-01T10:05:00.000Z', sliceEndTmISO: '2020-01-01T10:06:00.000Z' },
      ];
      expect(store.bracketSelectedSlices.map((s) => s.id)).toEqual([0]);
    });

    test('bracketSelectedSlices filters speedlossSlices for SLOW', () => {
      store.shiftviewSelectionType = 'SLOW';
      store.bracketRange = { selectedRange: ['2020-01-01T10:00:00.000Z', '2020-01-01T10:10:00.000Z'] };
      timelineMock.speedlossSlices = [
        { sliceStartTmISO: '2020-01-01T10:01:00.000Z', sliceEndTmISO: '2020-01-01T10:02:00.000Z' },
        { sliceStartTmISO: '2020-01-01T10:11:00.000Z', sliceEndTmISO: '2020-01-01T10:12:00.000Z' },
      ];
      expect(store.bracketSelectedSlices).toHaveLength(1);
    });

    test('canMoveLeft is false for SLOW type', () => {
      store.shiftviewSelectionType = 'SLOW';
      expect(store.canMoveLeft).toBe(false);
    });

    test('canMoveLeft is true for single selected slice with id > 0', () => {
      store.shiftviewSelectionType = 'STOPPAGE';
      store.bracketRange = { selectedRange: ['2020-01-01T10:01:00.000Z', '2020-01-01T10:02:00.000Z'] };
      timelineMock.timeline = [
        { id: 1, type: 'STOP', sliceStartTmISO: '2020-01-01T10:01:00.000Z', sliceEndTmISO: '2020-01-01T10:02:00.000Z' },
      ];
      expect(store.canMoveLeft).toBe(true);
    });

    test('canMoveRight is false for SLOW type', () => {
      store.shiftviewSelectionType = 'SLOW';
      expect(store.canMoveRight).toBe(false);
    });

    test('canMoveRight is false at timeline end', () => {
      store.shiftviewSelectionType = 'STOPPAGE';
      store.bracketRange = { selectedRange: ['2020-01-01T10:00:00.000Z', '2020-01-01T10:01:00.000Z'] };
      timelineMock.timeline = [
        { id: 0, type: 'STOP', sliceStartTmISO: '2020-01-01T10:00:00.000Z', sliceEndTmISO: '2020-01-01T10:01:00.000Z' },
      ];
      expect(store.canMoveRight).toBe(false);
    });

    test('canMoveRight requires a valid batchId on the next slice', () => {
      store.shiftviewSelectionType = 'STOPPAGE';
      store.bracketRange = { selectedRange: ['2020-01-01T10:00:00.000Z', '2020-01-01T10:01:00.000Z'] };
      timelineMock.timeline = [
        { id: 0, type: 'STOP', sliceStartTmISO: '2020-01-01T10:00:00.000Z', sliceEndTmISO: '2020-01-01T10:01:00.000Z' },
        { id: 1, type: 'STOP', batchId: 5, sliceStartTmISO: '2020-01-01T10:01:00.000Z', sliceEndTmISO: '2020-01-01T10:02:00.000Z' },
      ];
      expect(store.canMoveRight).toBe(true);
    });

    test('sliceSelection prefers bracketSelectedSlices when available', () => {
      store.shiftviewSelectionType = 'PRODUCT';
      store.bracketRange = { selectedRange: ['2020-01-01T10:00:00.000Z', '2020-01-01T10:10:00.000Z'] };
      timelineMock.timeline = [
        { id: 0, type: 'PRODUCT', sliceStartTmISO: '2020-01-01T10:00:00.000Z', sliceEndTmISO: '2020-01-01T10:05:00.000Z' },
      ];
      expect(store.sliceSelection).toHaveLength(1);
    });

    test('sliceSelection sorts click-selected slices by start time', () => {
      store.clickSelectedSlices = {
        2: { id: 2, sliceStartTmISO: '2020-12-12T12:00:00.000Z' },
        1: { id: 1, sliceStartTmISO: '2020-12-12T11:00:00.000Z' },
      };
      const result = store.sliceSelection;
      expect(result[0].id).toBe(1);
      expect(result[1].id).toBe(2);
    });
  });
});
