import { DateTime } from 'luxon';

import { formatTimeRange } from '@/helpers/time/formatTimeRange';

describe('formatTimeRange', () => {
  it('returns empty string if start or end is invalid', () => {
    const start = DateTime.invalid('invalid');
    const end = DateTime.fromISO('2022-12-02T12:34:00.000Z', { zone: 'UTC' });
    const dateFormat = { short: 'dd.MM' };
    const timeFormat = { luxonShort: 'HH:mm' };
    expect(formatTimeRange([start, end], dateFormat, timeFormat)).toBe('');
  });

  it('returns formatted time range', () => {
    const start = DateTime.fromISO('2022-12-02T12:34:00.000Z', { zone: 'UTC' });
    const end = DateTime.fromISO('2022-12-02T14:34:00.000Z', { zone: 'UTC' });
    const dateFormat = { short: 'dd.MM' };
    const timeFormat = { luxonShort: 'HH:mm' };
    expect(formatTimeRange([start, end], dateFormat, timeFormat)).toBe('12:34 - 14:34 (02.12)');
  });

  it('returns formatted time range if start and end are on different days', () => {
    const start = DateTime.fromISO('2022-12-02T23:34:00.000Z', { zone: 'UTC' });
    const end = DateTime.fromISO('2022-12-03T01:34:00.000Z', { zone: 'UTC' });
    const dateFormat = { short: 'dd.MM' };
    const timeFormat = { luxonShort: 'HH:mm' };
    expect(formatTimeRange([start, end], dateFormat, timeFormat)).toBe('23:34 (02.12) - 01:34 (03.12)');
  });
});
