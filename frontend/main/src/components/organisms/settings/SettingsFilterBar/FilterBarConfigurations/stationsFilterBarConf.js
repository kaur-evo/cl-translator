import i18n from '@/services/i18n';
import {
  searchFilter, factoryFilter, groupFilter,
} from '@/constants/settingsFilterBarConfEntities';

export function createFilterConfiguration() {
  const filterConfiguration = new Map();
  filterConfiguration.set('search', searchFilter(i18n.global.t('Station name')));
  filterConfiguration.set('factoryId', factoryFilter());
  filterConfiguration.set('groupId', { ...groupFilter('station/stationGroupsWithAdminPermissions'), filterBy: [['factoryId', 'factoryId']] });
  return filterConfiguration;
}
