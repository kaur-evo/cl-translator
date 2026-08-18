import { formatSetOrValAsArray, formatSetAsStr, formatListAsStr } from './formatsConfiguration';

describe('formatSetAsStr', () => {
  test('returns original value if not a set', () => {
    const value = 'not a set';
    expect(formatSetAsStr(value)).toBe(value);
  });

  test('returns shortened set string if a set', () => {
    const value = new Set([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17,
      18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30,
      31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51,
    ]);
    expect(formatSetAsStr(value)).toBe(
      '1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50 + 1 more',
    );
  });
});
describe('formatListAsStr', () => {
  test('returns original value if not an array', () => {
    const value = 'not an array';
    expect(formatListAsStr(value)).toBe(value);
  });

  test('returns shortened list string if an array', () => {
    const value = [
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
      16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28,
      29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41,
      42, 43, 44, 45, 46, 47, 48, 49, 50, 51,
    ];
    expect(formatListAsStr(value)).toBe(
      '1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50 + 1 more',
    );
  });
});
describe('formatSetOrValAsArray', () => {
  test('returns value as an array if it\'s a set', () => {
    const set = new Set([1, 2, 3]);
    const result = formatSetOrValAsArray(set);
    expect(result).toEqual([1, 2, 3]);
  });

  test('returns an array with the value if it\'s not a set', () => {
    const val = 'not a set';
    const result = formatSetOrValAsArray(val);
    expect(result).toEqual([val]);
  });
});
