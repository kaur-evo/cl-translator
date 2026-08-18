import { createFilterConfiguration } from './alertsFilterBarConf';

test('alertsFilterBarConf', () => {
  expect(createFilterConfiguration()).toMatchSnapshot();
});
