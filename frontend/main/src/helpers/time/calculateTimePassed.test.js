import { calculateTimePassed } from './calculateTimePassed';

describe('calculateTimePassed', () => {
  vi.useFakeTimers('modern');
  vi.setSystemTime(new Date('2021-01-21T12:34:56'));

  test('that calculateTimePassed method returns empty string, when date param is undefined', () => {
    expect(calculateTimePassed(undefined)).toBe('');
  });
  test('that calculateTimePassed method returns empty string, when date is more than a year ago and it should be hidden', () => {
    expect(calculateTimePassed(new Date('2019-11-10T21:43:56'), true)).toBe('');
  });
  test('that calculateTimePassed method returns correct string, when date is more than a year ago', () => {
    expect(calculateTimePassed(new Date('2019-11-10T21:43:56'))).toBe('1y 72d');
  });
  test('that calculateTimePassed method returns correct string, when date is more than a day ago', () => {
    expect(calculateTimePassed(new Date('2021-01-01T10:11:12'))).toBe('20d 2h');
  });
  test('that calculateTimePassed method returns correct string, when date is more than an hour ago', () => {
    expect(calculateTimePassed(new Date('2021-01-21T10:11:12'))).toBe('2h 23m');
  });
  test('that calculateTimePassed method returns correct string, when date is more than a minute ago', () => {
    expect(calculateTimePassed(new Date('2021-01-21T12:25:12'))).toBe('9m');
  });
});
