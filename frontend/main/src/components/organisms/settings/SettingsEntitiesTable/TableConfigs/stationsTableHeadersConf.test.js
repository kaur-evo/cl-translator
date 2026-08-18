import { createTableHeadersConf } from './stationsTableHeadersConf';

describe('stationsTableHeadersConf', () => {
  test('with groups column', () => {
    expect(createTableHeadersConf(true)).toMatchSnapshot();
  });
  test('without groups column', () => {
    expect(createTableHeadersConf(false)).toMatchSnapshot();
  });
});
