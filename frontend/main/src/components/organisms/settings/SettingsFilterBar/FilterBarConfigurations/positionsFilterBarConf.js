import { mdiHelpCircleOutline, mdiSpeedometerSlow } from '@mdi/js';

import i18n from '@/services/i18n';
import {
  searchFilter, factoryFilter, stationFilter, commonAttr, wrapperAttr,
} from '@/constants/settingsFilterBarConfEntities';

export function createFilterConfiguration() {
  const filterConfiguration = new Map();
  filterConfiguration.set('search', searchFilter(i18n.global.t('Name')));
  filterConfiguration.set('factoryId', factoryFilter());
  filterConfiguration.set('stationId', stationFilter());
  filterConfiguration.set('commentId', {
    component: 'selection-menu',
    attr: {
      ...commonAttr,
      itemText: 'name',
      itemValue: 'id',
      prependText: `${i18n.global.t('Stop reasons')}:`,
      prependInnerIcon: mdiHelpCircleOutline,
      isGrouped: true,
    },
    wrapperAttr,
    removable: false,
    storeItemsGetterPath: 'comment/comments',
    storeItemGroupsGetterPath: 'comment/commentGroups',
    defaultValue: [],
  });
  filterConfiguration.set('performanceCommentId', {
    component: 'selection-menu',
    attr: {
      ...commonAttr,
      itemText: 'name',
      itemValue: 'id',
      prependText: `${i18n.global.t('Speed loss reasons')}:`,
      prependInnerIcon: mdiSpeedometerSlow,
      isGrouped: true,
    },
    wrapperAttr,
    removable: false,
    storeItemsGetterPath: 'perfComment/perfComments',
    storeItemGroupsGetterPath: 'perfComment/perfCommentGroups',
    defaultValue: [],
  });
  return filterConfiguration;
}
