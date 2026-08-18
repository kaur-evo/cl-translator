import { scaleBand } from 'd3';
import { DateTime } from 'luxon';

import { splitSliceByHours } from '../helpers/timelineUtils';

import { INNER_PADDING, OUTER_PADDING } from '@/d3/constants';

export const divideGreenAndYellow = (slice, timezone) => {
  const greenBox = { ...slice };
  if (slice.yellowEnd) {
    const slowBox = { ...slice };
    slowBox.sliceEndTmISO = slowBox.yellowEnd;

    const slowStart = DateTime.fromISO(slowBox.sliceStartTmISO, { zone: timezone });
    const slowEnd = DateTime.fromISO(slowBox.sliceEndTmISO, { zone: timezone });

    slowBox.elementDuration = slowEnd.diff(slowStart, 'seconds').toObject().seconds;
    slowBox.type = 'SLOW';

    greenBox.sliceStartTmISO = slowBox.sliceEndTmISO;
    greenBox.yellowEnd = null;
    return [slowBox, greenBox];
  }
  return [greenBox];
};

export function getYScale(shiftHours) {
  return scaleBand()
    .paddingOuter(OUTER_PADDING)
    .paddingInner(INNER_PADDING)
    .range([0, 1000])
    .domain(Array.from(shiftHours).map((n) => n.dateTime));
}

export const addHourPart = (accumulator, hourPart) => {
  const stateCopy = { ...accumulator };
  const coordY = (accumulator.yScale(hourPart.hourStart)) + (accumulator.yScale.bandwidth() / 2);
  const startSeconds = hourPart.startSecond;
  const endSeconds = hourPart.endSecond;
  if (hourPart.parent.type === 'SLOW') {
    stateCopy.yellowPath += `M ${startSeconds}, ${coordY} H ${endSeconds} `;
    stateCopy.yellows.push(hourPart);
  } else {
    stateCopy.greens.push(hourPart);
    if (stateCopy.lastXStart === -1) {
      stateCopy.lastX = endSeconds;
      stateCopy.lastY = coordY;
      stateCopy.lastXStart = startSeconds;
      return stateCopy;
    }

    if (stateCopy.lastY !== coordY || stateCopy.lastX !== startSeconds) {
      stateCopy.greenPath += `M ${stateCopy.lastXStart}, ${stateCopy.lastY} H ${stateCopy.lastX} `;
      stateCopy.lastY = coordY;
      stateCopy.lastXStart = startSeconds;
    }
    stateCopy.lastX = endSeconds;
  }
  return stateCopy;
};

export const splitByColorAndHour = (slices, timezone) => {
  let splitSlices = [];
  slices.forEach((slice) => {
    const slicesByColor = divideGreenAndYellow(slice, timezone);
    slicesByColor.forEach((sliceByColor) => {
      const slicesByColorByHour = splitSliceByHours(sliceByColor, timezone);
      splitSlices = splitSlices.concat(slicesByColorByHour);
    });
  });
  return splitSlices;
};

export const groupSlicesByColor = (slices, yScale) => {
  const initialState = {
    greenPath: '',
    yellowPath: '',
    yellows: [],
    greens: [],
    lastXStart: -1,
    lastX: -1,
    lastY: -1,
    yScale,
  };
  const result = slices.reduce(addHourPart, initialState);
  if (result.lastY !== -1) {
    result.greenPath += `M ${result.lastXStart}, ${result.lastY} H ${result.lastX} `;
  }
  delete result.yScale;
  return result;
};

export default function handleSlices({ slices, shiftHours, timezone }) {
  const yScale = getYScale(shiftHours);
  const splitSlices = splitByColorAndHour(slices, timezone);
  return groupSlicesByColor(splitSlices, yScale);
}
