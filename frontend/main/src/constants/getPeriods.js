import predefinedTimePeriodNames from './predefinedTimePeriodNames';

import i18n from '@/services/i18n';
import listToKeyMap from '@/helpers/list/listToKeyMap';

export const getPeriodsList = () => [
  { name: predefinedTimePeriodNames.ONGOING_SHIFT, display: i18n.global.t('Ongoing shift') },
  { name: predefinedTimePeriodNames.PREVIOUS_SHIFT, display: i18n.global.t('Previous shift') },
  { name: predefinedTimePeriodNames.TODAY, display: i18n.global.t('today') },
  { name: predefinedTimePeriodNames.YESTERDAY, display: i18n.global.t('yesterday') },
  { name: predefinedTimePeriodNames.PREVIOUS_PRODUCTION_DAY, display: i18n.global.t('Previous production day') },
  { name: predefinedTimePeriodNames.ROLLING_7_SHIFTS, display: i18n.global.t('Last 7 shifts') },
  { name: predefinedTimePeriodNames.THIS_WEEK, display: i18n.global.t('thisweek') },
  { name: predefinedTimePeriodNames.LAST_WEEK, display: i18n.global.t('lastweek') },
  { name: predefinedTimePeriodNames.ROLLING_7_DAYS, display: i18n.global.t('rolling7days') },
  { name: predefinedTimePeriodNames.THIS_MONTH, display: i18n.global.t('thismonth') },
  { name: predefinedTimePeriodNames.LAST_MONTH, display: i18n.global.t('lastmonth') },
  { name: predefinedTimePeriodNames.ROLLING_30_DAYS, display: i18n.global.t('rolling30days') },
  { name: predefinedTimePeriodNames.THIS_YEAR, display: i18n.global.t('thisyear') },
  { name: predefinedTimePeriodNames.LAST_YEAR, display: i18n.global.t('lastyear') },
  { name: predefinedTimePeriodNames.ROLLING_12_MONTHS, display: i18n.global.t('Last 12 months') },
  { name: predefinedTimePeriodNames.CUSTOM, display: i18n.global.t('custom') },
];
export const getPeriodsMap = () => listToKeyMap(getPeriodsList(), 'name');
export const getPeriod = (period) => getPeriodsMap()[period] ?? null;
