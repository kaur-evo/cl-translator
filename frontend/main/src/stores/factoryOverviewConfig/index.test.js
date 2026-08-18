import { setActivePinia, createPinia } from 'pinia';
import { DateTime } from 'luxon';

import useFactoryOverviewConfigStore, { getStationStatus } from './index';

import CustomInterval from '@/helpers/interval/CustomInterval';
import factoryOverviewApi from '@/api/factoryOverviewApi';
import stationApi from '@/api/stationApi';
import factoryOverviewStatuses from '@/constants/factoryOverviewStatuses';
import sliceType from '@/constants/sliceType';

vi.mock('@/api/factoryOverviewApi', () => ({
  default: {
    getTimelineViewState: vi.fn(),
    putTimelineViewState: vi.fn(),
  },
  __esModule: true,
}));

vi.mock('@/api/stationApi', () => ({
  default: {
    getFactoryViewStationTimeline: vi.fn(),
    getFactoryViewStationsOrder: vi.fn(),
    postFactoryViewStationsOrder: vi.fn(),
    getRollingStationTimeline: vi.fn(),
  },
  __esModule: true,
}));

const mockCommentStore = {
  commentsMap: {},
  commentsPromise: Promise.resolve(),
};

const mockStationStore = {
  stations: [],
  stationsMap: {},
  lineviewStation: { zoneId: 'UTC' },
};

vi.mock('@/stores/comment', () => ({
  default: vi.fn(() => mockCommentStore),
  __esModule: true,
}));

vi.mock('@/stores/station', () => ({
  default: vi.fn(() => mockStationStore),
  __esModule: true,
}));

