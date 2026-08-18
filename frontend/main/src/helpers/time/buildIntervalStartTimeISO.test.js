import { DateTime } from 'luxon';

import { buildIntervalStartTimeISO } from './buildIntervalStartTimeISO';

describe('buildIntervalStartTimeISO', () => {
  let mockNow;

  beforeEach(() => {
    mockNow = vi.spyOn(DateTime, 'now');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns null when input is null', () => {
    expect(buildIntervalStartTimeISO(null)).toBeNull();
  });

  it('returns null when input is empty string', () => {
    expect(buildIntervalStartTimeISO('')).toBeNull();
  });

  it('keeps today when picked HH:mm is later today', () => {
    mockNow.mockReturnValue(DateTime.fromISO('2024-01-01T09:00:00.000Z', { zone: 'UTC' }));
    expect(buildIntervalStartTimeISO('17:00')).toBe('2024-01-01T17:00:00.000Z');
  });

  it('rolls forward to tomorrow when picked HH:mm already passed today', () => {
    mockNow.mockReturnValue(DateTime.fromISO('2024-01-01T18:00:00.000Z', { zone: 'UTC' }));
    expect(buildIntervalStartTimeISO('10:30')).toBe('2024-01-02T10:30:00.000Z');
  });

  it('rolls forward across a month boundary when HH:mm already passed today', () => {
    mockNow.mockReturnValue(DateTime.fromISO('2024-01-31T23:30:00.000Z', { zone: 'UTC' }));
    expect(buildIntervalStartTimeISO('08:00')).toBe('2024-02-01T08:00:00.000Z');
  });

  it('keeps today when picked HH:mm is one minute in the future', () => {
    mockNow.mockReturnValue(DateTime.fromISO('2024-06-15T12:00:00.000Z', { zone: 'UTC' }));
    expect(buildIntervalStartTimeISO('12:01')).toBe('2024-06-15T12:01:00.000Z');
  });

  it('rolls forward when picked HH:mm is one minute in the past', () => {
    mockNow.mockReturnValue(DateTime.fromISO('2024-06-15T12:00:00.000Z', { zone: 'UTC' }));
    expect(buildIntervalStartTimeISO('11:59')).toBe('2024-06-16T11:59:00.000Z');
  });
});
