import { shallowMount } from '@vue/test-utils';

import index from './index.vue';

import createGlobal from '@/helpers/createGlobal';

const global = createGlobal();

const createWrapper = (options) => shallowMount(index, {
  global: { ...global },
  ...options,
});

const propsDefault = {
  modelValue: [],
  items: [
    { id: 1, name: 'Name1', deleted: false },
    { id: 2, name: 'Test1', deleted: false },
    { id: 3, name: 'Name11', deleted: true },
    { id: 0, name: 'Predefined', deleted: false },
    { id: 4, name: 'asd', deleted: false },
    { id: 5, name: 'item1', deleted: true },
  ],
  itemText: 'string',
  itemSecondaryText: 'string',
  itemTertiaryText: 'string',
  itemTertiaryTextClasses: 'string',
  itemFlag: 'string',
  itemValue: 'string',
  menuOpen: true,
  groups: [],
  groupIdKey: 'id',
  itemGroupIdKey: 'groupId',
  dense: true,
  hasActions: true,
  isGrouped: true,
};

describe('SelectionMenu', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders', () => {
    const wrapper = createWrapper({
      props: { ...propsDefault },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly', () => {
    const wrapper = createWrapper({
      props: { ...propsDefault },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  describe('showActions', () => {
    it('returns false if isSingleSelect is true', () => {
      const wrapper = createWrapper({ props: { ...propsDefault, isSingleSelect: true, hasActions: true } });
      expect(wrapper.vm.showActions).toBe(false);
    });

    it('returns false if hasActions is false', () => {
      const wrapper = createWrapper({ props: { ...propsDefault, isSingleSelect: false, hasActions: false } });
      expect(wrapper.vm.showActions).toBe(false);
    });

    it('returns true if isSingleSelect is false and hasActions is true', () => {
      const wrapper = createWrapper({ props: { ...propsDefault, isSingleSelect: false, hasActions: true } });
      expect(wrapper.vm.showActions).toBe(true);
    });
  });

  describe('orderedItems', () => {
    it('returns default ordering of items', () => {
      const expectedResult = [
        { id: 0, name: 'Predefined', deleted: false },
        { id: 4, name: 'asd', deleted: false },
        { id: 1, name: 'Name1', deleted: false },
        { id: 2, name: 'Test1', deleted: false },
        { id: 5, name: 'item1', deleted: true },
        { id: 3, name: 'Name11', deleted: true },
      ];
      const wrapper = createWrapper({ props: { ...propsDefault, useCustomSorting: true } });
      wrapper.vm.setOrderedItems();
      expect(wrapper.vm.orderedItems).toEqual(expectedResult);
    });

    it('returns correct ordering of items if value prop contains all ids', () => {
      const expectedResult = [
        { id: 0, name: 'Predefined', deleted: false },
        { id: 4, name: 'asd', deleted: false },
        { id: 1, name: 'Name1', deleted: false },
        { id: 2, name: 'Test1', deleted: false },
        { id: 5, name: 'item1', deleted: true },
        { id: 3, name: 'Name11', deleted: true },
      ];
      const wrapper = createWrapper({ props: { ...propsDefault, useCustomSorting: true, modelValue: [0, 1, 2, 3, 4, 5] } });
      wrapper.vm.setOrderedItems();
      expect(wrapper.vm.orderedItems).toEqual(expectedResult);
    });

    it('returns correct ordering of items if value prop contains all non-deleted items ids', () => {
      const expectedResult = [
        { id: 0, name: 'Predefined', deleted: false },
        { id: 4, name: 'asd', deleted: false },
        { id: 1, name: 'Name1', deleted: false },
        { id: 2, name: 'Test1', deleted: false },
        { id: 5, name: 'item1', deleted: true },
        { id: 3, name: 'Name11', deleted: true },
      ];
      const wrapper = createWrapper({ props: { ...propsDefault, useCustomSorting: true, modelValue: [0, 1, 2, 4] } });
      wrapper.vm.setOrderedItems();
      expect(wrapper.vm.orderedItems).toEqual(expectedResult);
    });

    it('returns correct ordering of items if value prop contains all deleted items ids', () => {
      const expectedResult = [
        { id: 5, name: 'item1', deleted: true },
        { id: 3, name: 'Name11', deleted: true },
        { id: 0, name: 'Predefined', deleted: false },
        { id: 4, name: 'asd', deleted: false },
        { id: 1, name: 'Name1', deleted: false },
        { id: 2, name: 'Test1', deleted: false },
      ];
      const wrapper = createWrapper({ props: { ...propsDefault, useCustomSorting: true, modelValue: [3, 5] } });
      wrapper.vm.setOrderedItems();
      expect(wrapper.vm.orderedItems).toEqual(expectedResult);
    });

    it('returns correct ordering of items if value prop contains predefined, one non-deleted and one deleted item ids', () => {
      const expectedResult = [
        { id: 0, name: 'Predefined', deleted: false },
        { id: 2, name: 'Test1', deleted: false },
        { id: 5, name: 'item1', deleted: true },
        { id: 4, name: 'asd', deleted: false },
        { id: 1, name: 'Name1', deleted: false },
        { id: 3, name: 'Name11', deleted: true },
      ];
      const wrapper = createWrapper({ props: { ...propsDefault, useCustomSorting: true, modelValue: [0, 2, 5] } });
      wrapper.vm.setOrderedItems();
      expect(wrapper.vm.orderedItems).toEqual(expectedResult);
    });
  });

  describe('onValueChange', () => {
    it('emits the correct event when value changes', async () => {
      const wrapper = createWrapper({
        props: { ...propsDefault },
      });

      wrapper.vm.onValueChange([1, 2]);
      expect(wrapper.emitted()).toHaveProperty('change');
      expect(wrapper.emitted('change')[0]).toEqual([[1, 2]]);
    });

    it('calls onMenuChange if isSingleSelect is true', async () => {
      const wrapper = createWrapper({
        props: { ...propsDefault, isSingleSelect: true },
      });

      const onMenuChangeSpy = vi.spyOn(wrapper.vm, 'onMenuChange');
      wrapper.vm.onValueChange([1]);
      expect(onMenuChangeSpy).toHaveBeenCalled();
    });

    it('does not call onMenuChange if not isSingleSelect', async () => {
      const wrapper = createWrapper({
        props: { ...propsDefault, isSingleSelect: false },
      });

      const onMenuChangeSpy = vi.spyOn(wrapper.vm, 'onMenuChange');
      wrapper.vm.onValueChange([1]);
      expect(onMenuChangeSpy).not.toHaveBeenCalled();
    });
  });
});
