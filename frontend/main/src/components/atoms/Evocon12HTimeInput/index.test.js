/* eslint-disable sonarjs/duplicates-in-character-class */
/* eslint-disable sonarjs/concise-regex */

import { shallowMount } from '@vue/test-utils';
import { nextTick } from 'vue';

import Evocon12HTimeInput from './index.vue';

describe('Evocon12HTimeInput', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2020-01-01T10:15:00'));
  });
  afterEach(() => {
    vi.useRealTimers();
  });
  it('renders correctly with empty value', () => {
    const wrapper = shallowMount(Evocon12HTimeInput, {
      props: { modelValue: '' },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly when value exists', async () => {
    const wrapper = shallowMount(Evocon12HTimeInput, {
      props: { modelValue: '12:12' },
    });

    await nextTick();
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly when chip should be used', async () => {
    const wrapper = shallowMount(Evocon12HTimeInput, {
      props: {
        modelValue: '12:12',
        useChip: true,
      },
    });

    await nextTick();
    expect(wrapper.element).toMatchSnapshot();
  });

  test('that when time is not in correct format, then null is emitted and error is visible', async () => {
    const wrapper = shallowMount(Evocon12HTimeInput, {
      props: { modelValue: '12:12' },
    });

    await wrapper.setData({ innerValue: '12:1' });
    await nextTick();
    expect(wrapper.emitted()['update:model-value'][0][0]).toBe(null);
    expect(wrapper.vm.timeRule).toBe('Invalid time');
  });

  test('that when time is in correct format, then it is emitted and error is not visible', async () => {
    const wrapper = shallowMount(Evocon12HTimeInput, {
      props: { modelValue: '12:12' },
    });

    await wrapper.setData({ innerValue: '8:32AM' });
    await nextTick();
    expect(wrapper.emitted()['update:model-value'][0][0]).toBe('08:32');
    expect(wrapper.vm.timeRule).toBe(true);
  });

  test('that when time is in correct format but it does not pass the given rule, then time value is emitted but error is visible', async () => {
    const wrapper = shallowMount(Evocon12HTimeInput, {
      props: { modelValue: '12:12' },
      attrs: { rules: [(input) => input === '00:00' || 'midnight time is expected'] },
    });

    await wrapper.setData({ innerValue: '11:59PM' });
    await nextTick();
    expect(wrapper.emitted()['update:model-value'][0][0]).toBe('23:59');
    expect(wrapper.vm.timeRule).toBe(true);
  });

  test('that timeRegex is validating input correctly', () => {
    const wrapper = shallowMount(Evocon12HTimeInput);

    expect(wrapper.vm.timeRegex.test('asd')).toBe(false);
    expect(wrapper.vm.timeRegex.test('07:12PM')).toBe(true);
    expect(wrapper.vm.timeRegex.test('09:22AM')).toBe(true);
    expect(wrapper.vm.timeRegex.test('13:12PM')).toBe(false);
    expect(wrapper.vm.timeRegex.test('12:77PM')).toBe(false);
    expect(wrapper.vm.timeRegex.test('9:12dd')).toBe(false);
    expect(wrapper.vm.timeRegex.test('9:55')).toBe(false);
    expect(wrapper.vm.timeRegex.test('12:12')).toBe(false);
  });

  test('that getEmitValue returns time in correct format', async () => {
    const wrapper = shallowMount(Evocon12HTimeInput);

    expect(wrapper.vm.getEmitValue('')).toBe(null);
    expect(wrapper.vm.getEmitValue('7:12AM')).toBe('07:12');
    expect(wrapper.vm.getEmitValue('9:33AM')).toBe('09:33');
    expect(wrapper.vm.getEmitValue('12:12PM')).toBe('12:12');
    expect(wrapper.vm.getEmitValue('1:34PM')).toBe('13:34');
    expect(wrapper.vm.getEmitValue('5:23PM')).toBe('17:23');
    expect(wrapper.vm.getEmitValue('9:55PM')).toBe('21:55');
    expect(wrapper.vm.getEmitValue('12:23AM')).toBe('00:23');
  });

  test('that setMaskValue sets correct timeMask', () => {
    const wrapper = shallowMount(Evocon12HTimeInput);

    wrapper.vm.setMaskValue('1');
    expect(wrapper.vm.timeMask).toEqual({
      mask: '1#:m#AM',
      tokens: { '#': { pattern: /\d?/ }, m: { pattern: /[0-5]/ }, A: { pattern: /[A|a|P|p]/ } },
    });
    wrapper.vm.setMaskValue('1:');
    expect(wrapper.vm.timeMask).toEqual({
      mask: '#:m%AM',
      tokens: {
        '#': { pattern: /[1-9]/ }, m: { pattern: /[0-5]/ }, '%': { pattern: /[0-9]/ }, A: { pattern: /[A|a|P|p]/ },
      },
    });
    wrapper.vm.setMaskValue('10');
    expect(wrapper.vm.timeMask).toEqual({ mask: '1#:m#AM', tokens: { '#': { pattern: /\d?/ }, m: { pattern: /[0-5]/ }, A: { pattern: /[A|a|P|p]/ } } });
    wrapper.vm.setMaskValue('11');
    expect(wrapper.vm.timeMask).toEqual({ mask: '1#:m#AM', tokens: { '#': { pattern: /\d?/ }, m: { pattern: /[0-5]/ }, A: { pattern: /[A|a|P|p]/ } } });
    wrapper.vm.setMaskValue('12');
    expect(wrapper.vm.timeMask).toEqual({ mask: '1#:m#AM', tokens: { '#': { pattern: /\d?/ }, m: { pattern: /[0-5]/ }, A: { pattern: /[A|a|P|p]/ } } });
    wrapper.vm.setMaskValue('2');
    expect(wrapper.vm.timeMask).toEqual({
      mask: '#:m%AM',
      tokens: {
        '#': { pattern: /[1-9]/ }, m: { pattern: /[0-5]/ }, '%': { pattern: /[0-9]/ }, A: { pattern: /[A|a|P|p]/ },
      },
    });
  });
});
