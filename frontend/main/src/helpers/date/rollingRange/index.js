import {
  startOfWeek, endOfWeek, add, startOfMonth,
  endOfMonth, startOfYear, endOfYear, format, differenceInDays, differenceInMonths,
} from 'date-fns';
import { DateTime } from 'luxon';

export const getWeekRange = (offsetCount = 0, formatPattern = 'yyyy-MM-dd', options = {}) => {
  const weekStartsOn = options.weekStartsOn ?? 1;
  const startDate = startOfWeek(add(new Date(), { days: offsetCount * 7 }), { weekStartsOn });
  const endDate = endOfWeek(add(new Date(), { days: offsetCount * 7 }), { weekStartsOn });
  return [format(startDate, formatPattern), format(endDate, formatPattern)];
};

export const getMonthRange = (monthsCount = 0, offsetCount = 0, formatPattern = 'yyyy-MM-dd') => {
  const startDate = new Date();
  const endDate = add(startDate, { months: monthsCount });
  const diff = Math.abs(differenceInMonths(startDate, endDate));
  const startDateOffset = add(startDate, { months: (diff + 1) * offsetCount });
  const endDateOffset = add(endDate, { months: (diff + 1) * offsetCount });
  const resultList = [startDateOffset, endDateOffset].sort((a, b) => a - b);
  resultList[0] = startOfMonth(resultList[0]);
  resultList[1] = endOfMonth(resultList[1]);
  return resultList.map((date) => format(date, formatPattern));
};

export const getYearRange = (offsetCount = 0, formatPattern = 'yyyy-MM-dd') => {
  const startDate = startOfYear(add(new Date(), { years: offsetCount }));
  const endDate = endOfYear(add(new Date(), { years: offsetCount }));
  return [format(startDate, formatPattern), format(endDate, formatPattern)];
};

export const getDayRange = (daysCount = 0, offsetCount = 0, formatPattern = 'yyyy-MM-dd') => {
  const startDate = new Date();
  const endDate = add(startDate, { days: daysCount });
  const diff = Math.abs(differenceInDays(startDate, endDate));
  const startDateOffset = add(startDate, { days: (diff + 1) * offsetCount });
  const endDateOffset = add(endDate, { days: (diff + 1) * offsetCount });
  return [format(startDateOffset, formatPattern), format(endDateOffset, formatPattern)].sort();
};

export const getQuarterRange = (offsetCount = 0, quartersCount = 1) => {
  const startDate = DateTime.now().plus({ quarters: offsetCount }).startOf('quarter');
  const endDate = DateTime.now().plus({ quarters: offsetCount + quartersCount - 1 }).endOf('quarter');
  return [startDate.toISODate(), endDate.toISODate()];
};
