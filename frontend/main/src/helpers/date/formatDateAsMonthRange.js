import {
  startOfMonth, endOfMonth, isBefore, isAfter, isDate, format,
} from 'date-fns';

import { defaultLocalizationOptions, dateFormatsMap } from '@/constants/formattingConstants';
import parseDateStr from '@/helpers/date/parseDateStr';

export default (_date, min, max, formatString = dateFormatsMap[defaultLocalizationOptions.dateFormat].long) => {
  const date = isDate(_date) ? _date : new Date(_date);
  let monthStart = startOfMonth(date);
  let monthEnd = endOfMonth(date);

  if (min) {
    const rangeStartDate = isDate(min) ? min : parseDateStr(min);
    if (isBefore(monthStart, rangeStartDate)) monthStart = rangeStartDate;
  }

  if (max) {
    const rangeEndDate = isDate(max) ? max : parseDateStr(max);
    if (isAfter(monthEnd, rangeEndDate)) monthEnd = rangeEndDate;
  }
  return `${format(monthStart, formatString)} - ${format(monthEnd, formatString)}`;
};
