import deleteObjKeys from '@/helpers/object/deleteObjKeys';

describe('deleteObjKeys', () => {
  test('if deleteObjKeys deletes object keys', () => {
    const obj = {
      key1: 1, key2: 2, key3: 3, key4: 4,
    };
    const keys = ['key2', 'key4'];
    expect(deleteObjKeys(obj, keys)).toStrictEqual({ key1: 1, key3: 3 });
  });

  test('if deleteObjKeys returns the same object when deleteKeys is undefined', () => {
    const obj = {
      key1: 1, key2: 2, key3: 3, key4: 4,
    };
    expect(deleteObjKeys(obj)).toStrictEqual(obj);
  });

  test('if deleteObjKeys returns the same object when deleteKeys is an empty array', () => {
    const obj = {
      key1: 1, key2: 2, key3: 3, key4: 4,
    };
    expect(deleteObjKeys(obj, [])).toStrictEqual(obj);
  });

  test('if deleteObjKeys does not delete keys that do not exist in the object', () => {
    const obj = {
      key1: 1, key2: 2, key3: 3, key4: 4,
    };
    const keys = ['key5', 'key6'];
    expect(deleteObjKeys(obj, keys)).toStrictEqual(obj);
  });

  test('if deleteObjKeys handles an empty object', () => {
    const obj = {};
    const keys = ['key1', 'key2'];
    expect(deleteObjKeys(obj, keys)).toStrictEqual({});
  });
});
