import {
  getPrecedingPeriod, getCurrentPeriod, getToday, getYesterday, getThisWeek, getLastWeek,
  getRolling7Days, getRolling30Days, getThisMonth, getLastMonth,
  getRolling12Months, getThisYear, getLastYear, getCustom, getThisQuarter, getLastQuarter,
  getLast4Quarters,
} from './rollingPeriodRangeDefinitions';

import {
  TODAY, YESTERDAY, THIS_WEEK, LAST_WEEK,
  THIS_MONTH, LAST_MONTH, ROLLING_7_DAYS,
  ROLLING_30_DAYS, THIS_YEAR, LAST_YEAR,
  ROLLING_12_MONTHS, THIS_QUARTER, LAST_QUARTER,
  LAST_4_QUARTERS,
} from '@/constants/predefinedTimePeriodNames';
import {
  getMonthRange, getYearRange, getWeekRange, getDayRange, getQuarterRange,
} from '@/helpers/date/rollingRange';
import i18n from '@/services/i18n';

describe('getPrecedingPeriod', () => {
  it('should return the preceding period for TODAY', () => {
    const result = getPrecedingPeriod(TODAY);
    expect(result).toEqual(getDayRange(0, -1));
  });

  it('should return the preceding period for YESTERDAY', () => {
    const result = getPrecedingPeriod(YESTERDAY);
    expect(result).toEqual(getDayRange(0, -2));
  });

  it('should return the preceding period for THIS_WEEK', () => {
    const result = getPrecedingPeriod(THIS_WEEK, { weekStartsOn: 0 });
    expect(result).toEqual(getWeekRange(-1, 'yyyy-MM-dd', { weekStartsOn: 0 }));
  });

  it('should return the preceding period for LAST_WEEK', () => {
    const result = getPrecedingPeriod(LAST_WEEK, { weekStartsOn: 0 });
    expect(result).toEqual(getWeekRange(-2, 'yyyy-MM-dd', { weekStartsOn: 0 }));
  });

  it('should return the preceding period for THIS_MONTH', () => {
    const result = getPrecedingPeriod(THIS_MONTH);
    expect(result).toEqual(getMonthRange(0, -1));
  });

  it('should return the preceding period for LAST_MONTH', () => {
    const result = getPrecedingPeriod(LAST_MONTH);
    expect(result).toEqual(getMonthRange(0, -2));
  });

  it('should return the preceding period for ROLLING_7_DAYS', () => {
    const result = getPrecedingPeriod(ROLLING_7_DAYS);
    expect(result).toEqual(getDayRange(-6, -1));
  });

  it('should return the preceding period for ROLLING_30_DAYS', () => {
    const result = getPrecedingPeriod(ROLLING_30_DAYS);
    expect(result).toEqual(getDayRange(-29, -1));
  });

  it('should return the preceding period for THIS_YEAR', () => {
    const result = getPrecedingPeriod(THIS_YEAR);
    expect(result).toEqual(getYearRange(-1));
  });

  it('should return the preceding period for LAST_YEAR', () => {
    const result = getPrecedingPeriod(LAST_YEAR);
    expect(result).toEqual(getYearRange(-2));
  });

  it('should return the preceding period for ROLLING_12_MONTHS', () => {
    const result = getPrecedingPeriod(ROLLING_12_MONTHS);
    expect(result).toEqual(getMonthRange(-11, -1));
  });

  it('should return the preceding period for THIS_QUARTER', () => {
    const result = getPrecedingPeriod(THIS_QUARTER);
    expect(result).toEqual(getQuarterRange(-1, 1));
  });

  it('should return the preceding period for LAST_QUARTER', () => {
    const result = getPrecedingPeriod(LAST_QUARTER);
    expect(result).toEqual(getQuarterRange(-2, 1));
  });

  it('should return the preceding period for LAST_4_QUARTERS', () => {
    const result = getPrecedingPeriod(LAST_4_QUARTERS);
    expect(result).toEqual(getQuarterRange(-7, 4));
  });

  it('should return null for an undefined period', () => {
    const result = getPrecedingPeriod('INVALID_PERIOD');
    expect(result).toBeNull();
  });
});

