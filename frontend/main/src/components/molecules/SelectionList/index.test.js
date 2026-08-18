import { shallowMount } from '@vue/test-utils';

import index from './index.vue';

const propsDefault = {
  modelValue: [],
  itemText: 'text',
  itemFlag: 'string',
  itemSecondaryText: 'string',
  itemTertiaryText: 'string',
  itemValue: 'value',
  items: [],
  valid: true,
  color: 'primary',
  prependInnerIcon: 'string',
  loading: true,
  height: '350px',
  maxHeight: 'string',
  placeholder: 'string',
  hideSearch: true,
  itemDisabled: vi.fn(),
  fillHeight: true,
  dense: true,
  search: 'string',
  maxWidth: 'string',
  emptyEqualsAllSelected: true,
};

describe('SelectionList', () => {
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

  test('that toggleAllSelected calls emitModelValue and emitToggleAll methods with expected value', () => {
    const wrapper = shallowMount(index, {
      props: { ...propsDefault },
    });

    const emitModelValueSpy = vi.spyOn(wrapper.vm, 'emitModelValue');
    const emitToggleAllSpy = vi.spyOn(wrapper.vm, 'emitToggleAll');

    wrapper.vm.toggleAllSelected([1, 2, 3]);

    expect(emitModelValueSpy).toHaveBeenCalledWith([1, 2, 3]);
    expect(emitToggleAllSpy).toHaveBeenCalledWith([1, 2, 3]);
  });

  describe('emitModelValue', () => {
    const items = [
      { value: 1, text: 'A' },
      { value: 2, text: 'B' },
      { value: 3, text: 'C' },
    ];

    it('emits correct values when all values become selected', () => {
      const wrapper = shallowMount(index, {
        props: { ...propsDefault, items },
      });

      wrapper.vm.emitModelValue([1, 2, 3]);
      expect(wrapper.emitted('update:model-value')[0][0]).toEqual([]);
      expect(wrapper.emitted('update:some-selected')[0][0]).toEqual(true);
    });

    it('emits correct values when all values become selected, but emptyEqualsAllSelected is false', () => {
      const wrapper = shallowMount(index, {
        props: { ...propsDefault, items, emptyEqualsAllSelected: false },
      });

      wrapper.vm.emitModelValue([1, 2, 3]);
      expect(wrapper.emitted('update:model-value')[0][0]).toEqual([1, 2, 3]);
      expect(wrapper.emitted('update:some-selected')[0][0]).toEqual(true);
    });

    it('emits correct values when some values become selected', () => {
      const wrapper = shallowMount(index, {
        props: { ...propsDefault, items },
      });

      wrapper.vm.emitModelValue([1]);
      expect(wrapper.emitted('update:model-value')[0][0]).toEqual([1]);
      expect(wrapper.emitted('update:some-selected')[0][0]).toEqual(true);
    });

    it('emits correct values when all values are already selected and one value becomes deselected', () => {
      const wrapper = shallowMount(index, {
        props: { ...propsDefault, items, modelValue: [1, 2, 3] },
      });

      wrapper.vm.emitModelValue([1]);
      expect(wrapper.emitted('update:model-value')[0][0]).toEqual([2, 3]);
      expect(wrapper.emitted('update:some-selected')[0][0]).toEqual(true);
    });
  });

  describe('emitToggleAll', () => {
    const items = [
      { value: 1, text: 'A' },
      { value: 2, text: 'B' },
      { value: 3, text: 'C' },
    ];

    it('emits correct values when all values become selected', () => {
      const wrapper = shallowMount(index, {
        props: { ...propsDefault, items },
      });

      wrapper.vm.emitToggleAll([1, 2, 3]);
      expect(wrapper.emitted('toggle-all')[0][0]).toEqual([]);
      expect(wrapper.emitted('update:some-selected')[0][0]).toEqual(true);
    });

    it('emits correct values when all values become selected, but emptyEqualsAllSelected is false', () => {
      const wrapper = shallowMount(index, {
        props: { ...propsDefault, items, emptyEqualsAllSelected: false },
      });

      wrapper.vm.emitToggleAll([1, 2, 3]);
      expect(wrapper.emitted('toggle-all')[0][0]).toEqual([1, 2, 3]);
      expect(wrapper.emitted('update:some-selected')[0][0]).toEqual(true);
    });

    it('emits correct values when some values become selected', () => {
      const wrapper = shallowMount(index, {
        props: { ...propsDefault, items },
      });

      wrapper.vm.emitToggleAll([1, 2]);
      expect(wrapper.emitted('toggle-all')[0][0]).toEqual([1, 2]);
      expect(wrapper.emitted('update:some-selected')[0][0]).toEqual(true);
    });

    it('emits correct values when all values become deselected', () => {
      const wrapper = shallowMount(index, {
        props: { ...propsDefault, items, modelValue: [1, 2, 3] },
      });

      wrapper.vm.emitToggleAll([]);
      expect(wrapper.emitted('toggle-all')[0][0]).toEqual([]);
      expect(wrapper.emitted('update:some-selected')[0][0]).toEqual(false);
    });
  });
});
