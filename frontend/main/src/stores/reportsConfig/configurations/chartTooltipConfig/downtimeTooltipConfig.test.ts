import { describe, expect, it, vi, beforeEach } from 'vitest';

import getDowntimeConfig from '@/stores/reportsConfig/configurations/chartTooltipConfig/downtimeTooltipConfig';
import type { TooltipRowConfig } from '@/stores/reportsConfig/configurations/chartTooltipConfig/types';
import { createMockChartParams } from '@/stores/reportsConfig/configurations/chartTooltipConfig/test-helpers/mockFactory';
import measure from '@/stores/reportsConfig/constants/measure';
import yAxisKey from '@/stores/reportsConfig/constants/yAxisKey';
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

describe('downtimeTooltipConfig', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('structure', () => {
    it('should return array of tooltip rows', () => {
      const params = createMockChartParams({ cfgType: configType.DOWNTIME });
      const result = getDowntimeConfig(params);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should include standard grouping rows', () => {
      const params = createMockChartParams({ cfgType: configType.DOWNTIME });
      const result = getDowntimeConfig(params);

      // At least one grouping row should exist (entity name)
      const hasGroupingRow = result.some((row: TooltipRowConfig) => !row.valueKey);
      expect(hasGroupingRow).toBe(true);
    });

    it('should include all measure rows when no filtering', () => {
      const params = createMockChartParams({
        cfgType: configType.DOWNTIME,
        visibleColumns: [
          measure.STOP_DURATION,
          calcMeasure.AVG_DURATION,
          measure.STOP_COUNT,
          measure.NOTES_COUNT,
          calcMeasure.ENTITY_PCT_PLANNED_TIME,
        ],
      });
      const result = getDowntimeConfig(params);

      // Should have grouping rows + 5 measure rows
      expect(result.length).toBeGreaterThanOrEqual(5);
    });
  });

  describe('row configuration', () => {
    it('should configure stop duration row correctly', () => {
      const params = createMockChartParams({
        cfgType: configType.DOWNTIME,
        visibleColumns: [measure.STOP_DURATION],
      });
      const result = getDowntimeConfig(params);

      const durationRow = result.find((row: TooltipRowConfig) => row.valueKey === measure.STOP_DURATION);
      expect(durationRow).toBeDefined();
      expect(durationRow?.tooltipValueKey).toBe('valueLabel');
      expect(durationRow?.text).toBe('Duration');
    });

    it('should configure average duration row correctly', () => {
      const params = createMockChartParams({
        cfgType: configType.DOWNTIME,
        visibleColumns: [calcMeasure.AVG_DURATION],
      });
      const result = getDowntimeConfig(params);

      const avgRow = result.find((row: TooltipRowConfig) => row.valueKey === calcMeasure.AVG_DURATION);
      expect(avgRow).toBeDefined();
      expect(avgRow?.tooltipValueKey).toBe('avgDurationFormatted');
      expect(avgRow?.text).toBe('Average duration');
    });

    it('should configure stop count row correctly', () => {
      const params = createMockChartParams({
        cfgType: configType.DOWNTIME,
        visibleColumns: [measure.STOP_COUNT],
      });
      const result = getDowntimeConfig(params);

      const countRow = result.find((row: TooltipRowConfig) => row.valueKey === measure.STOP_COUNT);
      expect(countRow).toBeDefined();
      expect(countRow?.tooltipValueKey).toBe('entityCountLabel');
      expect(countRow?.text).toBe('stopcount');
    });

    it('should configure notes count row correctly', () => {
      const params = createMockChartParams({
        cfgType: configType.DOWNTIME,
        visibleColumns: [measure.NOTES_COUNT],
      });
      const result = getDowntimeConfig(params);

      const notesRow = result.find((row: TooltipRowConfig) => row.valueKey === measure.NOTES_COUNT);
      expect(notesRow).toBeDefined();
      expect(notesRow?.tooltipValueKey).toBe('notesCount');
      expect(notesRow?.text).toBe('notescount');
    });

    it('should configure entity % planned time row correctly', () => {
      const params = createMockChartParams({
        cfgType: configType.DOWNTIME,
        visibleColumns: [calcMeasure.ENTITY_PCT_PLANNED_TIME],
      });
      const result = getDowntimeConfig(params);

      const pctRow = result.find((row: TooltipRowConfig) => row.valueKey === calcMeasure.ENTITY_PCT_PLANNED_TIME);
      expect(pctRow).toBeDefined();
      expect(pctRow?.tooltipValueKey).toBe('entityPctPlannedTimeLabel');
      expect(pctRow?.text).toBe('% of planned time');
      expect(pctRow?.icon).toBeDefined();
    });
  });

  describe('filtering', () => {
    it('should filter rows by visibleColumns', () => {
      const params = createMockChartParams({
        cfgType: configType.DOWNTIME,
        visibleColumns: [measure.STOP_DURATION],
      });
      const result = getDowntimeConfig(params);

      // Should only include grouping rows + stop duration row
      const measureRows = result.filter((row: TooltipRowConfig) => row.valueKey);
      expect(measureRows.length).toBe(1);
      expect(measureRows[0]?.valueKey).toBe(measure.STOP_DURATION);
    });

    it('should include multiple rows when multiple columns visible', () => {
      const params = createMockChartParams({
        cfgType: configType.DOWNTIME,
        visibleColumns: [measure.STOP_DURATION, measure.STOP_COUNT],
      });
      const result = getDowntimeConfig(params);

      const durationRow = result.find((row: TooltipRowConfig) => row.valueKey === measure.STOP_DURATION);
      const countRow = result.find((row: TooltipRowConfig) => row.valueKey === measure.STOP_COUNT);

      expect(durationRow).toBeDefined();
      expect(countRow).toBeDefined();
    });

    it('should keep grouping rows regardless of visibleColumns', () => {
      const params = createMockChartParams({
        cfgType: configType.DOWNTIME,
        visibleColumns: [],
      });
      const result = getDowntimeConfig(params);

      // Should have at least grouping rows even with empty visibleColumns
      expect(result.length).toBeGreaterThan(0);
      const hasGroupingRow = result.some((row: TooltipRowConfig) => !row.valueKey);
      expect(hasGroupingRow).toBe(true);
    });

    it('should default visibleColumns to empty array', () => {
      const params = createMockChartParams({
        cfgType: configType.DOWNTIME,
        visibleColumns: undefined,
      });

      // Should not throw error
      expect(() => getDowntimeConfig(params)).not.toThrow();
      const result = getDowntimeConfig(params);
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('icon resolution', () => {
    it('should use createRowWithIcon for measure rows', () => {
      const params = createMockChartParams({
        cfgType: configType.DOWNTIME,
        yAxis: yAxisKey.VALUE,
        visibleColumns: [measure.STOP_DURATION],
      });
      const result = getDowntimeConfig(params);

      const durationRow = result.find((row: TooltipRowConfig) => row.valueKey === measure.STOP_DURATION);
      // Icon should be set (by mock to 'iconYAxis')
      expect(durationRow?.icon).toBeDefined();
    });

    it('should handle dual Y-axes configuration', () => {
      const params = createMockChartParams({
        cfgType: configType.DOWNTIME,
        yAxis: yAxisKey.VALUE,
        yAxisRight: yAxisKey.ENTITY_COUNT,
        visibleColumns: [measure.STOP_DURATION, measure.STOP_COUNT],
      });

      // Should not throw error with dual axes
      expect(() => getDowntimeConfig(params)).not.toThrow();
      const result = getDowntimeConfig(params);
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('edge cases', () => {
    it('should handle empty data fields gracefully', () => {
      const params = createMockChartParams({
        cfgType: configType.DOWNTIME,
        data: {},
        visibleColumns: [measure.STOP_DURATION],
      });

      expect(() => getDowntimeConfig(params)).not.toThrow();
      const result = getDowntimeConfig(params);
      expect(Array.isArray(result)).toBe(true);
    });

    it('should have at least one row even with empty visibleColumns', () => {
      const params = createMockChartParams({
        cfgType: configType.DOWNTIME,
        data: {},
        groupBy: [],
        visibleColumns: [],
      });

      // Should not throw - standard grouping rows adds at least primary value row
      expect(() => getDowntimeConfig(params)).not.toThrow();
      const result = getDowntimeConfig(params);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle all visibleColumns provided', () => {
      const params = createMockChartParams({
        cfgType: configType.DOWNTIME,
        visibleColumns: [
          measure.STOP_DURATION,
          calcMeasure.AVG_DURATION,
          measure.STOP_COUNT,
          measure.NOTES_COUNT,
          calcMeasure.ENTITY_PCT_PLANNED_TIME,
        ],
      });

      const result = getDowntimeConfig(params);
      const measureRows = result.filter((row: TooltipRowConfig) => row.valueKey);

      // Should have all 5 measure rows
      expect(measureRows.length).toBe(5);
    });
  });
});
