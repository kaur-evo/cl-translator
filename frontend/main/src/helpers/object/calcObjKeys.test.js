import { describe, it, expect } from 'vitest';

import calcObjKeys from './calcObjKeys';

describe('calcObjKeys', () => {
  it('should return the original object if keysMap is undefined', () => {
    const obj = { a: 1, b: 2 };
    const result = calcObjKeys(obj);
    expect(result).toEqual(obj);
  });

  it('should return the original object if keysMap is empty', () => {
    const obj = { a: 1, b: 2 };
    const keysMap = new Map();
    const result = calcObjKeys(obj, keysMap);
    expect(result).toEqual(obj);
  });

  it('should add new keys to the object based on keysMap', () => {
    const obj = { a: 1, b: 2 };
    const keysMap = new Map([
      ['c', 3],
      ['d', 4],
    ]);
    const result = calcObjKeys(obj, keysMap);
    expect(result).toEqual({
      a: 1, b: 2, c: 3, d: 4,
    });
  });

  it('should compute values using functions in keysMap', () => {
    const obj = { a: 1, b: 2 };
    const keysMap = new Map([
      ['c', (o) => o.a + o.b],
      ['d', (o) => o.a * o.b],
    ]);
    const result = calcObjKeys(obj, keysMap);
    expect(result).toEqual({
      a: 1, b: 2, c: 3, d: 2,
    });
  });

  it('should handle a mix of values and functions in keysMap', () => {
    const obj = { a: 1, b: 2 };
    const keysMap = new Map([
      ['c', 3],
      ['d', (o) => o.a * o.b],
    ]);
    const result = calcObjKeys(obj, keysMap);
    expect(result).toEqual({
      a: 1, b: 2, c: 3, d: 2,
    });
  });

  it('should override existing keys in the object', () => {
    const obj = { a: 1, b: 2 };
    const keysMap = new Map([
      ['a', 10],
      ['b', (o) => o.a + 5],
    ]);
    const result = calcObjKeys(obj, keysMap);
    expect(result).toEqual({
      a: 10, b: 6,
    });
  });

  it('should handle keysMap with null values', () => {
    const obj = { a: 1, b: 2 };
    const keysMap = new Map([
      ['c', null],
      ['d', (o) => o.a * o.b],
    ]);
    const result = calcObjKeys(obj, keysMap);
    expect(result).toEqual({
      a: 1, b: 2, c: null, d: 2,
    });
  });

  it('should handle keysMap with undefined values', () => {
    const obj = { a: 1, b: 2 };
    const keysMap = new Map([
      ['c', undefined],
      ['d', (o) => o.a * o.b],
    ]);
    const result = calcObjKeys(obj, keysMap);
    expect(result).toEqual({
      a: 1, b: 2, c: undefined, d: 2,
    });
  });

  it('should handle an empty object', () => {
    const obj = {};
    const keysMap = new Map([
      ['a', 1],
      ['b', () => 2],
    ]);
    const result = calcObjKeys(obj, keysMap);
    expect(result).toEqual({
      a: 1, b: 2,
    });
  });
});
