import {
  isSameYear,
  isSameMonth,
  isSameWeek,
  isSameDay,
  isBefore,
} from 'date-fns';
import {
  isEqual, orderBy as orderByFn, without, intersection, uniq,
} from 'lodash';
import writeXlsxFile from 'write-excel-file/browser';
import sanitizeFilename from 'sanitize-filename';
import axios from 'axios';
import { defineStore } from 'pinia';

import timeGranularities from '@/stores/reportsConfig/constants/timeGranularities';
import parseDateStr from '@/helpers/date/parseDateStr';
import i18n from '@/services/i18n';
import createPDFfromHTML from '@/helpers/pdf/createPDFfromHTML';
import configType from '@/stores/reportsConfig/constants/configType';
import granularityType from '@/stores/reportsConfig/constants/granularity';
import configTypeEntityMap from '@/stores/reportsConfig/constants/configTypeEntityMap';
import { getRequestMeasures, getRequestDimensions, getTrendlineMeasure } from '@/stores/reportsConfig/configurations/requestMappingConfig';
import chartType from '@/stores/reportsConfig/constants/chartType';
import tableOrderingConfig from '@/stores/reportsConfig/configurations/tableOrderingConfig';
import filterItemsApi from '@/api/filterItemsApi';
import { createFilterConfiguration, FILTER_ITEM_LIMIT } from '@/stores/reportsConfig/configurations/FilterBarConfig';
import { getCurrentPeriod } from '@/constants/rollingPeriodRangeDefinitions';
import statisticsApi from '@/api/statisticsApi';
import REPORTS_EXTRA_QUERY_PARAMS from '@/stores/reportsConfig/configurations/extraQueryParamsList';
import queryParam from '@/stores/reportsConfig/constants/queryParam';
import ReportsDataMapper from '@/stores/reportsConfig/mappers/ReportsDataMapper';
import filterAndMap from '@/helpers/list/filterAndMap';
import timePeriodType from '@/constants/predefinedTimePeriodNames';
import measure from '@/stores/reportsConfig/constants/measure';
import getGroupByMenuItemsByConfigType from '@/stores/reportsConfig/configurations/groupByMenuItemsByConfigType';
import dimensionType from '@/stores/reportsConfig/constants/dimension';
import RequestCache from '@/services/indexedDB/requestCache';
import calcMeasure from '@/stores/reportsConfig/constants/calcMeasure';
import xAxisKey from '@/stores/reportsConfig/constants/xAxisKey';
import shouldUseTotalMeasures from '@/stores/reportsConfig/configurations/shouldUseTotalMeasures';
import getChartType from '@/stores/reportsConfig/configurations/chartTypeChangeConfig';
import isMenuEmptyValueSelected from '@/components/organisms/reports/ReportsChartOptionsMenu/isMenuEmptyValueSelected';
import logApi from '@/api/logApi';
import getPreCalcConfigs from '@/stores/reportsConfig/configurations/preProcessingConfig';
import calculateDatapointDateRange, { microGranularitiesConfig } from '@/stores/reportsConfig/calculateDatapointDateRange';
import { durationFormats } from '@/constants/durationFormat';
import useFilterbarStore from '@/stores/filterbar';
import useGenericNotificationStore from '@/stores/genericNotification';
import useConfirmDialogStore from '@/stores/confirmDialog';
import useProfileStore from '@/stores/profile';
import useRouteModuleStore from '@/stores/routeModule';
import useConfigurationStore from '@/stores/configuration';
import useFactoryStore from '@/stores/factory';
import useCommentStore from '@/stores/comment';
import usePerfCommentStore from '@/stores/perfComment';
import useScrapReasonStore from '@/stores/scrapReason';
import useStationStore from '@/stores/station';

const RECOMMENDED_DATAPOINT_LIMIT = 2000;

export function calcRecommendedDataPointLimit(cfgType) {
  const preCalcConfigs = getPreCalcConfigs({ formattingOptions: {}, requirements: {} });
  const config = preCalcConfigs.get(cfgType);
  if (config) {
    return RECOMMENDED_DATAPOINT_LIMIT / config.groupingConfig.size;
  }
  return RECOMMENDED_DATAPOINT_LIMIT;
}

export function getIsStacked({ getters }) {
  const nonStackingChartTypes = new Set([chartType.LINE, chartType.DOT_PLOT]);
  if (getters.chartType.some((type) => (nonStackingChartTypes.has(type)))) {
    return [false, false, false];
  }
  if (getters.configType === configType.OEE) return [false, false, true];
  return [false, true, false];
}

const reportDataCache = new RequestCache('reportDataCache');

export function getSpreadsheetFormattedValue(row, header, durFormatType) {
  const value = row[header.textKey];

  if (header.isDurationValue) {
    const rawValue = header.valueKey ? Number(row[header.valueKey]) : Number(value);
    if (durFormatType === durationFormats.READABLE && header.formatFn) {
      return header.formatFn(rawValue);
    }
    const conversionMap = {
      [durationFormats.SECONDS]: (s) => s,
      [durationFormats.MINUTES]: (s) => s / 60,
      [durationFormats.HOURS]: (s) => s / 3600,
    };
    const converter = conversionMap[durFormatType] || conversionMap[durationFormats.SECONDS];
    return converter(rawValue);
  }

  if (header.type === 'number') {
    if (header.valueKey) {
      return Number(row[header.valueKey]);
    }
    return Number(value);
  }
  if (header.formatFn) {
    return header.formatFn(value);
  }
  return value;
}

function exportSpreadsheet({ data, name }) {
  writeXlsxFile(data, {
    fileName: `${sanitizeFilename(name)}.xlsx`,
  });
}

