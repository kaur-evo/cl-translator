import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import index from './index.vue';

import { useFactoryStore, useCustomReportStore, useStationStore, useProfileStore } from '@/stores';
import { LAST_QUARTER, THIS_QUARTER } from '@/constants/predefinedTimePeriodNames';

const defaultStations = [
  { id: 11, name: 'Station1', factoryId: 1 },
  { id: 12, name: 'Station2', factoryId: 1 },
];

const defaultFactories = [{ id: 1, name: 'Factory1' }];

const defaultPiniaState = {
  genericDialog: {
    dialogData: { name: 'Report name' },
  },
  filterbar: {
    requestFilterState: { stationId: [1] },
  },
};

const applyFactoryGetters = (pinia, { factories = defaultFactories, hasMultipleFactories = false } = {}) => {
  const factoryStore = useFactoryStore(pinia);
  factoryStore.factories = factories;
  factoryStore.hasMultipleFactories = hasMultipleFactories;
};

const applyCustomReportGetters = (pinia, customReportsLoading = {}) => {
  useCustomReportStore(pinia).customReportsLoading = customReportsLoading;
};

const applyStationGetters = (pinia, { stations = defaultStations } = {}) => {
  const stationStore = useStationStore(pinia);
  stationStore.stations = stations;
  stationStore.stationsMap = stations.reduce((acc, station) => {
    acc[station.id] = station;
    return acc;
  }, {});
};

const applyProfileGetters = (pinia) => {
  useProfileStore(pinia).firstDayOfWeek = 0;
};

const createPinia = ({
  initialOverrides = {},
  factoryOverrides = {},
  stationOverrides = {},
} = {}) => {
  const pinia = createTestingPinia({
    createSpy: vi.fn,
    stubActions: true,
    initialState: {
      ...defaultPiniaState,
      ...initialOverrides,
    },
  });
  applyFactoryGetters(pinia, factoryOverrides);
  applyCustomReportGetters(pinia);
  applyStationGetters(pinia, stationOverrides);
  applyProfileGetters(pinia);
  return pinia;
};

const createWrapper = (options = {}, piniaOptions = {}) => shallowMount(index, {
  global: { plugins: [createPinia(piniaOptions)] },
  ...options,
});

const propsDefault = {};

