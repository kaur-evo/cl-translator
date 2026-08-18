import { DateTime } from 'luxon';

import { getDateTimeFromTimeString } from './getDateTimeFromTimeString';

describe('getDateTimeFromTimeString', () => {
  it('returns null if timeString is empty', () => {
    expect(getDateTimeFromTimeString('2022-12-02', '', 'UTC')).toBe(null);
  });

  it('returns dateTime from given timeString', () => {
    expect(getDateTimeFromTimeString('2022-12-02', '12:34', 'UTC')).toStrictEqual(DateTime.fromISO('2022-12-02T12:34:00.000Z', { zone: 'UTC' }));
  });
});
