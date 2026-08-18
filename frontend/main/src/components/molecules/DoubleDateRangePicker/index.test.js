import { shallowMount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { createTestingPinia } from '@pinia/testing';
import { startOfMonth, subMonths } from 'date-fns';

import DoubleDateRangePicker from './index.vue';

import { useDeviceStore } from '@/stores/index';

const createPinia = (overrides = {}) => createTestingPinia({
  createSpy: vi.fn,
  initialState: {
    profile: { currentUser: { firstDayOfWeek: 1 }, language: 'et' },
    ...overrides,
  },
});

describe('DoubleDateRangePicker', () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2020-01-01T12:34:33'));
  it('renders correctly', () => {
    const wrapper = shallowMount(DoubleDateRangePicker, {
      propsData: { max: '2020-01-01' },
      global: { plugins: [createPinia()] },
    });
    wrapper.setData('pickerDate', new Date('2017-02-12'));
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly in mobile view', () => {
    const pinia = createPinia();
    const deviceStore = useDeviceStore(pinia);
    deviceStore.isMobileView = true;

    const wrapper = shallowMount(DoubleDateRangePicker, {
      global: { plugins: [pinia] },
      propsData: { max: '2020-01-01' },
    });
    wrapper.setData('pickerDate', new Date('2017-02-12'));
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly if showPeriodSelection is false', () => {
    const wrapper = shallowMount(DoubleDateRangePicker, {
      global: { plugins: [createPinia()] },
      propsData: { showPeriodSelection: false, max: '2020-01-01' },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly when pickerDate is set to previous month', async () => {
    const wrapper = shallowMount(DoubleDateRangePicker, {
      global: { plugins: [createPinia()] },
      propsData: { max: '2020-01-01' },
    });

    wrapper.vm.pickerDate = startOfMonth(subMonths(new Date(), 1));
    await nextTick();
    expect(wrapper.element).toMatchSnapshot();
  });

  test('that "change" and "change-selection-type" events are not emitted, when new date range value length is not 2', () => {
    const wrapper = shallowMount(DoubleDateRangePicker, { global: { plugins: [createPinia()] } });

    // this, newVal, oldVal
    wrapper.vm.$options.watch.internalDateRange.call(wrapper.vm, ['2020-01-12'], ['2020-01-12', '2020-04-12']);
    expect(wrapper.emitted('change')).toBeUndefined();
    expect(wrapper.emitted('change-selection-type')).toBeUndefined();
  });

  test('that "change" event is not emitted, when new and old internal date range values are equal', () => {
    const wrapper = shallowMount(DoubleDateRangePicker, { global: { plugins: [createPinia()] } });

    // this, newVal, oldVal
    wrapper.vm.$options.watch.internalDateRange.call(wrapper.vm, ['2020-01-12', '2020-04-12'], ['2020-01-12', '2020-04-12']);
    expect(wrapper.emitted('change')).toBeUndefined();
  });

  test('that "change" event is emitting new date range value, when new and old internal date range values dont have same values', () => {
    const wrapper = shallowMount(DoubleDateRangePicker, { global: { plugins: [createPinia()] } });

    // this, newVal, oldVal
    wrapper.vm.$options.watch.internalDateRange.call(wrapper.vm, ['2020-01-12', '2020-04-12'], ['2020-03-24', '2020-11-09']);
    expect(wrapper.emitted('change')[0][0].dateRange).toEqual(['2020-01-12', '2020-04-12']);
  });

  test('that "change-selection-type" event is emitting new date range selection type, when date range value length is 2', () => {
    const wrapper = shallowMount(DoubleDateRangePicker, { global: { plugins: [createPinia()] } });

    wrapper.vm.onPeriodSelectionChange({ dateRange: ['2020-01-12', '2020-04-12'], value: 'lastweek' });
    expect(wrapper.emitted('change-selection-type')[0][0]).toEqual('lastweek');
  });

  test('that "change" and "change-selection-type" events are emitted, when date range selection type is "all"', () => {
    const wrapper = shallowMount(DoubleDateRangePicker, { global: { plugins: [createPinia()] } });

    wrapper.vm.onPeriodSelectionChange({ dateRange: [], value: 'all' });
    expect(wrapper.emitted('change')[0][0].dateRange).toEqual([]);
    expect(wrapper.emitted('change-selection-type')[0][0]).toEqual('all');
  });

  test('that goToLastPage sets pickerDate to start of previous month', () => {
    const wrapper = shallowMount(DoubleDateRangePicker, { global: { plugins: [createPinia()] }, propsData: { max: '2020-01-01' } });
    wrapper.vm.pickerDate = new Date('2019-10-01T00:00:00');
    const expectedDate = startOfMonth(subMonths(new Date(), 1));
    wrapper.vm.goToLastPage();
    expect(wrapper.vm.pickerDate).toEqual(expectedDate);
  });

  describe('isNavigateRightDisabled', () => {
    it('returns true when left picker date is in current month', () => {
      const wrapper = shallowMount(DoubleDateRangePicker, {
        global: { plugins: [createPinia()] },
        propsData: { max: '2020-01-01' },
      });

      wrapper.vm.pickerDate = startOfMonth(new Date());
      expect(wrapper.vm.leftPickerDate).toEqual(startOfMonth(new Date()));
      expect(wrapper.vm.isNavigateRightDisabled).toBe(true);
    });

    it('returns true when right picker date is in current month', () => {
      const wrapper = shallowMount(DoubleDateRangePicker, {
        global: { plugins: [createPinia()] },
        propsData: { max: '2020-01-01' },
      });

      wrapper.vm.pickerDate = startOfMonth(subMonths(new Date(), 1));
      expect(wrapper.vm.rightPickerDate).toEqual(startOfMonth(new Date()));
      expect(wrapper.vm.isNavigateRightDisabled).toBe(true);
    });

    it('returns false when left picker date is two months ago and right picker date is in previous month', () => {
      const wrapper = shallowMount(DoubleDateRangePicker, {
        global: { plugins: [createPinia()] },
        propsData: { max: '2020-01-01' },
      });

      wrapper.vm.pickerDate = startOfMonth(subMonths(new Date(), 2));
      expect(wrapper.vm.leftPickerDate).toEqual(startOfMonth(subMonths(new Date(), 2)));
      expect(wrapper.vm.rightPickerDate).toEqual(startOfMonth(subMonths(new Date(), 1)));
      expect(wrapper.vm.isNavigateRightDisabled).toBe(false);
    });
  });
});
