import TimeUsageDataMap from './TimeUsageDataMap';

import { defaultLocalizationOptions, dateFormatsMap } from '@/constants/formattingConstants';

const input = new Map([
  ['date', {
    date: '2022-11-25',
    slowproduction: 7200.0,
    product: 'Uus Johanna toode - Product route test',
    stationgroup: 'Tehas 2',
    unplannedstop: 0,
    productId: 1957,
    plannedtime: 14400,
    shiftTime: 14800,
    shifttemplate: 'Õhtu',
    plannedstopincludedinoee: 0,
    operator: '',
    plannedstop: 0,
    goodproduction: 7200.0,
    uncommentedstop: 0,
    teamId: 0,
    station: 'Evocon production line T2',
    unitId: 'tk',
    stops: 0,
    stationgroupId: 1,
    stationId: 1,
    currentGroupByKey: 'date',
    primaryGroupByKey: 'date',
  }],
  ['weekofyear', {
    slowproduction: 7200.0,
    product: 'Uus Johanna toode - Product route test',
    stationgroup: 'Tehas 2',
    unplannedstop: 0,
    productId: 1957,
    plannedtime: 14400,
    shiftTime: 14800,
    shifttemplate: 'Õhtu',
    plannedstopincludedinoee: 0,
    operator: '',
    plannedstop: 0,
    goodproduction: 7200.0,
    uncommentedstop: 0,
    teamId: 0,
    station: 'Evocon production line T2',
    unitId: 'tk',
    stops: 0,
    weekofyear: '202247',
    stationgroupId: 1,
    stationId: 1,
    currentGroupByKey: 'weekofyear',
    primaryGroupByKey: 'weekofyear',
  }],
  ['month', {
    slowproduction: 0.0,
    product: 'Lauad 16x75 - (20x63)   200 tk/min',
    stationgroup: 'Tehas 1.',
    unplannedstop: 11326,
    productId: 8,
    plannedtime: 18660,
    shiftTime: 14800,
    shifttemplate: 'shift without days',
    plannedstopincludedinoee: 0,
    operator: '',
    plannedstop: 0,
    goodproduction: 134.0,
    month: '202211',
    uncommentedstop: 7200,
    teamId: 0,
    station: 'Eelsorteer 1',
    unitId: 'MIN',
    stops: 18526,
    stationgroupId: 2,
    stationId: 53,
    currentGroupByKey: 'month',
    primaryGroupByKey: 'month',
  }],
  ['year', {
    slowproduction: 0.0,
    product: 'Lauad 16x75 - (20x63)   200 tk/min',
    stationgroup: 'Tehas 1.',
    unplannedstop: 11326,
    productId: 8,
    year: '2022',
    plannedtime: 18660,
    shiftTime: 14800,
    shifttemplate: 'shift without days',
    plannedstopincludedinoee: 0,
    operator: '',
    plannedstop: 0,
    goodproduction: 134.0,
    uncommentedstop: 7200,
    teamId: 0,
    station: 'Eelsorteer 1',
    unitId: 'MIN',
    stops: 18526,
    stationgroupId: 2,
    stationId: 53,
    currentGroupByKey: 'year',
    primaryGroupByKey: 'year',
  }],
  ['total', {
    slowproduction: 0.0,
    product: 'Lauad 16x75 - (20x63)   200 tk/min',
    stationgroup: 'Tehas 1.',
    unplannedstop: 11326,
    productId: 8,
    plannedtime: 18660,
    shiftTime: 14800,
    shifttemplate: 'shift without days',
    plannedstopincludedinoee: 0,
    operator: '',
    plannedstop: 0,
    goodproduction: 134.0,
    uncommentedstop: 7200,
    teamId: 0,
    station: 'Eelsorteer 1',
    unitId: 'MIN',
    stops: 18526,
    stationgroupId: 2,
    stationId: 53,
    lotCode: 'LOT-001',
    productionOrder: 'ORDER-42',
    currentGroupByKey: 'stationgroupId',
    primaryGroupByKey: 'stationgroupId',
  }],
]);

describe('TimeUsageDataMap', () => {
  describe('returns correctly formatted output...', () => {
    const opts = {
      groupBy: [''],
    };
    input.forEach((item, granularity) => {
      test(`while granularity is ${granularity}`, () => {
        const DataMapper = new TimeUsageDataMap(item, {
          ...opts, granularity, translations: { Week: 'Week' }, formattingOptions: { ...defaultLocalizationOptions, dateFormat: dateFormatsMap[defaultLocalizationOptions.dateFormat] },
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
        const DataMapper = new TimeUsageDataMap(
          item,
          { ...opts, granularity, formattingOptions: { ...defaultLocalizationOptions, dateFormat: dateFormatsMap[defaultLocalizationOptions.dateFormat] } },
        ).getUnformatted();
        expect(DataMapper.unformattedObj).toMatchSnapshot();
      });
    });
  });
});
