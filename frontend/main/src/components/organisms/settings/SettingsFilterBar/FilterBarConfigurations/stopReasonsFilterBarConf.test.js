import { createFilterConfiguration } from './stopReasonsFilterBarConf';

test('stopReasonsFilterBarConf', () => {
  const types = [{ id: 'unplanned', name: 'Unplanned' }, { id: 'planned', name: 'Planned' }];
  expect(createFilterConfiguration(types)).toMatchSnapshot();
});
