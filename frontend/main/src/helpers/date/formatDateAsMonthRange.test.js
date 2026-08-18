import formatDateAsMonthRange from './formatDateAsMonthRange';

describe('formatDateRangeAsMonthRange', () => {
  it('returns correct formatted range', () => {
    const result = formatDateAsMonthRange(new Date('1921-01-01T02:30:00.000'));
    expect(result).toEqual('01.01.1921 - 31.01.1921');
  });
  it('returns correct formatted range if input date is not in date format', () => {
    const result = formatDateAsMonthRange('1921-01-01');
    expect(result).toEqual('01.01.1921 - 31.01.1921');
  });
  it('returns correct formatted range with set minimum date', () => {
    const result = formatDateAsMonthRange(new Date('1921-01-01T02:30:00.000'), new Date('1921-01-10T02:30:00.000'));
    expect(result).toEqual('10.01.1921 - 31.01.1921');
  });
  it('returns correct formatted range with set minimum date if input date is not in date format', () => {
    const result = formatDateAsMonthRange(new Date('1921-01-01T02:30:00.000'), '1921-01-10');
    expect(result).toEqual('10.01.1921 - 31.01.1921');
  });
  it('returns correct formatted range with set maximum date', () => {
    const result = formatDateAsMonthRange(new Date('1921-01-01T02:30:00.000'), null, new Date('1921-01-10T02:30:00.000'));
    expect(result).toEqual('01.01.1921 - 10.01.1921');
  });
  it('returns correct formatted range with set maximum date if input date is not in date format', () => {
    const result = formatDateAsMonthRange(new Date('1921-01-01T02:30:00.000'), null, '1921-01-10');
    expect(result).toEqual('01.01.1921 - 10.01.1921');
  });
  it('returns correct formatted range with set minimum and maximum date', () => {
    const result = formatDateAsMonthRange(new Date('1921-01-01T02:30:00.000'), new Date('1921-01-10T02:30:00.000'), new Date('1921-01-20T02:30:00.000'));
    expect(result).toEqual('10.01.1921 - 20.01.1921');
  });
});
