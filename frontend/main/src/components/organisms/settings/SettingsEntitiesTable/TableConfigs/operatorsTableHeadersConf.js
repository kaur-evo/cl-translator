import i18n from '@/services/i18n';
import { factoryHeader, stationHeader, rightArrowHeader } from '@/components/organisms/settings/SettingsEntitiesTable/TableConfigs/settingsTableHeaders';
import useDeviceStore from '@/stores/device';

export function createTableHeadersConf(showPasscode = false) {
  const headers = [
    {
      text: i18n.global.t('First name'),
      value: 'firstname',
      textKey: 'firstname',
      style: useDeviceStore().isMobileView ? { maxWidth: '170px' } : { minWidth: '200px' },
      isFixed: true,
      isBold: true,
    },
    {
      text: i18n.global.t('Last name'),
      value: 'lastname',
      textKey: 'lastname',
      style: { minWidth: '200px' },
      isBold: true,
    },
    factoryHeader(true),
    stationHeader(true),
    {
      text: i18n.global.t('Passcode'),
      value: 'passcodeCreatedAt',
      textKey: 'passcodeCreatedAt',
      isHidden: !showPasscode,
      formatFn: (passcodeCreatedAt) => (passcodeCreatedAt ? i18n.global.t('Yes') : i18n.global.t('No')),
    },
    rightArrowHeader,
  ];
  return headers;
}
