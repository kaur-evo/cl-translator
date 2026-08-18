import { isEqual } from 'lodash';

import { DAYS } from '@/constants/shiftViewTimeRestrictionTypes';
import i18n from '@/services/i18n';
import useConfigurationStore from '@/stores/configuration';
import useFactoryStore from '@/stores/factory';
import useFeatureStore from '@/stores/feature';
import useProfileStore from '@/stores/profile';
import { entities } from '@/constants/activityLogsConstants';
import { getUserSelectableColorName } from '@/constants/userSelectableColors';
import { getRunTimeType, getUnitConversionType } from '@/constants/productRouteConstants';
import { formatNumber } from '@/helpers/numbers/formatNumber';
import { formatDate } from '@/helpers/date/formatDate';
import listToCommaSeparatedString from '@/helpers/list/listToCommaSeparatedString';
import formatSecondsFriendly from '@/helpers/time/formatSecondsFriendly';
import {
  checklistTypes, periodicSubTypes, getChecklistFrequencyTypeTranslation, getPeriodicFrequenciesTranslation, getMonthlyTriggerOccurrenceListMap, getCheckTypesMap, checkTypes,
} from '@/constants/checklistsConstants';
import { getRepeatEverySuffix } from '@/helpers/checklist/getRepeatEverySuffix';
import { getDaysMap } from '@/helpers/days/getDays';
import { formatTimeInDay, formatTime } from '@/helpers/time/formatTime';
import {
  COMPANY_ADMIN, FACTORY_ADMIN, LINEVIEW_USER, OFFICE_USER,
} from '@/constants/userRoles';
import { convertMinutesToDays } from '@/helpers/time/convertMinutesAndDays';


const formatToMinutes = (seconds) => formatSecondsFriendly(seconds, false, false, 'min');

export function getReasonTranslation(reasonName) {
  return reasonName === 'Uncommented' ? i18n.global.t('Uncommented') : reasonName;
}

export function getCommaSeparatedItems(items, count, emptyEqualsAll) {
  if (count === 0 && emptyEqualsAll) return i18n.global.t('All');
  if (count === 0) return '-';
  if (count > 10) return `${listToCommaSeparatedString(items.slice(0, 10).map((item) => item.name))} + ${count - 10} ${i18n.global.t('more')}`;
  return listToCommaSeparatedString(items.map((item) => item.name));
}

export function getBooleanString(val) {
  return val ? i18n.global.t('Yes') : i18n.global.t('No');
}

export function getOnOffString(val) {
  return val ? i18n.global.t('On') : i18n.global.t('Off');
}

export function getNoteRequiredDuration(item) {
  if (!item.noteRequired) return i18n.global.t('No');
  return formatSecondsFriendly(item.noteRequiredDuration, false);
}

export function getMaxAllowedDuration(val) {
  if (val === 0) return i18n.global.t('No');
  return formatSecondsFriendly(val, false);
}

export function getStopType(val) {
  return val ? i18n.global.t('Unplanned') : i18n.global.t('Planned');
}

export function getIdealCycleTime(item) {
  return `${formatNumber(item.runTime)} ${getRunTimeType(item.runTimeType, item.unitId)}`;
}

export function getDowntimeStartTime(item) {
  return `${formatNumber(item.cycleTimeCritical)} + ${formatNumber(item.cycleTimeGood)} ${i18n.global.t('sec')}`;
}

export function getAlternativeUnitValue(item) {
  const alternativeUnitId = item.alternativeUnitId || '';
  return `${formatNumber(item.unitConversion)} ${getUnitConversionType(item.unitConversionType, item.unitId, alternativeUnitId)}`.trimEnd();
}

export function isScrapUnitQtyVisible(stationId) {
  const configurationStore = useConfigurationStore();
  const productBasedScrapConf = configurationStore.configuration?.productBasedScrap;
  if (Array.isArray(productBasedScrapConf)) return productBasedScrapConf.includes(stationId);
  return productBasedScrapConf ?? false;
}

