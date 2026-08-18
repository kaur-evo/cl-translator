import { DateTime } from 'luxon';

import {
  getAvailability, getPerformance, getQuality, calculateTotals, calculateStatistics, getStats,
} from './statisticsCalculator';

describe('getAvailability', () => {
  // availability = (shiftTotals.productionTime / (shiftTotals.totalTime - shiftTotals.standByTime))
  it('returs 0 in case totalTime === standByTime', () => {
    const totals = {
      standByTime: 200,
      totalTime: 200,
      productionTime: 0,
    };
    expect(getAvailability(totals)).toEqual(0);
  });
  it('calculates correct availability', () => {
    const totals = {
      standByTime: 100,
      totalTime: 4100,
      productionTime: 2500,
    };
    expect(getAvailability(totals)).toEqual(0.625);
  });
});

describe('getQuality', () => {
  it('returs 0 in case there is no production', () => {
    const totals = {
      quantity: 0,
      scrapQty: 0,
    };
    expect(getQuality(totals)).toEqual(0);
  });
  it('calculates correct availability', () => {
    const totals = {
      quantity: 100,
      scrapQty: 10,
    };
    expect(getQuality(totals)).toEqual(0.9);
  });
});

describe('getPerformance', () => {
// performance = shiftTotals.goodProduction / shiftTotals.productionTime
  it('returs 0 in case there is no production', () => {
    const totals = {
      productionTime: 0,
      goodProduction: 0,
    };
    expect(getPerformance(totals)).toEqual(0);
  });
  it('calculates correct performance', () => {
    const totals = {
      quantity: 25,
      productIdealQty: 100,
    };
    expect(getPerformance(totals)).toEqual(0.25);
  });
});

