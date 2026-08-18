import { mdiCircle, mdiDragVertical } from '@mdi/js';

import colorConstants from '@/constants/colorConstants';
import {
  factoryHeader, stationHeader, groupHeader, rightArrowHeader,
} from '@/components/organisms/settings/SettingsEntitiesTable/TableConfigs/settingsTableHeaders';
import i18n from '@/services/i18n';
import useDeviceStore from '@/stores/device';

export function createTableHeadersConf(showGroupsColumn, userHasGlobalGroupsIcon) {
  const headers = [
    {
      text: i18n.global.t('Stop reason'),
      value: 'name',
      textKey: 'name',
      style: useDeviceStore().isMobileView ? { maxWidth: '170px' } : { minWidth: '200px' },
      prependIcon: (item, items) => (showGroupsColumn || items.length === 1 ? '' : mdiDragVertical),
      prependIconClass: 'handle grabbable',
      isFixed: true,
      isBold: true,
      sortable: showGroupsColumn,
    },
    {
      text: i18n.global.t('Stop types'),
      textKey: 'typeName',
      valueKey: 'type',
      prependIcon: mdiCircle,
      prependIconSize: 9,
      sortable: showGroupsColumn,
      prependIconColor: (stoppage) => (stoppage.type === 'STOPPAGE' ? 'error' : colorConstants.light['secondary-dark']),
    },
    {
      text: i18n.global.t('OEE calculation'),
      value: 'includeInOee',
      textKey: 'includeInOee',
      sortable: showGroupsColumn,
    },
    factoryHeader(showGroupsColumn, false),
    showGroupsColumn ? groupHeader('comment/commentGroups', userHasGlobalGroupsIcon) : null,
    stationHeader(showGroupsColumn),
    rightArrowHeader,
  ];

  return headers.filter((el) => !!el);
}