describe('useFactoryOverviewConfigStore', () => {
  let piniaStore;

  beforeEach(() => {
    setActivePinia(createPinia());
    piniaStore = useFactoryOverviewConfigStore();
    vi.clearAllMocks();
  });

  test('default state', () => {
    expect(piniaStore.initialized).toBe(false);
    expect(piniaStore.timelinesInterval).toBe(8);
    expect(piniaStore.timelinesIntervalEndTime).toBeNull();
    expect(piniaStore.timelinesOrdering).toEqual({});
    expect(piniaStore.timelinesFactoryOrdering).toEqual({});
    expect(piniaStore.timelinesStationGroupOrdering).toEqual({});
    expect(piniaStore.timelinesStatColumn).toBe('oee');
    expect(piniaStore.isFactoryOverviewOrderingModified).toBe(false);
    expect(piniaStore.loading).toEqual([]);
    expect(piniaStore.timelines).toEqual({});
    expect(piniaStore.factoryViewOrdering).toEqual([]);
    expect(piniaStore.rollingTimelines).toEqual({});
    expect(piniaStore.rollingTimelinesSocketBuffer).toEqual({});
    expect(piniaStore.socketBufferConsumerTimeout).toBeNull();
    expect(piniaStore.socketBufferConsumerInterval).toBeNull();
    expect(piniaStore.stationSelectionLastModified).toBeNull();
    expect(piniaStore.stationCancelTokenObj).toEqual({});
    expect(piniaStore.loadingStations).toEqual({});
    expect(piniaStore.notificationTimeout).toBeNull();
    expect(piniaStore.notificationVisible).toBe(false);
    expect(piniaStore.notificationCountDown).toBe(0);
    expect(piniaStore.notificationCountDownInterval).toBeNull();
    expect(piniaStore.unitType).toBe('primary');
    expect(piniaStore.statusFilter).toEqual([]);
  });

  describe('helper actions (formerly mutations)', () => {
    test('setFactoryViewOrdering does not add duplicates', () => {
      piniaStore.setFactoryViewOrdering([
        { stationId: 1, ordering: 1 },
        { stationId: 1, ordering: 2 },
        { stationId: 2, ordering: 3 },
      ]);
      expect(piniaStore.factoryViewOrdering.length).toBe(2);
      expect(piniaStore.factoryViewOrdering[0].stationId).toBe(1);
      expect(piniaStore.factoryViewOrdering[1].stationId).toBe(2);
    });

    test('setTimelinesInterval when interval is not defined', () => {
      piniaStore.setTimelinesInterval(null);
      expect(piniaStore.timelinesInterval).toBe(8);
    });

    test('setTimelinesInterval when interval is defined', () => {
      piniaStore.setTimelinesInterval(10);
      expect(piniaStore.timelinesInterval).toBe(10);
    });

    test('setTimelinesIntervalEndTime', () => {
      piniaStore.setTimelinesIntervalEndTime('2021-12-12T06:00:00Z');
      expect(piniaStore.timelinesIntervalEndTime).toBe('2021-12-12T06:00:00Z');
    });

    test('setTimelinesOrdering', () => {
      piniaStore.setTimelinesOrdering({ 1: 2 });
      expect(piniaStore.timelinesOrdering).toEqual({ 1: 2 });
    });

    test('setTimelinesFactoryOrdering', () => {
      piniaStore.setTimelinesFactoryOrdering({ 1: 2 });
      expect(piniaStore.timelinesFactoryOrdering).toEqual({ 1: 2 });
    });

    test('setTimelinesStationGroupOrdering', () => {
      piniaStore.setTimelinesStationGroupOrdering({ 1: 2 });
      expect(piniaStore.timelinesStationGroupOrdering).toEqual({ 1: 2 });
    });

    test('setTimelinesStatColumn when stat column is null', () => {
      piniaStore.setTimelinesStatColumn(null);
      expect(piniaStore.timelinesStatColumn).toBe('oee');
    });

    test('setTimelinesStatColumn when stat column is defined', () => {
      piniaStore.setTimelinesStatColumn('availability');
      expect(piniaStore.timelinesStatColumn).toBe('availability');
    });

    test('startStationLoading', () => {
      piniaStore.startStationLoading(1);
      expect(piniaStore.loadingStations).toEqual({ 1: true });
    });

    test('showNotificationVisible', () => {
      piniaStore.showNotificationVisible();
      expect(piniaStore.notificationVisible).toBe(true);
    });

    test('hideNotification', () => {
      piniaStore.notificationVisible = true;
      piniaStore.hideNotification();
      expect(piniaStore.notificationVisible).toBe(false);
    });

    test('setUnitType when unit type is null', () => {
      piniaStore.setUnitType(null);
      expect(piniaStore.unitType).toBe('primary');
    });

    test('setUnitType when unit type is undefined', () => {
      piniaStore.setUnitType(undefined);
      expect(piniaStore.unitType).toBe('primary');
    });

    test('setUnitType when unit type is defined', () => {
      piniaStore.setUnitType('alternative');
      expect(piniaStore.unitType).toBe('alternative');
    });

    test('setFactoryViewOrderingModified', () => {
      piniaStore.setFactoryViewOrderingModified(true);
      expect(piniaStore.isFactoryOverviewOrderingModified).toBe(true);
    });

    test('startLoading', () => {
      piniaStore.startLoading();
      expect(piniaStore.loading).toEqual(['loading']);
    });

    test('finishLoading', () => {
      piniaStore.loading = ['loading'];
      piniaStore.finishLoading();
      expect(piniaStore.loading).toEqual([]);
    });

    test('setStationSelectionLastModified', () => {
      piniaStore.setStationSelectionLastModified('2021-12-12T06:00:00Z');
      expect(piniaStore.stationSelectionLastModified).toBe('2021-12-12T06:00:00Z');
    });

    test('updateOrderings', () => {
      piniaStore.timelinesOrdering = { 1: 1, 2: 2, 3: 3 };
      piniaStore.updateOrderings([{ id: 3 }, { id: 2 }, { id: 1 }]);
      expect(piniaStore.timelinesOrdering).toEqual({ 3: 1, 2: 2, 1: 3 });
    });

    test('updateStationGroupOrderings', () => {
      piniaStore.timelinesStationGroupOrdering = { 1: 1, 2: 2, 3: 3 };
      piniaStore.updateStationGroupOrderings([{ id: 3 }, { id: 2 }, { id: 1 }]);
      expect(piniaStore.timelinesStationGroupOrdering).toEqual({ 3: 1, 2: 2, 1: 3 });
    });

    test('updateFactoryOrderings', () => {
      piniaStore.timelinesFactoryOrdering = { 1: 1, 2: 2, 3: 3 };
      piniaStore.updateFactoryOrderings([{ id: 3 }, { id: 2 }, { id: 1 }]);
      expect(piniaStore.timelinesFactoryOrdering).toEqual({ 3: 1, 2: 2, 1: 3 });
    });

    test('setFactoryViewOrdering', () => {
      piniaStore.setFactoryViewOrdering([{ stationId: 1, order: 1 }, { stationId: 2, order: 2 }]);
      expect(piniaStore.factoryViewOrdering).toEqual([{ stationId: 1, order: 1 }, { stationId: 2, order: 2 }]);
    });

    test('modifyFactoryViewOrdering', () => {
      piniaStore.factoryViewOrdering = [{ stationId: 1, order: 2 }, { stationId: 2, order: 1 }];
      piniaStore.modifyFactoryViewOrdering([3, 2, 1]);
      expect(piniaStore.factoryViewOrdering).toEqual([{ stationId: 3, order: 0 }, { stationId: 2, order: 1 }, { stationId: 1, order: 2 }]);
    });

    test('setStationTimeline', () => {
      piniaStore.setStationTimeline({ station: 1, data: { id: 1 } });
      expect(piniaStore.timelines).toEqual({ 1: { id: 1 } });
    });

    test('setStationTimelines', () => {
      piniaStore.setStationTimelines([{ 1: { id: 1 }, 2: { id: 2 } }]);
      expect(piniaStore.timelines).toEqual([{ 1: { id: 1 }, 2: { id: 2 } }]);
    });

    test('setInitialized', () => {
      piniaStore.setInitialized();
      expect(piniaStore.initialized).toBe(true);
    });

    test('finishStationLoading', () => {
      piniaStore.loadingStations = { 1: true };
      piniaStore.finishStationLoading(1);
      expect(piniaStore.loadingStations).toEqual({ 1: false });
    });

    test('applyNotificationTimeout', () => {
      piniaStore.applyNotificationTimeout(1);
      expect(piniaStore.notificationTimeout).toBe(1);
    });

    test('setFactoryOverviewConfig with empty config', () => {
      piniaStore.setFactoryOverviewConfig({});
      expect(piniaStore.timelinesInterval).toBe(8);
      expect(piniaStore.timelinesOrdering).toEqual({});
      expect(piniaStore.timelinesFactoryOrdering).toEqual({});
      expect(piniaStore.timelinesStationGroupOrdering).toEqual({});
      expect(piniaStore.timelinesStatColumn).toBe('oee');
      expect(piniaStore.unitType).toBe('primary');
      expect(piniaStore.isFactoryOverviewOrderingModified).toBe(false);
      expect(piniaStore.stationSelectionLastModified).toBeNull();
      expect(piniaStore.statusFilter).toEqual([]);
    });

    test('setFactoryOverviewConfig with config', () => {
      const config = {
        interval: 10,
        ordering: { 1: 2 },
        factoryOrdering: { 2: 3 },
        stationGroupOrdering: { 4: 5 },
        statColumn: 'availability',
        unitType: 'alternative',
        isFactoryOverviewOrderingModified: true,
        stationSelectionLastModified: '2021-12-12T06:00:00Z',
        statusFilter: ['active', 'inactive'],
      };
      piniaStore.setFactoryOverviewConfig(config);
      expect(piniaStore.timelinesInterval).toBe(10);
      expect(piniaStore.timelinesOrdering).toEqual({ 1: 2 });
      expect(piniaStore.timelinesFactoryOrdering).toEqual({ 2: 3 });
      expect(piniaStore.timelinesStationGroupOrdering).toEqual({ 4: 5 });
      expect(piniaStore.timelinesStatColumn).toBe('availability');
      expect(piniaStore.unitType).toBe('alternative');
      expect(piniaStore.isFactoryOverviewOrderingModified).toBe(true);
      expect(piniaStore.stationSelectionLastModified).toBe('2021-12-12T06:00:00Z');
      expect(piniaStore.statusFilter).toEqual(['active', 'inactive']);
    });

    test('setStatusFilter', () => {
      piniaStore.setStatusFilter(['active', 'inactive']);
      expect(piniaStore.statusFilter).toEqual(['active', 'inactive']);
    });
  });

  describe('actions', () => {
    test('updateTimelineIntervalEndTime with endTime', () => {
      const endTime = DateTime.fromISO('2021-12-12T06:00:00Z').toUTC();
      const clearSpy = vi.spyOn(piniaStore, 'clearNotificationTimeout').mockImplementation(() => {});
      const setNotifSpy = vi.spyOn(piniaStore, 'setNotificationTimeout').mockImplementation(() => {});
      piniaStore.updateTimelineIntervalEndTime(endTime);
      expect(piniaStore.timelinesIntervalEndTime).toEqual(endTime);
      expect(setNotifSpy).toHaveBeenCalled();
      expect(clearSpy).not.toHaveBeenCalled();
    });

    test('updateTimelineIntervalEndTime without endTime', () => {
      const clearSpy = vi.spyOn(piniaStore, 'clearNotificationTimeout').mockImplementation(() => {});
      const setNotifSpy = vi.spyOn(piniaStore, 'setNotificationTimeout').mockImplementation(() => {});
      piniaStore.updateTimelineIntervalEndTime(null);
      expect(piniaStore.timelinesIntervalEndTime).toBeNull();
      expect(clearSpy).toHaveBeenCalled();
      expect(setNotifSpy).not.toHaveBeenCalled();
    });

    test('setNotificationTimeout', () => {
      const clearSpy = vi.spyOn(piniaStore, 'clearNotificationTimeout').mockImplementation(() => {});
      piniaStore.setNotificationTimeout();
      expect(clearSpy).toHaveBeenCalled();
      expect(piniaStore.notificationTimeout).not.toBeNull();
    });

    test('showNotification', () => {
      piniaStore.showNotification();
      expect(piniaStore.notificationVisible).toBe(true);
      expect(piniaStore.notificationCountDown).toBe(180);
      expect(piniaStore.notificationCountDownInterval).not.toBeNull();
    });

    test('clearNotificationTimeout when notificationTimeout is set', () => {
      piniaStore.notificationTimeout = 1;
      piniaStore.clearNotificationTimeout();
      expect(piniaStore.notificationTimeout).toBeNull();
      expect(piniaStore.notificationVisible).toBe(false);
    });

    test('clearNotificationTimeout when notificationCountDownInterval is set', () => {
      piniaStore.notificationCountDownInterval = new CustomInterval();
      const clear = vi.fn();
      piniaStore.notificationCountDownInterval.clear = clear;
      piniaStore.clearNotificationTimeout();
      expect(clear).toHaveBeenCalled();
      expect(piniaStore.notificationCountDownInterval).toBeNull();
      expect(piniaStore.notificationVisible).toBe(false);
    });

    describe('fetchFactoryViewStationTimelines', () => {
      it('starts, sets correct timelines and finishes loading', async () => {
        mockCommentStore.commentsMap = { 1: { technical: true }, 2: { technical: false } };
        mockCommentStore.commentsPromise = Promise.resolve();

        stationApi.getFactoryViewStationTimeline.mockResolvedValueOnce({
          1: { id: 1, lastSlice: { typ: sliceType.PRODUCT, dur: 1, gDur: 2 } },
          2: { id: 2, lastSlice: { typ: sliceType.STOPPAGE, cId: 1 } },
          3: { id: 3, lastSlice: { typ: sliceType.STOPPAGE, cId: 2 } },
          4: { id: 4, lastSlice: { typ: sliceType.STANDBY } },
        });

        await piniaStore.fetchFactoryViewStationTimelines({ stationIds: [1, 2, 3, 4] });
        expect(piniaStore.timelines).toEqual({
          1: { id: 1, lastSlice: { typ: sliceType.PRODUCT, dur: 1, gDur: 2 }, statusTypes: [factoryOverviewStatuses.GOOD_PRODUCTION] },
          2: { id: 2, lastSlice: { typ: sliceType.STOPPAGE, cId: 1 }, statusTypes: [factoryOverviewStatuses.UNPLANNED_STOP, factoryOverviewStatuses.TECHNICAL_STOP] },
          3: { id: 3, lastSlice: { typ: sliceType.STOPPAGE, cId: 2 }, statusTypes: [factoryOverviewStatuses.UNPLANNED_STOP] },
          4: { id: 4, lastSlice: { typ: sliceType.STANDBY }, statusTypes: [factoryOverviewStatuses.PLANNED_STOP_EXCL_OEE] },
        });
      });
    });

    test('fetchFactoryOverviewConfig', async () => {
      const res = {
        interval: 9,
        ordering: { 1: 2 },
        factoryOrdering: { 2: 3 },
        stationGroupOrdering: { 4: 5 },
        statColumn: 'availability',
        unitType: 'alternative',
        isFactoryOverviewOrderingModified: true,
        stationSelectionLastModified: '2021-12-12T06:00:00Z',
      };
      factoryOverviewApi.getTimelineViewState.mockResolvedValueOnce(res);
      await piniaStore.fetchFactoryOverviewConfig();
      expect(factoryOverviewApi.getTimelineViewState).toHaveBeenCalledTimes(1);
      expect(piniaStore.timelinesInterval).toBe(9);
      expect(piniaStore.timelinesOrdering).toEqual({ 1: 2 });
    });

    test('modifyUnitType', async () => {
      vi.spyOn(piniaStore, 'saveFactoryOverviewConfig').mockResolvedValue();
      await piniaStore.modifyUnitType('alternative');
      expect(piniaStore.unitType).toBe('alternative');
      expect(piniaStore.saveFactoryOverviewConfig).toHaveBeenCalled();
    });

    test('modifyStatusFilter', async () => {
      vi.spyOn(piniaStore, 'saveFactoryOverviewConfig').mockResolvedValue();
      await piniaStore.modifyStatusFilter(['active', 'inactive']);
      expect(piniaStore.statusFilter).toEqual(['active', 'inactive']);
      expect(piniaStore.saveFactoryOverviewConfig).toHaveBeenCalled();
    });

    test('saveFactoryOverviewConfig', async () => {
      piniaStore.timelinesOrdering = { 1: 2 };
      piniaStore.timelinesFactoryOrdering = { 2: 3 };
      piniaStore.timelinesStationGroupOrdering = { 4: 5 };
      piniaStore.timelinesInterval = 10;
      piniaStore.timelinesStatColumn = 'availability';
      piniaStore.isFactoryOverviewOrderingModified = true;
      piniaStore.stationSelectionLastModified = '2021-12-12T06:00:00Z';
      piniaStore.unitType = 'alternative';
      piniaStore.statusFilter = ['active', 'inactive'];

      factoryOverviewApi.putTimelineViewState.mockResolvedValueOnce();
      await piniaStore.saveFactoryOverviewConfig();
      expect(factoryOverviewApi.putTimelineViewState).toHaveBeenCalledTimes(1);
      expect(factoryOverviewApi.putTimelineViewState).toHaveBeenCalledWith({
        interval: 10,
        ordering: { 1: 2 },
        factoryOrdering: { 2: 3 },
        stationGroupOrdering: { 4: 5 },
        statColumn: 'availability',
        unitType: 'alternative',
        isFactoryOverviewOrderingModified: true,
        stationSelectionLastModified: '2021-12-12T06:00:00Z',
        statusFilter: ['active', 'inactive'],
      });
    });

    test('subscribeToFactoryViewStations when initialized is false', async () => {
      piniaStore.initialized = false;
      const fetchReqSpy = vi.spyOn(piniaStore, 'fetchFactoryViewRequirements').mockResolvedValue();
      const fetchTimelinesSpy = vi.spyOn(piniaStore, 'fetchFactoryViewStationTimelines').mockResolvedValue();
      vi.spyOn(piniaStore, 'factoryViewVisibleStationIds', 'get').mockReturnValue([1, 2, 3]);

      await piniaStore.subscribeToFactoryViewStations();
      expect(fetchReqSpy).toHaveBeenCalled();
      expect(fetchTimelinesSpy).toHaveBeenCalledWith({ stationIds: [1, 2, 3] });
    });

    test('subscribeToFactoryViewStations when initialized is true', async () => {
      piniaStore.initialized = true;
      const fetchReqSpy = vi.spyOn(piniaStore, 'fetchFactoryViewRequirements').mockResolvedValue();
      const fetchTimelinesSpy = vi.spyOn(piniaStore, 'fetchFactoryViewStationTimelines').mockResolvedValue();
      vi.spyOn(piniaStore, 'factoryViewVisibleStationIds', 'get').mockReturnValue([1, 2, 3]);

      await piniaStore.subscribeToFactoryViewStations();
      expect(fetchReqSpy).not.toHaveBeenCalled();
      expect(fetchTimelinesSpy).toHaveBeenCalledWith({ stationIds: [1, 2, 3] });
    });

    test('subscribeToFactoryViewStations calls window.factoryViewLiveCentrifugeService when present', async () => {
      piniaStore.initialized = true;
      vi.spyOn(piniaStore, 'fetchFactoryViewStationTimelines').mockResolvedValue();
      vi.spyOn(piniaStore, 'factoryViewVisibleStationIds', 'get').mockReturnValue([1, 2]);
      const subscribeStub = vi.fn();
      window.factoryViewLiveCentrifugeService = { subscribeToFactoryViewStations: subscribeStub };

      await piniaStore.subscribeToFactoryViewStations();
      expect(subscribeStub).toHaveBeenCalledWith([1, 2], expect.any(Function));

      mockCommentStore.commentsMap = { 1: { technical: false } };
      const cb = subscribeStub.mock.calls[0][1];
      const val = { station: 1, data: { typ: sliceType.PRODUCT, dur: 1, gDur: 2 } };
      cb(val);
      expect(piniaStore.timelines[1]).toBeDefined();

      delete window.factoryViewLiveCentrifugeService;
    });

    test('setStationRollingTimelineBuffer when station already exists in rollingTimelines', () => {
      piniaStore.rollingTimelines = { 5: { existing: true } };
      piniaStore.setStationRollingTimelineBuffer({ station: 5, data: { newProp: 'hello' } });
      expect(piniaStore.rollingTimelinesSocketBuffer[5]).toEqual({ existing: true, newProp: 'hello' });
    });

    test('setStationRollingTimelineBuffer when station does not exist in rollingTimelines', () => {
      piniaStore.rollingTimelines = {};
      piniaStore.setStationRollingTimelineBuffer({ station: 7, data: { newProp: 'world' } });
      expect(piniaStore.rollingTimelinesSocketBuffer[7]).toEqual({ newProp: 'world' });
    });

    test('mergeRollingBuffer merges buffers into rollingTimelines', () => {
      piniaStore.rollingTimelines = { 1: { a: 1 } };
      piniaStore.rollingTimelinesSocketBuffer = { 2: { b: 2 } };
      piniaStore.mergeRollingBuffer();
      expect(piniaStore.rollingTimelines).toEqual({ 1: { a: 1 }, 2: { b: 2 } });
      expect(piniaStore.rollingTimelinesSocketBuffer).toEqual({});
    });

    test('setStationRollingTimelines sets rollingTimelines', () => {
      piniaStore.setStationRollingTimelines({ 3: { foo: 'bar' } });
      expect(piniaStore.rollingTimelines).toEqual({ 3: { foo: 'bar' } });
    });

    test('setStationTimelineAlert merges alert when station already in timelines', () => {
      piniaStore.timelines = { 10: { id: 10, existing: true } };
      piniaStore.setStationTimelineAlert({ station: 10, info: [{ type: 'warning' }] });
      expect(piniaStore.timelines[10]).toEqual({ id: 10, existing: true, alert: { type: 'warning' } });
    });

    test('setStationTimelineAlert creates entry when station not in timelines', () => {
      piniaStore.timelines = {};
      piniaStore.setStationTimelineAlert({ station: 11, info: [{ type: 'error' }] });
      expect(piniaStore.timelines[11]).toEqual({ alert: { type: 'error' } });
    });

    test('setStationReqCancelToken stores cancel token', () => {
      const cancel = vi.fn();
      const source = { cancel };
      piniaStore.setStationReqCancelToken({ stationId: 3, source });
      expect(piniaStore.stationCancelTokenObj[3].cancel).toBe(cancel);
    });

    test('modifyTimelineInterval saves interval and calls saveFactoryOverviewConfig', async () => {
      vi.spyOn(piniaStore, 'saveFactoryOverviewConfig').mockResolvedValue();
      await piniaStore.modifyTimelineInterval(12);
      expect(piniaStore.timelinesInterval).toBe(12);
      expect(piniaStore.saveFactoryOverviewConfig).toHaveBeenCalled();
    });

    test('modifyTimelineStatColumn saves stat column and calls saveFactoryOverviewConfig', async () => {
      vi.spyOn(piniaStore, 'saveFactoryOverviewConfig').mockResolvedValue();
      await piniaStore.modifyTimelineStatColumn('availability');
      expect(piniaStore.timelinesStatColumn).toBe('availability');
      expect(piniaStore.saveFactoryOverviewConfig).toHaveBeenCalled();
    });

    test('modifyTimelineOrdering updates orderings and calls saveFactoryOverviewConfig', async () => {
      vi.spyOn(piniaStore, 'saveFactoryOverviewConfig').mockResolvedValue();
      piniaStore.timelinesOrdering = { 1: 1, 2: 2 };
      await piniaStore.modifyTimelineOrdering([{ id: 2 }, { id: 1 }]);
      expect(piniaStore.timelinesOrdering).toEqual({ 2: 1, 1: 2 });
      expect(piniaStore.saveFactoryOverviewConfig).toHaveBeenCalled();
    });

    test('modifyTimelineFactoryOrdering updates factory orderings and calls saveFactoryOverviewConfig', async () => {
      vi.spyOn(piniaStore, 'saveFactoryOverviewConfig').mockResolvedValue();
      piniaStore.timelinesFactoryOrdering = { 1: 1, 2: 2 };
      await piniaStore.modifyTimelineFactoryOrdering([{ id: 2 }, { id: 1 }]);
      expect(piniaStore.timelinesFactoryOrdering).toEqual({ 2: 1, 1: 2 });
      expect(piniaStore.saveFactoryOverviewConfig).toHaveBeenCalled();
    });

    test('modifyTimelineStationGroupOrdering updates group orderings and calls saveFactoryOverviewConfig', async () => {
      vi.spyOn(piniaStore, 'saveFactoryOverviewConfig').mockResolvedValue();
      piniaStore.timelinesStationGroupOrdering = { 1: 1, 2: 2 };
      await piniaStore.modifyTimelineStationGroupOrdering([{ id: 2 }, { id: 1 }]);
      expect(piniaStore.timelinesStationGroupOrdering).toEqual({ 2: 1, 1: 2 });
      expect(piniaStore.saveFactoryOverviewConfig).toHaveBeenCalled();
    });

    test('modifyFactoryViewStationOrdering updates ordering and calls saveFactoryViewStationsOrder', async () => {
      vi.spyOn(piniaStore, 'saveFactoryViewStationsOrder').mockResolvedValue();
      piniaStore.factoryViewOrdering = [{ stationId: 1, order: 0 }, { stationId: 2, order: 1 }];
      await piniaStore.modifyFactoryViewStationOrdering([2, 1]);
      expect(piniaStore.saveFactoryViewStationsOrder).toHaveBeenCalled();
    });

    test('makeRollingTimelineRequest uses timelinesIntervalEndTime when set', async () => {
      const endTime = DateTime.fromISO('2021-12-12T06:00:00Z').toUTC();
      piniaStore.timelinesIntervalEndTime = endTime;
      piniaStore.timelinesInterval = 8;
      stationApi.getRollingStationTimeline.mockResolvedValueOnce({ 1: {} });

      await piniaStore.makeRollingTimelineRequest({ stationId: 1 });

      expect(stationApi.getRollingStationTimeline).toHaveBeenCalledWith(
        expect.objectContaining({ stationIds: [1] }),
        expect.any(Object),
      );
    });

    test('makeRollingTimelineRequest uses DateTime.now() when timelinesIntervalEndTime is null', async () => {
      piniaStore.timelinesIntervalEndTime = null;
      piniaStore.timelinesInterval = 8;
      stationApi.getRollingStationTimeline.mockResolvedValueOnce({ 1: {} });

      await piniaStore.makeRollingTimelineRequest({ stationId: 1 });

      expect(stationApi.getRollingStationTimeline).toHaveBeenCalledWith(
        expect.objectContaining({ stationIds: [1] }),
        expect.any(Object),
      );
    });

    test('cancelStationRequest cancels when token exists', async () => {
      const cancelMock = vi.fn();
      piniaStore.stationCancelTokenObj = { 5: { cancel: cancelMock } };
      await piniaStore.cancelStationRequest(5);
      expect(cancelMock).toHaveBeenCalled();
    });

    test('cancelStationRequest does nothing when no token for station', async () => {
      piniaStore.stationCancelTokenObj = {};
      await expect(piniaStore.cancelStationRequest(99)).resolves.toBeUndefined();
    });

    test('fetchFactoryViewRollingStationTimeline processes timeline on success', async () => {
      vi.useFakeTimers();
      const previousWorkerService = window.WorkerService;
      const hadWorkerService = Object.prototype.hasOwnProperty.call(window, 'WorkerService');
      const processResult = { station: 1, data: { processed: true } };

      try {
        window.WorkerService = {
          process: vi.fn(() => Promise.resolve(processResult)),
        };
        mockCommentStore.commentsMap = {};
        mockStationStore.lineviewStation = { zoneId: 'UTC' };

        vi.spyOn(piniaStore, 'makeRollingTimelineRequest').mockResolvedValueOnce({ 1: { timeline: true } });

        await piniaStore.fetchFactoryViewRollingStationTimeline({ stationId: 1 });

        // Advance timers to trigger the setTimeout callbacks (finishStationLoading + mergeRollingBuffer)
        vi.advanceTimersByTime(1000);

        expect(window.WorkerService.process).toHaveBeenCalledWith(
          'processTimeline',
          expect.objectContaining({ stationId: 1 }),
        );
      } finally {
        if (hadWorkerService) {
          window.WorkerService = previousWorkerService;
        } else {
          delete window.WorkerService;
        }
        vi.useRealTimers();
      }
    });

    test('fetchFactoryViewRollingStationTimeline silently catches errors', async () => {
      vi.spyOn(piniaStore, 'makeRollingTimelineRequest').mockRejectedValueOnce(new Error('network'));
      await expect(piniaStore.fetchFactoryViewRollingStationTimeline({ stationId: 2 })).resolves.toBeUndefined();
    });

    test('fetchFactoryViewStationsOrder with non-empty ordering', async () => {
      const ordering = [{ stationId: 1, order: 0 }, { stationId: 2, order: 1 }];
      stationApi.getFactoryViewStationsOrder.mockResolvedValueOnce({ ordering: JSON.stringify(ordering) });

      await piniaStore.fetchFactoryViewStationsOrder();
      expect(piniaStore.factoryViewOrdering).toEqual(ordering);
    });

    test('fetchFactoryViewStationsOrder with empty ordering and isFactoryOverviewOrderingModified false defaults to first 20', async () => {
      const stations = Array.from({ length: 25 }, (_, i) => ({ id: i + 1, createdDate: '2020-01-01' }));
      mockStationStore.stations = stations;
      piniaStore.isFactoryOverviewOrderingModified = false;
      stationApi.getFactoryViewStationsOrder.mockResolvedValueOnce({ ordering: JSON.stringify([]) });

      await piniaStore.fetchFactoryViewStationsOrder();

      expect(piniaStore.factoryViewOrdering.length).toBe(20);
      expect(piniaStore.factoryViewOrdering[0]).toEqual({ stationId: 1, order: 0 });
    });

    test('fetchFactoryViewStationsOrder with empty ordering and isFactoryOverviewOrderingModified true leaves ordering empty', async () => {
      mockStationStore.stations = [{ id: 1 }, { id: 2 }];
      piniaStore.isFactoryOverviewOrderingModified = true;
      stationApi.getFactoryViewStationsOrder.mockResolvedValueOnce({ ordering: JSON.stringify([]) });

      await piniaStore.fetchFactoryViewStationsOrder();

      expect(piniaStore.factoryViewOrdering).toEqual([]);
    });

    test('saveFactoryViewStationsOrder posts order and updates ordering', async () => {
      const ordering = [{ stationId: 1, order: 0 }, { stationId: 2, order: 1 }];
      stationApi.postFactoryViewStationsOrder.mockResolvedValueOnce({ ordering: JSON.stringify(ordering) });
      factoryOverviewApi.putTimelineViewState.mockResolvedValueOnce();

      const stationsList = [{ id: 1 }, { id: 2 }];
      await piniaStore.saveFactoryViewStationsOrder(stationsList);

      expect(stationApi.postFactoryViewStationsOrder).toHaveBeenCalledWith([
        { stationId: 1, order: 0 },
        { stationId: 2, order: 1 },
      ]);
      expect(piniaStore.factoryViewOrdering).toEqual(ordering);
      expect(piniaStore.isFactoryOverviewOrderingModified).toBe(true);
      expect(piniaStore.stationSelectionLastModified).not.toBeNull();
    });

    test('fetchFactoryViewRequirements fetches order + config and marks initialized', async () => {
      vi.spyOn(piniaStore, 'fetchFactoryViewStationsOrder').mockResolvedValue();
      vi.spyOn(piniaStore, 'fetchFactoryOverviewConfig').mockResolvedValue();

      await piniaStore.fetchFactoryViewRequirements();

      expect(piniaStore.fetchFactoryViewStationsOrder).toHaveBeenCalled();
      expect(piniaStore.fetchFactoryOverviewConfig).toHaveBeenCalled();
      expect(piniaStore.initialized).toBe(true);
    });

    test('subscribeToFactoryViewRollingTimeline sets up interval and calls centrifuge when present', async () => {
      vi.useFakeTimers();
      const subscribeRollingStub = vi.fn();
      window.factoryViewTimelineCentrifugeService = { subscribeRollingStation: subscribeRollingStub };
      mockCommentStore.commentsMap = {};

      await piniaStore.subscribeToFactoryViewRollingTimeline(1);

      expect(piniaStore.socketBufferConsumerInterval).not.toBeNull();
      expect(subscribeRollingStub).toHaveBeenCalledWith(1, piniaStore.timelinesInterval, expect.any(Function));

      // Advance 33 seconds to trigger the CustomInterval callback (mergeRollingBuffer on line 385)
      vi.advanceTimersByTime(33 * 1000);

      // Exercise the centrifuge callback to cover inner WorkerService.process path
      window.WorkerService = {
        process: vi.fn(() => Promise.resolve({ station: 1, data: { r: true } })),
      };
      const cb = subscribeRollingStub.mock.calls[0][2];
      cb({ data: { typ: sliceType.PRODUCT }, station: 1 });
      await Promise.resolve();

      vi.useRealTimers();
      delete window.factoryViewTimelineCentrifugeService;
    });

    test('subscribeToFactoryViewRollingTimeline clears existing interval before setting new one', async () => {
      const clearMock = vi.fn();
      piniaStore.socketBufferConsumerInterval = new CustomInterval(() => {}, 1000);
      piniaStore.socketBufferConsumerInterval.clear = clearMock;
      mockCommentStore.commentsMap = {};

      await piniaStore.subscribeToFactoryViewRollingTimeline(2);

      expect(clearMock).toHaveBeenCalled();
      expect(piniaStore.socketBufferConsumerInterval).not.toBeNull();
    });

    test('subscribeToFactoryViewRollingTimeline does nothing with centrifuge when service absent', async () => {
      delete window.factoryViewTimelineCentrifugeService;
      mockCommentStore.commentsMap = {};

      await expect(piniaStore.subscribeToFactoryViewRollingTimeline(3)).resolves.toBeUndefined();
      expect(piniaStore.socketBufferConsumerInterval).not.toBeNull();
    });

    test('disconnectFromFactoryViewRollingTimelines calls disconnect and clears interval when set', () => {
      const disconnectStub = vi.fn();
      window.factoryViewTimelineCentrifugeService = { disconnectRollingStations: disconnectStub };

      const clearMock = vi.fn(() => null);
      piniaStore.socketBufferConsumerInterval = { clear: clearMock };

      piniaStore.disconnectFromFactoryViewRollingTimelines();

      expect(clearMock).toHaveBeenCalled();
      expect(piniaStore.socketBufferConsumerInterval).toBeNull();
      expect(disconnectStub).toHaveBeenCalled();

      delete window.factoryViewTimelineCentrifugeService;
    });

    test('disconnectFromFactoryViewRollingTimelines calls disconnect when no interval', () => {
      const disconnectStub = vi.fn();
      window.factoryViewTimelineCentrifugeService = { disconnectRollingStations: disconnectStub };
      piniaStore.socketBufferConsumerInterval = null;

      piniaStore.disconnectFromFactoryViewRollingTimelines();
      expect(disconnectStub).toHaveBeenCalled();

      delete window.factoryViewTimelineCentrifugeService;
    });

    test('unsubscribeFromFactoryViewRollingTimeline calls unsubscribeRollingStation', () => {
      const unsubscribeStub = vi.fn();
      window.factoryViewTimelineCentrifugeService = { unsubscribeRollingStation: unsubscribeStub };

      piniaStore.unsubscribeFromFactoryViewRollingTimeline(7);
      expect(unsubscribeStub).toHaveBeenCalledWith(7);

      delete window.factoryViewTimelineCentrifugeService;
    });

    test('showNotification countdown interval triggers clearNotificationTimeout and reset when countDown reaches 0', () => {
      vi.useFakeTimers();
      vi.spyOn(piniaStore, 'clearNotificationTimeout').mockImplementation(() => {});
      vi.spyOn(piniaStore, 'updateTimelineIntervalEndTime').mockImplementation(() => {});

      piniaStore.showNotification();
      // notificationCountDown starts at 180; tick 180 seconds to reach 0
      piniaStore.notificationCountDown = 1;
      vi.advanceTimersByTime(1000);

      expect(piniaStore.clearNotificationTimeout).toHaveBeenCalled();
      expect(piniaStore.updateTimelineIntervalEndTime).toHaveBeenCalledWith(null);

      vi.useRealTimers();
    });

    test('setNotificationTimeout fires showNotification after 30 minutes', () => {
      vi.useFakeTimers();
      const showSpy = vi.spyOn(piniaStore, 'showNotification').mockImplementation(() => {});
      vi.spyOn(piniaStore, 'clearNotificationTimeout').mockImplementation(() => {});

      piniaStore.setNotificationTimeout();
      vi.advanceTimersByTime(30 * 60 * 1000);
      expect(showSpy).toHaveBeenCalled();

      vi.useRealTimers();
    });
  });

  describe('getters', () => {
    test('isLoading returns false when loading is empty', () => {
      piniaStore.loading = [];
      expect(piniaStore.isLoading).toBe(false);
    });

    test('isLoading returns true when loading has items', () => {
      piniaStore.loading = ['loading'];
      expect(piniaStore.isLoading).toBe(true);
    });

    test('factoryViewOrderingMap maps factoryViewOrdering by stationId', () => {
      piniaStore.factoryViewOrdering = [{ stationId: 1, order: 0 }, { stationId: 2, order: 1 }];
      expect(piniaStore.factoryViewOrderingMap).toMatchObject({ 1: expect.objectContaining({ stationId: 1 }), 2: expect.objectContaining({ stationId: 2 }) });
    });

    test('that factoryViewVisibleStationIds does not return double stationIds', () => {
      vi.spyOn(piniaStore, 'factoryViewStations', 'get').mockReturnValue([{ id: 2 }, { id: 3 }, { id: 4 }, { id: 4 }]);
      expect(piniaStore.factoryViewVisibleStationIds.length).toBe(3);
    });

    test('factoryViewStations returns empty array when initialized is false', () => {
      piniaStore.initialized = false;
      expect(piniaStore.factoryViewStations).toEqual([]);
    });

    test('factoryViewStations returns empty array when no stations', () => {
      piniaStore.initialized = true;
      mockStationStore.stations = [];
      expect(piniaStore.factoryViewStations).toEqual([]);
    });

    test('factoryViewStations returns all stations when no ordering and no stationSelectionLastModified', () => {
      piniaStore.initialized = true;
      piniaStore.factoryViewOrdering = [];
      piniaStore.stationSelectionLastModified = null;
      mockStationStore.stations = [{ id: 1 }, { id: 2 }];
      expect(piniaStore.factoryViewStations).toEqual([{ id: 1 }, { id: 2 }]);
    });

    test('factoryViewStations returns empty array when ordering is empty but stationSelectionLastModified is set', () => {
      piniaStore.initialized = true;
      piniaStore.factoryViewOrdering = [];
      piniaStore.stationSelectionLastModified = '2021-12-12T06:00:00Z';
      mockStationStore.stations = [{ id: 1 }];
      expect(piniaStore.factoryViewStations).toEqual([]);
    });

    test('factoryViewStations uses station createdDate when stationSelectionLastModified is not set', () => {
      piniaStore.initialized = true;
      piniaStore.stationSelectionLastModified = null;
      piniaStore.factoryViewOrdering = [{ stationId: 1, order: 0 }];
      mockStationStore.stationsMap = { 1: { id: 1, createdDate: '2020-01-01T00:00:00Z' } };
      mockStationStore.stations = [
        { id: 1, createdDate: '2020-01-01T00:00:00Z' },
        { id: 2, createdDate: '2021-06-01T00:00:00Z' },
      ];
      const result = piniaStore.factoryViewStations;
      // Station 2 was created after station 1 (last selected), so it should be appended
      expect(result.some((s) => s.id === 2)).toBe(true);
    });

    test('that factoryViewStations does not return new station if it is already in timelines', async () => {
      piniaStore.initialized = true;
      piniaStore.factoryViewOrdering = [{ stationId: 1, order: 2 }, { stationId: 2, order: 1 }];
      piniaStore.stationSelectionLastModified = '2021-12-12T06:00:00Z';
      mockStationStore.stationsMap = { 2: { id: 2 }, 1: { id: 1 } };
      mockStationStore.stations = [
        { id: 1, createdDate: '2020-12-12T06:00:00Z' },
        { id: 2, createdDate: '2021-12-21T06:00:00Z' },
      ];
      expect(piniaStore.factoryViewStations.length).toBe(2);
    });

    describe('filteredFactoryOverviewStations', () => {
      it('returns all factoryViewStations if status filter is empty', () => {
        piniaStore.statusFilter = [];
        piniaStore.timelines = {
          1: { statusTypes: [factoryOverviewStatuses.GOOD_PRODUCTION] },
          2: { statusTypes: [factoryOverviewStatuses.SLOW_PRODUCTION] },
          3: { statusTypes: [factoryOverviewStatuses.UNPLANNED_STOP] },
          4: { statusTypes: [factoryOverviewStatuses.UNCOMMENTED_STOP] },
        };
        vi.spyOn(piniaStore, 'factoryViewStations', 'get').mockReturnValue([{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]);
        expect(piniaStore.filteredFactoryOverviewStations).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]);
      });

      it('returns factoryViewStations with status UNCOMMENTED if status filter contains UNCOMMENTED', () => {
        piniaStore.statusFilter = [factoryOverviewStatuses.UNCOMMENTED_STOP];
        piniaStore.timelines = {
          1: { statusTypes: [factoryOverviewStatuses.GOOD_PRODUCTION] },
          2: { statusTypes: [factoryOverviewStatuses.SLOW_PRODUCTION] },
          3: { statusTypes: [factoryOverviewStatuses.UNPLANNED_STOP] },
          4: { statusTypes: [factoryOverviewStatuses.UNCOMMENTED_STOP] },
        };
        vi.spyOn(piniaStore, 'factoryViewStations', 'get').mockReturnValue([{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]);
        expect(piniaStore.filteredFactoryOverviewStations).toEqual([{ id: 4 }]);
      });

      it('returns UNPLANNED_STOP and UNCOMMENTED if status filter contains those', () => {
        piniaStore.statusFilter = [factoryOverviewStatuses.UNCOMMENTED_STOP, factoryOverviewStatuses.UNPLANNED_STOP];
        piniaStore.timelines = {
          1: { statusTypes: [factoryOverviewStatuses.GOOD_PRODUCTION] },
          2: { statusTypes: [factoryOverviewStatuses.SLOW_PRODUCTION] },
          3: { statusTypes: [factoryOverviewStatuses.UNPLANNED_STOP] },
          4: { statusTypes: [factoryOverviewStatuses.UNCOMMENTED_STOP] },
        };
        vi.spyOn(piniaStore, 'factoryViewStations', 'get').mockReturnValue([{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]);
        expect(piniaStore.filteredFactoryOverviewStations).toEqual([{ id: 3 }, { id: 4 }]);
      });

      it('does not return station if it is not in timelines and status filter does not contain NO_SHIFT', () => {
        piniaStore.statusFilter = [factoryOverviewStatuses.UNCOMMENTED_STOP, factoryOverviewStatuses.UNPLANNED_STOP];
        piniaStore.timelines = {
          1: { statusTypes: [factoryOverviewStatuses.NO_SHIFT] },
          2: { statusTypes: [factoryOverviewStatuses.SLOW_PRODUCTION] },
          3: { statusTypes: [factoryOverviewStatuses.UNPLANNED_STOP] },
          4: { statusTypes: [factoryOverviewStatuses.UNCOMMENTED_STOP] },
        };
        vi.spyOn(piniaStore, 'factoryViewStations', 'get').mockReturnValue([{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }]);
        expect(piniaStore.filteredFactoryOverviewStations).toEqual([{ id: 3 }, { id: 4 }]);
      });

      it('returns station if it is not in timelines and status filter is empty', () => {
        piniaStore.statusFilter = [];
        piniaStore.timelines = {
          1: { statusTypes: [factoryOverviewStatuses.NO_SHIFT] },
          2: { statusTypes: [factoryOverviewStatuses.SLOW_PRODUCTION] },
          3: { statusTypes: [factoryOverviewStatuses.UNPLANNED_STOP] },
          4: { statusTypes: [factoryOverviewStatuses.UNCOMMENTED_STOP] },
        };
        vi.spyOn(piniaStore, 'factoryViewStations', 'get').mockReturnValue([{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }]);
        expect(piniaStore.filteredFactoryOverviewStations).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }]);
      });

      it('returns station if it is not in timelines and status filter has NO_SHIFT', () => {
        piniaStore.statusFilter = [factoryOverviewStatuses.NO_SHIFT];
        piniaStore.timelines = {
          1: { statusTypes: [factoryOverviewStatuses.NO_SHIFT] },
          2: { statusTypes: [factoryOverviewStatuses.SLOW_PRODUCTION] },
          3: { statusTypes: [factoryOverviewStatuses.UNPLANNED_STOP] },
          4: { statusTypes: [factoryOverviewStatuses.UNCOMMENTED_STOP] },
        };
        vi.spyOn(piniaStore, 'factoryViewStations', 'get').mockReturnValue([{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }]);
        expect(piniaStore.filteredFactoryOverviewStations).toEqual([{ id: 1 }, { id: 5 }]);
      });
    });
  });
});

