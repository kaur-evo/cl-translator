import groupScrapArray from './groupScrapArray';

describe('groupScrapArray', () => {
  test('that empty scrapArray returns an empty objecy', () => {
    const result = groupScrapArray([]);
    expect(typeof result).toBe('object');
    expect(Object.keys(result).length).toBe(0);
  });

  test('that result contains key for every batch', () => {
    const timeline = [{
      batchId: 123, scrapReasonId: 123, scrapQty: 1, scrapNotes: 'test', sliceStartTmISO: '', sliceEndTmISO: '',
    }, {
      batchId: 321, scrapReasonId: 123, scrapQty: 1, scrapNotes: 'test', sliceStartTmISO: '', sliceEndTmISO: '',
    }];
    const resultKeys = Object.keys(groupScrapArray(timeline));
    expect(resultKeys.length).toBe(2);
    expect(resultKeys[0]).toBe('123');
    expect(resultKeys[1]).toBe('321');
  });

  test('that result contains all scrapReason and scrapNote pairs', () => {
    const timeline = [{
      batchId: 123, scrapReasonId: 123, scrapQty: 1, scrapNotes: 'test', sliceStartTmISO: '', sliceEndTmISO: '',
    }, {
      batchId: 123, scrapReasonId: 321, scrapQty: 1, scrapNotes: 'test 2', sliceStartTmISO: '', sliceEndTmISO: '',
    }, {
      batchId: 123, scrapReasonId: 321, scrapQty: 1, scrapNotes: 'test1', sliceStartTmISO: '', sliceEndTmISO: '',
    }];
    const resultKeysForBatch = Object.keys(Object.values(groupScrapArray(timeline))[0]);
    expect(resultKeysForBatch.length).toBe(3);
    expect(resultKeysForBatch[0]).toBe('123,test');
    expect(resultKeysForBatch[1]).toBe('321,test 2');
    expect(resultKeysForBatch[2]).toBe('321,test1');
  });

  test('that scrapReason and scrapNote pairs have total scrapQty', () => {
    const timeline = [{
      batchId: 123, scrapReasonId: 123, scrapQty: 1, scrapNotes: 'test', sliceStartTmISO: '', sliceEndTmISO: '',
    }, {
      batchId: 123, scrapReasonId: 123, scrapQty: 2, scrapNotes: 'test', sliceStartTmISO: '', sliceEndTmISO: '',
    }, {
      batchId: 123, scrapReasonId: 123, scrapQty: 4, scrapNotes: 'test1', sliceStartTmISO: '', sliceEndTmISO: '',
    }];
    const batchResult = groupScrapArray(timeline)[123];
    expect(batchResult['123,test'].scrapQty).toBe(3);
    expect(batchResult['123,test1'].scrapQty).toBe(4);
  });

  test('that scrapReason and scrapNote pairs have correct scrapReasonId', () => {
    const timeline = [{
      batchId: 123, scrapReasonId: 123, scrapQty: 1, scrapNotes: 'test', sliceStartTmISO: '', sliceEndTmISO: '',
    }, {
      batchId: 123, scrapReasonId: 123, scrapQty: 2, scrapNotes: 'test', sliceStartTmISO: '', sliceEndTmISO: '',
    }, {
      batchId: 123, scrapReasonId: 124, scrapQty: 4, scrapNotes: 'test1', sliceStartTmISO: '', sliceEndTmISO: '',
    }];
    const batchResult = groupScrapArray(timeline)[123];
    expect(batchResult['123,test'].scrapReasonId).toBe(123);
    expect(batchResult['124,test1'].scrapReasonId).toBe(124);
  });

  test('that scrapReason and scrapNote pairs have correct scrapNotes', () => {
    const timeline = [{
      batchId: 123, scrapReasonId: 123, scrapQty: 1, scrapNotes: 'test', sliceStartTmISO: '', sliceEndTmISO: '',
    }, {
      batchId: 123, scrapReasonId: 124, scrapQty: 2, scrapNotes: 'test1', sliceStartTmISO: '', sliceEndTmISO: '',
    }, {
      batchId: 123, scrapReasonId: 124, scrapQty: 4, scrapNotes: 'test', sliceStartTmISO: '', sliceEndTmISO: '',
    }];
    const batchResult = groupScrapArray(timeline)[123];
    expect(batchResult['123,test'].scrapNotes).toBe('test');
    expect(batchResult['124,test1'].scrapNotes).toBe('test1');
    expect(batchResult['124,test'].scrapNotes).toBe('test');
  });

  test('that scrapReason and scrapNote pairs have correct scrapRanges', () => {
    const timeline = [{
      batchId: 123, scrapReasonId: 123, scrapQty: 1, scrapNotes: 'test', sliceStartTmISO: '2022-02-22T16:00:00.000Z', sliceEndTmISO: '2022-02-22T16:01:00.000Z',
    }, {
      batchId: 123, scrapReasonId: 124, scrapQty: 2, scrapNotes: 'test1', sliceStartTmISO: '2022-02-22T16:02:00.000Z', sliceEndTmISO: '2022-02-22T16:03:00.000Z',
    }, {
      batchId: 123, scrapReasonId: 124, scrapQty: 4, scrapNotes: 'test1', sliceStartTmISO: '2022-02-22T16:04:00.000Z', sliceEndTmISO: '2022-02-22T16:05:00.000Z',
    }];
    const batchResult = groupScrapArray(timeline)[123];
    expect(batchResult['123,test'].scrapRanges.length).toBe(1);
    expect(batchResult['123,test'].scrapRanges[0].startTimeISO).toBe('2022-02-22T16:00:00.000Z');
    expect(batchResult['123,test'].scrapRanges[0].endTimeISO).toBe('2022-02-22T16:01:00.000Z');
    expect(batchResult['124,test1'].scrapRanges.length).toBe(2);
    expect(batchResult['124,test1'].scrapRanges[0].startTimeISO).toBe('2022-02-22T16:02:00.000Z');
    expect(batchResult['124,test1'].scrapRanges[0].endTimeISO).toBe('2022-02-22T16:03:00.000Z');
    expect(batchResult['124,test1'].scrapRanges[1].startTimeISO).toBe('2022-02-22T16:04:00.000Z');
    expect(batchResult['124,test1'].scrapRanges[1].endTimeISO).toBe('2022-02-22T16:05:00.000Z');
  });
});
