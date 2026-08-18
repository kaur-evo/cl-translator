import { createTableHeadersConf } from './productsTableHeadersConf';

describe('productsTableHeadersConf', () => {
  test('list view with icon', () => {
    expect(createTableHeadersConf(true, true)).toMatchSnapshot();
  });

  test('group view with icon', () => {
    expect(createTableHeadersConf(false, true)).toMatchSnapshot();
  });

  test('list view without icon', () => {
    expect(createTableHeadersConf(true, false)).toMatchSnapshot();
  });

  test('group view without icon', () => {
    expect(createTableHeadersConf(false, false)).toMatchSnapshot();
  });
});
