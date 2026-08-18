import { mdiTimelineClockOutline, mdiCircleMultipleOutline, mdiDraw } from '@mdi/js';

import {
  commonAttr, searchFilter, factoryFilter, stationFilter, statusFilter, groupFilter, wrapperAttr,
} from '@/constants/settingsFilterBarConfEntities';
import i18n from '@/services/i18n';

export function createFilterConfiguration(frequencies, products) {
  const filterConfiguration = new Map();
  filterConfiguration.set('search', searchFilter(i18n.global.t('Checklist name')));
  filterConfiguration.set('factoryId', factoryFilter());
  filterConfiguration.set('stationId', stationFilter());
  filterConfiguration.set('groupId', groupFilter('checklistTemplate/checklistGroups', false));
  filterConfiguration.set('type', {
    component: 'selection-menu',
    attr: {
      ...commonAttr,
      itemText: 'name',
      itemValue: 'id',
      prependText: `${i18n.global.t('Frequency')}:`,
      prependInnerIcon: mdiTimelineClockOutline,
      iconClass: 'rotate270deg',
    },
    wrapperAttr,
    items: frequencies,
    removable: false,
    defaultValue: [],
  });
  filterConfiguration.set('productId', {
    component: 'selection-menu',
    attr: {
      ...commonAttr,
      itemText: 'name',
      itemValue: 'id',
      prependText: `${i18n.global.t('products')}:`,
      prependInnerIcon: mdiCircleMultipleOutline,
      isGrouped: true,
      itemSecondaryText: 'sku',
      searchBySecondaryText: true,
    },
    wrapperAttr,
    removable: false,
    items: products,
    storeItemGroupsGetterPath: 'product/productGroups',
    storeDispatchPaths: ['product/fetchProductGroups'],
    defaultValue: [],
    filterBy: [['factoryId', 'factoryIds'], ['stationId', 'stationIds']],
  });
  filterConfiguration.set('status', {
    ...statusFilter(),
    label: i18n.global.t('Status'),
    removable: true,
  });
  filterConfiguration.set('authentication', {
    component: 'selection-menu',
    attr: {
      ...commonAttr,
      itemText: 'text',
      itemValue: 'value',
      prependText: `${i18n.global.t('Authentication')}:`,
      prependInnerIcon: mdiDraw,
      hideSearch: true,
      hideSelectAll: true,
    },
    wrapperAttr,
    label: i18n.global.t('Authentication'),
    removable: true,
    items: [{ text: i18n.global.t('On'), value: true }, { text: i18n.global.t('Off'), value: false }],
    defaultValue: [],
  });
  return filterConfiguration;
}
