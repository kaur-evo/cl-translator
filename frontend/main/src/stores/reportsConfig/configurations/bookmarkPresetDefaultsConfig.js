import {
  mdiHelpCircleOutline,
  mdiSpeedometerSlow,
  mdiPercent,
  mdiCircleMultipleOutline,
  mdiPoll,
  mdiMinusCircleOutline,
  mdiPlaylistCheck,
  mdiTimerOutline,
} from '@mdi/js';

import UrlParams from '@/helpers/UrlParams';
import queryParam from '@/stores/reportsConfig/constants/queryParam';
import chartType from '@/stores/reportsConfig/constants/chartType';
import curveType from '@/stores/reportsConfig/constants/curveType';
import granularity from '@/stores/reportsConfig/constants/granularity';
import configType from '@/stores/reportsConfig/constants/configType';
import defaultVisibleColumns from '@/stores/reportsConfig/configurations/defaultVisibleColumns';
import timePeriod from '@/constants/predefinedTimePeriodNames';
import i18n from '@/services/i18n';
import getPaginationConfig from '@/stores/reportsConfig/configurations/paginationConfig';
import yAxisKey from '@/stores/reportsConfig/constants/yAxisKey';
import xAxisKey from '@/stores/reportsConfig/constants/xAxisKey';
import productionSpeedLegendType from '@/stores/reportsConfig/constants/productionSpeedLegendType';