export function getCommonEntityItem(itemKey) {
  const entityItemsMap = {
    name: { key: i18n.global.t('Name') },
    groupName: { key: i18n.global.t('Group name') },
    group: { key: i18n.global.t('Group'), value: (val) => val.name },
    local: { key: i18n.global.t('Global group'), value: (val) => getBooleanString(!val) },
    factories: { key: i18n.global.t('Factories'), value: (val, item) => getCommaSeparatedItems(val, item.factoryCount), ignore: (val, item) => 'local' in item && !item.local },
    color: { key: i18n.global.t('Color'), value: (val, item) => getUserSelectableColorName(item.color) },
    tags: { key: i18n.global.t('Tags'), value: (val, item) => getCommaSeparatedItems(val, item.tagCount) },
    stations: { key: i18n.global.t('Stations'), value: (val, item) => getCommaSeparatedItems(val, item.stationCount) },
  };
  return entityItemsMap[itemKey] || {};
}

export function getChecklistFrequencyType(frequency) {
  return {
    key: i18n.global.t('Type'),
    value: frequency.type === checklistTypes.PERIODIC ? getPeriodicFrequenciesTranslation(frequency.subType) : getChecklistFrequencyTypeTranslation(frequency.type),
    persistent: true,
  };
}

export function getPeriodicFrequencyTypeDetails(frequency) {
  const profileStore = useProfileStore();
  const details = [];
  if (frequency.subType === periodicSubTypes.WEEKLY || frequency.subType === periodicSubTypes.MONTHLY) {
    details.push({ key: i18n.global.t('Repeat every'), value: `${frequency.repeatEvery} ${getRepeatEverySuffix(frequency)}`, persistent: true });
  }
  if (frequency.subType === periodicSubTypes.WEEKLY) {
    details.push({
      key: i18n.global.t('Days'),
      value: frequency.days.map((day) => getDaysMap(profileStore.language, profileStore.firstDayOfWeek)[day].text).join(', '),
      persistent: true,
    });
  }
  details.push({ key: i18n.global.t('Show at'), value: frequency.times.map((time) => formatTimeInDay(time)).join(', '), persistent: true });
  if (frequency.subType === periodicSubTypes.MONTHLY) {
    if (frequency.dayOfMonth) {
      details.push({ key: i18n.global.t('On a specific calendar day'), value: frequency.dayOfMonth, persistent: true });
    } else if (frequency.occurrence !== null && frequency.day) {
      const daysMap = getDaysMap(profileStore.language, profileStore.firstDayOfWeek);
      details.push({ key: i18n.global.t('On a specific weekday'), value: `${getMonthlyTriggerOccurrenceListMap()[frequency.occurrence].name} ${daysMap[frequency.day].text}`, persistent: true });
    }
  }
  return details;
}

export function getStopReasonFrequencyDetails(frequency) {
  const details = [
    { key: i18n.global.t('Stop reasons'), value: getCommaSeparatedItems(frequency.stops, frequency.stopCount, true), persistent: true },
  ];
  if (frequency.setpoint > 0) {
    details.push({ key: i18n.global.t('Lasts longer than'), value: formatToMinutes(frequency.setpoint), persistent: true });
  } else {
    details.push({ key: i18n.global.t('Stop reason'), value: i18n.global.t('Is added'), persistent: true });
  }
  details.push({ key: i18n.global.t('Machine locations'), value: getCommaSeparatedItems(frequency.positions, frequency.positionCount, true), persistent: true });
  return details;
}

export function getShiftFrequencyDetails(frequency) {
  const details = [];
  if (frequency.offsetFromStartSeconds !== null) {
    details.push({ key: i18n.global.t('After shift start'), value: formatToMinutes(frequency.offsetFromStartSeconds), persistent: true });
  }
  if (frequency.offsetFromEndSeconds !== null) {
    details.push({ key: i18n.global.t('Before shift end'), value: formatToMinutes(frequency.offsetFromEndSeconds), persistent: true });
  }
  return details;
}

function getChecklistChangeoverTimingDetail(frequency) {
  const key = frequency.leadTime > 0 ? i18n.global.t('Show before') : i18n.global.t('Show after');
  const value = frequency.leadTime > 0 ? frequency.leadTime : frequency.delayTime;
  return { key, value: formatToMinutes(value), persistent: true };
}

