import { describe, expect, it, vi, beforeEach } from 'vitest';

import getTimeUsageConfig from '@/stores/reportsConfig/configurations/chartTooltipConfig/timeUsageTooltipConfig';
import type { TooltipRowConfig } from '@/stores/reportsConfig/configurations/chartTooltipConfig/types';
import { createMockChartParams, createMockChartDataPoint } from '@/stores/reportsConfig/configurations/chartTooltipConfig/test-helpers/mockFactory';
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

describe('timeUsageTooltipConfig', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('structure', () => {
    it('should return array of tooltip rows', () => {
      const params = createMockChartParams({
        cfgType: configType.TIME_USAGE,
        data: createMockChartDataPoint({ '%groupId': 'good' }),
        chartLegendState: ['good'],
      });
      const result = getTimeUsageConfig(params);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('yAxis dependent visibility', () => {
    it('should hide plannedTime when yAxis is VALUE', () => {
      const params = createMockChartParams({
        cfgType: configType.TIME_USAGE,
        yAxis: yAxisKey.VALUE,
        data: { groups: [] }, // Not at highest level
        chartLegendState: ['planned'],
        visibleColumns: [measure.PLANNED_TIME],
      });
      const result = getTimeUsageConfig(params);

      const plannedRow = result.find((row: TooltipRowConfig) => row.valueKey === measure.PLANNED_TIME);
      // Should be filtered out
      expect(plannedRow).toBeUndefined();
    });

    it('should show plannedTime when yAxis is PCT_OF_PLANNED_TIME', () => {
      const params = createMockChartParams({
        cfgType: configType.TIME_USAGE,
        yAxis: yAxisKey.PCT_OF_PLANNED_TIME,
        data: { groups: [] },
        chartLegendState: ['plannedTime'],
        visibleColumns: [measure.PLANNED_TIME],
      });
      const result = getTimeUsageConfig(params);

      const plannedRow = result.find((row: TooltipRowConfig) => row.valueKey === measure.PLANNED_TIME);
      expect(plannedRow).toBeDefined();
    });

    it('should hide shiftTime when yAxis is PCT_OF_PLANNED_TIME', () => {
      const params = createMockChartParams({
        cfgType: configType.TIME_USAGE,
        yAxis: yAxisKey.PCT_OF_PLANNED_TIME,
        data: { groups: [] },
        chartLegendState: ['shiftTime'],
        visibleColumns: [calcMeasure.SHIFT_TIME],
      });
      const result = getTimeUsageConfig(params);

      const shiftRow = result.find((row: TooltipRowConfig) => row.valueKey === calcMeasure.SHIFT_TIME);
      expect(shiftRow).toBeUndefined();
    });

    it('should show shiftTime when yAxis is not PCT_OF_PLANNED_TIME', () => {
      const params = createMockChartParams({
        cfgType: configType.TIME_USAGE,
        yAxis: yAxisKey.VALUE,
        data: { groups: [] },
        chartLegendState: ['shiftTime'],
        visibleColumns: [calcMeasure.SHIFT_TIME],
      });
      const result = getTimeUsageConfig(params);

      const shiftRow = result.find((row: TooltipRowConfig) => row.valueKey === calcMeasure.SHIFT_TIME);
      expect(shiftRow).toBeDefined();
    });
  });

  describe('chart legend state integration', () => {
    it('should handle all time usage measures in chartLegendState', () => {
      const params = createMockChartParams({
        cfgType: configType.TIME_USAGE,
        yAxis: yAxisKey.VALUE,
        data: { groups: [] },
        chartLegendState: [
          'good',
          'slow',
          'unplannedStop',
          'uncommentedStop',
          'plannedStopOEE',
          'plannedStop',
          'shift',
          'operating',
        ],
        visibleColumns: [
          measure.GOOD_PRODUCTION,
          measure.SLOW_PRODUCTION,
          measure.UNPLANNED_STOP,
          measure.UNCOMMENTED_STOP,
          measure.PLANNED_STOP_INCLUDED_IN_OEE,
          measure.PLANNED_STOP_NOT_INCLUDED_IN_OEE,
          calcMeasure.SHIFT_TIME,
          calcMeasure.OPERATING_TIME,
        ],
      });

      expect(() => getTimeUsageConfig(params)).not.toThrow();
    });

    it('should handle empty chartLegendState', () => {
      const params = createMockChartParams({
        cfgType: configType.TIME_USAGE,
        data: createMockChartDataPoint({ '%groupId': 'good' }),
        chartLegendState: [],
        visibleColumns: [measure.GOOD_PRODUCTION],
      });

      expect(() => getTimeUsageConfig(params)).not.toThrow();
    });
  });
});
