import i18n from '@/services/i18n';
import { searchFilter, statusFilter } from '@/constants/settingsFilterBarConfEntities';

export function createFilterConfiguration() {
  const filterConfiguration = new Map();
  filterConfiguration.set('search', searchFilter(i18n.global.t('Name')));
  filterConfiguration.set('status', statusFilter());
  return filterConfiguration;
}
