import { format } from 'date-fns';
import { sq } from 'date-fns/locale';

/**
 * Format a date part with proper locale support, including Albanian
 * @param {Date} date - The date to format
 * @param {string} locale - The locale code (e.g., 'en', 'sq', 'de')
 * @param {Object} options - Formatting options
 * @param {string} [options.weekday] - Weekday format: 'narrow', 'short', 'long'
 * @param {string} [options.month] - Month format: 'numeric', 'short', 'long'
 * @param {string} [options.year] - Year format: 'numeric', '2-digit'
 * @returns {string} Formatted date string
 */
export function formatLocaleDate(date, locale, options = {}) {
  // Special handling for Albanian locale using date-fns
  if (locale === 'sq') {
    const formatParts = [];

    if (options.weekday) {
      const weekdayFormats = {
        narrow: 'EEEEEE',
        short: 'EEE',
        long: 'EEEE',
      };
      formatParts.push(format(date, weekdayFormats[options.weekday] || 'EEEE', { locale: sq }));
    }

    if (options.month) {
      const monthFormats = {
        numeric: 'M',
        '2-digit': 'MM',
        short: 'MMM',
        long: 'MMMM',
      };
      formatParts.push(format(date, monthFormats[options.month] || 'MMMM', { locale: sq }));
    }

    if (options.year) {
      const yearFormats = {
        numeric: 'yyyy',
        '2-digit': 'yy',
      };
      formatParts.push(format(date, yearFormats[options.year] || 'yyyy', { locale: sq }));
    }

    return formatParts.join(' ');
  }

  // Default: use native toLocaleDateString for other locales
  return date.toLocaleDateString(locale, options);
}

/**
 * Format weekday name with proper locale support
 * @param {Date} date - The date to format
 * @param {string} locale - The locale code
 * @param {string} format - Format type: 'narrow', 'short', 'long'
 * @returns {string} Formatted weekday name
 */
export function formatWeekday(date, locale, formatType = 'long') {
  return formatLocaleDate(date, locale, { weekday: formatType });
}

/**
 * Format month name with proper locale support
 * @param {Date} date - The date to format
 * @param {string} locale - The locale code
 * @param {string} format - Format type: 'numeric', '2-digit', 'short', 'long'
 * @param {boolean} includeYear - Whether to include the year
 * @returns {string} Formatted month name
 */
export function formatMonth(date, locale, formatType = 'long', includeYear = false) {
  const options = { month: formatType };
  if (includeYear) {
    options.year = 'numeric';
  }
  return formatLocaleDate(date, locale, options);
}
