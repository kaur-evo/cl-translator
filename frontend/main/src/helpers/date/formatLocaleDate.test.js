import { formatLocaleDate, formatWeekday, formatMonth } from './formatLocaleDate';

describe('formatLocaleDate', () => {
  const testDate = new Date('2024-01-15T12:00:00'); // Monday, January 15, 2024

  describe('formatLocaleDate', () => {
    it('should format weekday in Albanian (long)', () => {
      const result = formatLocaleDate(testDate, 'sq', { weekday: 'long' });
      expect(result).toBe('Hënë');
    });

    it('should format weekday in Albanian (short)', () => {
      const result = formatLocaleDate(testDate, 'sq', { weekday: 'short' });
      expect(result).toContain('Hën');
    });

    it('should format weekday in Albanian (narrow)', () => {
      const result = formatLocaleDate(testDate, 'sq', { weekday: 'narrow' });
      expect(result).toBe('Hë');
    });

    it('should format month in Albanian (long)', () => {
      const result = formatLocaleDate(testDate, 'sq', { month: 'long' });
      expect(result).toBe('Janar');
    });

    it('should format month and year in Albanian', () => {
      const result = formatLocaleDate(testDate, 'sq', { month: 'long', year: 'numeric' });
      expect(result).toBe('Janar 2024');
    });

    it('should format weekday in English using native API', () => {
      const result = formatLocaleDate(testDate, 'en', { weekday: 'long' });
      expect(result.toLowerCase()).toBe('monday');
    });

    it('should format month and year in English using native API', () => {
      const result = formatLocaleDate(testDate, 'en', { month: 'long', year: 'numeric' });
      expect(result).toContain('January');
      expect(result).toContain('2024');
    });
  });

  describe('formatWeekday', () => {
    it('should format weekday in Albanian (long)', () => {
      const result = formatWeekday(testDate, 'sq', 'long');
      expect(result).toBe('Hënë');
    });

    it('should format weekday in Albanian (narrow)', () => {
      const result = formatWeekday(testDate, 'sq', 'narrow');
      expect(result).toBe('Hë');
    });

    it('should format weekday in English', () => {
      const result = formatWeekday(testDate, 'en', 'long');
      expect(result.toLowerCase()).toBe('monday');
    });

    it('should default to long format', () => {
      const result = formatWeekday(testDate, 'sq');
      expect(result).toBe('Hënë');
    });
  });

  describe('formatMonth', () => {
    it('should format month in Albanian without year', () => {
      const result = formatMonth(testDate, 'sq', 'long', false);
      expect(result).toBe('Janar');
    });

    it('should format month in Albanian with year', () => {
      const result = formatMonth(testDate, 'sq', 'long', true);
      expect(result).toBe('Janar 2024');
    });

    it('should format month in English without year', () => {
      const result = formatMonth(testDate, 'en', 'long', false);
      expect(result).toBe('January');
    });

    it('should format month in English with year', () => {
      const result = formatMonth(testDate, 'en', 'long', true);
      expect(result).toContain('January');
      expect(result).toContain('2024');
    });

    it('should format short month in Albanian', () => {
      const result = formatMonth(testDate, 'sq', 'short', false);
      expect(result).toContain('Jan');
    });

    it('should default to long format without year', () => {
      const result = formatMonth(testDate, 'sq');
      expect(result).toBe('Janar');
    });
  });

  describe('Albanian weekdays', () => {
    const weekdays = [
      { date: new Date('2024-01-15T12:00:00'), name: 'Hënë' }, // Monday
      { date: new Date('2024-01-16T12:00:00'), name: 'Martë' }, // Tuesday
      { date: new Date('2024-01-17T12:00:00'), name: 'Mërkurë' }, // Wednesday
      { date: new Date('2024-01-18T12:00:00'), name: 'Enjte' }, // Thursday
      { date: new Date('2024-01-19T12:00:00'), name: 'Premte' }, // Friday
      { date: new Date('2024-01-20T12:00:00'), name: 'Shtunë' }, // Saturday
      { date: new Date('2024-01-21T12:00:00'), name: 'Dielë' }, // Sunday
    ];

    weekdays.forEach(({ date, name }) => {
      it(`should format ${name} correctly`, () => {
        const result = formatWeekday(date, 'sq', 'long');
        expect(result).toBe(name);
      });
    });
  });
});
