import i18n from '@/services/i18n';
import { factoryHeader, groupHeader, rightArrowHeader } from '@/components/organisms/settings/SettingsEntitiesTable/TableConfigs/settingsTableHeaders';
import useDeviceStore from '@/stores/device';

export function createTableHeadersConf(showGroupsColumn) {
  const headers = [
    {
      text: i18n.global.t('Station name'),
      value: 'name',
      textKey: 'name',
      style: useDeviceStore().isMobileView ? { maxWidth: '170px' } : { minWidth: '200px' },
      isFixed: true,
      isBold: true,
      sortable: showGroupsColumn,
    },
    factoryHeader(showGroupsColumn),
    {
      text: i18n.global.t('Notification emails'),
      textKey: 'notificationEmails',
      sortable: showGroupsColumn,
      formatFn: (notificationEmails) => {
        if (!notificationEmails) return '-';
        return notificationEmails.replace(',', ', ');
      },
    },
    {
      text: i18n.global.t('Require operator'),
      textKey: 'requireOperator',
      sortable: showGroupsColumn,
      formatFn: (requireOperator) => {
        if (!requireOperator) return '-';
        return i18n.global.t('Yes');
      },
    },
    {
      text: i18n.global.t('Empty shift reason'),
      textKey: 'emptyShiftReason',
      sortable: showGroupsColumn,
    },
    {
      text: i18n.global.t('Unhappy OEE'),
      textKey: 'oeeGoalSad',
      sortable: showGroupsColumn,
      formatFn: (oeeGoalSad) => `${oeeGoalSad}%`,
    },
    {
      text: i18n.global.t('Happy OEE'),
      textKey: 'oeeGoalHappy',
      sortable: showGroupsColumn,
      formatFn: (oeeGoalHappy) => `${oeeGoalHappy}%`,
    },
    rightArrowHeader,
  ];

  if (showGroupsColumn) headers.splice(2, 0, groupHeader('station/stationGroups'));

  return headers;
}
