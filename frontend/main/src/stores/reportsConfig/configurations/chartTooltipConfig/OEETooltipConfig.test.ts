import { describe, expect, it, vi, beforeEach } from 'vitest';

import getOEEConfig from '@/stores/reportsConfig/configurations/chartTooltipConfig/OEETooltipConfig';
import type { TooltipRowConfig } from '@/stores/reportsConfig/configurations/chartTooltipConfig/types';
import { createMockChartParams } from '@/stores/reportsConfig/configurations/chartTooltipConfig/test-helpers/mockFactory';
import measure from '@/stores/reportsConfig/constants/measure';
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

describe('OEETooltipConfig', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('structure', () => {
    it('should return array of tooltip rows', () => {
      const params = createMockChartParams({
        cfgType: configType.OEE,
        chartLegendState: ['oee'],
      });
      const result = getOEEConfig(params);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should include 5 measure rows when all in legend state', () => {
      const params = createMockChartParams({
        cfgType: configType.OEE,
        data: { groups: [] },
        chartLegendState: ['oee', 'availability', 'performance', 'quality', 'technicalAvailability'],
        visibleColumns: [
          measure.OEE,
          measure.AVAILABILITY,
          measure.PERFORMANCE,
          measure.QUALITY,
          measure.TECHNICAL_AVAILABILITY,
        ],
      });
      const result = getOEEConfig(params);

      const measureRows = result.filter((row: TooltipRowConfig) => row.valueKey);
      expect(measureRows.length).toBeGreaterThanOrEqual(5);
    });
  });

  describe('chart legend state integration', () => {
    it('should include OEE row when oee in chartLegendState', () => {
      const params = createMockChartParams({
        cfgType: configType.OEE,
        data: { groups: [] },
        chartLegendState: ['oee'],
        visibleColumns: [measure.OEE],
      });
      const result = getOEEConfig(params);

      const oeeRow = result.find((row: TooltipRowConfig) => row.valueKey === measure.OEE);
      expect(oeeRow).toBeDefined();
    });

    it('should include availability row when availability in chartLegendState', () => {
      const params = createMockChartParams({
        cfgType: configType.OEE,
        data: { groups: [] },
        chartLegendState: ['availability'],
        visibleColumns: [measure.AVAILABILITY],
      });
      const result = getOEEConfig(params);

      const availRow = result.find((row: TooltipRowConfig) => row.valueKey === measure.AVAILABILITY);
      expect(availRow).toBeDefined();
    });

    it('should handle empty chartLegendState', () => {
      const params = createMockChartParams({
        cfgType: configType.OEE,
        chartLegendState: [],
        visibleColumns: [measure.OEE],
      });

      expect(() => getOEEConfig(params)).not.toThrow();
    });

    it('should handle all measures in chartLegendState', () => {
      const params = createMockChartParams({
        cfgType: configType.OEE,
        data: { groups: [] },
        chartLegendState: ['oee', 'availability', 'performance', 'quality', 'technicalAvailability'],
        visibleColumns: [
          measure.OEE,
          measure.AVAILABILITY,
          measure.PERFORMANCE,
          measure.QUALITY,
          measure.TECHNICAL_AVAILABILITY,
        ],
      });

      const result = getOEEConfig(params);
      expect(result.length).toBeGreaterThanOrEqual(5);
    });
  });

  describe('preprocessed chart integration', () => {
    it('should use createPreprocessedChartConfig for rows', () => {
      const params = createMockChartParams({
        cfgType: configType.OEE,
        chartLegendState: ['oee'],
        visibleColumns: [measure.OEE],
      });

      // Should not throw - createPreprocessedChartConfig handles preprocessed data
      expect(() => getOEEConfig(params)).not.toThrow();
    });

    it('should handle data with groups property', () => {
      const params = createMockChartParams({
        cfgType: configType.OEE,
        data: { groups: [] },
        chartLegendState: ['oee'],
        visibleColumns: [measure.OEE],
      });

      expect(() => getOEEConfig(params)).not.toThrow();
    });
  });

  describe('row configuration', () => {
    it('should configure all OEE measure rows', () => {
      const params = createMockChartParams({
        cfgType: configType.OEE,
        data: { groups: [] },
        chartLegendState: ['oee', 'availability', 'performance', 'quality', 'technicalAvailability'],
        visibleColumns: [
          measure.OEE,
          measure.AVAILABILITY,
          measure.PERFORMANCE,
          measure.QUALITY,
          measure.TECHNICAL_AVAILABILITY,
        ],
      });
      const result = getOEEConfig(params);

      const oeeRow = result.find((row: TooltipRowConfig) => row.valueKey === measure.OEE);
      const availRow = result.find((row: TooltipRowConfig) => row.valueKey === measure.AVAILABILITY);
      const perfRow = result.find((row: TooltipRowConfig) => row.valueKey === measure.PERFORMANCE);
      const qualRow = result.find((row: TooltipRowConfig) => row.valueKey === measure.QUALITY);
      const techRow = result.find((row: TooltipRowConfig) => row.valueKey === measure.TECHNICAL_AVAILABILITY);

      expect(oeeRow).toBeDefined();
      expect(availRow).toBeDefined();
      expect(perfRow).toBeDefined();
      expect(qualRow).toBeDefined();
      expect(techRow).toBeDefined();
    });
  });
});
