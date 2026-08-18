import { createFilterConfiguration } from './productsFilterBarConf';

test('productsFilterBarConf', () => {
  expect(createFilterConfiguration()).toMatchSnapshot();
});
