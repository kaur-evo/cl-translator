import { isFunction, isArray } from 'lodash';

export default function filterAndMap(list, filterFunc, mapFunc) {
  return list.reduce((newList, item, index) => {
    if (filterFunc) {
      let isValid = false;
      if (isArray(filterFunc)) {
        isValid = filterFunc.every((func) => func(item, index));
      } else if (isFunction(filterFunc)) {
        isValid = filterFunc(item, index);
      }
      if (!isValid) {
        return newList;
      }
    }
    newList.push(mapFunc(item, index));
    return newList;
  }, []);
}
