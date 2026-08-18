import { startOfWeek, addDays } from 'date-fns';

import listToKeyMap from '@/helpers/list/listToKeyMap';
import { formatWeekday } from '@/helpers/date/formatLocaleDate';

const WEEK_DAYS = {
  SUNDAY: 6,
  MONDAY: 0,
  TUESDAY: 1,
  WEDNESDAY: 2,
  THURSDAY: 3,
  FRIDAY: 4,
  SATURDAY: 5,
};

export const formatFn = (dayOfWeek, locale, format) => formatWeekday(
  addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), dayOfWeek),
  locale,
  format,
);

export const getDaysList = (locale, firstDayOfWeek = 0) => {
  const daysArray = [
    {
      id: 'SUNDAY',
      text: formatFn(WEEK_DAYS.SUNDAY, locale, 'long'),
      shortText: formatFn(WEEK_DAYS.SUNDAY, locale, 'short'),
    },
    {
      id: 'MONDAY',
      text: formatFn(WEEK_DAYS.MONDAY, locale, 'long'),
      shortText: formatFn(WEEK_DAYS.MONDAY, locale, 'short'),
    },
    {
      id: 'TUESDAY',
      text: formatFn(WEEK_DAYS.TUESDAY, locale, 'long'),
      shortText: formatFn(WEEK_DAYS.TUESDAY, locale, 'short'),
    },
    {
      id: 'WEDNESDAY',
      text: formatFn(WEEK_DAYS.WEDNESDAY, locale, 'long'),
      shortText: formatFn(WEEK_DAYS.WEDNESDAY, locale, 'short'),
    },
    {
      id: 'THURSDAY',
      text: formatFn(WEEK_DAYS.THURSDAY, locale, 'long'),
      shortText: formatFn(WEEK_DAYS.THURSDAY, locale, 'short'),
    },
    {
      id: 'FRIDAY',
      text: formatFn(WEEK_DAYS.FRIDAY, locale, 'long'),
      shortText: formatFn(WEEK_DAYS.FRIDAY, locale, 'short'),
    },
    {
      id: 'SATURDAY',
      text: formatFn(WEEK_DAYS.SATURDAY, locale, 'long'),
      shortText: formatFn(WEEK_DAYS.SATURDAY, locale, 'short'),
    },
  ];
  return daysArray.slice(firstDayOfWeek).concat(daysArray.slice(0, firstDayOfWeek)).map((day, i) => ({ ...day, order: i }));
};

export function getDaysMap(locale, firstDayOfWeek) {
  return listToKeyMap(getDaysList(locale, firstDayOfWeek), 'id');
}
