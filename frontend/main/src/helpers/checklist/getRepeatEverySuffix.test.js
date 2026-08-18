import { getRepeatEverySuffix } from './getRepeatEverySuffix';

import { periodicSubTypes } from '@/constants/checklistsConstants';

describe('getRepeatEverySuffix', () => {
  it('returns "week" if repeatEvery is 1 and subType is WEEKLY', () => {
    const frequency = { subType: periodicSubTypes.WEEKLY, repeatEvery: 1 };
    expect(getRepeatEverySuffix(frequency)).toBe('week');
  });

  it('returns "weeks" if repeatEvery is greater than 1 and subType is WEEKLY', () => {
    const frequency = { subType: periodicSubTypes.WEEKLY, repeatEvery: 3 };
    expect(getRepeatEverySuffix(frequency)).toBe('weeks');
  });

  it('returns "month" if repeatEvery is 1 and subType is MONTHLY', () => {
    const frequency = { subType: periodicSubTypes.MONTHLY, repeatEvery: 1 };
    expect(getRepeatEverySuffix(frequency)).toBe('month');
  });

  it('returns "months" if repeatEvery is greater than 1 and subType is MONTHLY', () => {
    const frequency = { subType: periodicSubTypes.MONTHLY, repeatEvery: 5 };
    expect(getRepeatEverySuffix(frequency)).toBe('months');
  });
});
