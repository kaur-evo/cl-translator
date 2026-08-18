import round from 'lodash/round';
import { DateTime } from 'luxon';

import { getBatchMainToAltUnitConversion } from '@/helpers/batch/getBatchMainToAltUnitConversion';

const isProductChange = (slice, batch, timezone) => {
  if (typeof batch === 'undefined') {
    return false;
  }
  const batchStartTm = DateTime.fromISO(batch.startTimeISO, { zone: timezone });
  const sliceStartTm = DateTime.fromISO(slice.startTimeLocalISO, { zone: timezone });
  const sliceEndTm = DateTime.fromISO(slice.endTimeLocalISO, { zone: timezone });
  return sliceStartTm <= batchStartTm && batchStartTm < sliceEndTm;
};

function transformSlice(element, batch, comment, timezone) {
  const sliceStart = DateTime.fromISO(element.startTimeLocalISO, { zone: timezone });
  const sliceEnd = DateTime.fromISO(element.endTimeLocalISO, { zone: timezone });
  const duration = sliceEnd.diff(sliceStart, 'seconds').toObject().seconds;
  const idealQty = round(duration / batch.cycleTimeGood, 2);
  const mainToAltUnitConversion = getBatchMainToAltUnitConversion(batch);
  const slice = {
    ...element,
    sliceStartTmISO: element.startTimeLocalISO,
    sliceEndTmISO: element.endTimeLocalISO,
    duration,
    cycleTimeGood: element.cycleTimeGood >= 0 ? element.cycleTimeGood : batch.cycleTimeGood,
    cycleTimeCritical: element.cycleTimeCritical >= 0 ? element.cycleTimeCritical : batch.cycleTimeCritical,
    isProductChange: isProductChange(element, batch, timezone),
    originalEndTimeString: element.originalEndTimeString || element.endTimeLocalISO,
    idealQty,
    idealAltQty: idealQty * mainToAltUnitConversion,
  };
  if (slice.type === 'PRODUCT') {
    slice.quantity = element.qty || 0;
    slice.quantityAlt = element.qty * mainToAltUnitConversion;
    slice.scrapAltQty = (element.scrapQty || 0) * mainToAltUnitConversion;
    if (slice.duration > Math.ceil(slice.quantity * slice.cycleTimeGood)) {
      slice.yellowEnd = DateTime.fromISO(slice.sliceEndTmISO, { zone: timezone })
        .minus({ seconds: slice.quantity * slice.cycleTimeGood }).startOf('second').toISO();
    }
  } else {
    slice.maxDuration = comment?.maxDuration || 0;
  }
  return slice;
}

export default transformSlice;
