import getMonthMiddleDates from './getMonthMiddleDates';

describe('getMonthMiddleDates', () => {
  it('returns empty array in case dates array is empty', () => {
    const result = getMonthMiddleDates([]);
    expect(result.length).toBe(0);
  });

  it('returns empty array in case there are only one month days in the dates array', () => {
    const result = getMonthMiddleDates(['2021-01-01', '2021-01-02', '2021-01-03', '2021-01-04', '2021-01-05', '2021-01-06', '2021-01-07']);
    expect(result.length).toBe(0);
  });

  it('returns month middle dates for given array', () => {
    const result = getMonthMiddleDates(
      ['2021-01-01', '2021-01-02', '2021-01-03', '2021-01-04', '2021-01-05', '2021-01-06', '2021-01-07',
        '2021-02-01', '2021-02-02', '2021-02-03', '2021-02-04', '2021-02-05', '2021-02-06', '2021-02-07'],
    );
    expect(result.length).toBe(2);
    expect(result[0]).toBe('2021-01-04');
    expect(result[1]).toBe('2021-02-04');
  });

  it('returns doesnt have a date for a month in the result, if there are less than 5 dates from that month', () => {
    const result = getMonthMiddleDates(
      ['2021-01-01', '2021-01-02', '2021-01-03', '2021-01-04', '2021-01-05', '2021-01-06', '2021-01-07',
        '2021-02-01', '2021-02-02', '2021-02-03', '2021-02-04'],
    );
    expect(result.length).toBe(1);
    expect(result[0]).toBe('2021-01-04');
  });
});
