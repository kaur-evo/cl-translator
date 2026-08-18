import { shallowMount } from '@vue/test-utils';

import index from './index.vue';

const propsDefault = {
  modelValue: 1234234234,
};

describe('EvoconNumberInput', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

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

  it('renders correctly as a chip', () => {
    const wrapper = shallowMount(index, {
      props: { ...propsDefault, useChip: true },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly as a chip without value', () => {
    const wrapper = shallowMount(index, {
      props: { ...propsDefault, modelValue: null, useChip: true },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  describe('onInput', () => {
    afterEach(() => {
      vi.clearAllMocks();
    });

    const wrapper = shallowMount(index, {
      props: { ...propsDefault, maxValue: 1000000 },
    });
    it('emits null if input is undefined', () => {
      const emittedLen = wrapper.emitted('update:model-value')?.length || 0;
      wrapper.vm.onInput(undefined);
      expect(wrapper.emitted('update:model-value').length).toBe(emittedLen + 1);
      expect(wrapper.emitted('update:model-value')[emittedLen]).toEqual([null]);
    });

    it('doesnt emit anything if input is "-"', () => {
      const emittedLen = wrapper.emitted('update:model-value')?.length || 0;
      wrapper.vm.onInput('-');
      expect(wrapper.emitted('update:model-value').length).toBe(emittedLen);
    });

    it('emits corrent number if input has comma', () => {
      const emittedLen = wrapper.emitted('update:model-value')?.length || 0;
      wrapper.vm.onInput('123,456');
      expect(wrapper.emitted('update:model-value').length).toBe(emittedLen + 1);
      expect(wrapper.emitted('update:model-value')[emittedLen]).toEqual([123.456]);
    });

    it('emits corrent number if input has space', () => {
      const emittedLen = wrapper.emitted('update:model-value')?.length || 0;
      wrapper.vm.onInput('123 456');
      expect(wrapper.emitted('update:model-value').length).toBe(emittedLen + 1);
      expect(wrapper.emitted('update:model-value')[emittedLen]).toEqual([123456]);
    });

    it('emits rounded value, if input has more than 5 decimals', () => {
      const emittedLen = wrapper.emitted('update:model-value')?.length || 0;
      wrapper.vm.onInput('123.456789');
      expect(wrapper.emitted('update:model-value').length).toBe(emittedLen + 1);
      expect(wrapper.emitted('update:model-value')[emittedLen]).toEqual([123.45679]);
    });

    it('emits correct number if input has more than 5 decimals and comma', () => {
      const emittedLen = wrapper.emitted('update:model-value')?.length || 0;
      wrapper.vm.onInput('123,456789');
      expect(wrapper.emitted('update:model-value').length).toBe(emittedLen + 1);
      expect(wrapper.emitted('update:model-value')[emittedLen]).toEqual([123.45679]);
    });

    it('emits max value if input is greater than max', () => {
      const emittedLen = wrapper.emitted('update:model-value')?.length || 0;
      wrapper.vm.onInput('123456789');
      expect(wrapper.emitted('update:model-value').length).toBe(emittedLen + 1);
      expect(wrapper.emitted('update:model-value')[emittedLen]).toEqual([1000000]);
    });
  });

  describe('onInput - additional cases', () => {
    it('emits null if input is empty string', () => {
      const wrapper = shallowMount(index, {
        props: { ...propsDefault, maxValue: 1000000 },
      });
      wrapper.vm.onInput('');
      expect(wrapper.emitted('update:model-value')[0]).toEqual([null]);
    });

    it('does not emit if input ends with a dot (intermediate value)', () => {
      const wrapper = shallowMount(index, {
        props: { ...propsDefault },
      });
      wrapper.vm.onInput('123.');
      expect(wrapper.emitted('update:model-value')).toBeUndefined();
    });

    it('does not emit if input is just a dot', () => {
      const wrapper = shallowMount(index, {
        props: { ...propsDefault },
      });
      wrapper.vm.onInput('.');
      expect(wrapper.emitted('update:model-value')).toBeUndefined();
    });

    it('does not emit if input has trailing zeros after decimal', () => {
      const wrapper = shallowMount(index, {
        props: { ...propsDefault },
      });
      wrapper.vm.onInput('1.50');
      expect(wrapper.emitted('update:model-value')).toBeUndefined();
    });

    it('sets rawInput on every call', () => {
      const wrapper = shallowMount(index, {
        props: { ...propsDefault },
      });
      wrapper.vm.onInput('42');
      expect(wrapper.vm.rawInput).toBe('42');
    });
  });

  describe('isIntermediateValue', () => {
    let wrapper;
    beforeEach(() => {
      wrapper = shallowMount(index, {
        props: { ...propsDefault },
      });
    });

    it('returns true for empty string', () => {
      expect(wrapper.vm.isIntermediateValue('')).toBe(true);
    });

    it('returns true for "-"', () => {
      expect(wrapper.vm.isIntermediateValue('-')).toBe(true);
    });

    it('returns true for "."', () => {
      expect(wrapper.vm.isIntermediateValue('.')).toBe(true);
    });

    it('returns true for value ending with dot', () => {
      expect(wrapper.vm.isIntermediateValue('123.')).toBe(true);
    });

    it('returns true for value ending with comma', () => {
      expect(wrapper.vm.isIntermediateValue('123,')).toBe(true);
    });

    it('returns true for trailing zeros after decimal', () => {
      expect(wrapper.vm.isIntermediateValue('1.50')).toBe(true);
    });

    it('returns true for NaN values', () => {
      expect(wrapper.vm.isIntermediateValue('abc')).toBe(true);
    });

    it('returns false for valid complete numbers', () => {
      expect(wrapper.vm.isIntermediateValue('123')).toBe(false);
    });

    it('returns false for valid decimal numbers', () => {
      expect(wrapper.vm.isIntermediateValue('123.45')).toBe(false);
    });

    it('normalizes commas to dots', () => {
      expect(wrapper.vm.isIntermediateValue('123,45')).toBe(false);
    });

    it('strips spaces before evaluation', () => {
      expect(wrapper.vm.isIntermediateValue('123 456')).toBe(false);
    });
  });

  describe('onKeydown', () => {
    const createEvent = (key, opts = {}) => ({
      key,
      metaKey: opts.metaKey || false,
      preventDefault: vi.fn(),
    });

    it('allows digit keys', () => {
      const wrapper = shallowMount(index, {
        props: { ...propsDefault },
      });
      wrapper.setData({ rawInput: '' });
      const event = createEvent('5');
      wrapper.vm.onKeydown(event);
      expect(event.preventDefault).not.toHaveBeenCalled();
    });

    it('allows ArrowLeft key', () => {
      const wrapper = shallowMount(index, {
        props: { ...propsDefault },
      });
      const event = createEvent('ArrowLeft');
      wrapper.vm.onKeydown(event);
      expect(event.preventDefault).not.toHaveBeenCalled();
    });

    it('allows ArrowRight key', () => {
      const wrapper = shallowMount(index, {
        props: { ...propsDefault },
      });
      const event = createEvent('ArrowRight');
      wrapper.vm.onKeydown(event);
      expect(event.preventDefault).not.toHaveBeenCalled();
    });

    it('allows Backspace key', () => {
      const wrapper = shallowMount(index, {
        props: { ...propsDefault },
      });
      const event = createEvent('Backspace');
      wrapper.vm.onKeydown(event);
      expect(event.preventDefault).not.toHaveBeenCalled();
    });

    it('allows Tab key', () => {
      const wrapper = shallowMount(index, {
        props: { ...propsDefault },
      });
      const event = createEvent('Tab');
      wrapper.vm.onKeydown(event);
      expect(event.preventDefault).not.toHaveBeenCalled();
    });

    it('allows Cmd+V (paste)', () => {
      const wrapper = shallowMount(index, {
        props: { ...propsDefault },
      });
      const event = createEvent('v', { metaKey: true });
      wrapper.vm.onKeydown(event);
      expect(event.preventDefault).not.toHaveBeenCalled();
    });

    it('prevents letter keys', () => {
      const wrapper = shallowMount(index, {
        props: { ...propsDefault },
      });
      wrapper.setData({ rawInput: '' });
      const event = createEvent('a');
      wrapper.vm.onKeydown(event);
      expect(event.preventDefault).toHaveBeenCalled();
    });

    it('prevents minus key when allowNegative is false', () => {
      const wrapper = shallowMount(index, {
        props: { ...propsDefault, allowNegative: false },
      });
      wrapper.setData({ rawInput: '' });
      const event = createEvent('-');
      wrapper.vm.onKeydown(event);
      expect(event.preventDefault).toHaveBeenCalled();
    });

    it('allows minus key when allowNegative is true', () => {
      const wrapper = shallowMount(index, {
        props: { ...propsDefault, allowNegative: true },
      });
      wrapper.setData({ rawInput: '' });
      const event = createEvent('-');
      wrapper.vm.onKeydown(event);
      expect(event.preventDefault).not.toHaveBeenCalled();
    });

    it('allows comma and dot when allowFloat is true', () => {
      const wrapper = shallowMount(index, {
        props: { ...propsDefault, allowFloat: true },
      });
      wrapper.setData({ rawInput: '12' });
      const commaEvent = createEvent(',');
      wrapper.vm.onKeydown(commaEvent);
      expect(commaEvent.preventDefault).not.toHaveBeenCalled();

      const dotEvent = createEvent('.');
      wrapper.vm.onKeydown(dotEvent);
      expect(dotEvent.preventDefault).not.toHaveBeenCalled();
    });

    it('prevents comma and dot when allowFloat is false', () => {
      const wrapper = shallowMount(index, {
        props: { ...propsDefault, allowFloat: false },
      });
      wrapper.setData({ rawInput: '12' });
      const commaEvent = createEvent(',');
      wrapper.vm.onKeydown(commaEvent);
      expect(commaEvent.preventDefault).toHaveBeenCalled();

      const dotEvent = createEvent('.');
      wrapper.vm.onKeydown(dotEvent);
      expect(dotEvent.preventDefault).toHaveBeenCalled();
    });

    it('prevents input when rawInput length reaches maxValue length', () => {
      const wrapper = shallowMount(index, {
        props: { ...propsDefault, maxValue: 100 },
      });
      wrapper.setData({ rawInput: '999' });
      const event = createEvent('1');
      wrapper.vm.onKeydown(event);
      expect(event.preventDefault).toHaveBeenCalled();
    });

    it('returns early if key is falsy', () => {
      const wrapper = shallowMount(index, {
        props: { ...propsDefault },
      });
      const event = { key: '', preventDefault: vi.fn() };
      wrapper.vm.onKeydown(event);
      expect(event.preventDefault).not.toHaveBeenCalled();
    });
  });

  describe('onFocus', () => {
    it('sets focused to true', () => {
      const wrapper = shallowMount(index, {
        props: { ...propsDefault },
      });
      wrapper.vm.onFocus({});
      expect(wrapper.vm.focused).toBe(true);
    });

    it('sets rawInput to stringified modelValue', () => {
      const wrapper = shallowMount(index, {
        props: { ...propsDefault, modelValue: 42.123 },
      });
      wrapper.vm.onFocus({});
      expect(wrapper.vm.rawInput).toBe('42.123');
    });

    it('sets rawInput to empty string when modelValue is null', () => {
      const wrapper = shallowMount(index, {
        props: { ...propsDefault, modelValue: null },
      });
      wrapper.vm.onFocus({});
      expect(wrapper.vm.rawInput).toBe('');
    });

    it('rounds modelValue to 5 decimals for rawInput', () => {
      const wrapper = shallowMount(index, {
        props: { ...propsDefault, modelValue: 1.123456789 },
      });
      wrapper.vm.onFocus({});
      expect(wrapper.vm.rawInput).toBe('1.12346');
    });

    it('emits focus event with the original event', () => {
      const wrapper = shallowMount(index, {
        props: { ...propsDefault },
      });
      const focusEvent = { type: 'focus' };
      wrapper.vm.onFocus(focusEvent);
      expect(wrapper.emitted('focus')[0]).toEqual([focusEvent]);
    });
  });

  describe('onBlur', () => {
    it('sets focused to false', () => {
      const wrapper = shallowMount(index, {
        props: { ...propsDefault },
      });
      wrapper.setData({ focused: true, rawInput: '123' });
      wrapper.vm.onBlur({});
      expect(wrapper.vm.focused).toBe(false);
    });

    it('emits blur event', () => {
      const wrapper = shallowMount(index, {
        props: { ...propsDefault },
      });
      wrapper.setData({ focused: true, rawInput: '123' });
      const blurEvent = { type: 'blur' };
      wrapper.vm.onBlur(blurEvent);
      expect(wrapper.emitted('blur')[0]).toEqual([blurEvent]);
    });

    it('emits update:model-value with parsed number on blur', () => {
      const wrapper = shallowMount(index, {
        props: { ...propsDefault },
      });
      wrapper.setData({ focused: true, rawInput: '456' });
      wrapper.vm.onBlur({});
      expect(wrapper.emitted('update:model-value')[0]).toEqual([456]);
    });

    it('emits null when rawInput is empty on blur', () => {
      const wrapper = shallowMount(index, {
        props: { ...propsDefault },
      });
      wrapper.setData({ focused: true, rawInput: '' });
      wrapper.vm.onBlur({});
      expect(wrapper.emitted('update:model-value')[0]).toEqual([null]);
    });

    it('does not emit update:model-value when rawInput is "-"', () => {
      const wrapper = shallowMount(index, {
        props: { ...propsDefault },
      });
      wrapper.setData({ focused: true, rawInput: '-' });
      wrapper.vm.onBlur({});
      expect(wrapper.emitted('update:model-value')).toBeUndefined();
    });

    it('emits blur without update:model-value when not focused', () => {
      const wrapper = shallowMount(index, {
        props: { ...propsDefault },
      });
      wrapper.setData({ focused: false });
      const blurEvent = { type: 'blur' };
      wrapper.vm.onBlur(blurEvent);
      expect(wrapper.emitted('blur')[0]).toEqual([blurEvent]);
      expect(wrapper.emitted('update:model-value')).toBeUndefined();
    });

    it('clamps to maxValue on blur', () => {
      const wrapper = shallowMount(index, {
        props: { ...propsDefault, maxValue: 100 },
      });
      wrapper.setData({ focused: true, rawInput: '999' });
      wrapper.vm.onBlur({});
      expect(wrapper.emitted('update:model-value')[0]).toEqual([100]);
    });

    it('rounds to 5 decimals on blur', () => {
      const wrapper = shallowMount(index, {
        props: { ...propsDefault },
      });
      wrapper.setData({ focused: true, rawInput: '1.123456789' });
      wrapper.vm.onBlur({});
      expect(wrapper.emitted('update:model-value')[0]).toEqual([1.12346]);
    });

    it('handles comma in rawInput on blur', () => {
      const wrapper = shallowMount(index, {
        props: { ...propsDefault },
      });
      wrapper.setData({ focused: true, rawInput: '12,5' });
      wrapper.vm.onBlur({});
      expect(wrapper.emitted('update:model-value')[0]).toEqual([12.5]);
    });

    it('does not emit update:model-value when rawInput is NaN', () => {
      const wrapper = shallowMount(index, {
        props: { ...propsDefault },
      });
      wrapper.setData({ focused: true, rawInput: 'abc' });
      wrapper.vm.onBlur({});
      expect(wrapper.emitted('update:model-value')).toBeUndefined();
    });
  });

  describe('displayValue', () => {
    it('returns empty string if modelValue is null', async () => {
      const wrapper = shallowMount(index, {
        props: { ...propsDefault, modelValue: null },
      });
      await wrapper.setProps({ modelValue: null });
      expect(wrapper.vm.displayValue).toBe('');
    });

    it('returns rawInput if input is focused', () => {
      const wrapper = shallowMount(index, {
        props: { ...propsDefault, modelValue: null },
      });

      wrapper.setData({ rawInput: '-', focused: true });
      expect(wrapper.vm.displayValue).toBe('-');

      wrapper.setData({ rawInput: '123,' });
      expect(wrapper.vm.displayValue).toBe('123,');
    });

    it('returns formatted number if input is not focused', () => {
      const wrapper = shallowMount(index, {
        props: { ...propsDefault, modelValue: 1234567.89 },
      });

      wrapper.setData({ focused: false });
      expect(wrapper.vm.displayValue).toBe('1 234 567,89');
    });
  });
});
