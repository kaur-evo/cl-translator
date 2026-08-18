import { shallowMount } from '@vue/test-utils';

import ListItemToggleAll from './index.vue';

const propsDefault = {
  items: [],
  filteredItems: false,
  modelValue: [],
  itemValue: 'string',
  error: true,
  dense: true,
  disabled: true,
  disabledValues: [],
  notDisabledValues: [],
};

describe('ListItemToggleAll', () => {
  it('renders', () => {
    const wrapper = shallowMount(ListItemToggleAll, {
      props: { ...propsDefault },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly', () => {
    const wrapper = shallowMount(ListItemToggleAll, {
      props: { ...propsDefault },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  describe('listSelectionItems', () => {
    it('returns unfiltered items array if itemDisabled prop is not defined', () => {
      const wrapper = shallowMount(ListItemToggleAll, {
        props: {
          ...propsDefault,
          items: [{ id: 1, name: 'item1' }, { id: 2, name: 'item2' }, { id: 3, name: 'item3' }],
        },
      });

      expect(wrapper.vm.listSelectionItems.length).toBe(3);
      expect(wrapper.vm.listSelectionItems).toEqual([{ id: 1, name: 'item1' }, { id: 2, name: 'item2' }, { id: 3, name: 'item3' }]);
    });

    it('returns filtered items array if itemDisabled prop is defined', () => {
      const wrapper = shallowMount(ListItemToggleAll, {
        props: {
          ...propsDefault,
          items: [{ id: 1, name: 'item1' }, { id: 2, name: 'item2' }, { id: 3, name: 'item3' }],
          itemDisabled: (item) => item.id % 2 !== 0,
        },
      });

      expect(wrapper.vm.listSelectionItems.length).toBe(1);
      expect(wrapper.vm.listSelectionItems).toEqual([{ id: 2, name: 'item2' }]);
    });
  });
});
