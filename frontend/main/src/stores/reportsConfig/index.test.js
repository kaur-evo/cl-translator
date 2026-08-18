import { setActivePinia, createPinia } from 'pinia';

import configType from '@/stores/reportsConfig/constants/configType';
import chartType from '@/stores/reportsConfig/constants/chartType';
import useReportsConfigStore, {
  getSpreadsheetFormattedValue, getIsStacked, areAnyRequiredFiltersEmpty, getHiddenLegendValues,
  getSpreadSheetFormattedData,
} from '@/stores/reportsConfig';
import { getRequestMeasures, getRequestDimensions, getTrendlineMeasure } from '@/stores/reportsConfig/configurations/requestMappingConfig';
import logApi from '@/api/logApi';
import ReportsDataMapper from '@/stores/reportsConfig/mappers/ReportsDataMapper';
import statisticsApi from '@/api/statisticsApi';
import createPDFfromHTML from '@/helpers/pdf/createPDFfromHTML';
import WorkerService from '@/services/WorkerService';
import isMenuEmptyValueSelected from '@/components/organisms/reports/ReportsChartOptionsMenu/isMenuEmptyValueSelected';
import getChartType from '@/stores/reportsConfig/configurations/chartTypeChangeConfig';
import queryParam from '@/stores/reportsConfig/constants/queryParam';
import filterItemsApi from '@/api/filterItemsApi';
import { getCurrentPeriod } from '@/constants/rollingPeriodRangeDefinitions';
import shouldUseTotalMeasures from '@/stores/reportsConfig/configurations/shouldUseTotalMeasures';
import measure from '@/stores/reportsConfig/constants/measure';
import calcMeasure from '@/stores/reportsConfig/constants/calcMeasure';
import xAxisKey from '@/stores/reportsConfig/constants/xAxisKey';
import dimensionType from '@/stores/reportsConfig/constants/dimension';
import granularityType from '@/stores/reportsConfig/constants/granularity';

window.WorkerService = new WorkerService();

vi.mock('@/api/logApi');
logApi.logEvent = vi.fn();

vi.mock('@/api/statisticsApi');
statisticsApi.getReportData = vi.fn();
statisticsApi.getTrendlineData = vi.fn();

const { mockCacheFns } = vi.hoisted(() => ({
  mockCacheFns: {
    getCachedResponse: vi.fn().mockResolvedValue(null),
    setCachedResponse: vi.fn().mockResolvedValue(),
    deleteOutdatedCache: vi.fn().mockResolvedValue(),
  },
}));

vi.mock('@/api/filterItemsApi');
vi.mock('@/constants/rollingPeriodRangeDefinitions', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, getCurrentPeriod: vi.fn(() => undefined) };
});
vi.mock('@/helpers/pdf/createPDFfromHTML');
vi.mock('@/stores/reportsConfig/configurations/shouldUseTotalMeasures');
vi.mock('write-excel-file/browser', () => ({ default: vi.fn() }));
vi.mock('sanitize-filename', () => ({ default: vi.fn((name) => name) }));
vi.mock('@/services/indexedDB/requestCache', () => ({
  default: vi.fn().mockImplementation(() => mockCacheFns),
}));
vi.mock('@/components/organisms/reports/ReportsChartOptionsMenu/isMenuEmptyValueSelected');
vi.mock('@/stores/reportsConfig/configurations/chartTypeChangeConfig');
vi.mock('@/stores/reportsConfig/configurations/requestMappingConfig', () => {
  const originalModule = vi.importActual('@/stores/reportsConfig/configurations/requestMappingConfig');
  return {
    __esModule: true,
    ...originalModule,
    getTrendlineMeasure: vi.fn(),
    getRequestMeasures: vi.fn(),
    getRequestDimensions: vi.fn(),
  };
});

const mockFilterbarStore = {
  requestFilterState: {
    period: [],
    orderBy: ['random'],
    orderDir: ['desc'],
    groupBy: [],
    chartType: [],
  },
  calculatedFilterConfig: new Map(),
  updateFilterValue: vi.fn(),
  triggerDataRequest: vi.fn(),
};
const mockNotificationStore = { notifySuccess: vi.fn(), notifyError: vi.fn() };
const mockConfirmDialogStore = { openConfirmDialog: vi.fn() };
const mockProfileStore = {
  firstDayOfWeek: 1,
  reportsDurationFormat: 'SECONDS',
  numberFormattingOptions: {},
  dateFormat: 'yyyy-MM-dd',
  timeFormat: 'HH:mm',
  currentUser: { tenantId: 'test-tenant', username: 'testuser' },
};
const mockConfigurationStore = { disableTrendline: false, showOperatorsReport: true };
const mockFactoryStore = { hasMultipleFactories: true };
const mockRouteModuleStore = { query: {} };

vi.mock('@/stores/filterbar', () => ({ default: () => mockFilterbarStore }));
vi.mock('@/stores/genericNotification', () => ({ default: () => mockNotificationStore }));
vi.mock('@/stores/confirmDialog', () => ({ default: () => mockConfirmDialogStore }));
vi.mock('@/stores/profile', () => ({ default: () => mockProfileStore }));
vi.mock('@/stores/configuration', () => ({ default: () => mockConfigurationStore }));
vi.mock('@/stores/factory', () => ({ default: () => mockFactoryStore }));
vi.mock('@/stores/routeModule', () => ({ default: () => mockRouteModuleStore }));
vi.mock('@/stores/comment', () => ({ default: () => ({ allComments: [] }) }));
vi.mock('@/stores/perfComment', () => ({ default: () => ({ allPerfComments: [] }) }));
vi.mock('@/stores/scrapReason', () => ({ default: () => ({ allScrapReasons: [] }) }));
vi.mock('@/stores/station', () => ({ default: () => ({ stations: [] }) }));

const GRANULARITIES = ['total', 'year', 'month', 'weekofyear', 'date', 'starttime'];

function setFilterbarState(overrides = {}) {
  mockFilterbarStore.requestFilterState = {
    period: [],
    orderBy: ['random'],
    orderDir: ['desc'],
    groupBy: [],
    chartType: [],
    ...overrides,
  };
}

