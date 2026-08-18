import type { AiInsightsErrorCode } from '@/api/types/aiInsights';
import {
  ERROR_MESSAGES,
  VALID_ERROR_CODES,
  DEFAULT_SNACKBAR_DURATION,
} from '@/api/aiInsightsErrors';
import { useGenericNotificationStore } from '@/stores/index';

export const handleAiInsightsError = async (
  errorCode: AiInsightsErrorCode,
  rawError?: unknown,
): Promise<void> => {
  const entry = ERROR_MESSAGES[errorCode] ?? ERROR_MESSAGES.INTERNAL_ERROR;

  let text: string;
  if (errorCode === 'WEEKLY_LIMIT_REACHED') {
    const dateTime = await extractFormattedResetTime(rawError);
    text = entry.message(dateTime ? { dateTime } : undefined);
  } else {
    text = entry.message();
  }

  useGenericNotificationStore().openNotification({
    text,
    type: 'error',
    timeout: entry.duration ?? DEFAULT_SNACKBAR_DURATION,
  });
};

/**
 * Extracts resetTime from the API error response and formats it
 * as date+time using the user's profile formats (e.g. "04.03.2026 14:30").
 * Dynamic imports avoid circular dependency: errorHandler → formatDate → store → storeModules → errorHandler.
 * Falls back to empty string if unavailable.
 */
const extractFormattedResetTime = async (error: unknown): Promise<string> => {
  if (!isAxiosLikeError(error)) return '';
  const resetTime = error.response?.data?.resetTime;
  if (typeof resetTime !== 'string') return '';
  try {
    const { formatDate } = await import('@/helpers/date/formatDate');
    const { formatTime } = await import('@/helpers/time/formatTime');
    return `${formatDate(resetTime, 'long')} ${formatTime(resetTime, 'short')}`;
  } catch (err) {
    console.warn('Failed to format AI Insights resetTime:', err);
    return '';
  }
};

interface AxiosLikeError {
  response?: { data?: Record<string, unknown> };
}

const isAxiosLikeError = (error: unknown): error is AxiosLikeError => (
  typeof error === 'object'
  && error !== null
  && 'response' in error
);

export const isKnownErrorCode = (code: string): code is AiInsightsErrorCode => VALID_ERROR_CODES.has(code);

export const extractErrorCode = (error: unknown): AiInsightsErrorCode => {
  if (isAxiosLikeError(error)) {
    const rawCode = error.response?.data?.errorCode;
    if (typeof rawCode === 'string' && isKnownErrorCode(rawCode)) {
      return rawCode;
    }
  }
  return 'INTERNAL_ERROR';
};
