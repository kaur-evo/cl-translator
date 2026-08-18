import { mdiKey } from '@mdi/js';

import i18n from '@/services/i18n';
import {
  searchFilter, factoryFilter, stationFilter, commonAttr, wrapperAttr,
} from '@/constants/settingsFilterBarConfEntities';

export function createFilterConfiguration(stationsWithoutOperators, isPasscodeEnabled) {
  const filterConfiguration = new Map();
  const tertiaryText = i18n.global.t('No operators');
  filterConfiguration.set('search', searchFilter(i18n.global.t('Name')));
  filterConfiguration.set('factoryId', factoryFilter());
  filterConfiguration.set('stationId', stationFilter({
    tertiaryTextStationsArray: stationsWithoutOperators,
    tertiaryText,
  }));
  if (isPasscodeEnabled) {
    filterConfiguration.set('passcode', {
      component: 'selection-menu',
      attr: {
        ...commonAttr,
        itemText: 'text',
        itemValue: 'value',
        prependText: `${i18n.global.t('Passcode')}:`,
        prependInnerIcon: mdiKey,
        hideSearch: true,
        hideSelectAll: true,
      },
      wrapperAttr,
      removable: false,
      items: [{ text: i18n.global.t('Yes'), value: true }, { text: i18n.global.t('No'), value: false }],
      defaultValue: [],
    });
  }
  return filterConfiguration;
}
