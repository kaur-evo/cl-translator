import { createTableHeadersConf } from './operatorsTableHeadersConf';

test('operatorsTableHeadersConf', () => {
  expect(createTableHeadersConf()).toMatchSnapshot();
});

test('operatorsTableHeadersConf if checklists authentication is enabled', () => {
  expect(createTableHeadersConf(true)).toMatchSnapshot();
});
