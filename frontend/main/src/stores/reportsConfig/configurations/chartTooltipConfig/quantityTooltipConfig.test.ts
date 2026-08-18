import { describe, expect, it, vi, beforeEach } from 'vitest';

import getQuantityConfig from '@/stores/reportsConfig/configurations/chartTooltipConfig/quantityTooltipConfig';
import type { TooltipRowConfig } from '@/stores/reportsConfig/configurations/chartTooltipConfig/types';
import { createMockChartParams, createMockChartDataPoint, createNestedMockData } from '@/stores/reportsConfig/configurations/chartTooltipConfig/test-helpers/mockFactory';
import measure from '@/stores/reportsConfig/constants/measure';
import calcMeasure from '@/stores/reportsConfig/constants/calcMeasure';
import yAxisKey from '@/stores/reportsConfig/constants/yAxisKey';
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

describe('quantityTooltipConfig', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('structure', () => {
    it('should return array of tooltip rows', () => {
      const params = createMockChartParams({
        cfgType: configType.QUANTITY,
        data: createMockChartDataPoint({ '%groupId': 'good' }),
        chartLegendState: ['produced'],
      });
      const result = getQuantityConfig(params);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('isHighestLevel conditional hiding', () => {
    it('should hide potential/good/scrap when at highest level', () => {
      const highestLevelData = createMockChartDataPoint({ '%groupId': 'good' }); // No groups property
      const params = createMockChartParams({
        cfgType: configType.QUANTITY,
        data: highestLevelData,
        chartLegendState: ['potential', 'good', 'scrap'],
        visibleColumns: [calcMeasure.POTENTIAL_QTY, measure.GOOD_QTY, measure.SCRAP_QTY],
      });
      const result = getQuantityConfig(params);

      const potentialRow = result.find((row: TooltipRowConfig) => row.valueKey === calcMeasure.POTENTIAL_QTY);
      const goodRow = result.find((row: TooltipRowConfig) => row.valueKey === measure.GOOD_QTY);
      const scrapRow = result.find((row: TooltipRowConfig) => row.valueKey === measure.SCRAP_QTY);

      // These should be filtered out by filterHidden()
      expect(potentialRow).toBeUndefined();
      expect(goodRow).toBeUndefined();
      expect(scrapRow).toBeUndefined();
    });

    it('should show potential/good/scrap when not at highest level', () => {
      const nestedData = createNestedMockData(); // Has groups property
      const params = createMockChartParams({
        cfgType: configType.QUANTITY,
        data: nestedData,
        chartLegendState: ['potential', 'good', 'scrap'],
        visibleColumns: [calcMeasure.POTENTIAL_QTY, measure.GOOD_QTY, measure.SCRAP_QTY],
      });
      const result = getQuantityConfig(params);

      const potentialRow = result.find((row: TooltipRowConfig) => row.valueKey === calcMeasure.POTENTIAL_QTY);
      const goodRow = result.find((row: TooltipRowConfig) => row.valueKey === measure.GOOD_QTY);
      const scrapRow = result.find((row: TooltipRowConfig) => row.valueKey === measure.SCRAP_QTY);

      expect(potentialRow).toBeDefined();
      expect(goodRow).toBeDefined();
      expect(scrapRow).toBeDefined();
    });

    it('should always show produced and ideal rows', () => {
      const nestedData = createNestedMockData(); // Use nested data so rows aren't hidden by isHighestLevel
      const params = createMockChartParams({
        cfgType: configType.QUANTITY,
        data: nestedData,
        chartLegendState: ['rowProducedQty', 'idealQty'],
        visibleColumns: [measure.ROW_PRODUCED_QTY, measure.IDEAL_QTY],
      });
      const result = getQuantityConfig(params);

      const producedRow = result.find((row: TooltipRowConfig) => row.valueKey === measure.ROW_PRODUCED_QTY);
      const idealRow = result.find((row: TooltipRowConfig) => row.valueKey === measure.IDEAL_QTY);

      expect(producedRow).toBeDefined();
      expect(idealRow).toBeDefined();
    });
  });

  describe('yAxis dependent configuration', () => {
    it('should pass yAxis to value config function', () => {
      const params = createMockChartParams({
        cfgType: configType.QUANTITY,
        data: createMockChartDataPoint({ '%groupId': 'good' }),
        yAxis: yAxisKey.ENTITY_ALT_COUNT,
        chartLegendState: ['good'],
        visibleColumns: [measure.GOOD_QTY],
      });

      // Should not throw - yAxis passed to getQuantityValueConfig
      expect(() => getQuantityConfig(params)).not.toThrow();
    });
  });

  describe('chart legend state integration', () => {
    it('should handle empty chartLegendState', () => {
      const params = createMockChartParams({
        cfgType: configType.QUANTITY,
        data: createMockChartDataPoint({ '%groupId': 'good' }),
        chartLegendState: [],
        visibleColumns: [measure.GOOD_QTY],
      });

      expect(() => getQuantityConfig(params)).not.toThrow();
    });
  });
});
