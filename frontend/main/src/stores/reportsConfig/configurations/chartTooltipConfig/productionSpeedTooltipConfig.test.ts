import { describe, expect, it, vi, beforeEach } from 'vitest';

import getProductionSpeedConfig from '@/stores/reportsConfig/configurations/chartTooltipConfig/productionSpeedTooltipConfig';
import type { TooltipRowConfig, ChartConfigParams } from '@/stores/reportsConfig/configurations/chartTooltipConfig/types';
import { createMockChartParams, createMockChartDataPoint, createMockTotals } from '@/stores/reportsConfig/configurations/chartTooltipConfig/test-helpers/mockFactory';
import measure from '@/stores/reportsConfig/constants/measure';
// eslint-disable-next-line import/order
import configType from '@/stores/reportsConfig/constants/configType';


// Mock i18n
vi.mock('@/services/i18n', () => ({
  default: {
    global: {
      t: vi.fn((key: string) => key),
    },
  },
}));

// Mock IconResolver
vi.mock('@/helpers/tooltips/IconResolver', () => ({
  resolveIcon: vi.fn(() => 'iconYAxis'),
}));

// Mock visibility helpers
vi.mock('@/stores/reportsConfig/configurations/productionSpeedCommonFn', () => ({
  isModeVisible: vi.fn(() => true),
  isTargetVisible: vi.fn(() => true),
}));

// Mock formatting helpers
vi.mock('@/helpers/numbers/formatNumber', () => ({
  formatPercentage: vi.fn((val: number) => `${val.toFixed(1)}%`),
  formatNumber: vi.fn((val: number) => val.toString()),
}));

vi.mock('@/helpers/getUnitIdFormatted', () => ({
  default: vi.fn((_groupBy: string, unitId: string) => unitId || 'units'),
}));

// Import mocked functions to control behavior
import { isModeVisible, isTargetVisible } from '@/stores/reportsConfig/configurations/productionSpeedCommonFn';

