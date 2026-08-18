import { shallowMount, flushPromises } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import index from './index.vue';

import { CUSTOM, TODAY } from '@/constants/predefinedTimePeriodNames';
import { requestWidgetViewTypes } from '@/constants/widgetViewTypes';
import statisticsApi from '@/api/statisticsApi';

vi.mock('@/api/statisticsApi');
statisticsApi.getPeriodScrapReasons = vi.fn();
statisticsApi.getPeriodDelays = vi.fn();
statisticsApi.getPeriodSpeedLosses = vi.fn();

const createWrapper = (options) => shallowMount(index, {
  global: {
    plugins: [
      createTestingPinia({
        createSpy: vi.fn,
        initialState: {
          station: {
            stations: [{ id: 12 }, { id: 13 }],
          },
        },
      }),
    ],
  },
  ...options,
});

const propsDefault = {
  i: 'string',
  widgetData: {
    stationId: [12, 13], factoryId: [1], entityIds: [102, 344], periodName: TODAY, top: 10, viewBy: 'reasons',
  },
  updateTrigger: 0,
  type: 'string',
  fetchTrigger: 0,
};

describe('DashboardHorizontalBarWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders', () => {
    const wrapper = createWrapper({
      props: { ...propsDefault },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly when loading', async () => {
    const wrapper = createWrapper({
      props: { ...propsDefault },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly when promises are flushed', async () => {
    const wrapper = createWrapper({
      props: { ...propsDefault },
    });

    await flushPromises();

    expect(wrapper.element).toMatchSnapshot();
  });

  it('calls statisticsApi.getPeriodScrapReasons and sets chartData correctly', async () => {
    // Arrange
    const mockResponse = [
      {
        value: 100,
        comparison: 80,
        valueLabel: 'Label1',
        color: '#ff0000',
        productionUnit: 'kg',
        producedPct: 0.5,
        comparisonProducedPct: 0.4,
      },
      {
        value: 200,
        comparison: 150,
        valueLabel: 'Label2',
        color: '#00ff00',
        productionUnit: '',
        producedPct: null,
        comparisonProducedPct: null,
      },
    ];
    statisticsApi.getPeriodScrapReasons.mockResolvedValueOnce(mockResponse);

    const wrapper = createWrapper({
      props: { ...propsDefault },
    });

    // Act
    // Call the method directly if possible, otherwise trigger the fetch
    const { vm } = wrapper;
    if (typeof vm.fetchPeriodScrapReasons === 'function') {
      await vm.fetchPeriodScrapReasons();
    } else {
      // fallback: trigger whatever causes fetchPeriodScrapReasons to run
      await flushPromises();
    }

    // Assert
    expect(statisticsApi.getPeriodScrapReasons).toHaveBeenCalled();
    expect(Array.isArray(vm.chartData)).toBe(true);
    expect(vm.chartData.length).toBe(2);

    // Check structure of first chartData item
    const item = vm.chartData[0];
    expect(item).toHaveProperty('value');
    expect(item).toHaveProperty('measure');
    expect(item).toHaveProperty('measureLabel');
    expect(item).toHaveProperty('color');
    expect(item).toHaveProperty('tooltipDotColor');
    expect(item).toHaveProperty('tooltipDotLabel');
    expect(item).toHaveProperty('tooltipSecondaryAppend');
    expect(item).toHaveProperty('tooltipValue');
    expect(item).toHaveProperty('comparison');
    expect(item).toHaveProperty('tooltipFormattedTimeComparison');
    expect(item).toHaveProperty('tooltipPercentageChange');
    expect(item).toHaveProperty('tooltipPtcOfTotal');
    expect(item).toHaveProperty('tooltipPlannedPctPercentageChange');
  });

  it('handles empty response from statisticsApi.getPeriodScrapReasons', async () => {
    statisticsApi.getPeriodScrapReasons.mockResolvedValueOnce([]);
    const wrapper = createWrapper({
      props: { ...propsDefault },
    });

    const { vm } = wrapper;
    if (typeof vm.fetchPeriodScrapReasons === 'function') {
      await vm.fetchPeriodScrapReasons();
    } else {
      await flushPromises();
    }

    expect(statisticsApi.getPeriodScrapReasons).toHaveBeenCalled();
    expect(Array.isArray(vm.chartData)).toBe(true);
    expect(vm.chartData.length).toBe(0);
  });

  it('formatUnitQuantity returns value with unit when unit is a single character', () => {
    const wrapper = createWrapper({
      props: { ...propsDefault },
    });
    const { vm } = wrapper;

    expect(vm.formatUnitQuantity(123, 'g')).toBe('123 g');
    expect(vm.formatUnitQuantity(456, 'h')).toBe('456 h');
  });

  it('formatUnitQuantity returns value without unit when unit is empty or longer than 1 character', () => {
    const wrapper = createWrapper({
      props: { ...propsDefault },
    });
    const { vm } = wrapper;

    expect(vm.formatUnitQuantity(123, '')).toBe('123');
    expect(vm.formatUnitQuantity(123, null)).toBe('123');
    expect(vm.formatUnitQuantity(123, undefined)).toBe('123');
    expect(vm.formatUnitQuantity(123, 'kg')).toBe('123');
    expect(vm.formatUnitQuantity(123, 'unit')).toBe('123');
  });

  describe('requestParams', () => {
    it('returns correct params if periodName is CUSTOM', () => {
      const wrapper = createWrapper({
        props: {
          ...propsDefault,
          widgetData: {
            ...propsDefault.widgetData,
            periodName: CUSTOM,
            range: { start: '2023-01-01', end: '2023-01-31' },
          },
        },
      });

      expect(wrapper.vm.requestParams).toEqual({
        factoryIds: wrapper.vm.widgetData.factoryId,
        stationIds: wrapper.vm.widgetData.stationId.filter(
          (id) => !!wrapper.vm.stationsMap[id],
        ),
        entityIds: wrapper.vm.widgetData.entityIds,
        periodName: wrapper.vm.widgetData.periodName,
        top: wrapper.vm.widgetData.top,
        comparisonMode: wrapper.vm.comparisonMode,
        groupBy: requestWidgetViewTypes[wrapper.vm.widgetData.viewBy],
        useAlternativeUnit: wrapper.vm.widgetData.useAlternativeUnit,
        range: wrapper.vm.widgetData.range,
      });
    });

    it('returns correct params if periodName is today', () => {
      const wrapper = createWrapper({
        props: {
          ...propsDefault,
          widgetData: {
            ...propsDefault.widgetData,
            periodName: TODAY,
          },
        },
      });

      expect(wrapper.vm.requestParams).toEqual({
        factoryIds: wrapper.vm.widgetData.factoryId,
        stationIds: wrapper.vm.widgetData.stationId.filter(
          (id) => !!wrapper.vm.stationsMap[id],
        ),
        entityIds: wrapper.vm.widgetData.entityIds,
        periodName: wrapper.vm.widgetData.periodName,
        top: wrapper.vm.widgetData.top,
        comparisonMode: wrapper.vm.comparisonMode,
        groupBy: requestWidgetViewTypes[wrapper.vm.widgetData.viewBy],
        useAlternativeUnit: wrapper.vm.widgetData.useAlternativeUnit,
      });
    });
  });
});