function getDurationUnitSuffix(durFormatType) {
  const unitMap = {
    [durationFormats.SECONDS]: 'second',
    [durationFormats.MINUTES]: 'minute',
    [durationFormats.HOURS]: 'hour',
  };

  if (durFormatType === durationFormats.READABLE) return null;

  const unit = unitMap[durFormatType] ?? unitMap[durationFormats.SECONDS];
  const locale = i18n.global?.locale?.value ?? i18n.global?.locale ?? 'en';
  const formatter = new Intl.NumberFormat(locale, {
    style: 'unit',
    unit,
    unitDisplay: 'short',
  });

  const parts = formatter.formatToParts(1);
  const unitPart = parts.find((part) => part.type === 'unit');
  return unitPart?.value ?? unit;
}

export function getSpreadSheetFormattedData({
  data, orderBy, orderDir, headers, totals, durFormatType,
}) {
  const orderedData = orderByFn(data, orderBy, orderDir);
  if (totals) orderedData.push(totals);
  const headerRow = headers.map((header) => {
    if (header.isHidden) return null;
    if (header.isDurationValue) {
      const unitSuffix = getDurationUnitSuffix(durFormatType);
      return { value: unitSuffix ? `${header.text}, ${unitSuffix}` : header.text };
    }
    return { value: header.text };
  });
  const result = orderedData.map((row, idx) => {
    const rowArray = [];
    headers.forEach((header, j) => {
      if (!header.isHidden) {
        const mappedObj = {};
        if (idx + 1 < orderedData.length || !totals) mappedObj.value = getSpreadsheetFormattedValue(row, header, durFormatType);
        else if (j === 0 && totals) mappedObj.value = i18n.global.t('Total');
        else if (header.hasTotal) mappedObj.value = getSpreadsheetFormattedValue(totals, header, durFormatType);
        rowArray.push(mappedObj);
      }
    });
    return rowArray;
  });
  return [headerRow, ...result];
}

export function getHiddenLegendValues(legend, selected) {
  const selectedSet = new Set(selected);
  return [...legend.keys()].filter((key) => !selectedSet.has(key));
}

export function areAnyRequiredFiltersEmpty(filterConfiguration, filterState) {
  return Object.entries(filterState).some(([key, val]) => {
    if ((val || []).length === 0) {
      const currentFilterConfig = filterConfiguration.get(key);
      return currentFilterConfig?.attr?.required;
    }
    return false;
  });
}

const translations = {
  Factories: i18n.global.t('Factories'),
  Stations: i18n.global.t('Stations'),
  StopReasons: i18n.global.t('Stops'),
  StopReasonGroups: i18n.global.t('Stop groups'),
  SpeedLossReasons: i18n.global.t('Speed loss reasons'),
  SpeedLossGroups: i18n.global.t('Speed loss groups'),
  StopGroups: i18n.global.t('Stop groups'),
  Shifts: i18n.global.t('Shifts'),
  Locations: i18n.global.t('Machine locations'),
  ProductGroups: i18n.global.t('Product groups'),
  Products: i18n.global.t('products'),
  Operators: i18n.global.t('Operators'),
  deleted: i18n.global.t('Deleted'),
  StopTypes: i18n.global.t('Stop types'),
  Planned: i18n.global.t('Planned'),
  Unplanned: i18n.global.t('Unplanned'),
};

