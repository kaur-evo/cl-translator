import setUnion from './setUnion';

describe('setUnion', () => {
  test('if setUnion merges sets in expected manner resulting in unique values', () => {
    const set1 = new Set([1, 2, 3]);
    const set2 = new Set([2, 3, 4]);
    const set3 = new Set([3, 4, 5]);
    expect(setUnion(set1, set2, set3)).toStrictEqual(new Set([1, 2, 3, 4, 5]));
  });
});
