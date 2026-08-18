import listToKeyMap from './listToKeyMap';

describe('listToKeyMap', () => {
  it('should return an empty object if the list is empty', () => {
    expect(listToKeyMap([], 'id')).toEqual({});
  });

  it('should map list items to keys using the specified key', () => {
    const list = [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }];
    const result = listToKeyMap(list, 'id');
    expect(result).toEqual({ 1: { id: 1, name: 'Alice' }, 2: { id: 2, name: 'Bob' } });
  });

  it('should map list items to keys using the specified key and valueKey', () => {
    const list = [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }];
    const result = listToKeyMap(list, 'id', 'name');
    expect(result).toEqual({ 1: 'Alice', 2: 'Bob' });
  });

  it('should map list items to keys when items are strings', () => {
    const list = ['Alice', 'Bob'];
    const result = listToKeyMap(list);
    expect(result).toEqual({ Alice: 'Alice', Bob: 'Bob' });
  });

  it('should map list items to keys when items are numbers', () => {
    const list = [1, 2, 3];
    const result = listToKeyMap(list);
    expect(result).toEqual({ 1: 1, 2: 2, 3: 3 });
  });

  it('should handle null or undefined list', () => {
    expect(listToKeyMap(null, 'id')).toEqual({});
    expect(listToKeyMap(undefined, 'id')).toEqual({});
  });

  it('should handle list with mixed types', () => {
    const list = [1, 'Alice', { id: 2, name: 'Bob' }];
    const result = listToKeyMap(list, 'id');
    expect(result).toEqual({ 1: 1, Alice: 'Alice', 2: { id: 2, name: 'Bob' } });
  });

  it('should handle list with objects missing the key', () => {
    const list = [{ id: 1, name: 'Alice' }, { name: 'Bob' }];
    const result = listToKeyMap(list, 'id');
    expect(result).toEqual({ 1: { id: 1, name: 'Alice' }, undefined: { name: 'Bob' } });
  });

  it('should handle list with objects missing the valueKey', () => {
    const list = [{ id: 1, name: 'Alice' }, { id: 2 }];
    const result = listToKeyMap(list, 'id', 'name');
    expect(result).toEqual({ 1: 'Alice', 2: undefined });
  });

  it('should handle list with duplicate keys', () => {
    const list = [{ id: 1, name: 'Alice' }, { id: 1, name: 'Bob' }];
    const result = listToKeyMap(list, 'id');
    expect(result).toEqual({ 1: { id: 1, name: 'Bob' } });
  });
});
