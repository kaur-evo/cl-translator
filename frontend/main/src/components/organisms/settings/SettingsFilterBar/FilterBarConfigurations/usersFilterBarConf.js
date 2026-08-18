import { mdiClipboardAccount } from '@mdi/js';

import i18n from '@/services/i18n';
import {
  commonAttr, searchFilter, factoryFilter, stationFilter, wrapperAttr,
} from '@/constants/settingsFilterBarConfEntities';

export function createFilterConfiguration(roles) {
  const filterConfiguration = new Map();
  filterConfiguration.set('search', searchFilter(i18n.global.t('Name')));
  filterConfiguration.set('factoryId', factoryFilter());
  filterConfiguration.set('stationId', stationFilter());
  filterConfiguration.set('role', {
    component: 'selection-menu',
    attr: {
      ...commonAttr,
      prependText: `${i18n.global.t('Role')}:`,
      prependInnerIcon: mdiClipboardAccount,
      itemText: 'name',
      itemValue: 'id',
    },
    wrapperAttr,
    items: roles,
    removable: false,
    defaultValue: [],
  });
  return filterConfiguration;
}
