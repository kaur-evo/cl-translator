import { isValid, format } from 'date-fns';
import { DateTime } from 'luxon';

import useProfileStore from '@/stores/profile';

export const getDate = (dateParam) => {
  if (isValid(dateParam)) {
    return dateParam;
  }
  if (dateParam.length >= 'YYYY-MM-DDTHH:mm:ss'.length && isValid(new Date(dateParam))) { // YYYY-MM-DDTHH:mm:ss + possible timezone
    return new Date(dateParam);
  }
  if (isValid(new Date(`${dateParam}T00:00:00`))) {
    return new Date(`${dateParam}T00:00:00`);
  }
  throw Error(`Invalid date: ${dateParam}`);
};

export const getFormat = (formatParam) => {
  const profileStore = useProfileStore();
  return profileStore.dateFormat[formatParam] || formatParam;
};

export const formatDate = (dateParam, formatParam) => {
  if (!dateParam) throw Error('dateParam is required');
  const date = getDate(dateParam);
  const formatString = getFormat(formatParam);
  return format(date, formatString);
};

export function formatDateInZone(dateParam, timeZone = 'UTC', formatParam = 'short') {
  if (!dateParam) return '';
  const formatString = getFormat(formatParam);
  return DateTime.fromISO(dateParam).setZone(timeZone).toFormat(formatString);
}
