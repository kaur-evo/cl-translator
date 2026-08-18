import { isSameOrAfter, isSameOrBefore } from './dateComparison';

describe('isSameOrBefore', () => {
  test('that isSameOrBefore returns true if date is before the comparison date', () => {
    expect(isSameOrBefore('2020-02-02T11:00:00', '2020-02-02T12:00:00')).toBe(true);
  });

  test('that isSameOrBefore returns true if date is same as the comparison date', () => {
    expect(isSameOrBefore('2020-02-02T11:00:00', '2020-02-02T11:00:00')).toBe(true);
  });

  test('that isSameOrBefore returns false if date is after the comparison date', () => {
    expect(isSameOrBefore('2020-02-02T12:00:00', '2020-02-02T11:00:00')).toBe(false);
  });
});

describe('isSameOrAfter', () => {
  test('that isSameOrAfter returns true if date is after the comparison date', () => {
    expect(isSameOrAfter('2020-02-02T13:00:00', '2020-02-02T12:00:00')).toBe(true);
  });

  test('that isSameOrAfter returns true if date is same as the comparison date', () => {
    expect(isSameOrAfter('2020-02-02T11:00:00', '2020-02-02T11:00:00')).toBe(true);
  });

  test('that isSameOrAfter returns false if date is before the comparison date', () => {
    expect(isSameOrAfter('2020-02-02T10:00:00', '2020-02-02T11:00:00')).toBe(false);
  });
});
