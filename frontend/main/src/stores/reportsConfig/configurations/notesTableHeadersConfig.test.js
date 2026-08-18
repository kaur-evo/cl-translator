import headers from './notesTableHeadersConfig';

test('that it returns correct headers', () => {
  expect(headers()).toMatchSnapshot();
});
