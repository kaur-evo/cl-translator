import getQuantityColumns from './quantityColumns';

it('returns expected snapshot', () => {
  expect(getQuantityColumns()).toMatchSnapshot();
});
