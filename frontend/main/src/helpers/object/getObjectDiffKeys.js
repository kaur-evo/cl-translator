import { isEqual } from 'lodash';

export default function getObjectDiffKeys(obj1, obj2) {
  const newKeys = Object.keys(obj1);
  const oldKeys = Object.keys(obj2);
  const allKeysSet = new Set([...newKeys, ...oldKeys]);
  newKeys.forEach((key) => {
    if (isEqual(obj1[key], obj2[key])) {
      allKeysSet.delete(key);
    }
  });
  return Array.from(allKeysSet);
}
