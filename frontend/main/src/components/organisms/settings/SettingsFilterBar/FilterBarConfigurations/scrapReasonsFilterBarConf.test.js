import { createFilterConfiguration } from './scrapReasonsFilterBarConf';

test('scrapReasonsFilterBarConf', () => {
  expect(createFilterConfiguration()).toMatchSnapshot();
});
