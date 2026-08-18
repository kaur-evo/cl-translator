import { isWeekendDay } from './isWeekendDay';

describe('isWeekendDay', () => {
  it('should return true for a Saturday date', () => {
    expect(isWeekendDay('2024-06-15')).toBe(true); // June 15, 2024 is a Saturday
  });

  it('should return true for a Sunday date', () => {
    expect(isWeekendDay('2024-06-16')).toBe(true); // June 16, 2024 is a Sunday
  });

  it('should return false for a Monday date', () => {
    expect(isWeekendDay('2024-06-17')).toBe(false); // June 17, 2024 is a Monday
  });

  it('should return false for a Tuesday date', () => {
    expect(isWeekendDay('2024-06-18')).toBe(false); // June 18, 2024 is a Tuesday
  });

  it('should return false for a Wednesday date', () => {
    expect(isWeekendDay('2024-06-19')).toBe(false); // June 19, 2024 is a Wednesday
  });

  it('should return false for a Thursday date', () => {
    expect(isWeekendDay('2024-06-20')).toBe(false); // June 20, 2024 is a Thursday
  });

  it('should return false for a Friday date', () => {
    expect(isWeekendDay('2024-06-21')).toBe(false); // June 21, 2024 is a Friday
  });
});
