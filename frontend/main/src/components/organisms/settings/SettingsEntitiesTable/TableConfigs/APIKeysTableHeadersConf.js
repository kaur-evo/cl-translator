import { statusHeader } from './settingsTableHeaders';

import i18n from '@/services/i18n';
import useDeviceStore from '@/stores/device';

export function createTableHeadersConf() {
  const headers = [
    statusHeader('enabled'),
    {
      text: i18n.global.t('Name'),
      value: 'name',
      textKey: 'name',
      style: useDeviceStore().isMobileView ? { maxWidth: '170px' } : { minWidth: '200px' },
      isFixed: true,
      isBold: true,
      notClickable: true,
    },
    {
      text: i18n.global.t('API key'),
      value: 'keyId',
      textKey: 'keyId',
      notClickable: true,
    },
    {
      text: i18n.global.t('Key rights'),
      value: 'userId',
      textKey: 'userId',
      formatFn: (value) => {
        if (!value) return i18n.global.t('Custom reports');
        return value;
      },
      notClickable: true,
    },
    {
      text: i18n.global.t('Last used'),
      valueKey: 'lastUsedAt',
      textKey: 'lastUsed',
      secondaryTextKey: 'formattedLastUsedAt',
      secondaryTextClass: 'text-body-small',
      notClickable: true,
    },
    {
      text: i18n.global.t('Created by'),
      value: 'authorName',
      textKey: 'authorName',
      notClickable: true,
    },
    {
      text: i18n.global.t('Created at'),
      valueKey: 'createdAt',
      textKey: 'created',
      secondaryTextKey: 'formattedCreatedAt',
      secondaryTextClass: 'text-body-small',
      notClickable: true,
    },
    {
      sortable: false,
      additionalStyle: { float: 'right' },
      notClickable: true,
      hasDeleteRowOption: true,
    },
  ];
  return headers;
}
