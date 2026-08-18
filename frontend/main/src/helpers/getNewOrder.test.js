import getNewOrder from './getNewOrder';

const initialList = [
  { id: 1, ordering: 1 },
  { id: 2, ordering: 4 },
  { id: 3, ordering: 7 },
  { id: 4, ordering: 9 },
  { id: 5, ordering: 10 },
];
describe('getNewOrder', () => {
  it('returns correct order if item is moved up', () => {
    expect(getNewOrder({ oldIndex: 4, newIndex: 1 }, initialList)).toBe(3.5);
  });

  it('returns correct order if item is moved down', () => {
    expect(getNewOrder({ oldIndex: 1, newIndex: 4 }, initialList)).toBe(10.5);
  });
});
