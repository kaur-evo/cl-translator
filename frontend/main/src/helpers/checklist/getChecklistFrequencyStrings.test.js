import { setActivePinia, createPinia } from 'pinia';

import getChecklistFrequencyStrings from './getChecklistFrequencyStrings';

import { checklistTypes, periodicSubTypes } from '@/constants/checklistsConstants';

beforeEach(() => {
  setActivePinia(createPinia());
});

describe('getChecklistFrequencyStrings', () => {
  it('returns correct frequency strings array, when type is CHANGEOVER, delay time is 0, interval time is 0 and product name is not defined', () => {
    const frequency = { type: checklistTypes.CHANGEOVER, delayTime: 0, intervalTime: 0 };
    const result = getChecklistFrequencyStrings(frequency);
    expect(result).toEqual(['After changeover']);
  });

  it('returns correct frequency strings array, when type is CHANGEOVER, delay time is 0, interval time is not 0 and product name is not defined', () => {
    const frequency = { type: checklistTypes.CHANGEOVER, delayTime: 0, intervalTime: 300 };
    const result = getChecklistFrequencyStrings(frequency);
    expect(result).toEqual(['After changeover', 'interval']);
  });

  it('returns correct frequency strings array, when type is CHANGEOVER, delay time is not 0, interval time is 0 and product name is not defined', () => {
    const frequency = { type: checklistTypes.CHANGEOVER, delayTime: 300, intervalTime: 0 };
    const result = getChecklistFrequencyStrings(frequency);
    expect(result).toEqual(['{interval} after changeover']);
  });

  it('returns correct frequency strings array, when type is CHANGEOVER, delay time is not 0, interval time is not 0 and product name is not defined', () => {
    const frequency = { type: checklistTypes.CHANGEOVER, delayTime: 300, intervalTime: 300 };
    const result = getChecklistFrequencyStrings(frequency);
    expect(result).toEqual(['{interval} after changeover', 'interval']);
  });

  it('returns correct frequency strings array, when type is CHANGEOVER and leadTime is set', () => {
    const frequency = { type: checklistTypes.CHANGEOVER, delayTime: 0, leadTime: 300, intervalTime: 0 };
    const result = getChecklistFrequencyStrings(frequency);
    expect(result).toEqual(['{time} before changeover']);
  });

  it('returns correct frequency strings array, when type is QUANTITY and product name is not defined', () => {
    const frequency = { type: checklistTypes.QUANTITY, targetQty: 10 };
    const result = getChecklistFrequencyStrings(frequency);
    expect(result).toEqual(['After {quantity} cycles']);
  });

  it('returns correct frequency strings array, when type is STOPREASON and stoppage name is not defined', () => {
    const frequency = { type: checklistTypes.STOPREASON, targetQty: 10 };
    const result = getChecklistFrequencyStrings(frequency);
    expect(result).toEqual(['Stop reason']);
  });

  it('returns correct frequency strings array, when type is PERIODIC, subType is DAILY and one time is selected', () => {
    const frequency = { type: checklistTypes.PERIODIC, subType: periodicSubTypes.DAILY, times: ['14:00'] };
    const result = getChecklistFrequencyStrings(frequency);
    expect(result).toEqual(['Daily', '14:00']);
  });

  it('returns correct frequency strings array, when type is PERIODIC, subType is DAILY and multiple times are selected', () => {
    const frequency = { type: checklistTypes.PERIODIC, subType: periodicSubTypes.DAILY, times: ['14:00', '15:00', '18:00'] };
    const result = getChecklistFrequencyStrings(frequency);
    expect(result).toEqual(['Daily', '14:00, 15:00, 18:00']);
  });

  it('returns correct frequency strings array, when type is PERIODIC and subType is WEEKLY', () => {
    const frequency = { type: checklistTypes.PERIODIC, subType: periodicSubTypes.WEEKLY, daysOfWeek: ['MONDAY', 'FRIDAY'], times: ['14:00', '15:00', '18:00'] };
    const result = getChecklistFrequencyStrings(frequency);
    expect(result).toEqual(['Weekly', 'Mon, Fri', '14:00, 15:00, 18:00']);
  });

  it('returns correct frequency strings array, when type is PERIODIC, subType is MONTHLY and dayOfMonth is defined', () => {
    const frequency = { type: checklistTypes.PERIODIC, subType: periodicSubTypes.MONTHLY, dayOfMonth: 15, times: ['14:00', '15:00', '18:00'] };
    const result = getChecklistFrequencyStrings(frequency);
    expect(result).toEqual(['Monthly', 'Day 15', '14:00, 15:00, 18:00']);
  });

  it('returns correct frequency strings array, when type is PERIODIC, subType is MONTHLY and occurrence and dayOfWeek are defined', () => {
    const frequency = { type: checklistTypes.PERIODIC, subType: periodicSubTypes.MONTHLY, occurrence: 2, dayOfWeek: 'MONDAY', times: ['14:00', '15:00', '18:00'] };
    const result = getChecklistFrequencyStrings(frequency);
    expect(result).toEqual(['Monthly', 'Second_ordinal Monday', '14:00, 15:00, 18:00']);
  });

  it('returns correct frequency strings array, when type is INTERVAL', () => {
    const frequency = { type: checklistTypes.INTERVAL, intervalTime: 300 };
    const result = getChecklistFrequencyStrings(frequency);
    expect(result).toEqual(['Every {interval}']);
  });

  it('returns correct frequency strings array, when type is SHIFT and only offsetFromStartSeconds is 0', () => {
    const frequency = { type: checklistTypes.SHIFT, offsetFromStartSeconds: 0, offsetFromEndSeconds: null };
    const result = getChecklistFrequencyStrings(frequency);
    expect(result).toEqual(['After shift start']);
  });

  it('returns correct frequency strings array, when type is SHIFT and only offsetFromStartSeconds is greater than 0', () => {
    const frequency = { type: checklistTypes.SHIFT, offsetFromStartSeconds: 600, offsetFromEndSeconds: null };
    const result = getChecklistFrequencyStrings(frequency);
    expect(result).toEqual(['10min after shift start']);
  });

  it('returns correct frequency strings array, when type is SHIFT and only offsetFromEndSeconds is 0', () => {
    const frequency = { type: checklistTypes.SHIFT, offsetFromStartSeconds: null, offsetFromEndSeconds: 0 };
    const result = getChecklistFrequencyStrings(frequency);
    expect(result).toEqual(['Before shift end']);
  });

  it('returns correct frequency strings array, when type is SHIFT and only offsetFromEndSeconds is greater than 0', () => {
    const frequency = { type: checklistTypes.SHIFT, offsetFromStartSeconds: null, offsetFromEndSeconds: 1800 };
    const result = getChecklistFrequencyStrings(frequency);
    expect(result).toEqual(['30min before shift end']);
  });

  it('returns correct frequency strings array, when type is SHIFT and both offsets are set', () => {
    const frequency = { type: checklistTypes.SHIFT, offsetFromStartSeconds: 5400, offsetFromEndSeconds: 7320 };
    const result = getChecklistFrequencyStrings(frequency);
    expect(result).toEqual(['1h 30min after shift start', '2h 2min before shift end']);
  });
});