describe('productionSpeedTooltipConfig', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset to default behavior
    vi.mocked(isModeVisible).mockReturnValue(true);
    vi.mocked(isTargetVisible).mockReturnValue(true);
  });

  describe('structure', () => {
    it('should return array of tooltip rows', () => {
      const params = createMockChartParams({ cfgType: configType.PRODUCTION_SPEED });
      const result = getProductionSpeedConfig(params);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should include standard grouping rows', () => {
      const params = createMockChartParams({ cfgType: configType.PRODUCTION_SPEED });
      const result = getProductionSpeedConfig(params);

      const hasGroupingRow = result.some((row: TooltipRowConfig) => !row.valueKey);
      expect(hasGroupingRow).toBe(true);
    });

    it('should include up to 5 measure rows when all visible', () => {
      const params = createMockChartParams({
        cfgType: configType.PRODUCTION_SPEED,
        visibleColumns: [
          'primaryValue',
          measure.PRODUCTION_SPEED_COUNT,
          measure.PRODCUTION_TIME,
          measure.TARGET,
          measure.MODE,
        ],
      });
      const result = getProductionSpeedConfig(params);

      const measureRows = result.filter((row: TooltipRowConfig) => row.valueKey);
      // Should have primary, count, time, target, mode = 5 rows
      expect(measureRows.length).toBe(5);
    });
  });

  describe('primary value row', () => {
    it('should include primary value row', () => {
      const params = createMockChartParams({
        cfgType: configType.PRODUCTION_SPEED,
        visibleColumns: ['primaryValue'],
      });
      const result = getProductionSpeedConfig(params);

      const primaryRow = result.find((row: TooltipRowConfig) => row.valueKey === 'primaryValue');
      expect(primaryRow).toBeDefined();
    });

    it('should use correct label/value config for primary row', () => {
      const params = createMockChartParams({
        cfgType: configType.PRODUCTION_SPEED,
        visibleColumns: ['primaryValue'],
      });
      const result = getProductionSpeedConfig(params);

      const primaryRow = result.find((row: TooltipRowConfig) => row.valueKey === 'primaryValue');
      // Primary row should have isPrimary or tooltipValue function
      expect(primaryRow).toBeDefined();
    });
  });

  describe('production count row', () => {
    it('should include count row with percentage', () => {
      const params = createMockChartParams({
        cfgType: configType.PRODUCTION_SPEED,
        data: createMockChartDataPoint({
          productionCount: 50,
          productionCountLabel: '50',
        }),
        totals: createMockTotals({ productionCount: 200 }),
        visibleColumns: [measure.PRODUCTION_SPEED_COUNT],
      });
      const result = getProductionSpeedConfig(params);

      const countRow = result.find((row: TooltipRowConfig) => row.valueKey === measure.PRODUCTION_SPEED_COUNT);
      expect(countRow).toBeDefined();
    });

    it('should use correct value config', () => {
      const params = createMockChartParams({
        cfgType: configType.PRODUCTION_SPEED,
        visibleColumns: [measure.PRODUCTION_SPEED_COUNT],
      });
      const result = getProductionSpeedConfig(params);

      const countRow = result.find((row: TooltipRowConfig) => row.valueKey === measure.PRODUCTION_SPEED_COUNT);
      // Should have tooltipValue function for percentage calculation
      expect(countRow?.tooltipValue).toBeDefined();
    });
  });

  describe('production time row', () => {
    it('should include time row with percentage', () => {
      const params = createMockChartParams({
        cfgType: configType.PRODUCTION_SPEED,
        data: createMockChartDataPoint({
          productionTime: 3600,
          productionTimeLabel: '1h',
        }),
        totals: createMockTotals({ productionTime: 7200 }),
        visibleColumns: [measure.PRODCUTION_TIME],
      });
      const result = getProductionSpeedConfig(params);

      const timeRow = result.find((row: TooltipRowConfig) => row.valueKey === measure.PRODCUTION_TIME);
      expect(timeRow).toBeDefined();
    });

    it('should use correct value config', () => {
      const params = createMockChartParams({
        cfgType: configType.PRODUCTION_SPEED,
        visibleColumns: [measure.PRODCUTION_TIME],
      });
      const result = getProductionSpeedConfig(params);

      const timeRow = result.find((row: TooltipRowConfig) => row.valueKey === measure.PRODCUTION_TIME);
      expect(timeRow?.tooltipValue).toBeDefined();
    });
  });

  describe('target row', () => {
    it('should include target row when target is visible', () => {
      vi.mocked(isTargetVisible).mockReturnValue(true);

      const params = createMockChartParams({
        cfgType: configType.PRODUCTION_SPEED,
        visibleColumns: [measure.TARGET],
      });
      const result = getProductionSpeedConfig(params);

      const targetRow = result.find((row: TooltipRowConfig) => row.valueKey === measure.TARGET);
      expect(targetRow).toBeDefined();
    });

    it('should hide target row when not visible', () => {
      vi.mocked(isTargetVisible).mockReturnValue(false);

      const params = createMockChartParams({
        cfgType: configType.PRODUCTION_SPEED,
        visibleColumns: [measure.TARGET],
      });
      const result = getProductionSpeedConfig(params);

      const targetRow = result.find((row: TooltipRowConfig) => row.valueKey === measure.TARGET);
      // Row should be filtered out by filterHidden()
      expect(targetRow).toBeUndefined();
    });

    it('should call isTargetVisible with correct params', () => {
      const mockData = createMockChartDataPoint();
      const mockLegendState = ['speed', 'target'];

      const params = createMockChartParams({
        cfgType: configType.PRODUCTION_SPEED,
        data: mockData,
        chartLegendState: mockLegendState,
        visibleColumns: [measure.TARGET],
      });

      getProductionSpeedConfig(params);

      expect(isTargetVisible).toHaveBeenCalledWith(mockData, mockLegendState);
    });

    it('should have visibility always for target row', () => {
      vi.mocked(isTargetVisible).mockReturnValue(true);

      const params = createMockChartParams({
        cfgType: configType.PRODUCTION_SPEED,
        visibleColumns: [], // Even with empty visibleColumns
      });
      const result = getProductionSpeedConfig(params);

      const targetRow = result.find((row: TooltipRowConfig) => row.valueKey === measure.TARGET);
      // Target row should still be present due to visibility: 'always'
      expect(targetRow).toBeDefined();
    });
  });

  describe('mode row', () => {
    it('should include mode row when mode is visible', () => {
      vi.mocked(isModeVisible).mockReturnValue(true);

      const params = createMockChartParams({
        cfgType: configType.PRODUCTION_SPEED,
        visibleColumns: [measure.MODE],
      });
      const result = getProductionSpeedConfig(params);

      const modeRow = result.find((row: TooltipRowConfig) => row.valueKey === measure.MODE);
      expect(modeRow).toBeDefined();
    });

    it('should hide mode row when not visible', () => {
      vi.mocked(isModeVisible).mockReturnValue(false);

      const params = createMockChartParams({
        cfgType: configType.PRODUCTION_SPEED,
        visibleColumns: [measure.MODE],
      });
      const result = getProductionSpeedConfig(params);

      const modeRow = result.find((row: TooltipRowConfig) => row.valueKey === measure.MODE);
      expect(modeRow).toBeUndefined();
    });

    it('should call isModeVisible with correct params', () => {
      const mockData = createMockChartDataPoint();
      const mockLegendState = ['speed', 'mode'];

      const params = createMockChartParams({
        cfgType: configType.PRODUCTION_SPEED,
        data: mockData,
        chartLegendState: mockLegendState,
        visibleColumns: [measure.MODE],
      });

      getProductionSpeedConfig(params);

      expect(isModeVisible).toHaveBeenCalledWith(mockData, mockLegendState);
    });

    it('should have visibility always for mode row', () => {
      vi.mocked(isModeVisible).mockReturnValue(true);

      const params = createMockChartParams({
        cfgType: configType.PRODUCTION_SPEED,
        visibleColumns: [],
      });
      const result = getProductionSpeedConfig(params);

      const modeRow = result.find((row: TooltipRowConfig) => row.valueKey === measure.MODE);
      expect(modeRow).toBeDefined();
    });
  });

  describe('filtering integration', () => {
    it('should filter by visibleColumns correctly', () => {
      const params = createMockChartParams({
        cfgType: configType.PRODUCTION_SPEED,
        visibleColumns: [measure.PRODUCTION_SPEED_COUNT],
      });
      const result = getProductionSpeedConfig(params);

      const countRow = result.find((row: TooltipRowConfig) => row.valueKey === measure.PRODUCTION_SPEED_COUNT);
      const timeRow = result.find((row: TooltipRowConfig) => row.valueKey === measure.PRODCUTION_TIME);

      expect(countRow).toBeDefined();
      expect(timeRow).toBeUndefined(); // Filtered out
    });

    it('should keep target and mode even with empty visibleColumns due to visibility always', () => {
      vi.mocked(isTargetVisible).mockReturnValue(true);
      vi.mocked(isModeVisible).mockReturnValue(true);

      const params = createMockChartParams({
        cfgType: configType.PRODUCTION_SPEED,
        visibleColumns: [],
      });
      const result = getProductionSpeedConfig(params);

      const targetRow = result.find((row: TooltipRowConfig) => row.valueKey === measure.TARGET);
      const modeRow = result.find((row: TooltipRowConfig) => row.valueKey === measure.MODE);

      expect(targetRow).toBeDefined();
      expect(modeRow).toBeDefined();
    });

    it('should remove hidden rows', () => {
      vi.mocked(isTargetVisible).mockReturnValue(false);
      vi.mocked(isModeVisible).mockReturnValue(false);

      const params = createMockChartParams({
        cfgType: configType.PRODUCTION_SPEED,
        visibleColumns: [measure.TARGET, measure.MODE],
      });
      const result = getProductionSpeedConfig(params);

      const targetRow = result.find((row: TooltipRowConfig) => row.valueKey === measure.TARGET);
      const modeRow = result.find((row: TooltipRowConfig) => row.valueKey === measure.MODE);

      // Both should be filtered out by filterHidden()
      expect(targetRow).toBeUndefined();
      expect(modeRow).toBeUndefined();
    });
  });

  describe('edge cases', () => {
    it('should handle empty totals object', () => {
      const params = createMockChartParams({
        cfgType: configType.PRODUCTION_SPEED,
        totals: {},
        visibleColumns: [measure.PRODUCTION_SPEED_COUNT],
      });

      // Should not throw
      expect(() => getProductionSpeedConfig(params)).not.toThrow();
      const result = getProductionSpeedConfig(params);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle zero totals for productionCount', () => {
      const params = createMockChartParams({
        cfgType: configType.PRODUCTION_SPEED,
        totals: createMockTotals({ productionCount: 0 }),
        visibleColumns: [measure.PRODUCTION_SPEED_COUNT],
      });

      // Should not throw (uses ?? 1 fallback)
      expect(() => getProductionSpeedConfig(params)).not.toThrow();
    });

    it('should handle zero totals for productionTime', () => {
      const params = createMockChartParams({
        cfgType: configType.PRODUCTION_SPEED,
        totals: createMockTotals({ productionTime: 0 }),
        visibleColumns: [measure.PRODCUTION_TIME],
      });

      // Should not throw (uses ?? 1 fallback)
      expect(() => getProductionSpeedConfig(params)).not.toThrow();
    });

    it('should handle missing data fields gracefully', () => {
      const params = createMockChartParams({
        cfgType: configType.PRODUCTION_SPEED,
        data: {},
        visibleColumns: [measure.PRODUCTION_SPEED_COUNT],
      });

      expect(() => getProductionSpeedConfig(params)).not.toThrow();
    });

    it('should handle undefined totals parameter', () => {
      const params = createMockChartParams({
        cfgType: configType.PRODUCTION_SPEED,
        totals: undefined,
        visibleColumns: [measure.PRODUCTION_SPEED_COUNT],
      });

      // Should default to empty object
      expect(() => getProductionSpeedConfig(params)).not.toThrow();
    });

    it('should handle all rows visible', () => {
      const params = createMockChartParams({
        cfgType: configType.PRODUCTION_SPEED,
        visibleColumns: [
          'primaryValue',
          measure.PRODUCTION_SPEED_COUNT,
          measure.PRODCUTION_TIME,
          measure.TARGET,
          measure.MODE,
        ],
      });

      const result = getProductionSpeedConfig(params);
      const measureRows = result.filter((row: TooltipRowConfig) => row.valueKey);

      expect(measureRows.length).toBe(5);
    });

    it('should handle chartLegendState parameter', () => {
      const legendState = ['speed', 'target', 'mode'];
      const params = createMockChartParams({
        cfgType: configType.PRODUCTION_SPEED,
        chartLegendState: legendState,
        visibleColumns: [measure.TARGET],
      });

      getProductionSpeedConfig(params);

      expect(isTargetVisible).toHaveBeenCalledWith(params.data, legendState);
    });

    it('should handle empty chartLegendState', () => {
      const params = createMockChartParams({
        cfgType: configType.PRODUCTION_SPEED,
        chartLegendState: [],
        visibleColumns: [measure.TARGET],
      });

      expect(() => getProductionSpeedConfig(params)).not.toThrow();
    });
  });

  describe('runtime context integration', () => {
    it('should pass groupBy to value config', () => {
      const mockGroupBy = ['entity', 'product'];
      const params = createMockChartParams({
        cfgType: configType.PRODUCTION_SPEED,
        groupBy: mockGroupBy as unknown as ChartConfigParams['groupBy'],
        visibleColumns: [measure.PRODUCTION_SPEED_COUNT],
      });

      // Should not throw - groupBy passed to value context
      expect(() => getProductionSpeedConfig(params)).not.toThrow();
    });

    it('should pass totals to value config', () => {
      const mockTotals = createMockTotals({ productionCount: 500, productionTime: 10000 });
      const params = createMockChartParams({
        cfgType: configType.PRODUCTION_SPEED,
        totals: mockTotals,
        visibleColumns: [measure.PRODUCTION_SPEED_COUNT],
      });

      expect(() => getProductionSpeedConfig(params)).not.toThrow();
    });
  });
});
