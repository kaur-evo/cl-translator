import { format } from 'date-fns';

import TimeRange from '../TimeRange';
import granularityType from '../constants/granularity';

import getWeekNumber from '@/helpers/time/getWeekNumber';

export default class EmptyDates {
  constructor({
    startDate, endDate, granularity, weekStartsOn,
  }) {
    this.startDate = startDate;
    this.endDate = endDate;
    this.granularity = granularity;
    this.weekStartsOn = weekStartsOn ?? 1;
  }

  get timeFormat() {
    if (this.granularity === granularityType.DATE) return 'yyyy-MM-dd';
    if (this.granularity === granularityType.WEEKOFYEAR) return 'yyyyII';
    if (this.granularity === granularityType.DAYOFWEEK) return 'i';
    if (this.granularity === granularityType.MONTH) return 'yyyyMM';
    if (this.granularity === granularityType.QUARTER) return 'yyyyQ';
    if (this.granularity === granularityType.YEAR) return 'yyyy';
    return '';
  }

  mapAsObject(mapper) {
    const timeRange = new TimeRange({
      startDate: this.startDate,
      endDate: this.endDate,
      granularity: this.granularity,
      weekStartsOn: this.weekStartsOn,
    });
    const { timeFormat } = this;
    return timeRange.reduce((emptyDatesMap, d) => {
      const copy = { ...emptyDatesMap };

      const granularityValue = format(d, timeFormat);

      const item = { [this.granularity]: granularityValue };
      copy[granularityValue] = mapper ? mapper(item) : (val) => val;
      return copy;
    }, {});
  }

  reduceToMap(mapper) {
    const timeRange = new TimeRange({
      startDate: this.startDate,
      endDate: this.endDate,
      granularity: this.granularity,
      weekStartsOn: this.weekStartsOn,
    });
    const { timeFormat } = this;
    return timeRange.reduce((emptyDatesMap, d) => {
      const defaultFormat = format(d, timeFormat);
      const [year, week] = getWeekNumber(d, this.weekStartsOn);
      const weekFormat = `${year}${week.toString().padStart(2, '0')}`;
      const granularityValue = this.granularity === 'weekofyear' ? weekFormat : defaultFormat;
      const item = { [this.granularity]: granularityValue };
      emptyDatesMap.set(granularityValue, mapper ? mapper(item) : item);
      return emptyDatesMap;
    }, new Map());
  }
}
