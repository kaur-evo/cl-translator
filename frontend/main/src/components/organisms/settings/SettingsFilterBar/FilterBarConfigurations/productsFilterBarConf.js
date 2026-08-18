import i18n from '@/services/i18n';
import {
  searchFilter, factoryFilter, stationFilter, groupFilter,
} from '@/constants/settingsFilterBarConfEntities';

export function createFilterConfiguration() {
  const filterConfiguration = new Map();
  filterConfiguration.set('search', searchFilter(`${i18n.global.t('Name')}/${i18n.global.t('Product code')}`));
  filterConfiguration.set('factoryId', factoryFilter());
  filterConfiguration.set('stationId', stationFilter());
  filterConfiguration.set('groupId', groupFilter('product/productGroupsWithAdminPermissions'));
  return filterConfiguration;
}
