import processPerformanceChartData from './processChartData';

import performanceWidgetType from '@/constants/performanceWidgetType';
import sliceType from '@/constants/sliceType';

describe('processPerformanceChartData', () => {
  const mockTimeline = [
    {
      batchId: 1,
      type: sliceType.PRODUCT,
      duration: 120,
      quantity: 10,
      signalQty: 5,
      cycleTimeGood: 30,
      sliceStartTmISO: '2023-01-01T00:00:00Z',
      sliceEndTmISO: '2023-01-01T00:02:00Z',
    },
    {
      batchId: 2,
      type: sliceType.STOPPAGE,
      duration: 60,
      quantity: 0,
      signalQty: 0,
      cycleTimeGood: 0,
      sliceStartTmISO: '2023-01-01T00:02:00Z',
      sliceEndTmISO: '2023-01-01T00:03:00Z',
    },
  ];

  const mockBatches = new Map([
    [1, { productName: 'Product A', alternativeUnitId: null }],
    [2, { productName: 'Product B', alternativeUnitId: null }],
  ]);

  const mockCurrentBatch = { productName: 'Current Product', alternativeUnitId: null };

  const mockColors = {
    'lw-gray': '#CCCCCC',
    'lw-yellow': '#FFFF00',
    white: '#FFFFFF',
  };

  const mockTimeFormattingOptions = {
    luxonLong: 'HH:mm:ss',
  };

  const mockZoneId = 'UTC';

  it('should process data for SECOND_PER_SIGNAL type', () => {
    const result = processPerformanceChartData({
      timeline: mockTimeline,
      useConversion: false,
      timeFormattingOptions: mockTimeFormattingOptions,
      colors: mockColors,
      currentBatch: mockCurrentBatch,
      batches: mockBatches,
      perfWidgetType: performanceWidgetType.SECOND_PER_SIGNAL,
      zoneId: mockZoneId,
    });

    expect(result).toHaveLength(2);
    expect(result[0].value).toBe(24);
    expect(result[0].valueExclDowntime).toBe(24);
    expect(result[0].target).toBe(30);
    expect(result[0].dotColor).toBe(mockColors.white);
    expect(result[1].value).toBe(99999);
    expect(result[1].valueExclDowntime).toBeNull();
    expect(result[1].dotColor).toBe('#F50B0B');
  });

  it('should process data for UNIT_PER_MINUTE type', () => {
    const result = processPerformanceChartData({
      timeline: mockTimeline,
      useConversion: false,
      timeFormattingOptions: mockTimeFormattingOptions,
      colors: mockColors,
      currentBatch: mockCurrentBatch,
      batches: mockBatches,
      perfWidgetType: performanceWidgetType.UNIT_PER_MINUTE,
      zoneId: mockZoneId,
    });

    expect(result).toHaveLength(2);
    expect(result[0].value).toBeCloseTo(5);
    expect(result[0].valueExclDowntime).toBeCloseTo(5);
    expect(result[0].target).toBeCloseTo(2);
    expect(result[0].dotColor).toBe(mockColors.white);
    expect(result[1].value).toBeNull();
    expect(result[1].valueExclDowntime).toBeNull();
    expect(result[1].dotColor).toBe('#F50B0B');
  });

  it('should process data for UNIT_PER_SECOND type', () => {
    const result = processPerformanceChartData({
      timeline: mockTimeline,
      useConversion: false,
      timeFormattingOptions: mockTimeFormattingOptions,
      colors: mockColors,
      currentBatch: mockCurrentBatch,
      batches: mockBatches,
      perfWidgetType: performanceWidgetType.UNIT_PER_SECOND,
      zoneId: mockZoneId,
    });

    expect(result).toHaveLength(2);
    expect(result[0].value).toBeCloseTo(0.0833, 4);
    expect(result[0].valueExclDowntime).toBeCloseTo(0.0833, 4);
    expect(result[0].target).toBeCloseTo(0.0333, 4);
    expect(result[0].dotColor).toBe(mockColors.white);
    expect(result[1].value).toBeNull();
    expect(result[1].dotColor).toBe('#F50B0B');
    expect(result[1].valueExclDowntime).toBeNull();
  });

  it('should process data for UNIT_PER_HOUR type', () => {
    const result = processPerformanceChartData({
      timeline: mockTimeline,
      useConversion: false,
      timeFormattingOptions: mockTimeFormattingOptions,
      colors: mockColors,
      currentBatch: mockCurrentBatch,
      batches: mockBatches,
      perfWidgetType: performanceWidgetType.UNIT_PER_HOUR,
      zoneId: mockZoneId,
    });

    expect(result).toHaveLength(2);
    expect(result[0].value).toBeCloseTo(300);
    expect(result[0].valueExclDowntime).toBeCloseTo(300);
    expect(result[0].target).toBeCloseTo(120);
    expect(result[0].dotColor).toBe(mockColors.white);
    expect(result[1].value).toBeNull();
    expect(result[1].valueExclDowntime).toBeNull();
    expect(result[1].dotColor).toBe('#F50B0B');
  });

  it('should process data for SECOND_PER_UNIT type', () => {
    const result = processPerformanceChartData({
      timeline: mockTimeline,
      useConversion: false,
      timeFormattingOptions: mockTimeFormattingOptions,
      colors: mockColors,
      currentBatch: mockCurrentBatch,
      batches: mockBatches,
      perfWidgetType: performanceWidgetType.SECOND_PER_UNIT,
      zoneId: mockZoneId,
    });

    expect(result).toHaveLength(2);
    expect(result[0].value).toBeCloseTo(12);
    expect(result[0].valueExclDowntime).toBeCloseTo(12);
    expect(result[0].target).toBe(30);
    expect(result[0].dotColor).toBe(mockColors.white);
    expect(result[1].value).toBe(99999);
    expect(result[1].valueExclDowntime).toBeNull();
    expect(result[1].dotColor).toBe('#F50B0B');
  });

  it('should process data for highIsGoodTypes', () => {
    const result = processPerformanceChartData({
      timeline: mockTimeline,
      useConversion: false,
      timeFormattingOptions: mockTimeFormattingOptions,
      colors: mockColors,
      currentBatch: mockCurrentBatch,
      batches: mockBatches,
      perfWidgetType: performanceWidgetType.UNIT_PER_MINUTE,
      zoneId: mockZoneId,
    });

    expect(result).toHaveLength(2);
    expect(result[0].value).toBeCloseTo(5);
    expect(result[0].valueExclDowntime).toBeCloseTo(5);
    expect(result[0].target).toBeCloseTo(2);
    expect(result[0].dotColor).toBe(mockColors.white);
    expect(result[1].value).toBeNull();
    expect(result[1].valueExclDowntime).toBeNull();
    expect(result[1].dotColor).toBe('#F50B0B');
  });

  it('should process data for lowIsGoodTypes', () => {
    const result = processPerformanceChartData({
      timeline: mockTimeline,
      useConversion: false,
      timeFormattingOptions: mockTimeFormattingOptions,
      colors: mockColors,
      currentBatch: mockCurrentBatch,
      batches: mockBatches,
      perfWidgetType: performanceWidgetType.SECOND_PER_UNIT,
      zoneId: mockZoneId,
    });

    expect(result).toHaveLength(2);
    expect(result[0].value).toBeCloseTo(12);
    expect(result[0].valueExclDowntime).toBeCloseTo(12);
    expect(result[0].target).toBe(30);
    expect(result[0].dotColor).toBe(mockColors.white);
    expect(result[1].value).toBe(99999);
    expect(result[1].valueExclDowntime).toBeNull();
    expect(result[1].dotColor).toBe('#F50B0B');
  });

  it('should throw an error for invalid perfWidgetType', () => {
    expect(() => {
      processPerformanceChartData({
        timeline: mockTimeline,
        useConversion: false,
        timeFormattingOptions: mockTimeFormattingOptions,
        colors: mockColors,
        currentBatch: mockCurrentBatch,
        batches: mockBatches,
        perfWidgetType: 'INVALID_TYPE',
        zoneId: mockZoneId,
      });
    }).toThrow('Invalid yAxisMode: ');
  });

  it('should handle empty timeline', () => {
    const result = processPerformanceChartData({
      timeline: [],
      useConversion: false,
      timeFormattingOptions: mockTimeFormattingOptions,
      colors: mockColors,
      currentBatch: mockCurrentBatch,
      batches: mockBatches,
      perfWidgetType: performanceWidgetType.UNIT_PER_MINUTE,
      zoneId: mockZoneId,
    });

    expect(result).toHaveLength(0);
  });

  it('should handle timeline with only stoppages', () => {
    const stoppageTimeline = [
      {
        batchId: 2,
        type: sliceType.STOPPAGE,
        duration: 60,
        quantity: 0,
        signalQty: 0,
        cycleTimeGood: 0,
        sliceStartTmISO: '2023-01-01T00:02:00Z',
        sliceEndTmISO: '2023-01-01T00:03:00Z',
      },
    ];

    const result = processPerformanceChartData({
      timeline: stoppageTimeline,
      useConversion: false,
      timeFormattingOptions: mockTimeFormattingOptions,
      colors: mockColors,
      currentBatch: mockCurrentBatch,
      batches: mockBatches,
      perfWidgetType: performanceWidgetType.UNIT_PER_MINUTE,
      zoneId: mockZoneId,
    });

    expect(result).toHaveLength(1);
    expect(result[0].value).toBeNull();
    expect(result[0].valueExclDowntime).toBeNull();
    expect(result[0].dotColor).toBe('#F50B0B');
  });

  it('should handle timeline with only standbys', () => {
    const standbyTimeline = [
      {
        batchId: 2,
        type: sliceType.STANDBY,
        duration: 60,
        quantity: 0,
        signalQty: 0,
        cycleTimeGood: 0,
        sliceStartTmISO: '2023-01-01T00:02:00Z',
        sliceEndTmISO: '2023-01-01T00:03:00Z',
      },
    ];

    const result = processPerformanceChartData({
      timeline: standbyTimeline,
      useConversion: false,
      timeFormattingOptions: mockTimeFormattingOptions,
      colors: mockColors,
      currentBatch: mockCurrentBatch,
      batches: mockBatches,
      perfWidgetType: performanceWidgetType.UNIT_PER_MINUTE,
      zoneId: mockZoneId,
    });

    expect(result).toHaveLength(1);
    expect(result[0].value).toBeNull();
    expect(result[0].valueExclDowntime).toBeNull();
    expect(result[0].dotColor).toBe(mockColors['lw-gray']);
  });

  it('should handle timeline with mixed types', () => {
    const mixedTimeline = [
      {
        batchId: 1,
        type: sliceType.PRODUCT,
        duration: 120,
        quantity: 10,
        signalQty: 5,
        cycleTimeGood: 30,
        sliceStartTmISO: '2023-01-01T00:00:00Z',
        sliceEndTmISO: '2023-01-01T00:02:00Z',
      },
      {
        batchId: 2,
        type: sliceType.STOPPAGE,
        duration: 60,
        quantity: 0,
        signalQty: 0,
        cycleTimeGood: 0,
        sliceStartTmISO: '2023-01-01T00:02:00Z',
        sliceEndTmISO: '2023-01-01T00:03:00Z',
      },
      {
        batchId: 1,
        type: sliceType.STANDBY,
        duration: 30,
        quantity: 0,
        signalQty: 0,
        cycleTimeGood: 0,
        sliceStartTmISO: '2023-01-01T00:03:00Z',
        sliceEndTmISO: '2023-01-01T00:03:30Z',
      },
    ];

    const result = processPerformanceChartData({
      timeline: mixedTimeline,
      useConversion: false,
      timeFormattingOptions: mockTimeFormattingOptions,
      colors: mockColors,
      currentBatch: mockCurrentBatch,
      batches: mockBatches,
      perfWidgetType: performanceWidgetType.UNIT_PER_MINUTE,
      zoneId: mockZoneId,
    });

    expect(result).toHaveLength(3);
    expect(result[0].value).toBeCloseTo(5);
    expect(result[0].valueExclDowntime).toBeCloseTo(5);
    expect(result[0].dotColor).toBe(mockColors.white);
    expect(result[1].value).toBeNull();
    expect(result[1].valueExclDowntime).toBeNull();
    expect(result[1].dotColor).toBe('#F50B0B');
    expect(result[2].value).toBeNull();
    expect(result[2].valueExclDowntime).toBeNull();
    expect(result[2].dotColor).toBe(mockColors['lw-gray']);
  });
});
