import {
  mdiDomain,
  mdiMonitor,
  mdiCalendarClock,
  mdiDownloadNetworkOutline,
  mdiSpeedometerSlow,
  mdiHelpCircleOutline,
  mdiCircleMultipleOutline,
  mdiAccountHardHat,
  mdiMinusCircleOutline,
  mdiPlaylistCheck,
  mdiProgressCheck,
  mdiFormatListGroup,
  mdiDraw,
} from '@mdi/js';
import { upperFirst } from 'lodash';

import REPORTS_EXTRA_QUERY_PARAMS from '@/stores/reportsConfig/configurations/extraQueryParamsList';
import queryParam from '@/stores/reportsConfig/constants/queryParam';
import valueNotPassingQueryParams from '@/stores/reportsConfig/configurations/valueNotPassingQueryParams';
import i18n from '@/services/i18n';
import configType from '@/stores/reportsConfig/constants/configType';
import routesApi from '@/api/routesApi';
import { useFilterbarStore } from '@/stores';

const groupOrder = 4;
const entityOrder = 5;

const commonAttr = {
  dense: true,
  menuYOffset: '10px',
  width: '300px',
};
const commonWrapperAttr = {
  class: 'ma-1',
};
const getHiddenFilterConfig = (field) => [field, {
  removable: false,
  hidden: true,
  defaultValue: '',
  isValuePassing: !valueNotPassingQueryParams.has(field),
}];
const hiddenFilters = REPORTS_EXTRA_QUERY_PARAMS.map(getHiddenFilterConfig);

const showDeletedLabel = (item) => (item.deleted ? i18n.global.t('Deleted') : '');

const convertValueToString = (value) => (value.map((val) => val.toString()));

export const getProductSecondaryText = (includeBatchData) => (entry) => {
  if (includeBatchData) {
    return [i18n.global.t('{count} batches', { count: entry.batchCount }), entry.sku].join(' | ');
  }
  return entry.sku;
};

/**
 * Callback executed BEFORE applyFilterState when product is selected.
 * Auto-selects the x-axis (groupBy) to match the product's runTimeType for the selected station.
 * This batches both changes into a single API request.
 *
 * @param {Object} params
 * @param {Object} params.item - The selected product item
 */
export function onProductionSpeedProductChangeBeforeApply({ item }) {
  const filterbarStore = useFilterbarStore();

  // Read from currentFilterState - this callback runs BEFORE applyFilterState commits
  const stationIds = filterbarStore.currentFilterState[queryParam.STATION_ID];

  // Only auto-select when exactly one station is selected
  if (!stationIds || stationIds.length !== 1) {
    return;
  }

  const stationId = stationIds[0];
  const runTimeType = item?.runTimeTypesByStationId?.[stationId];

  if (!runTimeType) {
    return;
  }

  // Skip update if groupBy already matches (avoid redundant updates)
  const currentGroupBy = filterbarStore.currentFilterState.groupBy;
  if (currentGroupBy?.[0] === runTimeType) {
    return;
  }

  // Update currentFilterState - will be committed with product change
  filterbarStore.updateFilterValue({ groupBy: [runTimeType] });
}

/**
 * Callback executed AFTER applyFilterState when station is selected.
 * Auto-selects the x-axis (groupBy) based on the product's route for the new station.
 */
export async function onProductionSpeedStationChange({ value: stationIds }) {
  if (stationIds.length !== 1) {
    return;
  }

  const filterbarStore = useFilterbarStore();
  // Read product IDs from requestFilterState (committed state used for API queries)
  const selectedProductIds = filterbarStore.requestFilterState[queryParam.PRODUCT_ID];

  if (!selectedProductIds?.length || selectedProductIds.length !== 1) {
    return;
  }

  const stationId = stationIds[0];
  const productId = selectedProductIds[0];

  try {
    const routes = await routesApi.getRoutes({
      stationId,
      productId,
    });

    // If no routes found, the product doesn't exist for this station - do nothing
    // User will see no data and can manually update filters
    if (routes.length === 0) {
      return;
    }

    if (routes.length === 1) {
      const route = routes[0];
      filterbarStore.updateFilterValue({ groupBy: [route.runTimeType] });
    }
  } catch (error) {
    // Log error but don't break filter flow - user can manually select x-axis
    console.error(`[FilterBarConfig] Failed to fetch routes for auto x-axis selection (stationId: ${stationId}, productId: ${productId}):`, error);
  }
}

