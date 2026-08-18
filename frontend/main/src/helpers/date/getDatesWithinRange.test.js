import { DateTime } from 'luxon';

import { getDatesWithinRange } from './getDatesWithinRange';

describe('getDatesWithinRange', () => {
  it('returns dates list that are within given range', () => {
    const startRange = [
      DateTime.fromISO('2022-12-02T10:00:00.000Z', { zone: 'UTC' }),
      DateTime.fromISO('2022-12-03T01:00:00.000Z', { zone: 'UTC' }),
    ];
    const startRange2 = [
      DateTime.fromISO('2022-12-02T23:00:00.000Z', { zone: 'UTC' }),
      DateTime.fromISO('2022-12-04T01:00:00.000Z', { zone: 'UTC' }),
    ];
    expect(getDatesWithinRange(startRange, { short: 'dd.MM' })).toEqual([{ name: '02.12', date: '2022-12-02' }, { name: '03.12', date: '2022-12-03' }]);
    expect(getDatesWithinRange(startRange2, { short: 'dd.MM' })).toEqual([{ name: '02.12', date: '2022-12-02' }, { name: '03.12', date: '2022-12-03' }, { name: '04.12', date: '2022-12-04' }]);
  });
});