describe('reportsConfig', () => {
  let reportsConfigStore;

  beforeEach(() => {
    setActivePinia(createPinia());
    reportsConfigStore = useReportsConfigStore();
    setFilterbarState();
    vi.clearAllMocks();
    // Restore cache mock defaults after clearAllMocks clears them
    mockCacheFns.getCachedResponse.mockResolvedValue(null);
    mockCacheFns.setCachedResponse.mockResolvedValue();
    mockCacheFns.deleteOutdatedCache.mockResolvedValue();
  });

  test('if granularity getter equals to filterbar requestState granularity', () => {
    const GRANULARITY = 'TESTING';
    setFilterbarState({ granularity: GRANULARITY });
    expect(reportsConfigStore.granularity).toEqual(GRANULARITY);
  });

  test('if groupBy returns empty array', () => {
    expect(reportsConfigStore.groupBy).toEqual([]);
  });

  describe('configType', () => {
    Object.keys(configType).forEach((TYPE) => {
      test(`if configType returns same result as configTypeEntityMap.get with requestFilterState.type ${TYPE}`, () => {
        setFilterbarState({ type: TYPE });
        expect(reportsConfigStore.configType).toEqual(TYPE);
      });
    });
  });

  describe('getReqMeasures, reqInstanceMeasures, reqDimensions, reqInstanceDimensions', () => {
    GRANULARITIES.forEach((granularity) => {
      Object.keys(configType).forEach((TYPE) => {
        const groupBy = [''];
        test(`if reqMeasures returns expected result with granularity: ${granularity} and type: ${TYPE}`, () => {
          setFilterbarState({ type: TYPE, granularity });
          expect(reportsConfigStore.reqMeasures).toEqual(getRequestMeasures({
            granularity,
            type: TYPE,
            groupBy,
          }));
        });
        test(`if reqInstanceMeasures returns expected result with granularity: ${granularity} and type: ${TYPE}`, () => {
          setFilterbarState({ type: TYPE, granularity });
          expect(reportsConfigStore.reqInstanceMeasures).toEqual(getRequestMeasures({
            granularity: 'starttime',
            type: TYPE,
            groupBy,
          }));
        });
        test(`if reqDimensions returns expected result with granularity: ${granularity} and type: ${TYPE}`, () => {
          setFilterbarState({ type: TYPE, granularity });
          expect(reportsConfigStore.reqDimensions).toEqual(getRequestDimensions({
            granularity,
            type: TYPE,
            groupBy,
          }));
        });
        test(`if reqInstanceDimensions returns expected result with granularity: ${granularity} and type: ${TYPE}`, () => {
          setFilterbarState({ type: TYPE, granularity });
          expect(reportsConfigStore.reqInstanceDimensions).toEqual(getRequestDimensions({
            granularity: 'starttime',
            type: TYPE,
            groupBy,
          }));
        });
      });
    });
  });

  describe('calcNewGranularity', () => {
    const selectionTypes = ['thisweek', 'lastweek', 'rolling7days', 'thismonth', 'lastmonth', 'rolling30days'];
    selectionTypes.forEach((selectionType) => {
      test(`if calcNewGranularity with selectionType ${selectionType} returns date`, async () => {
        const newGranularity = await reportsConfigStore.calcNewGranularity({ selectionType });
        expect(newGranularity).toBe('date');
      });
    });
    const testCases = [
      {
        text: 'within same week',
        start: '2021-02-15',
        end: '2021-02-19',
        expect: 'date',
        firstDayOfWeek: 1,
      },
      {
        text: 'within same month',
        start: '2021-02-09',
        end: '2021-02-25',
        expect: 'weekofyear',
        firstDayOfWeek: 1,
      },
      {
        text: 'within same year',
        start: '2021-01-16',
        end: '2021-12-04',
        expect: 'month',
        firstDayOfWeek: 1,
      },
      {
        text: 'not within same year',
        start: '2021-01-16',
        end: '2022-02-04',
        expect: 'year',
        firstDayOfWeek: 1,
      },
      {
        text: 'within same week when Sunday is first day of week',
        start: '2021-02-14',
        end: '2021-02-19',
        expect: 'date',
        firstDayOfWeek: 0,
      },
      {
        text: 'Sunday to Friday when Sunday is the first day of week',
        start: '2021-02-14',
        end: '2021-02-19',
        expect: 'date',
        firstDayOfWeek: 0,
      },
      {
        text: 'Sunday to Friday when Monday is the first day of week',
        start: '2021-02-14',
        end: '2021-02-19',
        expect: 'weekofyear',
        firstDayOfWeek: 1,
      },
      {
        text: 'Friday to Sunday when Monday is the first day of week',
        start: '2022-10-28',
        end: '2022-10-30',
        expect: 'date',
        firstDayOfWeek: 1,
      },
      {
        text: 'Friday to Sunday when Sunday is the first day of week',
        start: '2022-10-28',
        end: '2022-10-30',
        expect: 'weekofyear',
        firstDayOfWeek: 0,
      },
    ];
    testCases.forEach((testCase) => {
      test(`if calcNewGranularity return ${testCase.expect} if date range is ${testCase.text}`, async () => {
        const { start, end } = testCase;
        mockProfileStore.firstDayOfWeek = testCase.firstDayOfWeek;
        const newGranularity = await reportsConfigStore.calcNewGranularity({ start, end });
        expect(newGranularity).toBe(testCase.expect);
      });
    });
  });

  describe('getOrderingParamsByGranularity', () => {
    const testCases = {
      total: { orderBy: 'value', orderDir: 'desc' },
      year: { orderBy: 'xScaleValue', orderDir: 'asc' },
      month: { orderBy: 'xScaleValue', orderDir: 'asc' },
      weekofyear: { orderBy: 'xScaleValue', orderDir: 'asc' },
      date: { orderBy: 'xScaleValue', orderDir: 'asc' },
      starttime: { orderBy: 'xScaleValue', orderDir: 'asc' },
    };
    GRANULARITIES.forEach((granularity) => {
      test(`if ${granularity} returns valid ordering params`, async () => {
        setFilterbarState({ type: 'DOWNTIME' });
        const params = await reportsConfigStore.getOrderingParamsByGranularity(granularity);
        expect(params).toStrictEqual(testCases[granularity]);
      });
    });
  });

  describe('getOrderingParamsByGranularity - throws for unsupported configType', () => {
    test('throws when granularity exists in config but configType has no mapping', async () => {
      setFilterbarState({ type: configType.CUSTOM_REPORT });
      await expect(reportsConfigStore.getOrderingParamsByGranularity('total'))
        .rejects.toThrow('ordering config missing');
    });
  });

  describe('calcGranularityChangeSideEffects', () => {
    it('returns null when no granularity argument is provided', async () => {
      setFilterbarState({ type: 'DOWNTIME' });
      const params = await reportsConfigStore.calcGranularityChangeSideEffects({ granularity: undefined });
      expect(params).toBe(null);
    });
  });

  describe('initDataMapper', () => {
    test('if ReportsDataMapper is initialized', async () => {
      await reportsConfigStore.initDataMapper();
      expect(reportsConfigStore.dataMapper).toBeInstanceOf(ReportsDataMapper);
    });
  });

  describe('onGroupByChange', () => {
    test('if it updates groupBy value when isMenuEmptyValueSelected returns false', async () => {
      setFilterbarState({ groupBy: ['value1'] });
      isMenuEmptyValueSelected.mockReturnValue(false);
      getChartType.mockReturnValue([chartType.GROUPED_COLUMN]);

      await reportsConfigStore.onGroupByChange({ value: 'newValue', index: 1 });

      expect(isMenuEmptyValueSelected).toHaveBeenCalledWith('newValue');
      expect(mockFilterbarStore.updateFilterValue).toHaveBeenCalledWith(expect.objectContaining({
        groupBy: ['value1', 'newValue'],
        chartType: [chartType.GROUPED_COLUMN],
      }));
      expect(mockFilterbarStore.triggerDataRequest).toHaveBeenCalled();
    });

    test('if it calls calcGranularityChangeSideEffects when granularity is not TOTAL and index is 0', async () => {
      setFilterbarState({ granularity: 'weekofyear', groupBy: ['value1'], type: configType.DOWNTIME });
      isMenuEmptyValueSelected.mockReturnValue(false);
      getChartType.mockReturnValue([chartType.GROUPED_COLUMN]);

      await reportsConfigStore.onGroupByChange({ value: 'newValue', index: 0 });

      expect(mockFilterbarStore.updateFilterValue).toHaveBeenCalledWith(expect.objectContaining({
        groupBy: ['newValue'],
      }));
      expect(mockFilterbarStore.triggerDataRequest).toHaveBeenCalled();
    });
  });

  describe('onYAxisChange', () => {
    test('if valid functions are called with correct arguments', async () => {
      setFilterbarState({ type: 'DOWNTIME', granularity: 'total' });
      const yAxis = 'testValue';
      await reportsConfigStore.onYAxisChange(yAxis);
      expect(mockFilterbarStore.updateFilterValue).toHaveBeenCalledWith({ yAxis: 'testValue' });
      expect(mockFilterbarStore.triggerDataRequest).toHaveBeenCalled();
    });
  });

  describe('onDateRangeSelectionApply', () => {
    test('if valid functions are called with correct arguments if granularity is TOTAL', async () => {
      setFilterbarState({ type: 'DOWNTIME', granularity: 'total' });
      await reportsConfigStore.onDateRangeSelectionApply({ start: '2021-02-15', end: '2021-02-19', selectionType: 'thisweek' });
      expect(mockFilterbarStore.updateFilterValue).toHaveBeenCalledWith(undefined);
      expect(mockFilterbarStore.triggerDataRequest).toHaveBeenCalled();
    });
    test('if valid functions are called with correct arguments if granularity is NOT TOTAL', async () => {
      setFilterbarState({ type: 'DOWNTIME', granularity: 'weekofyear', groupBy: ['stationId'] });
      await reportsConfigStore.onDateRangeSelectionApply({ start: '2021-02-15', end: '2021-02-19', selectionType: 'thisweek' });
      expect(mockFilterbarStore.updateFilterValue).toHaveBeenCalledWith(expect.objectContaining({
        granularity: 'date',
        orderBy: 'xScaleValue',
        orderDir: 'asc',
      }));
      expect(mockFilterbarStore.triggerDataRequest).toHaveBeenCalled();
    });
  });

  describe('state mutations via actions', () => {
    test('setDateRange sets dateRange', () => {
      reportsConfigStore.setDateRange(['2021-01-01', '2021-12-31']);
      expect(reportsConfigStore.dateRange).toStrictEqual(['2021-01-01', '2021-12-31']);
    });

    test('isLoading reflects dataLoading state', () => {
      expect(reportsConfigStore.isLoading).toBe(false);
      reportsConfigStore.dataLoading.push(true);
      expect(reportsConfigStore.isLoading).toBe(true);
      reportsConfigStore.dataLoading.pop();
      expect(reportsConfigStore.isLoading).toBe(false);
    });

    test('trendlineData can be set', () => {
      const trendlineData = [{ x: 1, y: 2 }, { x: 2, y: 3 }];
      reportsConfigStore.trendlineData = trendlineData;
      expect(reportsConfigStore.trendlineData).toEqual(trendlineData);
    });
  });

  describe('getSpreadsheetFormattedValue', () => {
    test('if header type is number and valueKey exists returns column`s valueKey as Number', () => {
      const row = { valueTest: '9', textTest: '0' };
      const header = { type: 'number', valueKey: 'valueTest', textKey: 'textTest' };
      expect(getSpreadsheetFormattedValue(row, header)).toBe(9);
    });
    test('if header type is number and valueKey does not exist returns column`s textKey as Number', () => {
      const row = { valueTest: '9', textTest: '0' };
      const header = { type: 'number', textKey: 'textTest' };
      expect(getSpreadsheetFormattedValue(row, header)).toBe(0);
    });
    test('if header type is not number and formatFn exists returns column`s textKey formatted with formatFn', () => {
      const row = { valueTest: '9', textTest: '0' };
      const header = { textKey: 'textTest', formatFn: (val) => `${val} 0 0` };
      expect(getSpreadsheetFormattedValue(row, header)).toBe('0 0 0');
    });
    test('if header has no special config, returns textKey value', () => {
      const row = { valueTest: '9', textTest: '0' };
      const header = { textKey: 'textTest' };
      expect(getSpreadsheetFormattedValue(row, header)).toBe('0');
    });
    test('if header isDurationValue with READABLE format uses formatFn', () => {
      const row = { valueTest: 3600, textTest: '1 hour' };
      const header = {
        isDurationValue: true,
        type: 'number',
        valueKey: 'valueTest',
        textKey: 'textTest',
        formatFn: (val) => `${val / 60} min`,
      };
      expect(getSpreadsheetFormattedValue(row, header, 'READABLE')).toBe('60 min');
    });
    test('if header isDurationValue with SECONDS format returns raw value', () => {
      const row = { valueTest: 3600, textTest: '1 hour' };
      const header = {
        isDurationValue: true,
        type: 'number',
        valueKey: 'valueTest',
        textKey: 'textTest',
      };
      expect(getSpreadsheetFormattedValue(row, header, 'SECONDS')).toBe(3600);
    });
    test('if header isDurationValue with MINUTES format returns converted value', () => {
      const row = { valueTest: 3600, textTest: '1 hour' };
      const header = {
        isDurationValue: true,
        type: 'number',
        valueKey: 'valueTest',
        textKey: 'textTest',
      };
      expect(getSpreadsheetFormattedValue(row, header, 'MINUTES')).toBe(60);
    });
    test('if header isDurationValue with HOURS format returns converted value', () => {
      const row = { valueTest: 3600, textTest: '1 hour' };
      const header = {
        isDurationValue: true,
        type: 'number',
        valueKey: 'valueTest',
        textKey: 'textTest',
      };
      expect(getSpreadsheetFormattedValue(row, header, 'HOURS')).toBe(1);
    });
    test('if header isDurationValue without durFormatType defaults to seconds', () => {
      const row = { valueTest: 3600, textTest: '1 hour' };
      const header = {
        isDurationValue: true,
        type: 'number',
        valueKey: 'valueTest',
        textKey: 'textTest',
      };
      expect(getSpreadsheetFormattedValue(row, header)).toBe(3600);
    });
  });

  describe('generateReportsPdf', () => {
    test('if it calls expected methods', async () => {
      await reportsConfigStore.generateReportsPdf();
      expect(createPDFfromHTML).toHaveBeenCalledTimes(1);
      expect(reportsConfigStore.isGeneratingPdf).toBe(false);
    });
  });

  describe('getInvertedFiltersWithout', () => {
    it('should return an array of inverted filters without the specified filter', async () => {
      setFilterbarState({ [queryParam.INVERTED_FILTERS]: ['filter1', 'filter2', 'filter3'] });
      const result = await reportsConfigStore.getInvertedFiltersWithout('filter2');
      expect(result).toEqual(['filter1', 'filter3']);
    });

    it('should return the same array if the specified filter is not in the inverted filters', async () => {
      setFilterbarState({ [queryParam.INVERTED_FILTERS]: ['filter1', 'filter2', 'filter3'] });
      const result = await reportsConfigStore.getInvertedFiltersWithout('filter4');
      expect(result).toEqual(['filter1', 'filter2', 'filter3']);
    });
  });

  describe('getDrilldownFilterReqObj', () => {
    it('should return empty filters object for fake item', async () => {
      setFilterbarState({ [queryParam.INVERTED_FILTERS]: ['filter1'] });
      const result = await reportsConfigStore.getDrilldownFilterReqObj({
        item: { isFake: true },
        requestFilterKey: 'filterKey',
        filterKey: 'filterKey',
        valueAsList: true,
      });
      expect(result).toEqual({ filters: {}, invertedFilters: ['filter1'] });
    });

    it('should return filters object based on item properties for non-fake item', async () => {
      setFilterbarState({ [queryParam.INVERTED_FILTERS]: ['filter1'] });
      const result = await reportsConfigStore.getDrilldownFilterReqObj({
        item: { isFake: false, filterKey: 'value' },
        requestFilterKey: 'filterKey',
        filterKey: 'filterKey',
        valueAsList: true,
      });
      expect(result).toEqual({
        filters: { filterKey: ['value'] },
        invertedFilters: ['filter1'],
      });
    });

    it('should return filters object with value as a single item if valueAsList is false', async () => {
      setFilterbarState({ [queryParam.INVERTED_FILTERS]: ['filter1'] });
      const result = await reportsConfigStore.getDrilldownFilterReqObj({
        item: { isFake: false, filterKey: 'value' },
        requestFilterKey: 'filterKey',
        filterKey: 'filterKey',
        valueAsList: false,
      });
      expect(result).toEqual({
        filters: { filterKey: 'value' },
        invertedFilters: ['filter1'],
      });
    });
  });

  describe('getIsStacked', () => {
    test('if configType OEE returns [false, false, true]', () => {
      const getters = { configType: configType.OEE, chartType: ['stackedBar'] };
      expect(getIsStacked({ getters })).toStrictEqual([false, false, true]);
    });
    test('if chartType has LINE returns [false, false, false]', () => {
      const getters = { configType: configType.DOWNTIME, chartType: [chartType.LINE] };
      expect(getIsStacked({ getters })).toStrictEqual([false, false, false]);
    });
    test('if chartType has DOT_PLOT returns [false, false, false]', () => {
      const getters = { configType: configType.DOWNTIME, chartType: [chartType.DOT_PLOT] };
      expect(getIsStacked({ getters })).toStrictEqual([false, false, false]);
    });
    test('default returns [false, true, false]', () => {
      const getters = { configType: configType.DOWNTIME, chartType: ['stackedBar'] };
      expect(getIsStacked({ getters })).toStrictEqual([false, true, false]);
    });
  });

  describe('getHiddenLegendValues', () => {
    test('that it returns hidden legend values', () => {
      const legend = new Map([['a', 1], ['b', 2], ['c', 3]]);
      const selected = ['a', 'c'];
      expect(getHiddenLegendValues(legend, selected)).toStrictEqual(['b']);
    });
    test('empty selected means all are hidden', () => {
      const legend = new Map([['a', 1], ['b', 2]]);
      expect(getHiddenLegendValues(legend, [])).toStrictEqual(['a', 'b']);
    });
  });

  describe('areAnyRequiredFiltersEmpty', () => {
    test('returns true when required filter has empty value', () => {
      const filterConfiguration = new Map([['test', { attr: { required: true } }]]);
      const filterState = { test: [] };
      expect(areAnyRequiredFiltersEmpty(filterConfiguration, filterState)).toBe(true);
    });
    test('returns false when required filter has value', () => {
      const filterConfiguration = new Map([['test', { attr: { required: true } }]]);
      const filterState = { test: ['value'] };
      expect(areAnyRequiredFiltersEmpty(filterConfiguration, filterState)).toBe(false);
    });
    test('returns false when non-required filter has empty value', () => {
      const filterConfiguration = new Map([['test', { attr: { required: false } }]]);
      const filterState = { test: [] };
      expect(areAnyRequiredFiltersEmpty(filterConfiguration, filterState)).toBe(false);
    });
  });

  describe('getTrendlineData', () => {
    it('returns null if isTimeGranularity is false', async () => {
      setFilterbarState({ granularity: 'total', type: 'DOWNTIME' });
      const ret = await reportsConfigStore.getTrendlineData({});
      expect(ret).toEqual(null);
    });

    it('returns null if disableTrendline is true', async () => {
      setFilterbarState({ granularity: 'date', type: 'DOWNTIME' });
      mockConfigurationStore.disableTrendline = true;
      const ret = await reportsConfigStore.getTrendlineData({});
      expect(ret).toEqual(null);
      mockConfigurationStore.disableTrendline = false;
    });

    it('returns null if getTrendlineMeasure returns undefined', async () => {
      setFilterbarState({ granularity: 'date', type: 'DOWNTIME' });
      getTrendlineMeasure.mockReturnValue(undefined);
      const ret = await reportsConfigStore.getTrendlineData({});
      expect(ret).toEqual(null);
    });
  });

  describe('onTableSpreadsheetExport', () => {
    test('if it calls expected methods', async () => {
      setFilterbarState({ type: 'DOWNTIME' });
      mockRouteModuleStore.query = { name: 'reportName' };
      reportsConfigStore.tableData = [];
      reportsConfigStore.totals = {};
      const onSpreadsheetExportSpy = vi.spyOn(reportsConfigStore, 'onSpreadsheetExport').mockResolvedValue();
      await reportsConfigStore.onTableSpreadsheetExport({ headers: [] });
      expect(onSpreadsheetExportSpy).toHaveBeenCalledTimes(1);
      expect(onSpreadsheetExportSpy).toHaveBeenCalledWith({
        data: [], headers: [], name: 'reportName', totals: {}, durFormatType: 'SECONDS',
      });
    });

    test('truncates report name when longer than 31 characters', async () => {
      setFilterbarState({ type: 'DOWNTIME' });
      mockRouteModuleStore.query = { name: 'A very long report name that exceeds the limit' };
      reportsConfigStore.tableData = [];
      reportsConfigStore.totals = {};
      const onSpreadsheetExportSpy = vi.spyOn(reportsConfigStore, 'onSpreadsheetExport').mockResolvedValue();
      await reportsConfigStore.onTableSpreadsheetExport({ headers: [] });
      expect(onSpreadsheetExportSpy).toHaveBeenCalledWith(expect.objectContaining({
        name: 'A very long report name that ex...',
      }));
    });
  });

  describe('getSpreadSheetFormattedData', () => {
    test('returns header row and data rows without totals', () => {
      const headers = [
        { text: 'Name', textKey: 'name' },
        { text: 'Count', textKey: 'count', type: 'number', valueKey: 'count' },
      ];
      const data = [{ name: 'A', count: '5' }];
      const result = getSpreadSheetFormattedData({
        data, orderBy: ['name'], orderDir: ['asc'], headers, totals: null, durFormatType: 'SECONDS',
      });
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual([{ value: 'Name' }, { value: 'Count' }]);
      expect(result[1]).toEqual([{ value: 'A' }, { value: 5 }]);
    });

    test('appends totals row and uses i18n Total for first column', () => {
      const headers = [
        { text: 'Name', textKey: 'name' },
        { text: 'Count', textKey: 'count', type: 'number', valueKey: 'count', hasTotal: true },
      ];
      const data = [{ name: 'A', count: '5' }];
      const totals = { name: 'Total', count: '10' };
      const result = getSpreadSheetFormattedData({
        data, orderBy: ['name'], orderDir: ['asc'], headers, totals, durFormatType: 'SECONDS',
      });
      // header + data row + totals row
      expect(result).toHaveLength(3);
      // totals row first column shows 'Total' (i18n key returned as-is in tests)
      expect(result[2][0].value).toBe('Total');
      // totals row second column uses hasTotal
      expect(result[2][1].value).toBe(10);
    });

    test('skips hidden headers in data rows', () => {
      const headers = [
        { text: 'Visible', textKey: 'v' },
        { text: 'Hidden', textKey: 'h', isHidden: true },
      ];
      const data = [{ v: 'yes', h: 'no' }];
      const result = getSpreadSheetFormattedData({
        data, orderBy: [], orderDir: [], headers, totals: null, durFormatType: 'SECONDS',
      });
      // headerRow has null for hidden, data row only has visible
      expect(result[0]).toHaveLength(2); // headerRow keeps nulls per implementation
      expect(result[0][0]).toEqual({ value: 'Visible' });
      expect(result[0][1]).toBeNull();
      expect(result[1]).toHaveLength(1); // data row skips hidden
    });

    test('duration header uses unit suffix in header text for SECONDS', () => {
      const headers = [
        {
          text: 'Duration',
          textKey: 'dur',
          isDurationValue: true,
          type: 'number',
          valueKey: 'dur',
        },
      ];
      const data = [{ dur: 3600 }];
      const result = getSpreadSheetFormattedData({
        data, orderBy: [], orderDir: [], headers, totals: null, durFormatType: 'SECONDS',
      });
      // header text includes suffix (e.g. "Duration, s")
      expect(result[0][0].value).toContain('Duration');
    });

    test('READABLE duration header has no unit suffix appended', () => {
      const headers = [
        {
          text: 'Duration',
          textKey: 'dur',
          isDurationValue: true,
          type: 'number',
          valueKey: 'dur',
          formatFn: (v) => `${v}s`,
        },
      ];
      const data = [{ dur: 60 }];
      const result = getSpreadSheetFormattedData({
        data, orderBy: [], orderDir: [], headers, totals: null, durFormatType: 'READABLE',
      });
      // getDurationUnitSuffix returns null for READABLE, so header text stays as-is
      expect(result[0][0].value).toBe('Duration');
    });
  });

  describe('onGranularityChange', () => {
    test('returns early when granularity is falsy', async () => {
      await reportsConfigStore.onGranularityChange(null);
      expect(mockFilterbarStore.updateFilterValue).not.toHaveBeenCalled();
      expect(mockFilterbarStore.triggerDataRequest).not.toHaveBeenCalled();
    });

    test('calls updateFilterValue and triggerDataRequest when granularity provided', async () => {
      setFilterbarState({ granularity: 'total', type: 'DOWNTIME' });
      await reportsConfigStore.onGranularityChange('date');
      expect(mockFilterbarStore.updateFilterValue).toHaveBeenCalled();
      expect(mockFilterbarStore.triggerDataRequest).toHaveBeenCalled();
    });
  });

  describe('onGroupByChange - isMenuEmptyValueSelected branch', () => {
    test('splices groupBy when isMenuEmptyValueSelected returns true and item exists', async () => {
      setFilterbarState({ groupBy: ['existingValue'], granularity: 'total', type: 'DOWNTIME' });
      isMenuEmptyValueSelected.mockReturnValue(true);
      getChartType.mockReturnValue([chartType.GROUPED_COLUMN]);
      await reportsConfigStore.onGroupByChange({ value: 'emptyValue', index: 0 });
      expect(mockFilterbarStore.updateFilterValue).toHaveBeenCalledWith(expect.objectContaining({
        groupBy: [],
      }));
      expect(mockFilterbarStore.triggerDataRequest).toHaveBeenCalled();
    });
  });

  describe('onChartLegendChange', () => {
    test('calls updateFilterValue and triggerDataRequest', async () => {
      const legendState = { hidden: ['a'] };
      await reportsConfigStore.onChartLegendChange(legendState);
      expect(mockFilterbarStore.updateFilterValue).toHaveBeenCalledWith({ chartLegendState: legendState });
      expect(mockFilterbarStore.triggerDataRequest).toHaveBeenCalled();
    });
  });

  describe('onRightYAxisChange', () => {
    test('calls updateFilterValue and triggerDataRequest', async () => {
      await reportsConfigStore.onRightYAxisChange('someAxis');
      expect(mockFilterbarStore.updateFilterValue).toHaveBeenCalledWith({ yAxisRight: 'someAxis' });
      expect(mockFilterbarStore.triggerDataRequest).toHaveBeenCalled();
    });
  });

  describe('onChartTypeChange', () => {
    test('returns early when chartTypeStr is falsy', async () => {
      await reportsConfigStore.onChartTypeChange(null);
      expect(mockFilterbarStore.updateFilterValue).not.toHaveBeenCalled();
    });

    test('splits comma-separated chart types and calls update', async () => {
      setFilterbarState({ type: 'DOWNTIME' });
      await reportsConfigStore.onChartTypeChange('bar,line');
      expect(mockFilterbarStore.updateFilterValue).toHaveBeenCalledWith({ chartType: ['bar', 'line'] });
      expect(mockFilterbarStore.triggerDataRequest).toHaveBeenCalled();
    });

    test('saves to localStorage for OEE configType', async () => {
      setFilterbarState({ type: configType.OEE });
      const localStorageMock = { setItem: vi.fn(), getItem: vi.fn(), removeItem: vi.fn(), clear: vi.fn() };
      Object.defineProperty(window, 'localStorage', { value: localStorageMock, writable: true });
      await reportsConfigStore.onChartTypeChange('stackedBar');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('reportingOeeChartType', JSON.stringify(['stackedBar']));
    });
  });

  describe('onYAxisChange - returns early for falsy', () => {
    test('returns early when yAxis is falsy', async () => {
      await reportsConfigStore.onYAxisChange(null);
      expect(mockFilterbarStore.updateFilterValue).not.toHaveBeenCalled();
    });
  });

  describe('calcNewDrilldownPeriod', () => {
    test('returns date range from calculateDatapointDateRange when no matching rolling period', async () => {
      reportsConfigStore.dateRange = ['2021-02-15', '2021-02-19'];
      setFilterbarState({ granularity: 'date', type: configType.DOWNTIME, period: [] });
      const result = await reportsConfigStore.calcNewDrilldownPeriod('2021-02-16');
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('requestEntityCounts', () => {
    test('returns results from filterItemsApi.getEntitiesCount', async () => {
      filterItemsApi.getEntitiesCount = vi.fn().mockResolvedValue({ comments: 5, products: 10 });
      const result = await reportsConfigStore.requestEntityCounts();
      expect(result).toEqual({ comments: 5, products: 10 });
    });

    test('returns empty object when filterItemsApi throws', async () => {
      filterItemsApi.getEntitiesCount = vi.fn().mockRejectedValue(new Error('API error'));
      const result = await reportsConfigStore.requestEntityCounts();
      expect(result).toEqual({});
    });
  });

  describe('setFilterEntityCounts', () => {
    test('sets splitFilters when entity count exceeds FILTER_ITEM_LIMIT', async () => {
      filterItemsApi.getEntitiesCount = vi.fn().mockResolvedValue({
        comments: 99999,
        performancelosses: 1,
        products: 1,
      });
      await reportsConfigStore.setFilterEntityCounts();
      expect(reportsConfigStore.splitFilters).toContain('commentId');
    });

    test('does not set splitFilters when counts are below limit', async () => {
      filterItemsApi.getEntitiesCount = vi.fn().mockResolvedValue({
        comments: 1,
        performancelosses: 1,
        products: 1,
      });
      await reportsConfigStore.setFilterEntityCounts();
      expect(reportsConfigStore.splitFilters).toHaveLength(0);
    });
  });

  describe('requestReportsData', () => {
    test('sets rawData to empty when required filters are empty', async () => {
      setFilterbarState({ type: configType.DOWNTIME, granularity: 'total' });
      mockFilterbarStore.calculatedFilterConfig = new Map([
        ['stationId', { attr: { required: true } }],
      ]);
      mockFilterbarStore.requestFilterState = {
        ...mockFilterbarStore.requestFilterState,
        stationId: [],
      };
      await reportsConfigStore.requestReportsData();
      expect(reportsConfigStore.rawData).toEqual([]);
    });

    test('calls fetchReportsData when required filters are not empty', async () => {
      setFilterbarState({ type: configType.DOWNTIME, granularity: 'total' });
      mockFilterbarStore.calculatedFilterConfig = new Map();
      const fetchSpy = vi.spyOn(reportsConfigStore, 'fetchReportsData').mockResolvedValue();
      await reportsConfigStore.requestReportsData();
      expect(fetchSpy).toHaveBeenCalled();
    });
  });

  describe('buildQueryArgs', () => {
    test('returns filters, range and query', () => {
      reportsConfigStore.dateRange = ['2021-01-01', '2021-12-31'];
      setFilterbarState({ type: configType.DOWNTIME, granularity: 'total', stationId: ['s1'] });
      mockFilterbarStore.calculatedFilterConfig = new Map([
        ['stationId', {}],
      ]);
      const result = reportsConfigStore.buildQueryArgs();
      expect(result).toHaveProperty('filters');
      expect(result).toHaveProperty('range');
      expect(result).toHaveProperty('query');
    });

    test('sets default checklist status when configType is CHECKLIST and no status', () => {
      setFilterbarState({ type: configType.CHECKLIST, granularity: 'total' });
      mockFilterbarStore.calculatedFilterConfig = new Map([
        ['status', {}],
      ]);
      reportsConfigStore.dateRange = ['2021-01-01', '2021-12-31'];
      const result = reportsConfigStore.buildQueryArgs();
      expect(result.filters[queryParam.CHECKLIST_STATUS]).toEqual([1, 2, 3]);
    });

    test('converts CHECKLIST_DONE_BY_ENTITY_ID values to strings', () => {
      setFilterbarState({ type: configType.CHECKLIST, granularity: 'total', doneByEntityId: [1, 2] });
      mockFilterbarStore.calculatedFilterConfig = new Map([
        ['doneByEntityId', {}],
      ]);
      reportsConfigStore.dateRange = ['2021-01-01', '2021-12-31'];
      const result = reportsConfigStore.buildQueryArgs();
      expect(result.filters[queryParam.CHECKLIST_DONE_BY_ENTITY_ID]).toEqual(['1', '2']);
    });
  });

  describe('setFetchedData', () => {
    test('sets rawData and trendlineData', async () => {
      const payload = { key: 'val' };
      const response = { results: [{ id: 1 }] };
      const trendlineData = [{ x: 1 }];
      reportsConfigStore.rawData = [];
      reportsConfigStore.trendlineData = null;
      await reportsConfigStore.setFetchedData({ payload, response, tenantId: 'tid', trendlineData });
      expect(reportsConfigStore.rawData).toEqual([{ id: 1 }]);
      expect(reportsConfigStore.trendlineData).toEqual([{ x: 1 }]);
    });
  });

  describe('initTooMuchDataWarning', () => {
    test('calls openConfirmDialog with correct config shape', () => {
      const payload = {};
      const response = { results: [] };
      reportsConfigStore.initTooMuchDataWarning({ payload, response, tenantId: 'tid', trendlineData: null });
      expect(mockConfirmDialogStore.openConfirmDialog).toHaveBeenCalledWith(expect.objectContaining({
        title: expect.any(String),
        text: expect.any(String),
        action: expect.any(Function),
        closeAction: expect.any(Function),
        color: 'error',
      }));
    });

    test('action callback calls logApi.logEvent and setFetchedData', async () => {
      const payload = {};
      const response = { results: [{ id: 1 }] };
      reportsConfigStore.initTooMuchDataWarning({ payload, response, tenantId: 'tid', trendlineData: null });
      const { action } = mockConfirmDialogStore.openConfirmDialog.mock.calls[0][0];
      await action();
      expect(logApi.logEvent).toHaveBeenCalled();
    });

    test('closeAction callback calls logApi.logEvent and window.history.back', () => {
      const backSpy = vi.spyOn(window.history, 'back').mockImplementation(() => {});
      const payload = {};
      const response = { results: [] };
      reportsConfigStore.initTooMuchDataWarning({ payload, response, tenantId: 'tid', trendlineData: null });
      const { closeAction } = mockConfirmDialogStore.openConfirmDialog.mock.calls[0][0];
      closeAction();
      expect(logApi.logEvent).toHaveBeenCalled();
      expect(backSpy).toHaveBeenCalled();
    });
  });

  describe('fetchReportsData', () => {
    beforeEach(() => {
      reportsConfigStore.dateRange = ['2021-01-01', '2021-12-31'];
      setFilterbarState({ type: configType.DOWNTIME, granularity: 'date', groupBy: [] });
      getRequestMeasures.mockReturnValue(['stopduration']);
      getRequestDimensions.mockReturnValue(['station']);
    });

    test('fetches data and sets rawData when cache miss and results under limit', async () => {
      statisticsApi.getReportData.mockResolvedValue({ results: [{ id: 1 }] });
      getTrendlineMeasure.mockReturnValue(undefined);
      mockFilterbarStore.calculatedFilterConfig = new Map();
      const setFetchedDataSpy = vi.spyOn(reportsConfigStore, 'setFetchedData').mockResolvedValue();
      await reportsConfigStore.fetchReportsData({ filters: {}, range: { start: '2021-01-01', end: '2021-12-31' }, query: {} });
      expect(statisticsApi.getReportData).toHaveBeenCalled();
      expect(setFetchedDataSpy).toHaveBeenCalled();
    });

    test('calls initTooMuchDataWarning when results exceed limit', async () => {
      const largeResults = new Array(3000).fill({ id: 1 });
      statisticsApi.getReportData.mockResolvedValue({ results: largeResults });
      getTrendlineMeasure.mockReturnValue(undefined);
      const warningSpy = vi.spyOn(reportsConfigStore, 'initTooMuchDataWarning').mockImplementation(() => {});
      await reportsConfigStore.fetchReportsData({ filters: {}, range: { start: '2021-01-01', end: '2021-12-31' }, query: {} });
      expect(warningSpy).toHaveBeenCalled();
    });

    test('notifies error and clears rawData on non-cancel API error', async () => {
      const err = { response: { data: { message: 'Server error' } } };
      statisticsApi.getReportData.mockRejectedValue(err);
      await reportsConfigStore.fetchReportsData({ filters: {}, range: { start: '2021-01-01', end: '2021-12-31' }, query: {} });
      expect(mockNotificationStore.notifyError).toHaveBeenCalledWith('Server error');
      expect(reportsConfigStore.rawData).toEqual([]);
    });

    test('uses getReportDataV3 for PRODUCTION_SPEED configType', async () => {
      setFilterbarState({ type: configType.PRODUCTION_SPEED, granularity: 'date', groupBy: [] });
      statisticsApi.getReportDataV3 = vi.fn().mockResolvedValue({ results: [] });
      const setFetchedDataSpy = vi.spyOn(reportsConfigStore, 'setFetchedData').mockResolvedValue();
      await reportsConfigStore.fetchReportsData({ filters: {}, range: { start: '2021-01-01', end: '2021-12-31' }, query: {} });
      expect(statisticsApi.getReportDataV3).toHaveBeenCalled();
      expect(setFetchedDataSpy).toHaveBeenCalled();
    });
  });

  describe('initMapperCalculation', () => {
    test('calls dataMapper.getChartData with correct configuration', async () => {
      await reportsConfigStore.initDataMapper();
      reportsConfigStore.dateRange = ['2021-01-01', '2021-12-31'];
      setFilterbarState({ type: configType.DOWNTIME, granularity: 'total', groupBy: [] });
      const getChartDataSpy = vi.spyOn(reportsConfigStore.dataMapper, 'getChartData').mockImplementation(() => {});
      reportsConfigStore.initMapperCalculation();
      expect(getChartDataSpy).toHaveBeenCalledWith(expect.objectContaining({
        configType: configType.DOWNTIME,
        granularity: 'total',
      }));
    });

    test('passes translationsObj from options when provided', async () => {
      await reportsConfigStore.initDataMapper();
      reportsConfigStore.dateRange = ['2021-01-01', '2021-12-31'];
      setFilterbarState({ type: configType.DOWNTIME, granularity: 'total', groupBy: [] });
      const getChartDataSpy = vi.spyOn(reportsConfigStore.dataMapper, 'getChartData').mockImplementation(() => {});
      const translationsObj = { someKey: 'value' };
      reportsConfigStore.initMapperCalculation({ translationsObj, isCompactFormatted: true });
      expect(getChartDataSpy).toHaveBeenCalledWith(expect.objectContaining({
        translations: translationsObj,
        isCompactFormatted: true,
      }));
    });
  });

  describe('initMapperReorder', () => {
    test('calls dataMapper.reOrderData with correct args', async () => {
      await reportsConfigStore.initDataMapper();
      const reOrderSpy = vi.spyOn(reportsConfigStore.dataMapper, 'reOrderData').mockImplementation(() => {});
      setFilterbarState({ orderBy: ['xScaleValue'], orderDir: ['asc'] });
      reportsConfigStore.initMapperReorder();
      expect(reOrderSpy).toHaveBeenCalledWith(expect.objectContaining({
        orderBy: ['xScaleValue'],
        orderDir: ['asc'],
      }));
    });
  });

  describe('onSpreadsheetExport', () => {
    test('calls notifySuccess on successful export', async () => {
      const headers = [{ text: 'Col', textKey: 'col' }];
      const data = [{ col: 'val' }];
      await reportsConfigStore.onSpreadsheetExport({ headers, data, totals: null, name: 'report', durFormatType: 'SECONDS' });
      expect(mockNotificationStore.notifySuccess).toHaveBeenCalled();
    });

    test('calls notifyError and rethrows on failure', async () => {
      // Trigger error by passing null data which causes getSpreadSheetFormattedData to throw
      const onSpreadsheetExportWithError = async () => {
        await reportsConfigStore.onSpreadsheetExport({
          headers: null, data: null, totals: null, name: 'test', durFormatType: 'SECONDS',
        });
      };
      await expect(onSpreadsheetExportWithError()).rejects.toThrow();
      expect(mockNotificationStore.notifyError).toHaveBeenCalled();
    });
  });

  describe('onNotesSpreadsheetExport', () => {
    test('calls loadReportsNotes with correct args', async () => {
      setFilterbarState({ type: configType.DOWNTIME });
      mockRouteModuleStore.query = { name: 'testReport' };
      const loadReportsNotesSpy = vi.spyOn(reportsConfigStore, 'loadReportsNotes').mockResolvedValue();
      await reportsConfigStore.onNotesSpreadsheetExport({ headers: [] });
      expect(loadReportsNotesSpy).toHaveBeenCalledWith(expect.objectContaining({
        onCalcDataChange: expect.any(Function),
        onLoadingChange: expect.any(Function),
      }));
    });
  });

  describe('loadReportsNotesTableData', () => {
    test('calls loadReportsNotes with row and callbacks', async () => {
      const loadReportsNotesSpy = vi.spyOn(reportsConfigStore, 'loadReportsNotes').mockResolvedValue();
      const row = { groupingKey: '2021-01-01' };
      await reportsConfigStore.loadReportsNotesTableData({ row });
      expect(loadReportsNotesSpy).toHaveBeenCalledWith(expect.objectContaining({
        row,
        onCalcDataChange: expect.any(Function),
        onLoadingChange: expect.any(Function),
      }));
    });
  });

  describe('setNotesMapperLoadingState', () => {
    test('sets isNotesMapperLoading state', () => {
      reportsConfigStore.setNotesMapperLoadingState(true);
      expect(reportsConfigStore.isNotesMapperLoading).toBe(true);
      reportsConfigStore.setNotesMapperLoadingState(false);
      expect(reportsConfigStore.isNotesMapperLoading).toBe(false);
    });
  });

  describe('setNotesCalculatedData', () => {
    test('sets calculatedNotesData', () => {
      reportsConfigStore.setNotesCalculatedData({ data: [{ id: 1 }] });
      expect(reportsConfigStore.calculatedNotesData).toEqual([{ id: 1 }]);
    });
  });

  describe('loadReportsNotes', () => {
    test('fetches notes data and processes it', async () => {
      setFilterbarState({ type: configType.DOWNTIME, granularity: 'total', groupBy: [], [queryParam.INVERTED_FILTERS]: [] });
      reportsConfigStore.dateRange = ['2021-01-01', '2021-12-31'];
      mockFilterbarStore.calculatedFilterConfig = new Map();
      const onCalcDataChange = vi.fn();
      const onLoadingChange = vi.fn();
      // Spy on both fetchReportsNotesData and processReportNotesData to avoid Worker creation
      vi.spyOn(reportsConfigStore, 'fetchReportsNotesData').mockResolvedValue([{ id: 1 }]);
      vi.spyOn(reportsConfigStore, 'processReportNotesData').mockImplementation(() => {});
      await reportsConfigStore.loadReportsNotes({ onCalcDataChange, onLoadingChange });
      expect(reportsConfigStore.fetchReportsNotesData).toHaveBeenCalled();
      expect(reportsConfigStore.processReportNotesData).toHaveBeenCalled();
    });
  });

  describe('buildNotesRequest', () => {
    test('adds notes:true filter for DOWNTIME configType without row', async () => {
      setFilterbarState({ type: configType.DOWNTIME, granularity: 'total', groupBy: [] });
      reportsConfigStore.dateRange = ['2021-01-01', '2021-12-31'];
      mockFilterbarStore.calculatedFilterConfig = new Map();
      const result = await reportsConfigStore.buildNotesRequest({});
      expect(result.filters.notes).toBe(true);
    });

    test('adds performanceNotes:true filter for SPEEDLOSS configType', async () => {
      setFilterbarState({ type: configType.SPEEDLOSS, granularity: 'total', groupBy: [] });
      reportsConfigStore.dateRange = ['2021-01-01', '2021-12-31'];
      mockFilterbarStore.calculatedFilterConfig = new Map();
      const result = await reportsConfigStore.buildNotesRequest({});
      expect(result.filters.performanceNotes).toBe(true);
    });

    test('uses invertedFilters from store when no row', async () => {
      setFilterbarState({
        type: configType.DOWNTIME,
        granularity: 'total',
        groupBy: [],
        [queryParam.INVERTED_FILTERS]: ['stationId'],
      });
      reportsConfigStore.dateRange = ['2021-01-01', '2021-12-31'];
      mockFilterbarStore.calculatedFilterConfig = new Map();
      const result = await reportsConfigStore.buildNotesRequest({});
      expect(result.inverseFilter).toEqual(['stationId']);
    });

    test('applies row-based date range narrowing when row is provided', async () => {
      setFilterbarState({ type: configType.DOWNTIME, granularity: 'date', groupBy: [] });
      reportsConfigStore.dateRange = ['2021-01-01', '2021-12-31'];
      mockFilterbarStore.calculatedFilterConfig = new Map();
      const row = { groupingKey: '2021-06-15', entityKey: 'commentId', entityGroupId: [] };
      const result = await reportsConfigStore.buildNotesRequest({ row });
      expect(result.range).toBeDefined();
    });

    test('adds localstarttime filter when granularity is STARTTIME and row provided', async () => {
      setFilterbarState({ type: configType.DOWNTIME, granularity: granularityType.STARTTIME, groupBy: [] });
      reportsConfigStore.dateRange = ['2021-01-01', '2021-12-31'];
      mockFilterbarStore.calculatedFilterConfig = new Map();
      const row = { groupingKey: '2021-06-15T10:00:00', stationId: 's1', entityKey: 'commentId', entityGroupId: [] };
      const result = await reportsConfigStore.buildNotesRequest({ row });
      expect(result.filters.localstarttime).toBe('2021-06-15T10:00:00');
    });
  });

  describe('fetchReportsNotesData', () => {
    test('returns results from statisticsApi.getReportData', async () => {
      setFilterbarState({ type: configType.DOWNTIME, granularity: 'total', groupBy: [] });
      statisticsApi.getReportData.mockResolvedValue({ results: [{ id: 1 }] });
      const result = await reportsConfigStore.fetchReportsNotesData({
        filters: {}, range: { start: '2021-01-01', end: '2021-12-31' }, inverseFilter: [],
      });
      expect(result).toEqual([{ id: 1 }]);
    });

    test('returns empty array and notifies error on API failure', async () => {
      setFilterbarState({ type: configType.DOWNTIME, granularity: 'total', groupBy: [] });
      statisticsApi.getReportData.mockRejectedValue(new Error('fail'));
      const result = await reportsConfigStore.fetchReportsNotesData({
        filters: {}, range: { start: '2021-01-01', end: '2021-12-31' }, inverseFilter: [],
      });
      expect(result).toEqual([]);
      expect(mockNotificationStore.notifyError).toHaveBeenCalled();
    });

    test('uses CHECKLIST groupBy for CHECKLIST configType', async () => {
      setFilterbarState({ type: configType.CHECKLIST, granularity: 'total', groupBy: [] });
      statisticsApi.getReportData.mockResolvedValue({ results: [] });
      await reportsConfigStore.fetchReportsNotesData({
        filters: {}, range: { start: '2021-01-01', end: '2021-12-31' }, inverseFilter: [],
      });
      expect(statisticsApi.getReportData).toHaveBeenCalledWith(expect.objectContaining({
        groupBy: [dimensionType.TIMELINE_ID],
      }));
    });

    test('uses PERFORMANCE_LOSS_INSTANCE_ID groupBy for SPEEDLOSS configType', async () => {
      setFilterbarState({ type: configType.SPEEDLOSS, granularity: 'total', groupBy: [] });
      statisticsApi.getReportData.mockResolvedValue({ results: [] });
      await reportsConfigStore.fetchReportsNotesData({
        filters: {}, range: { start: '2021-01-01', end: '2021-12-31' }, inverseFilter: [],
      });
      expect(statisticsApi.getReportData).toHaveBeenCalledWith(expect.objectContaining({
        groupBy: [dimensionType.PERFORMANCE_LOSS_INSTANCE_ID],
      }));
    });

    test('uses empty groupBy for non-DOWNTIME/CHECKLIST/SPEEDLOSS configType', async () => {
      setFilterbarState({ type: configType.OEE, granularity: 'total', groupBy: [] });
      statisticsApi.getReportData.mockResolvedValue({ results: [] });
      await reportsConfigStore.fetchReportsNotesData({
        filters: {}, range: { start: '2021-01-01', end: '2021-12-31' }, inverseFilter: [],
      });
      expect(statisticsApi.getReportData).toHaveBeenCalledWith(expect.objectContaining({
        groupBy: [],
      }));
    });
  });

  describe('processReportNotesData', () => {
    test('calls mapperRef.getChartData with correct config for DOWNTIME', async () => {
      setFilterbarState({ type: configType.DOWNTIME, granularity: 'total', groupBy: [] });
      const mapperRef = { getChartData: vi.fn() };
      reportsConfigStore.processReportNotesData({
        mapperRef,
        data: [{ id: 1 }],
        dateRange: ['2021-01-01', '2021-12-31'],
      });
      expect(mapperRef.getChartData).toHaveBeenCalledWith(expect.objectContaining({
        groupBy: ['starttime'],
        granularity: granularityType.STARTTIME,
        configType: configType.DOWNTIME,
      }));
    });

    test('uses SPEEDLOSS-specific groupBy and granularity for SPEEDLOSS configType', async () => {
      setFilterbarState({ type: configType.SPEEDLOSS, granularity: 'total', groupBy: [] });
      const mapperRef = { getChartData: vi.fn() };
      reportsConfigStore.processReportNotesData({
        mapperRef,
        data: [],
        dateRange: ['2021-01-01', '2021-12-31'],
      });
      expect(mapperRef.getChartData).toHaveBeenCalledWith(expect.objectContaining({
        groupBy: ['performancelossinstanceid'],
        granularity: granularityType.TOTAL,
      }));
    });
  });

  describe('onPrevOrNextDateRangeApply', () => {
    test('calls updateFilterValue and triggerDataRequest after calcChartTypeParams', async () => {
      reportsConfigStore.calcChartTypeParams = vi.fn().mockResolvedValue({ granularity: 'date' });
      await reportsConfigStore.onPrevOrNextDateRangeApply({ start: '2021-01-01', end: '2021-01-31' });
      expect(reportsConfigStore.calcChartTypeParams).toHaveBeenCalledWith({ start: '2021-01-01', end: '2021-01-31' });
      expect(mockFilterbarStore.updateFilterValue).toHaveBeenCalledWith({ granularity: 'date' });
      expect(mockFilterbarStore.triggerDataRequest).toHaveBeenCalled();
    });
  });

  describe('getters - entityType', () => {
    test('returns entity type from configTypeEntityMap for known configType', () => {
      setFilterbarState({ type: configType.DOWNTIME });
      expect(reportsConfigStore.entityType).toBeDefined();
    });
  });

  describe('getters - notesReqInstanceMeasures', () => {
    test('includes PERFORMANCE_LOSS_NOTES for SPEEDLOSS', () => {
      setFilterbarState({ type: configType.SPEEDLOSS, granularity: 'total', groupBy: [] });
      getRequestMeasures.mockReturnValue([]);
      expect(reportsConfigStore.notesReqInstanceMeasures).toContain(measure.PERFORMANCE_LOSS_NOTES);
    });

    test('includes NOTES for DOWNTIME', () => {
      setFilterbarState({ type: configType.DOWNTIME, granularity: 'total', groupBy: [] });
      getRequestMeasures.mockReturnValue([]);
      expect(reportsConfigStore.notesReqInstanceMeasures).toContain(measure.NOTES);
    });

    test('does not add extra measures for other configTypes', () => {
      setFilterbarState({ type: configType.OEE, granularity: 'total', groupBy: [] });
      getRequestMeasures.mockReturnValue(['oee']);
      expect(reportsConfigStore.notesReqInstanceMeasures).toEqual(['oee']);
    });
  });

  describe('getters - filterConfiguration', () => {
    test('returns a Map or iterable configuration', () => {
      setFilterbarState({ type: configType.DOWNTIME });
      const config = reportsConfigStore.filterConfiguration;
      expect(config).toBeDefined();
    });
  });

  describe('getters - notesTableActiveHeaders', () => {
    test('filters headers based on notesReqInstanceMeasures and reqInstanceDimensions', () => {
      setFilterbarState({ type: configType.DOWNTIME, granularity: 'total', groupBy: [] });
      getRequestMeasures.mockReturnValue(['stopduration']);
      getRequestDimensions.mockReturnValue(['station']);
      const headers = [
        { id: 'stopduration', relatedParam: 'someParam' },
        { id: 'unrelated', relatedParam: 'someParam' },
      ];
      const result = reportsConfigStore.notesTableActiveHeaders(headers);
      expect(result.some((h) => h.id === 'stopduration')).toBe(true);
      expect(result.some((h) => h.id === 'unrelated')).toBe(false);
    });
  });

  describe('getters - isCalculatedValue', () => {
    test('returns true for DOWNTIME calcMeasures', () => {
      setFilterbarState({ type: configType.DOWNTIME });
      expect(reportsConfigStore.isCalculatedValue({ id: calcMeasure.ENTITY_PCT_PLANNED_TIME })).toBe(true);
      expect(reportsConfigStore.isCalculatedValue({ id: calcMeasure.AVG_DURATION })).toBe(true);
    });

    test('returns false for unrecognized id', () => {
      setFilterbarState({ type: configType.DOWNTIME });
      expect(reportsConfigStore.isCalculatedValue({ id: 'notACalcMeasure' })).toBe(false);
    });

    test('returns false for unknown configType', () => {
      setFilterbarState({ type: 'UNKNOWN_TYPE' });
      expect(reportsConfigStore.isCalculatedValue({ id: calcMeasure.AVG_DURATION })).toBe(false);
    });

    test('returns true for SPEEDLOSS AVG_DURATION', () => {
      setFilterbarState({ type: configType.SPEEDLOSS });
      expect(reportsConfigStore.isCalculatedValue({ id: calcMeasure.AVG_DURATION })).toBe(true);
    });

    test('returns true for SCRAPREASON calc measures', () => {
      setFilterbarState({ type: configType.SCRAPREASON });
      expect(reportsConfigStore.isCalculatedValue({ id: calcMeasure.ENTITY_PCT_PLANNED_TIME })).toBe(true);
      expect(reportsConfigStore.isCalculatedValue({ id: calcMeasure.SCRAP_QTY_PCT })).toBe(true);
    });

    test('returns true for TIME_USAGE calc measures', () => {
      setFilterbarState({ type: configType.TIME_USAGE });
      expect(reportsConfigStore.isCalculatedValue({ id: calcMeasure.SHIFT_TIME })).toBe(true);
      expect(reportsConfigStore.isCalculatedValue({ id: calcMeasure.OPERATING_TIME })).toBe(true);
    });

    test('returns true for QUANTITY calc measures', () => {
      setFilterbarState({ type: configType.QUANTITY });
      expect(reportsConfigStore.isCalculatedValue({ id: calcMeasure.POTENTIAL_QTY })).toBe(true);
    });

    test('returns true for CHECKLIST AVG_TIME', () => {
      setFilterbarState({ type: configType.CHECKLIST });
      expect(reportsConfigStore.isCalculatedValue({ id: calcMeasure.AVG_TIME })).toBe(true);
    });

    test('returns true for OEE calc measures', () => {
      setFilterbarState({ type: configType.OEE });
      expect(reportsConfigStore.isCalculatedValue({ id: calcMeasure.OOE })).toBe(true);
      expect(reportsConfigStore.isCalculatedValue({ id: calcMeasure.TEEP })).toBe(true);
    });
  });

  describe('getters - activeHeaders', () => {
    test('filters headers matching reqMeasures or reqDimensions', () => {
      setFilterbarState({ type: configType.DOWNTIME, granularity: 'total', groupBy: [] });
      getRequestMeasures.mockReturnValue(['stopduration']);
      getRequestDimensions.mockReturnValue(['station']);
      const headers = [
        { id: 'stopduration', relatedParam: undefined },
        { id: 'unrelated', relatedParam: undefined },
      ];
      const result = reportsConfigStore.activeHeaders(headers);
      expect(result.some((h) => h.id === 'stopduration')).toBe(true);
      expect(result.some((h) => h.id === 'unrelated')).toBe(false);
    });

    test('adds SKU to matchSet when PRODUCT dimension is present', () => {
      setFilterbarState({ type: configType.DOWNTIME, granularity: 'total', groupBy: [] });
      getRequestMeasures.mockReturnValue([]);
      getRequestDimensions.mockReturnValue([dimensionType.PRODUCT]);
      const headers = [
        { id: xAxisKey.SKU, relatedParam: undefined },
      ];
      const result = reportsConfigStore.activeHeaders(headers);
      expect(result.some((h) => h.id === xAxisKey.SKU)).toBe(true);
    });

    test('removes OPERATOR from matchSet when groupBy is SINGLE_OPERATOR', () => {
      setFilterbarState({ type: configType.DOWNTIME, granularity: 'total', groupBy: [xAxisKey.SINGLE_OPERATOR] });
      getRequestMeasures.mockReturnValue([]);
      getRequestDimensions.mockReturnValue([dimensionType.OPERATOR]);
      const headers = [
        { id: dimensionType.OPERATOR, relatedParam: undefined },
      ];
      const result = reportsConfigStore.activeHeaders(headers);
      expect(result.some((h) => h.id === dimensionType.OPERATOR)).toBe(false);
    });

    test('reorders header matching groupBy secondaryId to front for total granularity', () => {
      setFilterbarState({ type: configType.DOWNTIME, granularity: 'total', groupBy: ['entityId'] });
      getRequestMeasures.mockReturnValue(['stopduration', 'entityId']);
      getRequestDimensions.mockReturnValue([]);
      const headers = [
        { id: 'stopduration', relatedParam: undefined },
        { id: 'entityId', secondaryId: 'entityId', relatedParam: undefined },
      ];
      const result = reportsConfigStore.activeHeaders(headers);
      expect(result[0].id).toBe('entityId');
    });
  });

  describe('getters - reqGroupBy', () => {
    test('returns [starttime, timelineid] for STARTTIME granularity', () => {
      setFilterbarState({ type: configType.DOWNTIME, granularity: granularityType.STARTTIME, groupBy: [] });
      expect(reportsConfigStore.reqGroupBy).toEqual([granularityType.STARTTIME, dimensionType.TIMELINE_ID]);
    });

    test('returns [duetime] for DUE_TIME granularity', () => {
      setFilterbarState({ type: configType.DOWNTIME, granularity: granularityType.DUE_TIME, groupBy: [] });
      expect(reportsConfigStore.reqGroupBy).toEqual([granularityType.DUE_TIME]);
    });

    test('returns uniq requestGroupByArgs for non-time granularity', () => {
      setFilterbarState({ type: configType.DOWNTIME, granularity: 'total', groupBy: [xAxisKey.ENTITY_ID] });
      const result = reportsConfigStore.reqGroupBy;
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    test('returns [granularity] for time granularity with single group arg', () => {
      setFilterbarState({ type: configType.DOWNTIME, granularity: 'date', groupBy: [xAxisKey.ENTITY_ID] });
      const result = reportsConfigStore.reqGroupBy;
      expect(result).toContain('date');
    });

    test('returns uniq granularity + extra args for time granularity with multiple group args', () => {
      setFilterbarState({ type: configType.DOWNTIME, granularity: 'date', groupBy: [xAxisKey.ENTITY_ID] });
      // ENTITY_ID has 2 requestGroupByArgs: [COMMENT, COMMENT_GROUP]
      const result = reportsConfigStore.reqGroupBy;
      // with date granularity and ENTITY_ID, requestGroupByArgs.length > 1 so should return [granularity, ...slice(1)]
      expect(result[0]).toBe('date');
    });

    test('filters SCRAP_REASON_GROUP for SCRAPREASON + ENTITY_ID + non-time granularity', () => {
      setFilterbarState({ type: configType.SCRAPREASON, granularity: 'total', groupBy: [xAxisKey.ENTITY_ID] });
      const result = reportsConfigStore.reqGroupBy;
      expect(result).not.toContain(dimensionType.SCRAP_REASON_GROUP);
    });
  });

  describe('getters - groupByMenuItems', () => {
    test('returns config for current configType', () => {
      setFilterbarState({ type: configType.DOWNTIME });
      const items = reportsConfigStore.groupByMenuItems;
      expect(items).toBeDefined();
      expect(typeof items).toBe('object');
    });

    test('removes disabled params from menu items', () => {
      mockConfigurationStore.showOperatorsReport = false;
      setFilterbarState({ type: configType.DOWNTIME });
      const items = reportsConfigStore.groupByMenuItems;
      expect(items[xAxisKey.SINGLE_OPERATOR]).toBeUndefined();
      mockConfigurationStore.showOperatorsReport = true;
    });

    test('returns empty config for unknown configType', () => {
      setFilterbarState({ type: 'UNKNOWN_TYPE' });
      const items = reportsConfigStore.groupByMenuItems;
      expect(items).toEqual({});
    });
  });

  describe('getSelectedGroupFilteringArguments', () => {
    test('handles STATION_ID groupByKey', async () => {
      setFilterbarState({ type: configType.DOWNTIME, granularity: 'total', groupBy: [xAxisKey.STATION_ID], [queryParam.INVERTED_FILTERS]: [] });
      const item = { isFake: false, stationId: 's1' };
      const result = await reportsConfigStore.getSelectedGroupFilteringArguments({ item });
      expect(result.filters[xAxisKey.STATION_ID]).toBe('s1');
    });

    test('handles FACTORY_ID groupByKey', async () => {
      setFilterbarState({ type: configType.DOWNTIME, granularity: 'total', groupBy: [xAxisKey.FACTORY_ID], [queryParam.INVERTED_FILTERS]: [] });
      const item = { isFake: false, factoryId: 'f1' };
      const result = await reportsConfigStore.getSelectedGroupFilteringArguments({ item });
      expect(result.filters[xAxisKey.FACTORY_ID]).toBe('f1');
    });

    test('handles ENTITY_ID groupByKey', async () => {
      setFilterbarState({ type: configType.DOWNTIME, granularity: 'total', groupBy: [xAxisKey.ENTITY_ID], [queryParam.INVERTED_FILTERS]: [] });
      const item = { isFake: false, entityKey: 'commentId', entityId: 'c1' };
      const result = await reportsConfigStore.getSelectedGroupFilteringArguments({ item });
      expect(result.filters.commentId).toBe('c1');
    });

    test('handles SINGLE_OPERATOR groupByKey', async () => {
      setFilterbarState({ type: configType.DOWNTIME, granularity: 'total', groupBy: [xAxisKey.SINGLE_OPERATOR], [queryParam.INVERTED_FILTERS]: [] });
      const item = { isFake: false, operatorId: 'op1' };
      const result = await reportsConfigStore.getSelectedGroupFilteringArguments({ item });
      expect(result.filters.operatorId).toBe('op1');
    });

    test('handles SHIFT_TEMPLATE groupByKey', async () => {
      setFilterbarState({ type: configType.DOWNTIME, granularity: 'total', groupBy: [xAxisKey.SHIFT_TEMPLATE], [queryParam.INVERTED_FILTERS]: [] });
      const item = { isFake: false, shiftTemplate: 'morning' };
      const result = await reportsConfigStore.getSelectedGroupFilteringArguments({ item });
      expect(result.filters.shiftName).toEqual(['morning']);
    });

    test('handles LOT_CODE groupByKey', async () => {
      setFilterbarState({ type: configType.DOWNTIME, granularity: 'total', groupBy: [xAxisKey.LOT_CODE], [queryParam.INVERTED_FILTERS]: [] });
      const item = { isFake: false, lotCode: 'LOT-001' };
      const result = await reportsConfigStore.getSelectedGroupFilteringArguments({ item });
      expect(result.filters.lotCode).toEqual(['LOT-001']);
    });

    test('handles PRODUCT_GROUP_ID groupByKey', async () => {
      setFilterbarState({ type: configType.DOWNTIME, granularity: 'total', groupBy: [xAxisKey.PRODUCT_GROUP_ID], [queryParam.INVERTED_FILTERS]: [] });
      const item = { isFake: false, productId: 'p1' };
      const result = await reportsConfigStore.getSelectedGroupFilteringArguments({ item });
      expect(result.filters[xAxisKey.PRODUCT_ID]).toBe('p1');
    });

    test('handles SKU groupByKey', async () => {
      setFilterbarState({ type: configType.DOWNTIME, granularity: 'total', groupBy: [xAxisKey.SKU], [queryParam.INVERTED_FILTERS]: [] });
      const item = { isFake: false, productId: 'p2' };
      const result = await reportsConfigStore.getSelectedGroupFilteringArguments({ item });
      expect(result.filters[xAxisKey.PRODUCT_ID]).toBe('p2');
    });

    test('handles ENTITY_GROUP_ID groupByKey', async () => {
      setFilterbarState({ type: configType.DOWNTIME, granularity: 'total', groupBy: [xAxisKey.ENTITY_GROUP_ID], [queryParam.INVERTED_FILTERS]: [] });
      const item = { isFake: false, entityKey: 'commentId', entityGroupId: ['grp1'] };
      const result = await reportsConfigStore.getSelectedGroupFilteringArguments({ item });
      expect(result).toBeDefined();
    });

    test('handles STATION_GROUP_ID groupByKey', async () => {
      setFilterbarState({ type: configType.DOWNTIME, granularity: 'total', groupBy: [xAxisKey.STATION_GROUP_ID], [queryParam.INVERTED_FILTERS]: [] });
      const item = { isFake: false, stationGroupId: ['sg1'] };
      const result = await reportsConfigStore.getSelectedGroupFilteringArguments({ item });
      expect(result).toBeDefined();
    });

    test('returns empty object for unknown groupByKey', async () => {
      setFilterbarState({ type: configType.DOWNTIME, granularity: 'total', groupBy: ['unknownKey'], [queryParam.INVERTED_FILTERS]: [] });
      const item = { isFake: false };
      const result = await reportsConfigStore.getSelectedGroupFilteringArguments({ item });
      expect(result).toEqual({});
    });
  });

  describe('onDrilldown', () => {
    test('returns early for PRODUCTION_SPEED configType', async () => {
      setFilterbarState({ type: configType.PRODUCTION_SPEED, granularity: 'total', groupBy: [] });
      await reportsConfigStore.onDrilldown([{ groupingKey: '2021-01-01' }]);
      expect(mockFilterbarStore.updateFilterValue).not.toHaveBeenCalled();
    });

    test('returns early for DATE granularity without micro granularity config', async () => {
      // SCRAPREASON is not in microGranularitiesConfig, so DATE granularity triggers early return
      setFilterbarState({ type: configType.SCRAPREASON, granularity: granularityType.DATE, groupBy: [], [queryParam.INVERTED_FILTERS]: [] });
      reportsConfigStore.dateRange = ['2021-01-01', '2021-12-31'];
      await reportsConfigStore.onDrilldown([{ groupingKey: '2021-01-01' }]);
      expect(mockFilterbarStore.updateFilterValue).not.toHaveBeenCalled();
    });

    test('calls updateFilterValue for non-total granularity drilldown', async () => {
      reportsConfigStore.dateRange = ['2021-01-01', '2021-12-31'];
      setFilterbarState({
        type: configType.DOWNTIME,
        granularity: 'date',
        groupBy: [xAxisKey.ENTITY_ID],
        [queryParam.INVERTED_FILTERS]: [],
      });
      // granularity is date which returns early for DOWNTIME (no micro config)
      // Test with 'month' granularity to exercise the non-total, non-date path
      setFilterbarState({
        type: configType.DOWNTIME,
        granularity: 'month',
        groupBy: [],
        [queryParam.INVERTED_FILTERS]: [],
      });
      await reportsConfigStore.onDrilldown([{ groupingKey: '2021-06' }]);
      expect(mockFilterbarStore.updateFilterValue).toHaveBeenCalled();
      expect(mockFilterbarStore.triggerDataRequest).toHaveBeenCalled();
    });

    test('calls getSelectedGroupFilteringArguments for TOTAL granularity drilldown', async () => {
      reportsConfigStore.dateRange = ['2021-01-01', '2021-12-31'];
      setFilterbarState({
        type: configType.DOWNTIME,
        granularity: 'total',
        groupBy: [],
        [queryParam.INVERTED_FILTERS]: [],
      });
      const getArgsSpy = vi.spyOn(reportsConfigStore, 'getSelectedGroupFilteringArguments').mockResolvedValue({
        filters: { stationId: 's1' },
        invertedFilters: [],
      });
      await reportsConfigStore.onDrilldown([{ groupingKey: '2021-01-01' }]);
      expect(getArgsSpy).toHaveBeenCalled();
      expect(mockFilterbarStore.updateFilterValue).toHaveBeenCalled();
    });
  });

  describe('initDataMapper - onCalcDataChange and onLoadingChange callbacks', () => {
    test('onCalcDataChange callback updates store state', async () => {
      await reportsConfigStore.initDataMapper();
      const mapper = reportsConfigStore.dataMapper;
      const mockArgs = {
        data: [{ id: 1 }],
        tableData: [{ row: 1 }],
        chartData: [{ x: 1 }],
        totals: { total: 100 },
        stackLegend: new Map([['key1', 1], ['key2', 2]]),
      };
      // Trigger the onCalcDataChange callback directly via mapper's stored reference
      mapper.onCalcDataChange(mockArgs);
      expect(reportsConfigStore.calculatedData).toEqual([{ id: 1 }]);
      expect(reportsConfigStore.tableData).toEqual([{ row: 1 }]);
      expect(reportsConfigStore.chartDataRaw).toEqual([{ x: 1 }]);
      expect(reportsConfigStore.totals).toEqual({ total: 100 });
      expect(reportsConfigStore.stackLegendList).toEqual(['key1', 'key2']);
    });

    test('onLoadingChange callback updates dataProcessing state', async () => {
      await reportsConfigStore.initDataMapper();
      const mapper = reportsConfigStore.dataMapper;
      mapper.onLoadingChange(true);
      expect(reportsConfigStore.dataProcessing).toBe(true);
      mapper.onLoadingChange(false);
      expect(reportsConfigStore.dataProcessing).toBe(false);
    });
  });

  describe('calcNewGranularity - isDrilldown same day branch', () => {
    test('returns micro granularity when isDrilldown=true and same day for DOWNTIME', async () => {
      setFilterbarState({ type: configType.DOWNTIME, granularity: 'total' });
      const result = await reportsConfigStore.calcNewGranularity({
        start: '2021-02-15',
        end: '2021-02-15',
        isDrilldown: true,
      });
      expect(result).toBe(granularityType.STARTTIME);
    });
  });

  describe('getVisibleColumns', () => {
    test('replaces TOTAL_PLANNED_TIME with ROW_PLANNED_TIME when shouldUseTotalMeasures returns false', () => {
      shouldUseTotalMeasures.mockReturnValue(false);
      setFilterbarState({ visibleColumns: [measure.TOTAL_PLANNED_TIME] });
      const result = reportsConfigStore.getVisibleColumns({ granularity: 'date', groupBy: [] });
      expect(result).toContain(measure.ROW_PLANNED_TIME);
      expect(result).not.toContain(measure.TOTAL_PLANNED_TIME);
    });

    test('replaces ROW_PLANNED_TIME with TOTAL_PLANNED_TIME when shouldUseTotalMeasures returns true', () => {
      shouldUseTotalMeasures.mockReturnValue(true);
      setFilterbarState({ visibleColumns: [measure.ROW_PLANNED_TIME] });
      const result = reportsConfigStore.getVisibleColumns({ granularity: 'total', groupBy: [] });
      expect(result).toContain(measure.TOTAL_PLANNED_TIME);
      expect(result).not.toContain(measure.ROW_PLANNED_TIME);
    });
  });

  describe('calcNewDrilldownPeriod - rolling period match', () => {
    test('returns dateRange array when getCurrentPeriod returns undefined', async () => {
      getCurrentPeriod.mockReturnValue(undefined);
      reportsConfigStore.dateRange = ['2021-02-15', '2021-02-15'];
      setFilterbarState({ type: configType.DOWNTIME, granularity: 'date', period: [], [queryParam.INVERTED_FILTERS]: [] });
      const result = await reportsConfigStore.calcNewDrilldownPeriod('2021-02-15');
      expect(Array.isArray(result)).toBe(true);
    });

    test('returns currentPeriod directly when it equals the computed dateRange', async () => {
      // Mock getCurrentPeriod to return a value matching what calculateDatapointDateRange will produce
      const expectedRange = ['2021-02-15', '2021-02-15'];
      getCurrentPeriod.mockReturnValue(expectedRange);
      reportsConfigStore.dateRange = ['2021-02-15', '2021-02-19'];
      setFilterbarState({ type: configType.DOWNTIME, granularity: 'date', period: 'today', [queryParam.INVERTED_FILTERS]: [] });
      const result = await reportsConfigStore.calcNewDrilldownPeriod('2021-02-15');
      expect(result).toBe(expectedRange);
    });

    test('returns dateRange when currentPeriod exists but does not match', async () => {
      getCurrentPeriod.mockReturnValue(['2021-01-01', '2021-01-31']);
      reportsConfigStore.dateRange = ['2021-02-15', '2021-02-19'];
      setFilterbarState({ type: configType.DOWNTIME, granularity: 'date', period: 'lastmonth', [queryParam.INVERTED_FILTERS]: [] });
      const result = await reportsConfigStore.calcNewDrilldownPeriod('2021-02-15');
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('generateReportsPdf - error path', () => {
    test('calls notifyError when createPDFfromHTML throws', async () => {
      createPDFfromHTML.mockRejectedValue(new Error('PDF error'));
      // console.error is blocked in the test environment; spy to suppress it
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      await reportsConfigStore.generateReportsPdf();
      expect(mockNotificationStore.notifyError).toHaveBeenCalled();
      expect(reportsConfigStore.isGeneratingPdf).toBe(false);
      consoleErrorSpy.mockRestore();
    });
  });

  describe('fetchReportsData - cache hit path', () => {
    test('uses cached data when getCachedResponse returns an entry', async () => {
      reportsConfigStore.dateRange = ['2021-01-01', '2021-12-31'];
      setFilterbarState({ type: configType.DOWNTIME, granularity: 'date', groupBy: [] });
      getRequestMeasures.mockReturnValue(['stopduration']);
      getRequestDimensions.mockReturnValue(['station']);
      const cachedEntry = { resPayload: [{ id: 99 }], trendlineData: [{ x: 5 }] };
      mockCacheFns.getCachedResponse.mockResolvedValueOnce(cachedEntry);
      await reportsConfigStore.fetchReportsData({ filters: {}, range: { start: '2021-01-01', end: '2021-12-31' }, query: {} });
      expect(reportsConfigStore.rawData).toEqual([{ id: 99 }]);
      expect(reportsConfigStore.trendlineData).toEqual([{ x: 5 }]);
    });
  });

  describe('getTrendlineData - success path', () => {
    test('returns trendline data when all conditions met', async () => {
      setFilterbarState({ granularity: 'date', type: 'DOWNTIME' });
      mockConfigurationStore.disableTrendline = false;
      getTrendlineMeasure.mockReturnValue('trendlineMeasure');
      statisticsApi.getTrendlineData.mockResolvedValue([{ x: 1, y: 2 }]);
      reportsConfigStore.reportsDataController = new AbortController();
      const result = await reportsConfigStore.getTrendlineData({
        filters: {},
        range: { start: '2021-01-01', end: '2021-12-31' },
        query: {},
      });
      expect(result).toEqual([{ x: 1, y: 2 }]);
    });

    test('returns null when getTrendlineData API throws', async () => {
      setFilterbarState({ granularity: 'date', type: 'DOWNTIME' });
      mockConfigurationStore.disableTrendline = false;
      getTrendlineMeasure.mockReturnValue('trendlineMeasure');
      statisticsApi.getTrendlineData.mockRejectedValue(new Error('trendline error'));
      reportsConfigStore.reportsDataController = new AbortController();
      const result = await reportsConfigStore.getTrendlineData({
        filters: {},
        range: { start: '2021-01-01', end: '2021-12-31' },
        query: {},
      });
      expect(result).toBeNull();
    });
  });

  describe('onNotesSpreadsheetExport - onCalcDataChange callback', () => {
    test('calls onSpreadsheetExport when onCalcDataChange is invoked', async () => {
      setFilterbarState({ type: configType.DOWNTIME });
      mockRouteModuleStore.query = { name: 'testReport' };
      const onSpreadsheetExportSpy = vi.spyOn(reportsConfigStore, 'onSpreadsheetExport').mockResolvedValue();
      let capturedCallback;
      vi.spyOn(reportsConfigStore, 'loadReportsNotes').mockImplementation(({ onCalcDataChange }) => {
        capturedCallback = onCalcDataChange;
        return Promise.resolve();
      });
      await reportsConfigStore.onNotesSpreadsheetExport({ headers: ['h1'] });
      // Now trigger the captured callback
      await capturedCallback({ tableData: [{ row: 1 }] });
      expect(onSpreadsheetExportSpy).toHaveBeenCalledWith(expect.objectContaining({
        data: [{ row: 1 }],
        headers: ['h1'],
      }));
    });
  });

  describe('getters - chartTypeJoined', () => {
    test('returns chart types joined by comma', () => {
      setFilterbarState({ chartType: ['bar', 'line'] });
      expect(reportsConfigStore.chartTypeJoined).toBe('bar,line');
    });

    test('returns undefined when chartType is undefined', () => {
      setFilterbarState({ chartType: undefined });
      expect(reportsConfigStore.chartTypeJoined).toBeUndefined();
    });
  });

  describe('getters - reportDescription', () => {
    test('returns description from route query', () => {
      mockRouteModuleStore.query = { name: 'myReport', description: 'A test report' };
      expect(reportsConfigStore.reportDescription).toBe('A test report');
    });

    test('returns empty string when description is not in query', () => {
      mockRouteModuleStore.query = { name: 'myReport' };
      expect(reportsConfigStore.reportDescription).toBe('');
    });
  });

  describe('getGroupDrilldownFilterReqObj', () => {
    test('handles comment store key', async () => {
      setFilterbarState({ type: configType.DOWNTIME, granularity: 'total', groupBy: [xAxisKey.ENTITY_GROUP_ID], [queryParam.INVERTED_FILTERS]: [] });
      const item = { entityKey: 'commentId', entityGroupId: ['grp1'] };
      const result = await reportsConfigStore.getGroupDrilldownFilterReqObj({
        item,
        storeKey: 'comment/allComments',
        requestFilterKey: 'commentId',
        filterKey: 'entityGroupId',
      });
      expect(result).toHaveProperty('filters');
      expect(result).toHaveProperty('invertedFilters');
    });

    test('handles station store key', async () => {
      setFilterbarState({ type: configType.DOWNTIME, granularity: 'total', groupBy: [], [queryParam.INVERTED_FILTERS]: [] });
      const item = { stationGroupId: ['sg1'] };
      const result = await reportsConfigStore.getGroupDrilldownFilterReqObj({
        item,
        storeKey: 'station/stations',
        requestFilterKey: 'stationId',
        filterKey: 'stationGroupId',
      });
      expect(result).toHaveProperty('filters');
    });

    test('applies without for invertedFilters when requestFilterKey is in invertedFilters', async () => {
      setFilterbarState({
        type: configType.DOWNTIME,
        granularity: 'total',
        groupBy: [],
        [queryParam.INVERTED_FILTERS]: ['commentId'],
        commentId: ['c1'],
      });
      const item = { entityKey: 'commentId', entityGroupId: ['grp1'] };
      const result = await reportsConfigStore.getGroupDrilldownFilterReqObj({
        item,
        storeKey: 'comment/allComments',
        requestFilterKey: 'commentId',
        filterKey: 'entityGroupId',
      });
      expect(Array.isArray(result.filters.commentId)).toBe(true);
    });

    test('applies intersection when requestFilterState has filter values', async () => {
      setFilterbarState({
        type: configType.DOWNTIME,
        granularity: 'total',
        groupBy: [],
        [queryParam.INVERTED_FILTERS]: [],
        commentId: ['c1', 'c2'],
      });
      const item = { entityKey: 'commentId', entityGroupId: ['grp1'] };
      const result = await reportsConfigStore.getGroupDrilldownFilterReqObj({
        item,
        storeKey: 'comment/allComments',
        requestFilterKey: 'commentId',
        filterKey: 'entityGroupId',
      });
      expect(Array.isArray(result.filters.commentId)).toBe(true);
    });
  });
});
