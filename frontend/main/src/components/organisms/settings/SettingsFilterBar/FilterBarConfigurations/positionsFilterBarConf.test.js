import { createFilterConfiguration } from './positionsFilterBarConf';

test('positionsFilterBarConf', () => {
  expect(createFilterConfiguration()).toMatchSnapshot();
});
