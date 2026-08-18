import { createTableHeadersConf } from './speedLossReasonsTableHeadersConf';

test('speedLossReasonsTableHeadersConf', () => {
  expect(createTableHeadersConf(true, true)).toMatchSnapshot();
  expect(createTableHeadersConf(true, false)).toMatchSnapshot();
  expect(createTableHeadersConf(false, true)).toMatchSnapshot();
  expect(createTableHeadersConf(false, false)).toMatchSnapshot();
});
