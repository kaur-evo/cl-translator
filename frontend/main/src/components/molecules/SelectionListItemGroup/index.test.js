import { shallowMount } from '@vue/test-utils';

import SelectionListItemGroup from './index.vue';

const propsDefault = {
  items: [],
  isSingleSelect: true,
  error: true,
  search: 'string',
  itemFlag: 'null',
  listSelection: null,
  itemTertiaryTextClasses: 'string',
  itemTertiaryTextStyle: {},
  dark: null,
  disabledValues: [],
  disabled: true,
  dense: true,
};

describe('SelectionListItemGroup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders', () => {
    const wrapper = shallowMount(SelectionListItemGroup, {
      props: { ...propsDefault },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly', () => {
    const wrapper = shallowMount(SelectionListItemGroup, {
      props: {
        ...propsDefault,
        items: [{ id: 1, name: 'item1', ordering: 1 }, { id: 2, name: 'item2', ordering: 2 }],
        listSelection: {
          getItemValue: () => 1, isItemSelected: () => true, getItemText: () => 'item1', getItemSecondaryText: () => 'secondary', getItemTertiaryText: () => 'tertiary',
        },
      },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  describe('getIconColor', () => {
    it('returns icon color from iconColor prop if it exists', () => {
      const wrapper = shallowMount(SelectionListItemGroup, {
        props: { ...propsDefault, iconColor: () => 'primary' },
      });

      expect(wrapper.vm.getIconColor()).toBe('primary');
    });

    it('returns icon color by itemIconColorKey if iconColor prop does not exist', () => {
      const wrapper = shallowMount(SelectionListItemGroup, {
        props: { ...propsDefault, iconColor: null, itemIconColorKey: 'iconColor' },
      });

      expect(wrapper.vm.getIconColor({ id: 1, name: 'item1', iconColor: 'primary' })).toBe('primary');
    });
  });

  describe('shouldShowAppendOnHover', () => {
    it('returns result if showAppendOnHover type Function', () => {
      const wrapper = shallowMount(SelectionListItemGroup, {
        props: { ...propsDefault, showAppendOnHover: () => true },
      });

      expect(wrapper.vm.shouldShowAppendOnHover()).toBe(true);
    });

    it('returns false if showAppendOnHover is undefined', () => {
      const wrapper = shallowMount(SelectionListItemGroup, {
        props: { ...propsDefault, showAppendOnHover: undefined },
      });

      expect(wrapper.vm.shouldShowAppendOnHover()).toBe(false);
    });

    it('returns false if showAppendOnHover is null', () => {
      const wrapper = shallowMount(SelectionListItemGroup, {
        props: { ...propsDefault, showAppendOnHover: null },
      });

      expect(wrapper.vm.shouldShowAppendOnHover()).toBe(false);
    });

    it('returns false if showAppendOnHover is false', () => {
      const wrapper = shallowMount(SelectionListItemGroup, {
        props: { ...propsDefault, showAppendOnHover: false },
      });

      expect(wrapper.vm.shouldShowAppendOnHover()).toBe(false);
    });

    it('returns true if showAppendOnHover is true', () => {
      const wrapper = shallowMount(SelectionListItemGroup, {
        props: { ...propsDefault, showAppendOnHover: true },
      });

      expect(wrapper.vm.shouldShowAppendOnHover()).toBe(true);
    });
  });
});
