import { mdiShape } from '@mdi/js';

import i18n from '@/services/i18n';
import {
  commonAttr, searchFilter, factoryFilter, stationFilter, groupFilter, wrapperAttr,
} from '@/constants/settingsFilterBarConfEntities';

export function createFilterConfiguration(types) {
  const filterConfiguration = new Map();
  filterConfiguration.set('search', searchFilter(i18n.global.t('Stop reason')));
  filterConfiguration.set('factoryId', factoryFilter());
  filterConfiguration.set('stationId', stationFilter({ emptyEqualsAllSelected: false }));
  filterConfiguration.set('groupId', groupFilter('comment/commentGroupsWithAdminPermissions'));
  filterConfiguration.set('type', {
    component: 'selection-menu',
    attr: {
      ...commonAttr,
      itemText: 'name',
      itemValue: 'id',
      prependText: `${i18n.global.t('Type')}:`,
      prependInnerIcon: mdiShape,
    },
    wrapperAttr,
    items: types,
    removable: false,
    defaultValue: [],
  });
  return filterConfiguration;
}
