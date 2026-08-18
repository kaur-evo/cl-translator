import getGroupByMenuItemmsByConfigType from './groupByMenuItemsByConfigType';

describe('getGroupByMenuItemmsByConfigType', () => {
  test('if it returns expected configuration snapshot', () => {
    expect(getGroupByMenuItemmsByConfigType()).toMatchSnapshot();
  });
});
