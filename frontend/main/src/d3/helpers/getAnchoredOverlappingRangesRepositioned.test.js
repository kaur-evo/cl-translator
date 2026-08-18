import { describe, it, expect } from 'vitest';

import getRangeRepositioned from './getAnchoredOverlappingRangesRepositioned';

describe('getRangeRepositioned', () => {
  it('should not reposition if ranges fit perfectly without spacing/margin', () => {
    const inputRanges = [
      { rangeStart: 0, rangeEnd: 50 },
      { rangeStart: 50, rangeEnd: 100 },
    ];
    const rightMaxLimit = 100;
    const horizontalSpacing = 0;

    const result = getRangeRepositioned({ inputRanges, rightMaxLimit, horizontalSpacing });
    expect(result[0].rangeStart).toBe(0);
    expect(result[0].rangeEnd).toBe(50);
    expect(result[0].level).toBe(0);
    expect(result[1].rangeStart).toBe(50);
    expect(result[1].rangeEnd).toBe(100);
    expect(result[1].level).toBe(0);
  });
  it('should not reposition if ranges fit perfectly with spacing/margin', () => {
    const inputRanges = [
      { rangeStart: 10, rangeEnd: 40 },
      { rangeStart: 60, rangeEnd: 90 },
    ];
    const rightMaxLimit = 100;
    const horizontalSpacing = 10;

    const result = getRangeRepositioned({ inputRanges, rightMaxLimit, horizontalSpacing });
    expect(result[0].rangeStart).toBe(10);
    expect(result[0].rangeEnd).toBe(40);
    expect(result[0].level).toBe(0);
    expect(result[1].rangeStart).toBe(60);
    expect(result[1].rangeEnd).toBe(90);
    expect(result[1].level).toBe(0);
  });
  it('should reposition if ranges fit perfectly but spacing overlaps', () => {
    const inputRanges = [
      { rangeStart: 10, rangeEnd: 40 },
      { rangeStart: 40, rangeEnd: 70 },
    ];
    const rightMaxLimit = 100;
    const horizontalSpacing = 10;

    const result = getRangeRepositioned({ inputRanges, rightMaxLimit, horizontalSpacing });
    expect(result[0].rangeStart).toBe(10);
    expect(result[0].rangeEnd).toBe(40);
    expect(result[0].level).toBe(1);
    expect(result[1].rangeStart).toBe(40);
    expect(result[1].rangeEnd).toBe(70);
    expect(result[1].level).toBe(0);
  });
  it('should reposition ranges to avoid overlap', () => {
    const inputRanges = [
      { rangeStart: 0, rangeEnd: 50 },
      { rangeStart: 40, rangeEnd: 90 },
      { rangeStart: 80, rangeEnd: 130 },
    ];
    const rightMaxLimit = 200;
    const horizontalSpacing = 10;

    const result = getRangeRepositioned({ inputRanges, rightMaxLimit, horizontalSpacing });

    expect(result[0].level).toBe(0);
    expect(result[1].level).toBe(1);
    expect(result[2].level).toBe(0);
  });

  it('should move range to another level if fit is impossible', () => {
    const inputRanges = [
      { rangeStart: 0, rangeEnd: 50 },
      { rangeStart: 40, rangeEnd: 90 },
      { rangeStart: 80, rangeEnd: 130 },
      { rangeStart: 120, rangeEnd: 170 },
    ];
    const rightMaxLimit = 200;
    const horizontalSpacing = 10;

    const result = getRangeRepositioned({ inputRanges, rightMaxLimit, horizontalSpacing });

    expect(result[0].level).toBe(0);
    expect(result[1].level).toBe(1);
    expect(result[2].level).toBe(0);
    expect(result[3].level).toBe(1);
  });

  it('should handle ranges that fit within the chart width', () => {
    const inputRanges = [
      { rangeStart: 0, rangeEnd: 50 },
      { rangeStart: 60, rangeEnd: 110 },
    ];
    const rightMaxLimit = 200;
    const horizontalSpacing = 10;

    const result = getRangeRepositioned({ inputRanges, rightMaxLimit, horizontalSpacing });

    expect(result[0].level).toBe(0);
    expect(result[0].rangeStart).toBe(25);
    expect(result[0].rangeEnd).toBe(95);
    expect(result[1].rangeStart).toBe(60);
    expect(result[1].rangeEnd).toBe(110);
    expect(result[1].level).toBe(1);
  });

  it('should handle empty input ranges', () => {
    const inputRanges = [];
    const rightMaxLimit = 200;
    const horizontalSpacing = 10;

    const result = getRangeRepositioned({ inputRanges, rightMaxLimit, horizontalSpacing });

    expect(result).toEqual([]);
  });

  describe('infinite loop protection', () => {
    it('should return safe defaults when rightMaxLimit is 0', () => {
      const inputRanges = [{ rangeStart: 10, rangeEnd: 100 }];
      const rightMaxLimit = 0;
      const horizontalSpacing = 1;

      const result = getRangeRepositioned({ inputRanges, rightMaxLimit, horizontalSpacing });

      expect(result).toHaveLength(1);
      expect(result[0].level).toBe(0);
      expect(result[0].relativeX).toBe(0);
      expect(result[0].relativeY).toBe(0);
    });

    it('should return safe defaults when rightMaxLimit is undefined', () => {
      const inputRanges = [{ rangeStart: 10, rangeEnd: 100 }];
      const rightMaxLimit = undefined;
      const horizontalSpacing = 1;

      const result = getRangeRepositioned({ inputRanges, rightMaxLimit, horizontalSpacing });

      expect(result).toHaveLength(1);
      expect(result[0].level).toBe(0);
      expect(result[0].relativeX).toBe(0);
      expect(result[0].relativeY).toBe(0);
    });

    it('should return safe defaults when rightMaxLimit is negative', () => {
      const inputRanges = [{ rangeStart: 10, rangeEnd: 100 }];
      const rightMaxLimit = -50;
      const horizontalSpacing = 1;

      const result = getRangeRepositioned({ inputRanges, rightMaxLimit, horizontalSpacing });

      expect(result).toHaveLength(1);
      expect(result[0].level).toBe(0);
      expect(result[0].relativeX).toBe(0);
      expect(result[0].relativeY).toBe(0);
    });

    it('should return safe defaults when rightMaxLimit is NaN', () => {
      const inputRanges = [{ rangeStart: 10, rangeEnd: 100 }];
      const rightMaxLimit = NaN;
      const horizontalSpacing = 1;

      const result = getRangeRepositioned({ inputRanges, rightMaxLimit, horizontalSpacing });

      expect(result).toHaveLength(1);
      expect(result[0].level).toBe(0);
      expect(result[0].relativeX).toBe(0);
      expect(result[0].relativeY).toBe(0);
    });

    it('should not exceed MAX_LEVEL (100) when layout is impossible', () => {
      // Create scenario where label is much wider than available space
      const inputRanges = [{ rangeStart: 0, rangeEnd: 1000 }];
      const rightMaxLimit = 50; // Much smaller than label width
      const horizontalSpacing = 1;

      const result = getRangeRepositioned({ inputRanges, rightMaxLimit, horizontalSpacing });

      // Should stop at MAX_LEVEL instead of infinite loop
      expect(result[0].level).toBeLessThanOrEqual(100);
    });
  });
});
