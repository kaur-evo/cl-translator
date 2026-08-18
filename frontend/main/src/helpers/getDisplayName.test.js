import getDisplayName from './getDisplayName';

test('getDisplayName', () => {
  expect(getDisplayName('name')).toBe('name');
  expect(getDisplayName('(test)name')).toBe('name');
  expect(getDisplayName('name[0]')).toBe('name');
});
