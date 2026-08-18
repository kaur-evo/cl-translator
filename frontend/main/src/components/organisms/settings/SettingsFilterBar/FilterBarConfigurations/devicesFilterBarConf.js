import i18n from '@/services/i18n';
import { searchFilter, factoryFilter, stationFilter } from '@/constants/settingsFilterBarConfEntities';

export function createFilterConfiguration() {
  const filterConfiguration = new Map();
  filterConfiguration.set('search', searchFilter(i18n.global.t('Serial number')));
  filterConfiguration.set('factoryId', factoryFilter());
  filterConfiguration.set('stationId', stationFilter());
  return filterConfiguration;
}
