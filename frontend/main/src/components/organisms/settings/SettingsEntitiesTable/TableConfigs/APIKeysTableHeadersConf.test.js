import { createTableHeadersConf } from './APIKeysTableHeadersConf';

test('APIKeysTableHeadersConf', () => {
  expect(createTableHeadersConf()).toMatchSnapshot();
});
