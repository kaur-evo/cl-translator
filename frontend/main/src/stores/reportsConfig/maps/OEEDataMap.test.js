import OEEDataMap, {
  calcAvailability,
  calcPerformance,
  calcQuality,
  calcTechnicalAvailability,
  calcValue,
  calcOEE,
  getCalendarTimeSec,
} from './OEEDataMap';

import {
  defaultLocalizationOptions, dateFormatsMap,
} from '@/constants/formattingConstants';
import specialKey from '@/stores/reportsConfig/constants/specialKey';

const input = new Map([
  ['date', {
    date: '2022-11-25',
    scrapqty: 0.0,
    stationgroup: 'Tehas 2',
    qualityValue: 1.0,
    technicalavailabilityValue: 1.00000000,
    availability: 100.00,
    operator: '',
    oee: 50.0000,
    uncommentedstop: 0,
    station: 'Evocon production line T2',
    performanceValue: 0.50000000,
    oeeValue: 0.50000000000000000,
    unitId: 'tk',
    stationId: 1,
    product: 'Uus Johanna toode - Product route test',
    unplannedstop: 0,
    productId: 1957,
    technicalavailability: 100.00,
    plannedtime: 14400,
    idealperformanceqty: 1440.0,
    shifttemplate: 'Õhtu',
    technicalstop: 0,
    productiontime: 14400,
    quality: 100.0000,
    plannedstop: 0,
    availabilityValue: 1.00000000,
    performance: 50.00000000,
    qty: 720.0000,
    teamId: 0,
    commentedstop: 0,
    stationgroupId: 1,
    currentGroupByKey: 'date',
    primaryGroupByKey: 'date',
  }],
  ['weekofyear', {
    scrapqty: 0.0,
    stationgroup: 'Tehas 2',
    qualityValue: 1.0,
    technicalavailabilityValue: 1.00000000,
    availability: 100.00,
    operator: '',
    oee: 50.0000,
    uncommentedstop: 0,
    station: 'Evocon production line T2',
    performanceValue: 0.50000000,
    oeeValue: 0.50000000000000000,
    unitId: 'tk',
    stationId: 1,
    product: 'Uus Johanna toode - Product route test',
    unplannedstop: 0,
    productId: 1957,
    technicalavailability: 100.00,
    plannedtime: 14400,
    idealperformanceqty: 1440.0,
    shifttemplate: 'Õhtu',
    technicalstop: 0,
    productiontime: 14400,
    quality: 100.0000,
    plannedstop: 0,
    availabilityValue: 1.00000000,
    performance: 50.00000000,
    qty: 720.0000,
    teamId: 0,
    commentedstop: 0,
    weekofyear: '202247',
    stationgroupId: 1,
    currentGroupByKey: 'weekofyear',
    primaryGroupByKey: 'weekofyear',
  }],
  ['month', {
    scrapqty: 0.0,
    stationgroup: 'Tehas 1.',
    qualityValue: 1.0,
    technicalavailabilityValue: 1.00000000,
    availability: 0.72,
    operator: '',
    oee: 0.7181,
    uncommentedstop: 7200,
    station: 'Eelsorteer 1',
    performanceValue: 1.00000000,
    oeeValue: 0.00718114000000000,
    unitId: 'MIN',
    stationId: 53,
    product: 'Lauad 16x75 - (20x63)   200 tk/min',
    unplannedstop: 11326,
    productId: 8,
    technicalavailability: 100.00,
    plannedtime: 18660,
    idealperformanceqty: 1.0,
    shifttemplate: 'shift without days',
    technicalstop: 0,
    productiontime: 134,
    quality: 100.0000,
    plannedstop: 0,
    availabilityValue: 0.00718114,
    performance: 100.00000000,
    month: '202211',
    qty: 1.0000,
    teamId: 0,
    commentedstop: 11326,
    stationgroupId: 2,
    currentGroupByKey: 'month',
    primaryGroupByKey: 'month',
  }],
  ['year', {
    scrapqty: 0.0,
    stationgroup: 'Tehas 1.',
    year: '2022',
    qualityValue: 1.0,
    technicalavailabilityValue: 1.00000000,
    availability: 0.72,
    operator: '',
    oee: 0.7181,
    uncommentedstop: 7200,
    station: 'Eelsorteer 1',
    performanceValue: 1.00000000,
    oeeValue: 0.00718114000000000,
    unitId: 'MIN',
    stationId: 53,
    product: 'Lauad 16x75 - (20x63)   200 tk/min',
    unplannedstop: 11326,
    productId: 8,
    technicalavailability: 100.00,
    plannedtime: 18660,
    idealperformanceqty: 1.0,
    shifttemplate: 'shift without days',
    technicalstop: 0,
    productiontime: 134,
    quality: 100.0000,
    plannedstop: 0,
    availabilityValue: 0.00718114,
    performance: 100.00000000,
    qty: 1.0000,
    teamId: 0,
    commentedstop: 11326,
    stationgroupId: 2,
    currentGroupByKey: 'year',
    primaryGroupByKey: 'year',
  }],
  ['total', {
    scrapqty: 0.0,
    stationgroup: 'Tehas 1.',
    qualityValue: 1.0,
    technicalavailabilityValue: 1.00000000,
    availability: 0.72,
    operator: '',
    oee: 0.7181,
    uncommentedstop: 7200,
    station: 'Eelsorteer 1',
    performanceValue: 1.00000000,
    oeeValue: 0.00718114000000000,
    unitId: 'MIN',
    stationId: 53,
    product: 'Lauad 16x75 - (20x63)   200 tk/min',
    unplannedstop: 11326,
    productId: 8,
    technicalavailability: 100.00,
    plannedtime: 18660,
    idealperformanceqty: 1.0,
    shifttemplate: 'shift without days',
    technicalstop: 0,
    productiontime: 134,
    quality: 100.0000,
    plannedstop: 0,
    availabilityValue: 0.00718114,
    performance: 100.00000000,
    qty: 1.0000,
    teamId: 0,
    commentedstop: 11326,
    stationgroupId: 2,
    lotCode: 'LOT-001',
    productionOrder: 'ORDER-42',
    currentGroupByKey: 'stationId',
    primaryGroupByKey: 'stationId',
  }],
]);

