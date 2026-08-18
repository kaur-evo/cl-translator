const addItemToLocalStorageArray = (itemToAdd, storageKey, itemsLimit = 10) => {
  if (!itemToAdd) return;
  let items = window.localStorage.getItem(storageKey) ? JSON.parse(window.localStorage.getItem(storageKey)) : [];
  items.unshift(itemToAdd);
  items = [...new Set(items)];
  if (items.length > itemsLimit) {
    items = items.slice(0, itemsLimit);
  }
  window.localStorage.setItem(storageKey, JSON.stringify(items));
};

export default addItemToLocalStorageArray;
