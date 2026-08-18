import { isEqual } from 'lodash';

import i18n from '@/services/i18n';
import { getChecklistAlertStatusTranslations } from '@/constants/checklistsConstants';
import { formatTimeInZone } from '@/helpers/time/formatTime';
import { formatDateInZone } from '@/helpers/date/formatDate';
import { formatNumber } from '@/helpers/numbers/formatNumber';
import { entities } from '@/constants/activityLogsConstants';

export function getReasonTranslation(reasonName) {
  return reasonName === 'Uncommented' ? i18n.global.t('Uncommented') : reasonName;
}

export function isNotApplicable(item) {
  return item.notApplicableEnabled && item.valueNotApplicable;
}

// eslint-disable-next-line sonarjs/cognitive-complexity
export function getChecklistItemValue(item) {
  if (isNotApplicable(item)) return 'N/A';
  const val = item.value;
  switch (item.type) {
    case 'YES_NO': {
      if (val === 'true') {
        return i18n.global.t('Yes');
      }
      if (val === 'false') {
        return i18n.global.t('No');
      }
      return '-';
    }
    case 'MEASUREMENT': {
      const parsedVal = JSON.parse(val);
      if (!val || parsedVal.length === 0) return '-';

      const formattedValues = typeof parsedVal === 'object' ? parsedVal.map((v) => formatNumber(v)).join('; ') : parsedVal;
      const range = `${formatNumber(item.minVal, { decimalPlaces: null })} - ${formatNumber(item.maxVal, { decimalPlaces: null })} ${item.unit}`;
      return `${formattedValues} ${item.unit} (${range})`;
    }
    case 'TEXT': {
      return val ?? '-';
    }
    case 'CHECK': {
      return val ? i18n.global.t('Done') : '-';
    }
    case 'SELECTION': {
      let parsedVal = val;
      if (typeof val === 'string') {
        parsedVal = JSON.parse(val);
      }
      return parsedVal?.length ? parsedVal.join(', ') : '-';
    }
    default: return '';
  }
}

export function getChecklistTaskResults(elements, compareElements) {
  return elements.reduce((acc, item) => {
    let { comment } = item;
    if (!comment && compareElements?.[item.id - 1]?.comment) comment = '-';
    const note = comment ? `${i18n.global.t('Extra note')}: ${comment}` : '';
    const imagesText = item.attachmentsEnabled ? `${i18n.global.t('Images')}: ${item.images || '-'}` : '';
    let value = getChecklistItemValue(item);
    if (note) value += `\n${note}`;
    if (imagesText) value += `\n${imagesText}`;
    acc.push({
      keyPrefix: `${item.id})`,
      prefixClass: 'font-weight-medium mr-1',
      key: item.name,
      value,
    });
    return acc;
  }, []);
}

export function formatWithUnit(val, unitId) {
  return `${val} ${unitId}`;
}

export function getFormattedTimeValue(val, zoneId) {
  return `${formatDateInZone(val, zoneId, 'long')} ${formatTimeInZone(val, zoneId, 'short')}`;
}

export default function getSVLogsEntityConfig({ eventType, userAction, zoneId }) {
  const checklistAlertStatusTranslations = getChecklistAlertStatusTranslations();
  const translationConfigMap = {
    [entities.DOWNTIME]: {
      reason: { key: i18n.global.t('Reason'), value: getReasonTranslation, persistent: true },
      startTime: {
        key: i18n.global.t('Start time'),
        value: (val) => getFormattedTimeValue(val, zoneId),
        persistent: true,
      },
      endTime: {
        key: i18n.global.t('End time'),
        value: (val) => getFormattedTimeValue(val, zoneId),
        persistent: true,
      },
      location: { key: i18n.global.t('Machine location') },
      extraNote: { key: i18n.global.t('Extra note') },
      isJoined: { key: i18n.global.t('Joined stop'), value: (val) => (val ? i18n.global.t('Yes') : i18n.global.t('No')) },
      count: { key: i18n.global.t('Stop count'), ignore: (val, item) => !item.isJoined },
    },
    [entities.CHECKLIST]: {
      name: { key: i18n.global.t('Checklist name'), persistent: true },
      status: {
        key: i18n.global.t('Status'),
        value: (val) => checklistAlertStatusTranslations?.[val] ?? val,
      },
      doneByEntityId: { key: i18n.global.t('Done by'), persistent: true, ignore: (val) => !val },
      elements: {
        key: i18n.global.t('Task results'),
        value: (val, item, compareval) => getChecklistTaskResults(val, compareval),
        ignore: (val, item) => userAction === 'First fill' && val.every((el) => el.value === null || (item.type === 'SELECTION' && JSON.parse(el.value)?.length === 0)),
      },
    },
    [entities.SIGNAL]: {
      quantity: { key: i18n.global.t('quantity'), value: (val, item) => formatWithUnit(val, item.unitId) },
      extraNote: { key: i18n.global.t('Extra note') },
    },
    [entities.BATCH]: {
      productName: { key: i18n.global.t('Product name') },
      productSku: { key: i18n.global.t('Product code'), ignore: (val, item) => val === item.productName },
      orderNumber: { key: i18n.global.t('Order') },
      plannedQty: { key: i18n.global.t('Target'), value: (val, item) => (val ? formatWithUnit(val, item.unitId) : '-') },
      quantityPerSignal: { key: i18n.global.t('Quantity per signal'), value: (val, item) => formatWithUnit(val, item.unitId) },
      lotCode: { key: i18n.global.t('LOT/Batch') },
      extraNote: { key: i18n.global.t('Extra note') },
      startTime: { // it has nothing to do with startTime, using this just to get route sync visible
        key: i18n.global.t('Product settings synced'),
        isSubheader: true,
        value: () => '',
        persistent: true,
        ignore: (val, item, prevItem) => !isEqual(item, prevItem),
      },
    },
    [entities.SCRAP]: {
      reason: { key: i18n.global.t('Reason'), value: getReasonTranslation, persistent: true },
      quantity: { key: i18n.global.t('quantity'), value: (val, item) => formatWithUnit(val, item.unitId) },
      extraNote: { key: i18n.global.t('Extra note') },
    },
    [entities.SHIFT]: {
      startTime: {
        key: i18n.global.t('Start time'),
        value: (val) => getFormattedTimeValue(val, zoneId),
      },
      endTime: {
        key: i18n.global.t('End time'),
        value: (val) => getFormattedTimeValue(val, zoneId),
      },
    },
    [entities.SPEED_LOSS]: {
      reason: { key: i18n.global.t('Reason'), value: getReasonTranslation, persistent: true },
      startTime: { key: i18n.global.t('Start time'), value: (val) => formatTimeInZone(val, zoneId, 'short'), persistent: true },
      endTime: { key: i18n.global.t('End time'), value: (val) => formatTimeInZone(val, zoneId, 'short'), persistent: true },
      position: { key: i18n.global.t('Machine location') },
      extraNote: { key: i18n.global.t('Extra note') },
    },
    [entities.OPERATOR]: {
      operators: { key: i18n.global.t('Operators'), value: (val) => (val ?? []).join(', '), persistent: true },
      startTime: { key: i18n.global.t('Start time'), value: (val) => formatTimeInZone(val, zoneId, 'short'), persistent: true },
      endTime: { key: i18n.global.t('End time'), value: (val) => formatTimeInZone(val, zoneId, 'short'), persistent: true },
    },
  };
  return translationConfigMap[eventType];
}
