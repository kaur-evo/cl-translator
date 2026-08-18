import { DateTime } from 'luxon';

export function buildIntervalStartTimeISO(hhMm) {
  if (!hhMm) return null;
  const [hours, minutes] = hhMm.split(':').map((part) => parseInt(part, 10));
  const now = DateTime.now();
  let startTime = now.set({ hour: hours, minute: minutes, second: 0, millisecond: 0 });
  if (startTime < now) {
    startTime = startTime.plus({ days: 1 });
  }
  return startTime.setZone('UTC').toISO();
}