const useReportsConfigStore = defineStore('reportsConfig', {
  state: () => ({
    dateRange: [],
    isGeneratingPdf: false,
    splitFilters: new Set(),
    rawData: [],
    calculatedData: [],
    chartDataRaw: [],
    tableData: [],
    totals: {},
    stackLegend: new Map(),
    dataMapper: null,
    dataProcessing: false,
    dataLoading: [],
    stackDomain: [],
    isNotesFetchLoading: false,
    isNotesMapperLoading: false,
    calculatedNotesData: [],
    hiddenGroupingValues: [],
    trendlineData: null,
    stackLegendList: [],
    reportsDataController: null,
  }),
  actions: {
    setDateRange(dateRange) {
      this.dateRange = dateRange;
    },
    initDataMapper() {
      const profileStore = useProfileStore();
      this.dataMapper = new ReportsDataMapper({
        onCalcDataChange: (args) => {
          this.calculatedData = args.data;
          this.tableData = args.tableData;
          this.chartDataRaw = args.chartData;
          this.totals = args.totals;
          this.stackLegend = args.stackLegend;
          this.stackLegendList = [...args.stackLegend.keys()];
        },
        onLoadingChange: (val) => {
          this.dataProcessing = val;
        },
        usePagination: true,
        formattingOptions: {
          numberFormattingOptions: profileStore.numberFormattingOptions,
          dateFormat: profileStore.dateFormat,
          timeFormat: profileStore.timeFormat,
          firstDayOfWeek: profileStore.firstDayOfWeek,
        },
      });
    },
    async calcNewGranularity({
      start, end, selectionType = '', isDrilldown = false,
    }) {
      const exceptionSelectionTypes = [
        timePeriodType.THIS_WEEK,
        timePeriodType.LAST_WEEK,
        timePeriodType.ROLLING_7_DAYS,
        timePeriodType.THIS_MONTH,
        timePeriodType.LAST_MONTH,
        timePeriodType.ROLLING_30_DAYS,
      ];
      if (exceptionSelectionTypes.includes(selectionType)) return granularityType.DATE;
      const startDt = parseDateStr(start);
      const endDt = parseDateStr(end);
      if (isDrilldown && isSameDay(startDt, endDt) && microGranularitiesConfig.has(this.configType)) {
        return microGranularitiesConfig.get(this.configType).granularity;
      }
      if (isSameWeek(startDt, endDt, { weekStartsOn: useProfileStore().firstDayOfWeek })) return granularityType.DATE;
      if (isSameMonth(startDt, endDt)) return granularityType.WEEKOFYEAR;
      if (isSameYear(startDt, endDt)) return granularityType.MONTH;
      return granularityType.YEAR;
    },
    async calcSmallerGranularityIfNeeded({
      start, end, selectionType = '', granularity = this.granularity, isDrilldown = false,
    }) {
      const granularitiesOrder = [
        granularityType.DUE_TIME,
        granularityType.STARTTIME,
        granularityType.DATE,
        granularityType.DAYOFWEEK,
        granularityType.WEEKOFYEAR,
        granularityType.MONTH,
        granularityType.QUARTER,
        granularityType.YEAR,
        granularityType.TOTAL,
      ];
      const newGranularity = await this.calcNewGranularity({
        start,
        end,
        selectionType,
        isDrilldown,
      });
      const changeGranularity = granularitiesOrder.indexOf(newGranularity) < granularitiesOrder.indexOf(granularity);
      return changeGranularity ? newGranularity : granularity;
    },
    async getOrderingParamsByGranularity(granularity) {
      if (tableOrderingConfig[granularity] !== undefined) {
        if (tableOrderingConfig[granularity].orderBy !== undefined) {
          return tableOrderingConfig[granularity];
        }
        if (tableOrderingConfig[granularity][this.configType] !== undefined) {
          return tableOrderingConfig[granularity][this.configType];
        }
      }
      throw new Error(`ordering config missing for ${granularity} & ${this.configType}`);
    },
    getVisibleColumns({ granularity, groupBy }) {
      const currentVisibleColumns = useFilterbarStore().requestFilterState.visibleColumns || [];
      if (currentVisibleColumns.includes(measure.TOTAL_PLANNED_TIME) && !shouldUseTotalMeasures(granularity, groupBy?.[0])) {
        return [...currentVisibleColumns.filter((column) => column !== measure.TOTAL_PLANNED_TIME), measure.ROW_PLANNED_TIME];
      }
      if (currentVisibleColumns.includes(measure.ROW_PLANNED_TIME) && shouldUseTotalMeasures(granularity, groupBy?.[0])) {
        return [...currentVisibleColumns.filter((column) => column !== measure.ROW_PLANNED_TIME), measure.TOTAL_PLANNED_TIME];
      }
      return currentVisibleColumns;
    },
    async calcGranularityChangeSideEffects({ granularity, groupBy }) {
      if (!granularity) return null;
      const orderingParams = await this.getOrderingParamsByGranularity(granularity);
      const visibleColumns = this.getVisibleColumns({ granularity, groupBy });
      return {
        visibleColumns, granularity, ...orderingParams,
      };
    },
    async onGranularityChange(granularity) {
      if (!granularity) return;
      const queryParams = await this.calcGranularityChangeSideEffects({ granularity });
      await useFilterbarStore().updateFilterValue(queryParams);
      useFilterbarStore().triggerDataRequest();
    },
    async onGroupByChange({ value, index }) {
      const groupBy = [...this.groupBy];
      const previousChartType = [...this.chartType];
      if (isMenuEmptyValueSelected(value) && groupBy[index] !== undefined) {
        groupBy.splice(index, 1);
      } else {
        groupBy[index] = value;
      }
      let queryParams = {};

      if ((this.granularity !== granularityType.TOTAL && index === 0)) {
        queryParams = await this.calcGranularityChangeSideEffects({
          granularity: granularityType.TOTAL,
          groupBy,
        });
      }
      const newChartType = getChartType(this.configType, { groupBy, previousChartType });
      await useFilterbarStore().updateFilterValue({ groupBy, ...queryParams, chartType: newChartType });
      useFilterbarStore().triggerDataRequest();
    },
    async onYAxisChange(yAxis) {
      if (!yAxis) return;
      await useFilterbarStore().updateFilterValue({ yAxis });
      useFilterbarStore().triggerDataRequest();
    },
    async onChartLegendChange(chartLegendState) {
      await useFilterbarStore().updateFilterValue({ chartLegendState });
      useFilterbarStore().triggerDataRequest();
    },
    async onRightYAxisChange(yAxisRight) {
      await useFilterbarStore().updateFilterValue({ yAxisRight });
      useFilterbarStore().triggerDataRequest();
    },
    async onChartTypeChange(chartTypeStr) {
      if (!chartTypeStr) return;
      const chartTypes = chartTypeStr.split(',');
      await useFilterbarStore().updateFilterValue({ chartType: chartTypes });
      useFilterbarStore().triggerDataRequest();
      if (this.configType === configType.OEE) {
        localStorage.setItem('reportingOeeChartType', JSON.stringify(chartTypes));
      }
    },
    async onDateRangeSelectionApply({ start, end, selectionType }) {
      let queryParams;
      if (this.granularity !== granularityType.TOTAL) {
        const newGranularity = await this.calcNewGranularity({
          start,
          end,
          selectionType,
        });
        queryParams = await this.calcGranularityChangeSideEffects({ granularity: newGranularity });
      }
      await useFilterbarStore().updateFilterValue(queryParams);
      useFilterbarStore().triggerDataRequest();
    },
    async calcNewDrilldownPeriod(groupingKey) {
      const [rangeStart, rangeEnd] = this.orderedDateRange;
      const dateRange = calculateDatapointDateRange({
        rangeStart,
        rangeEnd,
        granularity: this.granularity,
        groupingKey,
        cfgType: this.configType,
        weekStartsOn: useProfileStore().firstDayOfWeek,
        isDrilldown: true,
      });

      const currentPeriod = getCurrentPeriod(this.period, { weekStartsOn: useProfileStore().firstDayOfWeek });
      if (currentPeriod !== undefined) {
        const rollingPeriodRange = currentPeriod;
        if (isEqual(rollingPeriodRange, dateRange)) {
          return currentPeriod;
        }
      }

      return dateRange;
    },
    async getInvertedFiltersWithout(filter) {
      const invertedFilters = [...this.invertedFilters];
      return invertedFilters.filter((invertedFilter) => invertedFilter !== filter);
    },
    async getDrilldownFilterReqObj({
      item, requestFilterKey, filterKey, valueAsList,
    }) {
      const invertedFilters = await this.getInvertedFiltersWithout(requestFilterKey);
      if (item.isFake === true) {
        return { filters: {}, invertedFilters };
      }
      return {
        filters: { [requestFilterKey]: valueAsList ? [item[filterKey]] : item[filterKey] },
        invertedFilters,
      };
    },
    async getGroupDrilldownFilterReqObj({
      item, storeKey, filterKey, requestFilterKey,
    }) {
      const { requestFilterState } = useFilterbarStore();
      const invertedFilters = await this.getInvertedFiltersWithout(requestFilterKey);
      const isInGroup = (storeEntity) => item[filterKey].includes(storeEntity.groupId);
      const piniaGetterMap = {
        'comment/allComments': () => useCommentStore().allComments,
        'perfComment/allPerfComments': () => usePerfCommentStore().allPerfComments,
        'scrapReason/allScrapReasons': () => useScrapReasonStore().allScrapReasons,
        'station/stations': () => useStationStore().stations,
      };
      const groupEntityIds = filterAndMap(
        (piniaGetterMap[storeKey] || (() => []))(),
        [isInGroup],
        (storeEntity) => storeEntity.id,
      );

      let drilldownFilterValue = [];
      if (this.invertedFilters.includes(requestFilterKey)) {
        drilldownFilterValue = without(groupEntityIds, ...requestFilterState[requestFilterKey]);
      } else if (requestFilterState[requestFilterKey]?.length > 0) {
        drilldownFilterValue = intersection(groupEntityIds, requestFilterState[requestFilterKey]);
      } else {
        drilldownFilterValue = groupEntityIds;
      }

      return { filters: { [requestFilterKey]: drilldownFilterValue }, invertedFilters };
    },
    async getSelectedGroupFilteringArguments({ item }) {
      const [groupByKey] = this.groupBy;
      const groupByFilterKeys = new Set([
        xAxisKey.FACTORY_ID,
        xAxisKey.STATION_ID,
        xAxisKey.PRODUCT_ID,
        xAxisKey.POSITION_ID,
        xAxisKey.PERFORMANCE_POSITION_ID,
      ]);
      if (groupByFilterKeys.has(groupByKey)) {
        return this.getDrilldownFilterReqObj({
          item,
          requestFilterKey: groupByKey,
          filterKey: groupByKey,
          valueAsList: false,
        });
      }
      if (groupByKey === xAxisKey.ENTITY_ID) {
        return this.getDrilldownFilterReqObj({
          item,
          requestFilterKey: item.entityKey,
          filterKey: 'entityId',
          valueAsList: false,
        });
      }
      if (groupByKey === xAxisKey.SINGLE_OPERATOR) {
        return this.getDrilldownFilterReqObj({
          item,
          requestFilterKey: 'operatorId',
          filterKey: 'operatorId',
          valueAsList: false,
        });
      }
      if (groupByKey === xAxisKey.SHIFT_TEMPLATE) {
        return this.getDrilldownFilterReqObj({
          item,
          requestFilterKey: 'shiftName',
          filterKey: 'shiftTemplate',
          valueAsList: true,
        });
      }
      if (groupByKey === xAxisKey.LOT_CODE) {
        return this.getDrilldownFilterReqObj({
          item,
          requestFilterKey: 'lotCode',
          filterKey: 'lotCode',
          valueAsList: true,
        });
      }
      if (groupByKey === xAxisKey.PRODUCT_GROUP_ID) {
        return this.getDrilldownFilterReqObj({
          item,
          requestFilterKey: xAxisKey.PRODUCT_ID,
          filterKey: xAxisKey.PRODUCT_ID,
          valueAsList: false,
        });
      }
      if (groupByKey === xAxisKey.SKU) {
        return this.getDrilldownFilterReqObj({
          item,
          requestFilterKey: xAxisKey.PRODUCT_ID,
          filterKey: xAxisKey.PRODUCT_ID,
          valueAsList: false,
        });
      }
      if (groupByKey === xAxisKey.ENTITY_GROUP_ID) {
        const entityStoreMap = {
          commentId: 'comment/allComments',
          performanceCommentId: 'perfComment/allPerfComments',
          scrapReasonId: 'scrapReason/allScrapReasons',
        };
        const storeKeyVal = entityStoreMap[item.entityKey];
        return this.getGroupDrilldownFilterReqObj({
          item,
          storeKey: storeKeyVal,
          requestFilterKey: item.entityKey,
          filterKey: 'entityGroupId',
        });
      }
      if (groupByKey === xAxisKey.STATION_GROUP_ID) {
        return this.getGroupDrilldownFilterReqObj({
          item,
          storeKey: 'station/stations',
          requestFilterKey: 'stationId',
          filterKey: 'stationGroupId',
        });
      }
      return {};
    },
    async onDrilldown(items) {
      if (this.configType === configType.PRODUCTION_SPEED) return;
      if (this.granularity === granularityType.DATE && !microGranularitiesConfig.has(this.configType)) return;
      const [item] = items;
      const [start, end] = await this.calcNewDrilldownPeriod(item.groupingKey);
      const newGranularity = await this.calcSmallerGranularityIfNeeded({ start, end, isDrilldown: true });
      const granularityQueryParams = await this.calcGranularityChangeSideEffects({ granularity: newGranularity });
      let args = {};
      if (this.granularity === granularityType.TOTAL) {
        args = await this.getSelectedGroupFilteringArguments({ item });
      } else {
        args.invertedFilters = this.invertedFilters;
        args.filters = {};
      }

      const queryParamsVal = {
        ...granularityQueryParams,
        period: [start, end],
        ...args.filters,
        invertedFilters: args.invertedFilters,
      };

      await useFilterbarStore().updateFilterValue(queryParamsVal);
      useFilterbarStore().triggerDataRequest();
    },
    async generateReportsPdf(elList) {
      this.isGeneratingPdf = true;
      try {
        await createPDFfromHTML(elList);
        useGenericNotificationStore().notifySuccess(i18n.global.t('Download finished'));
      } catch (error) {
        console.error(error);
        useGenericNotificationStore().notifyError(i18n.global.t('Export failed'));
      } finally {
        this.isGeneratingPdf = false;
      }
    },
    async requestEntityCounts() {
      let results = {};
      try {
        results = await filterItemsApi.getEntitiesCount({
          entity: ['comments', 'performancelosses', 'products'],
        });
      } catch {
        // pass
      }
      return results;
    },
    async setFilterEntityCounts() {
      const entityMap = {
        comments: 'commentId',
        performancelosses: 'performanceCommentId',
        products: 'productId',
      };
      const countsObj = await this.requestEntityCounts();
      const splitFiltersList = [];
      Object.entries(countsObj).forEach(([key, value]) => {
        if (value > FILTER_ITEM_LIMIT) {
          splitFiltersList.push(entityMap[key]);
        }
      });
      this.splitFilters = splitFiltersList;
    },
    async requestReportsData() {
      const args = this.buildQueryArgs();
      const requiredButEmpty = areAnyRequiredFiltersEmpty(useFilterbarStore().calculatedFilterConfig, args.filters);

      if (requiredButEmpty) {
        this.rawData = [];
      } else {
        this.fetchReportsData(args);
      }
    },
    buildQueryArgs() {
      const query = useFilterbarStore().requestFilterState;
      const filters = Object.entries(query).reduce((acc, [key, value]) => {
        if (useFilterbarStore().calculatedFilterConfig.get(key)) {
          acc[key] = value;
        }
        return acc;
      }, {});
      REPORTS_EXTRA_QUERY_PARAMS.forEach((param) => {
        delete filters[param];
      });

      if (filters[queryParam.CHECKLIST_DONE_BY_ENTITY_ID]) {
        filters[queryParam.CHECKLIST_DONE_BY_ENTITY_ID] = filters[queryParam.CHECKLIST_DONE_BY_ENTITY_ID].map((val) => val.toString());
      }

      if (this.configType === configType.CHECKLIST && !filters[queryParam.CHECKLIST_STATUS]) {
        filters[queryParam.CHECKLIST_STATUS] = [1, 2, 3];
      }

      const [start, end] = this.orderedDateRange;
      return {
        filters, range: { start, end }, query,
      };
    },
    async setFetchedData({ payload, response, tenantId, trendlineData }) {
      this.rawData = response.results;
      this.trendlineData = trendlineData;
      await reportDataCache.setCachedResponse(payload, response.results, tenantId, trendlineData);
      reportDataCache.deleteOutdatedCache();
    },
    initTooMuchDataWarning({ payload, response, tenantId, trendlineData }) {
      const dialogConfig = {
        title: i18n.global.t('Confirmation'),
        text: i18n.global.t('Your selected filters and chart options have generated a large dataset. This could slow down the page or cause it to freeze.'),
        action: () => {
          logApi.logEvent([{
            type: 'reports datapoint limit exceeded - user continued with request',
            message: window.location.href,
          }]);
          this.setFetchedData({ payload, response, tenantId, trendlineData });
        },
        closeAction: () => {
          logApi.logEvent([{
            type: 'reports datapoint limit exceeded - user cancelled request',
            message: window.location.href,
          }]);
          window.history.back();
        },
        color: 'error',
        confirmText: i18n.global.t('Continue'),
        cancelText: i18n.global.t('Back'),
      };
      useConfirmDialogStore().openConfirmDialog(dialogConfig);
    },
    async fetchReportsData({ filters, range, query }) {
      if (this.reportsDataController) this.reportsDataController.abort();
      window.WorkerService.cancelFirstInQueue('processReportsDataGranularity');
      this.reportsDataController = new AbortController();
      try {
        this.dataLoading.push(true);
        const payload = {
          dimensions: this.reqDimensions,
          granularity: this.granularity,
          measures: this.reqMeasures,
          groupBy: this.reqGroupBy,
          inverseFilter: query[queryParam.INVERTED_FILTERS],
          filters,
          range,
        };
        const { tenantId } = useProfileStore().currentUser;
        const cacheEntry = await reportDataCache.getCachedResponse({ ...payload, yAxis: this.yAxis }, tenantId);
        if (cacheEntry) {
          this.rawData = cacheEntry.resPayload;
          this.trendlineData = cacheEntry.trendlineData;
        } else {
          const apiMethod = this.configType === configType.PRODUCTION_SPEED ? 'getReportDataV3' : 'getReportData';
          const response = await statisticsApi[apiMethod](payload, {
            signal: this.reportsDataController.signal,
          });
          const trendlineData = await this.getTrendlineData({ filters, range, query });
          if (response.results.length > calcRecommendedDataPointLimit(this.configType)) {
            this.initTooMuchDataWarning({ payload, response, tenantId, trendlineData });
          } else {
            this.setFetchedData({ payload, response, tenantId, trendlineData });
          }
        }
      } catch (err) {
        if (!axios.isCancel(err)) {
          useGenericNotificationStore().notifyError(err.response.data.message);
          this.rawData = [];
        }
      } finally {
        this.dataLoading.pop();
      }
    },
    async getTrendlineData({ filters, range, query }) {
      if (this.isTimeGranularity && !useConfigurationStore().disableTrendline) {
        const reqMeasure = getTrendlineMeasure({ type: this.configType, yAxis: this.yAxis });
        if (!reqMeasure) {
          return null;
        }
        try {
          const trendlinePayload = {
            measure: reqMeasure,
            granularity: this.granularity,
            filters: { ...filters, ...range },
            inverseFilter: query[queryParam.INVERTED_FILTERS],
          };
          return await statisticsApi.getTrendlineData(trendlinePayload, { signal: this.reportsDataController.signal });
        } catch {
          return null;
        }
      } else {
        return null;
      }
    },
    initMapperCalculation(options) {
      const [start, end] = this.orderedDateRange;
      const configuration = {
        data: this.rawData,
        granularity: this.granularity,
        startDate: start,
        endDate: end,
        configType: this.configType,
        groupBy: this.groupBy || [''],

        orderBy: this.orderBy || [''],
        orderDir: this.orderDir || ['desc'],
        page: this.page || 1,
        itemsPerPage: this.itemsPerPage || 10,
        isStacked: getIsStacked({ getters: this }),
        yAxis: this.yAxis || 'value',
        hiddenGroupingValues: this.hiddenGroupingValues,
        chartLegendState: this.chartLegendState,
      };
      if (options?.translationsObj !== undefined) {
        configuration.translations = options.translationsObj;
      }
      if (options?.isCompactFormatted !== undefined) {
        configuration.isCompactFormatted = options.isCompactFormatted;
      }
      this.dataMapper.getChartData(configuration);
    },
    initMapperReorder() {
      this.dataMapper.reOrderData({
        orderBy: this.orderBy || [''],
        orderDir: this.orderDir || ['desc'],
        page: this.page || 1,
        itemsPerPage: this.itemsPerPage || 10,
      });
    },
    async onSpreadsheetExport({
      headers, data, totals, name, durFormatType,
    }) {
      try {
        const xlsxTableJson = getSpreadSheetFormattedData({
          headers,
          data,
          totals,
          orderBy: this.orderBy,
          orderDir: this.orderDir,
          durFormatType,
        });
        exportSpreadsheet({ data: xlsxTableJson, name });
        useGenericNotificationStore().notifySuccess(i18n.global.t('Download finished'));
      } catch (err) {
        useGenericNotificationStore().notifyError(err?.response?.data?.message ?? i18n.global.t('Something went wrong. Please try again.'));
        throw new Error(err);
      }
    },
    async onTableSpreadsheetExport({ headers }) {
      const maxNameLength = 31;
      const name = this.reportName.length > maxNameLength ? `${this.reportName.substring(0, maxNameLength)}...` : this.reportName;
      const durFormatType = useProfileStore().reportsDurationFormat;
      this.onSpreadsheetExport({
        data: this.tableData, headers, totals: this.totals, name, durFormatType,
      });
    },
    async onNotesSpreadsheetExport({ headers }) {
      const durFormatType = useProfileStore().reportsDurationFormat;
      this.loadReportsNotes({
        onCalcDataChange: (data) => this.onSpreadsheetExport({
          data: data.tableData,
          headers,
          name: sanitizeFilename(`${this.reportName}(${i18n.global.t('notes')})`),
          durFormatType,
        }),
        onLoadingChange: (val) => this.setNotesMapperLoadingState(val),
      });
    },
    async loadReportsNotesTableData({ row }) {
      this.loadReportsNotes({
        onCalcDataChange: (val) => this.setNotesCalculatedData(val),
        onLoadingChange: (val) => this.setNotesMapperLoadingState(val),
        row,
      });
    },
    async loadReportsNotes({
      row, onCalcDataChange, onLoadingChange,
    }) {
      const notesDataMapper = new ReportsDataMapper({
        onCalcDataChange,
        onLoadingChange,
        formattingOptions: {
          numberFormattingOptions: useProfileStore().numberFormattingOptions,
          dateFormat: useProfileStore().dateFormat,
          timeFormat: useProfileStore().timeFormat,
        },
      });
      const requestArgs = await this.buildNotesRequest({ row });
      const data = await this.fetchReportsNotesData(requestArgs);
      this.processReportNotesData({
        mapperRef: notesDataMapper,
        data,
        dateRange: [requestArgs.range.start, requestArgs.range.end],
      });
    },
    async buildNotesRequest({ row }) {
      const queryArgs = this.buildQueryArgs();
      let { start, end } = queryArgs.range;

      let filters = {
        ...queryArgs.filters,
      };
      if (this.configType === configType.DOWNTIME) {
        filters.notes = true;
      }
      if (this.configType === configType.SPEEDLOSS) {
        filters.performanceNotes = true;
      }
      let inverseFilter = [];
      if (row) {
        const [notesStart, notesEnd] = await this.calcNewDrilldownPeriod(row.groupingKey);
        if (isBefore(parseDateStr(start), parseDateStr(notesStart))) {
          start = notesStart;
        }
        if (isBefore(parseDateStr(notesEnd), parseDateStr(end))) {
          end = notesEnd;
        }
        const args = await this.getSelectedGroupFilteringArguments({ item: row });
        filters = { ...filters, ...args.filters };
        if (args.invertedFilters) inverseFilter = args.invertedFilters;
        if (this.granularity === granularityType.STARTTIME) {
          filters.localstarttime = row.groupingKey;
        }
      } else {
        inverseFilter = this.invertedFilters;
      }
      return { filters, range: { start, end }, inverseFilter };
    },
    async fetchReportsNotesData({ filters, range, inverseFilter }) {
      try {
        const getGroupByFn = () => {
          if (this.configType === configType.DOWNTIME) return [dimensionType.TIMELINE_ID];
          if (this.configType === configType.CHECKLIST) return [dimensionType.TIMELINE_ID];
          if (this.configType === configType.SPEEDLOSS) return [dimensionType.PERFORMANCE_LOSS_INSTANCE_ID];
          return [];
        };
        this.isNotesFetchLoading = true;
        const response = await statisticsApi.getReportData({
          dimensions: this.reqInstanceDimensions,
          granularity: this.granularity,
          measures: this.notesReqInstanceMeasures,
          groupBy: getGroupByFn(),
          inverseFilter,
          filters,
          range,
        });
        return response.results;
      } catch (err) {
        useGenericNotificationStore().notifyError(err);
        return [];
      } finally {
        this.isNotesFetchLoading = false;
      }
    },
    processReportNotesData({ mapperRef, data, dateRange }) {
      const [start, end] = dateRange;
      mapperRef.getChartData({
        data,
        barsCountLimit: 9999,
        startDate: start,
        endDate: end,
        configType: this.configType,
        groupBy: this.configType === configType.SPEEDLOSS ? ['performancelossinstanceid'] : ['starttime'],
        translations: {},
        granularity: this.configType === configType.SPEEDLOSS ? granularityType.TOTAL : granularityType.STARTTIME,
        orderBy: this.orderBy || [''],
        orderDir: this.orderDir || ['desc'],
      });
    },
    setNotesMapperLoadingState(val) {
      this.isNotesMapperLoading = val;
    },
    setNotesCalculatedData({ data }) {
      this.calculatedNotesData = data;
      this.calculatedNotesData.slice();
    },
    async onPrevOrNextDateRangeApply({ start, end }) {
      const queryParams = await this.calcChartTypeParams({ start, end });
      await useFilterbarStore().updateFilterValue(queryParams);
      useFilterbarStore().triggerDataRequest();
    },
  },
  getters: {
    isLoading: (state) => !!state.dataLoading.length || state.dataProcessing,
    isNotesLoading: (state) => state.isNotesMapperLoading || state.isNotesFetchLoading,
    groupBy: () => useFilterbarStore().requestFilterState[queryParam.GROUP_BY],
    granularity: () => useFilterbarStore().requestFilterState[queryParam.GRANULARITY],
    configType: () => useFilterbarStore().requestFilterState[queryParam.TYPE],
    orderBy: () => useFilterbarStore().requestFilterState[queryParam.ORDER_BY],
    orderDir: () => useFilterbarStore().requestFilterState[queryParam.ORDER_DIR],
    page: () => useFilterbarStore().requestFilterState[queryParam.PAGE],
    itemsPerPage: () => useFilterbarStore().requestFilterState[queryParam.ITEMS_PER_PAGE],
    chartType: () => useFilterbarStore().requestFilterState[queryParam.CHART_TYPE],
    chartTypeJoined() {
      return this.chartType?.join(',');
    },
    chartCurve: () => useFilterbarStore().requestFilterState[queryParam.CHART_CURVE],
    period: () => useFilterbarStore().requestFilterState[queryParam.PERIOD],
    yAxis: () => useFilterbarStore().requestFilterState[queryParam.Y_AXIS],
    yAxisRight: () => useFilterbarStore().requestFilterState[queryParam.Y_AXIS_RIGHT],
    invertedFilters: () => useFilterbarStore().requestFilterState[queryParam.INVERTED_FILTERS],
    chartLegendState: () => useFilterbarStore().requestFilterState[queryParam.CHART_LEGEND_STATE],
    entityType() {
      return configTypeEntityMap.get(this.configType);
    },
    reqMeasures() {
      return getRequestMeasures({
        granularity: this.granularity,
        type: this.configType,
        groupBy: this.groupBy,
      });
    },
    reqInstanceMeasures() {
      return getRequestMeasures({
        granularity: granularityType.STARTTIME,
        type: this.configType,
        groupBy: this.groupBy,
      });
    },
    reqDimensions() {
      return getRequestDimensions({
        granularity: this.granularity,
        type: this.configType,
        groupBy: this.groupBy,
      });
    },
    reqInstanceDimensions() {
      return getRequestDimensions({
        granularity: granularityType.STARTTIME,
        type: this.configType,
        groupBy: this.groupBy,
      });
    },
    notesReqInstanceMeasures() {
      const measures = [...this.reqInstanceMeasures];
      if (this.configType === configType.SPEEDLOSS) {
        measures.push(measure.PERFORMANCE_LOSS_NOTES);
      }
      if (this.configType === configType.DOWNTIME) {
        measures.push(measure.NOTES);
      }
      return measures;
    },
    orderedDateRange: (state) => [...state.dateRange].sort(),
    filterConfiguration() {
      const configurations = createFilterConfiguration({
        translations,
        splitFilters: new Set(this.splitFilters),
        disabledFilters: this.disabledParams,
        firstDayOfWeek: useProfileStore().firstDayOfWeek,
      });
      return configurations;
    },
    notesTableActiveHeaders() {
      return (headers) => {
        const disabledSet = new Set(this.disabledParams);
        return headers.filter((header) => {
          const matchesRequestParams = [
            ...this.notesReqInstanceMeasures,
            ...this.reqInstanceDimensions,
            this.granularity,
          ].includes(header.id);
          const notDisabled = !disabledSet.has(header.relatedParam);
          return notDisabled && matchesRequestParams;
        });
      };
    },
    isCalculatedValue() {
      return (header) => {
        const calcValuesMap = {
          [configType.DOWNTIME]: [calcMeasure.ENTITY_PCT_PLANNED_TIME, calcMeasure.AVG_DURATION],
          [configType.SPEEDLOSS]: [calcMeasure.AVG_DURATION],
          [configType.SCRAPREASON]: [calcMeasure.ENTITY_PCT_PLANNED_TIME, calcMeasure.SCRAP_QTY_PCT, calcMeasure.SCRAP_ALT_QTY_PCT],
          [configType.TIME_USAGE]: [calcMeasure.SHIFT_TIME, calcMeasure.OPERATING_TIME],
          [configType.QUANTITY]: [
            calcMeasure.POTENTIAL_QTY,
            calcMeasure.POTENTIAL_ALT_QTY,
            calcMeasure.AVAILABILITY_LOSS_QTY,
            calcMeasure.AVAILABILITY_LOSS_ALT_QTY,
            calcMeasure.PERFORMANCE_LOSS_QTY,
            calcMeasure.PERFORMANCE_LOSS_ALT_QTY,
          ],
          [configType.CHECKLIST]: [calcMeasure.AVG_TIME],
          [configType.OEE]: [calcMeasure.OOE, calcMeasure.TEEP, calcMeasure.OPERATING_TIME, calcMeasure.SHIFT_TIME, calcMeasure.CALENDAR_TIME],
        };
        return calcValuesMap[this.configType]?.includes(header.id) ?? false;
      };
    },
    activeHeaders() {
      return (headers) => {
        const disabledSet = new Set(this.disabledParams);
        const matchesRequestParamsSet = new Set([
          ...this.reqMeasures,
          ...this.reqDimensions,
          this.granularity,
        ]);
        if (matchesRequestParamsSet.has(dimensionType.PRODUCT)) {
          matchesRequestParamsSet.add(xAxisKey.SKU);
        }
        if (this.groupBy[0] === xAxisKey.SINGLE_OPERATOR) {
          matchesRequestParamsSet.delete(dimensionType.OPERATOR);
        }
        const ret = headers.filter((header) => {
          const matchesRequestParams = matchesRequestParamsSet.has(header.id);
          const isCalcValue = this.isCalculatedValue(header);
          const allowedInModule = !header.configType || header.configType === this.configType;
          const notDisabled = !disabledSet.has(header.relatedParam);
          return notDisabled && (matchesRequestParams || isCalcValue) && allowedInModule;
        });

        if (this.granularity === 'total') {
          const index = ret.findIndex((header) => this.groupBy[0] === header.secondaryId);
          if (index > -1) {
            const removedList = ret.splice(index, 1);
            ret.unshift(...removedList);
          }
        }

        return ret;
      };
    },
    getReportLabel: () => (fieldName) => useRouteModuleStore()?.query?.[fieldName] ?? '',
    reportName() {
      return this.getReportLabel('name');
    },
    reportDescription() {
      return this.getReportLabel('description');
    },
    disabledParams() {
      const disabledParams = [];
      const disabledMap = new Map([
        [queryParam.OPERATOR_ID, !useConfigurationStore().showOperatorsReport],
        [queryParam.FACTORY_ID, !useFactoryStore().hasMultipleFactories],
      ]);
      disabledMap.forEach((isDisabled, param) => {
        if (isDisabled === true) {
          disabledParams.push(param);
        }
      });
      return disabledParams;
    },
    isTimeGranularity() {
      return timeGranularities.has(this.granularity);
    },
    reqGroupBy() {
      const currentConfigType = getGroupByMenuItemsByConfigType()?.[this.configType];
      const { isTimeGranularity } = this;

      if (this.granularity === granularityType.STARTTIME) return [granularityType.STARTTIME, dimensionType.TIMELINE_ID];
      if (this.granularity === granularityType.DUE_TIME) return [granularityType.DUE_TIME];
      const requestGroupByArgs = [];
      for (let i = 0; i < this.groupBy.length; i += 1) {
        const requestArgs = currentConfigType?.[this.groupBy[i]]?.requestGroupByArgs;
        if (requestArgs === undefined) throw new Error(`Invalid groupBy in reqGroupBy: ${this.groupBy[i]}`);
        requestArgs.forEach((arg) => requestGroupByArgs.push(arg));
      }
      if (isTimeGranularity) {
        if (requestGroupByArgs.length > 1) {
          return uniq([this.granularity, ...requestGroupByArgs.slice(1)]);
        }
        return [this.granularity];
      }
      if (!isTimeGranularity && this.configType === configType.SCRAPREASON && this.groupBy[0] === xAxisKey.ENTITY_ID) {
        return uniq(requestGroupByArgs).filter((arg) => arg !== dimensionType.SCRAP_REASON_GROUP);
      }
      return uniq(requestGroupByArgs);
    },
    chartData: (state) => state.calculatedData.filter((d) => !d.hidden) || [],
    groupByMenuItems() {
      const queryParamGroupByMap = {
        [queryParam.OPERATOR_ID]: 'singleOperator',
        [queryParam.CHECKLIST_DONE_BY_ENTITY_ID]: 'doneBy',
        [queryParam.FACTORY_ID]: 'factoryId',
      };
      const config = getGroupByMenuItemsByConfigType()[this.configType] || {};
      this.disabledParams.forEach((param) => {
        const groupByKey = queryParamGroupByMap[param];
        if (groupByKey && config[groupByKey]) {
          delete config[groupByKey];
        }
      });
      return config;
    },
  },
});

export default useReportsConfigStore;
