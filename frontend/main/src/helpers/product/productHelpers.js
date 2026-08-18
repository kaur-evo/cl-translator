export function getProductNamesArray(productIds, productsMap, count = 10) {
  const namedIds = productIds.slice(0, count);
  const otherIds = productIds.slice(count);
  const productNames = namedIds.map((productId) => productsMap?.[productId]?.name ?? '');
  return [...productNames, ...otherIds];
}

export function getFirstProductIds(itemsList, location = '', count = 10) {
  const productIds = itemsList.reduce((acc, item) => {
    acc.push(...item[location].productIds.slice(0, count));
    return acc;
  }, []);
  return Array.from(new Set(productIds));
}
