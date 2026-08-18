import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { nextTick } from 'vue';

import index from './index.vue';

import statisticsApi from '@/api/statisticsApi';
import predefinedTimePeriodNames from '@/constants/predefinedTimePeriodNames';
import colorConstants from '@/constants/colorConstants';
import graphColors from '@/constants/graphColors';


vi.mock('@/api/statisticsApi');
statisticsApi.getOeeWidgetData = vi.fn();

const createWrapper = (options) => shallowMount(index, {
  global: {
    plugins: [
      createTestingPinia({
        createSpy: vi.fn,
        initialState: {
          station: {
            stations: [],
          },
          profile: {
            dateFormat: { long: 'dd.MM.yyyy', short: 'dd.MM' },
            firstDayOfWeek: 1,
          },
          configuration: {
            configuration: { includeNoDataDatapoints: true },
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
    type: 'oeechart', measure: [], stationId: [], periodName: 'yesterday',
  },
  updateTrigger: 0,
  type: 'string',
  fetchTrigger: 0,
};

describe('DashboardOeeBarWidget', () => {
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

  it('renders correctly when loading', async () => {
    const wrapper = createWrapper({
      props: { ...propsDefault },
    });

    await wrapper.setData({ loading: true });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly with data', async () => {
    const wrapper = createWrapper({
      props: { ...propsDefault },
    });

    await wrapper.setData({ loading: false });
    await wrapper.setData({
      rawChartData: [
        {
          comparison: 10,
          comparisonDate: '2024-11-19',
          date: '2024-11-20',
          value: 20,
          unitId: ['pcs'],
          alternativeUnitId: ['kg'],
        },
      ],
    });

    await nextTick();
    expect(wrapper.element).toMatchSnapshot();
  });

  test('that formattedComparison returns % change if measure is oee', () => {
    const wrapper = createWrapper({
      props: { ...propsDefault, measure: 'oee' },
    });

    const formattedComparison = wrapper.vm.formattedComparison(89, 67);
    expect(formattedComparison).toBe('+22%');
  });

  test('that formattedCompoarison returns change if measure is scrap', () => {
    const wrapper = createWrapper({
      props: { ...propsDefault, measure: 'scrap' },
    });

    const formattedComparison = wrapper.vm.formattedComparison(1234, 1218);
    expect(formattedComparison).toBe('+16');
  });

  test('that getTextColor returns text-error if measure is scrapqty and diff is positive', () => {
    const wrapper = createWrapper({
      props: { ...propsDefault, measure: 'scrapqty' },
    });

    const textColor = wrapper.vm.getTextColor(22);
    expect(textColor).toBe('text-error');
  });

  test('that getTextColor returns text-success if measure is scrapqty and diff is negative', () => {
    const wrapper = createWrapper({
      props: { ...propsDefault, measure: 'scrapqty' },
    });

    const textColor = wrapper.vm.getTextColor(-22);
    expect(textColor).toBe('text-primary');
  });

  test('that getTextColor returns text-error if measure is oee and diff is negative', () => {
    const wrapper = createWrapper({
      props: { ...propsDefault, measure: 'oee' },
    });

    const textColor = wrapper.vm.getTextColor(-22);
    expect(textColor).toBe('text-error');
  });

  test('that getTextColor returns text-success if measure is oee and diff is positive', () => {
    const wrapper = createWrapper({
      props: { ...propsDefault, measure: 'oee' },
    });

    const textColor = wrapper.vm.getTextColor(22);
    expect(textColor).toBe('text-primary');
  });

  describe('xAxisLabel', () => {
    it('returns Shift if granularity is shift', () => {
      const wrapper = createWrapper({
        props: { ...propsDefault },
      });

      wrapper.vm.granularity = 'shift';
      expect(wrapper.vm.xAxisLabel).toBe('Shift');
    });

    it('returns Week if granularity is weekofyear', () => {
      const wrapper = createWrapper({
        props: { ...propsDefault },
      });

      wrapper.vm.granularity = 'weekofyear';
      expect(wrapper.vm.xAxisLabel).toBe('Week');
    });

    it('returns Month if granularity is month', () => {
      const wrapper = createWrapper({
        props: { ...propsDefault },
      });

      wrapper.vm.granularity = 'month';
      expect(wrapper.vm.xAxisLabel).toBe('Month');
    });

    it('returns Year if granularity is year', () => {
      const wrapper = createWrapper({
        props: { ...propsDefault },
      });

      wrapper.vm.granularity = 'year';
      expect(wrapper.vm.xAxisLabel).toBe('year');
    });

    it('returns Day if granularity is date', () => {
      const wrapper = createWrapper({
        props: { ...propsDefault },
      });

      wrapper.vm.granularity = 'date';
      expect(wrapper.vm.xAxisLabel).toBe('Day');
    });
  });

  describe('areaHighlightsEnabled', () => {
    it('returns true if granularity is date', () => {
      const wrapper = createWrapper({
        props: { ...propsDefault },
      });

      wrapper.vm.granularity = 'date';
      expect(wrapper.vm.areaHighlightsEnabled).toBe(true);
    });

    it('returns false if granularity is month', () => {
      const wrapper = createWrapper({
        props: { ...propsDefault },
      });

      wrapper.vm.granularity = 'month';
      expect(wrapper.vm.areaHighlightsEnabled).toBe(false);
    });
  });

  describe('needsDateFilling', () => {
    const resultMap = {
      TODAY: false,
      YESTERDAY: false,
      THIS_WEEK: true,
      LAST_WEEK: true,
      ROLLING_7_DAYS: true,
      THIS_MONTH: true,
      LAST_MONTH: true,
      ROLLING_30_DAYS: true,
      THIS_YEAR: true,
      ROLLING_12_MONTHS: true,
      LAST_YEAR: true,
      ROLLING_7_SHIFTS: false,
      PREVIOUS_PRODUCTION_DAY: false,
      ONGOING_SHIFT: false,
      PREVIOUS_SHIFT: false,
      THIS_QUARTER: false,
      LAST_QUARTER: false,
      LAST_4_QUARTERS: false,
    };
    Object.entries(resultMap).forEach(([key, value]) => {
      it(`returns ${value} for ${predefinedTimePeriodNames[key]}`, async () => {
        const wrapper = createWrapper({
          props: { ...propsDefault, measure: 'oee', widgetData: { periodName: predefinedTimePeriodNames[key] } },
        });

        expect(wrapper.vm.needsDateFilling).toBe(value);
      });
    });
  });

  describe('periodDateArray', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2025-06-18'));
    });
    afterEach(() => {
      vi.useRealTimers();
    });

    it('returns empty array for TODAY', () => {
      const wrapper = createWrapper({
        props: { ...propsDefault, widgetData: { periodName: predefinedTimePeriodNames.TODAY } },
      });

      expect(wrapper.vm.periodDateArray).toEqual([]);
    });

    it('returns correct result for day granularity', () => {
      const wrapper = createWrapper({
        props: { ...propsDefault, widgetData: { periodName: predefinedTimePeriodNames.THIS_WEEK } },
      });

      expect(wrapper.vm.periodDateArray).toEqual(['2025-06-16', '2025-06-17', '2025-06-18', '2025-06-19', '2025-06-20', '2025-06-21', '2025-06-22']);
    });

    it('returns correct result for month granularity', () => {
      const wrapper = createWrapper({
        props: { ...propsDefault, widgetData: { periodName: predefinedTimePeriodNames.THIS_YEAR } },
      });
      expect(wrapper.vm.periodDateArray).toEqual(
        ['2025-01-01', '2025-02-01', '2025-03-01', '2025-04-01', '2025-05-01', '2025-06-01', '2025-07-01', '2025-08-01', '2025-09-01', '2025-10-01', '2025-11-01', '2025-12-01'],
      );
    });
  });

  describe('rawDataInclNoShiftDays', () => {
    afterEach(() => {
      vi.useRealTimers();
    });
    it('returns rawChartData if period does not need date filling', () => {
      const wrapper = createWrapper({
        props: { ...propsDefault, widgetData: { measure: 'qty', periodName: predefinedTimePeriodNames.ONGOING_SHIFT } },
      });

      wrapper.setData({
        rawChartData: [
          {
            date: '2024-11-20', value: 20, comparison: 10, comparisonDate: '2024-11-19',
          },
          {
            date: '2024-11-21', value: 30, comparison: 20, comparisonDate: '2024-11-20',
          },
        ],
      });

      expect(wrapper.vm.rawDataInclNoShiftDays).toEqual(wrapper.vm.rawChartData);
    });

    it('returns rawChartData when rawChartData is empty', () => {
      const wrapper = createWrapper({
        props: { ...propsDefault, widgetData: { measure: 'qty', periodName: predefinedTimePeriodNames.ONGOING_SHIFT } },
      });

      wrapper.setData({ rawChartData: [] });

      expect(wrapper.vm.rawDataInclNoShiftDays).toEqual(wrapper.vm.rawChartData);
    });

    it('returns rawChartData when it already has all dates', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-11-19'));
      const wrapper = createWrapper({
        props: { ...propsDefault, widgetData: { measure: 'qty', periodName: predefinedTimePeriodNames.THIS_WEEK } },
      });

      wrapper.setData({
        rawChartData: [
          {
            date: '2024-11-18', value: 20, comparison: 10, comparisonDate: '2024-11-17',
          },
          {
            date: '2024-11-19', value: 30, comparison: 20, comparisonDate: '2024-11-18',
          },
          {
            date: '2024-11-20', value: 40, comparison: 30, comparisonDate: '2024-11-19',
          },
          {
            date: '2024-11-21', value: 50, comparison: 40, comparisonDate: '2024-11-20',
          },
          {
            date: '2024-11-22', value: 60, comparison: 50, comparisonDate: '2024-11-21',
          },
          {
            date: '2024-11-23', value: 70, comparison: 60, comparisonDate: '2024-11-22',
          },
          {
            date: '2024-11-24', value: 80, comparison: 70, comparisonDate: '2024-11-23',
          },
        ],
      });

      expect(wrapper.vm.rawDataInclNoShiftDays).toEqual(wrapper.vm.rawChartData);
    });

    it('fills missing dates with empty values when needed', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-11-19'));
      const wrapper = createWrapper({
        props: { ...propsDefault, widgetData: { measure: 'qty', periodName: predefinedTimePeriodNames.THIS_WEEK } },
      });

      wrapper.setData({
        rawChartData: [
          {
            date: '2024-11-18', value: 20, comparison: 10, comparisonDate: '2024-11-17',
          },
          {
            date: '2024-11-20', value: 40, comparison: 30, comparisonDate: '2024-11-19',
          },
          {
            date: '2024-11-21', value: 50, comparison: 40, comparisonDate: '2024-11-20',
          },
          {
            date: '2024-11-23', value: 70, comparison: 60, comparisonDate: '2024-11-22',
          },
          {
            date: '2024-11-24', value: 80, comparison: 70, comparisonDate: '2024-11-23',
          },
        ],
      });

      expect(wrapper.vm.rawDataInclNoShiftDays).toEqual([
        {
          date: '2024-11-18', value: 20, comparison: 10, comparisonDate: '2024-11-17',
        },
        {
          date: '2024-11-19', value: null, comparison: null, comparisonDate: null,
        },
        {
          date: '2024-11-20', value: 40, comparison: 30, comparisonDate: '2024-11-19',
        },
        {
          date: '2024-11-21', value: 50, comparison: 40, comparisonDate: '2024-11-20',
        },
        {
          date: '2024-11-22', value: null, comparison: null, comparisonDate: null,
        },
        {
          date: '2024-11-23', value: 70, comparison: 60, comparisonDate: '2024-11-22',
        },
        {
          date: '2024-11-24', value: 80, comparison: 70, comparisonDate: '2024-11-23',
        },
      ]);
    });
  });

  describe('isIncludedInTrendline', () => {
    const expectedResult = {
      qty: {
        null: false,
        0: false,
        1: true,
        2: true,
      },
      goodqty: {
        null: false,
        0: false,
        1: true,
        2: true,
      },
      scrapqty: {
        null: false,
        0: false,
        1: false,
        2: true,
      },
      oee: {
        null: false,
        0: false,
        1: true,
        2: true,
      },
      quality: {
        null: false,
        0: false,
        1: false,
        2: true,
      },
      performance: {
        null: false,
        0: false,
        1: false,
        2: true,
      },
      availability: {
        null: false,
        0: false,
        1: true,
        2: true,
      },
      technicalavailability: {
        null: false,
        0: false,
        1: true,
        2: true,
      },
    };

    const wrapper = createWrapper({
      props: { ...propsDefault },
    });

    Object.entries(expectedResult).forEach(([measure, values]) => {
      Object.entries(values).forEach(([value, result]) => {
        it(`returns ${result} for measure ${measure} and shiftproductiontype ${value}`, async () => {
          expect(wrapper.vm.isIncludedInTrendline(measure, Number(value))).toBe(result);
        });
      });
    });
  });

  describe('getDatapointUnitSuffix', () => {
    let wrapper;

    it('returns empty string if isPercentage is true', () => {
      wrapper = createWrapper({
        props: { ...propsDefault, measure: 'oee', widgetData: { ...propsDefault.widgetData, measure: 'oee' } },
      });
      const d = { unitId: ['pcs'], alternativeUnitId: ['kg'] };
      const result = wrapper.vm.getDatapointUnitSuffix(d);
      expect(result).toBe('');
      expect(wrapper.vm.productionUnitsInUse.size).toBe(0);
    });

    it('returns alternative unit if measure is alt unit and alternativeUnitId has one value', () => {
      wrapper = createWrapper({
        props: { ...propsDefault, measure: 'altqty', widgetData: { ...propsDefault.widgetData, measure: 'altqty' } },
      });

      const d = { alternativeUnitId: ['kg'] };
      const result = wrapper.vm.getDatapointUnitSuffix(d);
      expect(result).toBe(' kg');
      expect(wrapper.vm.productionUnitsInUse.has('kg')).toBe(true);
    });

    it('returns empty string if measure is alt unit but alternativeUnitId is missing', () => {
      wrapper = createWrapper({
        props: { ...propsDefault, measure: 'altqty', widgetData: { ...propsDefault.widgetData, measure: 'oealtqtye' } },
      });
      wrapper.vm.isMeasureAltUnit = vi.fn(() => true);
      wrapper.vm.widgetData.measure = 'altqty';
      const d = {};
      const result = wrapper.vm.getDatapointUnitSuffix(d);
      expect(result).toBe('');
      expect(wrapper.vm.productionUnitsInUse.size).toBe(0);
    });

    it('returns empty string if measure is alt unit but alternativeUnitId has more than one value', () => {
      wrapper = createWrapper({
        props: { ...propsDefault, measure: 'altqty', widgetData: { ...propsDefault.widgetData, measure: 'altqty' } },
      });
      wrapper.vm.isMeasureAltUnit = vi.fn(() => true);
      wrapper.vm.widgetData.measure = 'altqty';
      const d = { alternativeUnitId: ['kg', 'g'] };
      const result = wrapper.vm.getDatapointUnitSuffix(d);
      expect(result).toBe('');
      expect(wrapper.vm.productionUnitsInUse.size).toBe(0);
    });

    it('returns empty string if not alt unit and unitId is missing', () => {
      wrapper.vm.isPercentage = false;
      wrapper.vm.isMeasureAltUnit = vi.fn(() => false);
      wrapper.vm.widgetData.measure = 'oee';
      const d = {};
      const result = wrapper.vm.getDatapointUnitSuffix(d);
      expect(result).toBe('');
      expect(wrapper.vm.productionUnitsInUse.size).toBe(0);
    });

    it('returns empty string if not alt unit and unitId has more than one value', () => {
      wrapper.vm.isPercentage = false;
      wrapper.vm.isMeasureAltUnit = vi.fn(() => false);
      wrapper.vm.widgetData.measure = 'oee';
      const d = { unitId: ['pcs', 'kg'] };
      const result = wrapper.vm.getDatapointUnitSuffix(d);
      expect(result).toBe('');
      expect(wrapper.vm.productionUnitsInUse.size).toBe(0);
    });

    it('does not add null or undefined to productionUnitsInUse', () => {
      wrapper.vm.isPercentage = false;
      wrapper.vm.isMeasureAltUnit = vi.fn(() => false);
      wrapper.vm.widgetData.measure = 'oee';
      const d = { unitId: [null] };
      const result = wrapper.vm.getDatapointUnitSuffix(d);
      expect(result).toBe('');
      expect(wrapper.vm.productionUnitsInUse.size).toBe(0);
    });
  });

  describe('getShiftGranularityMap', () => {
    let wrapper;
    beforeEach(() => {
      wrapper = createWrapper({
        props: { ...propsDefault, measure: 'oee', widgetData: { ...propsDefault.widgetData, measure: 'oee' } },
      });
      // Mock methods used inside getShiftGranularityMap
      wrapper.vm.getBarColor = vi.fn().mockReturnValue('blue');
      wrapper.vm.aboveTargetColor = 'green';
      wrapper.vm.formatTooltipValue = vi.fn((v) => v);
      wrapper.vm.getDatapointUnitSuffix = vi.fn(() => ' pcs');
    });

    it('maps shift data correctly for a weekday', () => {
      const d = {
        shiftName: 'Morning',
        date: '2024-06-19', // Wednesday
        comparison: 5,
        value: 10,
        shiftproductiontype: 1,
      };
      const result = wrapper.vm.getShiftGranularityMap(d, 1);
      expect(result).toEqual({
        measure: 1,
        measureLabel: 'Morning',
        measureTooltipLabel: expect.stringContaining('Morning'),
        comparison: 5,
        value: 10,
        color: 'blue',
        activeColor: graphColors['above-target-oee'],
        tooltipPrimaryValue: '10 pcs',
        isAreaHighlighted: false,
        unitSuffix: ' pcs',
        shiftproductiontype: 1,
      });
      expect(wrapper.vm.getBarColor).toHaveBeenCalledWith(10);
      expect(wrapper.vm.formatTooltipValue).toHaveBeenCalledWith(10);
      expect(wrapper.vm.getDatapointUnitSuffix).toHaveBeenCalledWith(d);
    });

    it('maps shift data correctly for a Sunday', () => {
      const d = {
        shiftName: 'Night',
        date: '2024-06-23', // Sunday
        comparison: 2,
        value: 0,
        shiftproductiontype: 0,
      };
      const result = wrapper.vm.getShiftGranularityMap(d, 0);
      expect(result).toEqual({
        measure: 0,
        measureLabel: 'Night',
        measureTooltipLabel: expect.stringContaining('Night'),
        comparison: 2,
        value: 0,
        color: 'blue',
        activeColor: graphColors['above-target-oee'],
        tooltipPrimaryValue: '0 pcs',
        isAreaHighlighted: true,
        unitSuffix: ' pcs',
        shiftproductiontype: 0,
      });
      expect(result.isAreaHighlighted).toBe(true);
      expect(result.measureLabel).toBe('Night');
      expect(result.measure).toBe(0);
    });
  });

  describe('isShiftGranularity', () => {
    let wrapper;
    beforeEach(() => {
      wrapper = createWrapper({
        props: { ...propsDefault, measure: 'oee', widgetData: { ...propsDefault.widgetData, measure: 'oee' } },
      });
    });

    it('returns true for ROLLING_7_SHIFTS', () => {
      const result = wrapper.vm.isShiftGranularity(predefinedTimePeriodNames.ROLLING_7_SHIFTS);
      expect(result).toBe(true);
    });

    it('returns false for TODAY', () => {
      const result = wrapper.vm.isShiftGranularity(predefinedTimePeriodNames.TODAY);
      expect(result).toBe(false);
    });

    it('returns false for LAST_YEAR', () => {
      const result = wrapper.vm.isShiftGranularity(predefinedTimePeriodNames.LAST_YEAR);
      expect(result).toBe(false);
    });

    it('returns false for THIS_MONTH', () => {
      const result = wrapper.vm.isShiftGranularity(predefinedTimePeriodNames.THIS_MONTH);
      expect(result).toBe(false);
    });

    it('returns false for undefined periodName', () => {
      const result = wrapper.vm.isShiftGranularity(undefined);
      expect(result).toBe(false);
    });
  });

  describe('onRawChartDataChange', () => {
    let wrapper;
    beforeEach(() => {
      wrapper = createWrapper({
        props: { ...propsDefault, measure: 'oee', widgetData: { ...propsDefault.widgetData, measure: 'oee' } },
      });
      wrapper.vm.getShiftGranularityMap = vi.fn((d, i) => ({ ...d, mapped: true, index: i }));
      wrapper.vm.getDateGranularityMap = vi.fn((d, i) => ({ ...d, mapped: true, index: i }));
      wrapper.vm.updateProductionUnitsInUse = vi.fn();
    });

    it('updates chartData with shift granularity mapping when periodName is shift granularity', () => {
      wrapper.vm.isShiftGranularity = vi.fn(() => true);
      const newVal = [
        { date: '2024-06-19', value: 10 },
        { date: '2024-06-20', value: 20 },
      ];

      wrapper.vm.onRawChartDataChange(newVal);

      expect(wrapper.vm.chartData).toEqual([
        {
          date: '2024-06-19', value: 10, mapped: true, index: 0,
        },
        {
          date: '2024-06-20', value: 20, mapped: true, index: 1,
        },
      ]);
      expect(wrapper.vm.getShiftGranularityMap).toHaveBeenCalledTimes(2);
      expect(wrapper.vm.getDateGranularityMap).not.toHaveBeenCalled();
      expect(wrapper.vm.updateProductionUnitsInUse).not.toHaveBeenCalled();
    });

    it('updates chartData with date granularity mapping when periodName is not shift granularity', () => {
      wrapper.vm.isShiftGranularity = vi.fn(() => false);
      const newVal = [
        { date: '2024-06-19', value: 10 },
        { date: '2024-06-20', value: 20 },
      ];

      wrapper.vm.onRawChartDataChange(newVal);

      expect(wrapper.vm.chartData).toEqual([
        {
          date: '2024-06-19', value: 10, mapped: true, index: 0,
        },
        {
          date: '2024-06-20', value: 20, mapped: true, index: 1,
        },
      ]);
      expect(wrapper.vm.getDateGranularityMap).toHaveBeenCalledTimes(2);
      expect(wrapper.vm.getShiftGranularityMap).not.toHaveBeenCalled();
      expect(wrapper.vm.updateProductionUnitsInUse).toHaveBeenCalledTimes(2);
    });

    it('handles empty newVal gracefully', () => {
      wrapper.vm.isShiftGranularity = vi.fn(() => false);
      const newVal = [];

      wrapper.vm.onRawChartDataChange(newVal);

      expect(wrapper.vm.chartData).toEqual([]);
      expect(wrapper.vm.getDateGranularityMap).not.toHaveBeenCalled();
      expect(wrapper.vm.getShiftGranularityMap).not.toHaveBeenCalled();
      expect(wrapper.vm.updateProductionUnitsInUse).not.toHaveBeenCalled();
    });

    it('calls updateProductionUnitsInUse for each data point when not shift granularity', () => {
      wrapper.vm.isShiftGranularity = vi.fn(() => false);
      const newVal = [
        { date: '2024-06-19', value: 10 },
        { date: '2024-06-20', value: 20 },
      ];

      wrapper.vm.onRawChartDataChange(newVal);

      expect(wrapper.vm.updateProductionUnitsInUse).toHaveBeenCalledTimes(2);
      expect(wrapper.vm.updateProductionUnitsInUse).toHaveBeenCalledWith(newVal[0]);
      expect(wrapper.vm.updateProductionUnitsInUse).toHaveBeenCalledWith(newVal[1]);
    });
  });

  describe('isMeasureAltUnit', () => {
    let wrapper;
    beforeEach(() => {
      wrapper = createWrapper({
        props: { ...propsDefault, measure: 'oee', widgetData: { ...propsDefault.widgetData, measure: 'oee' } },
      });
    });

    it('returns true for altqty', () => {
      const result = wrapper.vm.isMeasureAltUnit('altqty');
      expect(result).toBe(true);
    });

    it('returns true for goodaltqty', () => {
      const result = wrapper.vm.isMeasureAltUnit('goodaltqty');
      expect(result).toBe(true);
    });

    it('returns true for scrapaltqty', () => {
      const result = wrapper.vm.isMeasureAltUnit('scrapaltqty');
      expect(result).toBe(true);
    });

    it('returns false for a measure not in altUnitMeasures', () => {
      const result = wrapper.vm.isMeasureAltUnit('oee');
      expect(result).toBe(false);
    });

    it('returns false for undefined measure', () => {
      const result = wrapper.vm.isMeasureAltUnit(undefined);
      expect(result).toBe(false);
    });

    it('returns false for null measure', () => {
      const result = wrapper.vm.isMeasureAltUnit(null);
      expect(result).toBe(false);
    });

    it('returns false for an empty string measure', () => {
      const result = wrapper.vm.isMeasureAltUnit('');
      expect(result).toBe(false);
    });
  });

  describe('comparisonBarsData', () => {
    it('returns correct data for shift granularity', async () => {
      const wrapper = createWrapper({
        props: {
          ...propsDefault,
          widgetData: {
            ...propsDefault.widgetData,
            measure: 'oee',
            includeComparison: true,
            comparisonType: 'COMPARISON_WITH_PREVIOUS',
            periodName: predefinedTimePeriodNames.ROLLING_7_SHIFTS,
          },
        },
        computed: {
          ...index.computed,
          rawDataInclNoShiftDays: () => [
            {
              date: '2024-06-19', value: 10, comparison: 5, shiftproductiontype: 1,
            },
            {
              date: '2024-06-20', value: 20, comparison: 15, shiftproductiontype: 1,
            },
          ],
        },
      });

      expect(wrapper.vm.comparisonBarsData).toEqual([
        {
          measure: 0, value: 5, color: colorConstants.dark['lw-background'], strokeColor: colorConstants.dark.white,
        },
        {
          measure: 1, value: 15, color: colorConstants.dark['lw-background'], strokeColor: colorConstants.dark.white,
        },
      ]);
    });

    it('returns correct data for date granularity', async () => {
      const wrapper = createWrapper({
        props: {
          ...propsDefault,
          widgetData: {
            ...propsDefault.widgetData,
            measure: 'oee',
            periodName: predefinedTimePeriodNames.ROLLING_7_DAYS,
            includeComparison: true,
            comparisonType: 'COMPARISON_WITH_PREVIOUS',
          },
        },
        computed: {
          ...index.computed,
          rawDataInclNoShiftDays: () => [
            {
              date: '2024-06-19', value: 10, comparison: 5,
            },
            {
              date: '2024-06-20', value: 20, comparison: 15,
            },
          ],
        },
      });

      expect(wrapper.vm.comparisonBarsData).toEqual([
        {
          measure: '2024-06-19', value: 5, color: colorConstants.dark['lw-background'], strokeColor: colorConstants.dark.white,
        },
        {
          measure: '2024-06-20', value: 15, color: colorConstants.dark['lw-background'], strokeColor: colorConstants.dark.white,
        },
      ]);
    });

    it('returns empty array when comparison is not included', async () => {
      const wrapper = createWrapper({
        props: {
          ...propsDefault,
          widgetData: {
            ...propsDefault.widgetData,
            measure: 'oee',
            periodName: predefinedTimePeriodNames.ROLLING_7_SHIFTS,
            includeComparison: false,
          },
        },
      });

      expect(wrapper.vm.comparisonBarsData).toEqual([]);
    });
  });
});
