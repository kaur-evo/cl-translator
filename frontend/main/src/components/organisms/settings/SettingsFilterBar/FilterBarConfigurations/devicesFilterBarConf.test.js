import { createFilterConfiguration } from './devicesFilterBarConf';

test('devicesFilterBarConf', () => {
  expect(createFilterConfiguration()).toMatchSnapshot();
});
