import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia } from 'pinia';
import { createTestingPinia } from '@pinia/testing';

import { handleAiInsightsError, extractErrorCode } from './errorHandler';

import useGenericNotificationStore from '@/stores/genericNotification';
import { ERROR_MESSAGES, DEFAULT_SNACKBAR_DURATION, EXTENDED_SNACKBAR_DURATION, VALID_ERROR_CODES } from '@/api/aiInsightsErrors';

vi.mock('@/services/i18n', () => ({
  default: {
    global: {
      t: (key: string, params?: Record<string, unknown>) => {
        if (params) {
          return Object.entries(params).reduce(
            (str, [k, v]) => str.replace(`{${k}}`, String(v)),
            `translated:${key}`,
          );
        }
        return `translated:${key}`;
      },
    },
  },
}));

vi.mock('@/helpers/date/formatDate', () => ({
  formatDate: vi.fn((_val: string, _fmt: string) => '04.03.2026'),
}));

vi.mock('@/helpers/time/formatTime', () => ({
  formatTime: vi.fn((_val: string, _fmt: string) => '14:30'),
}));

let notificationStore: ReturnType<typeof useGenericNotificationStore>;

describe('errorHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setActivePinia(createTestingPinia({ createSpy: vi.fn }));
    notificationStore = useGenericNotificationStore();
  });

  describe('handleAiInsightsError', () => {
    it.each([
      'VALIDATION_ERROR', 'INSUFFICIENT_NOTES', 'TOO_MANY_NOTES',
      'FEATURE_DISABLED', 'QUEUE_FULL', 'NOT_FOUND',
      'RATE_LIMIT_EXCEEDED', 'INTERNAL_ERROR',
    ] as const)('dispatches correct translated message for %s', async (code) => {
      await handleAiInsightsError(code);

      expect(notificationStore.openNotification).toHaveBeenCalledWith(
        expect.objectContaining({ text: ERROR_MESSAGES[code].message() }),
      );
    });

    it('dispatches notification with only the expected payload fields', async () => {
      await handleAiInsightsError('INTERNAL_ERROR');

      const payload = vi.mocked(notificationStore.openNotification).mock.calls[0]?.[0] as Record<string, unknown>;
      expect(Object.keys(payload).sort((a, b) => a.localeCompare(b))).toStrictEqual(['text', 'timeout', 'type']);
    });

    it('uses EXTENDED_SNACKBAR_DURATION for QUEUE_FULL errors', async () => {
      await handleAiInsightsError('QUEUE_FULL');

      expect(notificationStore.openNotification).toHaveBeenCalledWith(
        expect.objectContaining({ timeout: EXTENDED_SNACKBAR_DURATION }),
      );
    });

    it('uses EXTENDED_SNACKBAR_DURATION for WEEKLY_LIMIT_REACHED errors', async () => {
      await handleAiInsightsError('WEEKLY_LIMIT_REACHED');

      expect(notificationStore.openNotification).toHaveBeenCalledWith(
        expect.objectContaining({ timeout: EXTENDED_SNACKBAR_DURATION }),
      );
    });

    it('falls back to INTERNAL_ERROR message for unknown error codes', async () => {
      // @ts-expect-error — testing invalid input
      await handleAiInsightsError('UNKNOWN_CODE');

      expect(notificationStore.openNotification).toHaveBeenCalledWith(
        expect.objectContaining({ text: ERROR_MESSAGES.INTERNAL_ERROR.message() }),
      );
    });

    it('uses DEFAULT_SNACKBAR_DURATION for other errors', async () => {
      await handleAiInsightsError('VALIDATION_ERROR');

      expect(notificationStore.openNotification).toHaveBeenCalledWith(
        expect.objectContaining({ timeout: DEFAULT_SNACKBAR_DURATION }),
      );
    });

    it('formats resetTime in WEEKLY_LIMIT_REACHED message when rawError has resetTime', async () => {
      const rawError = {
        response: { data: { errorCode: 'WEEKLY_LIMIT_REACHED', resetTime: '2026-03-04T14:30:00Z' } },
      };

      await handleAiInsightsError('WEEKLY_LIMIT_REACHED', rawError);

      const payload = vi.mocked(notificationStore.openNotification).mock.calls[0]?.[0] as Record<string, unknown>;
      expect(payload.text).toContain('04.03.2026 14:30');
    });

    it('dispatches fallback message for WEEKLY_LIMIT_REACHED when resetTime is missing', async () => {
      const rawError = {
        response: { data: { errorCode: 'WEEKLY_LIMIT_REACHED' } },
      };

      await handleAiInsightsError('WEEKLY_LIMIT_REACHED', rawError);

      const payload = vi.mocked(notificationStore.openNotification).mock.calls[0]?.[0] as Record<string, unknown>;
      expect(payload.text).toContain('Analysis limit reached');
      expect(payload.text).not.toContain('{dateTime}');
    });

    it('dispatches fallback message for WEEKLY_LIMIT_REACHED with malformed rawError', async () => {
      await handleAiInsightsError('WEEKLY_LIMIT_REACHED', new Error('random'));

      const payload = vi.mocked(notificationStore.openNotification).mock.calls[0]?.[0] as Record<string, unknown>;
      expect(payload.text).toContain('Analysis limit reached');
      expect(payload.text).not.toContain('{dateTime}');
    });

    it('dispatches fallback message when formatDate throws during resetTime formatting', async () => {
      const { formatDate } = await import('@/helpers/date/formatDate');
      vi.mocked(formatDate).mockImplementationOnce(() => {
        throw new Error('format failure');
      });

      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const rawError = {
        response: { data: { errorCode: 'WEEKLY_LIMIT_REACHED', resetTime: '2026-03-04T14:30:00Z' } },
      };

      await handleAiInsightsError('WEEKLY_LIMIT_REACHED', rawError);

      const payload = vi.mocked(notificationStore.openNotification).mock.calls[0]?.[0] as Record<string, unknown>;
      expect(payload.text).toContain('Analysis limit reached');
      expect(payload.text).not.toContain('04.03.2026');

      expect(warnSpy).toHaveBeenCalledWith(
        'Failed to format AI Insights resetTime:',
        expect.any(Error),
      );

      warnSpy.mockRestore();
    });
  });

  it('VALID_ERROR_CODES contains exactly the keys of ERROR_MESSAGES', () => {
    const compare = (a: string, b: string) => a.localeCompare(b);
    expect([...VALID_ERROR_CODES].sort(compare)).toStrictEqual(Object.keys(ERROR_MESSAGES).sort(compare));
  });

  describe('extractErrorCode', () => {
    it('extracts errorCode from axios error response', () => {
      const axiosError = { response: { data: { errorCode: 'QUEUE_FULL', status: 'error', message: 'Full' } } };
      expect(extractErrorCode(axiosError)).toBe('QUEUE_FULL');
    });

    it('returns INTERNAL_ERROR for non-axios errors', () => {
      expect(extractErrorCode(new Error('random'))).toBe('INTERNAL_ERROR');
    });

    it('returns INTERNAL_ERROR for null/undefined input', () => {
      expect(extractErrorCode(null)).toBe('INTERNAL_ERROR');
      expect(extractErrorCode(undefined)).toBe('INTERNAL_ERROR');
    });

    it('returns INTERNAL_ERROR when response exists but has no data', () => {
      expect(extractErrorCode({ response: {} })).toBe('INTERNAL_ERROR');
    });

    it('returns INTERNAL_ERROR when response.data exists but has no errorCode', () => {
      expect(extractErrorCode({ response: { data: { message: 'fail' } } })).toBe('INTERNAL_ERROR');
    });

    it('returns INTERNAL_ERROR for unknown error codes from server', () => {
      const axiosError = { response: { data: { errorCode: 'SOME_FUTURE_CODE', status: 'error', message: 'new' } } };
      expect(extractErrorCode(axiosError)).toBe('INTERNAL_ERROR');
    });

    it.each([
      'VALIDATION_ERROR', 'INSUFFICIENT_NOTES', 'TOO_MANY_NOTES',
      'FEATURE_DISABLED', 'QUEUE_FULL', 'WEEKLY_LIMIT_REACHED',
      'NOT_FOUND', 'RATE_LIMIT_EXCEEDED', 'INTERNAL_ERROR',
    ] as const)('extracts known error code %s correctly', (code) => {
      const axiosError = { response: { data: { errorCode: code, status: 'error', message: 'test' } } };
      expect(extractErrorCode(axiosError)).toBe(code);
    });
  });
});
