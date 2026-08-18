import { setActivePinia, createPinia } from 'pinia';

import useShiftViewStore from '.';

import timelineApi from '@/api/timelineApi';
import ordersApi from '@/api/ordersApi';
import transformTimelineResponse from '@/services/transformTimelineResponse';
import stateUpdateHelper from '@/helpers/incremental/incrementalStateHelper';

vi.mock('@/api/timelineApi');
vi.mock('@/api/ordersApi');
vi.mock('@/services/transformTimelineResponse');
vi.mock('@/helpers/incremental/incrementalStateHelper');

const {
  slicer,
  featureMock,
  commentMock,
  shiftNotificationMock,
  checklistTaskMock,
  checklistTemplateMock,
  profileMock,
  stationMock,
  factoryMock,
  shiftMock,
  timelineStoreMock,
  shiftviewSelectionMock,
  configurationMock,
  widgetsMock,
  operatorMock,
} = vi.hoisted(() => {
  const slicerObj = {
    startUpdateIntervalTracking: vi.fn(),
    stopUpdateInterval: vi.fn(),
    registerTrackingUpdate: vi.fn(),
    changeShift: vi.fn(),
    timezone: null,
    shift: null,
    batch: null,
    latestState: null,
    secondsFromLastShiftSignal: null,
  };
  const stationObj = {
    lineviewStation: { id: 0, zoneId: 'UTC', timeModeActive: false },
    fetchStations: vi.fn(),
    getDefaultStation: vi.fn((id) => ({ id: id || 1, zoneId: 'UTC', timeModeActive: false })),
    setLineviewStation: vi.fn((s) => {
      stationObj.lineviewStation = s;
    }),
  };
  return {
    slicer: slicerObj,
    featureMock: { productionOrdersEnabled: false },
    commentMock: { commentsRealMap: new Map([['k', 'v']]) },
    shiftNotificationMock: {
      cancelShiftNotificationTimer: vi.fn(),
      resetShiftNotificationTimer: vi.fn(),
    },
    checklistTaskMock: { checklistTasks: [], fetchChecklistTasks: vi.fn() },
    checklistTemplateMock: { shiftviewStationManualTemplates: [], fetchManualChecklistTemplates: vi.fn() },
    profileMock: { initUser: vi.fn() },
    stationMock: stationObj,
    factoryMock: { fetchFactories: vi.fn() },
    shiftMock: {
      shift: { id: 0, version: 1 },
      currentShift: { id: 0 },
      isShiftRunning: false,
      $state: {},
      setShiftState: vi.fn(),
      setStatistics: vi.fn(),
      setShiftVersion: vi.fn(),
      setShift: vi.fn(),
      fetchCurrentShift: vi.fn(),
    },
    timelineStoreMock: {
      timeline: [],
      batchQtyBeforeShift: { producedQty: 0, scrapQty: 0 },
      batchTargetFlags: [],
      setTimelineState: vi.fn(),
      setBatchQtyBeforeShift: vi.fn(),
      setTimelineFakeState: vi.fn(),
    },
    shiftviewSelectionMock: { clearSliceSelection: vi.fn() },
    configurationMock: { fetchConfiguration: vi.fn(), checklistStations: [] },
    widgetsMock: { fetchAndInitializeWidgets: vi.fn() },
    operatorMock: { operatorsRealMap: new Map(), fetchMissingOperators: vi.fn() },
  };
});

vi.mock('@/helpers/incremental/sliceUpdateFaking', () => ({
  default: vi.fn().mockImplementation(() => slicer),
  __esModule: true,
}));

vi.mock('@/stores/feature', () => ({ default: vi.fn(() => featureMock), __esModule: true }));
vi.mock('@/stores/comment', () => ({ default: vi.fn(() => commentMock), __esModule: true }));
vi.mock('@/stores/shiftNotification', () => ({ default: vi.fn(() => shiftNotificationMock), __esModule: true }));
vi.mock('@/stores/checklistTask', () => ({ default: vi.fn(() => checklistTaskMock), __esModule: true }));
vi.mock('@/stores/checklistTemplate', () => ({ default: vi.fn(() => checklistTemplateMock), __esModule: true }));
vi.mock('@/stores/profile', () => ({ default: vi.fn(() => profileMock), __esModule: true }));
vi.mock('@/stores/station', () => ({ default: vi.fn(() => stationMock), __esModule: true }));
vi.mock('@/stores/factory', () => ({ default: vi.fn(() => factoryMock), __esModule: true }));
vi.mock('@/stores/shift', () => ({ default: vi.fn(() => shiftMock), __esModule: true }));
vi.mock('@/stores/shiftviewTimeline', () => ({ default: vi.fn(() => timelineStoreMock), __esModule: true }));
vi.mock('@/stores/shiftviewSelection', () => ({ default: vi.fn(() => shiftviewSelectionMock), __esModule: true }));
vi.mock('@/stores/configuration', () => ({ default: vi.fn(() => configurationMock), __esModule: true }));
vi.mock('@/stores/shiftViewWidgets', () => ({ default: vi.fn(() => widgetsMock), __esModule: true }));
vi.mock('@/stores/operator', () => ({ default: vi.fn(() => operatorMock), __esModule: true }));

