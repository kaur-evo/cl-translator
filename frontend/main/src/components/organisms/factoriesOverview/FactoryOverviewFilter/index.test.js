import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { DateTime } from 'luxon';
import { nextTick } from 'vue';

import FactoryOverviewFilter from './index.vue';

import { REALTIME, TIMELINE } from '@/constants/routeNames';
import factoryOverviewStatuses from '@/constants/factoryOverviewStatuses';
import { useFactoryOverviewConfigStore } from '@/stores';

const defaultFactories = [
  { id: 11, name: 'factory1', stations: [{ id: 1 }, { id: 2 }] },
  { id: 12, name: 'factory2', stations: [{ id: 3 }] },
];

const defaultStations = [
  { id: 1, name: 'station1', factoryId: 11 },
  { id: 2, name: 'station2', factoryId: 11 },
  { id: 3, name: 'station3', factoryId: 12 },
];

const defaultStationGroups = [{ id: 21, name: 'group1' }, { id: 22, name: 'group2' }];

const propsDefault = {
  noSave: false,
  stationsProp: [31, 32],
};

const createWrapper = (options = {}) => {
  const {
    props = { ...propsDefault },
    routeName = 'live',
    initialState = {},
  } = options;

  const pinia = createTestingPinia({
    createSpy: vi.fn,
    stubActions: true,
    initialState: {
      factoryOverviewConfig: {
        timelinesIntervalEndTime: null,
        timelinesInterval: 8,
        statusFilter: [],
        isLoading: false,
        ...initialState.factoryOverviewConfig,
      },
      station: {
        stations: defaultStations,
        stationGroups: defaultStationGroups,
        ...initialState.station,
      },
      factory: {
        factories: defaultFactories,
        ...initialState.factory,
      },
      ...initialState,
    },
  });

  const factoryOverviewConfigStore = useFactoryOverviewConfigStore(pinia);
  factoryOverviewConfigStore.factoryViewVisibleStationIds = [1, 2, 3];

  return shallowMount(FactoryOverviewFilter, {
    props,
    global: {
      plugins: [pinia],
      mocks: { $route: { name: routeName } },
    },
  });
};

