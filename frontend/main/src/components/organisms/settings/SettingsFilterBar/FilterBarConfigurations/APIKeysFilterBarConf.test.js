import { createFilterConfiguration } from './APIKeysFilterBarConf';

test('APIKeysFilterBarConf', () => {
  expect(createFilterConfiguration()).toMatchSnapshot();
});
