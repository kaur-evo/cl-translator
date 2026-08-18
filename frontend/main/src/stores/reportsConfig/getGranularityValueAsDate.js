import weekOfYearToDate from '@/helpers/date/weekOfYearToDate';
import monthOfYearToDate from '@/helpers/date/monthOfYearToDate';
import yearToDate from '@/helpers/date/yearToDate';
import granularityType from '@/stores/reportsConfig/constants/granularity';
import parseDateStr from '@/helpers/date/parseDateStr';
import quarterToDate from '@/helpers/date/quarterToDate';
import dayOfWeekToDate from '@/helpers/date/dayOfWeekToDate';

export default function getGranularityValueAsDate(val, granularity) {
  const dateReturnGranularities = new Set([granularityType.STARTTIME, granularityType.DUE_TIME]);
  if (dateReturnGranularities.has(granularity)) {
    return new Date(val);
  }
  if (granularity === granularityType.DATE) {
    try {
      return parseDateStr(val);
    } catch {
      return null;
    }
  }
  if (granularity === granularityType.DAYOFWEEK) {
    return dayOfWeekToDate(val);
  }
  if (granularity === granularityType.WEEKOFYEAR) {
    return weekOfYearToDate(val);
  }
  if (granularity === granularityType.QUARTER) {
    return quarterToDate(val);
  }
  if (granularity === granularityType.MONTH) {
    return monthOfYearToDate(val);
  }
  if (granularity === granularityType.YEAR) {
    return yearToDate(val);
  }
  if (granularity === granularityType.TOTAL) {
    return null;
  }
  throw new Error(`Granularity ${granularity} not supported in getGranularityValueAsDate`);
}
