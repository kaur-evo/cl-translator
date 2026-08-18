import { getGroupedItems } from './getGroupedItems';
const unGroupedLabel = 'UnGrOuPeD';
const itemsList = [{
  id: 0,
  label: 'item-0',
  groupId: 0,
}, {
  id: 1,
  label: 'item-1',
  groupId: 0,
}, {
  id: 2,
  label: 'item-2',
  groupId: 1,
},
{
  id: 3,
  label: 'item-3',
  groupId: 1,
},
{
  id: 4,
  label: 'item-4',
  groupId: 1,
}];
const groupsMap = {
  0: {
    id: 0,
    label: 'group-0',
  },
  1: {
    id: 1,
    label: 'group-1',
  },
};
describe('processGroupedSelection', () => {
  it('creates a map of group objects with items belonging inside in another list of objects', () => {
    const groupedItems = getGroupedItems({
      search: '',
      items: itemsList,
      groupsMap,
      itemGroupIdKey: 'groupId',
      groupLabelKey: 'label',
      itemLabelKey: 'label',
      groupsOrderBy: 'label',
      defaultGroupsOpen: false,
      unGroupedLabel,
    });
    expect(groupedItems).toStrictEqual({
      itemGroupsMap: {
        0: {
          groupItems: [
            {
              groupId: 0,
              id: 0,
              label: 'item-0',
            },
            {
              groupId: 0,
              id: 1,
              label: 'item-1',
            },
          ],
          groupLabel: 'group-0',
          id: 0,
          isOpen: false,
          label: 'group-0',
        },
        1: {
          groupItems: [
            {
              groupId: 1,
              id: 2,
              label: 'item-2',
            },
            {
              groupId: 1,
              id: 3,
              label: 'item-3',
            },
            {
              groupId: 1,
              id: 4,
              label: 'item-4',
            },
          ],
          groupLabel: 'group-1',
          id: 1,
          isOpen: false,
          label: 'group-1',
        },
      },
      filteredItemsList: [
        {
          groupId: 0,
          id: 0,
          label: 'item-0',
        },
        {
          groupId: 0,
          id: 1,
          label: 'item-1',
        },
        {
          groupId: 1,
          id: 2,
          label: 'item-2',
        },
        {
          groupId: 1,
          id: 3,
          label: 'item-3',
        },
        {
          groupId: 1,
          id: 4,
          label: 'item-4',
        },
      ],
    });
  });
  it('correct search results', () => {
    const groupedItems = getGroupedItems({
      search: '-0',
      items: itemsList,
      groupsMap,
      itemGroupIdKey: 'groupId',
      groupLabelKey: 'label',
      itemLabelKey: 'label',
      groupsOrderBy: 'label',
      defaultGroupsOpen: false,
      unGroupedLabel,
    });
    expect(groupedItems).toStrictEqual({
      itemGroupsMap: {
        0: {
          groupItems: [
            {
              groupId: 0,
              id: 0,
              label: 'item-0',
            },
            {
              groupId: 0,
              id: 1,
              label: 'item-1',
            },
          ],
          groupLabel: 'group-0',
          id: 0,
          isOpen: true,
          label: 'group-0',
        },
      },
      filteredItemsList: [
        {
          groupId: 0,
          id: 0,
          label: 'item-0',
        },
        {
          groupId: 0,
          id: 1,
          label: 'item-1',
        },
      ],
    });
  });
  it('creates a ungrouped group for items not matching group', () => {
    const groupedItems = getGroupedItems({
      search: '',
      items: [...itemsList, {
        id: 5,
        label: 'item-6',
        groupId: 2,
      }],
      groupsMap,
      itemGroupIdKey: 'groupId',
      groupLabelKey: 'label',
      itemLabelKey: 'label',
      groupsOrderBy: 'label',
      defaultGroupsOpen: false,
      unGroupedLabel,
    });
    expect(groupedItems).toStrictEqual({
      itemGroupsMap: {
        0: {
          groupItems: [
            {
              groupId: 0,
              id: 0,
              label: 'item-0',
            },
            {
              groupId: 0,
              id: 1,
              label: 'item-1',
            },
          ],
          groupLabel: 'group-0',
          id: 0,
          isOpen: false,
          label: 'group-0',
        },
        1: {
          groupItems: [
            {
              groupId: 1,
              id: 2,
              label: 'item-2',
            },
            {
              groupId: 1,
              id: 3,
              label: 'item-3',
            },
            {
              groupId: 1,
              id: 4,
              label: 'item-4',
            },
          ],
          groupLabel: 'group-1',
          id: 1,
          isOpen: false,
          label: 'group-1',
        },
        '-2': {
          groupItems: [
            {
              groupId: 2,
              id: 5,
              label: 'item-6',
            },
          ],
          groupLabel: 'UnGrOuPeD',
          isOpen: false,
        },
      },
      filteredItemsList: [
        {
          groupId: 0,
          id: 0,
          label: 'item-0',
        },
        {
          groupId: 0,
          id: 1,
          label: 'item-1',
        },
        {
          groupId: 1,
          id: 2,
          label: 'item-2',
        },
        {
          groupId: 1,
          id: 3,
          label: 'item-3',
        },
        {
          groupId: 1,
          id: 4,
          label: 'item-4',
        },
        {
          groupId: 2,
          id: 5,
          label: 'item-6',
        },
      ],
    });
  });
});