describe('OEEDataMap', () => {
  describe('returns correctly formatted output...', () => {
    const opts = {
      groupBy: [''],
      startDate: '2022-11-25',
      endDate: '2022-11-26',
    };
    input.forEach((item, granularity) => {
      test(`while granularity is ${granularity}`, () => {
        const DataMapper = new OEEDataMap(item, {
          ...opts,
          granularity,
          translations: { Week: 'Week' },
          formattingOptions: { ...defaultLocalizationOptions, dateFormat: dateFormatsMap[defaultLocalizationOptions.dateFormat] },
        }).getFormatted();
        expect(DataMapper.formattedObj).toMatchSnapshot();
      });
    });
  });
  describe('returns correctly unformatted output...', () => {
    const opts = {
      dataPctTotal: 100,
      secondaryLabels: undefined,
      groupBy: [''],
    };
    input.forEach((item, granularity) => {
      test(`while granularity is ${granularity}`, () => {
        const DataMapper = new OEEDataMap(
          item,
          {
            ...opts,
            granularity,
            formattingOptions: {
              ...defaultLocalizationOptions,
              dateFormat: dateFormatsMap[defaultLocalizationOptions.dateFormat],
            },
          },
        ).getUnformatted();
        expect(DataMapper.unformattedObj).toMatchSnapshot();
      });
    });
  });
});

describe('calcAvailability', () => {
  it('should return 0 if plannedTime is 0', () => {
    const obj = { productionTime: 10, plannedTime: 0 };
    expect(calcAvailability(obj)).toBe(0);
  });

  it('should return the correct availability value if both productionTime and plannedTime are provided', () => {
    const obj = { productionTime: 10, plannedTime: 20 };
    expect(calcAvailability(obj)).toBe(0.5);
  });

  it('should return the correct availability value if only availabilityGroupProductionTime is provided', () => {
    const obj = { availabilityGroupProductionTime: 10, availabilityGroupPlannedTime: 20 };
    expect(calcAvailability(obj)).toBe(0.5);
  });
});

