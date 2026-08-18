import { pinTypes } from '@/constants/shiftviewPinConstants';

/**
 * Applies quantity from batch start to the given acc and slice.
 *
 * @param {Object} acc - The acc object.
 * @param {Object} slice - The slice object.
 * @param {Object} batch - The batch object.
 */

export default function applyQtyFromBatchStart(acc, slice, batch) {
  if (acc.currentBatchId === null) {
    acc.currentBatchId = slice.batchId;
  }
  if (acc.currentBatchId !== slice.batchId) {
    acc.currentQtyFromBatchStart = 0;
    acc.currentScrapQtyFromBatchStart = 0;
    acc.currentBatchId = slice.batchId;
  }
  if (slice.type === 'PRODUCT') {
    acc.currentQtyFromBatchStart += (slice.quantity - slice.scrapQty);
    acc.currentScrapQtyFromBatchStart += slice.scrapQty;
    // eslint-disable-next-line no-param-reassign
    slice.quantityFromBatchStart = acc.currentQtyFromBatchStart;
    // eslint-disable-next-line no-param-reassign
    slice.scrapQtyFromBatchStart = acc.currentScrapQtyFromBatchStart;
    if (batch.plannedQty > 0
      && acc.batchTargetFlagMap[slice.batchId] === undefined
      && slice.quantityFromBatchStart >= batch.plannedQty
      && slice.quantityFromBatchStart <= batch.plannedQty + slice.quantity
    ) {
    // eslint-disable-next-line no-param-reassign
      slice.batchTargetReached = true;
      acc.batchTargetFlagMap[slice.batchId] = {
        time: slice.sliceEndTmISO,
        type: pinTypes.BATCH_TARGET_REACHED,
        batchTarget: {
          eventTime: slice.sliceEndTmISO,
          quantity: slice.quantityFromBatchStart,
          scrap: slice.scrapQtyFromBatchStart,
          batch,
        },
      };
    }
  }
}
