import { describe, it, expect } from 'vitest';

import { getTargetVal, hasTarget, isFasterThanTarget } from './preProcessingConfig';

describe('preProcessingConfig', () => {
  describe('getTargetVal', () => {
    it('should return the first element of the target array if it exists', () => {
      const target = [10];
      expect(getTargetVal(target)).toBe(10);
    });

    it('should return 0 if the target array is empty or undefined', () => {
      expect(getTargetVal([])).toBe(0);
      expect(getTargetVal(undefined)).toBe(0);
    });
  });

  describe('hasTarget', () => {
    it('returns false for undefined target', () => {
      expect(hasTarget(undefined)).toBe(false);
    });

    it('returns false for null target', () => {
      expect(hasTarget(null)).toBe(false);
    });

    it('returns false for empty array', () => {
      expect(hasTarget([])).toBe(false);
    });

    it('returns false for array with zero', () => {
      expect(hasTarget([0])).toBe(false);
    });

    it('returns false for array with null', () => {
      expect(hasTarget([null])).toBe(false);
    });

    it('returns true for array with positive number', () => {
      expect(hasTarget([100])).toBe(true);
    });

    it('returns true for array with decimal value', () => {
      expect(hasTarget([0.5])).toBe(true);
    });
  });

  describe('isFasterThanTarget', () => {
    it('should return true if entry.rangestart is less than or equal to target when groupBy is SECOND_PER_UNIT', () => {
      const entry = { rangestart: 5, target: [10] };
      const requirements = { groupBy: ['SECOND_PER_UNIT'] };
      expect(isFasterThanTarget(entry, requirements)).toBe(true);
    });

    it('should return false if entry.rangestart is greater than target when groupBy is SECOND_PER_UNIT', () => {
      const entry = { rangestart: 15, target: [10] };
      const requirements = { groupBy: ['SECOND_PER_UNIT'] };
      expect(isFasterThanTarget(entry, requirements)).toBe(false);
    });

    it('should return true if entry.rangeend is greater than or equal to target when groupBy is not SECOND_PER_UNIT', () => {
      const entry = { rangeend: 15, target: [10] };
      const requirements = { groupBy: ['OTHER'] };
      expect(isFasterThanTarget(entry, requirements)).toBe(true);
    });

    it('should return false if entry.rangeend is less than target when groupBy is not SECOND_PER_UNIT', () => {
      const entry = { rangeend: 5, target: [10] };
      const requirements = { groupBy: ['OTHER'] };
      expect(isFasterThanTarget(entry, requirements)).toBe(false);
    });

    it('returns true when target is undefined (no target case)', () => {
      const entry = { target: undefined, rangestart: 10, rangeend: 20 };
      const requirements = { groupBy: ['UNIT_PER_MINUTE'] };
      expect(isFasterThanTarget(entry, requirements)).toBe(true);
    });

    it('returns true when target is empty array (no target case)', () => {
      const entry = { target: [], rangestart: 10, rangeend: 20 };
      const requirements = { groupBy: ['UNIT_PER_MINUTE'] };
      expect(isFasterThanTarget(entry, requirements)).toBe(true);
    });

    it('returns true when target is [0] (no target case)', () => {
      const entry = { target: [0], rangestart: 10, rangeend: 20 };
      const requirements = { groupBy: ['UNIT_PER_MINUTE'] };
      expect(isFasterThanTarget(entry, requirements)).toBe(true);
    });
  });
});
