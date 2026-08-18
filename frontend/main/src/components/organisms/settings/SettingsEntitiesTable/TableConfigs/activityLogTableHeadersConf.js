import { DateTime } from 'luxon';

import i18n from '@/services/i18n';
import { getRolesTranslationsMap } from '@/constants/userRoles';
import { entities } from '@/constants/activityLogsConstants';
import { getEntityString, getSVLogsEventString } from '@/helpers/activityLogs/activityLogsHelpers';
import { formatTime, formatTimeInZone } from '@/helpers/time/formatTime';
import { formatDate, formatDateInZone } from '@/helpers/date/formatDate';

export function formatLogsToString(logEntries) {
  if (logEntries.length === 0) return '-';

  const result = logEntries.flatMap((entry) => {
    const entriesToProcess = Array.isArray(entry) ? entry : [entry];

    return entriesToProcess.map(({ key, value, isSubheader }) => {
      let keyPrefix = '';
      if (key && isSubheader) keyPrefix = key;
      else if (key) keyPrefix = `${key}: `;

      const formattedValue = Array.isArray(value)
        ? formatLogsToString(value)
        : value;
      return `${keyPrefix}${formattedValue}`;
    });
  });

  return result.join(', ');
}

export const formatUserActions = (action, entry) => {
  if (action === 'Saved') {
    const { oldValues, newValues } = entry;
    if (oldValues.length === 0 && newValues.length > 0) return i18n.global.t('Added');
  }
  return i18n.global.t(action);
};

export function formatEntity(entity, item) {
  const hasStation = (val) => val?.some((arr) => arr?.some((row) => row.key === i18n.global.t('Station')));
  const hasComment = (val) => val?.some((arr) => arr?.some((row) => row.key === i18n.global.t('Stop reason')));
  if (entity.entityType === entities.PRODUCT && (hasStation(item.oldValues) || hasStation(item.newValues))) {
    return `${getEntityString(entity?.entityType)} (${i18n.global.t('connected station')})`;
  }
  if (entity.entityType === entities.SHIFT && (hasComment(item.oldValues) || hasComment(item.newValues))) {
    return `${getEntityString(entity?.entityType)} (${i18n.global.t('Downtime auto-commenting').toLowerCase()})`;
  }
  if (entity.entityType === entities.SECURITY) {
    return `${getEntityString(entity?.entityType)} (${i18n.global.t(entity.reference)})`;
  }
  return getEntityString(entity?.entityType);
}

export function createSVTableHeadersConf() {
  const roleTranslationsMap = getRolesTranslationsMap();
  const headers = [
    {
      text: i18n.global.t('User action time'),
      value: 'timestamp',
      textKey: 'timestamp',
      secondaryTextKey: 'timestamp',
      secondaryTextClass: 'text-body-small',
      isFixed: true,
      isBold: true,
      formatFn: (timestamp, entry) => formatDateInZone(timestamp, entry.station.zoneId, 'long'),
      secondaryFormatFn: (timestamp, entry) => `${formatTimeInZone(timestamp, entry.station.zoneId, 'long')} (${DateTime.local().setZone(entry.station.zoneId).toFormat('ZZ')})`,
      formatTooltipFn: (timestamp) => `${formatTimeInZone(timestamp, 'UTC', 'long')} UTC`,
      showTooltip: true,
      sortable: false,
    },
    {
      text: i18n.global.t('Event time'),
      textKey: 'eventTime',
      secondaryTextKey: 'eventTime',
      secondaryTextClass: 'text-body-small',
      formatFn: (eventTime, entry) => formatDateInZone(eventTime, entry.station.zoneId, 'long'),
      secondaryFormatFn: (eventTime, entry) => formatTimeInZone(eventTime, entry.station.zoneId, 'long'),
      sortable: false,
    },
    {
      text: i18n.global.t('Events'),
      textKey: 'event',
      formatFn: getSVLogsEventString,
      sortable: false,
    },
    {
      text: i18n.global.t('User actions'),
      textKey: 'userAction',
      formatFn: formatUserActions,
      sortable: false,
    },
    {
      slot: (col, isRowExpanded) => (isRowExpanded ? 'oldcolumn' : null),
      text: i18n.global.t('Old values'),
      textKey: 'oldValues',
      formatFn: formatLogsToString,
      style: { minWidth: '311px' },
      sortable: false,
    },
    {
      slot: (col, isRowExpanded) => (isRowExpanded ? 'newcolumn' : null),
      text: i18n.global.t('New values'),
      textKey: 'newValues',
      formatFn: formatLogsToString,
      style: { minWidth: '311px' },
      sortable: false,
    },
    {
      text: i18n.global.t('Users'),
      textKey: 'user',
      formatFn: (user) => user.name,
      secondaryTextKey: 'user',
      secondaryTextClass: 'text-body-small',
      secondaryFormatFn: (user) => user.username,
      sortable: false,
    },
    {
      text: i18n.global.t('Roles'),
      textKey: 'user',
      formatFn: (user) => user.roles.map((role) => roleTranslationsMap[role] ?? '').join(', '),
      sortable: false,
    },
    {
      text: i18n.global.t('Factory'),
      textKey: 'factory',
      formatFn: (factory) => factory?.name,
      secondaryTextKey: 'factory',
      secondaryTextClass: 'text-body-small',
      secondaryFormatFn: (factory) => `ID: ${factory?.id}`,
      sortable: false,
    },
    {
      text: i18n.global.t('station'),
      textKey: 'station',
      formatFn: (station) => station?.name,
      secondaryTextKey: 'station',
      secondaryTextClass: 'text-body-small',
      secondaryFormatFn: (station) => `ID: ${station?.id}`,
      sortable: false,
    },
    {
      text: i18n.global.t('Shifts'),
      textKey: 'shift',
      secondaryTextKey: 'shift',
      secondaryTextClass: 'text-body-small',
      formatFn: (shift) => shift.name,
      secondaryFormatFn: (shift) => `ID: ${shift.id}`,
      sortable: false,
    },
    {
      text: i18n.global.t('Operators'),
      textKey: 'operators',
      formatFn: (operators) => operators.join(', '),
      sortable: false,
    },
    {
      text: i18n.global.t('products'),
      textKey: 'product',
      formatFn: (product) => product.name,
      secondaryTextKey: 'product',
      secondaryTextClass: 'text-body-small white-space-pre',
      secondaryFormatFn: (product) => {
        const productCodeStr = `${i18n.global.t('Product code')}: ${product.sku}`;
        const productIdStr = `ID: ${product.id}`;
        return `${productCodeStr}\n${productIdStr}`;
      },
      sortable: false,
    },
    {
      filterable: false,
      sortable: false,
      additionalStyle: { float: 'right' },
      style: { width: '50px' },
      appendIconClass: 'cursor-pointer',
      isContentExpandColumn: true,
    },
    {
      filterable: false,
      sortable: false,
      additionalStyle: { float: 'right' },
      style: { width: '50px' },
      appendIconClass: 'cursor-pointer',
      hasOpenLinkBtn: true,
      id: 'openShiftLink',
    },
  ];
  return headers;
}

