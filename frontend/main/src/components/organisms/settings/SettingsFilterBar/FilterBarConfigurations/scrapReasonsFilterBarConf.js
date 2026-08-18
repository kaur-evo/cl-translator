import i18n from '@/services/i18n';
import {
  searchFilter, factoryFilter, stationFilter, groupFilter,
} from '@/constants/settingsFilterBarConfEntities';

export function createFilterConfiguration() {
  const filterConfiguration = new Map();
  filterConfiguration.set('search', searchFilter(i18n.global.t('Scrap reason')));
  filterConfiguration.set('factoryId', factoryFilter());
  filterConfiguration.set('stationId', stationFilter({ emptyEqualsAllSelected: false }));
  filterConfiguration.set('groupId', groupFilter('scrapReason/scrapReasonGroupsWithAdminPermissions'));
  return filterConfiguration;
}
