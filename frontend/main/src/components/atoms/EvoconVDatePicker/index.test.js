import { mount, shallowMount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { format } from 'date-fns';
import { createTestingPinia } from '@pinia/testing';

import index from './index.vue';

const createPinia = (overrides = {}) => createTestingPinia({
  createSpy: vi.fn,
  initialState: {
    profile: {
      currentUser: { firstDayOfWeek: 1 },
      language: 'en',
      ...overrides,
    },
  },
});

const propsDefault = {
  range: true,
  modelValue: [],
};

describe('EvoconVDatePicker', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-01T12:34:33'));
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders', async () => {
    const wrapper = shallowMount(index, {
      global: { plugins: [createPinia()] },
      props: { ...propsDefault },
    });
    await nextTick();
    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly', async () => {
    const wrapper = mount(index, {
      global: { plugins: [createPinia()] },
      props: { ...propsDefault },
    });
    vi.runAllTimers();
    await nextTick();
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly with albanian language', async () => {
    const wrapper = mount(index, {
      global: { plugins: [createPinia({ language: 'sq' })] },
      props: { ...propsDefault },
    });
    vi.runAllTimers();
    await nextTick();
    expect(wrapper.element).toMatchSnapshot();
  });

  test('getDatesListFromRange', () => {
    const wrapper = shallowMount(index, {
      global: { plugins: [createPinia()] },
      props: { ...propsDefault },
    });
    const result = wrapper.vm.getDatesListFromRange('2024-10-01', '2024-12-31');
    expect(result.length).toBe(92);
    expect(format(result[0], 'yyyy-MM-dd')).toEqual('2024-10-01');
    expect(format(result[91], 'yyyy-MM-dd')).toEqual('2024-12-31');
  });

  test('that onMonthUpdate only updates key for double picker', async () => {
    const wrapper = shallowMount(index, {
      global: { plugins: [createPinia()] },
      props: { ...propsDefault, double: true, modelValue: ['2024-01-01', '2024-01-05'] },
    });
    vi.useFakeTimers();
    vi.advanceTimersByTime(1000);
    await nextTick();
    const prevKey = wrapper.vm.key;
    wrapper.vm.onMonthUpdate(1);
    expect(wrapper.vm.key).not.toBe(prevKey);
    expect(wrapper.vm.month).toBe(0);
    expect(wrapper.vm.year).toBe(2024);
    expect(wrapper.emitted('update:pickerDate')).toBe(undefined);
  });

  test('that onMonthUpdate does not emit update and change month if the month is the same', async () => {
    const wrapper = shallowMount(index, {
      global: { plugins: [createPinia()] },
      props: { ...propsDefault, modelValue: ['2024-01-01', '2024-01-05'] },
    });
    vi.useFakeTimers();
    vi.advanceTimersByTime(1000);
    await nextTick();
    const prevKey = wrapper.vm.key;
    wrapper.vm.onMonthUpdate(0);
    expect(wrapper.vm.key).toBe(prevKey);
    expect(wrapper.vm.month).toBe(0);
    expect(wrapper.vm.year).toBe(2024);
    expect(wrapper.emitted('update:pickerDate')).toBe(undefined);
  });

  test('that onMonthUpdate emits update and changes month on month change', async () => {
    const wrapper = shallowMount(index, {
      global: { plugins: [createPinia()] },
      props: { ...propsDefault, modelValue: ['2024-01-01', '2024-01-05'], pickerDate: '2024-01' },
    });
    vi.useFakeTimers();
    vi.advanceTimersByTime(1000);
    await nextTick();
    const prevKey = wrapper.vm.key;
    wrapper.vm.onMonthUpdate(4);
    expect(wrapper.vm.key).toBe(prevKey);
    expect(wrapper.vm.month).toBe(4);
    expect(wrapper.vm.year).toBe(2024);
    expect(wrapper.emitted('update:pickerDate')).toEqual([['2024-05']]);
  });

  describe('onYearUpdate', () => {
    it('only updates key for double picker', async () => {
      const wrapper = shallowMount(index, {
        global: { plugins: [createPinia()] },
        props: { ...propsDefault, double: true, modelValue: ['2024-01-01', '2024-01-05'] },
      });
      vi.useFakeTimers();
      vi.advanceTimersByTime(1000);
      await nextTick();
      const prevKey = wrapper.vm.key;
      wrapper.vm.onYearUpdate(2025);
      expect(wrapper.vm.key).not.toBe(prevKey);
      expect(wrapper.vm.month).toBe(0);
      expect(wrapper.vm.year).toBe(2024);
      expect(wrapper.emitted('update:pickerDate')).toBe(undefined);
    });

    it('updates year and emits update for single picker if viewmode is not month', async () => {
      const wrapper = shallowMount(index, {
        global: { plugins: [createPinia()] },
        props: { ...propsDefault, modelValue: ['2024-01-01', '2024-01-05'], pickerDate: '2024-01' },
      });
      wrapper.vm.viewMode = 'year';
      vi.useFakeTimers();
      vi.advanceTimersByTime(1000);
      await nextTick();
      const prevKey = wrapper.vm.key;
      wrapper.vm.onYearUpdate(2025);
      expect(wrapper.vm.key).toBe(prevKey);
      expect(wrapper.vm.month).toBe(0);
      expect(wrapper.vm.year).toBe(2025);
      expect(wrapper.emitted('update:pickerDate')).toEqual([['2025-01']]);
    });

    it('updates month and year and emits update for single picker if viewmode is month and new year value is smaller', async () => {
      const wrapper = shallowMount(index, {
        global: { plugins: [createPinia()] },
        props: { ...propsDefault, modelValue: ['2024-01-01', '2024-01-05'], pickerDate: '2024-01' },
      });
      wrapper.vm.viewMode = 'month';
      vi.useFakeTimers();
      vi.advanceTimersByTime(1000);
      await nextTick();
      const prevKey = wrapper.vm.key;
      wrapper.vm.onYearUpdate(2023);
      expect(wrapper.vm.key).toBe(prevKey);
      expect(wrapper.vm.month).toBe(11);
      expect(wrapper.vm.year).toBe(2023);
      expect(wrapper.emitted('update:pickerDate')).toEqual([['2023-12']]);
    });

    it('updates month and year and emits update for single picker if viewmode is month and new year value is bigger', async () => {
      const wrapper = shallowMount(index, {
        global: { plugins: [createPinia()] },
        props: { ...propsDefault, modelValue: ['2024-12-01', '2024-12-05'], pickerDate: '2024-12' },
      });
      wrapper.vm.viewMode = 'month';
      vi.useFakeTimers();
      vi.advanceTimersByTime(1000);
      await nextTick();
      const prevKey = wrapper.vm.key;
      wrapper.vm.onYearUpdate(2025);
      expect(wrapper.vm.key).toBe(prevKey);
      expect(wrapper.vm.month).toBe(0);
      expect(wrapper.vm.year).toBe(2025);
      expect(wrapper.emitted('update:pickerDate')).toEqual([['2025-01']]);
    });
  });
});
