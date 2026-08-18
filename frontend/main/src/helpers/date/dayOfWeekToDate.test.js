import dayOfWeekToDate from './dayOfWeekToDate';

describe('dayOfWeekToDate', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-01T00:00:00Z'));
  });
  afterEach(() => {
    vi.useRealTimers();
  });
  it('should return the correct date for Sunday (0)', () => {
    expect(dayOfWeekToDate(0)).toEqual(new Date('2025-01-05T00:00:00Z'));
  });

  it('should return the correct date for Monday (1)', () => {
    expect(dayOfWeekToDate(1)).toEqual(new Date('2025-01-06T00:00:00Z'));
  });

  it('should return the correct date for Sunday (7)', () => {
    expect(dayOfWeekToDate(7)).toEqual(new Date('2025-01-05T00:00:00Z'));
  });

  it('should throw an error for invalid weekday number (-1)', () => {
    expect(() => dayOfWeekToDate(-1)).toThrow(
      'Invalid weekday number: -1. It should be between 0 (Sunday) and 7 (Sunday).',
    );
  });

  it('should throw an error for invalid weekday number (8)', () => {
    expect(() => dayOfWeekToDate(8)).toThrow(
      'Invalid weekday number: 8. It should be between 0 (Sunday) and 7 (Sunday).',
    );
  });

  it('should throw an error for non-numeric input ("abc")', () => {
    expect(() => dayOfWeekToDate('abc')).toThrow(
      'Invalid weekday number: NaN. It should be between 0 (Sunday) and 7 (Sunday).',
    );
  });

  it('should handle numeric strings correctly', () => {
    expect(dayOfWeekToDate('3')).toEqual(new Date('2025-01-01T00:00:00Z'));
  });
});
