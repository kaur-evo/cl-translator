import { createTableHeadersConf } from './improvementsTableHeadersConf';

test('improvementsTableHeadersConf', () => {
  expect(createTableHeadersConf()).toMatchSnapshot();
});
