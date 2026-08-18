import getObjVal from './getObjVal';

describe('getObjVal', () => {
  it('should return the value from obj.get() when obj has a get method and the key exists', () => {
    const obj = {
      get: (key) => (key === 'testKey' ? 'testValue' : null),
      has: true,
    };
    expect(getObjVal('testKey', obj)).toBe('testValue');
  });

  it('should handle negative numeric keys by converting them to strings', () => {
    const obj = {
      get: (key) => (key === '-1' ? 'negativeValue' : null),
      has: true,
    };
    expect(getObjVal(-1, obj)).toBe('negativeValue');
  });

  it('should return null if obj.get() does not find the key', () => {
    const obj = {
      get: () => null,
      has: true,
    };
    expect(getObjVal('nonExistentKey', obj)).toBe(null);
  });

  it('should return the value from obj[key] if obj does not have a get method but has the key', () => {
    const obj = {
      testKey: 'testValue',
    };
    expect(getObjVal('testKey', obj)).toBe('testValue');
  });

  it('should return null if obj does not have the key', () => {
    const obj = {};
    expect(getObjVal('nonExistentKey', obj)).toBe(null);
  });

  it('should return null if obj is null or undefined', () => {
    expect(getObjVal('testKey', null)).toBe(null);
    expect(getObjVal('testKey', undefined)).toBe(null);
  });
});
