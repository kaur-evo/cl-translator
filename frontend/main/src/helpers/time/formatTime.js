import { format, isValid } from 'date-fns';
import { DateTime } from 'luxon';

import useProfileStore from '@/stores/profile';

export function formatTime(time, version = 'short') {
  if (!time) return '';
  const profileStore = useProfileStore();
  const formatString = profileStore.timeFormat[version];
  const dateObj = isValid(time) ? time : new Date(time);
  return format(dateObj, formatString);
}

export function formatTimeInZone(date, timeZone = 'UTC', version = 'short') {
  if (!date) return '';
  const versionMap = {
    short: 'luxonShort',
    long: 'luxonLong',
    hour: 'luxonHour',
  };

  const profileStore = useProfileStore();
  const formatString = profileStore.timeFormat[versionMap[version] ?? version];
  const dateObj = isValid(date) ? date : new Date(date);
  return DateTime.fromJSDate(dateObj).setZone(timeZone).toFormat(formatString);
}

export function formatTimeInDay(time) {
  if (!time) return '';
  const date = new Date();
  date.setHours(time.split(':')[0]);
  date.setMinutes(time.split(':')[1]);
  if (!isValid(date)) return '';
  return formatTime(date);
}
