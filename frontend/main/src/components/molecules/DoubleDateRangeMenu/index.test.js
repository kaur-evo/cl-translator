import { shallowMount } from '@vue/test-utils';

import index from './index.vue';

import {
  CUSTOM, TODAY, THIS_WEEK, THIS_QUARTER, LAST_QUARTER, LAST_4_QUARTERS, ROLLING_12_MONTHS,
} from '@/constants/predefinedTimePeriodNames';

const propsDefault = {
  dateRange: [],
  selectionType: THIS_WEEK,
};

describe('DoubleDateRangeMenu', () => {
  vi.useFakeTimers('modern');
  vi.setSystemTime(new Date('2021-02-18'));

  it('renders', () => {
    const wrapper = shallowMount(index, {
      props: { ...propsDefault },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly', () => {
    const wrapper = shallowMount(index, {
      props: { ...propsDefault },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  describe('actualDateRange', () => {
    it('returns two same values in array if dateRange length is 1', () => {
      const wrapper = shallowMount(index, {
        props: { ...propsDefault, dateRange: ['2021-02-18'] },
      });

      expect(wrapper.vm.actualDateRange).toEqual(['2021-02-18', '2021-02-18']);
    });

    it('returns correct date range if dateRange has two values', () => {
      const wrapper = shallowMount(index, {
        props: { ...propsDefault, dateRange: ['2021-02-15', '2021-02-20'] },
      });

      expect(wrapper.vm.actualDateRange).toEqual(['2021-02-15', '2021-02-20']);
    });
  });

  describe('isMenuOpen watcher', () => {
    it('does not reset internalDateRange and internalSelectionType if watcher is called with true', () => {
      const wrapper = shallowMount(index, {
        props: { ...propsDefault, dateRange: ['2025-01-01', '2025-01-02'], selectionType: CUSTOM },
      });

      wrapper.vm.internalDateRange = ['2025-01-01', '2025-01-01'];
      wrapper.vm.internalSelectionType = TODAY;
      wrapper.vm.$options.watch.isMenuOpen.call(wrapper.vm, true);
      expect(wrapper.vm.internalDateRange).toEqual(['2025-01-01', '2025-01-01']);
      expect(wrapper.vm.internalSelectionType).toBe(TODAY);
    });

    it('resets internalDateRange and internalSelectionType if watcher is called with false', () => {
      const wrapper = shallowMount(index, {
        props: { ...propsDefault, dateRange: ['2025-01-01', '2025-01-02'], selectionType: CUSTOM },
      });

      wrapper.vm.internalDateRange = ['2025-01-01', '2025-01-01'];
      wrapper.vm.internalSelectionType = TODAY;
      wrapper.vm.$options.watch.isMenuOpen.call(wrapper.vm, false);
      expect(wrapper.vm.internalDateRange).toEqual(['2025-01-01', '2025-01-02']);
      expect(wrapper.vm.internalSelectionType).toBe(CUSTOM);
    });
  });

  describe('onDateRangeChange', () => {
    it('sets internalDateRange as two equal dates if dateRange length is 1', () => {
      const wrapper = shallowMount(index, {
        props: { ...propsDefault },
      });

      wrapper.vm.onDateRangeChange({ dateRange: ['2021-02-18'] });
      expect(wrapper.vm.internalDateRange).toEqual(['2021-02-18', '2021-02-18']);
    });

    it('sets internalDateRange equal to dateRange', () => {
      const wrapper = shallowMount(index, {
        props: { ...propsDefault },
      });

      wrapper.vm.onDateRangeChange({ dateRange: ['2021-02-15', '2021-02-20'] });
      expect(wrapper.vm.internalDateRange).toEqual(['2021-02-15', '2021-02-20']);
    });
  });

  describe('dateRangeLabel', () => {
    it('returns correct label when selectionType is custom', () => {
      const wrapper = shallowMount(index, {
        props: { ...propsDefault, selectionType: CUSTOM, dateRange: ['2021-02-15', '2021-02-18'] },
      });

      expect(wrapper.vm.dateRangeLabel).toBe('15.02.2021 - 18.02.2021');
    });

    it('returns correct label when selectionType is thisquarter', () => {
      const wrapper = shallowMount(index, {
        props: { ...propsDefault, selectionType: THIS_QUARTER },
      });

      expect(wrapper.vm.dateRangeLabel).toBe('This quarter');
    });

    it('returns correct label when selectionType is lastquarter', () => {
      const wrapper = shallowMount(index, {
        props: { ...propsDefault, selectionType: LAST_QUARTER },
      });

      expect(wrapper.vm.dateRangeLabel).toBe('Last quarter');
    });

    it('returns correct label when selectionType is last4quarters', () => {
      const wrapper = shallowMount(index, {
        props: { ...propsDefault, selectionType: LAST_4_QUARTERS },
      });

      expect(wrapper.vm.dateRangeLabel).toBe('Last 4 quarters');
    });

    it('returns correct label when selectionType is rolling12months', () => {
      const wrapper = shallowMount(index, {
        props: { ...propsDefault, selectionType: ROLLING_12_MONTHS },
      });

      expect(wrapper.vm.dateRangeLabel).toBe('Last 12 months');
    });

    it('returns correct label when selectionType is today', () => {
      const wrapper = shallowMount(index, {
        props: { ...propsDefault, selectionType: TODAY },
      });

      expect(wrapper.vm.dateRangeLabel).toBe('today');
    });
  });

  test('that onApply emits update:date-range and update:selection-type and sets isMenuOpen to false', () => {
    const wrapper = shallowMount(index, {
      props: { ...propsDefault },
    });

    wrapper.vm.isMenuOpen = true;

    wrapper.vm.onApply();

    expect(wrapper.emitted('update:date-range')).toBeTruthy();
    expect(wrapper.emitted('update:selection-type')).toBeTruthy();
    expect(wrapper.vm.isMenuOpen).toBe(false);
  });

  test('that onCancel sets internalDateRange to dateRange prop, internalSelectionType to selectionType prop and isMenuOpen to false', () => {
    const wrapper = shallowMount(index, {
      props: { ...propsDefault, dateRange: ['2021-02-15', '2021-02-20'], selectionType: THIS_WEEK },
    });

    wrapper.vm.internalDateRange = ['2021-01-01', '2021-03-31'];
    wrapper.vm.internalSelectionType = THIS_QUARTER;
    wrapper.vm.isMenuOpen = true;

    wrapper.vm.onCancel();

    expect(wrapper.vm.internalDateRange).toEqual(['2021-02-15', '2021-02-20']);
    expect(wrapper.vm.internalSelectionType).toEqual(THIS_WEEK);
    expect(wrapper.vm.isMenuOpen).toBe(false);
  });
});
