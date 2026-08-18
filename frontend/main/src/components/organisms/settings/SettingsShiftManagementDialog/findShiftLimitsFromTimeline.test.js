import { DateTime } from 'luxon';

import findShiftLimitsFromTimeline from './findShiftLimitsFromTimeline';

describe('findShiftLimitsFromTimeline', () => {
  const zoneId = 'Europe/Tallinn';

  it('returns correct limits with previous and next shifts', () => {
    const timeline = [
      { startTimeISO: '2025-11-10T08:00:00.000Z', endTimeISO: '2025-11-10T16:00:00.000Z' },
      { startTimeISO: '2025-11-10T16:00:00.000Z', endTimeISO: '2025-11-10T23:00:00.000Z' },
      { startTimeISO: '2025-11-11T08:00:00.000Z', endTimeISO: '2025-11-11T16:00:00.000Z' },
    ];
    const result = findShiftLimitsFromTimeline(timeline, '2025-11-10T16:00:00.000Z', zoneId);
    expect(result).toEqual({
      minStartTimeISO: DateTime.fromISO('2025-11-10T16:00:00.000Z').setZone(zoneId).toISO(),
      minEndTimeISO: DateTime.fromISO('2025-11-10T16:00:00.000Z').plus({ minutes: 1 }).setZone(zoneId).toISO(),
      maxStartTimeISO: DateTime.fromISO('2025-11-11T08:00:00.000Z').minus({ minutes: 1 }).setZone(zoneId).toISO(),
      maxEndTimeISO: DateTime.fromISO('2025-11-11T08:00:00.000Z').setZone(zoneId).toISO(),
    });
  });

  it('returns only max limits when no previous shift', () => {
    const timeline = [
      { startTimeISO: '2025-11-10T16:00:00.000Z', endTimeISO: '2025-11-10T23:00:00.000Z' },
      { startTimeISO: '2025-11-11T08:00:00.000Z', endTimeISO: '2025-11-11T16:00:00.000Z' },
    ];
    const result = findShiftLimitsFromTimeline(timeline, '2025-11-10T16:00:00.000Z', zoneId);
    expect(result).toEqual({
      maxStartTimeISO: DateTime.fromISO('2025-11-11T08:00:00.000Z').minus({ minutes: 1 }).setZone(zoneId).toISO(),
      maxEndTimeISO: DateTime.fromISO('2025-11-11T08:00:00.000Z').setZone(zoneId).toISO(),
    });
  });

  it('returns only min limits when no next shift', () => {
    const timeline = [
      { startTimeISO: '2025-11-10T08:00:00.000Z', endTimeISO: '2025-11-10T16:00:00.000Z' },
      { startTimeISO: '2025-11-10T16:00:00.000Z', endTimeISO: '2025-11-10T23:00:00.000Z' },
    ];
    const result = findShiftLimitsFromTimeline(timeline, '2025-11-10T16:00:00.000Z', zoneId);
    expect(result).toEqual({
      minStartTimeISO: DateTime.fromISO('2025-11-10T16:00:00.000Z').setZone(zoneId).toISO(),
      minEndTimeISO: DateTime.fromISO('2025-11-10T16:00:00.000Z').plus({ minutes: 1 }).setZone(zoneId).toISO(),
    });
  });

  it('returns empty object when shift not found', () => {
    const timeline = [
      { startTimeISO: '2025-11-10T08:00:00.000Z', endTimeISO: '2025-11-10T16:00:00.000Z' },
      { startTimeISO: '2025-11-10T16:00:00.000Z', endTimeISO: '2025-11-10T23:00:00.000Z' },
    ];
    const result = findShiftLimitsFromTimeline(timeline, '2025-11-11T08:00:00.000Z', zoneId);
    expect(result).toEqual({});
  });
});
