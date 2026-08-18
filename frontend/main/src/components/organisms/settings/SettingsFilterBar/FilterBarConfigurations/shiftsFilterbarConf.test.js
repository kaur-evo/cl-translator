import { createFilterConfiguration } from './shiftsFilterBarConf';

import { getDaysList } from '@/helpers/days/getDays';

test('shiftsFilterBarConf', () => {
  const days = getDaysList('en');
  expect(createFilterConfiguration(days, 1)).toMatchSnapshot();
});
