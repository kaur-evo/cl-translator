import { toRaw } from 'vue';

import fromEntries from './fromEntries';

describe('fromEntries', () => {
  it('should convert an iterable of key-value pairs into an object', () => {
    const iterable = [['key1', 'value1'], ['key2', 'value2']];
    const result = fromEntries(iterable);
    expect(result).toEqual({ key1: 'value1', key2: 'value2' });
  });

  it('should handle an empty iterable', () => {
    const iterable = [];
    const result = fromEntries(iterable);
    expect(result).toEqual({});
  });

  it('should use toRaw if options.toRaw is true', () => {
    const rawValue = { raw: true };
    const iterable = [['key1', rawValue]];
    const result = fromEntries(iterable, { toRaw: true });
    expect(result).toEqual({ key1: toRaw(rawValue) });
  });

  it('should not use toRaw if options.toRaw is false', () => {
    const rawValue = { raw: true };
    const iterable = [['key1', rawValue]];
    const result = fromEntries(iterable, { toRaw: false });
    expect(result).toEqual({ key1: rawValue });
  });

  it('should not use toRaw if options is not provided', () => {
    const rawValue = { raw: true };
    const iterable = [['key1', rawValue]];
    const result = fromEntries(iterable);
    expect(result).toEqual({ key1: rawValue });
  });
});
