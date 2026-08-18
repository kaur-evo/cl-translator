import { createFilterConfiguration } from './speedLossReasonsFilterBarConf';

test('speedLossReasonsFilterBarConf', () => {
  expect(createFilterConfiguration()).toMatchSnapshot();
});
