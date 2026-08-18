import { formatFn, getDaysList, getDaysMap } from './getDays';

describe('getDays', () => {
  describe('formatFn', () => {
    it('returns correctly formatted days in estonian with short format', () => {
      expect(formatFn(0, 'et', 'short')).toBe('E');
      expect(formatFn(1, 'et', 'short')).toBe('T');
      expect(formatFn(2, 'et', 'short')).toBe('K');
      expect(formatFn(3, 'et', 'short')).toBe('N');
      expect(formatFn(4, 'et', 'short')).toBe('R');
      expect(formatFn(5, 'et', 'short')).toBe('L');
      expect(formatFn(6, 'et', 'short')).toBe('P');
    });

    it('returns correctly formatted days in estonian with long format', () => {
      expect(formatFn(0, 'et', 'long')).toBe('esmaspäev');
      expect(formatFn(1, 'et', 'long')).toBe('teisipäev');
      expect(formatFn(2, 'et', 'long')).toBe('kolmapäev');
      expect(formatFn(3, 'et', 'long')).toBe('neljapäev');
      expect(formatFn(4, 'et', 'long')).toBe('reede');
      expect(formatFn(5, 'et', 'long')).toBe('laupäev');
      expect(formatFn(6, 'et', 'long')).toBe('pühapäev');
    });

    it('returns correctly formatted days in english with short format', () => {
      expect(formatFn(0, 'en', 'short')).toBe('Mon');
      expect(formatFn(1, 'en', 'short')).toBe('Tue');
      expect(formatFn(2, 'en', 'short')).toBe('Wed');
      expect(formatFn(3, 'en', 'short')).toBe('Thu');
      expect(formatFn(4, 'en', 'short')).toBe('Fri');
      expect(formatFn(5, 'en', 'short')).toBe('Sat');
      expect(formatFn(6, 'en', 'short')).toBe('Sun');
    });

    it('returns correctly formatted days in english with long format', () => {
      expect(formatFn(0, 'en', 'long')).toBe('Monday');
      expect(formatFn(1, 'en', 'long')).toBe('Tuesday');
      expect(formatFn(2, 'en', 'long')).toBe('Wednesday');
      expect(formatFn(3, 'en', 'long')).toBe('Thursday');
      expect(formatFn(4, 'en', 'long')).toBe('Friday');
      expect(formatFn(5, 'en', 'long')).toBe('Saturday');
      expect(formatFn(6, 'en', 'long')).toBe('Sunday');
    });
  });

  describe('getDaysList', () => {
    it('returns days in correct order with sunday as a first day of the week', () => {
      const days = getDaysList('en', 0);
      expect(days).toEqual([
        {
          id: 'SUNDAY', text: 'Sunday', shortText: 'Sun', order: 0,
        },
        {
          id: 'MONDAY', text: 'Monday', shortText: 'Mon', order: 1,
        },
        {
          id: 'TUESDAY', text: 'Tuesday', shortText: 'Tue', order: 2,
        },
        {
          id: 'WEDNESDAY', text: 'Wednesday', shortText: 'Wed', order: 3,
        },
        {
          id: 'THURSDAY', text: 'Thursday', shortText: 'Thu', order: 4,
        },
        {
          id: 'FRIDAY', text: 'Friday', shortText: 'Fri', order: 5,
        },
        {
          id: 'SATURDAY', text: 'Saturday', shortText: 'Sat', order: 6,
        },
      ]);
    });
    it('returns days in correct order with monday as a first day of the week', () => {
      const days = getDaysList('en', 1);
      expect(days).toEqual([
        {
          id: 'MONDAY', text: 'Monday', shortText: 'Mon', order: 0,
        },
        {
          id: 'TUESDAY', text: 'Tuesday', shortText: 'Tue', order: 1,
        },
        {
          id: 'WEDNESDAY', text: 'Wednesday', shortText: 'Wed', order: 2,
        },
        {
          id: 'THURSDAY', text: 'Thursday', shortText: 'Thu', order: 3,
        },
        {
          id: 'FRIDAY', text: 'Friday', shortText: 'Fri', order: 4,
        },
        {
          id: 'SATURDAY', text: 'Saturday', shortText: 'Sat', order: 5,
        },
        {
          id: 'SUNDAY', text: 'Sunday', shortText: 'Sun', order: 6,
        },
      ]);
    });
  });

  test('getDaysMap', () => {
    const daysMap = getDaysMap('en', 0);
    expect(daysMap).toEqual({
      SUNDAY: {
        id: 'SUNDAY', text: 'Sunday', shortText: 'Sun', order: 0,
      },
      MONDAY: {
        id: 'MONDAY', text: 'Monday', shortText: 'Mon', order: 1,
      },
      TUESDAY: {
        id: 'TUESDAY', text: 'Tuesday', shortText: 'Tue', order: 2,
      },
      WEDNESDAY: {
        id: 'WEDNESDAY', text: 'Wednesday', shortText: 'Wed', order: 3,
      },
      THURSDAY: {
        id: 'THURSDAY', text: 'Thursday', shortText: 'Thu', order: 4,
      },
      FRIDAY: {
        id: 'FRIDAY', text: 'Friday', shortText: 'Fri', order: 5,
      },
      SATURDAY: {
        id: 'SATURDAY', text: 'Saturday', shortText: 'Sat', order: 6,
      },
    });
  });
});
