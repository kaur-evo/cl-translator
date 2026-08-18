import { DateTime } from 'luxon';

export function getDateTimeFromTimeString(dateString, timeString, zoneId) {
  if (!timeString) return null;
  const [hours, minutes] = timeString.split(':');
  const isoString = `${dateString}T${hours}:${minutes}:00`;
  return DateTime.fromISO(isoString, { zone: zoneId });
}
