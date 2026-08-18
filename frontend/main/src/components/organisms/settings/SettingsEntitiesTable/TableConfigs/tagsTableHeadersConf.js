import i18n from '@/services/i18n';
import { getEnabledTagEntitiesMap } from '@/components/organisms/settings/SettingsTagEditForm/enabledTagEntities';
import useDeviceStore from '@/stores/device';

export function createTableHeadersConf() {
  const enabledTagEntities = getEnabledTagEntitiesMap();
  const headers = [
    {
      text: i18n.global.t('Name'),
      value: 'name',
      textKey: 'name',
      style: useDeviceStore().isMobileView ? { maxWidth: '170px' } : { minWidth: '400px' },
      isFixed: true,
      isBold: true,
      width: '400px',
    },
    {
      text: i18n.global.t('Alias'),
      value: 'alias',
      textKey: 'alias',
      style: { 'min-width': '200px' },
      width: '200px',
    },
    {
      text: i18n.global.t('Type'),
      value: 'entities',
      textKey: 'entities',
      formatFn: (entities) => entities.map((entity) => enabledTagEntities[entity]).join(', '),
    },
  ];
  return headers;
}