describe('calculateTotals', () => {
  it('calculates correct totals based on timeline', () => {
    const timeline = [
      {
        quantity: 50,
        quantityAlt: 500,
        type: 'PRODUCT',
        scrapQty: 5,
        scrapAltQty: 50,
        duration: 600,
        cycleTimeGood: 4, // goodDuration = 50 * 4 = 200
        idealQty: 150,
        idealAltQty: 1500,
      },
      {
        type: 'STANDBY',
        duration: 300,
        idealQty: 0,
        idealAltQty: 0,
        commentId: 4,
        includeInOee: false,
      },
      {
        type: 'STOPPAGE',
        duration: 120,
        idealQty: 30,
        idealAltQty: 300,
        commentId: 0,
        includeInOee: true,
      },
      {
        quantity: 10,
        quantityAlt: 100,
        type: 'PRODUCT',
        scrapQty: 0,
        scrapAltQty: 0,
        duration: 180,
        cycleTimeGood: 5, // goodDuration = 10 * 5 = 50
        idealQty: 36,
        idealAltQty: 360,
      },
      {
        quantity: 200,
        quantityAlt: 2000,
        type: 'PRODUCT',
        scrapQty: 25,
        scrapAltQty: 250,
        duration: 60,
        cycleTimeGood: 1, // goodDuration = 200 * 1 =200
        idealQty: 60,
        idealAltQty: 600,
      },
    ];
    const now = DateTime.local().setZone('Europe/Tallinn');
    const { shiftStats } = calculateTotals(timeline, now, 'UTC', new Map());
    expect(shiftStats).toEqual({
      quantity: 260,
      quantityAlt: 2600,
      scrapQty: 30,
      scrapAltQty: 300,
      standByTime: 300,
      totalTime: 1260,
      productionTime: 840,
      delaysCount: 1,
      delaysTime: 120,
      idealQty: 276,
      idealAltQty: 2760,
      productIdealQty: 246,
    });
  });

  it('calculates correct totals based on timeline if STANDBY is included in oee', () => {
    const timeline = [
      {
        quantity: 50,
        quantityAlt: 500,
        type: 'PRODUCT',
        scrapQty: 5,
        scrapAltQty: 50,
        duration: 600,
        cycleTimeGood: 4, // goodDuration = 50 * 4 = 200
        idealQty: 150,
        idealAltQty: 1500,
      },
      {
        type: 'STANDBY',
        duration: 300,
        idealQty: 20,
        idealAltQty: 200,
        commentId: 4,
        includeInOee: true,
      },
      {
        type: 'STOPPAGE',
        duration: 120,
        idealQty: 30,
        idealAltQty: 300,
        commentId: 0,
        includeInOee: true,
      },
      {
        quantity: 10,
        quantityAlt: 100,
        type: 'PRODUCT',
        scrapQty: 0,
        scrapAltQty: 0,
        duration: 180,
        cycleTimeGood: 5, // goodDuration = 10 * 5 = 50
        idealQty: 36,
        idealAltQty: 360,
      },
      {
        quantity: 200,
        quantityAlt: 2000,
        type: 'PRODUCT',
        scrapQty: 25,
        scrapAltQty: 250,
        duration: 60,
        cycleTimeGood: 1, // goodDuration = 200 * 1 =200
        idealQty: 60,
        idealAltQty: 600,
      },
    ];
    const now = DateTime.local().setZone('Europe/Tallinn');
    const { shiftStats } = calculateTotals(timeline, now, 'UTC', new Map());
    expect(shiftStats).toEqual({
      quantity: 260,
      scrapQty: 30,
      standByTime: 0,
      totalTime: 1260,
      productionTime: 840,
      delaysCount: 1,
      delaysTime: 120,
      idealQty: 296,
      idealAltQty: 2960,
      productIdealQty: 246,
      quantityAlt: 2600,
      scrapAltQty: 300,
    });
  });

  it('doesnt include fake green in other statistic values than idealQty and totalTime', () => {
    const now = DateTime.local().setZone('Europe/Tallinn');
    const timeline = [
      {
        quantity: 50,
        quantityAlt: 500,
        type: 'PRODUCT',
        scrapQty: 5,
        scrapAltQty: 50,
        duration: 600,
        cycleTimeGood: 4, // goodDuration = 50 * 4 = 200
        idealQty: 150,
        idealAltQty: 1500,
      },
      {
        type: 'STANDBY',
        duration: 300,
        idealQty: 0,
        idealAltQty: 0,
        commentId: 4,
        includeInOee: false,
      },
      {
        type: 'STOPPAGE',
        duration: 120,
        idealQty: 30,
        idealAltQty: 300,
        commentId: 0,
        includeInOee: true,
      },
      {
        quantity: 10,
        quantityAlt: 100,
        type: 'PRODUCT',
        scrapQty: 0,
        scrapAltQty: 0,
        duration: 180,
        cycleTimeGood: 5, // goodDuration = 10 * 5 = 50
        idealQty: 36,
        idealAltQty: 360,
      },
      {
        quantity: 200,
        quantityAlt: 2000,
        scrapAltQty: 250,
        type: 'PRODUCT',
        scrapQty: 25,
        duration: 60,
        cycleTimeGood: 1, // goodDuration = 200 * 1 =200
        idealQty: 60,
        idealAltQty: 600,
      },
      {
        sliceStartTmIso: now.minus({ seconds: 60 }).toISO(),
        isFake: true,
        quantity: 200,
        quantityAlt: 2000,
        type: 'PRODUCT',
        scrapQty: 25,
        scrapAltQty: 250,
        duration: 60,
        cycleTimeGood: 1, // goodDuration = 200 * 1 = 200
        idealQty: 1,
        idealAltQty: 10,
      },
    ];

    const { shiftStats } = calculateTotals(timeline, now, 'Europe/Tallinn', new Map());
    expect(shiftStats).toEqual({
      quantity: 260,
      quantityAlt: 2600,
      scrapQty: 30,
      scrapAltQty: 300,
      standByTime: 300,
      totalTime: 1320,
      productionTime: 840,
      delaysCount: 1,
      delaysTime: 120,
      idealQty: 277,
      idealAltQty: 2770,
      productIdealQty: 246,
    });
  });
});

describe('calculateStatistics', () => {
  it('calculateStatistics has everything needed for shift view visualizations', () => {
    const stats = calculateStatistics([], 'Europe/Tallinn', {}).statistics;
    expect(stats).toHaveProperty('delaysCount');
    expect(stats).toHaveProperty('shiftTotal');
    expect(stats).toHaveProperty('hourStatistics');
  });
});

describe('getStats', () => {
  it('getStats has everything needed for shift view visualizations', () => {
    const stats = getStats([]);

    expect(stats).toHaveProperty('availability');
    expect(stats).toHaveProperty('performance');
    expect(stats).toHaveProperty('quality');
    expect(stats).toHaveProperty('oee');
  });
});