const createCommentFilterConfig = ({ splitFilters, chartType }) => {
  const removable = ![configType.DOWNTIME, configType.TIME_USAGE].includes(chartType);
  return [
    [queryParam.COMMENT_GROUP_ID, {
      hidden: !splitFilters.has(queryParam.COMMENT_ID),
      component: 'selection-menu',
      wrapperAttr: { ...commonWrapperAttr },
      attr: {
        ...commonAttr,
        itemText: 'name',
        itemValue: 'id',
        prependText: `${i18n.global.t('Stop groups')}:`,
        prependInnerIcon: mdiFormatListGroup,
        isGrouped: false,
        groupsOrderBy: 'ordering',
        numericOrderBy: false,
        useCustomSorting: true,
        itemTertiaryText: showDeletedLabel,
      },
      label: i18n.global.t('Stop groups'),
      removable,
      storeItemsGetterPath: 'comment/menuCommentGroupsInclDeleted',
      backendFilteringConfig: {
        entity: 'commentgroups',
        dateRangeGetter: 'reportsConfig/orderedDateRange',
        filterBy: [
          [queryParam.STATION_ID, 'stationId'],
          [queryParam.FACTORY_ID, 'factoryId'],
        ],
      },
      defaultValue: [],
      filterBy: [
        [queryParam.STATION_ID, 'stationIds'],
        [queryParam.FACTORY_ID, 'factoryIds'],
      ],
      isValuePassing: !valueNotPassingQueryParams.has(queryParam.COMMENT_GROUP_ID),
      useSelectionInversion: false,
      order: removable ? null : groupOrder,
    }],
    [queryParam.COMMENT_ID, {
      component: 'selection-menu',
      relatedGroupFilter: queryParam.COMMENT_GROUP_ID,
      wrapperAttr: { ...commonWrapperAttr },
      attr: {
        ...commonAttr,
        itemText: 'name',
        itemValue: 'id',
        prependText: `${i18n.global.t('Stops')}:`,
        prependInnerIcon: mdiHelpCircleOutline,
        isGrouped: !splitFilters.has(queryParam.COMMENT_ID),
        groupsOrderBy: 'ordering',
        numericOrderBy: false,
        useCustomSorting: true,
        itemTertiaryText: showDeletedLabel,
      },
      label: i18n.global.t('Stops'),
      removable,
      storeItemGroupsGetterPath: 'comment/menuCommentGroupsInclDeleted',
      backendFilteringConfig: {
        entity: 'comments',
        dateRangeGetter: 'reportsConfig/orderedDateRange',
        filterBy: [
          [queryParam.COMMENT_GROUP_ID, 'groupId'],
          [queryParam.STATION_ID, 'stationId'],
          [queryParam.FACTORY_ID, 'factoryId'],
        ],
      },
      defaultValue: [],
      filterBy: [
        [queryParam.STATION_ID, 'stationIds'],
        [queryParam.FACTORY_ID, 'factoryIds'],
      ],
      isValuePassing: !valueNotPassingQueryParams.has(queryParam.COMMENT_ID),
      useSelectionInversion: true,
      order: removable ? null : entityOrder,
    }],
  ];
};

const createPerformanceCommentFilterConfig = ({ splitFilters, chartType }) => {
  const removable = configType.SPEEDLOSS !== chartType;
  return [
    [queryParam.PERFORMANCE_COMMENT_GROUP_ID, {
      hidden: !splitFilters.has(queryParam.PERFORMANCE_COMMENT_ID),
      component: 'selection-menu',
      wrapperAttr: { ...commonWrapperAttr },
      attr: {
        ...commonAttr,
        itemText: 'name',
        itemValue: 'id',
        prependText: `${i18n.global.t('Speed loss groups')}:`,
        prependInnerIcon: mdiFormatListGroup,
        isGrouped: false,
        groupsOrderBy: 'ordering',
        useCustomSorting: true,
        itemTertiaryText: showDeletedLabel,
      },
      label: i18n.global.t('Speed loss groups'),
      removable,
      storeItemsGetterPath: 'perfComment/menuPerfCommentGroups',
      storeLoadingGetterPath: 'perfComment/isLoading',
      backendFilteringConfig: {
        entity: 'performancelossgroups',
        dateRangeGetter: 'reportsConfig/orderedDateRange',
        filterBy: [
          [queryParam.STATION_ID, 'stationId'],
          [queryParam.FACTORY_ID, 'factoryId'],
        ],
      },
      defaultValue: [],
      filterBy: [
        [queryParam.STATION_ID, 'stationIds'],
        [queryParam.FACTORY_ID, 'factoryIds'],
      ],
      isValuePassing: !valueNotPassingQueryParams.has(queryParam.PERFORMANCE_COMMENT_GROUP_ID),
      useSelectionInversion: false,
      order: removable ? null : groupOrder,
    }],
    [queryParam.PERFORMANCE_COMMENT_ID, {
      relatedGroupFilter: queryParam.PERFORMANCE_COMMENT_GROUP_ID,
      component: 'selection-menu',
      wrapperAttr: { ...commonWrapperAttr },
      attr: {
        ...commonAttr,
        itemText: 'name',
        itemValue: 'id',
        prependText: `${i18n.global.t('Speed loss reasons')}:`,
        prependInnerIcon: mdiSpeedometerSlow,
        isGrouped: !splitFilters.has(queryParam.PERFORMANCE_COMMENT_ID),
        groupsOrderBy: 'ordering',
        useCustomSorting: true,
        itemTertiaryText: showDeletedLabel,
      },
      backendFilteringConfig: {
        entity: 'performancelosses',
        dateRangeGetter: 'reportsConfig/orderedDateRange',
        filterBy: [
          [queryParam.PERFORMANCE_COMMENT_GROUP_ID, 'groupId'],
          [queryParam.STATION_ID, 'stationId'],
          [queryParam.FACTORY_ID, 'factoryId'],
        ],
      },
      label: i18n.global.t('Speed loss reasons'),
      removable,
      storeItemGroupsGetterPath: 'perfComment/menuPerfCommentGroups',
      storeLoadingGetterPath: 'perfComment/isLoading',
      defaultValue: [],
      filterBy: [
        [queryParam.STATION_ID, 'stationIds'],
        [queryParam.FACTORY_ID, 'factoryIds'],
      ],
      isValuePassing: !valueNotPassingQueryParams.has(queryParam.PERFORMANCE_COMMENT_ID),
      useSelectionInversion: true,
      order: removable ? null : entityOrder,
    }],
    [queryParam.POSITION_ID, {
      component: 'selection-menu',
      wrapperAttr: { ...commonWrapperAttr },
      attr: {
        ...commonAttr,
        itemText: 'name',
        itemValue: 'id',
        itemTertiaryText: (item) => (item.deleted ? i18n.global.t('Deleted') : item.stationName ?? ''),
        prependText: `${i18n.global.t('Machine locations')}:`,
        prependInnerIcon: mdiDownloadNetworkOutline,
        useCustomSorting: true,
      },
      backendFilteringConfig: {
        entity: 'performancelosspositions',
        dateRangeGetter: 'reportsConfig/orderedDateRange',
        filterBy: [
          [queryParam.STATION_ID, 'stationId'],
          [queryParam.FACTORY_ID, 'factoryId'],
        ],
      },
      label: i18n.global.t('Machine locations'),
      removable: true,
      defaultValue: [],
      filterBy: [
        [queryParam.STATION_ID, 'stationIds'],
        [queryParam.FACTORY_ID, 'factoryIds'],
      ],
      isValuePassing: !valueNotPassingQueryParams.has(queryParam.POSITION_ID),
      useSelectionInversion: true,
    }],
  ];
};

