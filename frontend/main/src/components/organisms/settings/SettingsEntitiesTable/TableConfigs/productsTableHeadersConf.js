import { mdiDragVertical } from '@mdi/js';

import i18n from '@/services/i18n';
import {
  factoryHeader, stationHeader, rightArrowHeader, groupHeader,
} from '@/components/organisms/settings/SettingsEntitiesTable/TableConfigs/settingsTableHeaders';
import useDeviceStore from '@/stores/device';

export function createTableHeadersConf(isListViewVisible, userHasGlobalGroupsIcon) {
  const headers = [
    {
      text: i18n.global.t('Product name'),
      value: 'name',
      textKey: 'name',
      style: useDeviceStore().isMobileView ? { maxWidth: '170px' } : { minWidth: '200px' },
      width: '400px',
      isFixed: true,
      isBold: true,
      prependIcon: (item, items) => (isListViewVisible || items.length === 1 ? '' : mdiDragVertical),
      prependIconClass: 'handle grabbable',
      sortable: isListViewVisible,
    },
    {
      text: i18n.global.t('Product code'),
      value: 'sku',
      textKey: 'sku',
      style: { 'min-width': '200px' },
      width: '200px',
      sortable: isListViewVisible,
      formatFn: (sku, product) => (!!sku && !product.skuGenerated ? sku : '-'),
    },
    factoryHeader(isListViewVisible, false),
    {
      ...groupHeader('product/productGroups', userHasGlobalGroupsIcon),
      isHidden: !isListViewVisible,
      sortable: isListViewVisible,
    },
    stationHeader(isListViewVisible),
    {
      text: i18n.global.t('Unit'),
      value: 'unitId',
      textKey: 'unitId',
      style: { 'min-width': '100px' },
      width: '100px',
      sortable: isListViewVisible,
    },
    {
      text: i18n.global.t('Alternative unit'),
      value: 'alternativeUnitId',
      textKey: 'alternativeUnitId',
      style: { 'min-width': '100px' },
      width: '100px',
      sortable: isListViewVisible,
    },
    rightArrowHeader,
  ];
  return headers;
}
