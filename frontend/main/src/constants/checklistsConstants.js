import {
  mdiRuler, mdiContrastCircle, mdiTextShort, mdiCheckCircleOutline, mdiOrderBoolAscendingVariant, mdiOrderBoolDescending,
} from '@mdi/js';

import listToKeyMap from '@/helpers/list/listToKeyMap';
import i18n from '@/services/i18n';

export const changeoverTriggerAppearances = {
  BEFORE: 'BEFORE',
  AFTER: 'AFTER',
};

export const checklistTypes = {
  CHANGEOVER: 'CHANGEOVER',
  INTERVAL: 'INTERVAL',
  QUANTITY: 'QUANTITY',
  STOPREASON: 'STOPREASON',
  MANUAL: 'MANUAL',
  PERIODIC: 'PERIODIC',
  SHIFT: 'SHIFT',
};

export const periodicSubTypes = {
  DAILY: 'DAILY',
  WEEKLY: 'WEEKLY',
  MONTHLY: 'MONTHLY',
};

export const checkTypes = {
  YES_NO: 'YES_NO',
  MEASUREMENT: 'MEASUREMENT',
  TEXT: 'TEXT',
  CHECK: 'CHECK',
  SELECTION: 'SELECTION',
  SINGLE_SELECT: 'SINGLE_SELECT',
  MULTI_SELECT: 'MULTI_SELECT',
};

export const monthlyTriggerModes = {
  ON_WEEKDAY: 'ON_WEEKDAY',
  ON_CALENDAR_DAY: 'ON_CALENDAR_DAY',
};

export const monthlyTriggerOccurrences = {
  FIRST: 1,
  SECOND: 2,
  THIRD: 3,
  FOURTH: 4,
  LAST: -1,
};

export const getMonthlyTriggerOccurrenceList = () => [
  { name: i18n.global.t('First'), id: monthlyTriggerOccurrences.FIRST },
  { name: i18n.global.t('Second_ordinal'), id: monthlyTriggerOccurrences.SECOND },
  { name: i18n.global.t('Third'), id: monthlyTriggerOccurrences.THIRD },
  { name: i18n.global.t('Fourth'), id: monthlyTriggerOccurrences.FOURTH },
  { name: i18n.global.t('Last'), id: monthlyTriggerOccurrences.LAST },
];

export const getMonthlyTriggerOccurrenceListMap = () => listToKeyMap(getMonthlyTriggerOccurrenceList(), 'id');

export const getCheckTypesArray = () => [
  {
    icon: mdiRuler,
    name: i18n.global.t('Measurement'),
    id: checkTypes.MEASUREMENT,
  },
  {
    icon: mdiContrastCircle,
    name: `${i18n.global.t('Yes')}/${i18n.global.t('No')}`,
    id: checkTypes.YES_NO,
  },
  {
    icon: mdiTextShort,
    name: i18n.global.t('Enter text'),
    id: checkTypes.TEXT,
  },
  {
    icon: mdiCheckCircleOutline,
    name: i18n.global.t('Mark as done'),
    id: checkTypes.CHECK,
  },
  {
    icon: mdiOrderBoolDescending,
    name: i18n.global.t('Single-select'),
    id: checkTypes.SINGLE_SELECT,
  },
  {
    icon: mdiOrderBoolAscendingVariant,
    name: i18n.global.t('Multi-select'),
    id: checkTypes.MULTI_SELECT,
  },
];

export const getCheckTypesMap = () => listToKeyMap(getCheckTypesArray(), 'id');

export const checklistStatuses = {
  MISSED: 'MISSED', // not done within 20mins
  NEW: 'NEW',
  UNSUCCESSFUL: 'UNSUCCESSFUL', // some checks not OK
  SUCCESSFUL: 'SUCCESSFUL', // all checks OK
};

export const checkStatusColors = {
  MISSED: 'error',
  NEW: 'lw-gray',
  UNSUCCESSFUL: 'secondary',
  SUCCESSFUL: 'primary',
};