const futureISO = () => new Date(Date.now() + (60 * 60 * 1000)).toISOString();
const pastISO = () => new Date(Date.now() - (60 * 60 * 1000)).toISOString();

describe('useShiftViewStore', () => {
  let store;

  beforeEach(() => {
    vi.clearAllMocks();
    stationMock.lineviewStation = { id: 0, zoneId: 'UTC', timeModeActive: false };
    stationMock.getDefaultStation = vi.fn((id) => ({ id: id || 1, zoneId: 'UTC', timeModeActive: false }));
    shiftMock.shift = { id: 0, version: 1 };
    shiftMock.currentShift = { id: 0 };
    featureMock.productionOrdersEnabled = false;
    configurationMock.checklistStations = [];
    operatorMock.operatorsRealMap = new Map();
    transformTimelineResponse.mockReturnValue({
      transformedTimeline: [{ id: 'slice1' }],
      batchTargetFlags: [{ flag: 1 }],
    });
    stateUpdateHelper.mockReturnValue({
      transformedTimeline: [{ id: 'updated' }],
      batchTargetFlags: [{ flag: 2 }],
    });
    setActivePinia(createPinia());
    store = useShiftViewStore();
  });

  describe('initial state', () => {
    test('has correct default values', () => {
      expect(store.shiftHours).toEqual([]);
      expect(store.lastShift).toEqual({});
      expect(store.orders).toEqual([]);
      expect(store.metrics).toEqual([]);
      expect(store.shiftLoadingStack).toEqual([]);
    });
  });

  describe('loading stack', () => {
    test('startShiftLoading / finishShiftLoading push and pop', () => {
      store.startShiftLoading();
      store.startShiftLoading();
      expect(store.shiftLoadingStack).toHaveLength(2);
      store.finishShiftLoading();
      expect(store.shiftLoadingStack).toHaveLength(1);
    });
  });

  describe('getters', () => {
    test('isShiftLoading reflects stack length', () => {
      expect(store.isShiftLoading).toBe(false);
      store.shiftLoadingStack.push(true);
      expect(store.isShiftLoading).toBe(true);
    });
  });

  describe('commitStationChange', () => {
    test('no-op when station id matches existing and is non-empty', async () => {
      stationMock.lineviewStation = { id: 5, zoneId: 'UTC' };
      await store.commitStationChange({ id: 5 });
      expect(stationMock.setLineviewStation).not.toHaveBeenCalled();
      expect(configurationMock.fetchConfiguration).not.toHaveBeenCalled();
      expect(widgetsMock.fetchAndInitializeWidgets).not.toHaveBeenCalled();
    });

    test('initializes station when lineviewStation is empty', async () => {
      stationMock.lineviewStation = {};
      await store.commitStationChange({ id: 3 });
      expect(stationMock.setLineviewStation).toHaveBeenCalledWith({ id: 3 });
      expect(configurationMock.fetchConfiguration).toHaveBeenCalledWith({ stationId: 3 });
      expect(widgetsMock.fetchAndInitializeWidgets).toHaveBeenCalledWith(3);
    });

    test('fetches orders when productionOrdersEnabled', async () => {
      featureMock.productionOrdersEnabled = true;
      ordersApi.getOrders = vi.fn().mockResolvedValue([{ id: 'o1' }]);
      await store.commitStationChange({ id: 7 });
      expect(ordersApi.getOrders).toHaveBeenCalledWith(7);
      expect(store.orders).toEqual([{ id: 'o1' }]);
    });

    test('uses default empty station argument', async () => {
      stationMock.lineviewStation = {};
      await store.commitStationChange();
      expect(stationMock.setLineviewStation).toHaveBeenCalledWith({});
    });
  });

  describe('commitShiftChange', () => {
    const buildTimelineResponse = (overrides = {}) => ({
      shift: { id: 10, endTimeISO: futureISO(), stationId: 1 },
      batches: [{ id: 'b1' }],
      operatorTimeline: [{ operatorId: 1 }, { operatorId: 2 }],
      batchQtyBeforeShift: { producedQty: 10, scrapQty: 1 },
      secondsFromLastShiftSignal: 5,
      ...overrides,
    });

    test('returns early when timelineResponse has no shift', async () => {
      timelineApi.getCurrent = vi.fn().mockResolvedValue({ shift: null });
      await store.commitShiftChange(0, { id: 1, zoneId: 'UTC' });
      expect(shiftMock.setShiftState).toHaveBeenCalled();
      expect(timelineStoreMock.setBatchQtyBeforeShift).not.toHaveBeenCalled();
    });

    test('processes running shift and starts update faking', async () => {
      const tl = buildTimelineResponse();
      timelineApi.getCurrent = vi.fn().mockResolvedValue(tl);
      stationMock.lineviewStation = { id: 1, zoneId: 'UTC', timeModeActive: false };

      await store.commitShiftChange(0, { id: 1, zoneId: 'UTC' });

      expect(timelineStoreMock.setBatchQtyBeforeShift).toHaveBeenCalledWith(tl.batchQtyBeforeShift);
      expect(transformTimelineResponse).toHaveBeenCalled();
      expect(timelineStoreMock.setTimelineState).toHaveBeenCalled();
      expect(slicer.startUpdateIntervalTracking).toHaveBeenCalled();
      expect(operatorMock.fetchMissingOperators).toHaveBeenCalledWith([1, 2]);
      expect(shiftNotificationMock.resetShiftNotificationTimer).toHaveBeenCalled();
    });

    test('stops update faking for ended shift and cancels timer for current shift', async () => {
      const tl = buildTimelineResponse({ shift: { id: 10, endTimeISO: pastISO(), stationId: 1 } });
      shiftMock.currentShift = { id: 10 };
      timelineApi.getCurrent = vi.fn().mockResolvedValue(tl);
      stationMock.lineviewStation = { id: 1, zoneId: 'UTC' };

      await store.commitShiftChange(0, { id: 1, zoneId: 'UTC' });

      expect(slicer.stopUpdateInterval).toHaveBeenCalled();
      expect(shiftNotificationMock.cancelShiftNotificationTimer).toHaveBeenCalled();
    });

    test('skips fetchMissingOperators when all operators known', async () => {
      operatorMock.operatorsRealMap = new Map([[1, {}], [2, {}]]);
      const tl = buildTimelineResponse({ shift: { id: 10, endTimeISO: pastISO(), stationId: 1 } });
      timelineApi.getCurrent = vi.fn().mockResolvedValue(tl);
      stationMock.lineviewStation = { id: 1, zoneId: 'UTC' };

      await store.commitShiftChange(0, { id: 1, zoneId: 'UTC' });

      expect(operatorMock.fetchMissingOperators).not.toHaveBeenCalled();
    });

    test('fetches checklist data when station has checklists', async () => {
      configurationMock.checklistStations = [1];
      const tl = buildTimelineResponse({ shift: { id: 10, endTimeISO: pastISO(), stationId: 1 } });
      timelineApi.getCurrent = vi.fn().mockResolvedValue(tl);
      stationMock.lineviewStation = { id: 1, zoneId: 'UTC' };

      await store.commitShiftChange(0, { id: 1, zoneId: 'UTC' });

      expect(checklistTaskMock.fetchChecklistTasks).toHaveBeenCalled();
      expect(checklistTemplateMock.fetchManualChecklistTemplates).toHaveBeenCalledWith({ stationId: 1 });
    });

    test('resets checklist state when station has no checklists', async () => {
      configurationMock.checklistStations = [];
      const tl = buildTimelineResponse({ shift: { id: 10, endTimeISO: pastISO(), stationId: 1 } });
      timelineApi.getCurrent = vi.fn().mockResolvedValue(tl);
      stationMock.lineviewStation = { id: 1, zoneId: 'UTC' };

      await store.commitShiftChange(0, { id: 1, zoneId: 'UTC' });

      expect(checklistTaskMock.checklistTasks).toEqual([]);
      expect(checklistTemplateMock.shiftviewStationManualTemplates).toEqual([]);
    });

    test('commits station change first when station differs', async () => {
      stationMock.lineviewStation = { id: 2, zoneId: 'UTC' };
      const tl = buildTimelineResponse({ shift: { id: 10, endTimeISO: pastISO(), stationId: 9 } });
      timelineApi.getCurrent = vi.fn().mockResolvedValue(tl);

      await store.commitShiftChange(0, { id: 9, zoneId: 'UTC' });

      expect(stationMock.setLineviewStation).toHaveBeenCalledWith({ id: 9, zoneId: 'UTC' });
    });

    test('uses selectById when shiftId provided; falls back to getCurrent on mismatch', async () => {
      timelineApi.selectById = vi.fn().mockResolvedValue({
        shift: { id: 10, endTimeISO: pastISO(), stationId: 999 },
        batches: [],
        operatorTimeline: [],
      });
      timelineApi.getCurrent = vi.fn().mockResolvedValue({
        shift: { id: 11, endTimeISO: pastISO(), stationId: 1 },
        batches: [],
        operatorTimeline: [],
      });
      stationMock.lineviewStation = { id: 1, zoneId: 'UTC' };

      await store.commitShiftChange(42, { id: 1, zoneId: 'UTC' });

      expect(timelineApi.selectById).toHaveBeenCalledWith(42);
      expect(timelineApi.getCurrent).toHaveBeenCalledWith(1);
    });

    test('uses selectById result when station matches', async () => {
      timelineApi.selectById = vi.fn().mockResolvedValue({
        shift: { id: 10, endTimeISO: pastISO(), stationId: 1 },
        batches: [],
        operatorTimeline: [],
      });
      timelineApi.getCurrent = vi.fn();
      stationMock.lineviewStation = { id: 1, zoneId: 'UTC' };

      await store.commitShiftChange(42, { id: 1, zoneId: 'UTC' });

      expect(timelineApi.getCurrent).not.toHaveBeenCalled();
    });

    test('falls back to getCurrent when selectById throws', async () => {
      timelineApi.selectById = vi.fn().mockRejectedValue(new Error('fail'));
      timelineApi.getCurrent = vi.fn().mockResolvedValue({
        shift: { id: 11, endTimeISO: pastISO(), stationId: 1 },
        batches: [],
        operatorTimeline: [],
      });
      stationMock.lineviewStation = { id: 1, zoneId: 'UTC' };

      await store.commitShiftChange(42, { id: 1, zoneId: 'UTC' });

      expect(timelineApi.getCurrent).toHaveBeenCalledWith(1);
    });

    test('slice update faking callback delegates to shiftUpdateCallback', async () => {
      const tl = buildTimelineResponse();
      timelineApi.getCurrent = vi.fn().mockResolvedValue(tl);
      stationMock.lineviewStation = { id: 1, zoneId: 'UTC' };

      await store.commitShiftChange(0, { id: 1, zoneId: 'UTC' });

      const cb = slicer.startUpdateIntervalTracking.mock.calls[0][0].callback;
      cb([{ id: 'u1' }]);
      expect(timelineStoreMock.setTimelineFakeState).toHaveBeenCalled();
    });

    test('sets slice update faking params from response', async () => {
      const tl = buildTimelineResponse();
      timelineApi.getCurrent = vi.fn().mockResolvedValue(tl);
      stationMock.lineviewStation = { id: 1, zoneId: 'UTC' };

      await store.commitShiftChange(0, { id: 1, zoneId: 'UTC' });

      expect(slicer.timezone).toBe('UTC');
      expect(slicer.shift).toEqual(tl.shift);
      expect(slicer.batch).toEqual(tl.batches[0]);
      expect(slicer.secondsFromLastShiftSignal).toBe(5);
    });
  });

  describe('changeShift', () => {
    test('short-circuits when station and shift unchanged without force', async () => {
      stationMock.lineviewStation = { id: 1, zoneId: 'UTC' };
      shiftMock.shift = { id: 5, version: 1 };
      timelineApi.getCurrent = vi.fn();

      await store.changeShift({ stationId: 1, shiftId: 5 });

      expect(timelineApi.getCurrent).not.toHaveBeenCalled();
      expect(store.shiftLoadingStack).toEqual([]);
    });

    test('proceeds when force is set even for same station/shift', async () => {
      stationMock.lineviewStation = { id: 1, zoneId: 'UTC' };
      shiftMock.shift = { id: 5, version: 1 };
      timelineApi.selectById = vi.fn().mockResolvedValue({
        shift: { id: 5, endTimeISO: pastISO(), stationId: 1 },
        batches: [],
        operatorTimeline: [],
      });

      await store.changeShift({ stationId: 1, shiftId: 5, force: true });

      expect(timelineApi.selectById).toHaveBeenCalled();
      expect(shiftviewSelectionMock.clearSliceSelection).toHaveBeenCalled();
    });

    test('cleans NaN params to 0 and uses default station', async () => {
      stationMock.lineviewStation = { id: 99, zoneId: 'UTC' };
      shiftMock.shift = { id: 99, version: 1 };
      timelineApi.getCurrent = vi.fn().mockResolvedValue({ shift: null });

      await store.changeShift({ stationId: 'abc', shiftId: 'xyz' });

      expect(stationMock.getDefaultStation).toHaveBeenCalledWith();
    });

    test('uses getDefaultStation with id when stationId > 0', async () => {
      timelineApi.selectById = vi.fn().mockResolvedValue({ shift: null });

      await store.changeShift({ stationId: 4, shiftId: 8 });

      expect(stationMock.getDefaultStation).toHaveBeenCalledWith(4);
    });

    test('always decrements loading stack even on error', async () => {
      timelineApi.selectById = vi.fn().mockRejectedValue(new Error('boom'));
      timelineApi.getCurrent = vi.fn().mockRejectedValue(new Error('also boom'));

      await expect(store.changeShift({ stationId: 2, shiftId: 3 })).rejects.toThrow();
      expect(store.shiftLoadingStack).toEqual([]);
    });

    test('handles missing params object fields with defaults', async () => {
      stationMock.lineviewStation = { id: 99, zoneId: 'UTC' };
      shiftMock.shift = { id: 99, version: 1 };
      timelineApi.getCurrent = vi.fn().mockResolvedValue({ shift: null });

      await store.changeShift({});

      expect(stationMock.getDefaultStation).toHaveBeenCalledWith();
    });
  });

  describe('updateTimeline', () => {
    test('delegates to commitShiftChange when shiftVersion is out of sync', async () => {
      shiftMock.shift = { id: 7, version: 5 };
      stationMock.lineviewStation = { id: 1, zoneId: 'UTC' };
      timelineApi.selectById = vi.fn().mockResolvedValue({ shift: null });

      store.updateTimeline({ shiftVersion: 99 });

      expect(timelineApi.selectById).toHaveBeenCalledWith(7);
    });

    test('applies slice updates and commits new statistics/version', async () => {
      shiftMock.shift = { id: 7, version: 5 };
      stationMock.lineviewStation = { id: 1, zoneId: 'UTC' };
      timelineStoreMock.timeline = [{ id: 'old' }];

      await store.updateTimeline({
        shiftVersion: 6,
        sliceUpdates: [{ id: 's1' }],
        batches: [{ id: 'b1' }],
        statistics: { total: 5 },
      });

      expect(stateUpdateHelper).toHaveBeenCalled();
      expect(timelineStoreMock.setTimelineState).toHaveBeenCalled();
      expect(timelineStoreMock.batchTargetFlags).toEqual([{ flag: 2 }]);
      expect(shiftMock.setStatistics).toHaveBeenCalledWith({ total: 5 });
      expect(shiftMock.setShiftVersion).toHaveBeenCalledWith(6);
      expect(slicer.registerTrackingUpdate).toHaveBeenCalled();
    });

    test('skips state update helper when no sliceUpdates', async () => {
      shiftMock.shift = { id: 7, version: 5 };

      await store.updateTimeline({ shiftVersion: 6, statistics: { total: 5 } });

      expect(stateUpdateHelper).not.toHaveBeenCalled();
      expect(shiftMock.setStatistics).toHaveBeenCalledWith({ total: 5 });
    });
  });

  describe('updateShift / stopUpdateFaking / continueUpdateFaking / shiftUpdateCallback', () => {
    test('updateShift delegates to shift store and slicer', () => {
      const shift = { id: 42 };
      store.updateShift(shift);
      expect(shiftMock.setShift).toHaveBeenCalledWith(shift);
      expect(slicer.changeShift).toHaveBeenCalledWith(shift);
    });

    test('stopUpdateFaking stops slicer', () => {
      store.stopUpdateFaking();
      expect(slicer.stopUpdateInterval).toHaveBeenCalled();
    });

    test('continueUpdateFaking starts slicer with callback', () => {
      store.continueUpdateFaking();
      expect(slicer.startUpdateIntervalTracking).toHaveBeenCalled();
      const cb = slicer.startUpdateIntervalTracking.mock.calls[0][0].callback;
      cb([{ id: 'u1' }]);
      expect(timelineStoreMock.setTimelineFakeState).toHaveBeenCalled();
    });

    test('shiftUpdateCallback fires finishedCB to register tracking update', async () => {
      timelineStoreMock.setTimelineFakeState = vi.fn(({ finishedCB }) => finishedCB());

      await store.shiftUpdateCallback([{ id: 'u1' }]);

      expect(slicer.registerTrackingUpdate).toHaveBeenCalled();
    });
  });
});
