const UNGROUPED_KEY = '-2';
export function getGroupedItems({
  search,
  items,
  groupsMap,
  itemGroupIdKey,
  groupLabelKey,
  itemLabelKey,
  secondaryItemLabelKey,
  groupsOrderBy,
  defaultGroupsOpen,
  unGroupedLabel,
  searchBySecondaryText,
}) {
  const matchesSearch = (val) => String(val).toLowerCase().includes(String(search).toLowerCase());
  const filteredItemsList = [];
  const itemGroupsMap = items.reduce((acc, item) => {
    const itemGroupId = item[itemGroupIdKey];
    const existsInGroup = itemGroupId in groupsMap;
    const groupingKey = existsInGroup ? itemGroupId : UNGROUPED_KEY;

    const matchingGroup = existsInGroup && matchesSearch(groupsMap[groupingKey][groupLabelKey]);
    const matchingPrimaryText = matchesSearch(item[itemLabelKey]);
    const matchingSecondaryText = searchBySecondaryText && secondaryItemLabelKey && matchesSearch(item[secondaryItemLabelKey]);
    const matchingItem = matchingPrimaryText || matchingSecondaryText;
    const isGroupOpen = !!search.length && matchingItem;

    // matches search
    if (!matchingItem && !matchingGroup) return acc; // did not match search, make no updates for row in accumulator
    filteredItemsList.push(item);
    // group exists in groups map, push more items into group
    if (groupingKey in acc) {
      acc[groupingKey].groupItems.push(item);
      if (isGroupOpen) acc[groupingKey].isOpen = true;
      return acc;
    }
    // group does not exist in groups map, create group with item
    let newGroup = {
      groupItems: [item],
      isOpen: defaultGroupsOpen || (isGroupOpen),
    };
    if (existsInGroup) {
      newGroup = {
        ...newGroup,
        ...groupsMap[groupingKey],
        groupLabel: groupsMap[groupingKey][groupLabelKey],
        [groupsOrderBy]: groupsMap[groupingKey][groupsOrderBy],
      };
    } else {
      newGroup = {
        ...newGroup,
        groupLabel: unGroupedLabel,
      };
    }

    return {
      ...acc,
      [groupingKey]: newGroup,
    };
  }, {});

  const groupKeys = Object.keys(itemGroupsMap);
  if (!search.length && groupKeys.length === 1) {
    itemGroupsMap[groupKeys[0]].isOpen = true;
  }

  return { filteredItemsList, itemGroupsMap };
}
