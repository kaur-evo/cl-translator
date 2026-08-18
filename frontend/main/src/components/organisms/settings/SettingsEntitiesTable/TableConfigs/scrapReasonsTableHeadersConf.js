import { mdiDragVertical } from '@mdi/js';

import {
  factoryHeader, stationHeader, groupHeader, rightArrowHeader,
} from '@/components/organisms/settings/SettingsEntitiesTable/TableConfigs/settingsTableHeaders';
import i18n from '@/services/i18n';
import useDeviceStore from '@/stores/device';

export function createTableHeadersConf(showGroupsColumn, userHasGlobalGroupsIcon) {
  const headers = [
    {
      text: i18n.global.t('Scrap reason'),
      value: 'name',
      textKey: 'name',
      style: useDeviceStore().isMobileView ? { maxWidth: '170px' } : { minWidth: '200px' },
      prependIcon: (item, items) => (showGroupsColumn || items.length === 1 ? '' : mdiDragVertical),
      prependIconClass: 'handle grabbable',
      isFixed: true,
      isBold: true,
      sortable: showGroupsColumn,
    },
    factoryHeader(showGroupsColumn, false),
    showGroupsColumn ? groupHeader('scrapReason/scrapReasonGroups', userHasGlobalGroupsIcon) : null,
    stationHeader(showGroupsColumn),
    rightArrowHeader,
  ];

  return headers.filter((el) => !!el);
}
