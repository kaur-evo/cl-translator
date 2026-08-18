import { shallowMount } from '@vue/test-utils';
import { nextTick } from 'vue';

import Evocon24HTimeInput from './index.vue';

describe('Evocon24HTimeInput', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2020-01-01T10:15:00'));
  });
  afterEach(() => {
    vi.useRealTimers();
  });
  it('renders correctly with empty value', () => {
    const wrapper = shallowMount(Evocon24HTimeInput, {
      props: { modelValue: '' },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly when value exists', async () => {
    const wrapper = shallowMount(Evocon24HTimeInput, {
      props: { modelValue: '12:12' },
    });

    await nextTick();
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly when chip should be used', async () => {
    const wrapper = shallowMount(Evocon24HTimeInput, {
      props: {
        modelValue: '12:12',
        useChip: true,
      },
    });

    await nextTick();
    expect(wrapper.element).toMatchSnapshot();
  });

  test('that when time is not in correct format, then null is emitted and error is visible', async () => {
    const wrapper = shallowMount(Evocon24HTimeInput, {
      props: { modelValue: '12:12' },
    });

    await wrapper.setData({ innerValue: '12:1' });
    await nextTick();
    expect(wrapper.emitted()['update:model-value'][0][0]).toBe(null);
    expect(wrapper.vm.timeRule).toBe('Invalid time');
  });

  test('that when time is in correct format, then it is emitted and error is not visible', async () => {
    const wrapper = shallowMount(Evocon24HTimeInput, {
      props: { modelValue: '12:12' },
    });

    await wrapper.setData({ innerValue: '12:21' });
    await nextTick();
    expect(wrapper.emitted()['update:model-value'][0][0]).toBe('12:21');
    expect(wrapper.vm.timeRule).toBe(true);
  });

  test('that when time is in correct format but it does not pass the given rule, then time value is emitted but error is visible', async () => {
    const props = { modelValue: '12:12' };
    const wrapper = shallowMount(Evocon24HTimeInput, {
      global: { },
      props,
      attrs: { rules: [(input) => input === '00:00' || 'midnight time is expected'] },
    });

    await wrapper.setData({ innerValue: '23:59' });
    await nextTick();
    expect(wrapper.emitted()['update:model-value'][0][0]).toBe('23:59');
    expect(wrapper.vm.timeRule).toBe(true);
  });

  test('that timeRegex is validating input correctly', () => {
    const wrapper = shallowMount(Evocon24HTimeInput);

    expect(wrapper.vm.timeRegex.test('asd')).toBe(false);
    expect(wrapper.vm.timeRegex.test('07:12pm')).toBe(false);
    expect(wrapper.vm.timeRegex.test('09:22am')).toBe(false);
    expect(wrapper.vm.timeRegex.test('13:12')).toBe(true);
    expect(wrapper.vm.timeRegex.test('44:12')).toBe(false);
    expect(wrapper.vm.timeRegex.test('09:12dd')).toBe(false);
    expect(wrapper.vm.timeRegex.test('09:75')).toBe(false);
    expect(wrapper.vm.timeRegex.test('9:55')).toBe(false);
    expect(wrapper.vm.timeRegex.test('09:55')).toBe(true);
  });
});
