import { shallowMount } from '@vue/test-utils';
import { nextTick } from 'vue';

import index from './index.vue';

import createGlobal from '@/helpers/createGlobal';
import listToKeyMap from '@/helpers/list/listToKeyMap';

const global = createGlobal();

const createWrapper = (options) => shallowMount(index, {
  global: { ...global },
  ...options,
});

const propsDefault = {
  modelValue: ['1', '2', '3', '10'],
  label: 'Search',
  disabled: true,
  groupIdKey: 'id',
  groupLabelKey: 'name',
  itemIdKey: 'id',
  itemLabelKey: 'name',
  itemGroupIdKey: 'groupId',
  allowedItemIds: [],
  allowedGroupItemIds: [],
  groups: [],
  groupsOrderBy: 'name',
  numericOrderBy: true,
  items: [
    { id: 1, groupId: 1 },
    { id: 2, groupId: 1 },
    { id: 3, groupId: 3 },
    { id: 4, groupId: 4 },
  ],
  valid: true,
  defaultGroupsOpen: true,
  height: '288px',
  overflow: 'scroll',
  hasSelectAllOption: true,
  dense: true,
  maxWidth: 'string',
  isDropdown: true,
  disabledValues: [],
};

describe('GroupedSelection', () => {
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
  describe('selectedItemGroupIds', () => {
    it('is calculated correctly', () => {
      const wrapper = createWrapper({ props: { ...propsDefault } });
      expect(wrapper.vm.selectedItemGroupIds).toStrictEqual([1, 3]);
    });
    it('is emitted on load', async () => {
      const wrapper = createWrapper({ props: { ...propsDefault } });
      await nextTick();
      expect(wrapper.emitted()['group-selection'][0][0]).toStrictEqual([1, 3]);
    });
    it('is emitted on change', async () => {
      const wrapper = createWrapper({ props: { ...propsDefault } });
      expect(wrapper.emitted()['group-selection'][0][0]).toStrictEqual([1, 3]);
      wrapper.setProps({ modelValue: [3, 4] });
      await nextTick();
      expect(wrapper.emitted()['group-selection'][1][0]).toStrictEqual([3, 4]);
    });
  });

  describe('orderGroups', () => {
    const groups = [
      { id: 1, name: 'Test1', groupItems: [{ id: 11 }, { id: 12 }] },
      { id: -1, name: 'Predefined', groupItems: [{ id: 0 }] },
      { id: 2, name: 'asd', groupItems: [{ id: 21 }, { id: 22 }] },
      { id: 3, name: 'item1', groupItems: [{ id: 31 }, { id: 32 }] },
    ];

    it('returns default ordering of groups', () => {
      const expectedResult = [
        { id: -1, name: 'Predefined', groupItems: [{ id: 0 }] },
        { id: 2, name: 'asd', groupItems: [{ id: 21 }, { id: 22 }] },
        { id: 3, name: 'item1', groupItems: [{ id: 31 }, { id: 32 }] },
        { id: 1, name: 'Test1', groupItems: [{ id: 11 }, { id: 12 }] },
      ];
      const wrapper = createWrapper({
        props: { ...propsDefault },
      });
      wrapper.vm.groupedItems = listToKeyMap(groups, 'id');
      wrapper.vm.orderGroups();
      expect(wrapper.vm.customOrderedGroups).toEqual(expectedResult);
    });

    it('returns correct ordering of groups if value prop contains all item ids of all groups', () => {
      const expectedResult = [
        { id: -1, name: 'Predefined', groupItems: [{ id: 0 }] },
        { id: 2, name: 'asd', groupItems: [{ id: 21 }, { id: 22 }] },
        { id: 3, name: 'item1', groupItems: [{ id: 31 }, { id: 32 }] },
        { id: 1, name: 'Test1', groupItems: [{ id: 11 }, { id: 12 }] },
      ];
      const wrapper = createWrapper({ props: { ...propsDefault, modelValue: [0, 11, 12, 21, 22, 31, 32] } });

      wrapper.vm.groupedItems = listToKeyMap(groups, 'id');
      wrapper.vm.orderGroups();
      expect(wrapper.vm.customOrderedGroups).toEqual(expectedResult);
    });

    it('returns correct ordering of groups if value prop contains all item ids of one group and some item ids of another group', () => {
      const expectedResult = [
        { id: 1, name: 'Test1', groupItems: [{ id: 11 }, { id: 12 }] },
        { id: 3, name: 'item1', groupItems: [{ id: 31 }, { id: 32 }] },
        { id: -1, name: 'Predefined', groupItems: [{ id: 0 }] },
        { id: 2, name: 'asd', groupItems: [{ id: 21 }, { id: 22 }] },
      ];
      const wrapper = createWrapper({ props: { ...propsDefault, modelValue: [11, 12, 32] } });

      wrapper.vm.groupedItems = listToKeyMap(groups, 'id');
      wrapper.vm.orderGroups();
      expect(wrapper.vm.customOrderedGroups).toEqual(expectedResult);
    });
  });
  describe('emitModelValue', () => {
    it('emits modelValue when called', async () => {
      const wrapper = createWrapper({ props: { ...propsDefault } });
      wrapper.vm.emitModelValue([1, 2, 3]);
      await nextTick();

      expect(wrapper.emitted()['update:model-value'][0][0]).toStrictEqual([1, 2, 3]);
    });

    it('emits empty list when called with selected values count equal to items, emptyEqualsAllSelected true and internalSearch is empty string', async () => {
      const wrapper = createWrapper({ props: { ...propsDefault, items: [{ id: 1 }, { id: 2 }, { id: 3 }], emptyEqualsAllSelected: true } });
      wrapper.vm.emitModelValue([1, 2, 3]);
      await nextTick();

      expect(wrapper.vm.internalSearch).toBe('');
      expect(wrapper.emitted()['update:model-value'][0][0]).toStrictEqual([]);
    });

    it('emits modelValue when called with selected values count equal to items, emptyEqualsAllSelected true and internalSearch is not empty string', async () => {
      const wrapper = createWrapper({ props: { ...propsDefault, items: [{ id: 1 }, { id: 2 }, { id: 3 }], emptyEqualsAllSelected: true } });
      wrapper.vm.internalSearch = 'search';
      wrapper.vm.emitModelValue([1, 2, 3]);
      await nextTick();

      expect(wrapper.emitted()['update:model-value'][0][0]).toStrictEqual([1, 2, 3]);
    });

    it('emits modelValue when called with selected values count equal to items and emptyEqualsAllSelected false', async () => {
      const wrapper = createWrapper({ props: { ...propsDefault, items: [{ id: 1 }, { id: 2 }, { id: 3 }], emptyEqualsAllSelected: false } });
      wrapper.vm.emitModelValue([1, 2, 3]);
      await nextTick();

      expect(wrapper.emitted()['update:model-value'][0][0]).toStrictEqual([1, 2, 3]);
    });

    it('emits all but value when emptyEqualsAllSelected is true and all is selected', async () => {
      const wrapper = createWrapper({
        props: {
          ...propsDefault,
          items: [{ id: 1 }, { id: 2 }, { id: 3 }],
          emptyEqualsAllSelected: true,
          modelValue: [],
          someSelected: true,
        },
      });

      wrapper.vm.emitModelValue([1]);
      const emittedValues = wrapper.emitted('update:model-value');

      expect(emittedValues[emittedValues.length - 1][0]).toStrictEqual([2, 3]);
    });

    it('emits single value when emptyEqualsAllSelected is true and none is selected', async () => {
      const wrapper = createWrapper({
        props: {
          ...propsDefault,
          items: [{ id: 1 }, { id: 2 }, { id: 3 }],
          emptyEqualsAllSelected: true,
          modelValue: [],
          someSelected: false,
        },
      });

      wrapper.vm.emitModelValue([1]);
      const emittedValues = wrapper.emitted('update:model-value');

      expect(emittedValues[emittedValues.length - 1][0]).toStrictEqual([1]);
    });

    it('emits single value when emptyEqualsAllSelected is false and modelValue is empty', async () => {
      const wrapper = createWrapper({
        props: {
          ...propsDefault,
          items: [{ id: 1 }, { id: 2 }, { id: 3 }],
          emptyEqualsAllSelected: false,
          modelValue: [],
        },
      });

      wrapper.vm.emitModelValue([1]);
      const emittedValues = wrapper.emitted('update:model-value');

      expect(emittedValues[emittedValues.length - 1][0]).toStrictEqual([1]);
    });
  });
  describe('emitToggleAll', () => {
    it('emits modelValue when called', async () => {
      const wrapper = createWrapper({ props: { ...propsDefault } });
      wrapper.vm.emitToggleAll([1, 2, 3]);
      await nextTick();

      expect(wrapper.emitted()['toggle-all'][0][0]).toStrictEqual([1, 2, 3]);
    });

    it('emits empty list when called with selected values count equal to items, emptyEqualsAllSelected true and internalSearch is empty string', async () => {
      const wrapper = createWrapper({ props: { ...propsDefault, items: [{ id: 1 }, { id: 2 }, { id: 3 }], emptyEqualsAllSelected: true } });
      wrapper.vm.emitToggleAll([1, 2, 3]);
      await nextTick();

      expect(wrapper.vm.internalSearch).toBe('');
      expect(wrapper.emitted()['toggle-all'][0][0]).toStrictEqual([]);
    });

    it('emits modelValue when called with selected values count equal to items, emptyEqualsAllSelected true and internalSearch is not empty string', async () => {
      const wrapper = createWrapper({ props: { ...propsDefault, items: [{ id: 1 }, { id: 2 }, { id: 3 }], emptyEqualsAllSelected: true } });
      wrapper.vm.internalSearch = 'search';
      wrapper.vm.emitToggleAll([1, 2, 3]);
      await nextTick();

      expect(wrapper.emitted()['toggle-all'][0][0]).toStrictEqual([1, 2, 3]);
    });

    it('emits modelValue when called with selected values count equal to items and emptyEqualsAllSelected false', async () => {
      const wrapper = createWrapper({ props: { ...propsDefault, items: [{ id: 1 }, { id: 2 }, { id: 3 }], emptyEqualsAllSelected: false } });
      wrapper.vm.emitToggleAll([1, 2, 3]);
      await nextTick();

      expect(wrapper.emitted()['toggle-all'][0][0]).toStrictEqual([1, 2, 3]);
    });
  });

  describe('watchers', () => {
    test('that allowedItemIds change calls getGroupedItems', async () => {
      const wrapper = createWrapper({ props: { ...propsDefault, allowedItemIds: [4, 5] } });
      const spy = vi.spyOn(wrapper.vm, 'getGroupedItems');
      wrapper.setProps({ allowedItemIds: [1, 2, 3] });
      await nextTick();
      expect(spy).toHaveBeenCalledTimes(1);
    });

    test('that allowedGroupItemIds change calls getGroupedItems', async () => {
      const wrapper = createWrapper({ props: { ...propsDefault, allowedGroupItemIds: [4, 5] } });
      const spy = vi.spyOn(wrapper.vm, 'getGroupedItems');
      wrapper.setProps({ allowedGroupItemIds: [1, 2, 3] });
      await nextTick();
      expect(spy).toHaveBeenCalledTimes(1);
    });

    test('that internalSearch change calls getGroupedItems', async () => {
      const wrapper = createWrapper({ props: { ...propsDefault } });
      const spy = vi.spyOn(wrapper.vm, 'getGroupedItems');
      wrapper.setData({ internalSearch: 'search' });
      await nextTick();
      expect(spy).toHaveBeenCalledTimes(1);
    });

    test('that items change calls getGroupedItems', async () => {
      const wrapper = createWrapper({ props: { ...propsDefault, items: [{ id: 1 }] } });
      const spy = vi.spyOn(wrapper.vm, 'getGroupedItems');
      wrapper.setProps({ items: [{ id: 1 }, { id: 2 }] });
      await nextTick();
      expect(spy).toHaveBeenCalledTimes(1);
    });

    test('that groups change calls getGroupedItems', async () => {
      const wrapper = createWrapper({ props: { ...propsDefault, groups: [{ id: 1 }] } });
      const spy = vi.spyOn(wrapper.vm, 'getGroupedItems');
      wrapper.setProps({ groups: [{ id: 1 }, { id: 2 }] });
      await nextTick();
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });
});
