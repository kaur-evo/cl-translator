import round from 'lodash/round';
import { DateTime } from 'luxon';
import { differenceInSeconds } from 'date-fns';

import CustomInterval from '../interval/CustomInterval';

import getLastSliceQuantity from './calculateLastSliceQuantity';

import { getBatchMainToAltUnitConversion } from '@/helpers/batch/getBatchMainToAltUnitConversion';
import getSliceYellowEnd from '@/helpers/timeline/getSliceYellowEnd';

function getSliceType(duration, slice) {
  if (duration < slice.cycleTimeCritical + (slice.cycleTimeGood * slice.quantity)) return 'PRODUCT';
  return 'STOPPAGE';
}
export default class SliceUpdateFaking {
  constructor({ interval = 5000 } = {}) {
    this.intervalMilliseconds = interval;
    this.latestState = [];
    this.lastUpdate = new Date();
    this.timezone = null;
    this.intervalRef = null;
    this.shift = null;
    this.batch = null;
    this.secondsFromLastShiftSignal = -1;
  }

  defaultSlice = {
    scrapQty: 0,
    scrapNotes: '',
    scrapReasonId: 0,
    commentId: 0,
    positionId: 0,
    notes: '',
    quantity: 0,
    cycleTimeCritical: undefined,
    cycleTimeGood: undefined,
  };

  getJoinedGroupDuration(slice) {
    return this.latestState.reduce((acc, el, i) => {
      if (i === this.latestState.length - 1) return acc; // do not take current slice into account
      if ((el.joinId && el.joinId === slice.joinId) || el.originalEndTimeString === slice.originalEndTimeString) {
        return acc + el.duration;
      }
      return acc;
    }, 0);
  }

  // eslint-disable-next-line sonarjs/cognitive-complexity
  generateSlice(params = {}) {
    const { shift } = this;
    const now = DateTime.local().setZone(this.timezone);
    const slice = { ...this.defaultSlice, ...params };
    const mainToAltUnitConversion = getBatchMainToAltUnitConversion(this.batch);
    if (!slice.sliceStartTmISO) {
      slice.sliceStartTmISO = shift.startTimeISO;
    }
    if (!slice.sliceEndTmISO) {
      const shiftEnd = DateTime.fromISO(shift.endTimeISO, { zone: this.timezone });
      slice.sliceEndTmISO = now < shiftEnd ? now.toISO() : shift.endTimeISO;
    }
    if (!slice.batchId) slice.batchId = this.batch.id;
    if (!slice.cycleTimeGood && slice.cycleTimeGood !== 0) slice.cycleTimeGood = this.batch.cycleTimeGood;
    if (!slice.cycleTimeCritical) slice.cycleTimeCritical = this.batch.cycleTimeCritical;
    const sliceStart = DateTime.fromISO(slice.sliceStartTmISO, { zone: this.timezone });
    const sliceEnd = DateTime.fromISO(slice.sliceEndTmISO, { zone: this.timezone });
    slice.duration = sliceEnd.diff(sliceStart, 'seconds').toObject().seconds;
    slice.idealQty = round(slice.duration / (slice.cycleTimeGood || this.batch.cycleTimeGood), 2);
    slice.idealAltQty = round(slice.idealQty * mainToAltUnitConversion, 2);
    slice.quantity = getLastSliceQuantity(this.latestState, slice);
    if (this.latestState.length > 0) {
      const lastIndex = this.latestState.length - 1;
      slice.quantityFromBatchStart = (this.latestState[lastIndex].quantityFromBatchStart + slice.quantity) || 0;
      slice.scrapQtyFromBatchStart = this.latestState[lastIndex].scrapQtyFromBatchStart || 0;
    } else {
      slice.quantityFromBatchStart = slice.quantity;
      slice.scrapQtyFromBatchStart = 0;
    }

    slice.quantityAlt = slice.quantity * mainToAltUnitConversion;
    if (slice.type === 'PRODUCT' || !slice.type) {
      const lastRealProductSlice = [...this.latestState].reverse().find((el) => el.type === 'PRODUCT' && !el.isFake);
      if (lastRealProductSlice) {
        const lastProductEnd = DateTime.fromISO(lastRealProductSlice.sliceEndTmISO, { zone: this.timezone });
        if (slice.cycleTimeCritical) {
          const timeFromLastProduct = now.diff(lastProductEnd, 'seconds').toObject().seconds;
          slice.type = getSliceType(timeFromLastProduct, slice);
          slice.quantity = slice.type === 'PRODUCT' ? slice.quantity : 0;
          slice.quantityAlt = slice.type === 'PRODUCT' ? slice.quantityAlt : 0;
        } else {
          slice.type = 'STOPPAGE';
          slice.quantity = 0;
          slice.quantityAlt = 0;
        }
      } else {
        const shiftCurrentDuration = differenceInSeconds(new Date(slice.sliceEndTmISO), new Date(shift.startTimeISO));
        if (!slice.cycleTimeCritical || this.secondsFromLastShiftSignal === -1) {
          slice.type = 'STOPPAGE';
          slice.quantity = 0;
          slice.quantityAlt = 0;
        } else {
          slice.type = getSliceType(this.secondsFromLastShiftSignal + shiftCurrentDuration, slice);
          slice.quantity = slice.type === 'PRODUCT' ? slice.quantity : 0;
          slice.quantityAlt = slice.type === 'PRODUCT' ? slice.quantityAlt : 0;
        }
      }
      if (slice.type === 'PRODUCT') {
        slice.yellowEnd = getSliceYellowEnd(slice, this.timezone);
      }
    }
    slice.isFake = true;
    return slice;
  }

