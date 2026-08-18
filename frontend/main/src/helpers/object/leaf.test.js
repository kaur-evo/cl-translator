import getLeaf from './leaf';

describe('getLeaf', () => {
  it('should return the value at the given path', () => {
    const obj = { a: { b: { c: 42 } } };
    const path = 'a.b.c';
    const result = getLeaf(obj, path);
    expect(result).toBe(42);
  });

  it('should return undefined for non-existing path', () => {
    const obj = { a: { b: { c: 42 } } };
    const path = 'a.b.d';
    const result = getLeaf(obj, path);
    expect(result).toBeUndefined();
  });

  it('should return undefined for empty path', () => {
    const obj = { a: { b: { c: 42 } } };
    const path = '';
    const result = getLeaf(obj, path);
    expect(result).toBeUndefined();
  });

  it('should handle null or undefined object', () => {
    const path = 'a.b.c';
    expect(getLeaf(null, path)).toBeUndefined();
    expect(getLeaf(undefined, path)).toBeUndefined();
  });

  it('should handle path with single key', () => {
    const obj = { a: 42 };
    const path = 'a';
    const result = getLeaf(obj, path);
    expect(result).toBe(42);
  });
});