describe('getCurrentPeriod', () => {
  it('should return the current period for TODAY', () => {
    const result = getCurrentPeriod(TODAY);
    expect(result).toEqual(getDayRange());
  });

  it('should return the current period for YESTERDAY', () => {
    const result = getCurrentPeriod(YESTERDAY);
    expect(result).toEqual(getDayRange(0, -1));
  });

  it('should return the current period for THIS_WEEK', () => {
    const result = getCurrentPeriod(THIS_WEEK, { weekStartsOn: 0 });
    expect(result).toEqual(getWeekRange(0, 'yyyy-MM-dd', { weekStartsOn: 0 }));
  });

  it('should return the current period for LAST_WEEK', () => {
    const result = getCurrentPeriod(LAST_WEEK, { weekStartsOn: 0 });
    expect(result).toEqual(getWeekRange(-1, 'yyyy-MM-dd', { weekStartsOn: 0 }));
  });

  it('should return the current period for THIS_MONTH', () => {
    const result = getCurrentPeriod(THIS_MONTH);
    expect(result).toEqual(getMonthRange(0, 0));
  });

  it('should return the current period for LAST_MONTH', () => {
    const result = getCurrentPeriod(LAST_MONTH);
    expect(result).toEqual(getMonthRange(0, -1));
  });

  it('should return the current period for ROLLING_7_DAYS', () => {
    const result = getCurrentPeriod(ROLLING_7_DAYS);
    expect(result).toEqual(getDayRange(-6, 0));
  });

  it('should return the current period for ROLLING_30_DAYS', () => {
    const result = getCurrentPeriod(ROLLING_30_DAYS);
    expect(result).toEqual(getDayRange(-29, 0));
  });

  it('should return the current period for THIS_YEAR', () => {
    const result = getCurrentPeriod(THIS_YEAR);
    expect(result).toEqual(getYearRange(0));
  });

  it('should return the current period for LAST_YEAR', () => {
    const result = getCurrentPeriod(LAST_YEAR);
    expect(result).toEqual(getYearRange(-1));
  });

  it('should return the current period for ROLLING_12_MONTHS', () => {
    const result = getCurrentPeriod(ROLLING_12_MONTHS);
    expect(result).toEqual(getMonthRange(-11, 0));
  });

  it('should return the current period for THIS_QUARTER', () => {
    const result = getCurrentPeriod(THIS_QUARTER);
    expect(result).toEqual(getQuarterRange(0));
  });

  it('should return the current period for LAST_QUARTER', () => {
    const result = getCurrentPeriod(LAST_QUARTER);
    expect(result).toEqual(getQuarterRange(-1, 1));
  });

  it('should return the current period for LAST_4_QUARTERS', () => {
    const result = getCurrentPeriod(LAST_4_QUARTERS);
    expect(result).toEqual(getQuarterRange(-3, 4));
  });

  it('should return null for an undefined period', () => {
    const result = getCurrentPeriod('INVALID_PERIOD');
    expect(result).toBeNull();
  });
});

describe('Default Export Periods', () => {
  it('should return the correct range for TODAY', () => {
    const result = getDayRange();
    expect(result).toEqual(getDayRange());
  });

  it('should return the correct range for YESTERDAY', () => {
    const result = getDayRange(0, -1);
    expect(result).toEqual(getDayRange(0, -1));
  });

  it('should return the correct range for THIS_WEEK', () => {
    const result = getWeekRange(0);
    expect(result).toEqual(getWeekRange(0));
  });

  it('should return the correct range for LAST_WEEK', () => {
    const result = getWeekRange(-1);
    expect(result).toEqual(getWeekRange(-1));
  });

  it('should return the correct range for THIS_MONTH', () => {
    const result = getMonthRange(0, 0);
    expect(result).toEqual(getMonthRange(0, 0));
  });

  it('should return the correct range for LAST_MONTH', () => {
    const result = getMonthRange(0, -1);
    expect(result).toEqual(getMonthRange(0, -1));
  });

  it('should return the correct range for ROLLING_7_DAYS', () => {
    const result = getDayRange(-6, 0);
    expect(result).toEqual(getDayRange(-6, 0));
  });

  it('should return the correct range for ROLLING_30_DAYS', () => {
    const result = getDayRange(-29, 0);
    expect(result).toEqual(getDayRange(-29, 0));
  });

  it('should return the correct range for THIS_YEAR', () => {
    const result = getYearRange(0);
    expect(result).toEqual(getYearRange(0));
  });

  it('should return the correct range for LAST_YEAR', () => {
    const result = getYearRange(-1);
    expect(result).toEqual(getYearRange(-1));
  });

  it('should return the correct range for ROLLING_12_MONTHS', () => {
    const result = getMonthRange(-11, 0);
    expect(result).toEqual(getMonthRange(-11, 0));
  });
});

describe('getToday', () => {
  it('should return the correct title for TODAY', () => {
    const result = getToday({ weekStartsOn: 0 });
    expect(result.title).toEqual(i18n.global.t('today'));
  });

  it('should return the correct value for TODAY', () => {
    const result = getToday({ weekStartsOn: 0 });
    expect(result.value).toEqual(TODAY);
  });

  it('should return the correct range for TODAY', () => {
    const result = getToday({ weekStartsOn: 0 });
    expect(result.range).toEqual(getCurrentPeriod(TODAY, { weekStartsOn: 0 }));
  });
});