export function getChecklistFrequencyDetails(frequency, item) {
  const result = [getChecklistFrequencyType(frequency)];
  if (frequency.type === checklistTypes.CHANGEOVER) {
    result.push(getChecklistChangeoverTimingDetail(frequency));
    result.push({ key: i18n.global.t('Add interval'), value: frequency.intervalTime ? formatToMinutes(frequency.intervalTime) : i18n.global.t('No'), persistent: true });
  }
  if (frequency.type === checklistTypes.INTERVAL) {
    result.push({ key: i18n.global.t('Interval start time'), value: `${formatDate(item.startTime, 'long')} ${formatTime(item.startTime, 'short')}` });
    result.push({ key: i18n.global.t('Show every'), value: formatToMinutes(frequency.intervalTime), persistent: true });
  }
  if (frequency.type === checklistTypes.QUANTITY) {
    result.push({ key: i18n.global.t('Show every'), value: `${frequency.targetQty} ${i18n.global.t('units')}`, persistent: true });
  }
  if ([checklistTypes.INTERVAL, checklistTypes.CHANGEOVER, checklistTypes.QUANTITY].includes(frequency.type)) {
    result.push({ key: i18n.global.t('Reset at shift start'), value: getBooleanString(frequency.resetOnShiftStart), persistent: true });
  }
  if ([checklistTypes.INTERVAL, checklistTypes.QUANTITY].includes(frequency.type)) {
    result.push({ key: i18n.global.t('Reset at product changeover'), value: getBooleanString(frequency.resetOnChangeover), persistent: true });
  }
  if ([checklistTypes.INTERVAL, checklistTypes.CHANGEOVER].includes(frequency.type)) {
    result.push({ key: i18n.global.t('Pause timer during downtime'), value: getBooleanString(frequency.pauseDuringDowntime), persistent: true });
  }
  if (frequency.type === checklistTypes.STOPREASON) {
    result.push(...getStopReasonFrequencyDetails(frequency));
  }
  if (frequency.type === checklistTypes.PERIODIC) {
    result.push(...getPeriodicFrequencyTypeDetails(frequency));
  }
  if (frequency.type === checklistTypes.SHIFT) {
    result.push(...getShiftFrequencyDetails(frequency));
  }
  if (frequency.type !== checklistTypes.MANUAL) {
    result.push({ key: i18n.global.t('Allow manual activation'), value: getBooleanString(frequency.manualAllowed), persistent: true });
  }
  return result;
}

export function getTaskTypeString(task) {
  const map = getCheckTypesMap();
  if (task.type === checkTypes.SELECTION) {
    if (task.multipleSelection) return map[checkTypes.MULTI_SELECT].name;
    return map[checkTypes.SINGLE_SELECT].name;
  }
  return map[task.type].name;
}

export function getTaskProps(task) {
  return [
    { key: `${i18n.global.t('Task')} ${task.id}`, value: task.name, keyClass: 'font-weight-medium' },
    { key: i18n.global.t('Description'), value: task.description || '-' },
    { key: i18n.global.t('Type'), value: getTaskTypeString(task) },
    // MEASUREMENT OPTIONS
    { key: i18n.global.t('Unit'), value: task.unit, visible: task.type === checkTypes.MEASUREMENT },
    { key: i18n.global.t('Min'), value: String(task.minVal), visible: task.type === checkTypes.MEASUREMENT }, // parsed to string to keep 0
    { key: i18n.global.t('Max'), value: String(task.maxVal), visible: task.type === checkTypes.MEASUREMENT }, // parsed to string to keep 0
    { key: i18n.global.t('Message'), value: task.warningMessage || '-', visible: [checkTypes.MEASUREMENT, checkTypes.YES_NO].includes(task.type) },
    // SELECT OPTIONS
    { key: i18n.global.t('Options'), value: task.selectionOptions?.map((opt) => opt.value).join(', '), visible: task.type === checkTypes.SELECTION },
    // FOR ALL TYPES
    { key: i18n.global.t('Allow "not applicable" as an option'), value: getBooleanString(task.notApplicableEnabled) },
    { key: i18n.global.t('Allow adding images'), value: getBooleanString(task.attachmentsEnabled ?? false) },
    { key: i18n.global.t('Allow multiple sample entries'), value: getBooleanString(task.multipleSelection), visible: task.type === checkTypes.MEASUREMENT },
    { key: i18n.global.t('Required sample count'), value: task.requiredSampleCount || '-', visible: task.type === checkTypes.MEASUREMENT },
  ].filter((item) => item.visible !== false);
}

export function getLineviewRestriction(val, type) {
  if (!val) return i18n.global.t('No');
  if (type === DAYS) {
    return `${val} ${i18n.global.t('Days')}`;
  }
  return `${val} ${i18n.global.t('Shifts')}`;
}

