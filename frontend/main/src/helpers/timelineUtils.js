import { DateTime } from 'luxon';

function getSecondsFromHourStart(time, timezone) {
  const date = DateTime.fromISO(time, { zone: timezone });
  const hourStart = date.startOf('hour');
  return date.diff(hourStart, 'seconds').toObject().seconds;
}

function splitSliceByHours(slice, timezone) {
  const result = [];
  const start = DateTime.fromISO(slice.sliceStartTmISO, { zone: timezone });
  const end = DateTime.fromISO(slice.sliceEndTmISO, { zone: timezone });
  const diff = end.diff(start, 'hours').toObject().hours + 1;

  const parent = { ...slice };
  for (let j = 0; j <= diff; j += 1) {
    const newElement = { parent };
    const hourStart = start.startOf('hour').plus({ hours: j });
    const hourEnd = start.endOf('hour').plus({ hours: j });
    const nextHourStart = hourEnd.plus(1, 'second');

    const elementStartAsDate = start < hourStart ? hourStart : start;
    const elementEndAsDate = end > hourEnd ? hourEnd : end;
    const elementRealEndAsDate = end > nextHourStart ? nextHourStart : end;
    newElement.startTimeISO = elementStartAsDate.toISO();
    newElement.endTimeISO = elementEndAsDate.toISO();
    newElement.hourStart = hourStart.toISO();

    newElement.elementDuration = elementRealEndAsDate.diff(elementStartAsDate, 'seconds').toObject().seconds;
    newElement.startSecond = elementStartAsDate.diff(hourStart, 'seconds').toObject().seconds;
    newElement.endSecond = elementEndAsDate.diff(hourStart, 'seconds').toObject().seconds;
    newElement.isFirstSegment = j === 0;
    if (newElement.elementDuration > 0) {
      result.push(newElement);
    }
  }
  return result;
}

export { splitSliceByHours, getSecondsFromHourStart };
