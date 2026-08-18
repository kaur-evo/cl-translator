import remapObjKeys from '@/helpers/object/remapObjKeys';

describe('remapObjKeys', () => {
  test('if remapObjKeys remaps object keys', () => {
    const obj = {
      key1: 1, key2: 2, key3: 3, key4: 4,
    };
    const remappingMap = [
      ['key2', 'key6'],
      ['key4', 'key8'],
    ];
    expect(remapObjKeys(obj, remappingMap)).toStrictEqual({
      key1: 1, key2: 2, key3: 3, key4: 4, key6: 2, key8: 4,
    });
  });

  test('if remapObjKeys returns the same object when keysMap is undefined', () => {
    const obj = {
      key1: 1, key2: 2, key3: 3, key4: 4,
    };
    expect(remapObjKeys(obj)).toStrictEqual(obj);
  });

  test('if remapObjKeys returns the same object when keysMap is empty', () => {
    const obj = {
      key1: 1, key2: 2, key3: 3, key4: 4,
    };
    expect(remapObjKeys(obj, [])).toStrictEqual(obj);
  });

  test('if remapObjKeys overwrites existing keys in the object', () => {
    const obj = {
      key1: 1, key2: 2, key3: 3, key4: 4, key6: 10,
    };
    const remappingMap = [
      ['key2', 'key6'],
    ];
    expect(remapObjKeys(obj, remappingMap)).toStrictEqual({
      key1: 1, key2: 2, key3: 3, key4: 4, key6: 2,
    });
  });
});