const createScrapFilterConfig = ({ splitFilters, chartType }) => {
  const removable = configType.SCRAPREASON !== chartType;
  return [
    [queryParam.SCRAP_GROUP_ID, {
      hidden: !splitFilters.has(queryParam.SCRAP_ID),
      component: 'selection-menu',
      wrapperAttr: { ...commonWrapperAttr },
      attr: {
        ...commonAttr,
        itemText: 'name',
        itemValue: 'id',
        prependText: `${i18n.global.t('Scrap groups')}:`,
        prependInnerIcon: mdiFormatListGroup,
        isGrouped: false,
        groupsOrderBy: 'ordering',
        useCustomSorting: true,
        itemTertiaryText: showDeletedLabel,
      },
      label: i18n.global.t('Scrap groups'),
      removable,
      storeItemsGetterPath: 'scrapReason/scrapReasonGroupsInclUncommented',
      storeLoadingGetterPath: 'scrapReason/isLoading',
      backendFilteringConfig: {
        entity: 'scrapreasongroups',
        dateRangeGetter: 'reportsConfig/orderedDateRange',
        filterBy: [
          [queryParam.STATION_ID, 'stationId'],
          [queryParam.FACTORY_ID, 'factoryId'],
        ],
      },
      defaultValue: [],
      filterBy: [
        [queryParam.STATION_ID, 'stationIds'],
        [queryParam.FACTORY_ID, 'factoryIds'],
      ],
      isValuePassing: !valueNotPassingQueryParams.has(queryParam.SCRAP_GROUP_ID),
      useSelectionInversion: false,
      order: removable ? null : groupOrder,
    }],
    [queryParam.SCRAP_ID, {
      relatedGroupFilter: queryParam.SCRAP_GROUP_ID,
      component: 'selection-menu',
      wrapperAttr: { ...commonWrapperAttr },
      attr: {
        ...commonAttr,
        itemText: 'name',
        itemValue: 'id',
        prependText: `${i18n.global.t('Scrap reasons')}:`,
        prependInnerIcon: mdiMinusCircleOutline,
        isGrouped: !splitFilters.has(queryParam.SCRAP_ID),
        groupsOrderBy: 'ordering',
        useCustomSorting: true,
        itemTertiaryText: showDeletedLabel,
      },
      label: i18n.global.t('Scrap reasons'),
      removable,
      storeItemsGetterPath: 'scrapReason/scrapReasons',
      storeItemGroupsGetterPath: 'scrapReason/scrapReasonGroupsInclUncommented',
      storeLoadingGetterPath: 'scrapReason/isLoading',
      backendFilteringConfig: {
        entity: 'scrapreasons',
        dateRangeGetter: 'reportsConfig/orderedDateRange',
        filterBy: [
          [queryParam.SCRAP_GROUP_ID, 'groupId'],
          [queryParam.STATION_ID, 'stationId'],
          [queryParam.FACTORY_ID, 'factoryId'],
        ],
      },
      defaultValue: [],
      filterBy: [
        [queryParam.STATION_ID, 'stationIds'],
        [queryParam.FACTORY_ID, 'factoryIds'],
      ],
      isValuePassing: !valueNotPassingQueryParams.has(queryParam.SCRAP_ID),
      useSelectionInversion: true,
      order: removable ? null : entityOrder,
    }],
  ];
};

