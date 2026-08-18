import { shallowMount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { mdiThumbUp } from '@mdi/js';

import index from './index.vue';

const propsDefault = {
  modelValue: [],
  items: [],
  placeholder: 'string',
  hint: 'string',
  required: true,
  isSingleSelect: true,
  itemText: 'name',
  itemSecondaryText: 'string',
  itemTertiaryText: 'string',
  itemFlag: 'string',
  itemValue: 'id',
  isGroupedSelect: true,
  groups: [],
  groupIdKey: 'id',
  itemGroupIdKey: 'groupId',
  groupsOrderBy: 'name',
  numericOrderBy: true,
  itemDisabled: (val) => val || {},
  disabledValues: [],
  loading: true,
  dense: true,
  hideSearch: true,
};

describe('SelectionInput', () => {
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

  it('renders correctly when useChips is true', () => {
    const wrapper = shallowMount(index, {
      props: { ...propsDefault, useChips: true },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly when menuOpen prop is true', () => {
    const wrapper = shallowMount(index, {
      props: { ...propsDefault, menuOpen: true },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  describe('sanitizeSelection', () => {
    it('removes non-existent values', async () => {
      const wrapper = shallowMount(index, {
        props: {
          ...propsDefault,
          removeNonExistentSelections: true,
          itemsMap: {
            1: {},
          },
          modelValue: [1, 2],
        },
      });

      wrapper.vm.sanitizeSelection();
      await nextTick();
      expect(wrapper.emitted('update:model-value')[0][0]).toEqual([1]);
    });
  });

  describe('selectedItemIcon', () => {
    it('returns null when modelValue is empty', () => {
      const wrapper = shallowMount(index, {
        props: { ...propsDefault, modelValue: [], iconKey: 'icon' },
      });

      expect(wrapper.vm.selectedItemIcon).toBeNull();
    });

    it('returns null when iconKey is not set', () => {
      const wrapper = shallowMount(index, {
        props: { ...propsDefault, modelValue: [1], iconKey: null },
      });

      expect(wrapper.vm.selectedItemIcon).toBeNull();
    });

    it('returns the icon value from the first selected item', () => {
      const wrapper = shallowMount(index, {
        props: {
          ...propsDefault,
          modelValue: [1],
          iconKey: 'icon',
          itemsMap: { 1: { icon: mdiThumbUp } },
        },
      });

      expect(wrapper.vm.selectedItemIcon).toBe(mdiThumbUp);
    });

    it('returns null when the first selected item does not have the iconKey', () => {
      const wrapper = shallowMount(index, {
        props: {
          ...propsDefault,
          modelValue: [1],
          iconKey: 'icon',
          itemsMap: { 1: { name: 'Item 1' } },
        },
      });

      expect(wrapper.vm.selectedItemIcon).toBeNull();
    });
  });

  test('that onMenuOpened sets internalMenuOpen if menuOpen prop does not exist', () => {
    const wrapper = shallowMount(index, {
      props: { ...propsDefault },
    });

    expect(wrapper.vm.internalMenuOpen).toBe(false);
    wrapper.vm.onMenuOpened(true);
    expect(wrapper.vm.internalMenuOpen).toBe(true);
  });
});
