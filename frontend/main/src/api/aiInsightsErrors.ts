import type { AiInsightsErrorCode, ErrorEntry } from './types/aiInsights';

import i18n from '@/services/i18n';

export const DEFAULT_SNACKBAR_DURATION = 5000;
export const EXTENDED_SNACKBAR_DURATION = 8000;

/**
 * Maps backend error codes to user-facing translated messages.
 * Values are factories so i18n.global.t() is called at use-time (not import-time)
 * with direct string literals for the automatic translation detection system.
 *
 * Optional `duration` overrides DEFAULT_SNACKBAR_DURATION for codes
 * that need longer display time (e.g. actionable rate-limit messages).
 */
export const ERROR_MESSAGES: Record<AiInsightsErrorCode, ErrorEntry> = {
  VALIDATION_ERROR: {
    message: () => i18n.global.t('Please check your selection and try again.'),
  },
  INSUFFICIENT_NOTES: {
    message: () => i18n.global.t('This combination has fewer than the minimum required notes for analysis.'),
  },
  TOO_MANY_NOTES: {
    message: () => i18n.global.t('Maximum 1000 notes can be processed at a time'),
  },
  FEATURE_DISABLED: {
    message: () => i18n.global.t('AI insights is not enabled for your account.'),
  },
  QUEUE_FULL: {
    message: () => i18n.global.t('Too many requests, please wait and try again'),
    duration: EXTENDED_SNACKBAR_DURATION,
  },
  WEEKLY_LIMIT_REACHED: {
    message: (params?: Record<string, unknown>) => (params?.dateTime
      ? i18n.global.t('Analysis limit reached, reset on {dateTime}', params)
      : i18n.global.t('Analysis limit reached, please try again later')),
    duration: EXTENDED_SNACKBAR_DURATION,
  },
  NOT_FOUND: {
    message: () => i18n.global.t('The requested analysis was not found.'),
  },
  RATE_LIMIT_EXCEEDED: {
    message: () => i18n.global.t('Please wait a moment before trying again.'),
  },
  INTERNAL_ERROR: {
    message: () => i18n.global.t('Extra notes analysis failed, please try again'),
  },
};

// Derived from ERROR_MESSAGES keys to stay in sync automatically
export const VALID_ERROR_CODES: Set<string> = new Set(Object.keys(ERROR_MESSAGES));