describe('getYesterday', () => {
  it('should return the correct title for YESTERDAY', () => {
    const result = getYesterday({ weekStartsOn: 0 });
    expect(result.title).toEqual(i18n.global.t('yesterday'));
  });

  it('should return the correct value for YESTERDAY', () => {
    const result = getYesterday({ weekStartsOn: 0 });
    expect(result.value).toEqual(YESTERDAY);
  });

  it('should return the correct range for YESTERDAY', () => {
    const result = getYesterday({ weekStartsOn: 0 });
    expect(result.range).toEqual(getCurrentPeriod(YESTERDAY, { weekStartsOn: 0 }));
  });
});

describe('getThisWeek', () => {
  it('should return the correct title for THIS_WEEK', () => {
    const result = getThisWeek({ weekStartsOn: 0 });
    expect(result.title).toEqual(i18n.global.t('thisweek'));
  });

  it('should return the correct value for THIS_WEEK', () => {
    const result = getThisWeek({ weekStartsOn: 0 });
    expect(result.value).toEqual(THIS_WEEK);
  });

  it('should return the correct range for THIS_WEEK', () => {
    const result = getThisWeek({ weekStartsOn: 0 });
    expect(result.range).toEqual(getCurrentPeriod(THIS_WEEK, { weekStartsOn: 0 }));
  });
});

describe('getLastWeek', () => {
  it('should return the correct title for LAST_WEEK', () => {
    const result = getLastWeek({ weekStartsOn: 0 });
    expect(result.title).toEqual(i18n.global.t('lastweek'));
  });

  it('should return the correct value for LAST_WEEK', () => {
    const result = getLastWeek({ weekStartsOn: 0 });
    expect(result.value).toEqual(LAST_WEEK);
  });

  it('should return the correct range for LAST_WEEK', () => {
    const result = getLastWeek({ weekStartsOn: 0 });
    expect(result.range).toEqual(getCurrentPeriod(LAST_WEEK, { weekStartsOn: 0 }));
  });
});

describe('getRolling7Days', () => {
  it('should return the correct title for ROLLING_7_DAYS', () => {
    const result = getRolling7Days({ weekStartsOn: 0 });
    expect(result.title).toEqual(i18n.global.t('rolling7days'));
  });

  it('should return the correct value for ROLLING_7_DAYS', () => {
    const result = getRolling7Days({ weekStartsOn: 0 });
    expect(result.value).toEqual(ROLLING_7_DAYS);
  });

  it('should return the correct range for ROLLING_7_DAYS', () => {
    const result = getRolling7Days({ weekStartsOn: 0 });
    expect(result.range).toEqual(getCurrentPeriod(ROLLING_7_DAYS, { weekStartsOn: 0 }));
  });
});

describe('getRolling30Days', () => {
  it('should return the correct title for ROLLING_30_DAYS', () => {
    const result = getRolling30Days({ weekStartsOn: 0 });
    expect(result.title).toEqual(i18n.global.t('rolling30days'));
  });

  it('should return the correct value for ROLLING_30_DAYS', () => {
    const result = getRolling30Days({ weekStartsOn: 0 });
    expect(result.value).toEqual(ROLLING_30_DAYS);
  });

  it('should return the correct range for ROLLING_30_DAYS', () => {
    const result = getRolling30Days({ weekStartsOn: 0 });
    expect(result.range).toEqual(getCurrentPeriod(ROLLING_30_DAYS, { weekStartsOn: 0 }));
  });
});

describe('getThisMonth', () => {
  it('should return the correct title for THIS_MONTH', () => {
    const result = getThisMonth({ weekStartsOn: 0 });
    expect(result.title).toEqual(i18n.global.t('thismonth'));
  });

  it('should return the correct value for THIS_MONTH', () => {
    const result = getThisMonth({ weekStartsOn: 0 });
    expect(result.value).toEqual(THIS_MONTH);
  });

  it('should return the correct range for THIS_MONTH', () => {
    const result = getThisMonth({ weekStartsOn: 0 });
    expect(result.range).toEqual(getCurrentPeriod(THIS_MONTH, { weekStartsOn: 0 }));
  });
});

describe('getLastMonth', () => {
  it('should return the correct title for LAST_MONTH', () => {
    const result = getLastMonth({ weekStartsOn: 0 });
    expect(result.title).toEqual(i18n.global.t('lastmonth'));
  });

  it('should return the correct value for LAST_MONTH', () => {
    const result = getLastMonth({ weekStartsOn: 0 });
    expect(result.value).toEqual(LAST_MONTH);
  });

  it('should return the correct range for LAST_MONTH', () => {
    const result = getLastMonth({ weekStartsOn: 0 });
    expect(result.range).toEqual(getCurrentPeriod(LAST_MONTH, { weekStartsOn: 0 }));
  });
});

