import * as d3 from 'd3';
import { isDate } from 'lodash';
import { startOfWeek, endOfWeek } from 'date-fns';

import granularityType from '@/stores/reportsConfig/constants/granularity';
import parseDateStr from '@/helpers/date/parseDateStr';

const weekModulesList = [
  'timeSunday',
  'timeMonday',
  'timeTuesday',
  'timeWednesday',
  'timeThursday',
  'timeFriday',
  'timeSaturday',
];

export default class TimeRange {
  constructor({
    startDate, endDate, granularity, weekStartsOn,
  }) {
    this.startDate = startDate;
    this.endDate = endDate;
    this.granularity = granularity;
    this.weekStartsOn = weekStartsOn ?? 1;
  }

  getWeekModuleName() {
    return weekModulesList[this.weekStartsOn];
  }

  getModuleName() {
    if (this.granularity === granularityType.DATE) return 'timeDay';
    if (this.granularity === granularityType.WEEKOFYEAR) return this.getWeekModuleName();
    if (this.granularity === granularityType.MONTH) return 'timeMonth';
    if (this.granularity === granularityType.YEAR) return 'timeYear';
    if (this.granularity === granularityType.QUARTER) return 'timeMonth';
    return '';
  }

  get() {
    if (this.granularity === granularityType.DAYOFWEEK) {
      return this.handleDayOfWeekRange();
    }
    const moduleName = this.getModuleName();
    if (!moduleName) return [];

    const startDate = isDate(this.startDate) ? this.startDate : parseDateStr(this.startDate);
    const endDate = isDate(this.endDate) ? this.endDate : parseDateStr(this.endDate);
    if (this.granularity === granularityType.DATE) {
      endDate.setDate(endDate.getDate() + 1);
    }
    const extent = [d3[moduleName].floor(startDate), d3[moduleName].ceil(endDate)];
    if (this.granularity === granularityType.QUARTER) {
      return d3.timeMonth.every(3).range(...extent);
    }
    return d3[moduleName].range(...extent);
  }

  handleDayOfWeekRange() {
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: this.weekStartsOn });
    const weekEnd = endOfWeek(now, { weekStartsOn: this.weekStartsOn });
    return d3.timeDay.range(
      d3.timeDay.floor(weekStart),
      d3.timeDay.ceil(weekEnd),
    );
  }

  reduce(...args) {
    const timeRange = this.get();
    return timeRange.reduce(...args);
  }
}
