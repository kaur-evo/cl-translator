import { getPeriodsList } from './ImprovementsFilterBarConf';

import {
  LAST_MONTH, THIS_YEAR, LAST_WEEK, LAST_YEAR,
} from '@/constants/predefinedTimePeriodNames';

describe('ImprovementsFilterBarConf', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });
  describe('getPeriodsList', () => {
    beforeEach(() => {
      vi.useFakeTimers().setSystemTime(new Date('2020-01-01T12:34:33'));
    });
    test('when Sunday is the first day of week', () => {
      expect(getPeriodsList(0)).toEqual(
        [
          {
            title: LAST_WEEK,
            value: LAST_WEEK,
            range: [
              '2019-12-22',
              '2019-12-28',
            ],
          },
          {
            title: LAST_MONTH,
            value: LAST_MONTH,
            range: [
              '2019-12-01',
              '2019-12-31',
            ],
          },
          {
            title: THIS_YEAR,
            value: THIS_YEAR,
            range: [
              '2020-01-01',
              '2020-12-31',
            ],
          },
          {
            title: LAST_YEAR,
            value: LAST_YEAR,
            range: [
              '2019-01-01',
              '2019-12-31',
            ],
          },
          {
            title: 'All',
            value: 'all',
            range: [],
          },
          {
            title: 'Custom',
            value: 'custom',
            range: [],
          },
        ],
      );
    });

    test('with Monday as first day of week', () => {
      expect(getPeriodsList(1)).toEqual(
        [
          {
            title: LAST_WEEK,
            value: LAST_WEEK,
            range: [
              '2019-12-23',
              '2019-12-29',
            ],
          },
          {
            title: LAST_MONTH,
            value: LAST_MONTH,
            range: [
              '2019-12-01',
              '2019-12-31',
            ],
          },
          {
            title: THIS_YEAR,
            value: THIS_YEAR,
            range: [
              '2020-01-01',
              '2020-12-31',
            ],
          },
          {
            title: LAST_YEAR,
            value: LAST_YEAR,
            range: [
              '2019-01-01',
              '2019-12-31',
            ],
          },
          {
            title: 'All',
            value: 'all',
            range: [],
          },
          {
            title: 'Custom',
            value: 'custom',
            range: [],
          },
        ],
      );
    });
  });
});