describe('FactoryOverviewFilter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders', () => {
    const wrapper = createWrapper();
    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly when route name is realtime', () => {
    const wrapper = createWrapper({ routeName: REALTIME });
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly when route name is timeline', async () => {
    const wrapper = createWrapper({ routeName: TIMELINE });
    await nextTick();
    expect(wrapper.element).toMatchSnapshot();
  });

  describe('currentBtnTooltipText', () => {
    it('returns empty string if timelinesInterval is not set', () => {
      const wrapper = createWrapper({
        routeName: 'timeline',
        initialState: {
          factoryOverviewConfig: { timelinesInterval: null },
        },
      });

      expect(wrapper.vm.currentBtnTooltipText).toBe('');
    });

    it('returns correct tooltip text if timelinesInterval is set', () => {
      const wrapper = createWrapper({
        routeName: 'timeline',
        initialState: {
          factoryOverviewConfig: { timelinesInterval: 8 },
        },
      });

      expect(wrapper.vm.currentBtnTooltipText).toBe('Current {value} hours');
    });
  });

  describe('stationIdsClone', () => {
    it('has all station ids, when all factories are selected', () => {
      const wrapper = createWrapper();

      wrapper.vm.onFactoryChange([11, 12]);
      expect(wrapper.vm.stationIdsClone).toEqual([1, 2, 3]);
    });

    it('has correct station ids when one of the factories is selected', () => {
      const wrapper = createWrapper();

      wrapper.vm.onFactoryChange([11]);
      expect(wrapper.vm.stationIdsClone).toEqual([1, 2]);

      wrapper.vm.onStationChange([1, 2, 3]);

      wrapper.vm.onFactoryChange([12]);
      expect(wrapper.vm.stationIdsClone).toEqual([3]);
    });
  });

  describe('onStationChange', () => {
    it('calls modifyFactoryViewStationOrdering and subscribeToFactoryViewStations methods, when route name is realtime', () => {
      const wrapper = createWrapper({ routeName: 'realtime' });

      const modifyFactoryViewStationOrdering = vi.spyOn(wrapper.vm, 'modifyFactoryViewStationOrdering');
      const subscribeToFactoryViewStations = vi.spyOn(wrapper.vm, 'subscribeToFactoryViewStations');
      wrapper.vm.onStationChange([1, 2, 3]);
      expect(wrapper.vm.stationIdsClone).toEqual([1, 2, 3]);
      expect(modifyFactoryViewStationOrdering).toHaveBeenCalledWith([1, 2, 3]);
      expect(subscribeToFactoryViewStations).toHaveBeenCalled();
    });

    it('calls modifyFactoryViewStationOrdering, when route name is timeline', () => {
      const wrapper = createWrapper({ routeName: 'timeline' });

      const modifyFactoryViewStationOrdering = vi.spyOn(wrapper.vm, 'modifyFactoryViewStationOrdering');
      wrapper.vm.onStationChange([1, 2, 3]);
      expect(wrapper.vm.stationIdsClone).toEqual([1, 2, 3]);
      expect(modifyFactoryViewStationOrdering).toHaveBeenCalledWith([1, 2, 3]);
    });

    it('emits stations change event, if noSave prop is true', () => {
      const wrapper = createWrapper({
        props: { ...propsDefault, noSave: true },
        routeName: 'timeline',
      });

      wrapper.vm.onStationChange([1, 2, 3]);
      expect(wrapper.emitted('update:stations-prop')).toBeTruthy();
      expect(wrapper.emitted('update:stations-prop')[0][0]).toEqual([1, 2, 3]);
    });
  });

  describe('onIntervalChange', () => {
    it('calls modifyTimelineInterval when noSave prop is false', async () => {
      const wrapper = createWrapper({ routeName: 'timeline' });

      const factoryOverviewConfigStore = useFactoryOverviewConfigStore();
      vi.spyOn(factoryOverviewConfigStore, 'modifyTimelineInterval').mockResolvedValue();
      await wrapper.vm.onIntervalChange(1);
      expect(factoryOverviewConfigStore.modifyTimelineInterval).toHaveBeenCalledWith(1);
    });

    it('emits interval change event, if noSave prop is true', async () => {
      const wrapper = createWrapper({
        props: { ...propsDefault, noSave: true },
        routeName: 'timeline',
      });

      await wrapper.vm.onIntervalChange(1);
      expect(wrapper.emitted('update:interval-prop')).toBeTruthy();
      expect(wrapper.emitted('update:interval-prop')[0][0]).toEqual(1);
    });
  });

  describe('onStatColumnChange', () => {
    it('calls modifyTimelineStatColumn method, when noSave prop is false', async () => {
      const wrapper = createWrapper({ routeName: 'timeline' });

      const modifyTimelineStatColumn = vi.spyOn(wrapper.vm, 'modifyTimelineStatColumn');
      await wrapper.vm.onStatColumnChange('column');
      expect(modifyTimelineStatColumn).toHaveBeenCalledWith('column');
    });

    describe('onFactoryChange', () => {
      it('calls onStationChange with correct station ids when factories are added', () => {
        const wrapper = createWrapper();
        wrapper.vm.selectedFactories = [12];
        wrapper.vm.stationIdsClone = [3];

        const onStationChange = vi.spyOn(wrapper.vm, 'onStationChange');
        wrapper.vm.onFactoryChange([12, 11]);
        expect(onStationChange).toHaveBeenCalledWith([3, 1, 2]);
      });

      it('calls onStationChange with correct station ids when factories are removed', () => {
        const wrapper = createWrapper();
        wrapper.vm.selectedFactories = [11, 12];
        wrapper.vm.stationIdsClone = [1, 2, 3];

        const onStationChange = vi.spyOn(wrapper.vm, 'onStationChange');
        wrapper.vm.onFactoryChange([11]);
        expect(onStationChange).toHaveBeenCalledWith([1, 2]);
      });
    });

    it('emits stat column change event, if noSave prop is true', async () => {
      const wrapper = createWrapper({
        props: { ...propsDefault, noSave: true },
        routeName: 'timeline',
      });

      await wrapper.vm.onStatColumnChange('column');
      expect(wrapper.emitted('update:stat-prop')).toBeTruthy();
      expect(wrapper.emitted('update:stat-prop')[0][0]).toEqual('column');
    });
  });

  describe('isPreviousDisabled', () => {
    beforeEach(() => {
      vi.setSystemTime(new Date('2021-01-10T00:00:00Z'));
    });
    it('returns false if timelinesIntervalEndTime is not set', () => {
      const wrapper = createWrapper({ routeName: 'timeline' });

      expect(wrapper.vm.isPreviousDisabled).toBe(false);
    });

    it('returns false if timelinesIntervalEndTime is set so that interval start doesnt go past 7*24h', () => {
      const wrapper = createWrapper({
        routeName: 'timeline',
        initialState: {
          factoryOverviewConfig: {
            timelinesIntervalEndTime: DateTime.fromISO('2021-01-08T00:00:00Z').toUTC(),
          },
        },
      });

      expect(wrapper.vm.isPreviousDisabled).toBe(false);
    });

    it('returns true if 7*24h ago is in the shown interval', () => {
      const wrapper = createWrapper({
        routeName: 'timeline',
        initialState: {
          factoryOverviewConfig: {
            timelinesIntervalEndTime: DateTime.fromISO('2021-01-02T22:00:00Z').toUTC(),
          },
        },
      });

      expect(wrapper.vm.isPreviousDisabled).toBe(true);
    });
  });

  describe('isNextDisabled', () => {
    it('returns true if timelinesIntervalEndTime is not set', () => {
      const wrapper = createWrapper({ routeName: 'timeline' });

      expect(wrapper.vm.isNextDisabled).toBe(true);
    });

    it('returns false if timelinesIntervalEndTime is set', () => {
      const wrapper = createWrapper({
        routeName: 'timeline',
        initialState: {
          factoryOverviewConfig: {
            timelinesIntervalEndTime: DateTime.fromISO('2021-01-08T00:00:00Z').toUTC(),
          },
        },
      });

      expect(wrapper.vm.isNextDisabled).toBe(false);
    });
  });

  describe('onPreviousClick', () => {
    it('calls updateTimelineIntervalEndTime with correct time if timelinesIntervalEndTime is set', async () => {
      const wrapper = createWrapper({
        routeName: 'timeline',
        initialState: {
          factoryOverviewConfig: {
            timelinesIntervalEndTime: DateTime.fromISO('2021-01-08T00:00:00Z').toUTC(),
          },
        },
      });

      const updateTimelineIntervalEndTime = vi.spyOn(wrapper.vm, 'updateTimelineIntervalEndTime');
      await wrapper.vm.onPreviousClick();
      expect(updateTimelineIntervalEndTime).toHaveBeenCalledWith(DateTime.fromISO('2021-01-07T16:00:00Z').toUTC());
    });

    it('calls updateTimelineIntervalEndTime with correct time if timelinesIntervalEndTime is not set', async () => {
      vi.setSystemTime(new Date('2021-01-10T00:00:00Z'));
      const wrapper = createWrapper({ routeName: 'timeline' });

      const updateTimelineIntervalEndTime = vi.spyOn(wrapper.vm, 'updateTimelineIntervalEndTime');
      await wrapper.vm.onPreviousClick();
      expect(updateTimelineIntervalEndTime).toHaveBeenCalledWith(DateTime.fromISO('2021-01-09T16:00:00Z').toUTC());
    });
  });

  describe('onNextClick', () => {
    beforeEach(() => {
      vi.setSystemTime(new Date('2021-01-10T00:00:00Z'));
    });
    it('calls updateTimelineIntervalEndTime with correct time if new end time is not in the future', async () => {
      const wrapper = createWrapper({
        routeName: 'timeline',
        initialState: {
          factoryOverviewConfig: {
            timelinesIntervalEndTime: DateTime.fromISO('2021-01-08T00:00:00Z').toUTC(),
          },
        },
      });

      const updateTimelineIntervalEndTime = vi.spyOn(wrapper.vm, 'updateTimelineIntervalEndTime');
      await wrapper.vm.onNextClick();
      expect(updateTimelineIntervalEndTime).toHaveBeenCalledWith(DateTime.fromISO('2021-01-08T08:00:00Z').toUTC());
    });

    it('calls updateTimelineIntervalEndTime with null', async () => {
      const wrapper = createWrapper({
        routeName: 'timeline',
        initialState: {
          factoryOverviewConfig: {
            timelinesIntervalEndTime: DateTime.fromISO('2021-01-09T23:00:00Z').toUTC(),
          },
        },
      });

      const updateTimelineIntervalEndTime = vi.spyOn(wrapper.vm, 'updateTimelineIntervalEndTime');
      await wrapper.vm.onNextClick();
      expect(updateTimelineIntervalEndTime).toHaveBeenCalledWith(null);
    });
  });

  test('that onCurrentClick calls updateTimelineIntervalEndTime with null', () => {
    const wrapper = createWrapper({ routeName: 'timeline' });

    const updateTimelineIntervalEndTimeSpy = vi.spyOn(wrapper.vm, 'updateTimelineIntervalEndTime');
    wrapper.vm.onCurrentClick();
    expect(updateTimelineIntervalEndTimeSpy).toHaveBeenCalledWith(null);
  });

  describe('onUnitTypeChange', () => {
    it('calls modifyUnitType with value if noSave prop is false', () => {
      const wrapper = createWrapper({
        props: { ...propsDefault, noSave: false },
        routeName: 'timeline',
      });

      const modifyUnitType = vi.spyOn(wrapper.vm, 'modifyUnitType');
      wrapper.vm.onUnitTypeChange('unit');
      expect(modifyUnitType).toHaveBeenCalledTimes(1);
      expect(modifyUnitType).toHaveBeenCalledWith('unit');
    });

    it('emits "update:unit-type" with value if noSave prop is true', () => {
      const wrapper = createWrapper({
        props: { ...propsDefault, noSave: true },
        routeName: 'timeline',
      });

      const modifyUnitType = vi.spyOn(wrapper.vm, 'modifyUnitType');
      wrapper.vm.onUnitTypeChange('unit');
      expect(wrapper.emitted('update:unit-prop')).toBeTruthy();
      expect(wrapper.emitted('update:unit-prop')[0][0]).toEqual('unit');
      expect(modifyUnitType).not.toHaveBeenCalled();
    });
  });

  it('has correct statusOptions', () => {
    const wrapper = createWrapper({ routeName: 'timeline' });

    expect(wrapper.vm.statusOptions).toEqual([
      { value: factoryOverviewStatuses.GOOD_PRODUCTION, text: 'goodproduction', color: 'lw-green' },
      { value: factoryOverviewStatuses.SLOW_PRODUCTION, text: 'Speed loss', color: 'lw-yellow' },
      { value: factoryOverviewStatuses.UNCOMMENTED_STOP, text: 'Uncommented', color: 'lw-red' },
      { value: factoryOverviewStatuses.UNPLANNED_STOP, text: 'Unplanned stops', color: 'lw-dark-red' },
      { value: factoryOverviewStatuses.TECHNICAL_STOP, text: 'Technical stops', color: 'lw-dark-red' },
      { value: factoryOverviewStatuses.PLANNED_STOP_INCL_OEE, text: 'Planned stops (incl. in OEE)', color: 'secondary-dark' },
      { value: factoryOverviewStatuses.PLANNED_STOP_EXCL_OEE, text: 'Planned stops (excl. from OEE)', color: 'lw-gray' },
      { value: factoryOverviewStatuses.NO_SHIFT, text: 'No active shift', color: 'black' },
    ]);
  });

  describe('onStatusFilterChange', () => {
    it('calls modifyStatusFilter with value if noSave prop is false', () => {
      const wrapper = createWrapper({
        props: { ...propsDefault, noSave: false },
        routeName: 'timeline',
      });

      const factoryOverviewConfigStore = useFactoryOverviewConfigStore();
      const modifyStatusFilter = vi.spyOn(factoryOverviewConfigStore, 'modifyStatusFilter');
      wrapper.vm.onStatusFilterChange([factoryOverviewStatuses.GOOD_PRODUCTION, 'speedLoss']);
      expect(modifyStatusFilter).toHaveBeenCalledTimes(1);
      expect(modifyStatusFilter).toHaveBeenCalledWith([factoryOverviewStatuses.GOOD_PRODUCTION, 'speedLoss']);
    });

    it('emits "update:status-prop" with value if noSave prop is true', () => {
      const wrapper = createWrapper({
        props: { ...propsDefault, noSave: true },
        routeName: 'timeline',
      });

      const modifyStatusFilter = vi.spyOn(wrapper.vm, 'modifyStatusFilter');
      wrapper.vm.onStatusFilterChange([factoryOverviewStatuses.GOOD_PRODUCTION, 'speedLoss']);
      expect(wrapper.emitted('update:status-prop')).toBeTruthy();
      expect(wrapper.emitted('update:status-prop')[0][0]).toEqual([factoryOverviewStatuses.GOOD_PRODUCTION, 'speedLoss']);
      expect(modifyStatusFilter).not.toHaveBeenCalled();
    });
  });
});
