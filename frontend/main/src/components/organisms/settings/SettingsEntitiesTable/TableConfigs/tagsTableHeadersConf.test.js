import { createTableHeadersConf } from './tagsTableHeadersConf';

test('tagsTableHeadersConf', () => {
  expect(createTableHeadersConf()).toMatchSnapshot();
});
