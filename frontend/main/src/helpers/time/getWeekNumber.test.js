import parseDateStr from '../date/parseDateStr';

import getWeekNumber from './getWeekNumber';

describe('getWeekNumber', () => {
  describe('with Monday as first day of week', () => {
    const years = {
      2022: {
        firstDayOfFirstWeek: '2022-01-03',
        lastDayOfLastWeek: '2023-01-01',
        weekCount: 52,
      },
      2021: {
        firstDayOfFirstWeek: '2021-01-04',
        lastDayOfLastWeek: '2022-01-02',
        weekCount: 52,
      },
      2020: {
        firstDayOfFirstWeek: '2019-12-30',
        lastDayOfLastWeek: '2021-01-03',
        weekCount: 53,
      },
      2019: {
        firstDayOfFirstWeek: '2018-12-31',
        lastDayOfLastWeek: '2019-12-29',
        weekCount: 52,
      },
      2018: {
        firstDayOfFirstWeek: '2018-01-01',
        lastDayOfLastWeek: '2018-12-30',
        weekCount: 52,
      },
      2017: {
        firstDayOfFirstWeek: '2017-01-02',
        lastDayOfLastWeek: '2017-12-31',
        weekCount: 52,
      },
      2016: {
        firstDayOfFirstWeek: '2016-01-04',
        lastDayOfLastWeek: '2017-01-01',
        weekCount: 52,
      },
      2015: {
        firstDayOfFirstWeek: '2014-12-29',
        lastDayOfLastWeek: '2016-01-03',
        weekCount: 53,
      },
      2014: {
        firstDayOfFirstWeek: '2013-12-30',
        lastDayOfLastWeek: '2014-12-28',
        weekCount: 52,
      },
      2013: {
        firstDayOfFirstWeek: '2012-12-31',
        lastDayOfLastWeek: '2013-12-29',
        weekCount: 52,
      },
      2012: {
        firstDayOfFirstWeek: '2012-01-02',
        lastDayOfLastWeek: '2012-12-30',
        weekCount: 52,
      },
    };
    Object.entries(years).forEach(([year, yearObj]) => {
      test(`if first day of first week ${year} is 1`, () => {
        expect(getWeekNumber(parseDateStr(yearObj.firstDayOfFirstWeek))).toStrictEqual([Number(year), 1]);
      });
    });
    Object.entries(years).forEach(([year, yearObj]) => {
      test(`if last day of last week ${year} is ${yearObj.weekCount}`, () => {
        expect(getWeekNumber(parseDateStr(yearObj.lastDayOfLastWeek))).toStrictEqual([Number(year), yearObj.weekCount]);
      });
    });
  });

  describe('with Sunday as first day of week', () => {
    const years = {
      2022: {
        firstDayOfFirstWeek: '2022-01-02',
        lastDayOfLastWeek: '2022-12-31',
        weekCount: 52,
      },
      2021: {
        firstDayOfFirstWeek: '2021-01-03',
        lastDayOfLastWeek: '2022-01-01',
        weekCount: 52,
      },
      2020: {
        firstDayOfFirstWeek: '2019-12-29',
        lastDayOfLastWeek: '2021-01-02',
        weekCount: 53,
      },
      2019: {
        firstDayOfFirstWeek: '2018-12-30',
        lastDayOfLastWeek: '2019-12-28',
        weekCount: 52,
      },
      2018: {
        firstDayOfFirstWeek: '2017-12-31',
        lastDayOfLastWeek: '2018-12-29',
        weekCount: 52,
      },
      2017: {
        firstDayOfFirstWeek: '2017-01-01',
        lastDayOfLastWeek: '2017-12-30',
        weekCount: 52,
      },
      2016: {
        firstDayOfFirstWeek: '2016-01-03',
        lastDayOfLastWeek: '2016-12-31',
        weekCount: 52,
      },
      2015: {
        firstDayOfFirstWeek: '2014-12-28',
        lastDayOfLastWeek: '2016-01-02',
        weekCount: 53,
      },
      2014: {
        firstDayOfFirstWeek: '2013-12-29',
        lastDayOfLastWeek: '2014-12-27',
        weekCount: 52,
      },
      2013: {
        firstDayOfFirstWeek: '2012-12-30',
        lastDayOfLastWeek: '2013-12-28',
        weekCount: 52,
      },
      2012: {
        firstDayOfFirstWeek: '2012-01-01',
        lastDayOfLastWeek: '2012-12-29',
        weekCount: 52,
      },
    };
    Object.entries(years).forEach(([year, yearObj]) => {
      test(`if first day of first week ${year} is 1`, () => {
        expect(getWeekNumber(parseDateStr(yearObj.firstDayOfFirstWeek), 0)).toStrictEqual([Number(year), 1]);
      });
    });
    Object.entries(years).forEach(([year, yearObj]) => {
      test(`if last day of last week ${year} is ${yearObj.weekCount}`, () => {
        expect(getWeekNumber(parseDateStr(yearObj.lastDayOfLastWeek), 0)).toStrictEqual([Number(year), yearObj.weekCount]);
      });
    });
  });
});
