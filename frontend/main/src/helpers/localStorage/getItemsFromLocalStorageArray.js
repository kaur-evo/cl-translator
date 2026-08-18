const getItemsFromLocalStorageArray = (storageKey, filter = '') => {
  const localStorageItems = JSON.parse(window.localStorage.getItem(storageKey)) || [];
  return localStorageItems.filter((item) => item.toLowerCase().includes(filter.toLowerCase()));
};

export default getItemsFromLocalStorageArray;
