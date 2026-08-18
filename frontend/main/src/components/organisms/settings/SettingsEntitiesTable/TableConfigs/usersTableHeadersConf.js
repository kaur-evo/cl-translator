import { factoryHeader, rightArrowHeader } from '@/components/organisms/settings/SettingsEntitiesTable/TableConfigs/settingsTableHeaders';
import i18n from '@/services/i18n';
import useDeviceStore from '@/stores/device';

export const tableHeadersConf = (isSecuritySettingsAllowed) => {
  const headers = [
    {
      text: i18n.global.t('Name_Person'),
      value: 'fullName',
      textKey: 'fullName',
      style: useDeviceStore().isMobileView ? { maxWidth: '170px' } : { minWidth: '200px' },
      isFixed: true,
      isBold: true,
    },
    {
      text: i18n.global.t('Role'),
      textKey: 'userRoles',
      isBold: true,
    },
    {
      text: i18n.global.t('Username'),
      value: 'username',
      textKey: 'username',
    },
    {
      text: i18n.global.t('Email'),
      textKey: 'email',
    },
    {
      text: i18n.global.t('Default station'),
      textKey: 'defaultStation',
    },
    factoryHeader(true),
    {
      text: i18n.global.t('Stations'),
      textKey: 'stationNames',
    },
    rightArrowHeader,
  ];

  if (isSecuritySettingsAllowed) {
    headers.splice(headers.length - 1, 0, {
      text: i18n.global.t('Security profile'),
      textKey: 'securityProfile',
    });
  }

  return headers;
};
