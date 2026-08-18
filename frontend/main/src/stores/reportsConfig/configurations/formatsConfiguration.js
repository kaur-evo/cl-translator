import { isSet, isArray } from 'lodash';

import setToShortenedString from '@/helpers/Set/setToShortenedString';
import listToShortenedString from '@/helpers/list/listToShortenedString';

const REPORTS_TOOLTIP_VISIBLE_ITEMS_LIMIT = 50;
export function formatSetAsStr(val) {
  if (!isSet(val)) return val;
  return setToShortenedString(val, REPORTS_TOOLTIP_VISIBLE_ITEMS_LIMIT);
}

export function formatListAsStr(val) {
  if (!isArray(val)) return val;
  return listToShortenedString(val, REPORTS_TOOLTIP_VISIBLE_ITEMS_LIMIT);
}

export function formatSetOrValAsArray(val) {
  if (val?.has) return Array.from(val);
  return [val];
}
