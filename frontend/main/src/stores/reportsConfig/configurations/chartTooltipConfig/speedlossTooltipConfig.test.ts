import { describe, expect, it, vi, beforeEach } from 'vitest';

import getSpeedlossConfig from '@/stores/reportsConfig/configurations/chartTooltipConfig/speedlossTooltipConfig';
import type { TooltipRowConfig } from '@/stores/reportsConfig/configurations/chartTooltipConfig/types';
import { createMockChartParams } from '@/stores/reportsConfig/configurations/chartTooltipConfig/test-helpers/mockFactory';
import measure from '@/stores/reportsConfig/constants/measure';
import calcMeasure from '@/stores/reportsConfig/constants/calcMeasure';
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

describe('speedlossTooltipConfig', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('structure', () => {
    it('should return array of tooltip rows', () => {
      const params = createMockChartParams({ cfgType: configType.SPEEDLOSS });
      const result = getSpeedlossConfig(params);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should include 4 measure rows when all visible', () => {
      const params = createMockChartParams({
        cfgType: configType.SPEEDLOSS,
        visibleColumns: [
          measure.PERFORMANCE_LOSS_DURATION,
          calcMeasure.AVG_DURATION,
          measure.PERFORMANCE_LOSS_COUNT,
          measure.NOTES_COUNT,
        ],
      });
      const result = getSpeedlossConfig(params);

      const measureRows = result.filter((row: TooltipRowConfig) => row.valueKey);
      expect(measureRows.length).toBe(4);
    });
  });

  describe('row configuration', () => {
    it('should configure performance loss duration row correctly', () => {
      const params = createMockChartParams({
        cfgType: configType.SPEEDLOSS,
        visibleColumns: [measure.PERFORMANCE_LOSS_DURATION],
      });
      const result = getSpeedlossConfig(params);

      const durationRow = result.find((row: TooltipRowConfig) => row.valueKey === measure.PERFORMANCE_LOSS_DURATION);
      expect(durationRow).toBeDefined();
      expect(durationRow?.tooltipValueKey).toBe('valueLabel');
      expect(durationRow?.text).toBe('Duration');
    });

    it('should configure average duration row correctly', () => {
      const params = createMockChartParams({
        cfgType: configType.SPEEDLOSS,
        visibleColumns: [calcMeasure.AVG_DURATION],
      });
      const result = getSpeedlossConfig(params);

      const avgRow = result.find((row: TooltipRowConfig) => row.valueKey === calcMeasure.AVG_DURATION);
      expect(avgRow).toBeDefined();
      expect(avgRow?.tooltipValueKey).toBe('avgDurationFormatted');
      expect(avgRow?.text).toBe('Average duration');
    });

    it('should configure performance loss count row correctly', () => {
      const params = createMockChartParams({
        cfgType: configType.SPEEDLOSS,
        visibleColumns: [measure.PERFORMANCE_LOSS_COUNT],
      });
      const result = getSpeedlossConfig(params);

      const countRow = result.find((row: TooltipRowConfig) => row.valueKey === measure.PERFORMANCE_LOSS_COUNT);
      expect(countRow).toBeDefined();
      expect(countRow?.tooltipValueKey).toBe('entityCountLabel');
      expect(countRow?.text).toBe('stopcount');
    });

    it('should configure notes count row correctly', () => {
      const params = createMockChartParams({
        cfgType: configType.SPEEDLOSS,
        visibleColumns: [measure.NOTES_COUNT],
      });
      const result = getSpeedlossConfig(params);

      const notesRow = result.find((row: TooltipRowConfig) => row.valueKey === measure.NOTES_COUNT);
      expect(notesRow).toBeDefined();
    });
  });

  describe('filtering', () => {
    it('should filter rows by visibleColumns', () => {
      const params = createMockChartParams({
        cfgType: configType.SPEEDLOSS,
        visibleColumns: [measure.PERFORMANCE_LOSS_DURATION],
      });
      const result = getSpeedlossConfig(params);

      const measureRows = result.filter((row: TooltipRowConfig) => row.valueKey);
      expect(measureRows.length).toBe(1);
      expect(measureRows[0]?.valueKey).toBe(measure.PERFORMANCE_LOSS_DURATION);
    });
  });
});
