import CommentDataMap from './CommentDataMap';

import { defaultLocalizationOptions, dateFormatsMap } from '@/constants/formattingConstants';

const input = new Map([
  ['date', {
    category: 0,
    comment: 'Konveier 1',
    commentColor: '#E67E22',
    commentGroupName: 'Mechanics T2',
    commentId: 167,
    commentgroup: 'MehaanikaT2',
    commentgroupId: 1,
    date: '2022-01-21',
    notescount: 0,
    positionId: 0,
    station: 'Eelsorteer 1',
    stationId: 53,
    stopcount: 1,
    stopduration: 9000,
    totalplannedtime: null,
    rowplannedtime: 18000,
    stoplocation: 'Teadmata',
    stoptype: ['Unplanned'],
    stationgroupId: 1,
    stationgroup: 'stationGroup',
    includedinoeestops: 4500,
    currentGroupByKey: 'date',
    primaryGroupByKey: 'date',
  }],
  ['weekofyear', {
    commentgroupId: 1,
    stopduration: 9000,
    totalplannedtime: null,
    rowplannedtime: 18000,
    stoplocation: 'Teadmata',
    stopcount: 1,
    notescount: 0,
    positionId: 0,
    stoptype: ['Unplanned'],
    station: 'Eelsorteer 1',
    commentId: 167,
    comment: 'Konveier 1',
    commentGroupName: 'Mechanics T2',
    commentColor: '#E67E22',
    category: 0,
    commentgroup: 'MehaanikaT2',
    weekofyear: '202203',
    stationId: 53,
    stationgroupId: 1,
    stationgroup: 'stationGroup',
    includedinoeestops: 4500,
    currentGroupByKey: 'weekofyear',
    primaryGroupByKey: 'weekofyear',
  }],
  ['month', {
    commentgroupId: 1,
    stopduration: 9000,
    totalplannedtime: null,
    rowplannedtime: 18000,
    stoplocation: 'Teadmata',
    stopcount: 1,
    notescount: 0,
    positionId: 0,
    month: '202201',
    stoptype: ['Unplanned'],
    station: 'Eelsorteer 1',
    commentId: 167,
    comment: 'Konveier 1',
    commentGroupName: 'Mechanics T2',
    commentColor: '#E67E22',
    category: 0,
    commentgroup: 'MehaanikaT2',
    stationId: 53,
    stationgroupId: 1,
    stationgroup: 'stationGroup',
    includedinoeestops: 4500,
    currentGroupByKey: 'month',
    primaryGroupByKey: 'month',
  }],
  ['year', {
    commentgroupId: 1,
    year: '2022',
    stopduration: 9000,
    totalplannedtime: null,
    rowplannedtime: 18000,
    stoplocation: 'Teadmata',
    stopcount: 1,
    notescount: 0,
    positionId: 0,
    stoptype: ['Unplanned'],
    station: 'Eelsorteer 1',
    commentId: 167,
    comment: 'Konveier 1',
    commentGroupName: 'Mechanics T2',
    commentColor: '#E67E22',
    category: 0,
    commentgroup: 'MehaanikaT2',
    stationId: 53,
    stationgroupId: 1,
    stationgroup: 'stationGroup',
    includedinoeestops: 4500,
    currentGroupByKey: 'year',
    primaryGroupByKey: 'year',
  }],
  ['total', {
    commentgroupId: 1,
    stopduration: 9000,
    totalplannedtime: null,
    rowplannedtime: 18000,
    stoplocation: 'Teadmata',
    stopcount: 1,
    notescount: 0,
    positionId: 0,
    stoptype: ['Unplanned'],
    station: 'Eelsorteer 1',
    commentId: 167,
    comment: 'Konveier 1',
    commentGroupName: 'Mechanics T2',
    commentColor: '#E67E22',
    category: 0,
    commentgroup: 'MehaanikaT2',
    stationId: 53,
    stationgroupId: 1,
    stationgroup: 'stationGroup',
    includedinoeestops: 4500,
    lotCode: 'LOT-001',
    productionOrder: 'ORDER-42',
    currentGroupByKey: 'commentId',
    primaryGroupByKey: 'commentId',
  }],
]);

describe('CommentDataMap', () => {
  describe('returns correctly formatted output...', () => {
    const opts = {
      dataPctTotal: 100,
      secondaryLabels: undefined,
      groupBy: [''],
    };
    input.forEach((item, granularity) => {
      test(`while granularity is ${granularity}`, () => {
        const DataMapper = new CommentDataMap(item, {
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
        const DataMapper = new CommentDataMap(
          item,
          { ...opts, granularity, formattingOptions: { ...defaultLocalizationOptions, dateFormat: dateFormatsMap[defaultLocalizationOptions.dateFormat] } },
        ).getUnformatted();
        expect(DataMapper.unformattedObj).toMatchSnapshot();
      });
    });
  });
});