describe('hourStatistics', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2022-02-22T14:20:00.000Z'));
  });
  afterEach(() => {
    vi.useRealTimers();
  });
  test('that hourStatistics calculates correctly', () => {
    const timeline = [
      {
        batchId: 1,
        sliceStartTmISO: '2022-02-22T12:00:00.000Z',
        sliceEndTmISO: '2022-02-22T12:01:00.000Z',
        quantity: 1,
        quantityAlt: 10,
        scrapQty: 0,
        scrapAltQty: 0,
        idealQty: 1,
        idealAltQty: 10,
        duration: 60,
        type: 'PRODUCT',
      },
      {
        batchId: 1,
        sliceStartTmISO: '2022-02-22T12:01:00.000Z',
        sliceEndTmISO: '2022-02-22T12:02:00.000Z',
        quantity: 1,
        quantityAlt: 10,
        scrapQty: 1,
        scrapAltQty: 10,
        idealQty: 1,
        idealAltQty: 10,
        duration: 60,
        type: 'PRODUCT',
      },
      {
        batchId: 1,
        sliceStartTmISO: '2022-02-22T12:02:00.000Z',
        sliceEndTmISO: '2022-02-22T12:03:00.000Z',
        quantity: 0.5,
        quantityAlt: 5,
        scrapQty: 0,
        scrapAltQty: 0,
        idealQty: 1,
        idealAltQty: 10,
        duration: 60,
        type: 'PRODUCT',
      },
      {
        batchId: 1,
        sliceStartTmISO: '2022-02-22T12:03:00.000Z',
        sliceEndTmISO: '2022-02-22T12:05:00.000Z',
        quantity: 3,
        quantityAlt: 30,
        scrapQty: 1,
        scrapAltQty: 10,
        idealQty: 2,
        idealAltQty: 20,
        duration: 120,
        type: 'PRODUCT',
      },
      {
        batchId: 1,
        sliceStartTmISO: '2022-02-22T12:05:00.000Z',
        sliceEndTmISO: '2022-02-22T13:05:00.000Z',
        idealQty: 60,
        duration: 3600,
        type: 'STOPPAGE',
      },
      {
        batchId: 2,
        sliceStartTmISO: '2022-02-22T13:05:00.000Z',
        sliceEndTmISO: '2022-02-22T13:06:00.000Z',
        quantity: 1,
        quantityAlt: 5,
        scrapQty: 0,
        scrapAltQty: 0,
        idealQty: 1,
        idealAltQty: 5,
        duration: 60,
        type: 'PRODUCT',
      },
      {
        batchId: 2,
        sliceStartTmISO: '2022-02-22T13:06:00.000Z',
        sliceEndTmISO: '2022-02-22T13:07:00.000Z',
        quantity: 1,
        quantityAlt: 5,
        scrapQty: 0,
        scrapAltQty: 0,
        idealQty: 1,
        idealAltQty: 5,
        duration: 60,
        type: 'PRODUCT',
      },
      {
        batchId: 2,
        sliceStartTmISO: '2022-02-22T13:07:00.000Z',
        sliceEndTmISO: '2022-02-22T13:08:00.000Z',
        quantity: 3,
        quantityAlt: 15,
        scrapQty: 1,
        scrapAltQty: 5,
        idealQty: 1,
        idealAltQty: 5,
        duration: 60,
        type: 'PRODUCT',
      },
      {
        batchId: 2,
        sliceStartTmISO: '2022-02-22T13:08:00.000Z',
        sliceEndTmISO: '2022-02-22T13:09:00.000Z',
        quantity: 1,
        quantityAlt: 5,
        scrapQty: 1,
        scrapAltQty: 5,
        idealQty: 1,
        idealAltQty: 5,
        duration: 60,
        type: 'PRODUCT',
      },
      {
        batchId: 2,
        sliceStartTmISO: '2022-02-22T13:09:00.000Z',
        sliceEndTmISO: '2022-02-22T13:59:00.000Z',
        idealQty: 50,
        idealAltQty: 250,
        duration: 50 * 60,
        type: 'STOPAAGE',
      },
      {
        batchId: 3,
        sliceStartTmISO: '2022-02-22T13:59:00.000Z',
        sliceEndTmISO: '2022-02-22T14:04:00.000Z',
        quantity: 1,
        quantityAlt: 1,
        scrapQty: 1,
        scrapAltQty: 1,
        idealQty: 5,
        idealAltQty: 5,
        duration: 300,
        type: 'PRODUCT',
      },
      {
        batchId: 3,
        sliceStartTmISO: '2022-02-22T14:04:00.000Z',
        sliceEndTmISO: '2022-02-22T14:05:00.000Z',
        quantity: 1,
        quantityAlt: 1,
        scrapQty: 1,
        scrapAltQty: 1,
        idealQty: 1,
        idealAltQty: 1,
        duration: 60,
        type: 'PRODUCT',
      },
      {
        batchId: 3,
        sliceStartTmISO: '2022-02-22T14:05:00.000Z',
        sliceEndTmISO: '2022-02-22T14:06:00.000Z',
        quantity: 2,
        quantityAlt: 2,
        scrapQty: 0,
        scrapAltQty: 0,
        idealQty: 1,
        idealAltQty: 1,
        duration: 60,
        type: 'PRODUCT',
      },
      {
        batchId: 3,
        sliceStartTmISO: '2022-02-22T14:06:00.000Z',
        sliceEndTmISO: '2022-02-22T14:09:00.000Z',
        quantity: 1,
        quantityAlt: 1,
        scrapQty: 0,
        scrapAltQty: 0,
        idealQty: 3,
        idealAltQty: 3,
        duration: 180,
        type: 'PRODUCT',
      },
      {
        batchId: 3,
        sliceStartTmISO: '2022-02-22T14:09:00.000Z',
        sliceEndTmISO: '2022-02-22T14:10:00.000Z',
        quantity: 0,
        quantityAlt: 0,
        scrapQty: 0,
        scrapAltQty: 0,
        idealQty: 3,
        idealAltQty: 3,
        duration: 180,
        includeInOee: false,
      },
    ];

    const { hourStatistics } = calculateStatistics(
      timeline,
      'UTC',
      { startTimeISO: '2022-02-22T12:00:00.000Z', endTimeISO: '2022-02-22T14:10:00.000Z' },
    ).statistics;

    expect(hourStatistics).toEqual({
      '2022-02-22T14:00:00.000Z': {
        availability: 1,
        dateTime: '2022-02-22T14:00:00.000Z',
        delaysCount: 0,
        delaysTime: 0,
        idealAltQty: 9,
        oee: 0.3333333333333333,
        performance: 0.5333333333333333,
        productIdealQty: 9,
        productionTime: 540,
        quality: 0.625,
        standByTime: 180,
        totalTime: 720,
        quantity: 4.8,
        scrapQty: 1.8,
        scrapAltQty: 1.8,
        idealQty: 9,
        quantityAlt: 4.8,
      },
    });
  });
});

