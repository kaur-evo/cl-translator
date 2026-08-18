import { describe, expect, it, vi, beforeEach } from 'vitest';

import { getProductionSpeedLabelConfig, getProductionSpeedValueConfig } from '@/stores/reportsConfig/configurations/chartTooltipConfig/productionSpeedTooltipBaseConfig';
import type { ChartDataPoint, TotalsData } from '@/stores/reportsConfig/configurations/chartTooltipConfig/types';
import measure from '@/stores/reportsConfig/constants/measure';
import yAxisKey from '@/stores/reportsConfig/constants/yAxisKey';
import i18n from '@/services/i18n';
import colorConstants from '@/constants/colorConstants';
import graphColors from '@/constants/graphColors';

// Mock the formatting functions
vi.mock('@/helpers/numbers/formatNumber', () => ({
  formatPercentage: vi.fn((val: number) => `${val.toFixed(1)}%`),
  formatNumber: vi.fn((val: number) => val.toString()),
}));

vi.mock('@/helpers/getUnitIdFormatted', () => ({
  default: vi.fn((_groupBy: string, unitId: string) => unitId || 'units'),
}));

vi.mock('@/stores/reportsConfig/configurations/productionSpeedCommonFn', () => ({
  isModeVisible: vi.fn(() => true),
  isTargetVisible: vi.fn(() => true),
}));

