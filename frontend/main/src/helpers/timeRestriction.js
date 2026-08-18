import { differenceInDays } from 'date-fns';

import { DAYS, SHIFTS } from '@/constants/shiftViewTimeRestrictionTypes';
import { OFFICE_USER, LINEVIEW_USER } from '@/constants/userRoles';

export default function userHasTimeRestriction(user, currentShift, shifts, activeRole) {
  if (![OFFICE_USER, LINEVIEW_USER].includes(activeRole)) return false;
  const { lineviewTimeRestrictionValue, lineviewTimeRestrictionType } = user;
  if (lineviewTimeRestrictionValue > 0) {
    if (lineviewTimeRestrictionType === DAYS) {
      const daysFromShiftEnd = differenceInDays(new Date(), new Date(currentShift.endTime));
      return daysFromShiftEnd + 1 > lineviewTimeRestrictionValue;
    }
    if (lineviewTimeRestrictionType === SHIFTS) {
      const sortedShifts = [...shifts].sort((a, b) => new Date(b.endTime) - new Date(a.endTime));
      const visibleShiftIndex = sortedShifts.findIndex((shift) => shift.id === currentShift.id);
      return visibleShiftIndex === -1 || visibleShiftIndex >= lineviewTimeRestrictionValue;
    }
  }
  return false;
}
