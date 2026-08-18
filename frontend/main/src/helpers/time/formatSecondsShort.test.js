import formatSecondsShort from './formatSecondsShort';

describe('formatSecondsShort', () => {
  test('not friendly', () => {
    expect(formatSecondsShort(-60)).toBe('-00:01:00');
    expect(formatSecondsShort(-256)).toBe('-00:04:16');
    expect(formatSecondsShort(0)).toBe('00:00:00');
    expect(formatSecondsShort(70)).toBe('00:01:10');
    expect(formatSecondsShort(3599)).toBe('00:59:59');
    expect(formatSecondsShort(3600)).toBe('01:00:00');
    expect(formatSecondsShort(4000)).toBe('01:06:40');
  });

  test('friendly for tooltip', () => {
    expect(formatSecondsShort(-60, true, true)).toBe('-0h 1m 0s');
    expect(formatSecondsShort(-256, true, true)).toBe('-0h 4m 16s');
    expect(formatSecondsShort(0, true, true)).toBe('0h 0m 0s');
    expect(formatSecondsShort(70, true, true)).toBe('0h 1m 10s');
    expect(formatSecondsShort(3599, true, true)).toBe('0h 59m 59s');
    expect(formatSecondsShort(3600, true, true)).toBe('1h 0m 0s');
    expect(formatSecondsShort(4000, true, true)).toBe('1h 6m 40s');
  });

  test('just friendly', () => {
    expect(formatSecondsShort(-60, true)).toBe('-1m 0s');
    expect(formatSecondsShort(-256, true)).toBe('-4m 16s');
    expect(formatSecondsShort(0, true)).toBe('0m 0s');
    expect(formatSecondsShort(70, true)).toBe('1m 10s');
    expect(formatSecondsShort(3599, true)).toBe('59m 59s');
    expect(formatSecondsShort(3600, true)).toBe('1h 0m');
    expect(formatSecondsShort(4000, true)).toBe('1h 6m');
    expect(formatSecondsShort(86400, true)).toBe('1d 0h');
    expect(formatSecondsShort(86900, true)).toBe('1d 0h');
    expect(formatSecondsShort(90000, true)).toBe('1d 1h');
  });
});
