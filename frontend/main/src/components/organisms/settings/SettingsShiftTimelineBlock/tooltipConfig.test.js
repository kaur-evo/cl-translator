import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DateTime } from 'luxon';

import getTooltipHTML, { getTooltipParamsRows, getTooltipDotRow, getTooltipStartDateValue, getTooltipDurationValue, getTooltipTimeRangeValue } from './tooltipConfig';

import humanizeDuration from '@/helpers/time/humanizeDuration';
import { formatTimeInZone } from '@/helpers/time/formatTime';
import i18n from '@/services/i18n';

vi.mock('@/services/i18n', () => ({
  default: {
    global: {
      t: vi.fn((key) => `[${key}]`),
    },
  },
}));

vi.mock('@/helpers/time/formatTime', () => ({
  formatTimeInZone: vi.fn((iso, zone) => DateTime.fromISO(iso, { zone }).toFormat('HH:mm')),
}));

vi.mock('@/helpers/time/humanizeDuration', () => ({
  default: vi.fn((duration) => `${Math.floor(duration / 3600)}h`),
}));

vi.mock('@/helpers/date/formatDate', () => ({
  formatDateInZone: vi.fn((iso, zone) => DateTime.fromISO(iso, { zone }).toFormat('yyyy-MM-dd')),
}));


describe('getTooltipDotRow', () => {
  it('should return correct HTML when shiftName is provided', () => {
    const d = { shiftName: 'Test Label', color: '#ff0000' };
    const result = getTooltipDotRow(d);
    expect(result).toMatchSnapshot();
  });

  it('should use the provided color in the icon template', () => {
    const d = { shiftName: 'Label', color: '#123456' };
    const result = getTooltipDotRow(d);
    expect(result).toMatchSnapshot();
  });

  it('should return null when shiftName is missing', () => {
    const d = { color: '#ff0000' };
    const result = getTooltipDotRow(d);
    expect(result).toBeNull();
  });

  it('should return null when shiftName is an empty string', () => {
    const d = { shiftName: '', color: '#ff0000' };
    const result = getTooltipDotRow(d);
    expect(result).toBeNull();
  });

  it('should handle missing color gracefully', () => {
    const d = { shiftName: 'Label' };
    const result = getTooltipDotRow(d);
    expect(result).toMatchSnapshot();
  });
});

describe('getTooltipStartDateValue', () => {
  it('should return formatted date for valid ISO and zone', () => {
    const d = { startTimeISO: '2024-06-01T08:30:00.000Z', zoneId: 'America/New_York' };
    expect(getTooltipStartDateValue(d)).toBe('2024-06-01');
  });

  it('should use default zone if zoneId is missing', () => {
    const d = { startTimeISO: '2024-06-01T08:30:00.000Z' };
    expect(getTooltipStartDateValue(d)).toBe('2024-06-01');
  });

  it('should return "Invalid DateTime" for invalid ISO string', () => {
    const d = { startTimeISO: 'invalid-date', zoneId: 'America/New_York' };
    expect(getTooltipStartDateValue(d)).toBe('Invalid DateTime');
  });
});

