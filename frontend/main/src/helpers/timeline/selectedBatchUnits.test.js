import { getSelectedBatchUnits } from './selectedBatchUnits';

test('getSelectedBatchUnits', () => {
  const batch1 = { unitId: 'kg', alternativeUnitId: 'box' };
  expect(getSelectedBatchUnits(batch1)).toStrictEqual([{ name: 'kg', id: 'kg' }, { name: 'box', id: 'box' }]);

  const batch2 = { unitId: 'kg', alternativeUnitId: '' };
  expect(getSelectedBatchUnits(batch2)).toStrictEqual([{ name: 'kg', id: 'kg' }]);
});
