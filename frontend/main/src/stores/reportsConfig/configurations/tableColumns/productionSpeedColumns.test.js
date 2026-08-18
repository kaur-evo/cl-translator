import { describe, it, expect } from 'vitest';

import getProductionSpeedColumns, { getProductionSpeedText } from './productionSpeedColumns';

import xAxisKey from '@/stores/reportsConfig/constants/xAxisKey';

describe('getProductionSpeedText', () => {
  it('should return correct production speed text based on groupBy', () => {
    const mockGroupBy = [xAxisKey.UNIT_PER_HOUR];
    const mockOptions = {
      currentFilterItemsMap: {},
      requestFilterState: {},
      groupBy: mockGroupBy,
    };

    const result = getProductionSpeedText({
      ...mockOptions,
    });

    expect(result).toBe('{unit}_PER_HOUR');
  });

  it('should return empty string if groupBy is empty', () => {
    const mockOptions = {
      currentFilterItemsMap: {},
      requestFilterState: {},
      groupBy: [],
    };

    const result = getProductionSpeedText(mockOptions);

    expect(result).toBe('');
  });

  it('should return empty string if groupBy key is not in map', () => {
    const mockOptions = {
      currentFilterItemsMap: {},
      requestFilterState: {},
      groupBy: ['INVALID_KEY'],
    };

    const result = getProductionSpeedText(mockOptions);

    expect(result).toBe('');
  });
});

describe('getProductionSpeedColumns', () => {
  it('should return correct columns configuration', () => {
    const mockOptions = {
      isFirstIndex: true,
      getPrependImg: () => 'image.png',
      tableTotals: {
        productionCount: 100,
        productionTime: 200,
      },
      durFormatType: 'HH:mm:ss',
    };

    const columns = getProductionSpeedColumns(mockOptions);

    expect(columns.RANGE.text).toContain('Range');
    expect(columns.RANGE.id).toBeDefined();
    expect(columns.RANGE.prependIcon).toBeDefined();
    expect(columns.RANGE.formatFn).toBeInstanceOf(Function);
    expect(columns.RANGE.width).toBe('200px');

    expect(columns.PRODUCTION_COUNT.text).toContain('Count');
    expect(columns.PRODUCTION_COUNT.id).toBeDefined();
    expect(columns.PRODUCTION_COUNT.formatFn).toBeInstanceOf(Function);
    expect(columns.PRODUCTION_COUNT.width).toBe('75px');

    expect(columns.PRODUCTION_TIME.text).toContain('Production time');
    expect(columns.PRODUCTION_TIME.id).toBeDefined();
    expect(columns.PRODUCTION_TIME.formatFn).toBeInstanceOf(Function);
    expect(columns.PRODUCTION_TIME.width).toBe('75px');
  });
});