describe('getTooltipDurationValue', () => {
  it('should return humanized duration for valid ISO and zone', () => {
    const d = {
      startTimeISO: '2024-06-01T08:30:00.000Z',
      endTimeISO: '2024-06-01T10:00:00.000Z',
      zoneId: 'America/New_York',
    };
    const stTm = DateTime.fromISO(d.startTimeISO, { zone: d.zoneId });
    const enTm = DateTime.fromISO(d.endTimeISO, { zone: d.zoneId });
    const duration = enTm.diff(stTm, 'seconds').toObject().seconds;
    // Assume humanizeDuration returns "1 hour 30 minutes" for 5400 seconds
    expect(getTooltipDurationValue(d)).toBe(humanizeDuration(duration, { largest: 'hour' }));
  });

  it('should use default zone if zoneId is missing', () => {
    const d = {
      startTimeISO: '2024-06-01T08:30:00.000Z',
      endTimeISO: '2024-06-01T10:00:00.000Z',
    };
    const stTm = DateTime.fromISO(d.startTimeISO);
    const enTm = DateTime.fromISO(d.endTimeISO);
    const duration = enTm.diff(stTm, 'seconds').toObject().seconds;
    expect(getTooltipDurationValue(d)).toBe(humanizeDuration(duration, { largest: 'hour' }));
  });

  it('should return humanized duration for negative duration (end before start)', () => {
    const d = {
      startTimeISO: '2024-06-01T10:00:00.000Z',
      endTimeISO: '2024-06-01T08:30:00.000Z',
      zoneId: 'America/New_York',
    };
    const stTm = DateTime.fromISO(d.startTimeISO, { zone: d.zoneId });
    const enTm = DateTime.fromISO(d.endTimeISO, { zone: d.zoneId });
    const duration = enTm.diff(stTm, 'seconds').toObject().seconds;
    expect(getTooltipDurationValue(d)).toBe(humanizeDuration(duration, { largest: 'hour' }));
  });

  it('should return humanized duration for zero duration', () => {
    const d = {
      startTimeISO: '2024-06-01T10:00:00.000Z',
      endTimeISO: '2024-06-01T10:00:00.000Z',
      zoneId: 'America/New_York',
    };
    expect(getTooltipDurationValue(d)).toBe(humanizeDuration(0, { largest: 'hour' }));
  });

  it('should return humanized duration for missing endTimeISO', () => {
    const d = {
      startTimeISO: '2024-06-01T10:00:00.000Z',
      zoneId: 'America/New_York',
    };
    const stTm = DateTime.fromISO(d.startTimeISO, { zone: d.zoneId });
    const enTm = DateTime.fromISO(undefined, { zone: d.zoneId });
    const duration = enTm.diff(stTm, 'seconds').toObject().seconds;
    expect(getTooltipDurationValue(d)).toBe(humanizeDuration(duration, { largest: 'hour' }));
  });

  it('should return humanized duration for missing startTimeISO', () => {
    const d = {
      endTimeISO: '2024-06-01T10:00:00.000Z',
      zoneId: 'America/New_York',
    };
    const stTm = DateTime.fromISO(undefined, { zone: d.zoneId });
    const enTm = DateTime.fromISO(d.endTimeISO, { zone: d.zoneId });
    const duration = enTm.diff(stTm, 'seconds').toObject().seconds;
    expect(getTooltipDurationValue(d)).toBe(humanizeDuration(duration, { largest: 'hour' }));
  });

  it('should return humanized duration for invalid startTimeISO', () => {
    const d = {
      startTimeISO: 'invalid-date',
      endTimeISO: '2024-06-01T10:00:00.000Z',
      zoneId: 'America/New_York',
    };
    const stTm = DateTime.fromISO(d.startTimeISO, { zone: d.zoneId });
    const enTm = DateTime.fromISO(d.endTimeISO, { zone: d.zoneId });
    const duration = enTm.diff(stTm, 'seconds').toObject().seconds;
    expect(getTooltipDurationValue(d)).toBe(humanizeDuration(duration, { largest: 'hour' }));
  });

  it('should return humanized duration for invalid endTimeISO', () => {
    const d = {
      startTimeISO: '2024-06-01T10:00:00.000Z',
      endTimeISO: 'invalid-date',
      zoneId: 'America/New_York',
    };
    const stTm = DateTime.fromISO(d.startTimeISO, { zone: d.zoneId });
    const enTm = DateTime.fromISO(d.endTimeISO, { zone: d.zoneId });
    const duration = enTm.diff(stTm, 'seconds').toObject().seconds;
    expect(getTooltipDurationValue(d)).toBe(humanizeDuration(duration, { largest: 'hour' }));
  });

  it('should return humanized duration for both startTimeISO and endTimeISO missing', () => {
    const d = { zoneId: 'America/New_York' };
    const stTm = DateTime.fromISO(undefined, { zone: d.zoneId });
    const enTm = DateTime.fromISO(undefined, { zone: d.zoneId });
    const duration = enTm.diff(stTm, 'seconds').toObject().seconds;
    expect(getTooltipDurationValue(d)).toBe(humanizeDuration(duration, { largest: 'hour' }));
  });
});

