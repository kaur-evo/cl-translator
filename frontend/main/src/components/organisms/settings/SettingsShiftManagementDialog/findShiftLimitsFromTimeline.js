import { DateTime } from 'luxon';

export default function findShiftLimitsFromTimeline(timeline, shiftStartTimeISO, zoneId) {
  const shiftIndex = timeline.findIndex((s) => s.startTimeISO === shiftStartTimeISO);
  const limits = {};
  if (shiftIndex !== -1) {
    const previousShift = timeline[shiftIndex - 1];
    const nextShift = timeline[shiftIndex + 1];
    if (previousShift) {
      limits.minStartTimeISO = DateTime.fromISO(previousShift.endTimeISO).setZone(zoneId).toISO();
      limits.minEndTimeISO = DateTime.fromISO(previousShift.endTimeISO).plus({ minutes: 1 }).setZone(zoneId).toISO();
    }
    if (nextShift) {
      limits.maxStartTimeISO = DateTime.fromISO(nextShift.startTimeISO).minus({ minutes: 1 }).setZone(zoneId).toISO();
      limits.maxEndTimeISO = DateTime.fromISO(nextShift.startTimeISO).setZone(zoneId).toISO();
    }
  }

  return limits;
}
