import {
  startOfYear,
  endOfYear,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isBefore,
  format,
  isAfter,
  startOfQuarter,
  endOfQuarter,
} from 'date-fns';

import parseDateStr from '@/helpers/date/parseDateStr';
import weekOfYearToDate from '@/helpers/date/weekOfYearToDate';
import monthOfYearToDate from '@/helpers/date/monthOfYearToDate';
import quarterToDate from '@/helpers/date/quarterToDate';
import yearToDate from '@/helpers/date/yearToDate';
import granularityType from '@/stores/reportsConfig/constants/granularity';
import configType from '@/stores/reportsConfig/constants/configType';

export const microGranularitiesConfig = new Map([
  [configType.DOWNTIME, {
    granularity: granularityType.STARTTIME,
  }],
  [configType.CHECKLIST, {
    granularity: granularityType.DUE_TIME,
  }],
]);

export default function calculateDatapointDateRange({
  rangeStart, rangeEnd, granularity, groupingKey, cfgType, weekStartsOn, isDrilldown,
}) {
  const rangeStartDt = parseDateStr(rangeStart);
  const rangeEndDt = parseDateStr(rangeEnd);

  let newRangeStartDt = rangeStartDt;
  let newRangeEndDt = rangeEndDt;
  if (granularity === granularityType.DATE && (!isDrilldown || microGranularitiesConfig.has(cfgType))) {
    const newDate = parseDateStr(groupingKey);
    newRangeStartDt = newDate;
    newRangeEndDt = newDate;
  } else if (granularity === granularityType.WEEKOFYEAR) {
    const newDate = weekOfYearToDate(groupingKey);
    newRangeStartDt = startOfWeek(newDate, { weekStartsOn });
    newRangeEndDt = endOfWeek(newDate, { weekStartsOn });
  } else if (granularity === granularityType.MONTH) {
    const newDate = monthOfYearToDate(groupingKey);
    newRangeStartDt = startOfMonth(newDate);
    newRangeEndDt = endOfMonth(newDate);
  } else if (granularity === granularityType.QUARTER) {
    const newDate = quarterToDate(groupingKey);
    newRangeStartDt = startOfQuarter(newDate);
    newRangeEndDt = endOfQuarter(newDate);
  } else if (granularity === granularityType.YEAR) {
    const newDate = yearToDate(groupingKey);
    newRangeStartDt = startOfYear(newDate);
    newRangeEndDt = endOfYear(newDate);
  }

  // make sure the new range is within the original range
  if (isBefore(newRangeStartDt, rangeStartDt)) {
    newRangeStartDt = rangeStartDt;
  }
  if (isAfter(newRangeEndDt, rangeEndDt)) {
    newRangeEndDt = rangeEndDt;
  }

  const newRangeStartStr = format(newRangeStartDt, 'yyyy-MM-dd');
  const newRangeEndStr = format(newRangeEndDt, 'yyyy-MM-dd');

  return [newRangeStartStr, newRangeEndStr];
}
