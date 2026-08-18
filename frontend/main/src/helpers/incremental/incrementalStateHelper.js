import { differenceInSeconds } from 'date-fns';
import { DateTime } from 'luxon';

import transformSlice from '../timeline/transformSlice';

import getLastSliceQuantity from '@/helpers/incremental/calculateLastSliceQuantity';
import applyQtyFromBatchStart from '@/helpers/timeline/applyQtyFromBatchStart';


const getIndexes = (timeline, time, timezone, isFakeUpdate) => {
  const indexes = [];
  const reformattedTime = DateTime.fromISO(time, { zone: timezone }).toISO();
  timeline.forEach((el, i) => {
    const reformattedOriginal = DateTime.fromISO(el.originalEndTimeString, { zone: timezone }).toISO();
    if (reformattedOriginal === reformattedTime && (!isFakeUpdate || i === timeline.length - 1)) indexes.push(i);
  });
  return indexes;
};

export default function stateUpdateHelper(state, updates, batches, comments, shift, timezone, batchQtyBeforeShift = {}) {
  // in case of BE update remove slices that FE has added
  let timeline = updates.faking ? [...state] : state.filter((el) => !el.isFake);

  const approvedChangeKeyLenths = ['YYYY-MM-DDTHH:MM:SS.000+00:00'.length, 'YYYY-MM-DDTHH:MM:SS.000Z'.length];
  const changedKeyValuePairs = Object.entries(updates.changed).filter(([changeTime]) => approvedChangeKeyLenths.includes(changeTime.length)); // only ISO format from changed

  const deletableKeys = updates.deletedISO.concat(changedKeyValuePairs.map(([key]) => key));

  const deletableIndexes = deletableKeys.map((time) => getIndexes(timeline, time, timezone, updates.faking)).flat();

  // FE tries to change something that doesn't exist or isn't last anymore - additions still counted
  const changingNotLastSlice = deletableIndexes.length > 0 && deletableIndexes[deletableIndexes.length - 1] < timeline.length - 1;
  const ignoreChanges = updates.faking && (deletableIndexes.length === 0 || changingNotLastSlice);

  if (!ignoreChanges) timeline = timeline.filter((el, i) => !deletableIndexes.includes(i) && !el.isFake);

  const itemsToAdd = ignoreChanges ? [...updates.added] : [...updates.added, ...changedKeyValuePairs.map(([, el]) => el)];

  itemsToAdd.forEach((slice) => {
    const newSlice = slice.isFake ? slice : transformSlice(slice, batches.get(slice.batchId), comments.get(slice.commentId), timezone);
    timeline.push(newSlice);
  });

  const sortedTimeline = timeline.sort((a, b) => differenceInSeconds(new Date(a.sliceStartTmISO), new Date(b.sliceStartTmISO))).map((slice, i) => ({ ...slice, id: i }));

  // check if the last slice is a stoppage or running green
  const lastSlice = sortedTimeline[sortedTimeline.length - 1];
  if (lastSlice && lastSlice.type === 'STOPPAGE' && shift.isShiftRunning && !updates.faking) { // check if it's running green
    const lastProductSlice = [...sortedTimeline].reverse().find((el) => el.type === 'PRODUCT' && !el.isFake);
    const lastSliceEnd = DateTime.fromISO(lastSlice.sliceEndTmISO);

    let timeFromLastProductSlice;
    if (lastProductSlice) {
      const lastProdSliceEnd = DateTime.fromISO(lastProductSlice.sliceEndTmISO);
      timeFromLastProductSlice = lastSliceEnd.diff(lastProdSliceEnd, 'seconds').toObject().seconds;
    } else {
      timeFromLastProductSlice = shift.secondsFromLastShiftSignal + lastSliceEnd.diff(DateTime.fromISO(shift.startTimeISO), 'seconds').toObject().seconds;
    }
    lastSlice.quantity = getLastSliceQuantity(timeline, lastSlice);
    if (timeFromLastProductSlice > 0 && timeFromLastProductSlice < (lastSlice.cycleTimeGood * lastSlice.quantity) + lastSlice.cycleTimeCritical) {
      lastSlice.type = 'PRODUCT';
      lastSlice.batchId = -1;
      lastSlice.isFake = true;
    }
  }

  const qtyFromBatchStartAccumulator = {
    currentBatchId: batchQtyBeforeShift.batchId,
    currentQtyFromBatchStart: batchQtyBeforeShift.producedQty - batchQtyBeforeShift.scrapQty,
    currentScrapQtyFromBatchStart: batchQtyBeforeShift.scrapQty,
    batchTargetFlagMap: {},
  };

  sortedTimeline.forEach((slice) => {
    if (slice.batchId === -1) return;
    const batch = batches.get(slice.batchId);
    applyQtyFromBatchStart(qtyFromBatchStartAccumulator, slice, batch);
  });

  return {
    transformedTimeline: sortedTimeline,
    batchTargetFlags: Object.values(qtyFromBatchStartAccumulator.batchTargetFlagMap),
  };
}
