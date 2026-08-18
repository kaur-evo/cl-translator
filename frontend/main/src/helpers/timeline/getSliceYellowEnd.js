import { DateTime } from 'luxon';

export default function getSliceYellowEnd(slice, timezone) {
  const quantity = slice.quantity || 0;
  const cycleTimeGood = slice.cycleTimeGood || 0;
  if (slice.duration <= Math.ceil(quantity * cycleTimeGood)) return null;
  return DateTime.fromISO(slice.sliceEndTmISO, { zone: timezone })
    .minus({ seconds: quantity * cycleTimeGood }).startOf('second').toISO();
}
