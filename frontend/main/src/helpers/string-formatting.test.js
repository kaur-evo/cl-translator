import { firstUpper } from './string-formatting';

test('firstUpper', () => {
  expect(firstUpper({ test: 'test' })).toEqual({ test: 'test' });
  expect(firstUpper('test')).toBe('Test');
});
