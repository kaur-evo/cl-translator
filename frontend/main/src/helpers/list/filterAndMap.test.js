import filterAndMap from './filterAndMap';

describe('filterAndMap', () => {
  it('returns items not matching filter rule and returns list of items mapped according to remapper', () => {
    const inputList = [{ name: 'test1' }, { name: 'test2' }, { name: 'test3' }];
    const noTest1 = (item) => item.name !== 'test1';

    const result = filterAndMap(
      inputList,
      noTest1,
      (item) => ({ remappedName: item.name }),
    );
    expect(result).toStrictEqual([{ remappedName: 'test2' }, { remappedName: 'test3' }]);
  });
  it('returns items not matching filter rules list and returns list of items mapped according to remapper', () => {
    const inputList = [{ name: 'test1' }, { name: 'test2' }, { name: 'test3' }];
    const noTest1 = (item) => item.name !== 'test1';
    const noTest2 = (item) => item.name !== 'test2';

    const result = filterAndMap(
      inputList,
      [noTest1, noTest2],
      (item) => ({ remappedName: item.name }),
    );
    expect(result).toStrictEqual([{ remappedName: 'test3' }]);
  });
});
