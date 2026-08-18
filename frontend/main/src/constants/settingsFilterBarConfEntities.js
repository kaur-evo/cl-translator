import {
  mdiMagnify, mdiDomain, mdiMonitor, mdiPower, mdiCloseCircle, mdiFormatListGroup,
} from '@mdi/js';

import i18n from '@/services/i18n';
import { ROLLING_7_DAYS } from '@/constants/predefinedTimePeriodNames';
import useDeviceStore from '@/stores/device';

export const commonAttr = {
  width: '300px',
};

export const wrapperAttr = {
  class: 'ma-1',
};

export const mobileWrapperAttr = {
  class: 'ma-1 full-width',
};

export function searchFilter(placeholder, options = {}) {
  const { isMobileView } = useDeviceStore();
  return {
    component: 'evocon-input-chip',
    attr: {
      placeholder,
      prependInnerIcon: mdiMagnify,
      appendInnerIcon: mdiCloseCircle,
      isDynamicChip: !isMobileView,
      isPlainInputChip: isMobileView,
      disabled: options.disabled || false,
    },
    wrapperAttr: isMobileView ? mobileWrapperAttr : wrapperAttr,
    updateOnInput: true,
    tooltipHidden: true,
    defaultValue: '',
    updateRequestStateOnInput: true,
    order: 1,
    isPersistent: true,
  };
}

export function factoryFilter(options = {}) {
  return {
    component: 'selection-menu',
    attr: {
      ...commonAttr,
      itemText: 'name',
      itemValue: 'id',
      prependText: `${i18n.global.t('Factories')}:`,
      prependInnerIcon: mdiDomain,
      emptyEqualsAllSelected: true,
      isSingleSelect: options.isSingleSelect ?? false,
      required: options.isSingleSelect ?? false,
      closeOnContentClick: false,
    },
    wrapperAttr,
    removable: false,
    storeItemsGetterPath: 'factory/factoriesWithWriteAccess',
    defaultValue: options.defaultValue ?? [],
    required: options.required ?? false,
    order: 2,
  };
}

export function stationFilter(_options = {}) {
  const defaults = {
    tertiaryTextStationsArray: [],
    tertiaryText: null,
    isSingleSelect: false,
    defaultValue: [],
    emptyEqualsAllSelected: true,
  };
  const options = { ...defaults, ..._options };
  return {
    component: 'selection-menu',
    attr: {
      ...commonAttr,
      itemText: 'name',
      itemTertiaryText: (station) => (options.tertiaryTextStationsArray?.includes(station.id) ? options.tertiaryText : ''),
      itemTertiaryTextClasses: 'text-right',
      itemTertiaryTextStyle: { 'white-space': 'normal', 'max-width': '72px' },
      itemValue: 'id',
      prependText: `${i18n.global.t('Stations')}:`,
      prependInnerIcon: mdiMonitor,
      isGrouped: true,
      isSingleSelect: options.isSingleSelect,
      required: options.isSingleSelect,
      emptyEqualsAllSelected: options.emptyEqualsAllSelected,
    },
    wrapperAttr,
    removable: false,
    storeItemsGetterPath: 'station/stationsWithAdminPermissions',
    storeItemGroupsGetterPath: 'station/stationGroupsWithAdminPermissions',
    defaultValue: options.defaultValue,
    filterBy: [['factoryId', 'factoryId']],
    order: 3,
  };
}

export function groupFilter(storeKey, filterByFactoryIds = true) {
  return {
    component: 'selection-menu',
    attr: {
      ...commonAttr,
      itemText: 'name',
      itemValue: 'id',
      prependText: `${i18n.global.t('Groups')}:`,
      prependInnerIcon: mdiFormatListGroup,
    },
    wrapperAttr,
    removable: false,
    storeItemsGetterPath: storeKey,
    filterBy: filterByFactoryIds ? [['factoryId', 'factoryIds']] : [],
    defaultValue: [],
    order: 4,
  };
}

export function statusFilter(options) {
  return {
    component: 'selection-menu',
    attr: {
      ...commonAttr,
      itemText: 'text',
      itemValue: 'value',
      prependText: `${i18n.global.t('Status')}:`,
      prependInnerIcon: mdiPower,
      hideSearch: true,
      hideSelectAll: true,
      disabled: options?.disabled || false,
    },
    wrapperAttr,
    items: [{ text: i18n.global.t('On'), value: true }, { text: i18n.global.t('Off'), value: false }],
    removable: false,
    defaultValue: [],
  };
}

export function dateRangeFilter({ periodsList, defaultValue, includeDateRangeParam = true }) {
  const { isMobileView } = useDeviceStore();
  return {
    component: 'date-range-filter',
    tooltipHidden: true,
    attr: {
      predefinedPeriods: periodsList,
      includeDateRangeParam,
    },
    wrapperAttr: isMobileView ? mobileWrapperAttr : wrapperAttr,
    defaultValue: defaultValue ?? ROLLING_7_DAYS,
    removable: false,
    order: -1,
    isPersistent: true,
  };
}