describe('getTooltipTimeRangeValue', () => {
  it('should return formatted time range and duration for valid ISO and zone', () => {
    const d = {
      startTimeISO: '2024-06-01T08:30:00.000Z',
      endTimeISO: '2024-06-01T10:00:00.000Z',
      zoneId: 'America/New_York',
    };

    const startTime = formatTimeInZone(d.startTimeISO, d.zoneId);
    const endTime = formatTimeInZone(d.endTimeISO, d.zoneId);
    const duration = getTooltipDurationValue(d);
    const expected = `${startTime} - ${endTime} (${duration})`;
    expect(getTooltipTimeRangeValue(d)).toBe(expected);
  });

  it('should handle missing zoneId by using default zone', () => {
    const d = {
      startTimeISO: '2024-06-01T08:30:00.000Z',
      endTimeISO: '2024-06-01T10:00:00.000Z',
    };
    const startTime = formatTimeInZone(d.startTimeISO, undefined);
    const endTime = formatTimeInZone(d.endTimeISO, undefined);
    const duration = getTooltipDurationValue(d);
    const expected = `${startTime} - ${endTime} (${duration})`;
    expect(getTooltipTimeRangeValue(d)).toBe(expected);
  });

  it('should return "Invalid DateTime" for invalid startTimeISO', () => {
    const d = {
      startTimeISO: 'invalid-date',
      endTimeISO: '2024-06-01T10:00:00.000Z',
      zoneId: 'America/New_York',
    };
    const startTime = formatTimeInZone(d.startTimeISO, d.zoneId);
    const endTime = formatTimeInZone(d.endTimeISO, d.zoneId);
    const duration = getTooltipDurationValue(d);
    const expected = `${startTime} - ${endTime} (${duration})`;
    expect(getTooltipTimeRangeValue(d)).toBe(expected);
  });

  it('should return "Invalid DateTime" for invalid endTimeISO', () => {
    const d = {
      startTimeISO: '2024-06-01T08:30:00.000Z',
      endTimeISO: 'invalid-date',
      zoneId: 'America/New_York',
    };
    const startTime = formatTimeInZone(d.startTimeISO, d.zoneId);
    const endTime = formatTimeInZone(d.endTimeISO, d.zoneId);
    const duration = getTooltipDurationValue(d);
    const expected = `${startTime} - ${endTime} (${duration})`;
    expect(getTooltipTimeRangeValue(d)).toBe(expected);
  });

  it('should handle missing startTimeISO gracefully', () => {
    const d = {
      endTimeISO: '2024-06-01T10:00:00.000Z',
      zoneId: 'America/New_York',
    };
    const startTime = formatTimeInZone(undefined, d.zoneId);
    const endTime = formatTimeInZone(d.endTimeISO, d.zoneId);
    const duration = getTooltipDurationValue(d);
    const expected = `${startTime} - ${endTime} (${duration})`;
    expect(getTooltipTimeRangeValue(d)).toBe(expected);
  });

  it('should handle missing endTimeISO gracefully', () => {
    const d = {
      startTimeISO: '2024-06-01T08:30:00.000Z',
      zoneId: 'America/New_York',
    };
    const startTime = formatTimeInZone(d.startTimeISO, d.zoneId);
    const endTime = formatTimeInZone(undefined, d.zoneId);
    const duration = getTooltipDurationValue(d);
    const expected = `${startTime} - ${endTime} (${duration})`;
    expect(getTooltipTimeRangeValue(d)).toBe(expected);
  });

  it('should handle both startTimeISO and endTimeISO missing', () => {
    const d = { zoneId: 'America/New_York' };
    const startTime = formatTimeInZone(undefined, d.zoneId);
    const endTime = formatTimeInZone(undefined, d.zoneId);
    const duration = getTooltipDurationValue(d);
    const expected = `${startTime} - ${endTime} (${duration})`;
    expect(getTooltipTimeRangeValue(d)).toBe(expected);
  });
});

describe('getTooltipParamsRows', () => {
  beforeEach(() => {
    i18n.global.t.mockClear();
  });

  it('returns formatted HTML rows for tooltip params', () => {
    const d = {
      startTimeISO: '2025-11-10T08:00:00.000Z',
      endTimeISO: '2025-11-10T16:00:00.000Z',
      zoneId: 'Europe/Tallinn',
    };
    const html = getTooltipParamsRows(d);
    expect(html).toContain('<span class="text-tertiary-dark font-weight-regular">[Start]:&nbsp;</span>');
    expect(html).toContain('<span class="text-body-small font-weight-regular text-none">2025-11-10</span>');
    expect(html).toContain('<span class="text-tertiary-dark font-weight-regular">[Time]:&nbsp;</span>');
    expect(html).toContain(`<div class="text-label-small font-weight-regular align-center d-flex">
              <span class="text-tertiary-dark font-weight-regular">[Start]:&nbsp;</span>
              <span class="text-body-small font-weight-regular text-none">2025-11-10</span>
              </div><div class="text-label-small font-weight-regular align-center d-flex">
              <span class="text-tertiary-dark font-weight-regular">[Time]:&nbsp;</span>
              <span class="text-body-small font-weight-regular text-none">10:00 - 18:00 (8h)</span>
              </div>`);
  });

  it('calls i18n translation keys', () => {
    const d = {
      startTimeISO: '2025-11-10T08:00:00.000Z',
      endTimeISO: '2025-11-10T16:00:00.000Z',
      zoneId: 'Europe/Tallinn',
    };
    getTooltipParamsRows(d);
    expect(i18n.global.t).toHaveBeenCalledWith('Start');
    expect(i18n.global.t).toHaveBeenCalledWith('Time');
  });
});

describe('getTooltipHTML', () => {
  beforeEach(() => {
    i18n.global.t.mockClear();
  });


  it('returns tooltip with dot row, params, and no extra info for enabled shift', async () => {
    const d = {
      shiftName: 'Morning',
      color: '#fff',
      startTimeISO: '2025-11-10T08:00:00.000Z',
      endTimeISO: '2025-11-10T16:00:00.000Z',
      zoneId: 'Europe/Tallinn',
      isEmpty: false,
      disabled: false,
    };
    const html = await getTooltipHTML(d);
    expect(html).toMatchSnapshot();
    expect(html).not.toContain('To edit this shift go to the Shift View');
  });

  it('returns tooltip with extra info for disabled shift', async () => {
    const d = {
      shiftName: 'Night',
      color: '#000',
      startTimeISO: '2025-11-10T22:00:00.000Z',
      endTimeISO: '2025-11-11T06:00:00.000Z',
      zoneId: 'Europe/Tallinn',
      isEmpty: false,
      disabled: true,
    };
    const html = await getTooltipHTML(d);
    expect(html).toContain('Night');
    expect(html).toContain('[To edit this shift go to the Shift View]');
    expect(html).toContain('font-italic');
  });
});
