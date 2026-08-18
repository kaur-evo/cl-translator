import addItemToLocalStorageArray from './addItem';

const localStorageMock = () => {
  let store = {};
  return {
    getItem(key) {
      return store[key];
    },
    setItem(key, value) {
      store[key] = value.toString();
    },
    clear() {
      store = {};
    },
    removeItem(key) {
      delete store[key];
    },
  };
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock() });

describe('addItemToLocalStorageArray', () => {
  afterEach(() => {
    localStorage.clear();
  });
  it('adds items to the given key', () => {
    expect(window.localStorage.getItem('testKey')).toBe(undefined);
    addItemToLocalStorageArray('first', 'testKey');
    expect(JSON.parse(window.localStorage.getItem('testKey'))).toEqual(['first']);
    addItemToLocalStorageArray('2nd', 'testKey');
    expect(JSON.parse(window.localStorage.getItem('testKey'))).toEqual(['2nd', 'first']);
  });

  it('doesnt add same element twice to the array', () => {
    expect(window.localStorage.getItem('testKey')).toBe(undefined);
    addItemToLocalStorageArray('first', 'testKey');
    expect(JSON.parse(window.localStorage.getItem('testKey'))).toEqual(['first']);
    addItemToLocalStorageArray('first', 'testKey');
    expect(JSON.parse(window.localStorage.getItem('testKey'))).toEqual(['first']);
  });

  test('that if the element is already in the array, then it is moved to the beginning', () => {
    expect(window.localStorage.getItem('testKey')).toBe(undefined);
    addItemToLocalStorageArray('first', 'testKey');
    expect(JSON.parse(window.localStorage.getItem('testKey'))).toEqual(['first']);
    addItemToLocalStorageArray('second', 'testKey');
    expect(JSON.parse(window.localStorage.getItem('testKey'))).toEqual(['second', 'first']);
    addItemToLocalStorageArray('first', 'testKey');
    expect(JSON.parse(window.localStorage.getItem('testKey'))).toEqual(['first', 'second']);
  });

  it('if limit is exceeded, it shifts the first added element', () => {
    expect(window.localStorage.getItem('testKey')).toBe(undefined);
    addItemToLocalStorageArray('first', 'testKey', 2);
    expect(JSON.parse(window.localStorage.getItem('testKey'))).toEqual(['first']);
    addItemToLocalStorageArray('2nd', 'testKey', 2);
    expect(JSON.parse(window.localStorage.getItem('testKey'))).toEqual(['2nd', 'first']);
    addItemToLocalStorageArray('third', 'testKey', 2);
    expect(JSON.parse(window.localStorage.getItem('testKey'))).toEqual(['third', '2nd']);
  });
});
