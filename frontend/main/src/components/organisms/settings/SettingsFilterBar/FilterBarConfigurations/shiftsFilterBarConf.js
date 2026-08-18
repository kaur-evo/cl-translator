import { mdiCalendarBlank } from '@mdi/js';

import i18n from '@/services/i18n';
import {
  commonAttr, searchFilter, factoryFilter, stationFilter, statusFilter, wrapperAttr,
} from '@/constants/settingsFilterBarConfEntities';

export function createFilterConfiguration(days, defaultFactoryId, isTimelineView) {
  const filterConfiguration = new Map();
  filterConfiguration.set('search', searchFilter(i18n.global.t('Shift name'), { disabled: isTimelineView }));
  filterConfiguration.set('factoryId', factoryFilter({ isSingleSelect: true, defaultValue: [defaultFactoryId], required: true }));
  filterConfiguration.set('stationId', stationFilter());
  filterConfiguration.set('day', {
    component: 'selection-menu',
    attr: {
      ...commonAttr,
      itemText: 'text',
      itemValue: 'id',
      prependText: `${i18n.global.t('Days')}:`,
      prependInnerIcon: mdiCalendarBlank,
      disabled: isTimelineView,
    },
    wrapperAttr,
    items: days,
    removable: false,
    defaultValue: [],
  });
  filterConfiguration.set('status', statusFilter({ disabled: isTimelineView }));
  return filterConfiguration;
}
