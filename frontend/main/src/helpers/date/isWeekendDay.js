
import parseDateStr from '@/helpers/date/parseDateStr';

export const isWeekendDay = (date) => {
  const SATURDAY = 6;
  const SUNDAY = 0;
  const dayOfWeek = parseDateStr(date).getDay();
  return dayOfWeek === SUNDAY || dayOfWeek === SATURDAY;
};
