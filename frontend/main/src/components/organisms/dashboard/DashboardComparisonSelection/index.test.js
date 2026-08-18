import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import index from './index.vue';

import timePeriodType from '@/constants/predefinedTimePeriodNames';
import widgetType from '@/constants/dashboardWidgetTypes';
import comparisonType from '@/constants/dashboardComparisonType';

const createWrapper = (options) => shallowMount(index, {
  global: {
    plugins: [
      createTestingPinia({
        createSpy: vi.fn,
        initialState: {
          profile: {
            dateFormat: {
              long: 'dd.MM.yyyy',
              short: 'dd.MM',
            },
            firstDayOfWeek: 1,
          },
          device: {
            isMobileView: false,
          },
        },
      }),
    ],
    mocks: {
      $i18n: {
        locale: 'et',
      },
    },
  },
  ...options,
});

const propsDefault = {
  modelValue: comparisonType.NO_COMPARISON,
  periodName: timePeriodType.THIS_WEEK,
  widgetType: widgetType.OEE_CHART,
};

describe('DashboardComparisonSelection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2022-06-30T00:00:00.000Z'));
  });
  afterEach(() => {
    vi.useRealTimers();
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

  describe('getCustomPrecedingRange', () => {
    it('returns correct preceding range for a 1-day custom period', () => {
      const wrapper = createWrapper({
        props: { ...propsDefault, dateRange: ['2022-06-18', '2022-06-18'] },
      });

      expect(wrapper.vm.getCustomPrecedingRange()).toEqual(['2022-06-17', '2022-06-17']);
    });

    it('returns correct preceding range for a custom period over multiple months', () => {
      const wrapper = createWrapper({
        props: { ...propsDefault, dateRange: ['2022-05-11', '2022-06-30'] },
      });

      expect(wrapper.vm.getCustomPrecedingRange()).toEqual(['2022-03-21', '2022-05-10']);
    });

    it('returns correct preceding range for a custom period over multiple years', () => {
      const wrapper = createWrapper({
        props: { ...propsDefault, dateRange: ['2020-06-01', '2022-06-30'] },
      });

      expect(wrapper.vm.getCustomPrecedingRange()).toEqual(['2018-05-03', '2020-05-31']);
    });
  });

  describe('getComparisonPeriodRange', () => {
    const wrapper = createWrapper({
      props: { ...propsDefault, dateRange: ['2022-06-18', '2022-06-23'] },
    });
    const validResults = {
      [comparisonType.NO_COMPARISON]: {
        [timePeriodType.TODAY]: [],
        [timePeriodType.YESTERDAY]: [],
        [timePeriodType.THIS_WEEK]: [],
        [timePeriodType.LAST_WEEK]: [],
        [timePeriodType.THIS_MONTH]: [],
        [timePeriodType.LAST_MONTH]: [],
        [timePeriodType.THIS_YEAR]: [],
        [timePeriodType.LAST_YEAR]: [],
        [timePeriodType.ROLLING_7_DAYS]: [],
        [timePeriodType.ROLLING_30_DAYS]: [],
        [timePeriodType.ROLLING_12_MONTHS]: [],
        [timePeriodType.ROLLING_7_SHIFTS]: [],
        [timePeriodType.PREVIOUS_PRODUCTION_DAY]: [],
        [timePeriodType.ONGOING_SHIFT]: [],
        [timePeriodType.PREVIOUS_SHIFT]: [],
        [timePeriodType.THIS_QUARTER]: [],
        [timePeriodType.LAST_QUARTER]: [],
        [timePeriodType.LAST_4_QUARTERS]: [],
        [timePeriodType.CUSTOM]: [],
      },
      [comparisonType.COMPARISON_WITH_PREVIOUS]: {
        [timePeriodType.TODAY]: ['2022-06-29', '2022-06-29'],
        [timePeriodType.YESTERDAY]: ['2022-06-28', '2022-06-28'],
        [timePeriodType.THIS_WEEK]: ['2022-06-20', '2022-06-23'],
        [timePeriodType.LAST_WEEK]: ['2022-06-13', '2022-06-19'],
        [timePeriodType.THIS_MONTH]: ['2022-05-01', '2022-05-30'],
        [timePeriodType.LAST_MONTH]: ['2022-04-01', '2022-04-30'],
        [timePeriodType.THIS_YEAR]: ['2021-01-01', '2021-06-30'],
        [timePeriodType.LAST_YEAR]: ['2020-01-01', '2020-12-31'],
        [timePeriodType.ROLLING_7_DAYS]: ['2022-06-17', '2022-06-23'],
        [timePeriodType.ROLLING_30_DAYS]: ['2022-05-02', '2022-05-31'],
        [timePeriodType.ROLLING_12_MONTHS]: ['2020-07-01', '2021-06-30'],
        [timePeriodType.ROLLING_7_SHIFTS]: [],
        [timePeriodType.PREVIOUS_PRODUCTION_DAY]: [],
        [timePeriodType.ONGOING_SHIFT]: [],
        [timePeriodType.PREVIOUS_SHIFT]: [],
        [timePeriodType.THIS_QUARTER]: ['2022-01-01', '2022-03-31'],
        [timePeriodType.LAST_QUARTER]: ['2021-10-01', '2021-12-31'],
        [timePeriodType.LAST_4_QUARTERS]: ['2020-07-01', '2021-06-30'],
        [timePeriodType.CUSTOM]: ['2022-06-12', '2022-06-17'],
      },
      [comparisonType.COMPARISON_WITH_PREVIOUS_FULL]: {
        [timePeriodType.TODAY]: ['2022-06-29', '2022-06-29'],
        [timePeriodType.YESTERDAY]: ['2022-06-28', '2022-06-28'],
        [timePeriodType.THIS_WEEK]: ['2022-06-20', '2022-06-26'],
        [timePeriodType.LAST_WEEK]: ['2022-06-13', '2022-06-19'],
        [timePeriodType.THIS_MONTH]: ['2022-05-01', '2022-05-31'],
        [timePeriodType.LAST_MONTH]: ['2022-04-01', '2022-04-30'],
        [timePeriodType.THIS_YEAR]: ['2021-01-01', '2021-12-31'],
        [timePeriodType.LAST_YEAR]: ['2020-01-01', '2020-12-31'],
        [timePeriodType.ROLLING_7_DAYS]: ['2022-06-17', '2022-06-23'],
        [timePeriodType.ROLLING_30_DAYS]: ['2022-05-02', '2022-05-31'],
        [timePeriodType.ROLLING_12_MONTHS]: ['2020-07-01', '2021-06-30'],
        [timePeriodType.ROLLING_7_SHIFTS]: [],
        [timePeriodType.PREVIOUS_PRODUCTION_DAY]: [],
        [timePeriodType.ONGOING_SHIFT]: [],
        [timePeriodType.PREVIOUS_SHIFT]: [],
        [timePeriodType.THIS_QUARTER]: ['2022-01-01', '2022-03-31'],
        [timePeriodType.LAST_QUARTER]: ['2021-10-01', '2021-12-31'],
        [timePeriodType.LAST_4_QUARTERS]: ['2020-07-01', '2021-06-30'],
        [timePeriodType.CUSTOM]: ['2022-06-12', '2022-06-17'],
      },
    };
    Object.values(comparisonType).forEach((comparison) => {
      Object.values(timePeriodType).forEach((periodType) => {
        test(`if returns valid range with comparisonType: ${comparison} period: ${periodType}`, () => {
          const precedingRange = wrapper.vm.getComparisonPeriodRange(comparison, periodType);
          expect(precedingRange).toStrictEqual(validResults[comparison][periodType]);
        });
      });
    });
  });

  describe('formatDay', () => {
    it('returns day in correct format if date format is short', () => {
      const wrapper = createWrapper({
        props: { ...propsDefault },
      });

      const formattedDay = wrapper.vm.formatDay(new Date('2022-06-30'), 'short');
      expect(formattedDay).toStrictEqual('N, 30.06');
    });

    it('returns day in correct format if date format is long', () => {
      const wrapper = createWrapper({
        props: { ...propsDefault },
      });

      const formattedDay = wrapper.vm.formatDay(new Date('2022-06-30'), 'long');
      expect(formattedDay).toStrictEqual('N, 30.06.2022');
    });
  });

  test('that formatMonth returns date in correct format', () => {
    const wrapper = createWrapper({
      props: { ...propsDefault },
    });

    const formattedMonth = wrapper.vm.formatMonth(new Date('2022-06-30'));
    expect(formattedMonth).toStrictEqual('juuni 2022');
  });

  describe('formatPeriodRange', () => {
    beforeEach(() => {
      vi.clearAllMocks();
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2022-06-30T00:00:00.000Z'));
    });
    afterEach(() => {
      vi.useRealTimers();
    });
    const wrapper = createWrapper({
      props: { ...propsDefault },
    });
    const validResults = {
      [timePeriodType.TODAY]: 'K, 01.07',
      [timePeriodType.YESTERDAY]: 'K, 01.07',
      [timePeriodType.THIS_WEEK]: 'K, 01.07 - T, 29.06',
      [timePeriodType.LAST_WEEK]: 'K, 01.07 - T, 29.06',
      [timePeriodType.THIS_MONTH]: 'K, 01.07 - T, 29.06',
      [timePeriodType.LAST_MONTH]: 'K, 01.07 - T, 29.06',
      [timePeriodType.THIS_YEAR]: 'juuli 2020 - juuni 2021',
      [timePeriodType.LAST_YEAR]: 'juuli 2020 - juuni 2021',
      [timePeriodType.ROLLING_7_DAYS]: 'K, 01.07 - T, 29.06',
      [timePeriodType.ROLLING_30_DAYS]: 'K, 01.07 - T, 29.06',
      [timePeriodType.ROLLING_12_MONTHS]: 'juuli 2020 - juuni 2021',
      [timePeriodType.ROLLING_7_SHIFTS]: '01.07.2020 - 29.06.2021',
      [timePeriodType.PREVIOUS_PRODUCTION_DAY]: '01.07.2020 - 29.06.2021',
      [timePeriodType.ONGOING_SHIFT]: '01.07.2020 - 29.06.2021',
      [timePeriodType.PREVIOUS_SHIFT]: '01.07.2020 - 29.06.2021',
      [timePeriodType.THIS_QUARTER]: '01.07.2020 - 29.06.2021',
      [timePeriodType.LAST_QUARTER]: '01.07.2020 - 29.06.2021',
      [timePeriodType.LAST_4_QUARTERS]: '01.07.2020 - 29.06.2021',
      [timePeriodType.CUSTOM]: 'K, 01.07.2020 - T, 29.06.2021',
    };
    Object.values(timePeriodType).forEach((periodType) => {
      test(`if returns valid formatted date range for period: ${periodType}`, () => {
        const formattedRange = wrapper.vm.formatPeriodRange(['2020-07-01', '2021-06-29'], periodType);
        expect(formattedRange).toStrictEqual(validResults[periodType]);
      });
    });

    it('returns valid formatted date for 1-day custom period', () => {
      const formattedRange = wrapper.vm.formatPeriodRange(['2020-07-01', '2020-07-01'], timePeriodType.CUSTOM);
      expect(formattedRange).toStrictEqual('K, 01.07.2020');
    });
  });
});
