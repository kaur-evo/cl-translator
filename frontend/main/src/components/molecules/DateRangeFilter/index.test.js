import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import index from './index.vue';

import useFilterbarStore from '@/stores/filterbar';
import useReportsConfigStore from '@/stores/reportsConfig';

const GRANULARITIES = ['total', 'year', 'month', 'weekofyear', 'date'];

const createPinia = ({ granularity = undefined } = {}) => {
  const pinia = createTestingPinia({
    createSpy: vi.fn,
    stubActions: true,
    initialState: {
      filterbar: {
        currentFilterState: {},
        requestFilterState: {},
      },
    },
  });
  if (granularity !== undefined) {
    const reportsConfigStore = useReportsConfigStore(pinia);
    reportsConfigStore.granularity = granularity;
  }
  return pinia;
};

const createWrapper = ({ pinia = createPinia(), props, computed } = {}) => {
  const options = {
    global: {
      plugins: [pinia],
    },
  };
  if (props) options.props = props;
  if (computed) options.computed = computed;
  return shallowMount(index, options);
};

describe('DateRangeFilter', () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2020-01-01T12:34:33'));

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders', () => {
    const wrapper = createWrapper();

    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly', async () => {
    const wrapper = createWrapper();
    await wrapper.setData({ newDate: new Date('2022-04-21'), selectionType: 'lastweek', selectionPeriodType: 'day' });
    expect(wrapper.element).toMatchSnapshot();
  });

  describe('onApplyDateRange', () => {
    GRANULARITIES.forEach((granularity) => {
      test(`if applyDateRange calls expected methods with granularity ${granularity}`, async () => {
        const START_DATE = '1970-12-31';
        const END_DATE = '1971-12-31';
        const SELECTION_TYPE = 'lastweek';

        const wrapper = createWrapper({ pinia: createPinia({ granularity }) });

        const beforeDateRangeApply = vi.spyOn(wrapper.vm, 'triggerDataRequest');

        wrapper.vm.dateRange = [START_DATE, END_DATE];
        wrapper.vm.selectionType = SELECTION_TYPE;

        await wrapper.vm.onApplyDateRange();
        expect(beforeDateRangeApply).toBeCalledTimes(1);

        expect(wrapper.vm.isOpen).toBe(false);
      });

      test(`if applyDateRange calls expected methods with granularity ${granularity} when actions specified`, async () => {
        const START_DATE = '1970-12-31';
        const END_DATE = '1971-12-31';
        const SELECTION_TYPE = 'lastweek';

        const pinia = createPinia({ granularity });
        const reportsConfigStore = useReportsConfigStore(pinia);
        const filterbarStore = useFilterbarStore(pinia);
        const wrapper = createWrapper({
          pinia,
          props: {
            onApplyAction: 'reportsConfig/onDateRangeSelectionApply',
            updateDateRangeAction: 'reportsConfig/setDateRange',
            selectPrevOrNextAction: 'filterbar/triggerDataRequest',
          },
        });

        const triggerDataRequest = vi.spyOn(wrapper.vm, 'triggerDataRequest');

        wrapper.vm.dateRange = [START_DATE, END_DATE];
        wrapper.vm.selectionType = SELECTION_TYPE;

        await wrapper.vm.onApplyDateRange();
        expect(triggerDataRequest).toBeCalledTimes(0);
        expect(reportsConfigStore.onDateRangeSelectionApply).toHaveBeenCalledTimes(1);
        expect(reportsConfigStore.onDateRangeSelectionApply).toHaveBeenCalledWith({
          end: END_DATE, start: START_DATE, selectionType: SELECTION_TYPE,
        });
        expect(filterbarStore.triggerDataRequest).not.toHaveBeenCalled();

        expect(wrapper.vm.isOpen).toBe(false);
      });
    });
  });

  describe('getNewDateRange', () => {
    let wrapper;
    beforeEach(async () => {
      wrapper = createWrapper();
      await wrapper.vm.$nextTick();
    });

    it('returns correct range if selectionType is year and direction is -1', async () => {
      await wrapper.setData({ dateRange: ['2018-01-01', '2018-12-31'], selectionPeriodType: 'year' });
      const range = wrapper.vm.getNewDateRange(-1);
      expect(range).toEqual(['2017-01-01', '2017-12-31']);
    });

    it('returns correct range if selectionType is year and direction is 1', async () => {
      await wrapper.setData({ dateRange: ['2018-01-01', '2018-12-31'], selectionPeriodType: 'year' });
      const range = wrapper.vm.getNewDateRange(1);
      expect(range).toEqual(['2019-01-01', '2019-12-31']);
    });

    it('returns correct range if selectionType is month and direction is -1', async () => {
      await wrapper.setData({ dateRange: ['2018-01-01', '2018-01-31'], selectionPeriodType: 'month' });
      const range = wrapper.vm.getNewDateRange(-1);
      expect(range).toEqual(['2017-12-01', '2017-12-31']);
    });

    it('returns correct range if selectionType is month and direction is 1', async () => {
      await wrapper.setData({ dateRange: ['2018-01-01', '2018-01-31'], selectionPeriodType: 'month' });
      const range = wrapper.vm.getNewDateRange(1);
      expect(range).toEqual(['2018-02-01', '2018-02-28']);
    });

    it('returns correct range if selectionType is quarter and direction is -1', async () => {
      await wrapper.setData({ dateRange: ['2018-01-01', '2018-03-31'], selectionPeriodType: 'quarter' });
      const range = wrapper.vm.getNewDateRange(-1);
      expect(range).toEqual(['2017-10-01', '2017-12-31']);
    });

    it('returns correct range if selectionType is quarter and direction is 1', async () => {
      await wrapper.setData({ dateRange: ['2018-01-01', '2018-03-31'], selectionPeriodType: 'quarter' });
      const range = wrapper.vm.getNewDateRange(1);
      expect(range).toEqual(['2018-04-01', '2018-06-30']);
    });

    it('returns correct range if selectionType is quarter, direction is 1 and 4 quarters are selected', async () => {
      await wrapper.setData({ dateRange: ['2017-04-01', '2018-03-30'], selectionPeriodType: 'quarter' });
      const range = wrapper.vm.getNewDateRange(1);
      expect(range).toEqual(['2018-04-01', '2019-03-31']);
    });

    it('returns correct range if selectionType is quarter, direction is -1 and 4 quarters are selected', async () => {
      await wrapper.setData({ dateRange: ['2018-04-01', '2019-03-31'], selectionPeriodType: 'quarter' });
      const range = wrapper.vm.getNewDateRange(-1);
      expect(range).toEqual(['2017-04-01', '2018-03-31']);
    });

    it('returns correct range if selectionType is day, one day is selected and direction is -1', async () => {
      await wrapper.setData({ dateRange: ['2018-01-01', '2018-01-01'], selectionPeriodType: 'day' });
      const range = wrapper.vm.getNewDateRange(-1);
      expect(range).toEqual(['2017-12-31', '2017-12-31']);
    });

    it('returns correct range if selectionType is day, one day is selected and direction is 1', async () => {
      await wrapper.setData({ dateRange: ['2018-01-01', '2018-01-01'], selectionPeriodType: 'day' });
      const range = wrapper.vm.getNewDateRange(1);
      expect(range).toEqual(['2018-01-02', '2018-01-02']);
    });

    it('returns correct range if selectionType is day, multiple days are selected and direction is -1', async () => {
      await wrapper.setData({ dateRange: ['2018-01-01', '2018-01-10'], selectionPeriodType: 'day' });
      const range = wrapper.vm.getNewDateRange(-1);
      expect(range).toEqual(['2017-12-22', '2017-12-31']);
    });

    it('returns correct range if selectionType is day, multiple days are selected and direction is 1', async () => {
      await wrapper.setData({ dateRange: ['2018-01-01', '2018-01-10'], selectionPeriodType: 'day' });
      const range = wrapper.vm.getNewDateRange(1);
      expect(range).toEqual(['2018-01-11', '2018-01-20']);
    });

    it('returns correct range if the end date would be in the future.', async () => {
      await wrapper.setData({ dateRange: ['2019-12-21', '2019-12-30'], selectionPeriodType: 'day' });
      const range = wrapper.vm.getNewDateRange(1);
      expect(range).toEqual(['2019-12-31', '2020-01-01']);
    });
  });

  describe('getSelectionPeriodType', () => {
    const wrapper = createWrapper({ computed: { moveStep: () => 1 } });
    it('returns quarter if value is thisquarter', () => {
      expect(wrapper.vm.getSelectionPeriodType('thisquarter')).toEqual('quarter');
    });
    it('returns quarter if value is lastquarter', () => {
      expect(wrapper.vm.getSelectionPeriodType('thisquarter')).toEqual('quarter');
    });

    it('returns quarter if value is last4quarters', () => {
      expect(wrapper.vm.getSelectionPeriodType('last4quarters')).toEqual('quarter');
    });

    it('returns quarter if range matches with quarter', () => {
      wrapper.vm.dateRange = ['2019-01-01', '2019-03-31'];
      expect(wrapper.vm.getSelectionPeriodType('custom', ['2019-01-01', '2019-03-31'])).toEqual('quarter');
    });

    it('returns year if value is thisyear', () => {
      expect(wrapper.vm.getSelectionPeriodType('thisyear')).toEqual('year');
    });
    it('returns year if value is lastyear', () => {
      expect(wrapper.vm.getSelectionPeriodType('lastyear')).toEqual('year');
    });
    it('returns year if range matches with year', () => {
      wrapper.vm.dateRange = ['2019-01-01', '2019-12-31'];
      expect(wrapper.vm.getSelectionPeriodType('custom', ['2019-01-01', '2019-12-31'])).toEqual('year');
    });

    it('returns month if value is thismonth', () => {
      expect(wrapper.vm.getSelectionPeriodType('thismonth')).toEqual('month');
    });
    it('returns month if value is lastmonth', () => {
      expect(wrapper.vm.getSelectionPeriodType('lastmonth')).toEqual('month');
    });

    it('returns month if range matches with month', () => {
      wrapper.vm.dateRange = ['2019-01-01', '2019-01-31'];
      expect(wrapper.vm.getSelectionPeriodType('custom', ['2019-01-01', '2019-01-31'])).toEqual('month');
    });

    it('returns day if range doesnt match with any predefined period', () => {
      expect(wrapper.vm.getSelectionPeriodType('last7days', ['2019-01-01', '2019-01-07'])).toEqual('day');
    });

    it('returns week if range value is thisweek', () => {
      expect(wrapper.vm.getSelectionPeriodType('thisweek')).toEqual('week');
    });

    it('returns week if range value is lastweek', () => {
      expect(wrapper.vm.getSelectionPeriodType('lastweek')).toEqual('week');
    });

    it('returns week if range matches with week', () => {
      wrapper.vm.dateRange = ['2021-09-06', '2021-09-12'];
      expect(wrapper.vm.getSelectionPeriodType('custom', ['2021-09-06', '2021-09-12'])).toEqual('week');
    });
  });

  describe('dateRangeLabel', () => {
    it('returns "Last 12 months" label for the rollingyear selection type', async () => {
      const wrapper = createWrapper();
      await wrapper.setData({ selectionType: 'rollingyear' });
      expect(wrapper.vm.dateRangeLabel).toBe('Last 12 months');
    });
  });
});
