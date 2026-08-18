import orderByName from './orderByName';

test('orderByName', () => {
  const items = [{ name: 'test' }, { name: 'item 2' }, { name: 'item 1' }, { name: 'name' }, { name: 'test' }];
  expect(orderByName(items)).toEqual([{ name: 'item 1' }, { name: 'item 2' }, { name: 'name' }, { name: 'test' }, { name: 'test' }]);
});
