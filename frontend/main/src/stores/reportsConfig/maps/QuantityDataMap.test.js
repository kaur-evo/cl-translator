import QuantityDataMap from './QuantityDataMap';

import { defaultLocalizationOptions, dateFormatsMap } from '@/constants/formattingConstants';

const input = new Map([
  ['date', {
    date: '2022-11-25',
    scrapqty: 0.0,
    product: 'Uus Johanna toode - Product route test',
    stationgroup: 'Tehas 2',
    productId: 1957,
    rowproducedqty: 720.0000,
    shifttemplate: 'Õhtu',
    idealqty: 1440.0,
    goodqty: 720.0,
    operator: '',
    teamId: 0,
    station: 'Evocon production line T2',
    unitId: 'tk',
    stationgroupId: 1,
    stationId: 1,
    currentGroupByKey: 'date',
    primaryGroupByKey: 'date',
  }],
  ['weekofyear', {
    scrapqty: 0.0,
    product: 'Uus Johanna toode - Product route test',
    stationgroup: 'Tehas 2',
    productId: 1957,
    rowproducedqty: 720.0000,
    shifttemplate: 'Õhtu',
    idealqty: 1440.0,
    goodqty: 720.0,
    operator: '',
    teamId: 0,
    station: 'Evocon production line T2',
    unitId: 'tk',
    weekofyear: '202247',
    stationgroupId: 1,
    stationId: 1,
    currentGroupByKey: 'weekofyear',
    primaryGroupByKey: 'weekofyear',
  }],
  ['month', {
    scrapqty: 0.0,
    product: 'Lauad 16x75 - (20x63)   200 tk/min',
    stationgroup: 'Tehas 1.',
    productId: 8,
    rowproducedqty: 1.0000,
    shifttemplate: 'shift without days',
    idealqty: 139.25,
    goodqty: 1.0,
    operator: '',
    month: '202211',
    teamId: 0,
    station: 'Eelsorteer 1',
    unitId: 'MIN',
    stationgroupId: 2,
    stationId: 53,
    currentGroupByKey: 'month',
    primaryGroupByKey: 'month',
  }],
  ['year', {
    scrapqty: 0.0,
    product: 'Lauad 16x75 - (20x63)   200 tk/min',
    stationgroup: 'Tehas 1.',
    productId: 8,
    rowproducedqty: 1.0000,
    year: '2022',
    shifttemplate: 'shift without days',
    idealqty: 139.25,
    goodqty: 1.0,
    operator: '',
    teamId: 0,
    station: 'Eelsorteer 1',
    unitId: 'MIN',
    stationgroupId: 2,
    stationId: 53,
    currentGroupByKey: 'year',
    primaryGroupByKey: 'year',
  }],
  ['total', {
    scrapqty: 0.0,
    product: 'Lauad 16x75 - (20x63)   200 tk/min',
    stationgroup: 'Tehas 1.',
    productId: 8,
    rowproducedqty: 1.0000,
    shifttemplate: 'shift without days',
    idealqty: 139.25,
    goodqty: 1.0,
    operator: '',
    teamId: 0,
    station: 'Eelsorteer 1',
    unitId: 'MIN',
    stationgroupId: 2,
    stationId: 53,
    lotCode: 'LOT-001',
    productionOrder: 'ORDER-42',
    currentGroupByKey: 'stationgroupId',
    primaryGroupByKey: 'stationgroupId',
  }],
]);

describe('QuantityDataMap', () => {
  describe('returns correctly formatted output...', () => {
    const opts = {
      groupBy: [''],
    };
    input.forEach((item, granularity) => {
      test(`while granularity is ${granularity}`, () => {
        const DataMapper = new QuantityDataMap(item, {
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
        const DataMapper = new QuantityDataMap(
          item,
          { ...opts, granularity, formattingOptions: { ...defaultLocalizationOptions, dateFormat: dateFormatsMap[defaultLocalizationOptions.dateFormat] } },
        ).getUnformatted();
        expect(DataMapper.unformattedObj).toMatchSnapshot();
      });
    });
  });
});
