import getObjectDiffKeys from './getObjectDiffKeys';

describe('getObjectDiffKeys', () => {
  it('should return an empty array when both objects are equal', () => {
    const obj1 = { a: 1, b: 2 };
    const obj2 = { a: 1, b: 2 };
    expect(getObjectDiffKeys(obj1, obj2)).toEqual([]);
  });

  it('should return the keys that are different between two objects', () => {
    const obj1 = { a: 1, b: 2, c: 3 };
    const obj2 = { a: 1, b: 4, d: 5 };
    expect(getObjectDiffKeys(obj1, obj2)).toEqual(['b', 'c', 'd']);
  });

  it('should return the keys that are in obj1 but not in obj2', () => {
    const obj1 = { a: 1, b: 2, c: 3 };
    const obj2 = { a: 1, b: 2 };
    expect(getObjectDiffKeys(obj1, obj2)).toEqual(['c']);
  });

  it('should return the keys that are in obj2 but not in obj1', () => {
    const obj1 = { a: 1, b: 2 };
    const obj2 = { a: 1, b: 2, c: 3 };
    expect(getObjectDiffKeys(obj1, obj2)).toEqual(['c']);
  });

  it('should return all keys when objects have no common keys', () => {
    const obj1 = { a: 1, b: 2 };
    const obj2 = { c: 3, d: 4 };
    expect(getObjectDiffKeys(obj1, obj2)).toEqual(['a', 'b', 'c', 'd']);
  });
});
