import convertObjToMap from './convertObjToMap';

describe('convertObjToMap', () => {
  it('should convert an object to a Map', () => {
    const obj = { key1: 'value1', key2: 'value2' };
    const result = convertObjToMap(obj);
    expect(result).toBeInstanceOf(Map);
    expect(result.size).toBe(2);
    expect(result.get('key1')).toBe('value1');
    expect(result.get('key2')).toBe('value2');
  });

  it('should return an empty Map for an empty object', () => {
    const obj = {};
    const result = convertObjToMap(obj);
    expect(result).toBeInstanceOf(Map);
    expect(result.size).toBe(0);
  });

  it('should handle objects with non-string keys', () => {
    const obj = { 1: 'value1', true: 'value2' };
    const result = convertObjToMap(obj);
    expect(result).toBeInstanceOf(Map);
    expect(result.size).toBe(2);
    expect(result.get('1')).toBe('value1'); // Keys are converted to strings
    expect(result.get('true')).toBe('value2');
  });

  it('should handle objects with undefined or null values', () => {
    const obj = { key1: undefined, key2: null };
    const result = convertObjToMap(obj);
    expect(result).toBeInstanceOf(Map);
    expect(result.size).toBe(2);
    expect(result.get('key1')).toBeUndefined();
    expect(result.get('key2')).toBeNull();
  });
});
