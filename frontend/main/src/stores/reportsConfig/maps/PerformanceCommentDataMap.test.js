import PerformanceCommentDataMap from './PerformanceCommentDataMap';

import { defaultLocalizationOptions, dateFormatsMap } from '@/constants/formattingConstants';

const input = new Map([
  ['date', {
    performanceComment: 'Konveier 1',
    performanceCommentId: 167,
    performancelossgroup: 'Default',
    performancelossgroupName: 'Vaikimisi grupp',
    performanceCommentGroupId: 1,
    performancelosslocation: 'Teadmata',
    performancePositionId: 0,
    performanceCommentColor: '#E67E22',
    performancelossduration: 9000,
    performancelossnotescount: 0,
    performancelosscount: 1,
    station: 'Eelsorteer 1',
    stationId: 53,
    date: '2022-01-21',
    stationgroupId: 1,
    stationgroup: 'stationGroup',
    plannedtime: 18000,
    currentGroupByKey: 'date',
    primaryGroupByKey: 'date',
  }],
  ['weekofyear', {
    performanceComment: 'Konveier 1',
    performanceCommentId: 167,
    performancelossgroup: 'Default',
    performancelossgroupName: 'Vaikimisi grupp',
    performanceCommentGroupId: 1,
    performancelosslocation: 'Teadmata',
    performancePositionId: 0,
    performanceCommentColor: '#E67E22',
    performancelossduration: 9000,
    performancelossnotescount: 0,
    performancelosscount: 1,
    station: 'Eelsorteer 1',
    stationId: 53,
    date: '2022-01-21',
    weekofyear: '202203',
    stationgroupId: 1,
    stationgroup: 'stationGroup',
    plannedtime: 18000,
    currentGroupByKey: 'weekofyear',
    primaryGroupByKey: 'weekofyear',
  }],
  ['month', {
    performanceComment: 'Konveier 1',
    performanceCommentId: 167,
    performancelossgroup: 'Default',
    performancelossgroupName: 'Vaikimisi grupp',
    performanceCommentGroupId: 1,
    performancelosslocation: 'Teadmata',
    performancePositionId: 0,
    performanceCommentColor: '#E67E22',
    performancelossduration: 9000,
    performancelossnotescount: 0,
    performancelosscount: 1,
    station: 'Eelsorteer 1',
    stationId: 53,
    date: '2022-01-21',
    month: '202201',
    stationgroupId: 1,
    stationgroup: 'stationGroup',
    plannedtime: 18000,
    currentGroupByKey: 'month',
    primaryGroupByKey: 'month',
  }],
  ['year', {
    performanceComment: 'Konveier 1',
    performanceCommentId: 167,
    performancelossgroup: 'Default',
    performancelossgroupName: 'Vaikimisi grupp',
    performanceCommentGroupId: 1,
    performancelosslocation: 'Teadmata',
    performancePositionId: 0,
    performanceCommentColor: '#E67E22',
    performancelossduration: 9000,
    performancelossnotescount: 0,
    performancelosscount: 1,
    station: 'Eelsorteer 1',
    stationId: 53,
    date: '2022-01-21',
    year: '2022',
    stationgroupId: 1,
    stationgroup: 'stationGroup',
    plannedtime: 18000,
    currentGroupByKey: 'year',
    primaryGroupByKey: 'year',
  }],
  ['total', {
    performanceComment: 'Konveier 1',
    performanceCommentId: 167,
    performancelossgroup: 'Default',
    performancelossgroupName: 'Vaikimisi grupp',
    performanceCommentGroupId: 1,
    performancelosslocation: 'Teadmata',
    performancePositionId: 0,
    performanceCommentColor: '#E67E22',
    performancelossduration: 9000,
    performancelossnotescount: 0,
    performancelosscount: 1,
    station: 'Eelsorteer 1',
    stationId: 53,
    date: '2022-01-21',
    stationgroupId: 1,
    stationgroup: 'stationGroup',
    lotCode: 'LOT-001',
    productionOrder: 'ORDER-42',
    currentGroupByKey: 'performanceCommentId',
    primaryGroupByKey: 'performanceCommentId',
  }],
]);

describe('PerformanceCommentDataMap', () => {
  describe('returns correctly formatted output...', () => {
    const opts = {
      dataPctTotal: 100,
      secondaryLabels: undefined,
      groupBy: [''],
    };
    input.forEach((item, granularity) => {
      test(`while granularity is ${granularity}`, () => {
        const DataMapper = new PerformanceCommentDataMap(item, {
          ...opts, granularity, translations: { Week: 'Week' }, formattingOptions: { ...defaultLocalizationOptions, dateFormat: dateFormatsMap[defaultLocalizationOptions.dateFormat] },
        }).getFormatted();
        expect(DataMapper.formattedObj).toMatchSnapshot();
      });
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
      const DataMapper = new PerformanceCommentDataMap(
        item,
        { ...opts, granularity, formattingOptions: { ...defaultLocalizationOptions, dateFormat: dateFormatsMap[defaultLocalizationOptions.dateFormat] } },
      ).getUnformatted();
      expect(DataMapper.unformattedObj).toMatchSnapshot();
    });
  });
});
