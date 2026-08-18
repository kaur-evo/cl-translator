import { shallowMount, flushPromises } from '@vue/test-utils';

import DoubleGroupedSelection from './index.vue';

const defaultProps = {
  modelValue: [1],
  items: [
    {
      id: 1, name: 'Station 1', factoryId: 11, groupId: 21,
    },
    {
      id: 2, name: 'Station 2', factoryId: 11, groupId: 21,
    },
    {
      id: 3, name: 'Station 3', factoryId: 12, groupId: 22,
    },
  ],
  groupedItems: [
    {
      id: 11,
      groupLabel: 'Factory 1',
      groupItems: {
        21: {
          id: 21,
          groupLabel: 'Group 1',
          subGroupItems: [
            {
              id: 1, name: 'Station 1', factoryId: 11, groupId: 21,
            },
            {
              id: 2, name: 'Station 2', factoryId: 11, groupId: 21,
            },
          ],
        },
      },
    },
    {
      id: 12,
      groupLabel: 'Factory 2',
      groupItems: {
        22: {
          id: 22,
          groupLabel: 'Group 2',
          subGroupItems: [
            {
              id: 3, name: 'Station 3', factoryId: 12, groupId: 22,
            },
          ],
        },
      },
    },
  ],
  dense: false,
};

describe('DoubleGroupedSelection', () => {
  it('renders', () => {
    const wrapper = shallowMount(DoubleGroupedSelection, {
      props: { ...defaultProps },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly', async () => {
    const wrapper = shallowMount(DoubleGroupedSelection, {
      props: { ...defaultProps },
    });

    await flushPromises();
    expect(wrapper.element).toMatchSnapshot();
  });

  test('that orderedGroupsList returns groupedItems sorted by groupLabel', async () => {
    const wrapper = shallowMount(DoubleGroupedSelection, {
      props: {
        groupedItems: [
          { id: 1, groupLabel: 'group', groupItems: {} },
          { id: 2, groupLabel: 'asd', groupItems: {} },
          { id: 3, groupLabel: 'test', groupItems: {} },
        ],
      },
    });

    await flushPromises();
    expect(wrapper.vm.orderedGroupsList).toStrictEqual([
      { id: 2, groupLabel: 'asd', groupItems: {} },
      { id: 1, groupLabel: 'group', groupItems: {} },
      { id: 3, groupLabel: 'test', groupItems: {} },
    ]);
  });

  describe('updateOpenGroups', () => {
    it('returns empty openGroups array when no item is selected', async () => {
      const wrapper = shallowMount(DoubleGroupedSelection, {
        props: { ...defaultProps, modelValue: [] },
      });

      await flushPromises();
      wrapper.vm.updateOpenGroups();
      expect(wrapper.vm.openGroups).toStrictEqual([]);
    });

    it('returns openGroups array with group and subgroup id when item is selected', async () => {
      const wrapper = shallowMount(DoubleGroupedSelection, {
        props: { ...defaultProps },
      });

      await flushPromises();
      wrapper.vm.updateOpenGroups();
      expect(wrapper.vm.openGroups).toStrictEqual(['group-value-11', 'sub-group-value-11-21']);
    });
  });
});
