import { setActivePinia, createPinia } from 'pinia';

import { formatTimeInDay } from './formatTime';

beforeEach(() => {
  setActivePinia(createPinia());
});

describe('formatTimeInDay', () => {
  test('returns formatted time string', () => {
    const time = '14:30';
    const expected = '14:30';
    const result = formatTimeInDay(time);
    expect(result).toBe(expected);
  });

  test('returns empty string for invalid time', () => {
    const time = 'invalid';
    const expected = '';
    const result = formatTimeInDay(time);
    expect(result).toBe(expected);
  });

  test('returns empty string for null time', () => {
    const time = null;
    const expected = '';
    const result = formatTimeInDay(time);
    expect(result).toBe(expected);
  });

  test('returns empty string for undefined time', () => {
    const time = undefined;
    const expected = '';
    const result = formatTimeInDay(time);
    expect(result).toBe(expected);
  });

  test('returns empty string for empty string time', () => {
    const time = '';
    const expected = '';
    const result = formatTimeInDay(time);
    expect(result).toBe(expected);
  });

  test('returns formatted time string for midnight', () => {
    const time = '00:00';
    const expected = '00:00';
    const result = formatTimeInDay(time);
    expect(result).toBe(expected);
  });
});
