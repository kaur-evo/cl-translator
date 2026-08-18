import { createFilterConfiguration } from './checklistsFilterBarConf';

import { getChecklistFrequenciesList } from '@/constants/checklistsConstants';

test('createFilterConfiguration', () => {
  const products = [{ id: 1, name: 'product 1' }, { id: 2, name: 'product 2' }, { id: 3, name: 'product 3' }, { id: 4, name: 'product 4' }];
  expect(createFilterConfiguration(getChecklistFrequenciesList(), products)).toMatchSnapshot();
});