export function getStationsWithRights(stations) {
  const stationsWithRights = stations.map((station) => {
    const stationName = station.name;
    const stationRights = station.writeAccess ? i18n.global.t('Read & Write') : i18n.global.t('Read-only');
    return `${stationName} (${stationRights})`;
  });
  return listToCommaSeparatedString(stationsWithRights.slice(0, 10)) + (stations.length > 10 ? ` + ${stations.length - 10} ${i18n.global.t('more')}` : '');
}

export function getUserRoles(val, item, compareVal) {
  if (isEqual(val, compareVal)) return null;
  const isMultiRole = val?.length > 1 || compareVal?.length > 1;
  return val.map((role) => ([
    {
      key: i18n.global.t('Role'), keyClass: 'font-weight-medium', value: i18n.global.t(role.name), persistent: isMultiRole,
    },
    {
      key: i18n.global.t('Factories'), keyClass: 'font-weight-medium', value: getCommaSeparatedItems(role.factories, role.factoryCount, true), persistent: isMultiRole,
    },
    {
      key: i18n.global.t('Stations'),
      keyClass: 'font-weight-medium',
      value: [LINEVIEW_USER, OFFICE_USER].includes(role.name) ? getStationsWithRights(role.stations) : getCommaSeparatedItems(role.stations, role.stationCount, true),
      persistent: isMultiRole,
    },
    {
      key: i18n.global.t('Time restriction for changing data'),
      keyClass: 'font-weight-medium',
      value: getLineviewRestriction(role.lineviewTimeRestrictionValue, role.lineviewTimeRestrictionType),
      hidden: [COMPANY_ADMIN, FACTORY_ADMIN].includes(role.name),
      persistent: isMultiRole,
    },
  ])).flat().filter(((row) => !row.hidden));
}

