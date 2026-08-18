import i18n from '@/services/i18n';
import {
  rightArrowHeader, factoryHeader, stationHeader, formatListOfStrings, statusHeader, productHeader,
} from '@/components/organisms/settings/SettingsEntitiesTable/TableConfigs/settingsTableHeaders';

export function createTableHeadersConf() {
  const headers = [
    statusHeader(),
    {
      text: i18n.global.t('Name'),
      value: 'name',
      textKey: 'name',
      isFixed: true,
      isBold: true,
    },
    factoryHeader(true),
    stationHeader(true, true),
    productHeader(),
    {
      text: i18n.global.t('Operators'),
      textKey: 'operatorNamesArray',
      formatFn: (list) => formatListOfStrings(list, true),
    },
    {
      text: i18n.global.t('Shifts'),
      textKey: 'shiftTemplateNamesArray',
      formatFn: (list) => formatListOfStrings(list, true),
    },
    {
      text: i18n.global.t('Machine locations'),
      textKey: 'positionNamesArray',
      formatFn: (list) => formatListOfStrings(list, true),
    },
    {
      text: i18n.global.t('Trigger'),
      textKey: 'triggerName',
    },
    {
      text: i18n.global.t('Channels'),
      textKey: 'channels',
      formatFn: (channels) => formatListOfStrings(channels),
    },
    {
      text: i18n.global.t('Emails'),
      textKey: 'emailOutputString',
    },
    rightArrowHeader,
  ];
  return headers;
}
