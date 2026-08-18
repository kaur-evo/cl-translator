import { describe, it, expect, vi } from 'vitest';
import { DateTime } from 'luxon';

import {
  getInputStartOfDayAsInZoneISO,
  getInputEndOfDayAsInZoneISO,
  getInputDateAsInZoneISO,
} from './inputTime';

describe('inputTime helpers', () => {
  // the idea here is to not test luxon itself, but to ensure our wrappers work as expected
  const mockDate = '2023-10-01T12:00:00.000Z';
  const mockZone = 'America/New_York';

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(mockDate));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('getInputStartOfDayAsInZoneISO', () => {
    it('should return the start of the day in the specified zone when date is provided', () => {
      const result = getInputStartOfDayAsInZoneISO(mockDate, mockZone);
      const expected = DateTime.fromISO(mockDate)
        .setZone(mockZone)
        .setZone('local', { keepLocalTime: true })
        .startOf('day')
        .toISO();
      expect(result).toBe(expected);
    });

    it('should return the start of the current day in the specified zone when no date is provided', () => {
      const result = getInputStartOfDayAsInZoneISO(null, mockZone);
      const expected = DateTime.now()
        .setZone(mockZone)
        .setZone('local', { keepLocalTime: true })
        .startOf('day')
        .toISO();
      expect(result).toBe(expected);
    });
  });

  describe('getInputEndOfDayAsInZoneISO', () => {
    it('should return the end of the day in the specified zone when date is provided', () => {
      const result = getInputEndOfDayAsInZoneISO(mockDate, mockZone);
      const expected = DateTime.fromISO(mockDate)
        .setZone(mockZone)
        .setZone('local', { keepLocalTime: true })
        .endOf('day')
        .toISO();
      expect(result).toBe(expected);
    });

    it('should return the end of the current day in the specified zone when no date is provided', () => {
      const result = getInputEndOfDayAsInZoneISO(null, mockZone);
      const expected = DateTime.now()
        .setZone(mockZone)
        .setZone('local', { keepLocalTime: true })
        .endOf('day')
        .toISO();
      expect(result).toBe(expected);
    });
  });

  describe('getInputDateAsInZoneISO', () => {
    it('should return the date in ISO format for the specified zone when date is provided', () => {
      const result = getInputDateAsInZoneISO(mockDate, mockZone);
      const expected = DateTime.fromISO(mockDate, { zone: mockZone }).toISODate();
      expect(result).toBe(expected);
    });

    it('should return the current date in ISO format for the specified zone when no date is provided', () => {
      const result = getInputDateAsInZoneISO(null, mockZone);
      const expected = DateTime.now().setZone(mockZone).toISODate();
      expect(result).toBe(expected);
    });

    it('should default to UTC zone when no zone is provided and return the date in ISO format', () => {
      const result = getInputDateAsInZoneISO(mockDate);
      const expected = DateTime.fromISO(mockDate, { zone: 'UTC' }).toISODate();
      expect(result).toBe(expected);
    });

    it('should default to the current date in UTC zone when no date and no zone are provided', () => {
      const result = getInputDateAsInZoneISO();
      const expected = DateTime.now().setZone('UTC').toISODate();
      expect(result).toBe(expected);
    });
  });
});
