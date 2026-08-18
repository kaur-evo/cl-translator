import { getProductNamesArray, getFirstProductIds } from './productHelpers';

describe('getProductNamesArray', () => {
  test('should return empty array if no productIds', () => {
    expect(getProductNamesArray([], {})).toEqual([]);
  });

  test('retruns all names if less than count', () => {
    expect(getProductNamesArray([1, 2, 3], { 1: { id: 1, name: 'product 1' }, 2: { id: 2, name: 'product 2' }, 3: { id: 3, name: 'product 3' } })).toEqual(['product 1', 'product 2', 'product 3']);
  });

  test('retruns all names if more than count', () => {
    expect(getProductNamesArray([1, 2, 3], { 1: { id: 1, name: 'product 1' }, 2: { id: 2, name: 'product 2' }, 3: { id: 3, name: 'product 3' } }, 2)).toEqual(['product 1', 'product 2', 3]);
  });
});

describe('getFirstProductIds', () => {
  it('does not return duplicates', () => {
    expect(getFirstProductIds([{ frequency: { productIds: [1, 2, 3] } }, { frequency: { productIds: [1, 2] } }], 'frequency')).toEqual([1, 2, 3]);
  });

  it('does not return more than count per item', () => {
    expect(getFirstProductIds([{ frequency: { productIds: [1, 2, 3] } }, { frequency: { productIds: [1, 2] } }], 'frequency', 2)).toEqual([1, 2]);
  });
});
