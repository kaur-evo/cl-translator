import {
  mdiMagnify,
  mdiMonitor,
  mdiAccount,
  mdiCloseCircle,
} from '@mdi/js';
import {
  startOfWeek,
  endOfWeek,
  subWeeks,
  subMonths,
  subYears,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  format,
} from 'date-fns';

import {
  LAST_MONTH, THIS_YEAR, LAST_WEEK, LAST_YEAR,
} from '@/constants/predefinedTimePeriodNames';
import i18n from '@/services/i18n';
import useDeviceStore from '@/stores/device';

export const getPeriodsList = (firstDayOfWeek) => [
  {
    title: i18n.global.t('lastweek'),
    value: LAST_WEEK,
    range: [
      format(subWeeks(startOfWeek(new Date(), { weekStartsOn: firstDayOfWeek }), 1), 'yyyy-MM-dd'),
      format(subWeeks(endOfWeek(new Date(), { weekStartsOn: firstDayOfWeek }), 1), 'yyyy-MM-dd'),
    ],
  },
  {
    title: i18n.global.t('lastmonth'),
    value: LAST_MONTH,
    range: [
      format(startOfMonth(subMonths(new Date(), 1)), 'yyyy-MM-dd'),
      format(endOfMonth(subMonths(new Date(), 1)), 'yyyy-MM-dd'),
    ],
  },
  {
    title: i18n.global.t('thisyear'),
    value: THIS_YEAR,
    range: [
      format(startOfYear(new Date()), 'yyyy-MM-dd'),
      format(endOfYear(new Date()), 'yyyy-MM-dd'),
    ],
  },
  {
    title: i18n.global.t('lastyear'),
    value: LAST_YEAR,
    range: [
      format(subYears(startOfYear(new Date()), 1), 'yyyy-MM-dd'),
      format(subYears(endOfYear(new Date()), 1), 'yyyy-MM-dd'),
    ],
  },
  {
    title: i18n.global.t('All'),
    value: 'all',
    range: [],
  },
  {
    title: i18n.global.t('Custom'),
    value: 'custom',
    range: [],
  },
];

const commonConfig = {
  dense: true,
  width: '300px',
};

const wrapperAttr = { class: 'ma-1' };

export const defaultFilters = ['search', 'period', 'factoryId', 'stationId', 'userId'];
export function createFilterConfiguration(translations, firstDayOfWeek) {
  const deviceStore = useDeviceStore();
  const filterConfiguration = new Map();
  filterConfiguration.set('search', {
    component: 'evocon-input-chip',
    attr: {
      placeholder: `${translations.Search}`,
      prependInnerIcon: mdiMagnify,
      appendInnerIcon: mdiCloseCircle,
      isDynamicChip: !deviceStore.isMobileView,
      isPlainChip: deviceStore.isMobileView,
    },
    wrapperAttr,
    updateOnInput: true,
    tooltipHidden: true,
    defaultValue: '',
    isPersistent: true,
  });
  filterConfiguration.set('period', {
    component: 'date-range-filter',
    tooltipHidden: true,
    attr: {
      predefinedPeriods: getPeriodsList(firstDayOfWeek),
      includeDateRangeParam: true,
    },
    wrapperAttr,
    defaultValue: 'all',
    isPersistent: true,
  });
  filterConfiguration.set('factoryId', {
    component: 'selection-menu',
    attr: {
      ...commonConfig,
      itemText: 'name',
      itemValue: 'id',
      prependText: `${translations.Factories}:`,
      prependInnerIcon: mdiMonitor,
    },
    wrapperAttr,
    removable: false,
    storeItemsGetterPath: 'factory/factories',
    storeItemsMapGetterPath: 'factory/factoriesMap',
    defaultValue: [],
  });
  filterConfiguration.set('stationId', {
    component: 'selection-menu',
    attr: {
      ...commonConfig,
      itemText: 'name',
      itemValue: 'id',
      prependText: `${translations.Stations}:`,
      prependInnerIcon: mdiMonitor,
      isGrouped: true,
    },
    wrapperAttr,
    removable: false,
    storeItemsGetterPath: 'station/stations',
    storeItemsMapGetterPath: 'station/stationsMap',
    storeItemGroupsGetterPath: 'station/stationGroups',
    storeDispatchPaths: ['station/fetchStationGroups'],
    defaultValue: [],
  });
  filterConfiguration.set('userId', {
    component: 'selection-menu',
    attr: {
      ...commonConfig,
      itemText: 'fullName',
      itemValue: 'username',
      prependText: `${translations.Team}:`,
      prependInnerIcon: mdiAccount,
    },
    wrapperAttr,
    removable: false,
    storeItemsGetterPath: 'user/users',
    storeItemsMapGetterPath: 'user/usersMap',
    defaultValue: [],
  });
  return filterConfiguration;
}
