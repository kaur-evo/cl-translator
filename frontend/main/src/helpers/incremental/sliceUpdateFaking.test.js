import { DateTime } from 'luxon';
import { format, subMinutes, subSeconds } from 'date-fns';

import SliceUpdateFaking from './sliceUpdateFaking';

describe('SliceUpdateFaking', () => {
  const timezone = 'UTC';
  const mockShift = {
    startTimeISO: '2019-01-01T08:01:10.000+01:00',
    endTimeISO: DateTime.local().setZone(timezone).plus({ minutes: 15 }).toISO(),
  };
  const mockBatch = {
    cycleTimeCritical: 10,
    cycleTimeGood: 5,
    id: 1234,
    unitConversionType: 'ALT_TO_PRIMARY',
    unitConversion: 2,
  };
  const secondsFromLastShiftSignal = 50;
  const intervalSeconds = 60;
  const second = 1000;
  const interval = intervalSeconds * second;

  beforeEach(() => {
    vi.useFakeTimers().setSystemTime(new Date());
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts a timer with 60 seconds interval', () => {
    const mockCallback = vi.fn();
    const useSliceUpdateFaking = new SliceUpdateFaking({ interval });
    useSliceUpdateFaking.timezone = timezone;
    useSliceUpdateFaking.shift = mockShift;
    useSliceUpdateFaking.batch = mockBatch;
    useSliceUpdateFaking.startUpdateIntervalTracking({
      callback: mockCallback,
    });
    const spy = vi.spyOn(useSliceUpdateFaking.intervalRef, 'cbFun');
    vi.advanceTimersByTime(interval);
    expect(spy).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(interval);
    expect(spy).toHaveBeenCalledTimes(2);
    vi.advanceTimersByTime(interval);
    expect(spy).toHaveBeenCalledTimes(3);
  });

  it('calls callback method with generated slices if updates have not been received within interval', async () => {
    const mockCallback = vi.fn();
    const useSliceUpdateFaking = new SliceUpdateFaking({ interval });
    useSliceUpdateFaking.timezone = timezone;
    useSliceUpdateFaking.shift = mockShift;
    useSliceUpdateFaking.batch = mockBatch;
    useSliceUpdateFaking.startUpdateIntervalTracking({
      callback: mockCallback,
    });
    expect(mockCallback).not.toBeCalled();
    useSliceUpdateFaking.lastUpdate = new Date(new Date().getTime() - (interval + second));
    vi.advanceTimersByTime(interval);

    expect(mockCallback).toBeCalled();
    expect(mockCallback).toHaveBeenCalledTimes(1);
  });

  it('callbacks single slice with shift start time as start when creating first slice as stoppage', () => {
    const mockCallback = vi.fn();
    const useSliceUpdateFaking = new SliceUpdateFaking({ interval });
    useSliceUpdateFaking.timezone = timezone;
    useSliceUpdateFaking.shift = mockShift;
    useSliceUpdateFaking.batch = mockBatch;
    useSliceUpdateFaking.startUpdateIntervalTracking({
      callback: mockCallback,
    });
    useSliceUpdateFaking.lastUpdate = new Date(new Date().getTime() - (interval + second));
    vi.advanceTimersByTime(interval);
    const now = DateTime.local().setZone(timezone).toISO();
    const { added } = mockCallback.mock.calls[0][0];
    expect(added.length).toBe(1);
    expect(added[0]).toEqual({
      batchId: 1234,
      commentId: 0,
      sliceStartTmISO: '2019-01-01T08:01:10.000+01:00',
      sliceEndTmISO: now,
      type: 'STOPPAGE',
      scrapQty: 0,
      scrapNotes: '',
      scrapReasonId: 0,
      cycleTimeCritical: 10,
      cycleTimeGood: 5,
      quantity: 0,
      duration: expect.any(Number),
      idealQty: expect.any(Number),
      idealAltQty: expect.any(Number),
      isFake: true,
      notes: '',
      positionId: 0,
      quantityAlt: 0,
      quantityFromBatchStart: 0,
      scrapQtyFromBatchStart: 0,
    });
  });

  it('callbacks single slice with shift start time as start when creating first slice as product', () => {
    const mockCallback = vi.fn();
    const useSliceUpdateFaking = new SliceUpdateFaking({ interval });
    const now = DateTime.local().setZone(timezone).toISO();
    useSliceUpdateFaking.timezone = timezone;
    useSliceUpdateFaking.shift = {
      startTimeISO: now,
      endTimeISO: DateTime.fromISO(now).setZone(timezone).plus({ minutes: 5 }).toISO(),
    };
    useSliceUpdateFaking.batch = {
      cycleTimeCritical: 100, cycleTimeGood: 50, id: 1234, unitConversionType: 'ALT_TO_PRIMARY', unitConversion: 2,
    };
    useSliceUpdateFaking.secondsFromLastShiftSignal = 4;
    useSliceUpdateFaking.startUpdateIntervalTracking({
      callback: mockCallback,
    });
    useSliceUpdateFaking.lastUpdate = new Date(new Date().getTime() - (interval + second));
    vi.advanceTimersByTime(interval);
    const expectedEnd = DateTime.fromISO(now).setZone(timezone).plus({ minutes: 1 });
    const { added } = mockCallback.mock.calls[0][0];
    expect(added.length).toBe(1);
    expect(added[0]).toEqual({
      batchId: 1234,
      commentId: 0,
      sliceEndTmISO: expectedEnd.toISO(),
      sliceStartTmISO: now,
      type: 'PRODUCT',
      scrapQty: 0,
      scrapNotes: '',
      scrapReasonId: 0,
      cycleTimeCritical: 100,
      cycleTimeGood: 50,
      quantity: 0,
      duration: 60,
      idealQty: 1.2,
      idealAltQty: 2.4,
      isFake: true,
      notes: '',
      positionId: 0,
      quantityAlt: 0,
      quantityFromBatchStart: 0,
      scrapQtyFromBatchStart: 0,
      yellowEnd: expectedEnd.startOf('second').toISO(),
    });
  });

  it('extends last comment slice', () => {
    const mockCallback = vi.fn();
    const useSliceUpdateFaking = new SliceUpdateFaking({ interval });
    useSliceUpdateFaking.timezone = timezone;
    useSliceUpdateFaking.shift = mockShift;
    useSliceUpdateFaking.batch = mockBatch;
    useSliceUpdateFaking.startUpdateIntervalTracking({
      callback: mockCallback,
    });
    const now = DateTime.local().setZone(timezone).toISO();

    const sliceStart = format(subMinutes(new Date(now), 2), "yyyy-MM-dd'T'HH:mm:ss.SSSXXX");
    useSliceUpdateFaking.registerTrackingUpdate([
      {
        sliceStartTmISO: sliceStart,
        sliceEndTmISO: format(subMinutes(new Date(now), 1), "yyyy-MM-dd'T'HH:mm:ss.SSSXXX"),
        type: 'STOPPAGE',
        maxDuration: 0,
        originalEndTimeString: format(subMinutes(new Date(now), 1), "yyyy-MM-dd'T'HH:mm:ss.SSSXXX"),
      },
    ]);
    useSliceUpdateFaking.lastUpdate = new Date(new Date() - interval);
    vi.advanceTimersByTime(interval);
    const timeAfterIntervalHasPassed = DateTime.local().setZone(timezone).toISO();
    const changed = Object.values(mockCallback.mock.calls[0][0].changed);
    expect(changed.length).toBe(1);
    expect(changed[0]).toEqual({
      batchId: 1234,
      commentId: 0,
      cycleTimeCritical: 10,
      cycleTimeGood: 5,
      sliceStartTmISO: sliceStart,
      type: 'STOPPAGE',
      sliceEndTmISO: timeAfterIntervalHasPassed,
      duration: 180,
      idealAltQty: 72,
      idealQty: 36,
      isFake: true,
      notes: '',
      maxDuration: 0,
      originalEndTimeString: format(subMinutes(new Date(now), 1), "yyyy-MM-dd'T'HH:mm:ss.SSSXXX"),
      positionId: 0,
      quantity: 0,
      quantityAlt: 0,
      quantityFromBatchStart: 0,
      scrapQtyFromBatchStart: 0,
      scrapNotes: '',
      scrapQty: 0,
      scrapReasonId: 0,
    });
  });

  it('if last comment max duration is exceeded, new stoppage is added', () => {
    const mockCallback = vi.fn();
    const useSliceUpdateFaking = new SliceUpdateFaking({ interval });
    useSliceUpdateFaking.timezone = timezone;
    useSliceUpdateFaking.shift = mockShift;
    useSliceUpdateFaking.batch = mockBatch;
    useSliceUpdateFaking.startUpdateIntervalTracking({
      callback: mockCallback,
    });
    const initialTime = DateTime.local().setZone(timezone).toISO();
    useSliceUpdateFaking.registerTrackingUpdate([
      {
        sliceStartTmISO: format(subMinutes(new Date(initialTime), 1), "yyyy-MM-dd'T'HH:mm:ss.SSSXXX"),
        sliceEndTmISO: initialTime,
        type: 'STOPPAGE',
        maxDuration: 60,
        originalEndTimeString: initialTime,
      },
    ]);
    useSliceUpdateFaking.lastUpdate = new Date(new Date() - interval);
    vi.advanceTimersByTime(interval);
    const endTime = DateTime.local().setZone(timezone).toISO();
    const changed = Object.values(mockCallback.mock.calls[0][0].changed);
    const added = Object.values(mockCallback.mock.calls[0][0].added);
    expect(changed.length).toBe(1);
    expect(changed[0]).toEqual({
      batchId: 1234,
      commentId: 0,
      cycleTimeCritical: 10,
      cycleTimeGood: 5,
      sliceStartTmISO: format(subMinutes(new Date(initialTime), 1), "yyyy-MM-dd'T'HH:mm:ss.SSSXXX"),
      type: 'STOPPAGE',
      sliceEndTmISO: initialTime,
      duration: 60,
      idealAltQty: 24,
      idealQty: 12,
      isFake: true,
      notes: '',
      maxDuration: 60,
      originalEndTimeString: initialTime,
      positionId: 0,
      quantity: 0,
      quantityAlt: 0,
      quantityFromBatchStart: 0,
      scrapQtyFromBatchStart: 0,
      scrapNotes: '',
      scrapQty: 0,
      scrapReasonId: 0,
    });
    expect(added.length).toBe(1);
    expect(added[0]).toEqual({
      batchId: 1234,
      commentId: 0,
      cycleTimeCritical: 10,
      cycleTimeGood: 5,
      sliceStartTmISO: initialTime,
      type: 'STOPPAGE',
      sliceEndTmISO: endTime,
      duration: 60,
      idealAltQty: 24,
      idealQty: 12,
      isFake: true,
      notes: '',
      maxDuration: 0,
      isProductChange: false,
      joinId: null,
      originalEndTimeString: initialTime,
      positionId: 0,
      quantity: 0,
      quantityAlt: 0,
      quantityFromBatchStart: 0,
      scrapQtyFromBatchStart: 0,
      scrapNotes: '',
      scrapQty: 0,
      scrapReasonId: 0,
    });
  });

  test('that if last slice is joined and maxDuration is exceeded, new stoppage is added', () => {
    const mockCallback = vi.fn();
    const useSliceUpdateFaking = new SliceUpdateFaking({ interval });
    useSliceUpdateFaking.timezone = timezone;
    useSliceUpdateFaking.shift = mockShift;
    useSliceUpdateFaking.batch = mockBatch;

    useSliceUpdateFaking.startUpdateIntervalTracking({
      callback: mockCallback,
    });
    const initialTime = DateTime.local().setZone(timezone).toISO();
    useSliceUpdateFaking.registerTrackingUpdate([
      {
        sliceStartTmISO: format(subMinutes(new Date(initialTime), 5), "yyyy-MM-dd'T'HH:mm:ss.SSSXXX"),
        sliceEndTmISO: format(subMinutes(new Date(initialTime), 3), "yyyy-MM-dd'T'HH:mm:ss.SSSXXX"),
        type: 'STOPPAGE',
        maxDuration: 4 * 60,
        duration: 120,
        originalEndTimeString: format(subMinutes(new Date(initialTime), 3), "yyyy-MM-dd'T'HH:mm:ss.SSSXXX"),
        joinId: 1,
        commentId: 1,
      },
      {
        sliceStartTmISO: format(subMinutes(new Date(initialTime), 3), "yyyy-MM-dd'T'HH:mm:ss.SSSXXX"),
        sliceEndTmISO: format(subMinutes(new Date(initialTime), 2), "yyyy-MM-dd'T'HH:mm:ss.SSSXXX"),
        type: 'PRODUCT',
        quantity: 1,
        duration: 60,
        originalEndTimeString: format(subMinutes(new Date(initialTime), 2), "yyyy-MM-dd'T'HH:mm:ss.SSSXXX"),
      },
      {
        sliceStartTmISO: format(subMinutes(new Date(initialTime), 2), "yyyy-MM-dd'T'HH:mm:ss.SSSXXX"),
        sliceEndTmISO: initialTime,
        type: 'STOPPAGE',
        maxDuration: 4 * 60,
        duration: 120,
        originalEndTimeString: initialTime,
        joinId: 1,
        commentId: 1,
      },
    ]);
    useSliceUpdateFaking.lastUpdate = new Date(new Date() - interval);
    vi.advanceTimersByTime(interval);

    const changed = Object.values(mockCallback.mock.calls[0][0].changed);
    const added = Object.values(mockCallback.mock.calls[0][0].added);
    expect(changed.length).toBe(1);
    expect(changed[0]).toEqual({
      batchId: 1234,
      commentId: 1,
      cycleTimeCritical: 10,
      cycleTimeGood: 5,
      sliceStartTmISO: format(subMinutes(new Date(initialTime), 2), "yyyy-MM-dd'T'HH:mm:ss.SSSXXX"),
      type: 'STOPPAGE',
      sliceEndTmISO: initialTime,
      duration: 120,
      idealAltQty: 48,
      idealQty: 24,
      isFake: true,
      notes: '',
      joinId: 1,
      maxDuration: 240,
      originalEndTimeString: initialTime,
      positionId: 0,
      quantity: 1,
      quantityAlt: 2,
      quantityFromBatchStart: 0,
      scrapQtyFromBatchStart: 0,
      scrapNotes: '',
      scrapQty: 0,
      scrapReasonId: 0,
    });
    expect(added.length).toBe(1);
    expect(added[0]).toEqual({
      batchId: 1234,
      commentId: 0,
      cycleTimeCritical: 10,
      cycleTimeGood: 5,
      sliceStartTmISO: initialTime,
      type: 'STOPPAGE',
      sliceEndTmISO: DateTime.local().setZone(timezone).toISO(),
      duration: 60,
      idealAltQty: 24,
      idealQty: 12,
      isFake: true,
      isProductChange: false,
      notes: '',
      joinId: null,
      maxDuration: 0,
      originalEndTimeString: initialTime,
      positionId: 0,
      quantity: 1,
      quantityAlt: 2,
      quantityFromBatchStart: 0,
      scrapQtyFromBatchStart: 0,
      scrapNotes: '',
      scrapQty: 0,
      scrapReasonId: 0,
    });
  });

  it('if last slice is running green and ctc is not exceeded, the product slice is extended', () => {
    const mockCallback = vi.fn();
    const useSliceUpdateFaking = new SliceUpdateFaking({ interval });
    useSliceUpdateFaking.timezone = timezone;
    useSliceUpdateFaking.shift = mockShift;
    useSliceUpdateFaking.batch = mockBatch;
    useSliceUpdateFaking.secondsFromLastShiftSignal = secondsFromLastShiftSignal;
    useSliceUpdateFaking.startUpdateIntervalTracking({
      callback: mockCallback,
    });
    const initialTime = DateTime.local().setZone(timezone).toISO();
    const sliceStart = format(subMinutes(new Date(initialTime), 2), "yyyy-MM-dd'T'HH:mm:ss.SSSXXX");
    useSliceUpdateFaking.registerTrackingUpdate([
      {
        isFake: false,
        sliceStartTmISO: format(subMinutes(new Date(initialTime), 3), "yyyy-MM-dd'T'HH:mm:ss.SSSXXX"),
        sliceEndTmISO: format(subMinutes(new Date(initialTime), 2), "yyyy-MM-dd'T'HH:mm:ss.SSSXXX"),
        type: 'PRODUCT',
        quantity: 1,
        duration: 60,
        cycleTimeCritical: 200,
        originalEndTimeString: format(subMinutes(new Date(initialTime), 2), "yyyy-MM-dd'T'HH:mm:ss.SSSXXX"),
      },
      {
        isFake: true,
        sliceStartTmISO: sliceStart,
        sliceEndTmISO: format(subMinutes(new Date(initialTime), 1), "yyyy-MM-dd'T'HH:mm:ss.SSSXXX"),
        type: 'PRODUCT',
        cycleTimeCritical: 200,
        originalEndTimeString: format(subMinutes(new Date(initialTime), 1), "yyyy-MM-dd'T'HH:mm:ss.SSSXXX"),
      },
    ]);
    useSliceUpdateFaking.lastUpdate = new Date(new Date() - interval);
    vi.advanceTimersByTime(interval);
    const endTime = DateTime.local().setZone(timezone).toISO();

    const { changed } = mockCallback.mock.calls[0][0];
    expect(Object.keys(changed).length).toBe(1);
    const change = Object.values(changed)[0];
    expect(change).toEqual({
      batchId: 1234,
      commentId: 0,
      cycleTimeCritical: 200,
      cycleTimeGood: 5,
      sliceStartTmISO: sliceStart,
      type: 'PRODUCT',
      sliceEndTmISO: endTime,
      originalEndTimeString: format(subMinutes(new Date(initialTime), 1), "yyyy-MM-dd'T'HH:mm:ss.SSSXXX"),
      duration: 180,
      idealAltQty: 72,
      idealQty: 36,
      isFake: true,
      notes: '',
      positionId: 0,
      quantity: 1,
      quantityAlt: 2,
      quantityFromBatchStart: 0,
      scrapQtyFromBatchStart: 0,
      scrapNotes: '',
      scrapQty: 0,
      scrapReasonId: 0,
      yellowEnd: DateTime.fromISO(endTime).setZone(timezone)
        .minus({ second: 5 })
        .startOf('second')
        .toISO(),
    });
  });

  it('adds a stoppage when ctc is exceeded', () => {
    const mockCallback = vi.fn();
    const useSliceUpdateFaking = new SliceUpdateFaking({ interval });
    useSliceUpdateFaking.timezone = timezone;
    useSliceUpdateFaking.shift = mockShift;
    useSliceUpdateFaking.batch = mockBatch;
    useSliceUpdateFaking.secondsFromLastShiftSignal = secondsFromLastShiftSignal;
    useSliceUpdateFaking.startUpdateIntervalTracking({
      callback: mockCallback,
    });
    const initialTime = DateTime.local().setZone(timezone).toISO();
    const sliceStart = format(subMinutes(new Date(initialTime), 2), "yyyy-MM-dd'T'HH:mm:ss.SSSXXX");
    useSliceUpdateFaking.registerTrackingUpdate([
      {
        isFake: false,
        sliceStartTmISO: format(subMinutes(new Date(initialTime), 3), "yyyy-MM-dd'T'HH:mm:ss.SSSXXX"),
        sliceEndTmISO: format(subMinutes(new Date(initialTime), 2), "yyyy-MM-dd'T'HH:mm:ss.SSSXXX"),
        type: 'PRODUCT',
        quantity: 1,
        cycleTimeCritical: 80,
        originalEndTimeString: format(subMinutes(new Date(initialTime), 2), "yyyy-MM-dd'T'HH:mm:ss.SSSXXX"),
      },
      {
        isFake: true,
        sliceStartTmISO: sliceStart,
        sliceEndTmISO: format(subMinutes(new Date(initialTime), 1), "yyyy-MM-dd'T'HH:mm:ss.SSSXXX"),
        type: 'PRODUCT',
        quantity: 1,
        cycleTimeCritical: 80,
        originalEndTimeString: format(subMinutes(new Date(initialTime), 1), "yyyy-MM-dd'T'HH:mm:ss.SSSXXX"),
      },
    ]);
    useSliceUpdateFaking.lastUpdate = new Date(new Date() - interval);
    vi.advanceTimersByTime(interval);
    const endTime = DateTime.local().setZone(timezone).toISO();

    const { changed } = mockCallback.mock.calls[0][0];
    expect(Object.keys(changed).length).toBe(1);
    const change = Object.values(changed)[0];
    expect(change).toEqual({
      batchId: 1234,
      commentId: 0,
      cycleTimeCritical: 80,
      cycleTimeGood: 5,
      sliceStartTmISO: sliceStart,
      type: 'STOPPAGE',
      sliceEndTmISO: endTime,
      originalEndTimeString: format(subMinutes(new Date(initialTime), 1), "yyyy-MM-dd'T'HH:mm:ss.SSSXXX"),
      duration: 180,
      idealAltQty: 72,
      idealQty: 36,
      isFake: true,
      notes: '',
      positionId: 0,
      quantity: 0,
      quantityAlt: 0,
      quantityFromBatchStart: 0,
      scrapQtyFromBatchStart: 0,
      scrapNotes: '',
      scrapQty: 0,
      scrapReasonId: 0,
    });
  });

  it('if last slice is real product, new slice is added', () => {
    const mockCallback = vi.fn();
    const useSliceUpdateFaking = new SliceUpdateFaking({ interval });
    useSliceUpdateFaking.timezone = timezone;
    useSliceUpdateFaking.shift = mockShift;
    useSliceUpdateFaking.batch = mockBatch;
    useSliceUpdateFaking.secondsFromLastShiftSignal = secondsFromLastShiftSignal;
    useSliceUpdateFaking.startUpdateIntervalTracking({
      callback: mockCallback,
    });
    const initialTime = DateTime.local().setZone(timezone).toISO();
    const sliceStart = format(subMinutes(new Date(initialTime), 2), "yyyy-MM-dd'T'HH:mm:ss.SSSXXX");
    const sliceEnd = format(subMinutes(new Date(initialTime), 1), "yyyy-MM-dd'T'HH:mm:ss.SSSXXX");
    useSliceUpdateFaking.registerTrackingUpdate([
      {
        sliceStartTmISO: sliceStart,
        sliceEndTmISO: sliceEnd,
        type: 'PRODUCT',
        cycleTimeCritical: 80,
        originalEndTimeString: sliceEnd,
      },
    ]);
    useSliceUpdateFaking.lastUpdate = new Date(new Date() - interval);
    vi.advanceTimersByTime(interval);
    const finalTime = DateTime.local().setZone(timezone).toISO();
    const { changed, added } = mockCallback.mock.calls[0][0];
    expect(Object.keys(changed).length).toBe(0);
    expect(added.length).toBe(1);
    const addedSlice = added[0];
    expect(addedSlice).toEqual({
      deleteOnUpdate: true,
      batchId: 1234,
      commentId: 0,
      cycleTimeCritical: 10,
      cycleTimeGood: 5,
      sliceStartTmISO: sliceEnd,
      type: 'STOPPAGE',
      sliceEndTmISO: finalTime,
      duration: 120,
      idealAltQty: 48,
      idealQty: 24,
      isFake: true,
      notes: '',
      positionId: 0,
      quantity: 0,
      quantityAlt: 0,
      quantityFromBatchStart: 0,
      scrapQtyFromBatchStart: 0,
      scrapNotes: '',
      scrapQty: 0,
      scrapReasonId: 0,
    });
  });
  test('that checkLatestUpdate calls stopUpdateInterval but not callback if shift end time is before current time', () => {
    const mockCallback = vi.fn();
    const now = DateTime.local().setZone(timezone).toISO();
    const useSliceUpdateFaking = new SliceUpdateFaking({ interval });
    useSliceUpdateFaking.shift = { endTimeISO: format(subMinutes(new Date(now), 15), "yyyy-MM-dd'T'HH:mm:ss.SSSXXX") };
    useSliceUpdateFaking.timezone = timezone;
    const stopUpdateIntervalSpy = vi.spyOn(useSliceUpdateFaking, 'stopUpdateInterval');

    useSliceUpdateFaking.checkLatestUpdate(mockCallback);
    expect(mockCallback).not.toBeCalled();
    expect(stopUpdateIntervalSpy).toHaveBeenCalledTimes(1);
  });

  test('that checkLatestUpdate calls callback but not stopUpdateInterval if shift end time is after current time and last update difference is bigger than interval', () => {
    const mockCallback = vi.fn();
    const useSliceUpdateFaking = new SliceUpdateFaking({ interval });
    useSliceUpdateFaking.shift = mockShift;
    useSliceUpdateFaking.batch = mockBatch;
    useSliceUpdateFaking.timezone = timezone;
    useSliceUpdateFaking.lastUpdate = subSeconds(new Date(), intervalSeconds + 1);
    const stopUpdateIntervalSpy = vi.spyOn(useSliceUpdateFaking, 'stopUpdateInterval');

    useSliceUpdateFaking.checkLatestUpdate(mockCallback);
    expect(stopUpdateIntervalSpy).not.toBeCalled();
    expect(mockCallback).toHaveBeenCalledTimes(1);
  });

  test('that checkLatestUpdate does not call callback and stopUpdateInterval if shift end time is after current time and last update difference is smaller than interval', () => {
    const mockCallback = vi.fn();
    const useSliceUpdateFaking = new SliceUpdateFaking({ interval });
    useSliceUpdateFaking.shift = mockShift;
    useSliceUpdateFaking.batch = mockBatch;
    useSliceUpdateFaking.timezone = timezone;
    useSliceUpdateFaking.lastUpdate = new Date();
    const stopUpdateIntervalSpy = vi.spyOn(useSliceUpdateFaking, 'stopUpdateInterval');

    useSliceUpdateFaking.checkLatestUpdate(mockCallback);
    expect(stopUpdateIntervalSpy).not.toBeCalled();
    expect(mockCallback).not.toBeCalled();
  });
});
