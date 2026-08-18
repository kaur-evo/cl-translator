import parseDateStr from './parseDateStr';

describe('parseDateStr', () => {
  it('returns correct date', () => {
    expect(parseDateStr('1921-01-01')).toEqual(new Date('1921-01-01T00:00:00'));
  });

  it('throws error if input is not a string', () => {
    expect(() => parseDateStr(123)).toThrow('unable to parse invalid date string: 123');
  });
});
