import { subDays } from 'date-fns';

import timeRestriction from './timeRestriction';

import { DAYS, SHIFTS } from '@/constants/shiftViewTimeRestrictionTypes';

describe('userHasTimeRestriction', () => {
  let shifts;
  beforeEach(() => {
    shifts = [
      { id: 1, endTime: new Date() },
      { id: 2, endTime: subDays(new Date(), 1) },
      { id: 3, endTime: subDays(new Date(), 2) },
    ];
  });
  test('that userHasTimeRestriction returns false, if lineviewTimeRestrictionValue is 0', () => {
    const user = { lineviewTimeRestrictionValue: 0, lineviewTimeRestrictionType: DAYS };
    const shift = { id: 1, endTime: new Date() };
    expect(timeRestriction(user, shift, shifts, 'LINEVIEW_USER')).toBeFalsy();
    expect(timeRestriction(user, shift, shifts, 'OFFICE_USER')).toBeFalsy();
  });
  test('that userHasTimeRestriction returns false, if it is factory admin', () => {
    const user = { lineviewTimeRestrictionValue: 1, lineviewTimeRestrictionType: DAYS };
    const shift = { id: 1, endTime: new Date() };
    expect(timeRestriction(user, shift, shifts, 'FACTORY_ADMIN')).toBeFalsy();
  });
  test('that userHasTimeRestriction returns false, if it is company admin', () => {
    const user = { lineviewTimeRestrictionValue: 1, lineviewTimeRestrictionType: DAYS };
    const shift = { id: 1, endTime: new Date() };
    expect(timeRestriction(user, shift, shifts, 'COMPANY_ADMIN')).toBeFalsy();
  });
  test('that userHasTimeRestriction returns false, if lineviewTimeRestrictionType is days and lineviewTimeRestrictionValue is bigger than days + 1 from current shift end', () => {
    const user = { lineviewTimeRestrictionValue: 4, lineviewTimeRestrictionType: DAYS };
    const shift = { id: 3, endTime: subDays(new Date(), 2) };
    expect(timeRestriction(user, shift, shifts, 'LINEVIEW_USER')).toBeFalsy();
    expect(timeRestriction(user, shift, shifts, 'OFFICE_USER')).toBeFalsy();
  });
  test('that userHasTimeRestriction returns true, if lineviewTimeRestrictionType is days and lineviewTimeRestrictionValue is smaller than days + 1 from current shift end', () => {
    const user = { lineviewTimeRestrictionValue: 1, lineviewTimeRestrictionType: DAYS };
    const shift = { id: 3, endTime: subDays(new Date(), 2) };
    expect(timeRestriction(user, shift, shifts, 'LINEVIEW_USER')).toBeTruthy();
    expect(timeRestriction(user, shift, shifts, 'OFFICE_USER')).toBeTruthy();
  });
  test('that userHasTimeRestriction returns true, if lineviewTimeRestrictionType is shifts and visible shift index is -1 in shifts array', () => {
    const user = { lineviewTimeRestrictionValue: 2, lineviewTimeRestrictionType: SHIFTS };
    const shift = { id: 4, endTime: subDays(new Date(), 3) };
    expect(timeRestriction(user, shift, shifts, 'LINEVIEW_USER')).toBeTruthy();
    expect(timeRestriction(user, shift, shifts, 'OFFICE_USER')).toBeTruthy();
  });
  test('that userHasTimeRestriction returns false, if lineviewTimeRestrictionType is shifts and lineviewTimeRestrictionValue is bigger than visible shift index in shifts array', () => {
    const user = { lineviewTimeRestrictionValue: 2, lineviewTimeRestrictionType: SHIFTS };
    const shift = { id: 1, endTime: new Date() };
    expect(timeRestriction(user, shift, shifts, 'LINEVIEW_USER')).toBeFalsy();
    expect(timeRestriction(user, shift, shifts, 'OFFICE_USER')).toBeFalsy();
  });
  test('that userHasTimeRestriction returns true, if lineviewTimeRestrictionType is shifts and lineviewTimeRestrictionValue is smaller than visible shift index in shifts array', () => {
    const user = { lineviewTimeRestrictionValue: 1, lineviewTimeRestrictionType: SHIFTS };
    const shift = { id: 3, endTime: subDays(new Date(), 2) };
    expect(timeRestriction(user, shift, shifts, 'LINEVIEW_USER')).toBeTruthy();
    expect(timeRestriction(user, shift, shifts, 'OFFICE_USER')).toBeTruthy();
  });
});
