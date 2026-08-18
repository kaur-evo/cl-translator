import { DateTime } from 'luxon';

import getLastSliceQuantity from '@/helpers/incremental/calculateLastSliceQuantity';
import applyQtyFromBatchStart from '@/helpers/timeline/applyQtyFromBatchStart';
import getSliceYellowEnd from '@/helpers/timeline/getSliceYellowEnd';
import { getBatchMainToAltUnitConversion } from '@/helpers/batch/getBatchMainToAltUnitConversion';

const isProductChange = (slice, batch, timezone) => {
  if (typeof batch === 'undefined') {
    return false;
  }
  const batchStartTm = DateTime.fromISO(batch.startTimeISO, { zone: timezone });
  const sliceStartTm = DateTime.fromISO(slice.stTmISO, { zone: timezone });
  const sliceEndTm = DateTime.fromISO(slice.enTmISO, { zone: timezone });
  return (sliceStartTm <= batchStartTm) && (batchStartTm < sliceEndTm);
};
const transformTimelineResponse = (timeline, commentsRealMap, isShiftRunning, timezone, isTimeMode) => {
  const batches = new Map(timeline.batches.map(((batch) => [batch.id, batch])));
  let lastProductSlice;

  let batchQtyBeforeShift = { producedQty: 0, scrapQty: 0 };
  if (timeline.batchQtyBeforeShift) {
    batchQtyBeforeShift = timeline.batchQtyBeforeShift;
  }

  const qtyFromBatchStartAccumulator = {
    currentBatchId: batchQtyBeforeShift.batchId,
    currentQtyFromBatchStart: batchQtyBeforeShift.producedQty - batchQtyBeforeShift.scrapQty,
    currentScrapQtyFromBatchStart: batchQtyBeforeShift.scrapQty,
    batchTargetFlagMap: {},
  };

  const result = timeline.slices.map((element, i) => {
    const batch = batches.get(element.bId);
    const mainToAltUnitConversion = getBatchMainToAltUnitConversion(batch);

    const slice = {
      id: i,
      batchId: element.bId,
      type: element.typ,
      duration: element.dur,
      cycleTimeGood: element.ctg >= 0 ? element.ctg : batch.cycleTimeGood,
      cycleTimeCritical: element.ctc >= 0 ? element.ctc : batch.cycleTimeCritical,
      isProductChange: isProductChange(element, batch, timezone),
      originalEndTimeString: element.enTmISO,
      idealQty: element.iQty,
      idealAltQty: element.iQty * mainToAltUnitConversion,
      sliceStartTmISO: element.stTmISO,
      sliceEndTmISO: element.enTmISO,
      shiftId: element.shId,
      unitQty: batch.unitQty,
    };
    if (slice.type === 'PRODUCT') {
      slice.scrapQty = element.sQty || 0;
      slice.scrapAltQty = slice.scrapQty * mainToAltUnitConversion;
      slice.scrapNotes = element.sNt || '';
      slice.scrapReasonId = element.srId || 0;
      slice.quantity = element.qty || 0;
      slice.quantityAlt = element.qty * mainToAltUnitConversion;
      slice.signalQty = element.sgQty;

      slice.signalNotes = element.sN || '';
      lastProductSlice = slice;
      slice.yellowEnd = getSliceYellowEnd(slice, timezone);
    } else {
      slice.commentId = element.cId;
      slice.positionId = element.pId;
      slice.notes = element.note;
      slice.maxDuration = commentsRealMap.get(element.cId) ? commentsRealMap.get(element.cId).maxDuration : 0;
      slice.includeInOee = element.inOee;
      slice.joinId = element.jId;
    }
    applyQtyFromBatchStart(qtyFromBatchStartAccumulator, slice, batch);
    return slice;
  });
  const lastSlice = result[result.length - 1] || undefined;
  const getLastSliceEnd = () => DateTime.fromISO(lastSlice.sliceEndTmISO, { zone: timezone });
  const getLastProdSliceEnd = () => DateTime.fromISO(lastProductSlice.sliceEndTmISO, { zone: timezone });
  if (
    isShiftRunning
    && lastSlice && lastSlice.type === 'STOPPAGE'
    && !lastSlice.commentId && lastProductSlice
    && lastSlice.cycleTimeCritical > getLastSliceEnd().diff(getLastProdSliceEnd(), 'seconds').toObject().seconds
  ) {
    const batch = batches.get(lastSlice.batchId);
    lastSlice.type = 'PRODUCT';
    lastSlice.batchId = -1;
    lastSlice.quantity = getLastSliceQuantity(result, lastSlice);
    lastSlice.isFake = true;
    const isOverTarget = batch.producedQty - batch.scrapQty > batch.plannedQty;
    if (isTimeMode && isOverTarget) {
      lastSlice.cycleTimeGood = 0;
      lastSlice.yellowEnd = lastSlice.sliceEndTmISO;
    }
  }

  return { transformedTimeline: result, batchTargetFlags: Object.values(qtyFromBatchStartAccumulator.batchTargetFlagMap) };
};

export default transformTimelineResponse;