const createProductFilterConfig = ({ splitFilters }) => [
  [queryParam.PRODUCT_GROUP_ID, {
    hidden: !splitFilters.has(queryParam.PRODUCT_ID),
    component: 'selection-menu',
    wrapperAttr: { ...commonWrapperAttr },
    attr: {
      ...commonAttr,
      itemText: 'name',
      itemValue: 'id',
      prependText: `${i18n.global.t('Product groups')}:`,
      prependInnerIcon: mdiFormatListGroup,
      isGrouped: false,
      useCustomSorting: true,
    },
    label: i18n.global.t('Product groups'),
    removable: true,
    storeDispatchPaths: ['product/fetchProductGroups'],
    storeItemsGetterPath: 'product/productGroups',
    storeLoadingGetterPath: 'product/isLoading',
    backendFilteringConfig: {
      entity: 'productgroups',
      dateRangeGetter: 'reportsConfig/orderedDateRange',
      filterBy: [
        [queryParam.STATION_ID, 'stationId'],
        [queryParam.FACTORY_ID, 'factoryId'],
      ],
    },
    defaultValue: [],
    filterBy: [
      [queryParam.STATION_ID, 'stationIds'],
      [queryParam.FACTORY_ID, 'factoryIds'],
    ],
    isValuePassing: !valueNotPassingQueryParams.has(queryParam.PRODUCT_GROUP_ID),
    useSelectionInversion: false,
  }],
  [queryParam.PRODUCT_ID, {
    relatedGroupFilter: queryParam.PRODUCT_GROUP_ID,
    component: 'selection-menu',
    wrapperAttr: { ...commonWrapperAttr },
    attr: {
      ...commonAttr,
      itemText: 'name',
      itemSecondaryText: 'sku',
      searchBySecondaryText: true,
      itemValue: 'id',
      prependText: `${i18n.global.t('products')}:`,
      prependInnerIcon: mdiCircleMultipleOutline,
      useCustomSorting: true,
      isGrouped: !splitFilters.has(queryParam.PRODUCT_ID),
      itemTertiaryText: showDeletedLabel,
    },
    backendFilteringConfig: {
      entity: 'products',
      dateRangeGetter: 'reportsConfig/orderedDateRange',
      filterBy: [
        [queryParam.PRODUCT_GROUP_ID, 'groupId'],
        [queryParam.STATION_ID, 'stationId'],
        [queryParam.FACTORY_ID, 'factoryId'],
      ],
    },
    label: i18n.global.t('products'),
    removable: true,
    storeDispatchPaths: ['product/fetchProductGroups'],
    storeItemGroupsGetterPath: 'product/productGroups',
    storeLoadingGetterPath: 'product/isLoading',
    defaultValue: [],
    filterBy: [
      [queryParam.STATION_ID, 'stationIds'],
      [queryParam.FACTORY_ID, 'factoryIds'],
    ],
    isValuePassing: !valueNotPassingQueryParams.has(queryParam.PRODUCT_ID),
    useSelectionInversion: true,
  }],
];

const createLotCodeFilterConfig = () => [
  [queryParam.LOT_CODE, {
    component: 'selection-menu',
    wrapperAttr: { ...commonWrapperAttr },
    attr: {
      ...commonAttr,
      itemText: 'name',
      itemValue: 'id',
      prependText: `${i18n.global.t('LOT/Batch')}:`,
      prependInnerIcon: mdiCircleMultipleOutline,
      useCustomSorting: true,
      itemTertiaryText: showDeletedLabel,
    },
    backendFilteringConfig: {
      entity: 'lotcodes',
      dateRangeGetter: 'reportsConfig/orderedDateRange',
      filterBy: [
        [queryParam.STATION_ID, 'stationId'],
        [queryParam.FACTORY_ID, 'factoryId'],
      ],
    },
    label: i18n.global.t('LOT/Batch'),
    removable: true,
    defaultValue: [],
    filterBy: [
      [queryParam.STATION_ID, 'stationIds'],
      [queryParam.FACTORY_ID, 'factoryIds'],
    ],
    isValuePassing: !valueNotPassingQueryParams.has(queryParam.LOT_CODE),
    useSelectionInversion: true,
  }],
];

const createProductionOrderFilterConfig = () => [
  [queryParam.PRODUCTION_ORDER, {
    component: 'selection-menu',
    wrapperAttr: { ...commonWrapperAttr },
    attr: {
      ...commonAttr,
      itemText: 'name',
      itemValue: 'id',
      prependText: `${i18n.global.t('Orders')}:`,
      prependInnerIcon: mdiCircleMultipleOutline,
      useCustomSorting: true,
      itemTertiaryText: showDeletedLabel,
    },
    backendFilteringConfig: {
      entity: 'productionorders',
      dateRangeGetter: 'reportsConfig/orderedDateRange',
      filterBy: [
        [queryParam.STATION_ID, 'stationId'],
        [queryParam.FACTORY_ID, 'factoryId'],
      ],
    },
    label: i18n.global.t('Orders'),
    removable: true,
    defaultValue: [],
    filterBy: [
      [queryParam.STATION_ID, 'stationIds'],
      [queryParam.FACTORY_ID, 'factoryIds'],
    ],
    isValuePassing: !valueNotPassingQueryParams.has(queryParam.PRODUCTION_ORDER),
    useSelectionInversion: true,
  }],
];

