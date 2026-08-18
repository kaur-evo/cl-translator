import { format } from 'date-fns';

import TimeRange from './TimeRange';

describe('TimeRange', () => {
  const granularities = ['total', 'year', 'quarter', 'month', 'weekofyear', 'date'];
  granularities.forEach((granularity) => {
    test(`while granularity is "${granularity}" `, () => {
      const args = {
        startDate: '1970-01-25',
        endDate: '1971-02-03',
        granularity,
      };
      const timeRange = new TimeRange(args);

      const result = timeRange.reduce((list, dt) => {
        list.push(format(new Date(dt), 'yyyy-MM-dd'));
        return list;
      }, []);
      expect(result).toMatchSnapshot();
    });
  });
});
