import {
  mdiCog,
  mdiHelpCircleOutline,
  mdiFormatListGroup,
  mdiCircleMultipleOutline,
  mdiMonitor,
  mdiPlaylistCheck,
  mdiMinusCircleOutline,
  mdiAccountGroup,
  mdiSpeedometerSlow,
  mdiDownloadNetworkOutline,
  mdiAccountHardHat,
  mdiCalendarClock,
  mdiTimelineAlertOutline,
  mdiDraw,
} from '@mdi/js';

import i18n from '@/services/i18n';
import {
  commonAttr, stationFilter, dateRangeFilter, wrapperAttr,
} from '@/constants/settingsFilterBarConfEntities';
import { TODAY, THIS_WEEK } from '@/constants/predefinedTimePeriodNames';
import {
  getCustom, getLastWeek, getThisWeek, getToday, getYesterday,
} from '@/constants/rollingPeriodRangeDefinitions';
import { entities } from '@/constants/activityLogsConstants';
import { getEntitiesList, getSVLogsEventsList, getSettingsUserActionsList, getSVUserActionsList } from '@/helpers/activityLogs/activityLogsHelpers';

export const getPeriodsList = (firstDayOfWeek) => [
  getToday({ weekStartsOn: firstDayOfWeek }),
  getYesterday({ weekStartsOn: firstDayOfWeek }),
  getThisWeek({ weekStartsOn: firstDayOfWeek }),
  getLastWeek({ weekStartsOn: firstDayOfWeek }),
  getCustom(),
];

const defaultHideableFilterConf = {
  component: 'selection-menu',
  attr: {
    ...commonAttr,
    itemText: 'name',
    itemValue: 'id',
    emptyEqualsAllSelected: true,
  },
  wrapperAttr,
  canBeHidden: true,
  defaultValue: [],
  order: 2,
};

export function createSVFilterConfiguration(firstDayOfWeek, defaultStationId, checklistsEnabled) {
  const filterConfiguration = new Map();
  filterConfiguration.set('period', dateRangeFilter({
    periodsList: getPeriodsList(firstDayOfWeek),
    defaultValue: TODAY,
    includeDateRangeParam: false,
  }));
  filterConfiguration.set(entities.STATION, stationFilter({ isSingleSelect: true, defaultValue: [defaultStationId] }));
  filterConfiguration.set('events', {
    component: 'selection-menu',
    attr: {
      ...commonAttr,
      itemText: 'name',
      itemValue: 'id',
      prependText: `${i18n.global.t('Events')}:`,
      prependInnerIcon: mdiTimelineAlertOutline,
    },
    wrapperAttr,
    items: getSVLogsEventsList(checklistsEnabled),
    removable: false,
    defaultValue: [],
    order: 4,
  });
  filterConfiguration.set('userActions', {
    component: 'selection-menu',
    attr: {
      ...commonAttr,
      itemText: 'name',
      itemValue: 'id',
      prependText: `${i18n.global.t('User actions')}:`,
      prependInnerIcon: mdiDraw,
      emptyEqualsAllSelected: true,
    },
    wrapperAttr,
    items: getSVUserActionsList(checklistsEnabled),
    removable: false,
    defaultValue: [],
    order: 5,
  });
  return filterConfiguration;
}

