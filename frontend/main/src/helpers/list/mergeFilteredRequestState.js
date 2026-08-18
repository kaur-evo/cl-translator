import orderBy from 'lodash/orderBy';

export default function mergeFilteredRequest(oldItemsMap, newItems, orderByKey, isDescending, itemKey = 'id') {
  const mapClone = new Map(oldItemsMap);
  newItems.forEach((item) => {
    mapClone.delete(item[itemKey]);
  });
  const mergedItems = [...Array.from(mapClone.values()), ...newItems];
  if (orderByKey) {
    return orderBy(mergedItems, [orderByKey], [isDescending ? 'desc' : 'asc']);
  }
  return mergedItems;
}
