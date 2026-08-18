import { describe, expect, it, vi, beforeEach } from 'vitest';

import getChecklistConfig from '@/stores/reportsConfig/configurations/chartTooltipConfig/checklistTooltipConfig';
import type { TooltipRowConfig } from '@/stores/reportsConfig/configurations/chartTooltipConfig/types';
import { createMockChartParams, createMockChartDataPoint } from '@/stores/reportsConfig/configurations/chartTooltipConfig/test-helpers/mockFactory';
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

describe('checklistTooltipConfig', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('structure', () => {
    it('should return array of tooltip rows', () => {
      const params = createMockChartParams({
        cfgType: configType.CHECKLIST,
        data: createMockChartDataPoint({ '%groupId': 'checklistSuccessful' }),
        chartLegendState: ['checklistSuccessful'],
      });
      const result = getChecklistConfig(params);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('yAxis dependent visibility', () => {
    it('should hide count rows when yAxis is AVG_TIME_VAL', () => {
      const params = createMockChartParams({
        cfgType: configType.CHECKLIST,
        yAxis: yAxisKey.AVG_TIME_VAL,
        data: { groups: [] },
        chartLegendState: ['missed', 'unsuccessful', 'successful'],
        visibleColumns: [
          measure.CHECKLIST_MISSED_COUNT,
          measure.CHECKLIST_UNSUCCESSFUL_COUNT,
          measure.CHECKLIST_SUCCESSFUL_COUNT,
        ],
      });
      const result = getChecklistConfig(params);

      const missedRow = result.find((row: TooltipRowConfig) => row.valueKey === measure.CHECKLIST_MISSED_COUNT);
      const unsuccessfulRow = result.find((row: TooltipRowConfig) => row.valueKey === measure.CHECKLIST_UNSUCCESSFUL_COUNT);
      const successfulRow = result.find((row: TooltipRowConfig) => row.valueKey === measure.CHECKLIST_SUCCESSFUL_COUNT);

      // Should be filtered out
      expect(missedRow).toBeUndefined();
      expect(unsuccessfulRow).toBeUndefined();
      expect(successfulRow).toBeUndefined();
    });

    it('should show count rows when yAxis is not AVG_TIME_VAL', () => {
      const params = createMockChartParams({
        cfgType: configType.CHECKLIST,
        yAxis: yAxisKey.VALUE,
        data: { groups: [] },
        chartLegendState: ['checklistMissed', 'checklistUnsuccessful', 'checklistSuccessful'],
        visibleColumns: [
          measure.CHECKLIST_MISSED_COUNT,
          measure.CHECKLIST_UNSUCCESSFUL_COUNT,
          measure.CHECKLIST_SUCCESSFUL_COUNT,
        ],
      });
      const result = getChecklistConfig(params);

      const missedRow = result.find((row: TooltipRowConfig) => row.valueKey === measure.CHECKLIST_MISSED_COUNT);
      const unsuccessfulRow = result.find((row: TooltipRowConfig) => row.valueKey === measure.CHECKLIST_UNSUCCESSFUL_COUNT);
      const successfulRow = result.find((row: TooltipRowConfig) => row.valueKey === measure.CHECKLIST_SUCCESSFUL_COUNT);

      expect(missedRow).toBeDefined();
      expect(unsuccessfulRow).toBeDefined();
      expect(successfulRow).toBeDefined();
    });
  });

  describe('isHighestLevel conditional hiding', () => {
    it('should hide count rows when at highest level', () => {
      const params = createMockChartParams({
        cfgType: configType.CHECKLIST,
        yAxis: yAxisKey.VALUE,
        data: createMockChartDataPoint({ '%groupId': 'checklistSuccessful' }), // No groups property = highest level
        chartLegendState: ['checklistMissed', 'checklistUnsuccessful', 'checklistSuccessful'],
        visibleColumns: [
          measure.CHECKLIST_MISSED_COUNT,
          measure.CHECKLIST_UNSUCCESSFUL_COUNT,
          measure.CHECKLIST_SUCCESSFUL_COUNT,
        ],
      });
      const result = getChecklistConfig(params);

      const missedRow = result.find((row: TooltipRowConfig) => row.valueKey === measure.CHECKLIST_MISSED_COUNT);
      const unsuccessfulRow = result.find((row: TooltipRowConfig) => row.valueKey === measure.CHECKLIST_UNSUCCESSFUL_COUNT);
      const successfulRow = result.find((row: TooltipRowConfig) => row.valueKey === measure.CHECKLIST_SUCCESSFUL_COUNT);

      expect(missedRow).toBeUndefined();
      expect(unsuccessfulRow).toBeUndefined();
      expect(successfulRow).toBeUndefined();
    });
  });

  describe('row configuration', () => {
    it('should configure total count row correctly', () => {
      const params = createMockChartParams({
        cfgType: configType.CHECKLIST,
        data: createMockChartDataPoint({ '%groupId': 'checklistSuccessful' }),
        visibleColumns: [measure.CHECKLIST_TOTAL_COUNT],
      });
      const result = getChecklistConfig(params);

      const totalRow = result.find((row: TooltipRowConfig) => row.valueKey === measure.CHECKLIST_TOTAL_COUNT);
      expect(totalRow).toBeDefined();
    });

    it('should configure avg time row correctly', () => {
      const params = createMockChartParams({
        cfgType: configType.CHECKLIST,
        data: createMockChartDataPoint({ '%groupId': 'checklistSuccessful' }),
        visibleColumns: [calcMeasure.AVG_TIME],
      });
      const result = getChecklistConfig(params);

      const avgRow = result.find((row: TooltipRowConfig) => row.valueKey === calcMeasure.AVG_TIME);
      expect(avgRow).toBeDefined();
    });

    it('should configure median time row correctly', () => {
      const params = createMockChartParams({
        cfgType: configType.CHECKLIST,
        data: createMockChartDataPoint({ '%groupId': 'checklistSuccessful' }),
        visibleColumns: [measure.MEDIAN_CHECK_DURATION],
      });
      const result = getChecklistConfig(params);

      const medianRow = result.find((row: TooltipRowConfig) => row.valueKey === measure.MEDIAN_CHECK_DURATION);
      expect(medianRow).toBeDefined();
    });

    it('should configure notes count row correctly', () => {
      const params = createMockChartParams({
        cfgType: configType.CHECKLIST,
        data: createMockChartDataPoint({ '%groupId': 'checklistSuccessful' }),
        visibleColumns: [measure.NOTES_COUNT],
      });
      const result = getChecklistConfig(params);

      const notesRow = result.find((row: TooltipRowConfig) => row.valueKey === measure.NOTES_COUNT);
      expect(notesRow).toBeDefined();
    });
  });

  describe('chart legend state integration', () => {
    it('should handle empty chartLegendState', () => {
      const params = createMockChartParams({
        cfgType: configType.CHECKLIST,
        data: createMockChartDataPoint({ '%groupId': 'checklistSuccessful' }),
        chartLegendState: [],
        visibleColumns: [measure.CHECKLIST_SUCCESSFUL_COUNT],
      });

      expect(() => getChecklistConfig(params)).not.toThrow();
    });
  });
});
