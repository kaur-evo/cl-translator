import { getNormalizedValue } from './getNormalizedValue';

describe('getNormalizedValue', () => {
  it('returns null if input value is undefined', () => {
    expect(getNormalizedValue(undefined)).toBeNull();
  });

  it('returns null if input value is an empty string', () => {
    expect(getNormalizedValue('')).toBeNull();
  });

  it('returns null if input value is 0', () => {
    expect(getNormalizedValue(0)).toBeNull();
  });

  it('returns input value', () => {
    expect(getNormalizedValue(null)).toBeNull();
    expect(getNormalizedValue('test')).toBe('test');
    expect(getNormalizedValue(42)).toBe(42);
  });
});