export default function getSettingsEntityConfig({ entityType }) {
  const featureStore = useFeatureStore();
  const factoryStore = useFactoryStore();
  const profileStore = useProfileStore();
  const entitiesConfigMap = {
    [entities.STOP_REASON]: {
      primaryName: { value: getReasonTranslation, ...getCommonEntityItem('name') },
      commentGroup: { ...getCommonEntityItem('group') },
      negative: { key: i18n.global.t('Stop type'), value: getStopType },
      stations: { ...getCommonEntityItem('stations') },
      tags: { ...getCommonEntityItem('tags') },
      includeInOee: { key: i18n.global.t('Include in OEE calculation'), value: getBooleanString },
      technical: { key: i18n.global.t('Include in technical availability'), value: getBooleanString },
      noteRequiredDuration: { key: i18n.global.t('Require extra note from operators'), value: (val, item) => getNoteRequiredDuration(item) },
      requirePosition: { key: i18n.global.t('Require location from operators'), value: getBooleanString },
      joiningAllowed: { key: i18n.global.t('Allow joining of multiple stops'), value: getBooleanString },
      maxDuration: { key: i18n.global.t('Maximum allowed duration'), value: getMaxAllowedDuration },
    },
    [entities.STOP_REASON_GROUP]: {
      primaryName: { value: getReasonTranslation, ...getCommonEntityItem('groupName') },
      color: { ...getCommonEntityItem('color') },
      tags: { ...getCommonEntityItem('tags') },
      local: { ...getCommonEntityItem('local') },
      factories: { ...getCommonEntityItem('factories') },
    },
    [entities.PRODUCT]: {
      name: { ...getCommonEntityItem('name') },
      productGroup: { ...getCommonEntityItem('group') },
      sku: { key: i18n.global.t('Product code'), ignore: (val, item) => val === item.name },
      unitId: { key: i18n.global.t('Primary unit'), ignore: (val, item) => !('name' in item) },
      alternativeUnitId: { key: i18n.global.t('Alternative unit'), ignore: (val, item) => (item.alternativeUnitId === null || !('name' in item)) },
      station: {
        key: i18n.global.t('Station'), value: (val) => val.name, persistent: true, ignore: (val, item) => !item.station,
      },
      runTime: { key: i18n.global.t('Ideal cycle time'), value: (val, item) => getIdealCycleTime(item) },
      cycleTimeCritical: { key: i18n.global.t('Downtime start time'), value: (val, item) => getDowntimeStartTime(item) },
      unitQty: { key: i18n.global.t('Number of units registered per one sensor signal'), value: (val) => formatNumber(val) },
      scrapUnitQty: {
        key: i18n.global.t('Number of scrap units registered per one sensor signal'),
        value: (val) => formatNumber(val),
        ignore: (val, item) => (item.station ? !isScrapUnitQtyVisible(item.station.id) : true),
      },
      unitConversion: { key: i18n.global.t('Alternative unit value'), value: (val, item) => getAlternativeUnitValue(item) },
      semiFinished: {
        key: i18n.global.t('Semi-finished'), value: getBooleanString, ignore: !featureStore.semiFinishedEnabled,
      },
    },
    [entities.PRODUCT_GROUP]: {
      name: { ...getCommonEntityItem('groupName') },
      local: { ...getCommonEntityItem('local') },
      factories: { ...getCommonEntityItem('factories') },
    },
    [entities.STATION]: {
      name: { ...getCommonEntityItem('name') },
      group: { ...getCommonEntityItem('group') },
      description: { key: i18n.global.t('Description') },
      notificationEmails: { key: i18n.global.t('Notification emails') },
      oeeGoalSad: { key: i18n.global.t('Mr Evocon unhappy %') },
      oeeGoalHappy: { key: i18n.global.t('Mr Evocon happy %') },
      productChangeComment: { key: i18n.global.t('Product changeover reason'), value: (val) => val?.name ?? null },
      emptyShiftComment: { key: i18n.global.t('Empty shift reason'), value: (val) => val?.name ?? null },
      defaultScrapReason: { key: i18n.global.t('Default scrap reason'), value: (val) => val?.name ?? null },
      deleteSlicesAllowed: { key: i18n.global.t('Allow deleting of production signals'), value: getBooleanString },
      requireOperator: { key: i18n.global.t('Require operator'), value: getBooleanString },
      extendStopReason: { key: i18n.global.t('Extend stop reason after shift change'), value: getBooleanString },
      showManualShift: { key: i18n.global.t('Allow managing of shifts'), value: getBooleanString },
      requireChangeoverNote: { key: i18n.global.t('Require note on changeovers'), value: getBooleanString },
      requireLotBatch: { key: i18n.global.t('Require Lot/Batch on changeovers'), value: getBooleanString },
      manualShiftName: { key: i18n.global.t('Extra shift name') },
    },
    [entities.STATION_GROUP]: {
      name: { ...getCommonEntityItem('groupName') },
      factory: { key: i18n.global.t('Factory'), value: (val) => val.name, ignore: !factoryStore.hasMultipleFactories },
    },
    [entities.CHECKLIST]: {
      name: { ...getCommonEntityItem('name') },
      group: { ...getCommonEntityItem('group') },
      factories: { ...getCommonEntityItem('factories') },
      stations: { ...getCommonEntityItem('stations') },
      products: {
        key: i18n.global.t('products'),
        value: (val, item) => getCommaSeparatedItems(val, item.productCount, true),
      },
      frequencyDetails: { key: i18n.global.t('Frequency'), value: (val, item) => getChecklistFrequencyDetails(val, item), isSubheader: true },
      description: { key: i18n.global.t('Description') },
      authenticationRequired: { key: i18n.global.t('Require authentication'), value: getOnOffString },
      active: { key: i18n.global.t('Status'), value: getOnOffString },
      tasks: {
        key: '',
        value: (val, item, compareVal) => (isEqual(val, compareVal) ? null : val.map((task) => ({ key: '', value: getTaskProps(task) }))),
      },
    },
    [entities.CHECKLIST_GROUP]: {
      name: { ...getCommonEntityItem('groupName') },
      color: { ...getCommonEntityItem('color') },
    },
    [entities.SCRAP_REASON]: {
      name: { ...getCommonEntityItem('name') },
      group: { ...getCommonEntityItem('group') },
      factories: { ...getCommonEntityItem('factories') },
      stations: { ...getCommonEntityItem('stations') },
      tags: { ...getCommonEntityItem('tags') },
      noteRequired: { key: i18n.global.t('Require extra note from operators'), value: getBooleanString },
      increaseTotalQty: {
        key: i18n.global.t('Add scrap and increase total quantity'),
        value: getBooleanString,
        ignore: () => !featureStore.increaseQtyWithScrapEnabled,
      },
    },
    [entities.SCRAP_REASON_GROUP]: {
      name: { ...getCommonEntityItem('groupName') },
      color: { ...getCommonEntityItem('color') },
      tags: { ...getCommonEntityItem('tags') },
      local: { ...getCommonEntityItem('local') },
      factories: { ...getCommonEntityItem('factories') },
    },
    [entities.USER]: {
      name: { key: i18n.global.t('Name') },
      username: { key: i18n.global.t('Username') },
      email: { key: i18n.global.t('Email') },
      roles: { key: '', value: getUserRoles },
      securityProfileName: { key: i18n.global.t('Security profile'), value: (val) => val || '-', ignore: () => !featureStore.securitySettingsEnabled },
    },
    [entities.SPEED_LOSS]: {
      primaryName: { ...getCommonEntityItem('name'), value: getReasonTranslation },
      group: { ...getCommonEntityItem('group') },
      stations: { ...getCommonEntityItem('stations') },
      tags: { ...getCommonEntityItem('tags') },
      requirePosition: { key: i18n.global.t('Require location from operators'), value: getBooleanString },
      noteRequired: { key: i18n.global.t('Require extra note from operators'), value: getBooleanString },
    },
    [entities.SPEED_LOSS_GROUP]: {
      primaryName: { ...getCommonEntityItem('groupName') },
      color: { ...getCommonEntityItem('color') },
      tags: { ...getCommonEntityItem('tags') },
      local: { ...getCommonEntityItem('local') },
      factories: { ...getCommonEntityItem('factories') },
    },
    [entities.POSITION]: {
      primaryName: { ...getCommonEntityItem('name') },
      stations: { ...getCommonEntityItem('stations') },
      comments: { key: i18n.global.t('Stop reasons'), value: (val, item) => (item.commentsEnabled ? getCommaSeparatedItems(val, item.commentCount, true) : '-') },
      performanceComments: {
        key: i18n.global.t('Speed loss reasons'),
        value: (val, item) => (item.performanceCommentsEnabled ? getCommaSeparatedItems(val, item.performanceCommentCount, true) : '-'),
      },
    },
    [entities.OPERATOR]: {
      firstName: { key: i18n.global.t('First name') },
      lastName: { key: i18n.global.t('Last name') },
      stations: { ...getCommonEntityItem('stations') },
      passcode: { key: i18n.global.t('Passcode'), value: getBooleanString },
      passcodeCreatedAt: { key: i18n.global.t('Passcode generated'), value: (val) => (val ? `${formatDate(val, 'long')} ${formatTime(val, 'long')}` : null), ignore: (val, item) => !item.passcode },
    },
    [entities.SHIFT]: {
      name: { ...getCommonEntityItem('name') },
      factory: { key: i18n.global.t('Factory'), value: (val) => val.name, ignore: !factoryStore.hasMultipleFactories },
      stations: { ...getCommonEntityItem('stations') },
      startTime: { key: i18n.global.t('Start time'), value: (val) => formatTimeInDay(val) },
      endTime: { key: i18n.global.t('End time'), value: (val) => formatTimeInDay(val) },
      autoCommentStartTime: {
        key: i18n.global.t('Start time'), value: (val) => formatTimeInDay(val), ignore: (val) => !val, persistent: true,
      },
      autoCommentEndTime: {
        key: i18n.global.t('End time'), value: (val) => formatTimeInDay(val), ignore: (val) => !val, persistent: true,
      },
      comment: {
        key: i18n.global.t('Stop reason'), value: (val) => val.name, ignore: (val, item) => !item.comment, persistent: true,
      },
      position: { key: i18n.global.t('Machine location'), value: (val) => val.name },
      days: { key: i18n.global.t('Days'), value: (val) => val.map((day) => getDaysMap(profileStore.language, profileStore.firstDayOfWeek)[day].text).join(', ') },
      enabled: { key: i18n.global.t('Status'), value: getOnOffString },
    },
    [entities.SECURITY]: {
      name: { ...getCommonEntityItem('name') },
      singleSignOnRequired: { key: 'SSO', value: getBooleanString },
      twoFactorAuthenticationRequired: { key: '2FA', value: getBooleanString },
      absoluteTimeoutMinutes: {
        key: i18n.global.t('Log out'),
        value: (val, item) => {
          if (!val) return i18n.global.t('No');
          const days = convertMinutesToDays(item.absoluteTimeoutMinutes);
          const dayTranslation = days === 1 ? i18n.global.t('Day') : i18n.global.t('daysGenitive');
          return `${days} ${dayTranslation}`;
        },
      },
      ipAddress: { key: i18n.global.t('Public IP address'), persistent: () => true, ignore: (val, item) => !item.ipAddress },
      description: { key: i18n.global.t('Description') },
      roles: { key: i18n.global.t('Roles'), value: (val) => val.map((role) => i18n.global.t(role)).join(', ') },
    },
  };
  return entitiesConfigMap[entityType];
}
