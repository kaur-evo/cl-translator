import getFactoryId from './factory-helper';

test('getFactoryId', () => {
  const stationsMap = { 1: { factoryId: 1 }, 2: { factoryId: 2 }, 3: { factoryId: 2 } };
  expect(getFactoryId(stationsMap, 1)).toBe(1);
  expect(getFactoryId(stationsMap, 2)).toBe(2);
  expect(getFactoryId(stationsMap, 3)).toBe(2);
  expect(getFactoryId(stationsMap, 4)).toBe(undefined);
});