describe('calcPerformance', () => {
  it('should return 0 if idealPerformanceQty is 0', () => {
    const obj = { qty: 10, idealPerformanceQty: 0 };
    expect(calcPerformance(obj)).toBe(0);
  });

  it('should return the correct performance value if both qty and idealPerformanceQty are provided', () => {
    const obj = { qty: 10, idealPerformanceQty: 20 };
    expect(calcPerformance(obj)).toBe(0.5);
  });

  it('should return the correct performance value if only performanceGroupQty is provided', () => {
    const obj = { performanceGroupQty: 10, performanceGroupIdealPerfQty: 20 };
    expect(calcPerformance(obj)).toBe(0.5);
  });
});

describe('calcQuality', () => {
  it('should return 0 if qty is 0', () => {
    const obj = { scrapQty: 0, qty: 0 };
    expect(calcQuality(obj)).toBe(0);
  });

  it('should return 1 if scrapQty is 0', () => {
    const obj = { scrapQty: 0, qty: 10 };
    expect(calcQuality(obj)).toBe(1);
  });

  it('should return the correct quality value if both scrapQty and qty are provided', () => {
    const obj = { scrapQty: 2, qty: 10 };
    expect(calcQuality(obj)).toBe(0.8);
  });

  it('should return the correct quality value if only qualityGroupScrapQty is provided', () => {
    const obj = { qualityGroupScrapQty: 2, qualityGroupQty: 10 };
    expect(calcQuality(obj)).toBe(0.8);
  });
});

describe('calcTechnicalAvailability', () => {
  it('should return 1 if technicalStop is 0', () => {
    const obj = { technicalStop: 0, plannedTime: 10 };
    expect(calcTechnicalAvailability(obj)).toBe(1);
  });

  it('should return the correct technical availability value if both technicalStop and plannedTime are provided', () => {
    const obj = { technicalStop: 2, plannedTime: 10 };
    expect(calcTechnicalAvailability(obj)).toBe(0.8);
  });

  it('should return the correct technical availability value if only technicalGroupTechnicalStop is provided', () => {
    const obj = { technicalGroupTechnicalStop: 2, technicalGroupPlannedTime: 10 };
    expect(calcTechnicalAvailability(obj)).toBe(0.8);
  });
});

describe('calcOEE', () => {
  it('should return the correct OEE value', () => {
    const obj = {
      productionTime: 10,
      plannedTime: 20,
      qty: 10,
      idealPerformanceQty: 20,
      scrapQty: 2,
    };
    expect(calcOEE(obj)).toBe(0.2);
  });
});

describe('calcValue', () => {
  it('returns the correct value for availability group', () => {
    const obj = {
      [specialKey.PREPROCESSED_GROUP_ID_KEY]: 'availability',
      productionTime: 200,
      plannedTime: 250,
    };
    expect(calcValue(obj)).toBe(0.8);
  });

  it('returns the correct value for performance group', () => {
    const obj = {
      [specialKey.PREPROCESSED_GROUP_ID_KEY]: 'performance',
      qty: 1000,
      idealPerformanceQty: 1200,
    };
    expect(calcValue(obj)).toBeCloseTo(0.8333);
  });

  it('returns the correct value for quality group', () => {
    const obj = {
      [specialKey.PREPROCESSED_GROUP_ID_KEY]: 'quality',
      scrapQty: 20,
      qty: 100,
    };
    expect(calcValue(obj)).toBe(0.8);
  });

  it('returns the correct value for technical availability group', () => {
    const obj = {
      [specialKey.PREPROCESSED_GROUP_ID_KEY]: 'technicalAvailability',
      technicalStop: 50,
      plannedTime: 500,
    };
    expect(calcValue(obj)).toBe(0.9);
  });

  it('returns the correct value for OEE if the group id is not defined', () => {
    const obj = {
      [specialKey.PREPROCESSED_GROUP_ID_KEY]: 'other',
      productionTime: 200,
      plannedTime: 250,
      qty: 1000,
      idealPerformanceQty: 1200,
      scrapQty: 20,
    };
    expect(calcValue(obj)).toBeCloseTo(0.6533);
  });
});

describe('getCalendarTimeSec', () => {
  it('returns correct time for one station', () => {
    expect(getCalendarTimeSec({ station: new Set(['teststation']) }, ['2022-01-22', '2022-01-23'])).toBe(172800);
  });
  it('returns correct time for four stations', () => {
    expect(getCalendarTimeSec({ station: new Set(['teststation1', 'teststation2', 'teststation3', 'teststation4']) }, ['2022-01-22', '2022-01-23'])).toBe(4 * 172800);
  });
});
