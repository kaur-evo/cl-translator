import applyQtyFromBatchStart from './applyQtyFromBatchStart';

import { pinTypes } from '@/constants/shiftviewPinConstants';

describe('applyQtyFromBatchStart', () => {
  let accumulator;
  let slice;
  let batch;

  beforeEach(() => {
    accumulator = {
      currentBatchId: null,
      currentQtyFromBatchStart: 0,
      currentScrapQtyFromBatchStart: 0,
      batchTargetFlagMap: {},
    };

    slice = {
      batchId: 'batch1',
      type: 'PRODUCT',
      quantity: 10,
      scrapQty: 2,
      sliceEndTmISO: '2022-01-01T00:00:00Z',
    };

    batch = {
      plannedQty: 8,
    };
  });

  it('should update accumulator and slice correctly when currentBatchId is null', () => {
    applyQtyFromBatchStart(accumulator, slice, batch);

    expect(accumulator.currentBatchId).toBe(slice.batchId);
    expect(accumulator.currentQtyFromBatchStart).toBe(slice.quantity - slice.scrapQty);
    expect(accumulator.currentScrapQtyFromBatchStart).toBe(slice.scrapQty);
    expect(slice.quantityFromBatchStart).toBe(8);
    expect(slice.scrapQtyFromBatchStart).toBe(2);
    expect(slice.batchTargetReached).toBe(true);
  });

  it('should update accumulator and slice correctly when currentBatchId is different', () => {
    accumulator.currentBatchId = 'batch0';

    applyQtyFromBatchStart(accumulator, slice, batch);

    expect(accumulator.currentBatchId).toBe(slice.batchId);
    expect(accumulator.currentQtyFromBatchStart).toBe(slice.quantity - slice.scrapQty);
    expect(accumulator.currentScrapQtyFromBatchStart).toBe(slice.scrapQty);
    expect(slice.quantityFromBatchStart).toBe(8);
    expect(slice.scrapQtyFromBatchStart).toBe(2);
    expect(slice.batchTargetReached).toBe(true);
  });

  it('should update accumulator and slice correctly when slice type is PRODUCT', () => {
    accumulator.currentBatchId = 'batch1';

    applyQtyFromBatchStart(accumulator, slice, batch);

    expect(accumulator.currentBatchId).toBe(slice.batchId);
    expect(accumulator.currentQtyFromBatchStart).toBe(slice.quantity - slice.scrapQty);
    expect(accumulator.currentScrapQtyFromBatchStart).toBe(slice.scrapQty);
    expect(slice.quantityFromBatchStart).toBe(8);
    expect(slice.scrapQtyFromBatchStart).toBe(2);
    expect(slice.batchTargetReached).toBe(true);
    expect(accumulator.batchTargetFlagMap[slice.batchId]).toEqual({
      time: slice.sliceEndTmISO,
      type: pinTypes.BATCH_TARGET_REACHED,
      batchTarget: {
        eventTime: slice.sliceEndTmISO,
        quantity: slice.quantityFromBatchStart,
        scrap: slice.scrapQtyFromBatchStart,
        batch,
      },
    });
  });

  it('should not update accumulator and slice when currentBatchId is the same and slice type is not PRODUCT', () => {
    accumulator.currentBatchId = 'batch1';
    slice.type = 'NON_PRODUCT';

    applyQtyFromBatchStart(accumulator, slice, batch);

    expect(accumulator.currentBatchId).toBe('batch1');
    expect(accumulator.currentQtyFromBatchStart).toBe(0);
    expect(accumulator.currentScrapQtyFromBatchStart).toBe(0);
    expect(slice.quantityFromBatchStart).toBeUndefined();
    expect(slice.scrapQtyFromBatchStart).toBeUndefined();
    expect(slice.batchTargetReached).toBeUndefined();
    expect(accumulator.batchTargetFlagMap[slice.batchId]).toBeUndefined();
  });

  it('should not update accumulator and slice when slice type is not PRODUCT', () => {
    accumulator.currentBatchId = 'batch1';
    slice.type = 'NON_PRODUCT';

    applyQtyFromBatchStart(accumulator, slice, batch);

    expect(accumulator.currentBatchId).toBe('batch1');
    expect(accumulator.currentQtyFromBatchStart).toBe(0);
    expect(accumulator.currentScrapQtyFromBatchStart).toBe(0);
    expect(slice.quantityFromBatchStart).toBeUndefined();
    expect(slice.scrapQtyFromBatchStart).toBeUndefined();
    expect(slice.batchTargetReached).toBeUndefined();
    expect(accumulator.batchTargetFlagMap[slice.batchId]).toBeUndefined();
  });

  it('should update accumulator and slice correctly when slice quantity is zero', () => {
    accumulator.currentBatchId = 'batch1';
    slice.quantity = 0;

    applyQtyFromBatchStart(accumulator, slice, batch);

    expect(accumulator.currentBatchId).toBe(slice.batchId);
    expect(accumulator.currentQtyFromBatchStart).toBe(-2);
    expect(accumulator.currentScrapQtyFromBatchStart).toBe(2);
    expect(slice.quantityFromBatchStart).toBe(-2);
    expect(slice.scrapQtyFromBatchStart).toBe(2);
    expect(slice.batchTargetReached).toBeUndefined();
  });

  it('should update accumulator and slice correctly when slice scrap quantity is zero', () => {
    accumulator.currentBatchId = 'batch1';
    slice.scrapQty = 0;

    applyQtyFromBatchStart(accumulator, slice, batch);

    expect(accumulator.currentBatchId).toBe(slice.batchId);
    expect(accumulator.currentQtyFromBatchStart).toBe(10);
    expect(accumulator.currentScrapQtyFromBatchStart).toBe(0);
    expect(slice.quantityFromBatchStart).toBe(10);
    expect(slice.scrapQtyFromBatchStart).toBe(0);
    expect(slice.batchTargetReached).toBe(true);
    expect(accumulator.batchTargetFlagMap[slice.batchId]).toEqual({
      time: slice.sliceEndTmISO,
      type: pinTypes.BATCH_TARGET_REACHED,
      batchTarget: {
        eventTime: slice.sliceEndTmISO,
        quantity: slice.quantityFromBatchStart,
        scrap: slice.scrapQtyFromBatchStart,
        batch,
      },
    });
  });
  it('should not set slice.batchTargetReached when batch.plannedQty is 0', () => {
    batch.plannedQty = 0;

    applyQtyFromBatchStart(accumulator, slice, batch);

    expect(slice.batchTargetReached).toBeUndefined();
  });
  it('should update accumulator and slice correctly when previous slice is not a product and new slice has different batchId', () => {
    const slice1 = {
      batchId: 'batch1',
      type: 'NOT_PRODUCT',
      quantity: 4,
      scrapQty: 1,
      sliceEndTmISO: '2022-01-01T00:00:00Z',
    };
    const slice2 = {
      batchId: 'batch2',
      type: 'PRODUCT',
      quantity: 4,
      scrapQty: 1,
      sliceEndTmISO: '2022-01-01T01:00:00Z',
    };
    const batch1 = {
      plannedQty: 16,
    };

    applyQtyFromBatchStart(accumulator, slice1, batch);
    applyQtyFromBatchStart(accumulator, slice2, batch1);

    expect(accumulator.currentBatchId).toBe('batch2');
    expect(accumulator.currentQtyFromBatchStart).toBe(3);
    expect(accumulator.currentScrapQtyFromBatchStart).toBe(1);
    expect(slice1.quantityFromBatchStart).toBeUndefined();
    expect(slice1.scrapQtyFromBatchStart).toBeUndefined();
    expect(slice1.batchTargetReached).toBeUndefined();
    expect(slice2.quantityFromBatchStart).toBe(3);
    expect(slice2.scrapQtyFromBatchStart).toBe(1);
    expect(slice2.batchTargetReached).toBeUndefined();
  });
});
