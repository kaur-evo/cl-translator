import { isTimeBetweenRange, isTimeOverlapping } from './timeComparison';

describe('Time comparison test', () => {
  describe('isTimeBetweenRange', () => {
    it('returns true if comparison time is between start time and end time', () => {
      const result = isTimeBetweenRange('06:00', '18:00', '10:00');
      expect(result).toBe(true);
    });
    it('returns false if comparison time is not between start time and end time', () => {
      const result = isTimeBetweenRange('06:00', '18:00', '19:00');
      expect(result).toBe(false);
    });
    it('returns true if comparison time is equal to start time and is in range', () => {
      const result = isTimeBetweenRange('06:00', '18:00', '06:00');
      expect(result).toBe(true);
    });
    it('returns true if comparison time is equal to end time and is in range', () => {
      const result = isTimeBetweenRange('06:00', '18:00', '18:00');
      expect(result).toBe(true);
    });
    it('returns true if comparison time, which is before midnight, is between start time and end time', () => {
      const result = isTimeBetweenRange('22:30', '03:00', '23:50');
      expect(result).toBe(true);
    });
    it('returns true if comparison time, which is after midnight, is between start time and end time', () => {
      const result = isTimeBetweenRange('22:30', '03:00', '01:50');
      expect(result).toBe(true);
    });
    it('returns false if comparison time, that is after midnight, is out of start time and end time range', () => {
      const result = isTimeBetweenRange('22:30', '03:00', '04:50');
      expect(result).toBe(false);
    });

    it('returns true if end time and start times are equal', () => {
      const result = isTimeBetweenRange('06:00', '06:00', '07:00');
      expect(result).toBe(true);
    });
  });

  test('isTimeOverLapping', () => {
    // given start time, given end time, comparison start time, comparison end time
    expect(isTimeOverlapping('06:00', '16:00', '14:50', '17:00')).toBe(true);
    expect(isTimeOverlapping('06:00', '16:00', '04:50', '07:00')).toBe(true);
    expect(isTimeOverlapping('06:00', '16:00', '14:50', '15:50')).toBe(true);
    expect(isTimeOverlapping('22:00', '23:00', '22:30', '00:30')).toBe(true);
    expect(isTimeOverlapping('23:00', '01:00', '00:30', '01:30')).toBe(true);
    expect(isTimeOverlapping('23:00', '01:00', '23:30', '00:30')).toBe(true);
    expect(isTimeOverlapping('23:30', '00:30', '23:00', '01:00')).toBe(true);
    expect(isTimeOverlapping('11:50', '00:10', '00:10', '00:00')).toBe(true);
    expect(isTimeOverlapping('06:00', '16:00', '16:00', '18:00')).toBe(false);
    expect(isTimeOverlapping('12:00', '14:00', '10:00', '12:00')).toBe(false);
    expect(isTimeOverlapping('23:45', '00:15', '00:15', '01:00')).toBe(false);
    expect(isTimeOverlapping('23:45', '00:15', '23:00', '23:30')).toBe(false);
  });
});
