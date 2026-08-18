import { createTableHeadersConf } from './checklistsTableHeadersConf';

test('checklistsTableHeadersConf', () => {
  expect(createTableHeadersConf(true)).toMatchSnapshot();
  expect(createTableHeadersConf(false)).toMatchSnapshot();
});

test('checklistsTableHeadersConf if checklists authentication is enabled', () => {
  expect(createTableHeadersConf(true, true)).toMatchSnapshot();
  expect(createTableHeadersConf(false, true)).toMatchSnapshot();
});
