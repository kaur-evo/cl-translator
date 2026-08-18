import { getCheckTasksFilledPercentage, getCheckTasksFilledString } from './checkTasksFilledCalculations';

import { checkTypes } from '@/constants/checklistsConstants';

describe('checkTasksFilledCalculations', () => {
  describe('getCheckTasksFilledPercentage', () => {
    it('returns 0 when check is null', () => {
      const result = getCheckTasksFilledPercentage(null);
      expect(result).toBe(0);
    });

    it('returns 0 when check is undefined', () => {
      const result = getCheckTasksFilledPercentage(undefined);
      expect(result).toBe(0);
    });

    it('returns 0 when elements array is empty', () => {
      const check = { elements: [] };
      const result = getCheckTasksFilledPercentage(check);
      expect(result).toBe(0);
    });

    it('returns 100 when all elements are filled', () => {
      const check = {
        elements: [
          { type: checkTypes.TEXT, value: 'some text' },
          { type: checkTypes.MEASUREMENT, value: 42 },
          { type: checkTypes.MEASUREMENT, multipleSelection: true, value: [1, 2] },
          { type: checkTypes.YES_NO, value: [true] },
          { type: checkTypes.YES_NO, value: [false] },
          { type: checkTypes.YES_NO, multipleSelection: true, value: [true, false] },
          { type: checkTypes.TEXT, value: null, notApplicableEnabled: true, valueNotApplicable: true },
        ],
      };
      const result = getCheckTasksFilledPercentage(check);
      expect(result).toBe('100');
    });

    it('returns 0 when no elements are filled', () => {
      const check = {
        elements: [
          { type: checkTypes.TEXT, value: null },
          { type: checkTypes.MEASUREMENT, value: undefined },
          { type: checkTypes.MEASUREMENT, multipleSelection: true, value: [] },
          { type: checkTypes.SELECTION, value: [] },
          { type: checkTypes.YES_NO, value: [] },
          { type: checkTypes.YES_NO, multipleSelection: true, value: [] },
          { type: checkTypes.TEXT, value: null, notApplicableEnabled: true, valueNotApplicable: false },
        ],
      };
      const result = getCheckTasksFilledPercentage(check);
      expect(result).toBe('0');
    });

    it('returns 67 when 2 out of 3 elements are filled', () => {
      const check = {
        elements: [
          { type: checkTypes.TEXT, value: 'filled' },
          { type: checkTypes.TEXT, value: 'also filled' },
          { type: checkTypes.TEXT, value: null },
        ],
      };
      const result = getCheckTasksFilledPercentage(check);
      expect(result).toBe('66,67');
    });
  });

  describe('getCheckTasksFilledString', () => {
    it('returns "0/0 (0%)" when check is null', () => {
      const result = getCheckTasksFilledString(null);
      expect(result).toBe('0/0 (0%)');
    });

    it('returns "0/0 (0%)" when elements array is empty', () => {
      const check = { elements: [] };
      const result = getCheckTasksFilledString(check);
      expect(result).toBe('0/0 (0%)');
    });

    it('returns "3/3 (100%)" when all elements are filled', () => {
      const check = {
        elements: [
          { type: checkTypes.TEXT, value: 'a' },
          { type: checkTypes.TEXT, value: 'b' },
          { type: checkTypes.TEXT, value: 'c' },
          { type: checkTypes.TEXT, value: null, notApplicableEnabled: true, valueNotApplicable: true },
        ],
      };
      const result = getCheckTasksFilledString(check);
      expect(result).toBe('4/4 (100%)');
    });

    it('returns "0/3 (0%)" when no elements are filled', () => {
      const check = {
        elements: [
          { type: checkTypes.TEXT, value: null },
          { type: checkTypes.TEXT, value: null },
          { type: checkTypes.TEXT, value: null },
          { type: checkTypes.TEXT, value: null, notApplicableEnabled: true, valueNotApplicable: false },
        ],
      };
      const result = getCheckTasksFilledString(check);
      expect(result).toBe('0/4 (0%)');
    });

    it('returns "2/3 (67%)" when 2 out of 3 elements are filled', () => {
      const check = {
        elements: [
          { type: checkTypes.TEXT, value: 'filled' },
          { type: checkTypes.TEXT, value: 'also filled' },
          { type: checkTypes.TEXT, value: null },
        ],
      };
      const result = getCheckTasksFilledString(check);
      expect(result).toBe('2/3 (66,67%)');
    });
  });
});
