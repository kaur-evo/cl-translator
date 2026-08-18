import { DateTime } from 'luxon';

import { userSelectableColors } from '@/constants/userSelectableColors';
import colorConstants from '@/constants/colorConstants';

export default function shiftTimelineDataMapper(data, zoneId) {
  const now = DateTime.now().setZone(zoneId);
  const filledData = [];
  for (let i = 0; i < data.length; i++) {
    const shift = { ...data[i] };
    // Mark shift as disabled if it started before now
    shift.disabled = DateTime.fromISO(shift.startTimeISO) < now;
    if (shift.color === null) {
      shift.color = colorConstants.light.error; // Fallback color if none is set (may occur with legacy or unexpected data)
    }
    if (shift.shiftTemplateId === 0) {
      shift.color = userSelectableColors.GREY;
    }
    filledData.push(shift);
  }
  return filledData;
}
