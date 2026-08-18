import getGranularityValueAsDate from './getGranularityValueAsDate';

import weekOfYearToDate from '@/helpers/date/weekOfYearToDate';
import monthOfYearToDate from '@/helpers/date/monthOfYearToDate';
import yearToDate from '@/helpers/date/yearToDate';
import parseDateStr from '@/helpers/date/parseDateStr';
import quarterToDate from '@/helpers/date/quarterToDate';
import granularityType from '@/stores/reportsConfig/constants/granularity';

vi.mock('@/helpers/date/weekOfYearToDate', () => ({
  __esModule: true,
  default: vi.fn(),
}));

vi.mock('@/helpers/date/monthOfYearToDate', () => ({
  __esModule: true,
  default: vi.fn(),
}));

vi.mock('@/helpers/date/yearToDate', () => ({
  __esModule: true,
  default: vi.fn(),
}));

vi.mock('@/helpers/date/parseDateStr', () => ({
  __esModule: true,
  default: vi.fn(),
}));

vi.mock('@/helpers/date/quarterToDate', () => ({
  __esModule: true,
  default: vi.fn(),
}));

describe('getGranularityValueAsDate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('returns date for STARTTIME granularity', () => {
    const result = getGranularityValueAsDate('2022-02-02', granularityType.STARTTIME);
    expect(result instanceof Date).toBe(true);
  });

  test('returns date for DUE_TIME granularity', () => {
    const result = getGranularityValueAsDate('2022-02-02', granularityType.DUE_TIME);
    expect(result instanceof Date).toBe(true);
  });

  test('parses date string for DATE granularity', () => {
    parseDateStr.mockImplementation(() => new Date());
    const result = getGranularityValueAsDate('2022-02-02', granularityType.DATE);
    expect(parseDateStr).toHaveBeenCalledWith('2022-02-02');
    expect(result instanceof Date).toBe(true);
  });

  test('returns null for invalid DATE granularity', () => {
    parseDateStr.mockImplementation(() => {
      throw new Error();
    });
    const result = getGranularityValueAsDate('invalid-date', granularityType.DATE);
    expect(result).toBe(null);
  });

  test('calls weekOfYearToDate for WEEKOFYEAR granularity', () => {
    weekOfYearToDate.mockImplementation(() => new Date());
    const result = getGranularityValueAsDate('2022-W02', granularityType.WEEKOFYEAR);
    expect(weekOfYearToDate).toHaveBeenCalledWith('2022-W02');
    expect(result instanceof Date).toBe(true);
  });

  test('calls quarterToDate for QUARTER granularity', () => {
    quarterToDate.mockImplementation(() => new Date());
    const result = getGranularityValueAsDate('2022-Q1', granularityType.QUARTER);
    expect(quarterToDate).toHaveBeenCalledWith('2022-Q1');
    expect(result instanceof Date).toBe(true);
  });

  test('calls monthOfYearToDate for MONTH granularity', () => {
    monthOfYearToDate.mockImplementation(() => new Date());
    const result = getGranularityValueAsDate('2022-02', granularityType.MONTH);
    expect(monthOfYearToDate).toHaveBeenCalledWith('2022-02');
    expect(result instanceof Date).toBe(true);
  });

  test('calls yearToDate for YEAR granularity', () => {
    yearToDate.mockImplementation(() => new Date());
    const result = getGranularityValueAsDate('2022', granularityType.YEAR);
    expect(yearToDate).toHaveBeenCalledWith('2022');
    expect(result instanceof Date).toBe(true);
  });

  test('returns null for TOTAL granularity', () => {
    const result = getGranularityValueAsDate('any-value', granularityType.TOTAL);
    expect(result).toBe(null);
  });

  test('throws error for unsupported granularity', () => {
    expect(() => getGranularityValueAsDate('any-value', 'unsupported')).toThrow('Granularity unsupported not supported in getGranularityValueAsDate');
  });

  test('returns null for null value', () => {
    const result = getGranularityValueAsDate(null, granularityType.DATE);
    expect(result).toBe(null);
  });

  test('returns null for undefined value', () => {
    const result = getGranularityValueAsDate(undefined, granularityType.DATE);
    expect(result).toBe(null);
  });

  test('returns null for empty string value', () => {
    const result = getGranularityValueAsDate('', granularityType.DATE);
    expect(result).toBe(null);
  });

  test('returns null for invalid granularity type', () => {
    expect(() => getGranularityValueAsDate('2022-02-02', 'invalid-granularity'))
      .toThrow('Granularity invalid-granularity not supported in getGranularityValueAsDate');
  });
});
