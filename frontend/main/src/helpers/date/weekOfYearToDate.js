import { DateTime } from 'luxon';

import parseDateStr from './parseDateStr';

export default (woyString) => {
  const year = parseInt(woyString.substring(0, 4), 10);
  const week = parseInt(woyString.substring(4), 10);

  // Start from the first day of the year
  const firstDayOfYear = DateTime.fromObject({ year, month: 1, day: 1 }, { zone: 'UTC' });
  const offsetFromMonday = firstDayOfYear.weekday - 1;

  let firstMondayOfYear;

  if (offsetFromMonday === 0) {
    firstMondayOfYear = firstDayOfYear;
  } else if (offsetFromMonday > 3) {
    firstMondayOfYear = firstDayOfYear.plus({ days: 7 - offsetFromMonday });
  } else {
    firstMondayOfYear = firstDayOfYear.minus({ days: offsetFromMonday });
  }

  // Calculate the date of the Monday in the given week
  const mondayOfWeek = firstMondayOfYear.plus({ weeks: week - 1 });

  // formating and parsing back to Date object is workaround for timezone issue
  const dateString = mondayOfWeek.toFormat('yyyy-MM-dd');

  return parseDateStr(dateString);
};
