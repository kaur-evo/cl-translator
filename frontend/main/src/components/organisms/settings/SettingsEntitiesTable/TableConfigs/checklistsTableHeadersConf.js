import i18n from '@/services/i18n';
import {
  factoryHeader, stationHeader, rightArrowHeader, groupHeader, statusHeader, productHeader,
} from '@/components/organisms/settings/SettingsEntitiesTable/TableConfigs/settingsTableHeaders';
import useDeviceStore from '@/stores/device';

export function createTableHeadersConf(hasGroupColumn) {
  const headers = [
    statusHeader(),
    {
      text: i18n.global.t('Checklist name'),
      value: 'name',
      textKey: 'name',
      isFixed: true,
      isBold: true,
      style: useDeviceStore().isMobileView ? { maxWidth: '170px' } : { minWidth: '200px' },
    },
    factoryHeader(true),
    stationHeader(true),
    {
      text: i18n.global.t('Frequency'),
      textKey: 'frequencyTableItem',
      valueKey: 'frequencyTableItem',
    },
    productHeader(),
    {
      text: i18n.global.t('Authentication'),
      value: 'authenticationRequired',
      textKey: 'authenticationRequired',
      formatFn: (authenticationRequired) => (authenticationRequired ? i18n.global.t('On') : i18n.global.t('Off')),
    },
    rightArrowHeader,
  ];

  if (hasGroupColumn) {
    headers.splice(2, 0, groupHeader('checklistTemplate/checklistGroups', false));
  }

  return headers;
}