export default function generateReportPresets({
  state,
  hasMultipleFactories,
  checklistStations,
  checklistsEnabled,
  productionSpeedReportEnabled,
} = {}) {
  const { bookmarkDefaults } = state;
  const downtimeDefaults = {
    [queryParam.PERIOD]: timePeriod.ROLLING_7_DAYS,
    [queryParam.BOOKMARK_ID]: configType.DOWNTIME,
    [queryParam.STATION_ID]: [],
    [queryParam.COMMENT_GROUP_ID]: [],
    [queryParam.COMMENT_ID]: [],
    [queryParam.NAME]: i18n.global.t('Downtime'),
    [queryParam.DESCRIPTION]: '',
    [queryParam.TYPE]: configType.DOWNTIME,
    [queryParam.GRANULARITY]: granularity.TOTAL,
    [queryParam.ORDER_BY]: 'value',
    [queryParam.ORDER_DIR]: 'desc',
    [queryParam.CHART_TYPE]: [chartType.STACKED_COLUMN, chartType.DATAPOINT_LABELS],
    [queryParam.CHART_CURVE]: curveType.MONOTONE_X,
    [queryParam.GROUP_BY]: [xAxisKey.ENTITY_ID],
    [queryParam.INVERTED_FILTERS]: [],
    [queryParam.ITEMS_PER_PAGE]: getPaginationConfig(configType.DOWNTIME).ITEMS_PER_PAGE_DEFAULT,
    [queryParam.PAGE]: getPaginationConfig(configType.DOWNTIME).PAGE_DEFAULT,
    [queryParam.Y_AXIS]: yAxisKey.VALUE,
    [queryParam.Y_AXIS_RIGHT]: '',
    [queryParam.VISIBLE_COLUMNS]: defaultVisibleColumns.DOWNTIME,
    [queryParam.CHART_LEGEND_STATE]: [],
  };
  const speedlossDefaults = {
    [queryParam.PERIOD]: timePeriod.ROLLING_7_DAYS,
    [queryParam.BOOKMARK_ID]: configType.SPEEDLOSS,
    [queryParam.STATION_ID]: [],
    [queryParam.PERFORMANCE_COMMENT_GROUP_ID]: [],
    [queryParam.PERFORMANCE_COMMENT_ID]: [],
    [queryParam.NAME]: i18n.global.t('Speed loss'),
    [queryParam.DESCRIPTION]: '',
    [queryParam.TYPE]: configType.SPEEDLOSS,
    [queryParam.GRANULARITY]: granularity.TOTAL,
    [queryParam.ORDER_BY]: 'value',
    [queryParam.ORDER_DIR]: 'desc',
    [queryParam.CHART_TYPE]: [chartType.STACKED_COLUMN, chartType.DATAPOINT_LABELS],
    [queryParam.CHART_CURVE]: curveType.MONOTONE_X,
    [queryParam.GROUP_BY]: [xAxisKey.ENTITY_ID],
    [queryParam.INVERTED_FILTERS]: [],
    [queryParam.ITEMS_PER_PAGE]: getPaginationConfig(configType.SPEEDLOSS).ITEMS_PER_PAGE_DEFAULT,
    [queryParam.PAGE]: getPaginationConfig(configType.SPEEDLOSS).PAGE_DEFAULT,
    [queryParam.Y_AXIS]: yAxisKey.VALUE,
    [queryParam.Y_AXIS_RIGHT]: '',
    [queryParam.VISIBLE_COLUMNS]: defaultVisibleColumns.SPEEDLOSS,
    [queryParam.CHART_LEGEND_STATE]: [],
  };
  const scrapDefaults = {
    [queryParam.PERIOD]: timePeriod.ROLLING_7_DAYS,
    [queryParam.BOOKMARK_ID]: configType.SCRAPREASON,
    [queryParam.STATION_ID]: [],
    [queryParam.SCRAP_GROUP_ID]: [],
    [queryParam.SCRAP_ID]: [],
    [queryParam.NAME]: i18n.global.t('Scrap reason'),
    [queryParam.DESCRIPTION]: '',
    [queryParam.TYPE]: configType.SCRAPREASON,
    [queryParam.GRANULARITY]: granularity.TOTAL,
    [queryParam.ORDER_BY]: 'entityCount',
    [queryParam.ORDER_DIR]: 'desc',
    [queryParam.CHART_TYPE]: [chartType.STACKED_COLUMN, chartType.DATAPOINT_LABELS],
    [queryParam.CHART_CURVE]: curveType.MONOTONE_X,
    [queryParam.GROUP_BY]: [xAxisKey.ENTITY_ID],
    [queryParam.INVERTED_FILTERS]: [],
    [queryParam.ITEMS_PER_PAGE]: getPaginationConfig(configType.SCRAPREASON).ITEMS_PER_PAGE_DEFAULT,
    [queryParam.PAGE]: getPaginationConfig(configType.SCRAPREASON).PAGE_DEFAULT,
    [queryParam.Y_AXIS]: yAxisKey.ENTITY_COUNT,
    [queryParam.Y_AXIS_RIGHT]: '',
    [queryParam.VISIBLE_COLUMNS]: defaultVisibleColumns.SCRAP,
    [queryParam.CHART_LEGEND_STATE]: [],
  };
  const oeeDefaults = {
    [queryParam.PERIOD]: timePeriod.ROLLING_7_DAYS,
    [queryParam.BOOKMARK_ID]: configType.OEE,
    [queryParam.STATION_ID]: [],
    [queryParam.NAME]: i18n.global.t('OEE'),
    [queryParam.DESCRIPTION]: '',
    [queryParam.TYPE]: configType.OEE,
    [queryParam.GRANULARITY]: granularity.DATE,
    [queryParam.ORDER_BY]: 'xScaleValue',
    [queryParam.ORDER_DIR]: 'asc',
    [queryParam.CHART_TYPE]: [chartType.LINE, chartType.DOT_PLOT],
    [queryParam.CHART_CURVE]: curveType.MONOTONE_X,
    [queryParam.GROUP_BY]: [xAxisKey.STATION_ID],
    [queryParam.INVERTED_FILTERS]: [],
    [queryParam.ITEMS_PER_PAGE]: getPaginationConfig(configType.OEE).ITEMS_PER_PAGE_DEFAULT,
    [queryParam.PAGE]: getPaginationConfig(configType.OEE).PAGE_DEFAULT,
    [queryParam.Y_AXIS]: yAxisKey.VALUE,
    [queryParam.Y_AXIS_RIGHT]: '',
    [queryParam.VISIBLE_COLUMNS]: defaultVisibleColumns.OEE,
    [queryParam.CHART_LEGEND_STATE]: ['performance', 'quality', 'oee', 'availability'],
  };
  const quantityDefaults = {
    [queryParam.PERIOD]: timePeriod.ROLLING_7_DAYS,
    [queryParam.BOOKMARK_ID]: configType.QUANTITY,
    [queryParam.STATION_ID]: [],
    [queryParam.NAME]: i18n.global.t('Quantities'),
    [queryParam.DESCRIPTION]: '',
    [queryParam.TYPE]: configType.QUANTITY,
    [queryParam.GRANULARITY]: granularity.DATE,
    [queryParam.ORDER_BY]: 'xScaleValue',
    [queryParam.ORDER_DIR]: 'asc',
    [queryParam.CHART_TYPE]: [chartType.STACKED_COLUMN],
    [queryParam.CHART_CURVE]: curveType.MONOTONE_X,
    [queryParam.GROUP_BY]: [xAxisKey.STATION_ID],
    [queryParam.INVERTED_FILTERS]: [],
    [queryParam.ITEMS_PER_PAGE]: getPaginationConfig(configType.QUANTITY).ITEMS_PER_PAGE_DEFAULT,
    [queryParam.PAGE]: getPaginationConfig(configType.QUANTITY).PAGE_DEFAULT,
    [queryParam.Y_AXIS]: yAxisKey.VALUE,
    [queryParam.Y_AXIS_RIGHT]: '',
    [queryParam.VISIBLE_COLUMNS]: defaultVisibleColumns.QUANTITY,
    [queryParam.CHART_LEGEND_STATE]: ['potential', 'good', 'scrap'],
  };
  const timeUsageDefaults = {
    [queryParam.PERIOD]: timePeriod.ROLLING_7_DAYS,
    [queryParam.BOOKMARK_ID]: configType.TIME_USAGE,
    [queryParam.STATION_ID]: [],
    [queryParam.COMMENT_GROUP_ID]: [],
    [queryParam.COMMENT_ID]: [],
    [queryParam.NAME]: i18n.global.t('Time usage'),
    [queryParam.DESCRIPTION]: '',
    [queryParam.TYPE]: configType.TIME_USAGE,
    [queryParam.GRANULARITY]: granularity.DATE,
    [queryParam.ORDER_BY]: 'xScaleValue',
    [queryParam.ORDER_DIR]: 'asc',
    [queryParam.CHART_TYPE]: [chartType.STACKED_COLUMN],
    [queryParam.CHART_CURVE]: curveType.MONOTONE_X,
    [queryParam.GROUP_BY]: [xAxisKey.STATION_ID],
    [queryParam.INVERTED_FILTERS]: [],
    [queryParam.ITEMS_PER_PAGE]: getPaginationConfig(configType.TIME_USAGE).ITEMS_PER_PAGE_DEFAULT,
    [queryParam.PAGE]: getPaginationConfig(configType.TIME_USAGE).PAGE_DEFAULT,
    [queryParam.Y_AXIS]: yAxisKey.VALUE,
    [queryParam.Y_AXIS_RIGHT]: '',
    [queryParam.VISIBLE_COLUMNS]: defaultVisibleColumns.TIME_USAGE,
    [queryParam.CHART_LEGEND_STATE]: ['uncommentedStop', 'unplannedStop', 'plannedStopIncludedInOee', 'plannedStopNotIncludedInOee', 'slow', 'good'],
  };
  const checklistDefaults = {
    [queryParam.PERIOD]: timePeriod.ROLLING_7_DAYS,
    [queryParam.BOOKMARK_ID]: configType.CHECKLIST,
    [queryParam.STATION_ID]: [],
    [queryParam.CHECKLIST_GROUP_ID]: [],
    [queryParam.CHECKLIST_ID]: [],
    [queryParam.NAME]: i18n.global.t('Checklists'),
    [queryParam.DESCRIPTION]: '',
    [queryParam.TYPE]: configType.CHECKLIST,
    [queryParam.GRANULARITY]: granularity.DATE,
    [queryParam.ORDER_BY]: 'xScaleValue',
    [queryParam.ORDER_DIR]: 'asc',
    [queryParam.CHART_TYPE]: [chartType.STACKED_COLUMN],
    [queryParam.CHART_CURVE]: curveType.MONOTONE_X,
    [queryParam.GROUP_BY]: [xAxisKey.ENTITY_ID],
    [queryParam.INVERTED_FILTERS]: [],
    [queryParam.ITEMS_PER_PAGE]: getPaginationConfig(configType.CHECKLIST).ITEMS_PER_PAGE_DEFAULT,
    [queryParam.PAGE]: getPaginationConfig(configType.CHECKLIST).PAGE_DEFAULT,
    [queryParam.Y_AXIS]: yAxisKey.ENTITY_COUNT,
    [queryParam.Y_AXIS_RIGHT]: '',
    [queryParam.VISIBLE_COLUMNS]: defaultVisibleColumns.CHECKLISTS,
    [queryParam.CHART_LEGEND_STATE]: ['checklistMissed', 'checklistUnsuccessful', 'checklistSuccessful'],
  };
  const productionSpeedFilterDefaults = bookmarkDefaults.productionSpeedDefaults;
  const productionSpeedDefaults = {
    [queryParam.PERIOD]: timePeriod.LAST_4_QUARTERS,
    [queryParam.BOOKMARK_ID]: configType.PRODUCTION_SPEED,
    [queryParam.FACTORY_ID]: productionSpeedFilterDefaults?.factoryId ? [productionSpeedFilterDefaults.factoryId] : [],
    [queryParam.STATION_ID]: productionSpeedFilterDefaults?.stationId ? [productionSpeedFilterDefaults.stationId] : [],
    [queryParam.PRODUCT_ID]: productionSpeedFilterDefaults?.productId ? [productionSpeedFilterDefaults.productId] : [],
    [queryParam.NAME]: i18n.global.t('Production speed'),
    [queryParam.DESCRIPTION]: '',
    [queryParam.TYPE]: configType.PRODUCTION_SPEED,
    [queryParam.GRANULARITY]: granularity.TOTAL,
    [queryParam.ORDER_BY]: 'binOrder',
    [queryParam.ORDER_DIR]: 'desc',
    [queryParam.CHART_TYPE]: [chartType.STACKED_COLUMN],
    [queryParam.CHART_CURVE]: curveType.MONOTONE_X,
    [queryParam.GROUP_BY]: [xAxisKey[productionSpeedFilterDefaults?.route?.runTimeType] ?? xAxisKey.SECOND_PER_UNIT],
    [queryParam.INVERTED_FILTERS]: [],
    [queryParam.ITEMS_PER_PAGE]: getPaginationConfig(configType.PRODUCTION_SPEED).ITEMS_PER_PAGE_DEFAULT,
    [queryParam.PAGE]: getPaginationConfig(configType.PRODUCTION_SPEED).PAGE_DEFAULT,
    [queryParam.Y_AXIS]: yAxisKey.PRODUCTION_COUNT,
    [queryParam.Y_AXIS_RIGHT]: '',
    [queryParam.VISIBLE_COLUMNS]: defaultVisibleColumns.PRODUCTION_SPEED,
    [queryParam.CHART_LEGEND_STATE]: [
      productionSpeedLegendType.MOST_FREQUENT,
      productionSpeedLegendType.TARGET_SPEED,
      productionSpeedLegendType.BELOW_TARGET,
      productionSpeedLegendType.ABOVE_TARGET,
    ],
  };
  if (hasMultipleFactories) {
    downtimeDefaults[queryParam.FACTORY_ID] = [];
    speedlossDefaults[queryParam.FACTORY_ID] = [];
    scrapDefaults[queryParam.FACTORY_ID] = [];
    oeeDefaults[queryParam.FACTORY_ID] = [];
    quantityDefaults[queryParam.FACTORY_ID] = [];
    timeUsageDefaults[queryParam.FACTORY_ID] = [];
    checklistDefaults[queryParam.FACTORY_ID] = [];
  }

  const ret = {
    [configType.DOWNTIME]: {
      id: configType.DOWNTIME,
      name: i18n.global.t('Downtime'),
      type: configType.DOWNTIME,
      bookmarkId: configType.DOWNTIME,
      defaults: downtimeDefaults,
      url: new UrlParams(downtimeDefaults, { hashBase: '#/reports2' }).asHashString(),
      icon: mdiHelpCircleOutline,
    },
    [configType.SPEEDLOSS]: {
      id: configType.SPEEDLOSS,
      name: i18n.global.t('Speed loss'),
      type: configType.SPEEDLOSS,
      bookmarkId: configType.SPEEDLOSS,
      defaults: speedlossDefaults,
      url: new UrlParams(speedlossDefaults, { hashBase: '#/reports2' }).asHashString(),
      icon: mdiSpeedometerSlow,
    },
    [configType.SCRAPREASON]: {
      id: configType.SCRAPREASON,
      name: i18n.global.t('Scrap'),
      type: configType.SCRAPREASON,
      bookmarkId: configType.SCRAPREASON,
      defaults: scrapDefaults,
      url: new UrlParams(scrapDefaults, { hashBase: '#/reports2' }).asHashString(),
      icon: mdiMinusCircleOutline,
    },
    [configType.OEE]: {
      id: configType.OEE,
      name: i18n.global.t('OEE'),
      type: configType.OEE,
      bookmarkId: configType.OEE,
      defaults: oeeDefaults,
      url: new UrlParams(oeeDefaults, { hashBase: '#/reports2' }).asHashString(),
      icon: mdiPercent,
    },
    [configType.QUANTITY]: {
      id: configType.QUANTITY,
      name: i18n.global.t('Quantities'),
      type: configType.QUANTITY,
      bookmarkId: configType.QUANTITY,
      defaults: quantityDefaults,
      url: new UrlParams(quantityDefaults, { hashBase: '#/reports2' }).asHashString(),
      icon: mdiCircleMultipleOutline,
    },
    [configType.TIME_USAGE]: {
      id: configType.TIME_USAGE,
      name: i18n.global.t('Time usage'),
      type: configType.TIME_USAGE,
      bookmarkId: configType.TIME_USAGE,
      defaults: timeUsageDefaults,
      url: new UrlParams(timeUsageDefaults, { hashBase: '#/reports2' }).asHashString(),
      icon: mdiPoll,
    },
  };

  if (checklistStations.length > 0 && checklistsEnabled) {
    ret[configType.CHECKLIST] = {
      id: configType.CHECKLIST,
      name: i18n.global.t('Checklists'),
      type: configType.CHECKLIST,
      bookmarkId: configType.CHECKLIST,
      defaults: checklistDefaults,
      url: new UrlParams(checklistDefaults, { hashBase: '#/reports2' }).asHashString(),
      icon: mdiPlaylistCheck,
    };
  }
  if (productionSpeedReportEnabled) {
    ret[configType.PRODUCTION_SPEED] = {
      id: configType.PRODUCTION_SPEED,
      name: i18n.global.t('Production speed'),
      type: configType.PRODUCTION_SPEED,
      bookmarkId: configType.PRODUCTION_SPEED,
      defaults: productionSpeedDefaults,
      url: new UrlParams(productionSpeedDefaults, { hashBase: '#/reports2' }).asHashString(),
      icon: mdiTimerOutline,
    };
  }
  return ret;
}
