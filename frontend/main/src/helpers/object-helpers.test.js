import { getPropertyList } from './object-helpers';

test('getPropertyList', () => {
  // map, ids, key
  expect(getPropertyList({ 1: { name: 'item 1' }, 2: { name: 'item 2' } }, [1, 2], 'name')).toEqual(['item 1', 'item 2']);
  expect(getPropertyList({ 1: { name: 'item 1' }, 2: { name: 'item 2' } }, [], 'name')).toEqual([]);
  expect(getPropertyList({ 1: { name: 'item 1' }, 2: { name: 'item 2' } }, [1, 2], 'smthelse')).toEqual([undefined, undefined]);
  expect(getPropertyList({ 1: { name: 'item 1' }, 2: { name: 'item 2' } }, [1, 3], 'name')).toEqual(['item 1']);
});