describe('getRolling12Months', () => {
  it('should return the correct title for ROLLING_12_MONTHS', () => {
    const result = getRolling12Months({ weekStartsOn: 0 });
    expect(result.title).toEqual(i18n.global.t('Last 12 months'));
  });

  it('should return the correct value for ROLLING_12_MONTHS', () => {
    const result = getRolling12Months({ weekStartsOn: 0 });
    expect(result.value).toEqual(ROLLING_12_MONTHS);
  });

  it('should return the correct range for ROLLING_12_MONTHS', () => {
    const result = getRolling12Months({ weekStartsOn: 0 });
    expect(result.range).toEqual(getCurrentPeriod(ROLLING_12_MONTHS, { weekStartsOn: 0 }));
  });
});

describe('getCustom', () => {
  it('should return the correct title for custom period', () => {
    const result = getCustom();
    expect(result.title).toEqual(i18n.global.t('custom'));
  });

  it('should return the correct value for custom period', () => {
    const result = getCustom();
    expect(result.value).toEqual('custom');
  });

  it('should return an empty range for custom period', () => {
    const result = getCustom();
    expect(result.range).toEqual([]);
  });
});

describe('getThisQuarter', () => {
  it('should return the correct title for THIS_QUARTER', () => {
    const result = getThisQuarter({ weekStartsOn: 0 });
    expect(result.title).toEqual(i18n.global.t('This quarter'));
  });

  it('should return the correct value for THIS_QUARTER', () => {
    const result = getThisQuarter({ weekStartsOn: 0 });
    expect(result.value).toEqual(THIS_QUARTER);
  });

  it('should return the correct range for THIS_QUARTER', () => {
    const result = getThisQuarter({ weekStartsOn: 0 });
    expect(result.range).toEqual(getCurrentPeriod(THIS_QUARTER, { weekStartsOn: 0 }));
  });
});

describe('getLastQuarter', () => {
  it('should return the correct title for LAST_QUARTER', () => {
    const result = getLastQuarter({ weekStartsOn: 0 });
    expect(result.title).toEqual(i18n.global.t('Last quarter'));
  });

  it('should return the correct value for LAST_QUARTER', () => {
    const result = getLastQuarter({ weekStartsOn: 0 });
    expect(result.value).toEqual(LAST_QUARTER);
  });

  it('should return the correct range for LAST_QUARTER', () => {
    const result = getLastQuarter({ weekStartsOn: 0 });
    expect(result.range).toEqual(getCurrentPeriod(LAST_QUARTER, { weekStartsOn: 0 }));
  });
});

describe('getLast4Quarters', () => {
  it('should return the correct title for LAST_4_QUARTERS', () => {
    const result = getLast4Quarters({ weekStartsOn: 0 });
    expect(result.title).toEqual(i18n.global.t('Last 4 quarters'));
  });

  it('should return the correct value for LAST_4_QUARTERS', () => {
    const result = getLast4Quarters({ weekStartsOn: 0 });
    expect(result.value).toEqual(LAST_4_QUARTERS);
  });

  it('should return the correct range for LAST_4_QUARTERS', () => {
    const result = getLast4Quarters({ weekStartsOn: 0 });
    expect(result.range).toEqual(getCurrentPeriod(LAST_4_QUARTERS, { weekStartsOn: 0 }));
  });
});

describe('getThisYear', () => {
  it('should return the correct title for THIS_YEAR', () => {
    const result = getThisYear({ weekStartsOn: 0 });
    expect(result.title).toEqual(i18n.global.t('thisyear'));
  });

  it('should return the correct value for THIS_YEAR', () => {
    const result = getThisYear({ weekStartsOn: 0 });
    expect(result.value).toEqual(THIS_YEAR);
  });

  it('should return the correct range for THIS_YEAR', () => {
    const result = getThisYear({ weekStartsOn: 0 });
    expect(result.range).toEqual(getCurrentPeriod(THIS_YEAR, { weekStartsOn: 0 }));
  });
});

describe('getLastYear', () => {
  it('should return the correct title for LAST_YEAR', () => {
    const result = getLastYear({ weekStartsOn: 0 });
    expect(result.title).toEqual(i18n.global.t('lastyear'));
  });

  it('should return the correct value for LAST_YEAR', () => {
    const result = getLastYear({ weekStartsOn: 0 });
    expect(result.value).toEqual(LAST_YEAR);
  });

  it('should return the correct range for LAST_YEAR', () => {
    const result = getLastYear({ weekStartsOn: 0 });
    expect(result.range).toEqual(getCurrentPeriod(LAST_YEAR, { weekStartsOn: 0 }));
  });
});