describe('getStationStatus', () => {
  it('returns NO_SHIFT if timeline is undefined', () => {
    const result = getStationStatus(undefined, {});
    expect(result).toEqual([factoryOverviewStatuses.NO_SHIFT]);
  });

  it('returns NO_SHIFT if timeline is null', () => {
    const result = getStationStatus(null, {});
    expect(result).toEqual([factoryOverviewStatuses.NO_SHIFT]);
  });

  it('returns array with NO_SHIFT if timeline is empty', () => {
    const result = getStationStatus([], {});
    expect(result).toEqual([factoryOverviewStatuses.NO_SHIFT]);
  });

  it('returns array with GOOD_PRODUCTION if lastSlice is fast product', () => {
    const timeline = {
      lastSlice: { typ: sliceType.PRODUCT, dur: 1, gDur: 2 },
    };
    const result = getStationStatus(timeline, {});
    expect(result).toEqual([factoryOverviewStatuses.GOOD_PRODUCTION]);
  });

  it('returns array with SLOW_PRODUCTION if lastSlice is slow product', () => {
    const timeline = {
      lastSlice: { typ: sliceType.PRODUCT, dur: 2, gDur: 1 },
    };
    const result = getStationStatus(timeline, {});
    expect(result).toEqual([factoryOverviewStatuses.SLOW_PRODUCTION]);
  });

  it('returns array with UNCOMMENTED_STOP if lastSlice is stoppage with cId 0', () => {
    const timeline = {
      lastSlice: { typ: sliceType.STOPPAGE, cId: 0 },
    };
    const result = getStationStatus(timeline, {});
    expect(result).toEqual([factoryOverviewStatuses.UNCOMMENTED_STOP]);
  });

  it('returns array with UNPLANNED_STOP if lastSlice is stoppage with cId and comment is not technical', () => {
    const timeline = {
      lastSlice: { typ: sliceType.STOPPAGE, cId: 1 },
    };
    const result = getStationStatus(timeline, { 1: { technical: false } });
    expect(result).toEqual([factoryOverviewStatuses.UNPLANNED_STOP]);
  });

  it('returns array with UNPLANNED_STOP and TECHNICAL_STOP if lastSlice is stoppage with cId and comment is technical', () => {
    const timeline = {
      lastSlice: { typ: sliceType.STOPPAGE, cId: 1 },
    };
    const result = getStationStatus(timeline, { 1: { technical: true } });
    expect(result).toEqual([factoryOverviewStatuses.UNPLANNED_STOP, factoryOverviewStatuses.TECHNICAL_STOP]);
  });

  it('returns array with PLANNED_STOP_EXCL_OEE if lastSlice is STANDBY', () => {
    const timeline = {
      lastSlice: { typ: sliceType.STANDBY },
    };
    const result = getStationStatus(timeline, {});
    expect(result).toEqual([factoryOverviewStatuses.PLANNED_STOP_EXCL_OEE]);
  });

  it('returns array with PLANNED_STOP_INCL_OEE if lastSlice is PLANNED_STOPPAGE and inOee is false', () => {
    const timeline = {
      lastSlice: { typ: sliceType.PLANNED_STOPPAGE },
    };
    const result = getStationStatus(timeline, {});
    expect(result).toEqual([factoryOverviewStatuses.PLANNED_STOP_INCL_OEE]);
  });
});