export const getChecklistAlertStatuses = () => [
  {
    name: i18n.global.t('Successful'),
    id: checklistStatuses.SUCCESSFUL,
  },
  {
    name: i18n.global.t('Unsuccessful'),
    id: checklistStatuses.UNSUCCESSFUL,
  },
  {
    name: i18n.global.t('Missed'),
    id: checklistStatuses.MISSED,
  },
  {
    name: i18n.global.t('New'),
    id: checklistStatuses.NEW,
  },
];

export const getChecklistAlertStatusTranslations = () => {
  const statuses = getChecklistAlertStatuses();
  return listToKeyMap(statuses, 'id', 'name');
};

export const getPeriodicFrequenciesList = () => [
  {
    name: i18n.global.t('Daily'),
    id: periodicSubTypes.DAILY,
  },
  {
    name: i18n.global.t('Weekly'),
    id: periodicSubTypes.WEEKLY,
    newIndicatorShownUntil: '2025-11-13T00:00:00',
  },
  {
    name: i18n.global.t('Monthly'),
    id: periodicSubTypes.MONTHLY,
    newIndicatorShownUntil: '2025-11-13T00:00:00',
  },
];

export const getPeriodicFrequenciesTranslation = (id) => {
  const frequencies = getPeriodicFrequenciesList();
  return listToKeyMap(frequencies, 'id')[id].name;
};

export const getChecklistFrequenciesList = () => [
  {
    name: i18n.global.t('Periodical'),
    id: checklistTypes.PERIODIC,
  },
  {
    name: i18n.global.t('Regular intervals'),
    id: checklistTypes.INTERVAL,
  },
  {
    name: i18n.global.t('Shift time'),
    id: checklistTypes.SHIFT,
    newIndicatorShownUntil: '2026-04-30T00:00:00',
  },
  {
    name: i18n.global.t('Changeover'),
    id: checklistTypes.CHANGEOVER,
  },
  {
    name: i18n.global.t('Quantity produced'),
    id: checklistTypes.QUANTITY,
  },
  {
    name: i18n.global.t('Downtime'),
    id: checklistTypes.STOPREASON,
  },
  {
    name: i18n.global.t('Manual activation'),
    id: checklistTypes.MANUAL,
  },
];

export const getChecklistFrequencyTypeTranslation = (type) => {
  const frequencies = getChecklistFrequenciesList();
  return listToKeyMap(frequencies, 'id')[type].name;
};

const defaultProperties = ['productIds', 'type', 'stationIds'];

export const dayOfMonthLimits = { min: 1, max: 31 };
export const repeatEveryWeekLimits = { min: 1, max: 50 };
export const repeatEveryMonthLimits = { min: 1, max: 12 };

export const allowedPropertiesByType = {
  [checklistTypes.INTERVAL]: [...defaultProperties, 'intervalTime', 'pauseDuringDowntime', 'resetOnChangeover', 'resetOnShiftStart'],
  [checklistTypes.CHANGEOVER]: [...defaultProperties, 'delayTime', 'leadTime', 'intervalTime', 'pauseDuringDowntime', 'resetOnShiftStart'],
  [checklistTypes.QUANTITY]: [...defaultProperties, 'resetOnChangeover', 'resetOnShiftStart', 'targetQty'],
  [checklistTypes.STOPREASON]: [...defaultProperties, 'commentIds', 'positionIds', 'setpoint'],
  [checklistTypes.PERIODIC]: {
    [periodicSubTypes.DAILY]: [...defaultProperties, 'subType', 'times'],
    [periodicSubTypes.WEEKLY]: [...defaultProperties, 'subType', 'repeatEvery', 'daysOfWeek', 'times'],
    [periodicSubTypes.MONTHLY]: {
      [monthlyTriggerModes.ON_WEEKDAY]: [...defaultProperties, 'subType', 'repeatEvery', 'dayOfWeek', 'occurrence', 'times'],
      [monthlyTriggerModes.ON_CALENDAR_DAY]: [...defaultProperties, 'subType', 'repeatEvery', 'dayOfMonth', 'times'],
    },
  },
  [checklistTypes.MANUAL]: [...defaultProperties],
  [checklistTypes.SHIFT]: [...defaultProperties, 'offsetFromStartSeconds', 'offsetFromEndSeconds'],
};