export function createSettingsLogsTableHeadersConf(selectedEntity) {
  const roleTranslationsMap = getRolesTranslationsMap();
  const headers = [
    {
      text: i18n.global.t('User action time'),
      value: 'timestamp',
      textKey: 'timestamp',
      secondaryTextKey: 'timestamp',
      secondaryTextClass: 'text-body-small',
      isFixed: true,
      isBold: true,
      formatFn: (timestamp) => formatDate(timestamp, 'long'),
      secondaryFormatFn: (timestamp) => `${formatTime(timestamp, 'long')} (${DateTime.local().toFormat('ZZ')})`,
      formatTooltipFn: (timestamp) => `${formatTimeInZone(timestamp, 'UTC', 'long')} UTC`,
      showTooltip: true,
      sortable: false,
    },
    {
      text: i18n.global.t('Objects'),
      textKey: 'entity',
      formatFn: formatEntity,
      sortable: false,
    },
    {
      text: i18n.global.t('Object ID'),
      textKey: 'entity',
      formatFn: (entity) => entity?.name,
      secondaryTextKey: 'entity',
      secondaryTextClass: (entity) => (entity?.entityType === entities.PRODUCT ? 'text-body-small white-space-pre-line' : 'text-body-small'),
      secondaryFormatFn: (entity) => {
        if (selectedEntity === entities.PRODUCT) {
          return `ID: ${entity?.id}\n${i18n.global.t('Product code')}: ${entity?.reference}`;
        }
        return `ID: ${entity?.id}`;
      },
      sortable: false,
    },
    {
      text: i18n.global.t('User actions'),
      textKey: 'userAction',
      formatFn: formatUserActions,
      sortable: false,
    },
    {
      slot: (col, isRowExpanded) => (isRowExpanded ? 'oldcolumn' : null),
      text: i18n.global.t('Old values'),
      textKey: 'oldValues',
      formatFn: formatLogsToString,
      style: { minWidth: '311px' },
      sortable: false,
    },
    {
      slot: (col, isRowExpanded) => (isRowExpanded ? 'newcolumn' : null),
      text: i18n.global.t('New values'),
      textKey: 'newValues',
      formatFn: formatLogsToString,
      style: { minWidth: '311px' },
      sortable: false,
    },
    {
      text: i18n.global.t('Users'),
      textKey: 'user',
      formatFn: (user) => user.name,
      secondaryTextKey: 'user',
      secondaryTextClass: 'text-body-small',
      secondaryFormatFn: (user) => user.username,
      sortable: false,
    },
    {
      text: i18n.global.t('Roles'),
      textKey: 'user',
      formatFn: (user) => user.roles?.map((role) => roleTranslationsMap[role] ?? '').join(', '),
      sortable: false,
    },
    {
      filterable: false,
      sortable: false,
      additionalStyle: { float: 'right' },
      style: { width: '50px' },
      appendIconClass: 'cursor-pointer',
      isContentExpandColumn: true,
    },
    {
      filterable: false,
      sortable: false,
      additionalStyle: { float: 'right' },
      style: { width: '50px' },
      appendIconClass: 'cursor-pointer',
      hasOpenLinkBtn: (entity) => (entity.userAction !== 'Deleted'),
      id: 'openEntityLink',
    },
  ];
  return headers;
}
