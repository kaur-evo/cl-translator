import { mdiDragVertical } from '@mdi/js';

import i18n from '@/services/i18n';
import { factoryHeader, rightArrowHeader, stationHeader } from '@/components/organisms/settings/SettingsEntitiesTable/TableConfigs/settingsTableHeaders';
import useDeviceStore from '@/stores/device';

export function createTableHeadersConf(isListView) {
  const headers = [
    {
      text: i18n.global.t('Machine locations'),
      value: 'name',
      textKey: 'name',
      style: useDeviceStore().isMobileView ? { maxWidth: '170px' } : { minWidth: '200px' },
      isFixed: true,
      isBold: true,
      sortable: isListView,
      prependIcon: (item, items) => (isListView || items.length === 1 ? '' : mdiDragVertical),
      prependIconClass: isListView ? '' : 'handle grabbable',
    },
    factoryHeader(isListView),
    { ...stationHeader(isListView), isHidden: !isListView },
    {
      text: i18n.global.t('Stop reasons'),
      textKey: 'stopReasonNames',
      style: { 'min-width': '400px' },
      sortable: isListView,
    },
    {
      text: i18n.global.t('Speed loss reasons'),
      textKey: 'performanceReasonNames',
      style: { 'min-width': '400px' },
      sortable: isListView,
    },
    rightArrowHeader,
  ];
  return headers;
}
