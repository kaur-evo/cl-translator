import { DateTime } from 'luxon';
import { differenceInSeconds } from 'date-fns';

import colorConstants from '@/constants/colorConstants';

const colors = colorConstants.dark;

const yellowShownPercentage = 0.00035; // 0.035%

// eslint-disable-next-line sonarjs/cognitive-complexity
export function processSlice({
  slice, commentsMap, timezone, yellowThreshold = 30,
}) {
  const sliceCopy = Object.assign({}, slice);
  if (sliceCopy.typ === 'PRODUCT') {
    const start = DateTime.fromISO(sliceCopy.stTmISO, { zone: timezone });
    const end = DateTime.fromISO(sliceCopy.enTmISO, { zone: timezone });
    const diff = end.diff(start, 'seconds').toObject().seconds;

    if (diff > sliceCopy.gDur + yellowThreshold) {
      sliceCopy.processedType = sliceCopy.plc ? 'PRODUCT_SLOW_COMMENTED' : 'PRODUCT_SLOW_UNCOMMENTED';
      sliceCopy.sliceColor = sliceCopy.plc ? colors['lw-orange'] : colors['lw-yellow'];
    } else {
      sliceCopy.processedType = 'PRODUCT_FAST';
      sliceCopy.sliceColor = colors['lw-green'];
    }
  } else if (sliceCopy.typ === 'STOPPAGE') {
    sliceCopy.processedType = sliceCopy.cId ? 'STOPPAGE_COMMENTED' : 'STOPPAGE_UNCOMMENTED';
    sliceCopy.sliceColor = sliceCopy.cId ? colors['lw-dark-red'] : colors['lw-red'];
  } else if (sliceCopy.typ === 'STANDBY') {
    if (sliceCopy.cId) {
      sliceCopy.processedType = sliceCopy.inOee ? 'STANDBY_INCL_OEE' : 'STANDBY_EXCL_OEE';
      sliceCopy.sliceColor = sliceCopy.inOee ? colors['secondary-dark'] : colors['lw-gray'];
    } else {
      sliceCopy.processedType = 'NO_SHIFT';
      sliceCopy.sliceColor = colors.black;
    }
  }
  if (sliceCopy.cId) {
    sliceCopy.sliceLabel = commentsMap[sliceCopy.cId]?.name;
  }
  return sliceCopy;
}

export function addSlice(slice, result, timezone) {
  if (['PRODUCT_SLOW_COMMENTED', 'PRODUCT_SLOW_UNCOMMENTED'].includes(slice.processedType)) {
    const yellow = { ...slice };
    const endTime = DateTime.fromISO(slice.enTmISO, { zone: timezone });
    const yellowEnd = endTime.minus({ seconds: slice.gDur }).toISO();
    yellow.enTmISO = yellowEnd;
    const green = {
      ...slice,
      stTmISO: yellowEnd,
      enTmISO: endTime.toISO(),
      processedType: 'PRODUCT_FAST',
      sliceColor: colors['lw-green'],
    };
    result.timeline.push(yellow);
    result.timeline.push(green);
  } else {
    result.timeline.push(slice);
  }
}

export default function processTimeline({ data, commentsMap, timezone }) {
  const result = {
    startTime: data.startTimeISO,
    endTime: data.endTimeISO,
    timeline: [],
    stats: data.statistics,
    changeovers: [],
    shifts: data.shifts,
  };
  const yellowThreshold = differenceInSeconds(new Date(data.endTimeISO), new Date(data.startTimeISO)) * yellowShownPercentage;
  data.timeline.forEach((slice) => {
    const processedSlice = processSlice({
      slice, commentsMap, timezone, yellowThreshold,
    });
    if (slice.pChg) result.changeovers.push(processedSlice);
    if (result.timeline.length === 0) {
      addSlice(processedSlice, result, timezone);
      return;
    }
    const currentLastSlice = result.timeline[result.timeline.length - 1];
    if (currentLastSlice.processedType === 'PRODUCT_FAST' && processedSlice.processedType === 'PRODUCT_FAST' && currentLastSlice.prId === processedSlice.prId) {
      currentLastSlice.enTmISO = processedSlice.enTmISO;
      currentLastSlice.qty += processedSlice.qty;
      currentLastSlice.aQty += processedSlice.aQty;
    } else {
      addSlice(processedSlice, result, timezone);
    }
  });
  return result;
}
