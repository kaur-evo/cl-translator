import getItemsFromLocalStorageArray from './getItemsFromLocalStorageArray';

describe('getItemsFromLocalStorageArray', () => {
  afterEach(() => {
    localStorage.clear();
  });
  it('returns item by storage key', () => {
    expect(getItemsFromLocalStorageArray('testKey')).toEqual([]);
    localStorage.setItem('testKey', JSON.stringify(['first']));
    expect(getItemsFromLocalStorageArray('testKey')).toEqual(['first']);
  });

  it('returns item by storage key, which is filtered out from local storage array by filter value', () => {
    expect(getItemsFromLocalStorageArray('testKey')).toEqual([]);
    localStorage.setItem('testKey', JSON.stringify(['first', 'second']));
    expect(getItemsFromLocalStorageArray('testKey')).toEqual(['first', 'second']);
    expect(getItemsFromLocalStorageArray('testKey', 'sec')).toEqual(['second']);
  });

  it('returns empty array by storage key, when filter value doesnt match any of local storage array items', () => {
    expect(getItemsFromLocalStorageArray('testKey')).toEqual([]);
    localStorage.setItem('testKey', JSON.stringify(['first', 'second']));
    expect(getItemsFromLocalStorageArray('testKey')).toEqual(['first', 'second']);
    expect(getItemsFromLocalStorageArray('testKey', 'test')).toEqual([]);
  });
});
