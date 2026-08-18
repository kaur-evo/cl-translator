import { mdiAlertOutline } from '@mdi/js';
import { isPast, isToday } from 'date-fns';

import i18n from '@/services/i18n';
import { NO_TRACKING_DATA } from '@/constants/improvementsEventTypes';
import { REDUCE_BY_PCT, REDUCE_TO_TIME } from '@/constants/improvementsDataTrackingTypes';
import { formatDate } from '@/helpers/date/formatDate';
import { formatNumber, formatPercentage } from '@/helpers/numbers/formatNumber';
import formatTooltipByLimit from '@/helpers/formatTooltipByLimit';
import formatSecondsFriendly from '@/helpers/time/formatSecondsFriendly';


const getWarningIcon = (project) => {
  const endDate = new Date(project.endDate);
  if (!project.finished && (isPast(endDate) || isToday(endDate))) {
    return mdiAlertOutline;
  }
  return '';
};

const getBaselineOrCurrentAverage = (value, project) => {
  if (project.eventType === NO_TRACKING_DATA) return '-';
  if (value === 'loading') return 'loading';
  if (project.targetType === REDUCE_BY_PCT || project.targetType === REDUCE_TO_TIME) {
    return formatSecondsFriendly(value);
  }
  return `${formatNumber(value)}/day`;
};

const getChangeValue = (change, project) => {
  if (project.eventType === NO_TRACKING_DATA) return '-';
  if (change === 'loading') return 'loading';
  return formatPercentage(Math.abs(change * 100));
};

const getChangeColClasses = (project) => {
  if (project.change > 0 && project.eventType !== NO_TRACKING_DATA) {
    return ['text-lw-green', 'font-weight-medium'];
  }
  if (project.change < 0 && project.eventType !== NO_TRACKING_DATA) {
    return ['text-lw-red', 'font-weight-medium'];
  }
  if (project.eventType !== NO_TRACKING_DATA) return 'font-weight-medium';
  return '';
};

export function createTableHeadersConf() {
  const headers = [
    {
      text: i18n.global.t('Name'),
      value: 'name',
      textKey: 'name',
      isBold: true,
      prependIcon: (project) => getWarningIcon(project),
      prependIconColor: 'secondary',
      prependIconSize: 16,
      width: '200px',
    },
    {
      text: i18n.global.t('Start'),
      value: 'startDate',
      textKey: 'startDate',
      width: '100px',
      formatFn: (val) => formatDate(val, 'long'),
    },
    {
      text: i18n.global.t('End'),
      value: 'endDate',
      textKey: 'endDate',
      width: '100px',
      formatFn: (val) => formatDate(val, 'long'),
    },
    {
      text: i18n.global.t('Team'),
      value: 'users',
      textKey: 'usersArray',
      width: '200px',
      formatFn: (val) => val.join(', '),
    },
    {
      text: i18n.global.t('Stations'),
      value: 'stationIds',
      textKey: 'stationNamesArray',
      width: '200px',
      formatFn: (val) => (val.length ? (formatTooltipByLimit(val) || '-') : '-'),
    },
    {
      text: i18n.global.t('Stop reason'),
      value: 'commentIds',
      textKey: 'commentsNamesArray',
      width: '200px',
      formatFn: (val) => (val.length ? (formatTooltipByLimit(val) || '-') : '-'),
    },
    {
      text: i18n.global.t('Actions'),
      value: 'steps',
      textKey: 'steps',
      width: '100px',
      formatFn: (val) => `${val.filter((x) => x.completed).length}/${val.length}`,
    },
    {
      text: i18n.global.t('Baseline average'),
      value: 'initialDailyAverage',
      textKey: 'initialDailyAverage',
      width: '100px',
      hasProgressBarOnLoad: true,
      formatFn: (val, project) => getBaselineOrCurrentAverage(val, project),
    },
    {
      text: i18n.global.t('Current average'),
      value: 'currentAverage',
      textKey: 'currentAverage',
      width: '100px',
      formatFn: (val, project) => getBaselineOrCurrentAverage(val, project),
    },
    {
      text: i18n.global.t('Change'),
      value: 'change',
      textKey: 'change',
      width: '100px',
      formatFn: (val, project) => getChangeValue(val, project),
      class: (val) => getChangeColClasses(val),
    },
  ];
  return headers;
}