const createCommonReportConfig = ({ splitFilters }) => [
  ...hiddenFilters,
  [queryParam.PERIOD, {
    component: 'date-range-filter',
    wrapperAttr: { ...commonWrapperAttr },
    tooltipHidden: true,
    attr: {
      onApplyAction: 'reportsConfig/onDateRangeSelectionApply',
      updateDateRangeAction: 'reportsConfig/setDateRange',
      selectPrevOrNextAction: 'filterbar/triggerDataRequest',
    },
    defaultValue: 'rolling7days',
    isValuePassing: !valueNotPassingQueryParams.has(queryParam.PERIOD),
    order: 1,
    isPersistent: true,
  }],
  [queryParam.FACTORY_ID, {
    component: 'selection-menu',
    wrapperAttr: { ...commonWrapperAttr },
    attr: {
      ...commonAttr,
      itemText: 'name',
      itemValue: 'id',
      prependText: `${i18n.global.t('Factories')}:`,
      prependInnerIcon: mdiDomain,
      useCustomSorting: true,
    },
    label: i18n.global.t('Factories'),
    removable: false,
    storeItemsGetterPath: 'factory/factories',
    defaultValue: [],
    isValuePassing: !valueNotPassingQueryParams.has(queryParam.FACTORY_ID),
    order: 2,
  }],
  [queryParam.STATION_ID, {
    component: 'selection-menu',
    wrapperAttr: { ...commonWrapperAttr },
    attr: {
      ...commonAttr,
      itemText: 'name',
      itemValue: 'id',
      prependText: `${i18n.global.t('Stations')}:`,
      prependInnerIcon: mdiMonitor,
      isGrouped: true,
      useCustomSorting: true,
    },
    label: i18n.global.t('Stations'),
    removable: false,
    storeItemsGetterPath: 'station/stations',
    storeItemGroupsGetterPath: 'station/stationGroups',
    storeDispatchPaths: ['station/fetchStationGroups'],
    defaultValue: [],
    filterBy: [
      [queryParam.FACTORY_ID, 'factoryId'],
    ],
    isValuePassing: !valueNotPassingQueryParams.has(queryParam.STATION_ID),
    order: 3,
  }],
  ...createProductFilterConfig({ splitFilters }),
  [queryParam.OPERATOR_ID, {
    component: 'selection-menu',
    wrapperAttr: { ...commonWrapperAttr },
    attr: {
      ...commonAttr,
      itemText: 'name',
      itemValue: 'id',
      prependText: `${i18n.global.t('Operators')}:`,
      prependInnerIcon: mdiAccountHardHat,
      useCustomSorting: true,
      itemTertiaryText: showDeletedLabel,
    },
    backendFilteringConfig: {
      entity: 'operators',
      dateRangeGetter: 'reportsConfig/orderedDateRange',
      filterBy: [
        [queryParam.STATION_ID, 'stationId'],
        [queryParam.FACTORY_ID, 'factoryId'],
      ],
    },
    label: i18n.global.t('Operators'),
    removable: true,
    defaultValue: [],
    filterBy: [
      [queryParam.STATION_ID, 'stationIds'],
      [queryParam.FACTORY_ID, 'factoryIds'],
    ],
    isValuePassing: !valueNotPassingQueryParams.has(queryParam.OPERATOR_ID),
    useSelectionInversion: true,
  }],
  [queryParam.SHIFT_NAME, {
    component: 'selection-menu',
    wrapperAttr: { ...commonWrapperAttr },
    attr: {
      ...commonAttr,
      itemText: 'name',
      itemValue: 'id',
      prependText: `${i18n.global.t('Shifts')}:`,
      prependInnerIcon: mdiCalendarClock,
      useCustomSorting: true,
      itemTertiaryText: showDeletedLabel,
    },
    backendFilteringConfig: {
      entity: 'shifttemplates',
      dateRangeGetter: 'reportsConfig/orderedDateRange',
      filterBy: [
        [queryParam.STATION_ID, 'stationId'],
        [queryParam.FACTORY_ID, 'factoryId'],
      ],
    },
    label: i18n.global.t('Shifts'),
    removable: true,
    defaultValue: [],
    filterBy: [
      [queryParam.STATION_ID, 'stationIds'],
      [queryParam.FACTORY_ID, 'factoryIds'],
    ],
    isValuePassing: !valueNotPassingQueryParams.has(queryParam.SHIFT_NAME),
    useSelectionInversion: true,
  }],
];

const createDowntimeReportConfig = ({ splitFilters }) => [
  ...createCommentFilterConfig({ splitFilters, chartType: configType.DOWNTIME }),
  [queryParam.STOP_TYPE, {
    component: 'selection-menu',
    wrapperAttr: { ...commonWrapperAttr },
    attr: {
      ...commonAttr,
      itemText: 'name',
      itemValue: 'id',
      prependText: `${i18n.global.t('Stop types')}:`,
      prependInnerIcon: mdiHelpCircleOutline,
      useCustomSorting: true,
      isGrouped: true,
    },
    label: i18n.global.t('Stop types'),
    removable: true,
    defaultValue: [],
    groups: [
      { id: 'unplanned', name: i18n.global.t('Unplanned') },
      { id: 'planned', name: i18n.global.t('Planned') },
    ],

    items: [
      { id: 'PLANNED_INCL_IN_OEE', name: upperFirst(i18n.global.t('incl. in OEE')), groupId: 'planned' },
      { id: 'PLANNED_EXCL_FROM_OEE', name: upperFirst(i18n.global.t('excl. from OEE')), groupId: 'planned' },
      { id: 'UNPLANNED_INCL_IN_TECHNICAL', name: i18n.global.t('Incl. in Technical Availability'), groupId: 'unplanned' },
      { id: 'UNPLANNED_EXCL_FROM_TECHNICAL', name: i18n.global.t('Excl. from Technical Availability'), groupId: 'unplanned' },
    ],
    isValuePassing: !valueNotPassingQueryParams.has(queryParam.STOP_TYPE),
  }],
  [queryParam.POSITION_ID, {
    component: 'selection-menu',
    wrapperAttr: { ...commonWrapperAttr },
    attr: {
      ...commonAttr,
      itemText: 'name',
      itemValue: 'id',
      itemTertiaryText: (item) => (item.deleted ? i18n.global.t('Deleted') : item.stationName ?? ''),
      prependText: `${i18n.global.t('Machine locations')}:`,
      prependInnerIcon: mdiDownloadNetworkOutline,
      useCustomSorting: true,
    },
    backendFilteringConfig: {
      entity: 'positions',
      dateRangeGetter: 'reportsConfig/orderedDateRange',
      filterBy: [
        [queryParam.STATION_ID, 'stationId'],
        [queryParam.FACTORY_ID, 'factoryId'],
      ],
    },
    label: i18n.global.t('Machine locations'),
    removable: true,
    defaultValue: [],
    filterBy: [
      [queryParam.STATION_ID, 'stationIds'],
      [queryParam.FACTORY_ID, 'factoryIds'],
    ],
    isValuePassing: !valueNotPassingQueryParams.has(queryParam.POSITION_ID),
    useSelectionInversion: true,
  }],
];