describe('CustomReportDownloadDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders', () => {
    const wrapper = createWrapper({
      props: { ...propsDefault },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly', () => {
    const wrapper = createWrapper({
      props: { ...propsDefault },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  test('that exportCustomReport is called', async () => {
    const pinia = createPinia();
    const customReportStore = useCustomReportStore(pinia);
    const wrapper = shallowMount(index, {
      props: { ...propsDefault },
      global: { plugins: [pinia] },
    });

    await wrapper.setData({ formData: { dateRange: ['2020-01-01', '2020-01-07'], factoryId: [1], stationId: [12] } });
    wrapper.vm.downloadReport();
    expect(customReportStore.exportCustomReport).toHaveBeenCalledTimes(1);
    expect(customReportStore.exportCustomReport).toHaveBeenCalledWith({
      reportName: 'Report name', params: { startTime: '2020-01-01', endTime: '2020-01-07', stationId: [12] },
    });
  });

  it('takes factoryIds from requestFilterState if provided', () => {
    const wrapper = createWrapper(
      { props: { ...propsDefault } },
      {
        initialOverrides: {
          filterbar: { requestFilterState: { factoryId: [1] } },
        },
      },
    );

    expect(wrapper.vm.formData.factoryId).toEqual([1]);
  });

  it('leaves factoryIds empty if requestFilterState doesnt include factories', () => {
    const wrapper = createWrapper(
      { props: { ...propsDefault } },
      {
        initialOverrides: {
          filterbar: { requestFilterState: { stationId: [1] } },
        },
      },
    );

    expect(wrapper.vm.formData.factoryId).toEqual([]);
  });

  test('that filteredStations has all stations if just one factory is available', () => {
    const wrapper = createWrapper({ props: { ...propsDefault } });

    expect(wrapper.vm.filteredStations).toEqual(defaultStations);
  });

  test('that filteredStations shows stations only for selected factory', () => {
    const allStations = [
      { id: 11, name: 'Station1', factoryId: 1 },
      { id: 12, name: 'Station2', factoryId: 1 },
      { id: 21, name: 'Station3', factoryId: 2 },
    ];
    const wrapper = createWrapper(
      { props: { ...propsDefault } },
      {
        factoryOverrides: {
          factories: [{ id: 1, name: 'Factory1' }, { id: 2, name: 'Factory2' }],
          hasMultipleFactories: true,
        },
        stationOverrides: { stations: allStations },
      },
    );

    expect(wrapper.vm.filteredStations).toEqual(allStations);
    wrapper.setData({ formData: { factoryId: [2] } });
    expect(wrapper.vm.filteredStations).toEqual(allStations.filter((station) => station.factoryId === 2));
  });

  describe('setDefaultDateByFilterVal', () => {
    vi.setSystemTime(new Date('2020-10-01T12:34:33'));

    beforeEach(() => {
      vi.clearAllMocks();
    });

    test('that if filter value is string but the period is invalid, then form data date range is set as null and selection type is equal to that invalid period', () => {
      const wrapper = createWrapper({
        props: { ...propsDefault },
      });

      wrapper.vm.setDefaultDateByFilterVal('invalidPeriod');
      expect(wrapper.vm.formData.selectionType).toEqual('invalidPeriod');
      expect(wrapper.vm.formData.dateRange).toEqual(null);
    });

    test('that if filter value is LAST_QUARTER, then form data date range is set and selection type is LAST_QUARTER', () => {
      const wrapper = createWrapper({
        props: { ...propsDefault },
      });

      wrapper.vm.setDefaultDateByFilterVal(LAST_QUARTER);
      expect(wrapper.vm.formData.dateRange).toEqual(['2020-07-01', '2020-09-30']);
      expect(wrapper.vm.formData.selectionType).toEqual(LAST_QUARTER);
    });

    test('that if filter value is THIS_QUARTER, then form data date range is set and selection type is THIS_QUARTER', () => {
      const wrapper = createWrapper({
        props: { ...propsDefault },
      });

      wrapper.vm.setDefaultDateByFilterVal(THIS_QUARTER);
      expect(wrapper.vm.formData.dateRange).toEqual(['2020-10-01', '2020-12-31']);
      expect(wrapper.vm.formData.selectionType).toEqual(THIS_QUARTER);
    });

    test('that if filter value is array, then form data date range is set and selection type is custom', () => {
      const wrapper = createWrapper({
        props: { ...propsDefault },
      });

      wrapper.vm.setDefaultDateByFilterVal(['2020-01-01', '2020-01-07']);
      expect(wrapper.vm.formData.dateRange).toEqual(['2020-01-01', '2020-01-07']);
      expect(wrapper.vm.formData.selectionType).toEqual('custom');
    });
  });

  describe('hasDateRange computed', () => {
    it('returns dialogData.dateRange if it is defined (true)', () => {
      const wrapper = createWrapper(
        { props: { ...propsDefault } },
        { initialOverrides: { genericDialog: { dialogData: { dateRangeEnabled: true } } } },
      );
      expect(wrapper.vm.hasDateRange).toBe(true);
    });

    it('returns dialogData.dateRange if it is defined (false)', () => {
      const wrapper = createWrapper(
        { props: { ...propsDefault } },
        { initialOverrides: { genericDialog: { dialogData: { dateRangeEnabled: false } } } },
      );
      expect(wrapper.vm.hasDateRange).toBe(false);
    });

    it('returns true if dialogData.dateRange is undefined', () => {
      const wrapper = createWrapper(
        { props: { ...propsDefault } },
        { initialOverrides: { genericDialog: { dialogData: { dateRangeEnabled: undefined } } } },
      );
      expect(wrapper.vm.hasDateRange).toBe(true);
    });
  });

  describe('isSingleStation computed', () => {
    it('returns dialogData.isSingleStation if it is defined (true)', () => {
      const wrapper = createWrapper(
        { props: { ...propsDefault } },
        { initialOverrides: { genericDialog: { dialogData: { singleStation: true } } } },
      );
      expect(wrapper.vm.isSingleStation).toBe(true);
    });

    it('returns dialogData.isSingleStation if it is defined (false)', () => {
      const wrapper = createWrapper(
        { props: { ...propsDefault } },
        { initialOverrides: { genericDialog: { dialogData: { singleStation: false } } } },
      );
      expect(wrapper.vm.isSingleStation).toBe(false);
    });

    it('returns false if dialogData.isSingleStation is undefined', () => {
      const wrapper = createWrapper(
        { props: { ...propsDefault } },
        { initialOverrides: { genericDialog: { dialogData: { singleStation: undefined } } } },
      );
      expect(wrapper.vm.isSingleStation).toBe(false);
    });
  });
});
