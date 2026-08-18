import ReportsDataPreprocessor from '@/stores/reportsConfig/ReportsDataPreprocessor';
import config from '@/stores/reportsConfig/constants/configType';
import granularity from '@/stores/reportsConfig/constants/granularity';

describe('ReportsDataPreprocessor', () => {
  const testCases = new Map([
    [config.OEE, {
      date: '2022-11-08',
      scrapqty: 0.0,
      stationgroup: 'Tehas 2',
      qualityValue: 1.0,
      technicalavailabilityValue: 1.00000000,
      availability: 100.00,
      operator: '',
      oee: 189.3800,
      uncommentedstop: 0,
      station: 'Evocon production line T2',
      performanceValue: 1.89380037,
      oeeValue: 1.89380037000000,
      unitId: 'pc',
      stationId: 1,
      product: 'Evocon device II',
      unplannedstop: 0,
      productId: 502,
      technicalavailability: 100.00,
      plannedtime: 14100,
      idealperformanceqty: 125.33,
      shifttemplate: 'Kerli test shift',
      technicalstop: 0,
      productiontime: 14100,
      quality: 100.0000,
      plannedstop: 0,
      availabilityValue: 1.00000000,
      performance: 189.38003700,
      qty: 237.3500,
      teamId: 0,
      commentedstop: 0,
      stationgroupId: 1,
      rowproducedqty: 237.3500,
      rowproducedaltqty: 137.3500,
      idealqty: 125.33,
      plannedstopnotincludedinoee: 0,

    }],
    [config.QUANTITY, {
      date: '2022-11-08',
      scrapqty: 0.0,
      product: 'Evocon device II',
      stationgroup: 'Tehas 2',
      productId: 502,
      rowproducedqty: 237.3500,
      rowproducedaltqty: 137.3500,
      shifttemplate: 'Kerli test shift',
      idealqty: 125.33,
      idealaltqty: 75.33,
      goodqty: 237.35,
      goodaltqty: 137.35,
      operator: '',
      teamId: 0,
      station: 'Evocon production line T2',
      unitId: 'pc',
      stationgroupId: 1,
      stationId: 1,
      idealperformanceqty: 125.33,
      idealperformancealtqty: 75.33,
      scrapaltqty: 0.0,
    }],
    [config.TIME_USAGE, {
      date: '2022-11-08',
      slowproduction: 0.0,
      product: 'Evocon device II',
      stationgroup: 'Tehas 2',
      unplannedstop: 0,
      productId: 502,
      plannedtime: 14100,
      shifttemplate: 'Kerli test shift',
      plannedstopincludedinoee: 0,
      operator: '',
      plannedstop: 0,
      goodproduction: 14100.0,
      uncommentedstop: 0,
      teamId: 0,
      station: 'Evocon production line T2',
      unitId: 'pc',
      stops: 0,
      stationgroupId: 1,
      stationId: 1,
      rowproducedqty: 237.3500,
      rowproducedaltqty: 137.3500,
      plannedstopnotincludedinoee: 0,
    }],
  ]);
  testCases.forEach((entry, configType) => {
    test(`if buildPreprocessedEntries creates processed entries with expected properties for config type: ${configType}`, () => {
      const dataProcessor = new ReportsDataPreprocessor({
        startDate: null,
        endDate: null,
        granularity: null,
        calendarTimeSec: 14100,
      }, configType);
      const result = dataProcessor.buildPreprocessedEntries([], entry);
      expect(result).toMatchSnapshot();
    });
  });

  test('if getPlaceholderEntriesMap returns dates map with expected properties when granularity is NOT TOTAL', () => {
    const dataProcessor = new ReportsDataPreprocessor({
      startDate: '2022-11-11',
      endDate: '2022-11-14',
      granularity: granularity.DATE,
      calendarTimeSec: 14100,
    }, config.OEE);
    const result = dataProcessor.getPlaceholderEntriesMap();
    expect(result).toMatchSnapshot();
  });
  test('if getPlaceholderEntriesMap returns dates map with expected properties when granularity IS TOTAL', () => {
    const dataProcessor = new ReportsDataPreprocessor({
      startDate: '2022-11-11',
      endDate: '2022-11-14',
      granularity: granularity.TOTAL,
      calendarTimeSec: 14100,
    }, config.OEE);
    const result = dataProcessor.getPlaceholderEntriesMap();
    expect(result).toStrictEqual(new Map());
  });
  test('if processEntry calls expected methods with valid arguments', () => {
    const dataProcessor = new ReportsDataPreprocessor({
      startDate: '2022-11-11',
      endDate: '2022-11-14',
      granularity: granularity.TOTAL,
      calendarTimeSec: 14100,
    }, config.OEE);
    dataProcessor.buildPreprocessedEntries = vi.fn();
    dataProcessor.processEntry([], {});
    expect(dataProcessor.buildPreprocessedEntries).toHaveBeenCalledTimes(1);
    expect(dataProcessor.buildPreprocessedEntries).toHaveBeenCalledWith([], {});
  });
  describe('processEntries', () => {
    test('should return an empty array if the input array is empty and granularity is TOTAL', () => {
      const requirements = {
        granularity: granularity.TOTAL,
        startDate: '2022-01-01',
        endDate: '2022-01-31',
        calendarTimeSec: 14100,
      };

      const configType = 'foo';
      const formattingOptions = { firstDayOfWeek: 1 };
      const preprocessor = new ReportsDataPreprocessor(requirements, configType, formattingOptions);
      const result = preprocessor.processEntries([]);
      expect(result).toEqual([]);
    });

    test('should process each entry in the input array', () => {
      const requirements = {
        granularity: 'total',
        startDate: '2022-01-01',
        endDate: '2022-01-31',
        calendarTimeSec: 14100,
      };

      const configType = 'foo';
      const formattingOptions = { firstDayOfWeek: 1 };
      const preprocessor = new ReportsDataPreprocessor(requirements, configType, formattingOptions);
      const entries = [
        { date: '2022-01-01', value: 10 },
        { date: '2022-01-02', value: 20 },
        { date: '2022-01-03', value: 30 },
      ];

      const expectedOutput = [
        { date: '2022-01-01', value: 10 },
        { date: '2022-01-02', value: 20 },
        { date: '2022-01-03', value: 30 },
      ];

      const result = preprocessor.processEntries(entries);
      expect(result).toEqual(expectedOutput);
    });

    test('should overwrite the placeholder entry for granularity type other than TOTAL', () => {
      const requirements = {
        granularity: granularity.DATE,
        startDate: '2022-01-01',
        endDate: '2022-01-05',
        calendarTimeSec: 14100,
      };
      const configType = 'default';
      const formatterOptions = {
        firstDayOfWeek: 1,
      };
      const preprocessor = new ReportsDataPreprocessor(requirements, configType, formatterOptions);

      const entries = [
        { date: '2022-01-01', value: 1 },
        { date: '2022-01-02', value: 2 },
        { date: '2022-01-04', value: 4 },
      ];
      const processedEntries = preprocessor.processEntries(entries);
      const expectedProcessedEntries = [
        { date: '2022-01-01', value: 1 },
        { date: '2022-01-02', value: 2 },
        { date: '2022-01-04', value: 4 },
        { date: '2022-01-03', isFake: true },
        { date: '2022-01-05', isFake: true },
      ];
      expect(processedEntries).toEqual(expectedProcessedEntries);
    });

    test('should overwrite the placeholder entry for granularity type other than TOTAL while values', () => {
      const requirements = {
        granularity: granularity.DATE,
        startDate: '2022-01-01',
        endDate: '2022-01-05',
        calendarTimeSec: 14100,
      };
      const configType = 'default';
      const formatterOptions = {
        firstDayOfWeek: 1,
      };
      const preprocessor = new ReportsDataPreprocessor(requirements, configType, formatterOptions);

      const entries = [
        { date: '2022-01-01', value: 1 },
        { date: '2022-01-02', value: 2 },
        { date: '2022-01-04', value: 4 },
      ];
      const processedEntries = preprocessor.processEntries(entries);
      const expectedProcessedEntries = [
        { date: '2022-01-01', value: 1 },
        { date: '2022-01-02', value: 2 },
        { date: '2022-01-04', value: 4 },
        { date: '2022-01-03', isFake: true },
        { date: '2022-01-05', isFake: true },
      ];
      expect(processedEntries).toEqual(expectedProcessedEntries);
    });

    test('should return the same entries list for granularity type TOTAL', () => {
      const requirements = {
        granularity: granularity.TOTAL,
        startDate: '2022-01-01',
        endDate: '2022-01-05',
        calendarTimeSec: 14100,
      };
      const configType = 'default';
      const formatterOptions = {
        firstDayOfWeek: 0,
      };
      const preprocessor = new ReportsDataPreprocessor(requirements, configType, formatterOptions);

      const entries = [{ value: 1 }, { value: 2 }, { value: 4 }];
      const processedEntries = preprocessor.processEntries(entries);
      expect(processedEntries).toEqual(entries);
    });

    it('should throw an error if an entry has more than one granularity value', () => {
      const preprocessor = new ReportsDataPreprocessor(
        {
          granularity: 'month',
          startDate: '2022-01-01',
          endDate: '2022-03-31',
          firstDayOfWeek: 0,
          calendarTimeSec: 14100,
        },
        'default',
        {},
      );

      const entries = [
        { month: ['202201', '202202'] },
        { month: ['202203'] },
        { month: ['202203'] },
      ];

      expect(() => preprocessor.processEntries(entries)).toThrow(
        'Only one key is supported for grouping',
      );
    });

    it('should correctly process valid entries with an array of granularity values', () => {
      const requirements = {
        granularity: 'weekofyear',
        startDate: '2022-01-03',
        endDate: '2022-01-15',
        firstDayOfWeek: 1,
        calendarTimeSec: 14100,
      };
      const configType = 'default';
      const preprocessor = new ReportsDataPreprocessor(requirements, configType);
      const entries = [
        { weekofyear: ['202202'], impressions: 100 },
        { weekofyear: ['202203'], impressions: 200 },
      ];
      const result = preprocessor.processEntries(entries);
      expect(result).toEqual([
        { weekofyear: ['202202'], impressions: 100 },
        { weekofyear: ['202203'], impressions: 200 },
        { isFake: true, weekofyear: '202201' },
      ]);
    });
  });
});