const createChecklistFilterConfig = ({ splitFilters, chartType }) => {
  const removable = configType.CHECKLIST !== chartType;
  return [
    [queryParam.CHECKLIST_GROUP_ID, {
      hidden: !splitFilters.has(queryParam.CHECKLIST_ID),
      component: 'selection-menu',
      wrapperAttr: { ...commonWrapperAttr },
      attr: {
        ...commonAttr,
        itemText: 'name',
        itemValue: 'id',
        prependText: `${i18n.global.t('Checklist groups')}:`,
        prependInnerIcon: mdiFormatListGroup,
        isGrouped: false,
        groupsOrderBy: 'ordering',
        numericOrderBy: false,
        useCustomSorting: true,
        itemTertiaryText: showDeletedLabel,
      },
      label: i18n.global.t('Checklist groups'),
      removable,
      storeItemsGetterPath: 'checklistTemplate/checklistGroups',
      backendFilteringConfig: {
        entity: 'checklistgroups',
        dateRangeGetter: 'reportsConfig/orderedDateRange',
        filterBy: [
          [queryParam.STATION_ID, 'stationId'],
          [queryParam.FACTORY_ID, 'factoryId'],
        ],
      },
      defaultValue: [],
      filterBy: [
        [queryParam.STATION_ID, 'stationIds'],
        [queryParam.FACTORY_ID, 'factoryIds'],
      ],
      isValuePassing: !valueNotPassingQueryParams.has(queryParam.CHECKLIST_GROUP_ID),
      useSelectionInversion: false,
      order: removable ? null : groupOrder,
    }],
    [queryParam.CHECKLIST_ID, {
      component: 'selection-menu',
      relatedGroupFilter: queryParam.CHECKLIST_GROUP_ID,
      wrapperAttr: { ...commonWrapperAttr },
      attr: {
        ...commonAttr,
        itemText: 'name',
        itemValue: 'id',
        prependText: `${i18n.global.t('Checklists')}:`,
        prependInnerIcon: mdiPlaylistCheck,
        isGrouped: !splitFilters.has(queryParam.CHECKLIST_ID),
        groupsOrderBy: 'ordering',
        numericOrderBy: false,
        useCustomSorting: true,
        itemTertiaryText: showDeletedLabel,
      },
      label: i18n.global.t('Checklists'),
      removable,
      storeItemGroupsGetterPath: 'checklistTemplate/checklistGroups',
      storeDispatchPaths: ['checklistTemplate/fetchChecklistGroups'],
      backendFilteringConfig: {
        entity: 'checklists',
        dateRangeGetter: 'reportsConfig/orderedDateRange',
        filterBy: [
          [queryParam.CHECKLIST_GROUP_ID, 'groupId'],
          [queryParam.STATION_ID, 'stationId'],
          [queryParam.FACTORY_ID, 'factoryId'],
        ],
      },
      defaultValue: [],
      filterBy: [
        [queryParam.STATION_ID, 'stationIds'],
        [queryParam.FACTORY_ID, 'factoryIds'],
      ],
      isValuePassing: !valueNotPassingQueryParams.has(queryParam.CHECKLIST_ID),
      useSelectionInversion: true,
      order: removable ? null : entityOrder,
    }],
    [queryParam.CHECKLIST_STATUS, {
      component: 'selection-menu',
      wrapperAttr: { ...commonWrapperAttr },
      attr: {
        ...commonAttr,
        itemText: 'name',
        itemValue: 'id',
        prependText: `${i18n.global.t('Checklist result')}:`,
        prependInnerIcon: mdiProgressCheck,
        useCustomSorting: true,
      },
      label: i18n.global.t('Checklist result'),
      removable: true,
      defaultValue: [],
      items: [
        { id: 1, name: i18n.global.t('Missed') },
        { id: 3, name: i18n.global.t('Unsuccessful') },
        { id: 2, name: i18n.global.t('Successful') },
      ],
      isValuePassing: !valueNotPassingQueryParams.has(queryParam.CHECKLIST_STATUS),
    }],
    [queryParam.CHECKLIST_DONE_BY_ENTITY_ID, {
      component: 'selection-menu',
      wrapperAttr: { ...commonWrapperAttr },
      attr: {
        ...commonAttr,
        itemText: 'name',
        itemValue: 'id',
        prependText: `${i18n.global.t('Done by')}:`,
        prependInnerIcon: mdiDraw,
        useCustomSorting: true,
        itemTertiaryText: showDeletedLabel,
      },
      backendFilteringConfig: {
        entity: 'checklistdonebys',
        dateRangeGetter: 'reportsConfig/orderedDateRange',
        filterBy: [
          [queryParam.STATION_ID, 'stationId'],
          [queryParam.FACTORY_ID, 'factoryId'],
        ],
        convertValueKey: 'id',
        convertValueFunc: convertValueToString,
      },
      label: i18n.global.t('Done by'),
      removable: true,
      defaultValue: [],
      filterBy: [
        [queryParam.STATION_ID, 'stationIds'],
        [queryParam.FACTORY_ID, 'factoryIds'],
      ],
      isValuePassing: !valueNotPassingQueryParams.has(queryParam.CHECKLIST_DONE_BY_ENTITY_ID),
      useSelectionInversion: true,
    }],
  ];
};

