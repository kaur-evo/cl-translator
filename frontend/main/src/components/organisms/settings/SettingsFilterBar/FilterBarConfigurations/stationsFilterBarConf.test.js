import { createFilterConfiguration } from './stationsFilterBarConf';

test('stationsFilterBarConf', () => {
  expect(createFilterConfiguration()).toMatchSnapshot();
});
