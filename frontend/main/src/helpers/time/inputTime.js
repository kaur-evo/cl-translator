import { DateTime } from 'luxon';

export function luxonApplyAsInZoneTime(luxon, zoneId = 'UTC') {
  return luxon.setZone(zoneId).setZone('local', { keepLocalTime: false });
}

export function asInZoneTimeLuxon(isoTimestamp, zoneId = 'UTC') {
  return luxonApplyAsInZoneTime(DateTime.fromISO(isoTimestamp, { zone: zoneId }), zoneId);
}

export function getInputStartOfDayAsInZoneISO(date = null, zoneId = 'UTC') {
  if (!date) return asInZoneTimeLuxon(DateTime.now(), zoneId).startOf('day').toISO();
  return asInZoneTimeLuxon(date, zoneId).startOf('day').toISO();
}

export function getInputEndOfDayAsInZoneISO(date = null, zoneId = 'UTC') {
  if (!date) return asInZoneTimeLuxon(DateTime.now(), zoneId).endOf('day').toISO();
  return asInZoneTimeLuxon(date, zoneId).endOf('day').toISO();
}

export function getInputDateAsInZoneISO(date = null, zoneId = 'UTC') {
  if (!date) return DateTime.now().setZone(zoneId).toISODate();
  return DateTime.fromISO(date, { zone: zoneId }).toISODate();
}
