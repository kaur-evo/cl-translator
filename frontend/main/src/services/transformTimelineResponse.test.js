import transformTimelineResponse from './transformTimelineResponse';

describe('transformTimelineResponse', () => {
  it('Creates product slice with default scrap fields', () => {
    const timeline = {
      slices: [{
        stTmISO: '2019-01-01T08:00:00.000Z',
        enTmISO: '2019-01-01T08:01:10.000Z',
        typ: 'PRODUCT',
        bId: 123,
        qty: 10,
        ctg: 50,
        iQty: 10,
        dur: 70,
        shId: 1,
        ctc: 200,
        sgQty: 10,
      }],
      batches: [{
        id: 123,
        unitQty: 'kg',
        unitConversionType: 'ALT_TO_PRIMARY',
        unitConversion: 10,
      }],
      shift: { id: 1 },
      batchQtyBeforeShift: { producedQty: 0, scrapQty: 0 },
    };
    const comments = new Map();
    const scrapReasons = new Map();
    const currentShift = { id: 1 };
    const response = transformTimelineResponse(timeline, comments, scrapReasons, currentShift);
    expect(response).toEqual({
      batchTargetFlags: [],
      transformedTimeline: [{
        sliceStartTmISO: '2019-01-01T08:00:00.000Z',
        sliceEndTmISO: '2019-01-01T08:01:10.000Z',
        type: 'PRODUCT',
        batchId: 123,
        scrapQty: 0,
        scrapAltQty: 0,
        quantity: 10,
        quantityAlt: 100,
        quantityFromBatchStart: 10,
        scrapQtyFromBatchStart: 0,
        scrapNotes: '',
        signalNotes: '',
        scrapReasonId: 0,
        cycleTimeGood: 50,
        id: 0,
        isProductChange: false,
        cycleTimeCritical: 200,
        duration: 70,
        originalEndTimeString: '2019-01-01T08:01:10.000Z',
        idealQty: 10,
        idealAltQty: 100,
        shiftId: 1,
        yellowEnd: null,
        signalQty: 10,
        unitQty: 'kg',
      }],
    });
  });

  it('Creates product slice with scrap fields', () => {
    const timeline = {
      slices: [{
        stTmISO: '2019-01-01T08:00:00.000Z',
        enTmISO: '2019-01-01T08:01:10.000Z',
        typ: 'PRODUCT',
        bId: 123,
        qty: 10,
        sQty: 2.2,
        sNt: 'bla',
        srId: 2,
        ctg: 20,
        ctc: 100,
        iQty: 7,
        dur: 70,
        shId: 1,
        sgQty: 10,
      }],
      batches: [{
        id: 123,
        unitConversionType: 'ALT_TO_PRIMARY',
        unitConversion: 10,
        unitQty: 'kg',
      }],
      shift: { id: 1 },
      batchQtyBeforeShift: { producedQty: 0, scrapQty: 0 },
    };
    const comments = new Map();
    const scrapReasons = new Map();
    const currentShift = { id: 1 };
    const result = transformTimelineResponse(timeline, comments, scrapReasons, currentShift);
    expect(result).toEqual({
      batchTargetFlags: [],
      transformedTimeline: [{
        sliceStartTmISO: '2019-01-01T08:00:00.000Z',
        sliceEndTmISO: '2019-01-01T08:01:10.000Z',
        type: 'PRODUCT',
        batchId: 123,
        scrapQty: 2.2,
        scrapAltQty: 22,
        quantity: 10,
        quantityAlt: 100,
        quantityFromBatchStart: 7.8,
        scrapQtyFromBatchStart: 2.2,
        scrapNotes: 'bla',
        signalNotes: '',
        scrapReasonId: 2,
        id: 0,
        isProductChange: false,
        cycleTimeGood: 20,
        cycleTimeCritical: 100,
        duration: 70,
        idealQty: 7,
        idealAltQty: 70,
        originalEndTimeString: '2019-01-01T08:01:10.000Z',
        shiftId: 1,
        signalQty: 10,
        yellowEnd: null,
        unitQty: 'kg',
      }],
    });
  });

  it('Creates comment slice from STOPPAGE type', () => {
    const timeline = {
      slices: [{
        stTmISO: '2019-01-01T08:00:00.000Z',
        enTmISO: '2019-01-01T08:01:10.000Z',
        typ: 'STOPPAGE',
        bId: 123,
        cId: 10,
        pId: 2,
        note: 'bla',
        iQty: 5,
        inOee: true,
        dur: 70,
      }],
      batches: [{
        id: 123,
        cycleTimeCritical: 60,
        unitConversionType: 'ALT_TO_PRIMARY',
        unitConversion: 2,
      }],
      shift: { id: 1 },
      batchQtyBeforeShift: { producedQty: 0, scrapQty: 0 },
    };
    const comments = new Map();
    const scrapReasons = new Map();
    const currentShift = { id: 1 };
    const result = transformTimelineResponse(timeline, comments, scrapReasons, currentShift);
    expect(result).toEqual({
      batchTargetFlags: [],
      transformedTimeline: [{
        sliceStartTmISO: '2019-01-01T08:00:00.000Z',
        sliceEndTmISO: '2019-01-01T08:01:10.000Z',
        type: 'STOPPAGE',
        batchId: 123,
        commentId: 10,
        notes: 'bla',
        positionId: 2,
        id: 0,
        isProductChange: false,
        cycleTimeGood: undefined,
        cycleTimeCritical: 60,
        duration: 70,
        idealQty: 5,
        idealAltQty: 10,
        maxDuration: 0,
        originalEndTimeString: '2019-01-01T08:01:10.000Z',
        includeInOee: true,
      }],
    });
  });

  it('Creates standby slice from STANDBY type', () => {
    const timeline = {
      slices: [{
        stTmISO: '2019-01-01T08:00:00.000Z',
        enTmISO: '2019-01-01T08:01:10.000Z',
        typ: 'STANDBY',
        bId: 123,
        cId: 10,
        pId: 2,
        note: 'bla',
        iQty: 5,
        inOee: false,
        dur: 70,
      }],
      batches: [{
        id: 123,
        cycleTimeCritical: 60,
        unitConversionType: 'ALT_TO_PRIMARY',
        unitConversion: 2,
      }],
      shift: { id: 1 },
      batchQtyBeforeShift: { producedQty: 0, scrapQty: 0 },
    };
    const comments = new Map();
    const scrapReasons = new Map();
    const currentShift = { id: 1 };
    const result = transformTimelineResponse(timeline, comments, scrapReasons, currentShift);
    expect(result).toEqual({
      batchTargetFlags: [],
      transformedTimeline: [{
        sliceStartTmISO: '2019-01-01T08:00:00.000Z',
        sliceEndTmISO: '2019-01-01T08:01:10.000Z',
        type: 'STANDBY',
        batchId: 123,
        commentId: 10,
        notes: 'bla',
        positionId: 2,
        id: 0,
        isProductChange: false,
        cycleTimeGood: undefined,
        cycleTimeCritical: 60,
        duration: 70,
        idealQty: 5,
        idealAltQty: 10,
        maxDuration: 0,
        originalEndTimeString: '2019-01-01T08:01:10.000Z',
        includeInOee: false,
      }],
    });
  });

  it('creates correct SLOW slice', () => {
    const timeline = {
      slices: [{
        stTmISO: '2019-01-01T08:00:00.000Z',
        enTmISO: '2019-01-01T08:01:10.000Z',
        typ: 'PRODUCT',
        bId: 123,
        qty: 12,
        ctg: 0.2,
        ctc: 90,
        iQty: 10,
        dur: 70,
        shId: 1,
        sgQty: 1,
      }],
      batches: [{
        id: 123,
        unitConversionType: 'ALT_TO_PRIMARY',
        unitConversion: 10,
        unitQty: 'kg',
      }],
      shift: { id: 1 },
      batchQtyBeforeShift: { producedQty: 0, scrapQty: 0 },
    };
    const comments = new Map();
    const currentShift = { id: 1 };
    const response = transformTimelineResponse(timeline, comments, currentShift, 'Europe/Tallinn');
    expect(response).toEqual({
      batchTargetFlags: [],
      transformedTimeline: [{
        sliceStartTmISO: '2019-01-01T08:00:00.000Z',
        sliceEndTmISO: '2019-01-01T08:01:10.000Z',
        type: 'PRODUCT',
        batchId: 123,
        scrapQty: 0,
        scrapAltQty: 0,
        quantity: 12,
        quantityAlt: 120,
        quantityFromBatchStart: 12,
        scrapQtyFromBatchStart: 0,
        scrapNotes: '',
        signalNotes: '',
        scrapReasonId: 0,
        cycleTimeGood: 0.2,
        id: 0,
        isProductChange: false,
        cycleTimeCritical: 90,
        duration: 70,
        originalEndTimeString: '2019-01-01T08:01:10.000Z',
        idealQty: 10,
        idealAltQty: 100,
        shiftId: 1,
        signalQty: 1,
        yellowEnd: '2019-01-01T10:01:07.000+02:00',
        unitQty: 'kg',
      }],
    });
  });

  it('Creates correct slices from response', () => {
    const timeline = {
      slices: [{
        stTmISO: '2019-01-01T08:00:00.000Z',
        enTmISO: '2019-01-01T08:00:10.000Z',
        typ: 'PRODUCT',
        bId: 123,
        qty: 10,
        iQty: 5,
        dur: 10,
        sgQty: 10,
        shId: 2,
      }, {
        stTmISO: '2019-01-01T08:01:10.000Z',
        enTmISO: '2019-01-01T08:02:10.000Z',
        typ: 'STANDBY',
        bId: 123,
        cId: 10,
        pId: 2,
        note: 'bla',
        iQty: 20,
        inOee: true,
        dur: 60,
        jId: 2,
        shId: 2,
      }],
      batches: [{
        id: 123,
        cycleTimeCritical: 30,
        unitConversionType: 'ALT_TO_PRIMARY',
        unitConversion: 2,
        unitQty: 'kg',
      }],
      shift: { id: 1 },
      batchQtyBeforeShift: { producedQty: 0, scrapQty: 0 },
    };
    const comments = new Map();
    const scrapReasons = new Map();
    const currentShift = { id: 1 };
    const result = transformTimelineResponse(timeline, comments, scrapReasons, currentShift);
    expect(result).toEqual({
      batchTargetFlags: [],
      transformedTimeline: [{
        sliceStartTmISO: '2019-01-01T08:00:00.000Z',
        sliceEndTmISO: '2019-01-01T08:00:10.000Z',
        type: 'PRODUCT',
        batchId: 123,
        scrapQty: 0,
        scrapAltQty: 0,
        quantity: 10,
        quantityAlt: 20,
        quantityFromBatchStart: 10,
        scrapQtyFromBatchStart: 0,
        scrapNotes: '',
        signalNotes: '',
        scrapReasonId: 0,
        cycleTimeGood: undefined,
        id: 0,
        isProductChange: false,
        cycleTimeCritical: 30,
        duration: 10,
        idealQty: 5,
        idealAltQty: 10,
        originalEndTimeString: '2019-01-01T08:00:10.000Z',
        shiftId: 2,
        signalQty: 10,
        unitQty: 'kg',
        yellowEnd: null,
      }, {
        sliceEndTmISO: '2019-01-01T08:02:10.000Z',
        sliceStartTmISO: '2019-01-01T08:01:10.000Z',
        type: 'STANDBY',
        batchId: 123,
        commentId: 10,
        notes: 'bla',
        positionId: 2,
        id: 1,
        isProductChange: false,
        cycleTimeGood: undefined,
        cycleTimeCritical: 30,
        duration: 60,
        idealQty: 20,
        idealAltQty: 40,
        maxDuration: 0,
        originalEndTimeString: '2019-01-01T08:02:10.000Z',
        includeInOee: true,
        joinId: 2,
        shiftId: 2,
        unitQty: 'kg',
      }],
    });
  });

  it('creates fake product slice from stoppage if shift is running and last slice ctc is more than time from last product slice', () => {
    const timeline = {
      slices: [{
        stTmISO: '2019-01-01T16:27:49.000Z',
        enTmISO: '2019-01-01T16:28:49.000Z',
        typ: 'PRODUCT',
        bId: 123,
        qty: 1,
        ctg: 60,
        iQty: 1,
        dur: 60,
        shId: 1,
      }, {
        stTmISO: '2019-01-01T16:28:49.000Z',
        enTmISO: '2019-01-01T16:30:00.000Z',
        typ: 'STOPPAGE',
        bId: 123,
        cId: 0,
        dur: 71,
        iQty: 1.18,
        pId: 0,
        shId: 1,
        inOee: true,
      }],
      batches: [{
        id: 123,
        cycleTimeGood: 60,
        cycleTimeCritical: 120,
        unitConversionType: 'PRIMARY_TO_ALT',
        unitConversion: 1,
      }],
      shift: { id: 1 },
      batchQtyBeforeShift: { producedQty: 0, scrapQty: 0 },
    };
    const comments = new Map();
    const isShiftRunning = true;
    const result = transformTimelineResponse(timeline, comments, isShiftRunning, 'Europe/Tallinn');
    expect(result).toEqual({
      batchTargetFlags: [],
      transformedTimeline: [{
        sliceStartTmISO: '2019-01-01T16:27:49.000Z',
        sliceEndTmISO: '2019-01-01T16:28:49.000Z',
        type: 'PRODUCT',
        batchId: 123,
        scrapQty: 0,
        scrapAltQty: 0,
        quantity: 1,
        quantityAlt: 1,
        quantityFromBatchStart: 1,
        scrapQtyFromBatchStart: 0,
        scrapNotes: '',
        signalNotes: '',
        scrapReasonId: 0,
        shiftId: 1,
        cycleTimeGood: 60,
        id: 0,
        isProductChange: false,
        cycleTimeCritical: 120,
        duration: 60,
        idealQty: 1,
        idealAltQty: 1,
        signalQty: undefined,
        unitQty: undefined,
        originalEndTimeString: '2019-01-01T16:28:49.000Z',
        yellowEnd: null,
      }, {
        sliceStartTmISO: '2019-01-01T16:28:49.000Z',
        sliceEndTmISO: '2019-01-01T16:30:00.000Z',
        type: 'PRODUCT',
        batchId: -1,
        commentId: 0,
        quantity: NaN,
        cycleTimeGood: 60,
        id: 1,
        isFake: true,
        isProductChange: false,
        cycleTimeCritical: 120,
        duration: 71,
        idealQty: 1.18,
        idealAltQty: 1.18,
        includeInOee: true,
        joinId: undefined,
        maxDuration: 0,
        notes: undefined,
        positionId: 0,
        unitQty: undefined,
        shiftId: 1,
        originalEndTimeString: '2019-01-01T16:30:00.000Z',
      }],
    });
  });

  it('doesnt create fake product slice from stoppage slice if shift is not running', () => {
    const timeline = {
      slices: [{
        stTmISO: '2019-01-01T16:27:49.000Z',
        enTmISO: '2019-01-01T16:28:49.000Z',
        typ: 'PRODUCT',
        bId: 123,
        qty: 1,
        ctg: 60,
        iQty: 1,
        dur: 60,
        shId: 1,
      }, {
        stTmISO: '2019-01-01T16:28:49.000Z',
        enTmISO: '2019-01-01T16:30:00.000Z',
        typ: 'STOPPAGE',
        bId: 123,
        cId: 0,
        dur: 71,
        iQty: 1.18,
        pId: 0,
        shId: 1,
        inOee: true,
      }],
      batches: [{
        id: 123,
        cycleTimeGood: 60,
        cycleTimeCritical: 120,
        unitConversionType: 'PRIMARY_TO_ALT',
        unitConversion: 1,
      }],
      shift: { id: 1 },
      batchQtyBeforeShift: { producedQty: 0, scrapQty: 0 },
    };
    const comments = new Map();
    const isShiftRunning = false;
    const result = transformTimelineResponse(timeline, comments, isShiftRunning, 'Europe/Tallinn');
    expect(result).toEqual({
      batchTargetFlags: [],
      transformedTimeline: [{
        sliceStartTmISO: '2019-01-01T16:27:49.000Z',
        sliceEndTmISO: '2019-01-01T16:28:49.000Z',
        type: 'PRODUCT',
        batchId: 123,
        scrapQty: 0,
        scrapAltQty: 0,
        quantity: 1,
        quantityAlt: 1,
        quantityFromBatchStart: 1,
        scrapQtyFromBatchStart: 0,
        scrapNotes: '',
        signalNotes: '',
        scrapReasonId: 0,
        shiftId: 1,
        cycleTimeGood: 60,
        id: 0,
        isProductChange: false,
        cycleTimeCritical: 120,
        duration: 60,
        idealQty: 1,
        idealAltQty: 1,
        signalQty: undefined,
        unitQty: undefined,
        originalEndTimeString: '2019-01-01T16:28:49.000Z',
        yellowEnd: null,
      }, {
        sliceStartTmISO: '2019-01-01T16:28:49.000Z',
        sliceEndTmISO: '2019-01-01T16:30:00.000Z',
        type: 'STOPPAGE',
        batchId: 123,
        commentId: 0,
        notes: undefined,
        positionId: 0,
        id: 1,
        isProductChange: false,
        cycleTimeGood: 60,
        cycleTimeCritical: 120,
        duration: 71,
        idealQty: 1.18,
        idealAltQty: 1.18,
        includeInOee: true,
        joinId: undefined,
        maxDuration: 0,
        unitQty: undefined,
        shiftId: 1,
        originalEndTimeString: '2019-01-01T16:30:00.000Z',
      }],
    });
  });
});