const createProductionSpeedConfig = () => [
  ...hiddenFilters,
  [queryParam.PERIOD, {
    component: 'date-range-filter',
    wrapperAttr: { ...commonWrapperAttr },
    tooltipHidden: true,
    attr: {
      onApplyAction: 'reportsConfig/onDateRangeSelectionApply',
      updateDateRangeAction: 'reportsConfig/setDateRange',
      selectPrevOrNextAction: 'reportsConfig/onPrevOrNextDateRangeApply',
    },
    defaultValue: [],
    isValuePassing: false,
    isPersistent: true,
    order: 1,
  }],
  [queryParam.FACTORY_ID, {
    component: 'selection-menu',
    wrapperAttr: { ...commonWrapperAttr },
    attr: {
      ...commonAttr,
      itemText: 'name',
      itemValue: 'id',
      prependText: `${i18n.global.t('Factory')}:`,
      prependInnerIcon: mdiDomain,
      hasActions: true,
      useCustomSorting: true,
      isSingleSelect: true,
      closeOnContentClick: false,
      required: true,
    },
    label: i18n.global.t('Factory'),
    removable: false,
    storeItemsGetterPath: 'factory/factories',
    defaultValue: [],
    isValuePassing: false,
    order: 2,
    useSelectionInversion: false,
  }],
  [queryParam.STATION_ID, {
    component: 'selection-menu',
    wrapperAttr: { ...commonWrapperAttr },
    attr: {
      ...commonAttr,
      itemText: 'name',
      itemValue: 'id',
      prependText: `${i18n.global.t('station')}:`,
      prependInnerIcon: mdiMonitor,
      hasActions: true,
      isGrouped: true,
      useCustomSorting: true,
      isSingleSelect: true,
      closeOnContentClick: false,
      required: true,
    },
    label: i18n.global.t('station'),
    removable: false,
    storeItemsGetterPath: 'station/stations',
    storeItemGroupsGetterPath: 'station/stationGroups',
    storeDispatchPaths: ['station/fetchStationGroups'],
    defaultValue: [],
    filterBy: [
      [queryParam.FACTORY_ID, 'factoryId'],
    ],
    filterByGetter: [
      ['reportsConfig/allowedFilterStationIds', 'id'],
    ],
    isValuePassing: false,
    order: 3,
    onValueChange: onProductionSpeedStationChange,
    useSelectionInversion: false,
  }],
  [queryParam.PRODUCT_ID, {
    relatedGroupFilter: queryParam.PRODUCT_GROUP_ID,
    component: 'selection-menu',
    wrapperAttr: { ...commonWrapperAttr },
    attr: {
      ...commonAttr,
      itemText: 'name',
      itemSecondaryText: getProductSecondaryText(true),
      searchBySecondaryText: true,
      itemValue: 'id',
      prependText: `${i18n.global.t('Product')}:`,
      prependInnerIcon: mdiCircleMultipleOutline,
      hasActions: true,
      useCustomSorting: true,
      isGrouped: true,
      itemTertiaryText: showDeletedLabel,
      isSingleSelect: true,
      closeOnContentClick: false,
      required: true,
    },
    backendFilteringConfig: {
      extraRequestParams: {
        includeBatchData: true,
        includeRouteData: true,
      },
      entity: 'products',
      dateRangeGetter: 'reportsConfig/orderedDateRange',
      filterBy: [
        [queryParam.PRODUCT_GROUP_ID, 'groupId'],
        [queryParam.STATION_ID, 'stationId'],
        [queryParam.FACTORY_ID, 'factoryId'],
      ],
    },
    label: i18n.global.t('Product'),
    removable: false,
    storeDispatchPaths: ['product/fetchProductGroups'],
    storeItemGroupsGetterPath: 'product/productGroups',
    storeLoadingGetterPath: 'product/isLoading',
    defaultValue: [],
    filterBy: [
      [queryParam.STATION_ID, 'stationIds'],
      [queryParam.FACTORY_ID, 'factoryIds'],
      [queryParam.PRODUCT_GROUP_ID, 'groupId'],
    ],
    isValuePassing: false,
    useSelectionInversion: false,
    onValueChangeBeforeApply: onProductionSpeedProductChangeBeforeApply,
  }],
  [queryParam.OPERATOR_ID, {
    component: 'selection-menu',
    wrapperAttr: { ...commonWrapperAttr },
    attr: {
      ...commonAttr,
      itemText: 'name',
      itemValue: 'id',
      prependText: `${i18n.global.t('Operators')}:`,
      prependInnerIcon: mdiAccountHardHat,
      hasActions: true,
      useCustomSorting: true,
      itemTertiaryText: showDeletedLabel,
    },
    backendFilteringConfig: {
      entity: 'operators',
      dateRangeGetter: 'reportsConfig/orderedDateRange',
      filterBy: [
        [queryParam.STATION_ID, 'stationId'],
        [queryParam.FACTORY_ID, 'factoryId'],
      ],
    },
    label: i18n.global.t('Operators'),
    removable: true,
    defaultValue: [],
    filterBy: [
      [queryParam.STATION_ID, 'stationIds'],
      [queryParam.FACTORY_ID, 'factoryIds'],
    ],
    isValuePassing: false,
    useSelectionInversion: true,
  }],
  [queryParam.SHIFT_NAME, {
    component: 'selection-menu',
    wrapperAttr: { ...commonWrapperAttr },
    attr: {
      ...commonAttr,
      itemText: 'name',
      itemValue: 'id',
      prependText: `${i18n.global.t('Shifts')}:`,
      prependInnerIcon: mdiCalendarClock,
      hasActions: true,
      useCustomSorting: true,
      itemTertiaryText: showDeletedLabel,
    },
    backendFilteringConfig: {
      entity: 'shifttemplates',
      dateRangeGetter: 'reportsConfig/orderedDateRange',
      filterBy: [
        [queryParam.STATION_ID, 'stationId'],
        [queryParam.FACTORY_ID, 'factoryId'],
      ],
    },
    label: i18n.global.t('Shifts'),
    removable: true,
    defaultValue: [],
    filterBy: [
      [queryParam.STATION_ID, 'stationIds'],
      [queryParam.FACTORY_ID, 'factoryIds'],
    ],
    isValuePassing: false,
    useSelectionInversion: true,
  }],
];

