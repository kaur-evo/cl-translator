import setToShortenedString from '@/helpers/Set/setToShortenedString';

describe('setToShortenedString', () => {
  test('if it returns "more" test when set size is above limit', () => {
    expect(setToShortenedString(new Set(['test1', 'test2', 'test3', 'test4']), 2)).toMatchSnapshot();
  });
  test('if it does not return "more" test when set size is at or below limit', () => {
    expect(setToShortenedString(new Set(['test1', 'test2']), 2)).toMatchSnapshot();
  });
});
