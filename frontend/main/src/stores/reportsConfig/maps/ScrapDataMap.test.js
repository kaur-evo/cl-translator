import ScrapDataMap from './ScrapDataMap';

import { defaultLocalizationOptions, dateFormatsMap } from '@/constants/formattingConstants';

const input = new Map([
  ['date', {
    date: '2022-11-25',
    scrapqty: 1.0,
    shiftId: 115072,
    product: '42x95',
    shifttime: 30300,
    stationgroup: 'Tehas 1.',
    productId: 269,
    rowproducedqty: 1.0000,
    scrapreasonid: 7,
    rowplannedtime: 60,
    shifttemplate: 'Õhtu',
    scrapColor: '#666666',
    goodproduction: 60.0,
    scrapreasongroupname: 'Default',
    scrapreasongroup: 'Vaikimisi grupp',
    scrapreason: 'Eesti - wrong measurements',
    station: 'Pakkimine 1',
    unitId: 'tk',
    scrapreasongroupid: 1,
    stationgroupId: 2,
    stationId: 54,
    entriesCount: 1,
    xAxisKey: 'date',
    scrapduration: 60,
    currentGroupByKey: 'date',
    primaryGroupByKey: 'date',
  }],
  ['weekofyear', {
    scrapqty: 1.0,
    shiftId: 115072,
    product: '42x95',
    shifttime: 30300,
    stationgroup: 'Tehas 1.',
    productId: 269,
    rowproducedqty: 1.0000,
    scrapreasonid: 7,
    rowplannedtime: 60,
    shifttemplate: 'Õhtu',
    scrapColor: '#666666',
    goodproduction: 60.0,
    scrapreasongroupname: 'Default',
    scrapreasongroup: 'Vaikimisi grupp',
    scrapreason: 'Eesti - wrong measurements',
    station: 'Pakkimine 1',
    unitId: 'tk',
    scrapreasongroupid: 1,
    weekofyear: '202247',
    stationgroupId: 2,
    stationId: 54,
    entriesCount: 1,
    xAxisKey: 'weekofyear',
    scrapduration: 60,
    currentGroupByKey: 'weekofyear',
    primaryGroupByKey: 'weekofyear',
  }],
  ['month', {
    scrapqty: 1.0,
    shiftId: 115072,
    product: '42x95',
    shifttime: 30300,
    stationgroup: 'Tehas 1.',
    productId: 269,
    rowproducedqty: 1.0000,
    scrapreasonid: 7,
    rowplannedtime: 60,
    shifttemplate: 'Õhtu',
    scrapColor: '#666666',
    goodproduction: 60.0,
    month: '202211',
    scrapreasongroupname: 'Default',
    scrapreasongroup: 'Vaikimisi grupp',
    scrapreason: 'Eesti - wrong measurements',
    station: 'Pakkimine 1',
    unitId: 'tk',
    scrapreasongroupid: 1,
    stationgroupId: 2,
    stationId: 54,
    entriesCount: 1,
    xAxisKey: 'month',
    scrapduration: 60,
    currentGroupByKey: 'month',
    primaryGroupByKey: 'month',
  }],
  ['year', {
    scrapqty: 1.0,
    shiftId: 115072,
    product: '42x95',
    shifttime: 30300,
    stationgroup: 'Tehas 1.',
    productId: 269,
    rowproducedqty: 1.0000,
    scrapreasonid: 7,
    year: '2022',
    rowplannedtime: 60,
    shifttemplate: 'Õhtu',
    scrapColor: '#666666',
    goodproduction: 60.0,
    scrapreasongroupname: 'Default',
    scrapreasongroup: 'Vaikimisi grupp',
    scrapreason: 'Eesti - wrong measurements',
    station: 'Pakkimine 1',
    unitId: 'tk',
    scrapreasongroupid: 1,
    stationgroupId: 2,
    stationId: 54,
    entriesCount: 1,
    xAxisKey: 'year',
    scrapduration: 60,
    currentGroupByKey: 'year',
    primaryGroupByKey: 'year',
  }],
  ['total', {
    scrapqty: 1.0,
    shiftId: 115072,
    product: '42x95',
    shifttime: 30300,
    stationgroup: 'Tehas 1.',
    productId: 269,
    rowproducedqty: 1.0000,
    scrapreasonid: 7,
    rowplannedtime: 60,
    shifttemplate: 'Õhtu',
    scrapColor: '#666666',
    goodproduction: 60.0,
    scrapreasongroupname: 'Default',
    scrapreasongroup: 'Vaikimisi grupp',
    scrapreason: 'Eesti - wrong measurements',
    station: 'Pakkimine 1',
    unitId: 'tk',
    scrapreasongroupid: 1,
    stationgroupId: 2,
    stationId: 54,
    entriesCount: 1,
    xAxisKey: 'entityId',
    scrapduration: 60,
    lotCode: 'LOT-001',
    productionOrder: 'ORDER-42',
    currentGroupByKey: 'stationId',
    primaryGroupByKey: 'stationId',
  }],
]);

describe('ScrapDataMap', () => {
  describe('returns correctly formatted output...', () => {
    const opts = {
      groupBy: [''],
    };
    input.forEach((item, granularity) => {
      test(`while granularity is ${granularity}`, () => {
        const DataMapper = new ScrapDataMap(item, {
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
        const DataMapper = new ScrapDataMap(
          item,
          { ...opts, granularity, formattingOptions: { ...defaultLocalizationOptions, dateFormat: dateFormatsMap[defaultLocalizationOptions.dateFormat] } },
        ).getUnformatted();
        expect(DataMapper.unformattedObj).toMatchSnapshot();
      });
    });
  });
});
