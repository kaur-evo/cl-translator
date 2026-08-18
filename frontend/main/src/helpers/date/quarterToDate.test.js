import quarterToDate from './quarterToDate';

describe('quarterToDate', () => {
  it('returns correct date for first quarter', () => {
    expect(quarterToDate('20211')).toEqual(new Date('2021-01-01T00:00:00'));
  });

  it('returns correct date for second quarter', () => {
    expect(quarterToDate('20212')).toEqual(new Date('2021-04-01T00:00:00'));
  });

  it('returns correct date for third quarter', () => {
    expect(quarterToDate('20213')).toEqual(new Date('2021-07-01T00:00:00'));
  });

  it('returns correct date for fourth quarter', () => {
    expect(quarterToDate('20214')).toEqual(new Date('2021-10-01T00:00:00'));
  });

  it('throws error if input is not a string', () => {
    expect(() => quarterToDate(123)).toThrow('unable to parse invalid quarter string: 123');
  });

  it('throws error if input is not a valid quarter string', () => {
    expect(() => quarterToDate('1921Q5')).toThrow('unable to parse invalid quarter string: 1921Q5');
  });
});
