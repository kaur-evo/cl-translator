import {
  isObject, isNumber, isString, isFunction,
} from 'lodash';

export default function handleMultiTypeProp(entity, propVal, fallback = '') {
  if (isFunction(propVal)) {
    return propVal(entity);
  }
  if (propVal && (isString(propVal) || isNumber(propVal))) {
    if (isObject(entity)) return entity[propVal];
    if (fallback) return fallback;
  }
  if (isString(entity)) return entity;
  return fallback;
}
