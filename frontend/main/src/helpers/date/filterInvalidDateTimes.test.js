import { DateTime } from 'luxon';

import { filterInvalidDateTimes } from './filterInvalidDateTimes';

describe('filterInvalidDateTimes', () => {
  it('returns empty array if all dateTimes are invalid', () => {
    const dateTimes = [DateTime.invalid('invalid'), DateTime.invalid('invalid')];
    expect(filterInvalidDateTimes(dateTimes)).toStrictEqual([]);
  });

  it('returns only valid dateTimes', () => {
    const dateTimes = [DateTime.invalid('invalid'), DateTime.fromISO('2022-12-02T12:34:00.000Z', { zone: 'UTC' })];
    expect(filterInvalidDateTimes(dateTimes)).toStrictEqual([DateTime.fromISO('2022-12-02T12:34:00.000Z', { zone: 'UTC' })]);
  });
});
