import { createFilterConfiguration } from './operatorsFilterBarConf';

test('operatorsFilterBarConf', () => {
  const stationsWithoutOperators = [{ id: 1, name: 'station 1' }, { id: 2, name: 'station 2' }, { id: 3, name: 'station 3' }];
  expect(createFilterConfiguration(stationsWithoutOperators)).toMatchSnapshot();
});

test('operatorsFilterBarConf if checklists authentication is enabled', () => {
  const stationsWithoutOperators = [{ id: 1, name: 'station 1' }, { id: 2, name: 'station 2' }, { id: 3, name: 'station 3' }];
  expect(createFilterConfiguration(stationsWithoutOperators, true)).toMatchSnapshot();
});