  generateFakeSlices() {
    const now = DateTime.local().setZone(this.timezone);
    const update = {
      deletedISO: [],
      changed: {},
      added: [],
      faking: true,
    };
    if (this.latestState.length === 0) {
      update.added.push(this.generateSlice({
        cycleTimeGood: this.batch.cycleTimeGood,
        cycleTimeCritical: this.batch.cycleTimeCritical,
      }));
      return update;
    }
    const lastSlice = this.latestState[this.latestState.length - 1];
    if (lastSlice.type === 'PRODUCT' && lastSlice.isFake) { // extend "running green"
      const slice = this.generateSlice({
        ...lastSlice,
        sliceEndTmISO: now.toISO(),
      });
      update.changed[slice.originalEndTimeString] = slice;
      return update;
    }
    if (lastSlice.type === 'PRODUCT') { // add new "running" slice to end
      const slice = this.generateSlice({
        sliceStartTmISO: lastSlice.sliceEndTmISO,
        sliceEndTmISO: now.toISO(),
        type: 'PRODUCT',
        isFake: true,
        deleteOnUpdate: true,
      });
      update.added.push(slice);
      return update;
    }
    // extend last comment slice
    const lastSliceStart = DateTime.fromISO(lastSlice.sliceStartTmISO, { zone: this.timezone });
    const timeFromStoppageStart = now.diff(lastSliceStart, 'seconds').toObject().seconds;
    const joinDuration = lastSlice.joinId ? this.getJoinedGroupDuration(lastSlice) : 0;
    const currentDuration = timeFromStoppageStart + joinDuration;
    if (lastSlice.maxDuration > 0 && currentDuration > lastSlice.maxDuration) { // if max duration is exceeded
      const firstSliceEnd = lastSliceStart.plus({ seconds: lastSlice.maxDuration - joinDuration }).toISO();

      const firstComment = this.generateSlice({
        ...lastSlice,
        sliceEndTmISO: firstSliceEnd,
      });
      const secondComment = this.generateSlice({
        ...lastSlice,
        sliceStartTmISO: firstSliceEnd,
        sliceEndTmISO: now.toISO(),
        commentId: 0,
        joinId: null,
        type: 'STOPPAGE',
        isProductChange: false,
        notes: '',
        positionId: 0,
        maxDuration: 0,
      });
      update.changed[firstComment.originalEndTimeString] = firstComment;
      update.added.push(secondComment);
      return update;
    }
    const commentSlice = this.generateSlice({
      ...lastSlice,
      sliceEndTmISO: now.toISO(),
    });
    update.changed[commentSlice.originalEndTimeString] = commentSlice;
    return update;
  }

  checkLatestUpdate(callback, endCallback) {
    // toDate sets endTime from station local time to system timezone, new Date() is in the same zone and they can be compared
    const now = DateTime.local().setZone(this.timezone);
    const shiftEnd = DateTime.fromISO(this.shift.endTimeISO, { zone: this.timezone });

    if (now > shiftEnd) {
      this.stopUpdateInterval(endCallback);
    } else if (new Date() - this.lastUpdate > this.intervalMilliseconds - 10) { // allow 10ms error
      callback(this.generateFakeSlices());
    }
  }

  startUpdateIntervalTracking({ callback, endCallback }) {
    this.checkLatestUpdate(callback, endCallback);
    if (this.intervalRef) this.intervalRef.clear();
    this.intervalRef = CustomInterval.createInterval(() => {
      this.checkLatestUpdate(callback, endCallback);
    }, this.intervalMilliseconds);
  }

  registerTrackingUpdate(latestState) {
    this.lastUpdate = new Date();
    this.latestState = [...latestState];
  }

  changeShift(shift) {
    this.shift = shift;
  }

  stopUpdateInterval(endCallback) {
    if (this.intervalRef) this.intervalRef.clear();
    if (endCallback) endCallback();
  }
}
