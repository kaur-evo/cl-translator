import isFunction from 'lodash/isFunction';

export default function calcObjKeys(obj, keysMap) {
  if (keysMap === undefined || keysMap.size === 0) return obj;
  const objCopy = { ...obj };
  [...keysMap.keys()].forEach((targetKey) => {
    const value = keysMap.get(targetKey);
    if (isFunction(value)) {
      objCopy[targetKey] = value(obj);
    } else {
      objCopy[targetKey] = value;
    }
  });
  return objCopy;
}