export function createSettingsFilterConfiguration(firstDayOfWeek, checklistsEnabled, securityEnabled) {
  const filterConfiguration = new Map();
  const entitiesList = getEntitiesList(checklistsEnabled, securityEnabled);
  const firstEntityId = entitiesList[0]?.id;
  filterConfiguration.set('period', dateRangeFilter({
    periodsList: getPeriodsList(firstDayOfWeek),
    defaultValue: THIS_WEEK,
    includeDateRangeParam: false,
  }));
  filterConfiguration.set('entity', {
    component: 'selection-menu',
    attr: {
      ...commonAttr,
      itemText: 'name',
      itemValue: 'id',
      prependText: `${i18n.global.t('Objects')}:`,
      prependInnerIcon: mdiCog,
      isSingleSelect: true,
      required: true,
    },
    wrapperAttr,
    items: entitiesList,
    defaultValue: [firstEntityId],
    order: 1,
  });
  filterConfiguration.set(entities.STOP_REASON, {
    ...defaultHideableFilterConf,
    attr: {
      ...defaultHideableFilterConf.attr,
      prependText: `${i18n.global.t('Stop reasons')}:`,
      prependInnerIcon: mdiHelpCircleOutline,
      isGrouped: true,
    },
    storeItemsGetterPath: 'comment/allComments',
    storeItemGroupsGetterPath: 'comment/commentGroupsInclDeleted',
    visibleFilterValues: { entity: entities.STOP_REASON },
  });
  filterConfiguration.set(entities.STOP_REASON_GROUP, {
    ...defaultHideableFilterConf,
    attr: {
      ...defaultHideableFilterConf.attr,
      prependText: `${i18n.global.t('Stop groups')}:`,
      prependInnerIcon: mdiFormatListGroup,
    },
    storeItemsGetterPath: 'comment/commentGroupsInclDeleted',
    visibleFilterValues: { entity: entities.STOP_REASON_GROUP },
  });
  filterConfiguration.set(entities.PRODUCT, {
    ...defaultHideableFilterConf,
    attr: {
      ...defaultHideableFilterConf.attr,
      prependText: `${i18n.global.t('products')}:`,
      prependInnerIcon: mdiCircleMultipleOutline,
      searchBySecondaryText: true,
      isGrouped: true,
    },
    backendFilteringConfig: { entity: 'products' },
    storeLoadingGetterPath: 'product/isLoading',
    storeDispatchPaths: ['product/fetchProductGroups'],
    storeItemGroupsGetterPath: 'product/productGroups',
    visibleFilterValues: { entity: entities.PRODUCT },

  });
  filterConfiguration.set(entities.PRODUCT_GROUP, {
    ...defaultHideableFilterConf,
    attr: {
      ...defaultHideableFilterConf.attr,
      prependText: `${i18n.global.t('Product groups')}:`,
      prependInnerIcon: mdiFormatListGroup,
    },
    backendFilteringConfig: { entity: 'productgroups' },
    storeLoadingGetterPath: 'product/isLoading',
    storeItemsGetterPath: 'product/productGroups',
    visibleFilterValues: { entity: entities.PRODUCT_GROUP },
  });
  filterConfiguration.set(entities.STATION, {
    ...defaultHideableFilterConf,
    attr: {
      ...defaultHideableFilterConf.attr,
      prependText: `${i18n.global.t('Stations')}:`,
      prependInnerIcon: mdiMonitor,
      isGrouped: true,
    },
    storeItemsGetterPath: 'station/stationsWithAdminPermissions',
    storeItemGroupsGetterPath: 'station/stationGroupsWithAdminPermissions',
    visibleFilterValues: { entity: entities.STATION },
  });
  filterConfiguration.set(entities.STATION_GROUP, {
    ...defaultHideableFilterConf,
    attr: {
      ...defaultHideableFilterConf.attr,
      prependText: `${i18n.global.t('Station groups')}:`,
      prependInnerIcon: mdiFormatListGroup,
    },
    storeItemsGetterPath: 'station/stationGroupsWithAdminPermissions',
    visibleFilterValues: { entity: entities.STATION_GROUP },
  });
  filterConfiguration.set(entities.CHECKLIST, {
    ...defaultHideableFilterConf,
    attr: {
      ...defaultHideableFilterConf.attr,
      prependText: `${i18n.global.t('Checklists')}:`,
      prependInnerIcon: mdiPlaylistCheck,
      isGrouped: true,
    },
    storeItemsGetterPath: 'checklistTemplate/checklistTemplates',
    storeItemGroupsGetterPath: 'checklistTemplate/checklistGroups',
    visibleFilterValues: { entity: entities.CHECKLIST },
  });
  filterConfiguration.set(entities.CHECKLIST_GROUP, {
    ...defaultHideableFilterConf,
    attr: {
      ...defaultHideableFilterConf.attr,
      prependText: `${i18n.global.t('Checklist groups')}:`,
      prependInnerIcon: mdiFormatListGroup,
    },
    storeItemsGetterPath: 'checklistTemplate/checklistGroups',
    visibleFilterValues: { entity: entities.CHECKLIST_GROUP },
  });
  filterConfiguration.set(entities.SCRAP_REASON, {
    ...defaultHideableFilterConf,
    attr: {
      ...defaultHideableFilterConf.attr,
      prependText: `${i18n.global.t('Scrap reasons')}:`,
      prependInnerIcon: mdiMinusCircleOutline,
      isGrouped: true,
    },
    storeItemsGetterPath: 'scrapReason/scrapReasons',
    storeItemGroupsGetterPath: 'scrapReason/scrapReasonGroups',
    visibleFilterValues: { entity: entities.SCRAP_REASON },
  });
  filterConfiguration.set(entities.SCRAP_REASON_GROUP, {
    ...defaultHideableFilterConf,
    attr: {
      ...defaultHideableFilterConf.attr,
      prependText: `${i18n.global.t('Scrap groups')}:`,
      prependInnerIcon: mdiFormatListGroup,
    },
    storeItemsGetterPath: 'scrapReason/scrapReasonGroups',
    visibleFilterValues: { entity: entities.SCRAP_REASON_GROUP },
  });
  filterConfiguration.set(entities.USER, {
    ...defaultHideableFilterConf,
    attr: {
      ...defaultHideableFilterConf.attr,
      prependText: `${i18n.global.t('Users')}:`,
      prependInnerIcon: mdiAccountGroup,
      itemText: 'name',
      itemValue: 'username',
    },
    storeItemsGetterPath: 'user/allUsers',
    visibleFilterValues: { entity: entities.USER },
  });
  filterConfiguration.set(entities.SPEED_LOSS, {
    ...defaultHideableFilterConf,
    attr: {
      ...defaultHideableFilterConf.attr,
      prependText: `${i18n.global.t('Speed loss reasons')}:`,
      prependInnerIcon: mdiSpeedometerSlow,
      isGrouped: true,
    },
    storeItemsGetterPath: 'perfComment/allPerfComments',
    storeItemGroupsGetterPath: 'perfComment/perfCommentGroups',
    visibleFilterValues: { entity: entities.SPEED_LOSS },
  });
  filterConfiguration.set(entities.SPEED_LOSS_GROUP, {
    ...defaultHideableFilterConf,
    attr: {
      ...defaultHideableFilterConf.attr,
      prependText: `${i18n.global.t('Speed loss groups')}:`,
      prependInnerIcon: mdiFormatListGroup,
    },
    storeItemsGetterPath: 'perfComment/perfCommentGroups',
    visibleFilterValues: { entity: entities.SPEED_LOSS_GROUP },
  });
  filterConfiguration.set(entities.POSITION, {
    ...defaultHideableFilterConf,
    attr: {
      ...defaultHideableFilterConf.attr,
      prependText: `${i18n.global.t('Machine locations')}:`,
      prependInnerIcon: mdiDownloadNetworkOutline,
    },
    storeItemsGetterPath: 'position/positions',
    visibleFilterValues: { entity: entities.POSITION },
  });
  filterConfiguration.set(entities.OPERATOR, {
    ...defaultHideableFilterConf,
    attr: {
      ...defaultHideableFilterConf.attr,
      prependText: `${i18n.global.t('Operators')}:`,
      prependInnerIcon: mdiAccountHardHat,
    },
    storeItemsGetterPath: 'operator/operators',
    visibleFilterValues: { entity: entities.OPERATOR },
  });
  filterConfiguration.set(entities.SHIFT, {
    ...defaultHideableFilterConf,
    attr: {
      ...defaultHideableFilterConf.attr,
      prependText: `${i18n.global.t('Shifts')}:`,
      prependInnerIcon: mdiCalendarClock,
    },
    storeItemsGetterPath: 'shiftTemplate/shiftTemplates',
    visibleFilterValues: { entity: entities.SHIFT },
  });
  filterConfiguration.set('userActions', {
    component: 'selection-menu',
    attr: {
      ...commonAttr,
      itemText: 'name',
      itemValue: 'id',
      prependText: `${i18n.global.t('User actions')}:`,
      prependInnerIcon: mdiDraw,
      emptyEqualsAllSelected: true,
    },
    wrapperAttr,
    items: getSettingsUserActionsList(),
    removable: false,
    defaultValue: [],
    order: 3,
  });
  return filterConfiguration;
}
