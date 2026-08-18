/* eslint-disable no-magic-numbers */
import {
  TODAY, YESTERDAY,
  THIS_MONTH, LAST_MONTH, ROLLING_30_DAYS,
  THIS_YEAR, LAST_WEEK, THIS_WEEK,
  ROLLING_7_DAYS, LAST_YEAR, ROLLING_12_MONTHS,
  THIS_QUARTER, LAST_QUARTER,
  LAST_4_QUARTERS,
} from '@/constants/predefinedTimePeriodNames';
import {
  getMonthRange, getYearRange, getWeekRange, getDayRange, getQuarterRange,
} from '@/helpers/date/rollingRange';
import i18n from '@/services/i18n';

export function getPrecedingPeriod(PERIOD, options) {
  const periodMap = {
    [TODAY]: () => getDayRange(0, -1),
    [YESTERDAY]: () => getDayRange(0, -2),
    [THIS_WEEK]: () => getWeekRange(-1, 'yyyy-MM-dd', options),
    [LAST_WEEK]: () => getWeekRange(-2, 'yyyy-MM-dd', options),
    [THIS_MONTH]: () => getMonthRange(0, -1),
    [LAST_MONTH]: () => getMonthRange(0, -2),
    [ROLLING_7_DAYS]: () => getDayRange(-6, -1),
    [ROLLING_30_DAYS]: () => getDayRange(-29, -1),
    [THIS_YEAR]: () => getYearRange(-1),
    [LAST_YEAR]: () => getYearRange(-2),
    [ROLLING_12_MONTHS]: () => getMonthRange(-11, -1),
    [THIS_QUARTER]: () => getQuarterRange(-1, 1),
    [LAST_QUARTER]: () => getQuarterRange(-2, 1),
    [LAST_4_QUARTERS]: () => getQuarterRange(-7, 4),
  };
  if (periodMap[PERIOD] === undefined) return null;
  return periodMap?.[PERIOD]();
}
export function getCurrentPeriod(PERIOD, options) {
  const periodMap = {
    [TODAY]: () => getDayRange(),
    [YESTERDAY]: () => getDayRange(0, -1),
    [THIS_WEEK]: () => getWeekRange(0, 'yyyy-MM-dd', options),
    [LAST_WEEK]: () => getWeekRange(-1, 'yyyy-MM-dd', options),
    [THIS_MONTH]: () => getMonthRange(0, 0),
    [LAST_MONTH]: () => getMonthRange(0, -1),
    [ROLLING_7_DAYS]: () => getDayRange(-6, 0),
    [ROLLING_30_DAYS]: () => getDayRange(-29, 0),
    [THIS_YEAR]: () => getYearRange(0),
    [LAST_YEAR]: () => getYearRange(-1),
    [ROLLING_12_MONTHS]: () => getMonthRange(-11, 0),
    [THIS_QUARTER]: () => getQuarterRange(0),
    [LAST_QUARTER]: () => getQuarterRange(-1, 1),
    [LAST_4_QUARTERS]: () => getQuarterRange(-3, 4),
  };
  if (periodMap[PERIOD] === undefined) return null;
  return periodMap[PERIOD]();
}
export default {
  [TODAY]: getDayRange(),
  [YESTERDAY]: getDayRange(0, -1),
  [THIS_WEEK]: getWeekRange(0),
  [LAST_WEEK]: getWeekRange(-1),
  [THIS_MONTH]: getMonthRange(0, 0),
  [LAST_MONTH]: getMonthRange(0, -1),
  [ROLLING_7_DAYS]: getDayRange(-6, 0),
  [ROLLING_30_DAYS]: getDayRange(-29, 0),
  [THIS_YEAR]: getYearRange(0),
  [LAST_YEAR]: getYearRange(-1),
  [ROLLING_12_MONTHS]: getMonthRange(-11, 0),
};

export function getToday({ weekStartsOn }) {
  return {
    title: i18n.global.t('today'),
    value: TODAY,
    range: getCurrentPeriod(TODAY, { weekStartsOn }),
  };
}

export function getYesterday({ weekStartsOn }) {
  return {
    title: i18n.global.t('yesterday'),
    value: YESTERDAY,
    range: getCurrentPeriod(YESTERDAY, { weekStartsOn }),
  };
}

export function getThisWeek({ weekStartsOn }) {
  return {
    title: i18n.global.t('thisweek'),
    value: THIS_WEEK,
    range: getCurrentPeriod(THIS_WEEK, { weekStartsOn }),
  };
}

export function getLastWeek({ weekStartsOn }) {
  return {
    title: i18n.global.t('lastweek'),
    value: LAST_WEEK,
    range: getCurrentPeriod(LAST_WEEK, { weekStartsOn }),
  };
}

export function getRolling7Days({ weekStartsOn }) {
  return {
    title: i18n.global.t('rolling7days'),
    value: ROLLING_7_DAYS,
    range: getCurrentPeriod(ROLLING_7_DAYS, { weekStartsOn }),
  };
}

export function getThisMonth({ weekStartsOn }) {
  return {
    title: i18n.global.t('thismonth'),
    value: THIS_MONTH,
    range: getCurrentPeriod(THIS_MONTH, { weekStartsOn }),
  };
}

export function getLastMonth({ weekStartsOn }) {
  return {
    title: i18n.global.t('lastmonth'),
    value: LAST_MONTH,
    range: getCurrentPeriod(LAST_MONTH, { weekStartsOn }),
  };
}

export function getRolling30Days({ weekStartsOn }) {
  return {
    title: i18n.global.t('rolling30days'),
    value: ROLLING_30_DAYS,
    range: getCurrentPeriod(ROLLING_30_DAYS, { weekStartsOn }),
  };
}

export function getThisQuarter({ weekStartsOn }) {
  return {
    title: i18n.global.t('This quarter'),
    value: THIS_QUARTER,
    range: getCurrentPeriod(THIS_QUARTER, { weekStartsOn }),
  };
}

export function getLastQuarter({ weekStartsOn }) {
  return {
    title: i18n.global.t('Last quarter'),
    value: LAST_QUARTER,
    range: getCurrentPeriod(LAST_QUARTER, { weekStartsOn }),
  };
}

export function getLast4Quarters({ weekStartsOn }) {
  return {
    title: i18n.global.t('Last 4 quarters'),
    value: LAST_4_QUARTERS,
    range: getCurrentPeriod(LAST_4_QUARTERS, { weekStartsOn }),
  };
}

export function getThisYear({ weekStartsOn }) {
  return {
    title: i18n.global.t('thisyear'),
    value: THIS_YEAR,
    range: getCurrentPeriod(THIS_YEAR, { weekStartsOn }),
  };
}

export function getLastYear({ weekStartsOn }) {
  return {
    title: i18n.global.t('lastyear'),
    value: LAST_YEAR,
    range: getCurrentPeriod(LAST_YEAR, { weekStartsOn }),
  };
}

export function getRolling12Months({ weekStartsOn }) {
  return {
    title: i18n.global.t('Last 12 months'),
    value: ROLLING_12_MONTHS,
    range: getCurrentPeriod(ROLLING_12_MONTHS, { weekStartsOn }),
  };
}

export function getCustom() {
  return {
    title: i18n.global.t('custom'),
    value: 'custom',
    range: [],
  };
}