describe('productionSpeedTooltipBaseConfig', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getProductionSpeedLabelConfig', () => {
    describe('primaryValue row type', () => {
      it('should return config with isPrimary flag', () => {
        const result = getProductionSpeedLabelConfig('primaryValue');
        expect(result).toEqual({
          isPrimary: true,
        });
      });
    });

    describe('alternativePrimaryLabel row type', () => {
      it('should return config with dynamic text and color for faster than target', () => {
        const result = getProductionSpeedLabelConfig('alternativePrimaryLabel');

        expect(result.icon).toBe('iconDot');
        expect(typeof result.text).toBe('function');
        expect(typeof result.color).toBe('function');

        const mockData: ChartDataPoint = { isFasterThanTarget: true };
        const text = typeof result.text === 'function' ? result.text(mockData) : result.text;
        const color = typeof result.color === 'function' ? result.color(mockData) : result.color;

        expect(text).toBe(i18n.global.t('Faster than target'));
        expect(color).toBe(colorConstants.dark.primary);
      });

      it('should return config with dynamic text and color for slower than target', () => {
        const result = getProductionSpeedLabelConfig('alternativePrimaryLabel');

        const mockData: ChartDataPoint = { isFasterThanTarget: false };
        const text = typeof result.text === 'function' ? result.text(mockData) : result.text;
        const color = typeof result.color === 'function' ? result.color(mockData) : result.color;

        expect(text).toBe(i18n.global.t('Slower than target'));
        expect(color).toBe(graphColors['graph-yellow']);
      });
    });

    describe('PRODUCTION_SPEED_COUNT row type', () => {
      it('should return correct config', () => {
        const result = getProductionSpeedLabelConfig(measure.PRODUCTION_SPEED_COUNT);
        expect(result).toEqual({
          text: i18n.global.t('Count'),
        });
      });
    });

    describe('PRODCUTION_TIME row type', () => {
      it('should return correct config', () => {
        const result = getProductionSpeedLabelConfig(measure.PRODCUTION_TIME);
        expect(result).toEqual({
          text: i18n.global.t('Production time'),
        });
      });
    });

    describe('TARGET row type', () => {
      it('should return correct config', () => {
        const result = getProductionSpeedLabelConfig(measure.TARGET);
        expect(result).toEqual({
          text: i18n.global.t('Target speed'),
          icon: 'iconDot',
          color: colorConstants.dark.black,
        });
      });
    });

    describe('MODE row type', () => {
      it('should return correct config', () => {
        const result = getProductionSpeedLabelConfig(measure.MODE);
        expect(result).toEqual({
          text: i18n.global.t('Most frequent'),
          icon: 'iconDot',
          color: graphColors['graph-blue'],
        });
      });
    });

    describe('error handling', () => {
      it('should throw error for unknown row type', () => {
        expect(() => getProductionSpeedLabelConfig('UNKNOWN_TYPE'))
          .toThrow('getProductionSpeedLabelConfig unknown type: UNKNOWN_TYPE');
      });
    });
  });

  describe('getProductionSpeedValueConfig', () => {
    const mockData: ChartDataPoint = {
      rangeStart: 10,
      rangeEnd: 20,
      unitId: 'pcs/h',
      productionCount: 50,
      productionCountLabel: '50',
      productionTime: 3600,
      productionTimeLabel: '1h',
      targetLabel: '15',
      modeLabel: '12',
    };

    const mockTotals: TotalsData = {
      productionCount: 100,
      productionTime: 7200,
    };

    const mockGroupBy = ['entity'];

    describe('primaryValue row type', () => {
      it('should return config with dynamic tooltipValue function', () => {
        const result = getProductionSpeedValueConfig('primaryValue', { groupBy: mockGroupBy, totals: mockTotals });

        expect(result.yAxisValueKey).toBe('primaryValue');
        expect(typeof result.tooltipValue).toBe('function');

        // @ts-expect-error: tooltipValue can be string or function
        const value = result.tooltipValue?.(mockData);
        expect(value).toBe('10 - 20 pcs/h');
      });
    });

    describe('PRODUCTION_SPEED_COUNT row type', () => {
      it('should return config with percentage calculation', () => {
        const result = getProductionSpeedValueConfig(measure.PRODUCTION_SPEED_COUNT, { groupBy: mockGroupBy, totals: mockTotals });

        expect(result.yAxisValueKey).toBe(yAxisKey.PRODUCTION_COUNT);
        expect(typeof result.tooltipValue).toBe('function');

        // @ts-expect-error: tooltipValue can be string or function
        const value = result.tooltipValue?.(mockData);
        expect(value).toContain('50'); // productionCountLabel
        expect(value).toContain('%'); // percentage
      });

      it('should handle division by zero when totals.productionCount is 0', () => {
        const result = getProductionSpeedValueConfig(measure.PRODUCTION_SPEED_COUNT, { groupBy: mockGroupBy, totals: { productionCount: 0 } });
        const tooltipValueFn = result.tooltipValue;

        if (typeof tooltipValueFn === 'function') {
          // Should not throw, uses ?? 1 fallback
          expect(() => tooltipValueFn(mockData)).not.toThrow();
        }
      });
    });

    describe('PRODCUTION_TIME row type', () => {
      it('should return config with percentage calculation', () => {
        const result = getProductionSpeedValueConfig(measure.PRODCUTION_TIME, { groupBy: mockGroupBy, totals: mockTotals });

        expect(result.yAxisValueKey).toBe(yAxisKey.PRODUCTION_TIME);
        expect(typeof result.tooltipValue).toBe('function');

        if (typeof result.tooltipValue === 'function') {
          const value = result.tooltipValue?.(mockData);
          expect(value).toContain('1h'); // productionTimeLabel
          expect(value).toContain('%'); // percentage
        }
      });

      it('should handle division by zero when totals.productionTime is 0', () => {
        const result = getProductionSpeedValueConfig(measure.PRODCUTION_TIME, { groupBy: mockGroupBy, totals: { productionTime: 0 } });
        const tooltipValueFn = result.tooltipValue;

        if (typeof tooltipValueFn === 'function') {
          // Should not throw, uses ?? 1 fallback
          expect(() => tooltipValueFn(mockData)).not.toThrow();
        }
      });
    });

    describe('TARGET row type', () => {
      it('should return config with visibility always', () => {
        const result = getProductionSpeedValueConfig(measure.TARGET, { groupBy: mockGroupBy, totals: mockTotals });

        expect(result.visibility).toBe('always');

        expect(typeof result.tooltipValue).toBe('function');
        if (typeof result.tooltipValue === 'function') {
          const value = result.tooltipValue(mockData);
          expect(value).toBe('15 pcs/h');
        }
      });
    });

    describe('MODE row type', () => {
      it('should return config with visibility always', () => {
        const result = getProductionSpeedValueConfig(measure.MODE, { groupBy: mockGroupBy, totals: mockTotals });

        expect(result.visibility).toBe('always');

        expect(typeof result.tooltipValue).toBe('function');
        if (typeof result.tooltipValue === 'function') {
          const value = result.tooltipValue(mockData);
          expect(value).toBe('12 pcs/h');
        }
      });
    });

    describe('error handling', () => {
      it('should throw error for unknown row type', () => {
        expect(() => getProductionSpeedValueConfig('UNKNOWN_TYPE', { groupBy: mockGroupBy, totals: mockTotals }))
          .toThrow('getProductionSpeedValueConfig unknown type: UNKNOWN_TYPE');
      });
    });

    describe('totals parameter defaults', () => {
      it('should use empty object as default for totals', () => {
        // This tests that totals = {} as TotalsData works correctly
        const result = getProductionSpeedValueConfig(measure.PRODUCTION_SPEED_COUNT, { groupBy: mockGroupBy, totals: {} });

        expect(typeof result.tooltipValue).toBe('function');
      });
    });
  });
});