const createScrapReportConfig = ({ splitFilters }) => [
  ...createScrapFilterConfig({ splitFilters, chartType: configType.SCRAPREASON }),
];

const createSpeedlossReportConfig = ({ splitFilters }) => [
  ...createPerformanceCommentFilterConfig({ splitFilters, chartType: configType.SPEEDLOSS }),
];

const createOEEReportConfig = ({ splitFilters }) => [
  ...createCommentFilterConfig({ splitFilters, chartType: configType.OEE }),
  ...createPerformanceCommentFilterConfig({ splitFilters, chartType: configType.OEE }),
];

const createTimeUsageReportConfig = ({ splitFilters }) => [
  ...createCommentFilterConfig({ splitFilters, chartType: configType.TIME_USAGE }),
];

const createChecklistReportConfig = ({ splitFilters }) => [
  ...createChecklistFilterConfig({ splitFilters, chartType: configType.CHECKLIST }),
];

export const defaultFilters = [queryParam.STATION_ID, queryParam.COMMENT_ID, 'period'];
export function createFilterConfiguration({ splitFilters, disabledFilters = [] }) {
  return (type) => {
    const configMapBase = [];
    if (type === configType.DOWNTIME) {
      configMapBase.push(
        ...createCommonReportConfig({ splitFilters }),
        ...createLotCodeFilterConfig(),
        ...createProductionOrderFilterConfig(),
        ...createDowntimeReportConfig({ splitFilters }),
      );
    } else if (type === configType.SPEEDLOSS) {
      configMapBase.push(
        ...createCommonReportConfig({ splitFilters }),
        ...createLotCodeFilterConfig(),
        ...createProductionOrderFilterConfig(),
        ...createSpeedlossReportConfig({ splitFilters }),
      );
    } else if (type === configType.SCRAPREASON) {
      configMapBase.push(
        ...createCommonReportConfig({ splitFilters }),
        ...createLotCodeFilterConfig(),
        ...createProductionOrderFilterConfig(),
        ...createScrapReportConfig({ splitFilters }),
      );
    } else if (type === configType.OEE) {
      configMapBase.push(
        ...createCommonReportConfig({ splitFilters }),
        ...createLotCodeFilterConfig(),
        ...createProductionOrderFilterConfig(),
        ...createOEEReportConfig({ splitFilters }),
      );
    } else if (type === configType.QUANTITY) {
      configMapBase.push(
        ...createCommonReportConfig({ splitFilters }),
        ...createLotCodeFilterConfig(),
        ...createProductionOrderFilterConfig(),
      );
    } else if (type === configType.CHECKLIST) {
      configMapBase.push(
        ...createCommonReportConfig({ splitFilters }),
        ...createChecklistReportConfig({ splitFilters }),
      );
    } else if (type === configType.TIME_USAGE) {
      configMapBase.push(
        ...createCommonReportConfig({ splitFilters }),
        ...createLotCodeFilterConfig(),
        ...createProductionOrderFilterConfig(),
        ...createTimeUsageReportConfig({ splitFilters }),
      );
    } else if (type === configType.PRODUCTION_SPEED) {
      configMapBase.push(
        ...createProductionSpeedConfig(),
      );
    }
    const filterConfiguration = new Map(configMapBase);
    disabledFilters.forEach((filter) => {
      if (filterConfiguration.has(filter)) {
        filterConfiguration.delete(filter);
      }
    });
    return filterConfiguration;
  };
}

export const FILTER_ITEM_LIMIT = 1000;