describe('shiftStats', () => {
  test('that shiftStats calculates correctly', () => {
    const timeline = [
      {
        batchId: 1,
        sliceStartTmISO: '2022-02-22T12:00:00.000Z',
        sliceEndTmISO: '2022-02-22T12:01:00.000Z',
        quantity: 1,
        quantityAlt: 10,
        scrapQty: 0,
        scrapAltQty: 0,
        idealQty: 1,
        idealAltQty: 10,
        duration: 60,
        type: 'PRODUCT',
      },
      {
        batchId: 1,
        sliceStartTmISO: '2022-02-22T12:01:00.000Z',
        sliceEndTmISO: '2022-02-22T12:02:00.000Z',
        quantity: 1,
        quantityAlt: 10,
        scrapQty: 1,
        scrapAltQty: 10,
        idealQty: 1,
        idealAltQty: 10,
        duration: 60,
        type: 'PRODUCT',
      },
      {
        batchId: 1,
        sliceStartTmISO: '2022-02-22T12:02:00.000Z',
        sliceEndTmISO: '2022-02-22T12:03:00.000Z',
        quantity: 0.5,
        quantityAlt: 5,
        scrapQty: 0,
        scrapAltQty: 0,
        idealQty: 1,
        idealAltQty: 10,
        duration: 60,
        type: 'PRODUCT',
      },
      {
        batchId: 1,
        sliceStartTmISO: '2022-02-22T12:03:00.000Z',
        sliceEndTmISO: '2022-02-22T12:05:00.000Z',
        quantity: 3,
        quantityAlt: 30,
        scrapQty: 1,
        scrapAltQty: 10,
        idealQty: 2,
        idealAltQty: 20,
        duration: 120,
        type: 'PRODUCT',
      },
      {
        batchId: 1,
        sliceStartTmISO: '2022-02-22T12:05:00.000Z',
        sliceEndTmISO: '2022-02-22T13:05:00.000Z',
        idealQty: 60,
        duration: 3600,
        includeInOee: false,
        type: 'STOPPAGE',
      },
      {
        batchId: 2,
        sliceStartTmISO: '2022-02-22T13:05:00.000Z',
        sliceEndTmISO: '2022-02-22T13:06:00.000Z',
        quantity: 1,
        quantityAlt: 5,
        scrapQty: 0,
        scrapAltQty: 0,
        idealQty: 1,
        idealAltQty: 5,
        duration: 60,
        type: 'PRODUCT',
      },
      {
        batchId: 2,
        sliceStartTmISO: '2022-02-22T13:06:00.000Z',
        sliceEndTmISO: '2022-02-22T13:07:00.000Z',
        quantity: 1,
        quantityAlt: 5,
        scrapQty: 0,
        scrapAltQty: 0,
        idealQty: 1,
        idealAltQty: 5,
        duration: 60,
        type: 'PRODUCT',
      },
      {
        batchId: 2,
        sliceStartTmISO: '2022-02-22T13:07:00.000Z',
        sliceEndTmISO: '2022-02-22T13:08:00.000Z',
        quantity: 3,
        quantityAlt: 15,
        scrapQty: 1,
        scrapAltQty: 5,
        idealQty: 1,
        idealAltQty: 5,
        duration: 60,
        type: 'PRODUCT',
      },
      {
        batchId: 2,
        sliceStartTmISO: '2022-02-22T13:08:00.000Z',
        sliceEndTmISO: '2022-02-22T13:09:00.000Z',
        quantity: 1,
        quantityAlt: 5,
        scrapQty: 1,
        scrapAltQty: 5,
        idealQty: 1,
        idealAltQty: 5,
        duration: 60,
        type: 'PRODUCT',
      },
      {
        batchId: 2,
        sliceStartTmISO: '2022-02-22T13:09:00.000Z',
        sliceEndTmISO: '2022-02-22T13:59:00.000Z',
        idealQty: 50,
        idealAltQty: 250,
        duration: 50 * 60,
        includeInOee: false,
        type: 'STOPAAGE',
      },
      {
        batchId: 3,
        sliceStartTmISO: '2022-02-22T13:59:00.000Z',
        sliceEndTmISO: '2022-02-22T14:04:00.000Z',
        quantity: 1,
        quantityAlt: 1,
        scrapQty: 1,
        scrapAltQty: 1,
        idealQty: 5,
        idealAltQty: 5,
        duration: 300,
        type: 'PRODUCT',
      },
      {
        batchId: 3,
        sliceStartTmISO: '2022-02-22T14:04:00.000Z',
        sliceEndTmISO: '2022-02-22T14:05:00.000Z',
        quantity: 1,
        quantityAlt: 1,
        scrapQty: 1,
        scrapAltQty: 1,
        idealQty: 1,
        idealAltQty: 1,
        duration: 60,
        type: 'PRODUCT',
      },
      {
        batchId: 3,
        sliceStartTmISO: '2022-02-22T14:05:00.000Z',
        sliceEndTmISO: '2022-02-22T14:06:00.000Z',
        quantity: 2,
        quantityAlt: 2,
        scrapQty: 0,
        scrapAltQty: 0,
        idealQty: 1,
        idealAltQty: 1,
        duration: 60,
        type: 'PRODUCT',
      },
      {
        batchId: 3,
        sliceStartTmISO: '2022-02-22T14:06:00.000Z',
        sliceEndTmISO: '2022-02-22T14:09:00.000Z',
        quantity: 1,
        quantityAlt: 1,
        scrapQty: 0,
        scrapAltQty: 0,
        idealQty: 3,
        idealAltQty: 3,
        duration: 180,
        type: 'PRODUCT',
      },
      {
        batchId: 3,
        sliceStartTmISO: '2022-02-22T14:09:00.000Z',
        sliceEndTmISO: '2022-02-22T14:10:00.000Z',
        quantity: 0,
        quantityAlt: 0,
        scrapQty: 0,
        scrapAltQty: 0,
        idealQty: 3,
        idealAltQty: 3,
        duration: 180,
        includeInOee: false,
      },
    ];

    const { shiftTotal } = calculateStatistics(
      timeline,
      'UTC',
      { startTimeISO: '2022-02-22T12:00:00.000Z', endTimeISO: '2022-02-22T14:10:00.000Z' },
    ).statistics;

    expect(shiftTotal).toEqual({
      availability: 1,
      delaysCount: 0,
      delaysTime: 3600,
      idealAltQty: 80,
      oee: 0.5526315789473685,
      performance: 0.868421052631579,
      productIdealQty: 19,
      productionTime: 1140,
      quality: 0.6363636363636364,
      standByTime: 6780,
      totalTime: 7920,
      quantity: 16.5,
      scrapQty: 6,
      scrapAltQty: 32,
      idealQty: 19,
      quantityAlt: 90,
    });
  });
});
