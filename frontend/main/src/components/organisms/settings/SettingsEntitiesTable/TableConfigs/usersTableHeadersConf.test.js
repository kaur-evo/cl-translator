import { tableHeadersConf } from './usersTableHeadersConf';

test('usersTableHeadersConf', () => {
  expect(tableHeadersConf(true)).toMatchSnapshot();
  expect(tableHeadersConf(false)).toMatchSnapshot();
});
