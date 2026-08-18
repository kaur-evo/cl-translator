import { mdiAccountHardHat, mdiMessageBadgeOutline, mdiPlayCircleOutline } from '@mdi/js';

import i18n from '@/services/i18n';
import {
  factoryFilter, searchFilter, stationFilter, commonAttr, statusFilter, wrapperAttr,
} from '@/constants/settingsFilterBarConfEntities';
import { getAlertTypesArray, getChannelTypesArray } from '@/constants/alerts';

export function createFilterConfiguration() {
  const filterConfiguration = new Map();
  filterConfiguration.set('search', searchFilter(i18n.global.t('Name')));
  filterConfiguration.set('factoryId', factoryFilter());
  filterConfiguration.set('stationId', stationFilter());
  filterConfiguration.set('operatorId', {
    component: 'selection-menu',
    attr: {
      ...commonAttr,
      itemText: 'name',
      itemValue: 'id',
      prependText: `${i18n.global.t('Operators')}:`,
      prependInnerIcon: mdiAccountHardHat,
    },
    wrapperAttr,
    removable: false,
    storeItemsGetterPath: 'operator/operatorsIncludeNotSpecified',
    defaultValue: [],
  });
  filterConfiguration.set('channelId', {
    component: 'selection-menu',
    attr: {
      ...commonAttr,
      itemText: 'name',
      itemValue: 'id',
      prependText: `${i18n.global.t('Channels')}:`,
      prependInnerIcon: mdiMessageBadgeOutline,
    },
    wrapperAttr,
    removable: false,
    items: getChannelTypesArray(),
    defaultValue: [],
  });
  filterConfiguration.set('type', {
    component: 'selection-menu',
    attr: {
      ...commonAttr,
      itemText: 'name',
      itemValue: 'id',
      prependText: `${i18n.global.t('Trigger')}:`,
      prependInnerIcon: mdiPlayCircleOutline,
    },
    wrapperAttr,
    removable: false,
    items: getAlertTypesArray(),
    defaultValue: [],
  });
  filterConfiguration.set('status', { ...statusFilter(), removable: true, label: i18n.global.t('Status') });
  return filterConfiguration;
}
