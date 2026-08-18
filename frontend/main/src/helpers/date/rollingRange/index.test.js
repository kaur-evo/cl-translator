import {
  getWeekRange, getMonthRange, getYearRange, getDayRange, getQuarterRange,
} from '@/helpers/date/rollingRange';

describe('rollingRange', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers().setSystemTime(new Date('2022-06-30T12:34:33'));
  });
  afterEach(() => {
    vi.useRealTimers();
  });
  describe('getWeekRange', () => {
    const validRanges = {
      '-2': ['2022-06-13', '2022-06-19'],
      '-1': ['2022-06-20', '2022-06-26'],
      0: ['2022-06-27', '2022-07-03'],
      1: ['2022-07-04', '2022-07-10'],
      2: ['2022-07-11', '2022-07-17'],
    };
    Object.keys(validRanges).forEach((offset) => {
      it(`should return the correct range with offset: ${offset}`, () => {
        const result = getWeekRange(offset);
        expect(result).toStrictEqual(validRanges[offset]);
      });
    });
  });
  describe('getMonthRange', () => {
    const validRanges = {
      0: {
        '-2': ['2022-04-01', '2022-04-30'],
        '-1': ['2022-05-01', '2022-05-31'],
        0: ['2022-06-01', '2022-06-30'],
        1: ['2022-07-01', '2022-07-31'],
        2: ['2022-08-01', '2022-08-31'],
      },
      11: {
        '-2': ['2020-06-01', '2021-05-31'],
        '-1': ['2021-06-01', '2022-05-31'],
        0: ['2022-06-01', '2023-05-31'],
        1: ['2023-06-01', '2024-05-31'],
        2: ['2024-06-01', '2025-05-31'],
      },
      '-11': {
        '-2': ['2019-07-01', '2020-06-30'],
        '-1': ['2020-07-01', '2021-06-30'],
        0: ['2021-07-01', '2022-06-30'],
        1: ['2022-07-01', '2023-06-30'],
        2: ['2023-07-01', '2024-06-30'],
      },
    };
    Object.keys(validRanges).forEach((extraMonthsCount) => {
      Object.keys(validRanges[extraMonthsCount]).forEach((offset) => {
        it(`should return the correct range with extra ${extraMonthsCount} months and offset: ${offset}`, () => {
          const result = getMonthRange(Number(extraMonthsCount), Number(offset));
          expect(result).toStrictEqual(validRanges[extraMonthsCount][offset]);
        });
      });
    });
  });
  describe('getYearRange', () => {
    const validRanges = {
      '-2': ['2020-01-01', '2020-12-31'],
      '-1': ['2021-01-01', '2021-12-31'],
      0: ['2022-01-01', '2022-12-31'],
      1: ['2023-01-01', '2023-12-31'],
      2: ['2024-01-01', '2024-12-31'],
    };
    Object.keys(validRanges).forEach((offset) => {
      it(`should return the correct range with offset: ${offset}`, () => {
        const result = getYearRange(offset);
        expect(result).toStrictEqual(validRanges[offset]);
      });
    });
  });
  describe('getDayRange', () => {
    const validRanges = {
      0: {
        '-2': ['2022-06-28', '2022-06-28'],
        '-1': ['2022-06-29', '2022-06-29'],
        0: ['2022-06-30', '2022-06-30'],
        1: ['2022-07-01', '2022-07-01'],
        2: ['2022-07-02', '2022-07-02'],
      },
      7: {
        '-2': ['2022-06-14', '2022-06-21'],
        '-1': ['2022-06-22', '2022-06-29'],
        0: ['2022-06-30', '2022-07-07'],
        1: ['2022-07-08', '2022-07-15'],
        2: ['2022-07-16', '2022-07-23'],
      },
      '-7': {
        '-2': ['2022-06-07', '2022-06-14'],
        '-1': ['2022-06-15', '2022-06-22'],
        0: ['2022-06-23', '2022-06-30'],
        1: ['2022-07-01', '2022-07-08'],
        2: ['2022-07-09', '2022-07-16'],
      },
    };
    Object.keys(validRanges).forEach((extraMonthsCount) => {
      Object.keys(validRanges[extraMonthsCount]).forEach((offset) => {
        it(`should return the correct range with extra ${extraMonthsCount} months and offset: ${offset}`, () => {
          const result = getDayRange(Number(extraMonthsCount), Number(offset));
          expect(result).toStrictEqual(validRanges[extraMonthsCount][offset]);
        });
      });
    });
  });

  describe('getQuarterRange', () => {
    const validRanges = {
      '-2': {
        1: ['2021-10-01', '2021-12-31'],
        2: ['2021-10-01', '2022-03-31'],
        3: ['2021-10-01', '2022-06-30'],
        4: ['2021-10-01', '2022-09-30'],
      },
      '-1': {
        1: ['2022-01-01', '2022-03-31'],
        2: ['2022-01-01', '2022-06-30'],
        3: ['2022-01-01', '2022-09-30'],
        4: ['2022-01-01', '2022-12-31'],
      },
      0: {
        1: ['2022-04-01', '2022-06-30'],
        2: ['2022-04-01', '2022-09-30'],
        3: ['2022-04-01', '2022-12-31'],
        4: ['2022-04-01', '2023-03-31'],
      },
      1: {
        1: ['2022-07-01', '2022-09-30'],
        2: ['2022-07-01', '2022-12-31'],
        3: ['2022-07-01', '2023-03-31'],
        4: ['2022-07-01', '2023-06-30'],
      },
      2: {
        1: ['2022-10-01', '2022-12-31'],
        2: ['2022-10-01', '2023-03-31'],
        3: ['2022-10-01', '2023-06-30'],
        4: ['2022-10-01', '2023-09-30'],
      },
    };
    Object.keys(validRanges).forEach((offset) => {
      Object.keys(validRanges[offset]).forEach((quartersCount) => {
        it(`should return the correct range with offset: ${offset} and quartersCount: ${quartersCount}`, () => {
          const result = getQuarterRange(Number(offset), Number(quartersCount));
          expect(result).toStrictEqual(validRanges[offset][quartersCount]);
        });
      });
    });
  });
});

describe('rollingRange when Sunday is the first day of week', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers().setSystemTime(new Date('2022-06-30T12:34:33'));
  });
  afterEach(() => {
    vi.useRealTimers();
  });
  describe('getWeekRange', () => {
    const validRanges = {
      '-2': ['2022-06-12', '2022-06-18'],
      '-1': ['2022-06-19', '2022-06-25'],
      0: ['2022-06-26', '2022-07-02'],
      1: ['2022-07-03', '2022-07-09'],
      2: ['2022-07-10', '2022-07-16'],
    };
    Object.keys(validRanges).forEach((offset) => {
      it(`should return the correct range with offset: ${offset}`, () => {
        const result = getWeekRange(offset, 'yyyy-MM-dd', { weekStartsOn: 0 });
        expect(result).toStrictEqual(validRanges[offset]);
      });
    });
  });
});
