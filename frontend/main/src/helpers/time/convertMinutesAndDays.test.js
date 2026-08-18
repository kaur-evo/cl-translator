import { convertMinutesToDays, convertDaysToMinutes } from './convertMinutesAndDays';

describe('convertMinutesAndDays', () => {
  describe('convertMinutesToDays', () => {
    it('converts minutes to days correctly', () => {
      expect(convertMinutesToDays(1440)).toBe(1);
      expect(convertMinutesToDays(2880)).toBe(2);
      expect(convertMinutesToDays(7200)).toBe(5);
    });

    it('rounds to nearest day', () => {
      expect(convertMinutesToDays(1440 + 720)).toBe(2);
      expect(convertMinutesToDays(1440 + 360)).toBe(1);
      expect(convertMinutesToDays(1440 - 360)).toBe(1);
    });

    it('returns 0 for falsy values', () => {
      expect(convertMinutesToDays(null)).toBe(0);
      expect(convertMinutesToDays(undefined)).toBe(0);
      expect(convertMinutesToDays(0)).toBe(0);
    });
  });

  describe('convertDaysToMinutes', () => {
    it('converts days to minutes correctly', () => {
      expect(convertDaysToMinutes(1)).toBe(1440);
      expect(convertDaysToMinutes(2)).toBe(2880);
      expect(convertDaysToMinutes(5)).toBe(7200);
      expect(convertDaysToMinutes(7)).toBe(10080);
    });

    it('handles decimal days', () => {
      expect(convertDaysToMinutes(0.5)).toBe(720);
      expect(convertDaysToMinutes(1.5)).toBe(2160);
    });

    it('returns 0 for falsy values', () => {
      expect(convertDaysToMinutes(null)).toBe(0);
      expect(convertDaysToMinutes(undefined)).toBe(0);
      expect(convertDaysToMinutes(0)).toBe(0);
    });
  });
});
