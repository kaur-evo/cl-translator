import { describe, expect, it, vi, beforeEach } from 'vitest';

import getScrapReasonConfig from '@/stores/reportsConfig/configurations/chartTooltipConfig/scrapTooltipConfig';
import type { TooltipRowConfig } from '@/stores/reportsConfig/configurations/chartTooltipConfig/types';
import { createMockChartParams } from '@/stores/reportsConfig/configurations/chartTooltipConfig/test-helpers/mockFactory';
import measure from '@/stores/reportsConfig/constants/measure';
import yAxisKey from '@/stores/reportsConfig/constants/yAxisKey';
import calcMeasure from '@/stores/reportsConfig/constants/calcMeasure';
import xAxisKey from '@/stores/reportsConfig/constants/xAxisKey';
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

describe('scrapTooltipConfig', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('structure', () => {
    it('should return array of tooltip rows', () => {
      const params = createMockChartParams({ cfgType: configType.SCRAPREASON });
      const result = getScrapReasonConfig(params);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should include 5 measure rows when all visible', () => {
      const params = createMockChartParams({
        cfgType: configType.SCRAPREASON,
        groupBy: [xAxisKey.STATION_ID], // Not entity - good production will be visible
        visibleColumns: [
          measure.SCRAP_QTY,
          calcMeasure.SCRAP_QTY_PCT,
          measure.GOOD_PRODUCTION,
          measure.SCRAP_DURATION,
          calcMeasure.ENTITY_PCT_PLANNED_TIME,
        ],
      });
      const result = getScrapReasonConfig(params);

      const measureRows = result.filter((row: TooltipRowConfig) => row.valueKey);
      expect(measureRows.length).toBe(5);
    });
  });

  describe('yAxis dependent configuration', () => {
    it('should use scrapQtyFormatted when yAxis is VALUE', () => {
      const params = createMockChartParams({
        cfgType: configType.SCRAPREASON,
        yAxis: yAxisKey.VALUE,
        visibleColumns: [measure.SCRAP_QTY],
      });
      const result = getScrapReasonConfig(params);

      const scrapRow = result.find((row: TooltipRowConfig) => row.valueKey === measure.SCRAP_QTY);
      expect(scrapRow?.tooltipValueKey).toBe('scrapQtyFormatted');
    });

    it('should use scrapAltQtyFormatted when yAxis is ENTITY_ALT_COUNT', () => {
      const params = createMockChartParams({
        cfgType: configType.SCRAPREASON,
        yAxis: yAxisKey.ENTITY_ALT_COUNT,
        visibleColumns: [measure.SCRAP_QTY],
      });
      const result = getScrapReasonConfig(params);

      const scrapRow = result.find((row: TooltipRowConfig) => row.valueKey === measure.SCRAP_QTY);
      expect(scrapRow?.tooltipValueKey).toBe('scrapAltQtyFormatted');
    });

    it('should use scrapQtyPctFormatted when yAxis is VALUE', () => {
      const params = createMockChartParams({
        cfgType: configType.SCRAPREASON,
        yAxis: yAxisKey.VALUE,
        visibleColumns: [calcMeasure.SCRAP_QTY_PCT],
      });
      const result = getScrapReasonConfig(params);

      const pctRow = result.find((row: TooltipRowConfig) => row.valueKey === calcMeasure.SCRAP_QTY_PCT);
      expect(pctRow?.tooltipValueKey).toBe('scrapQtyPctFormatted');
    });

    it('should use scrapAltQtyPctFormatted when yAxis is ENTITY_ALT_COUNT', () => {
      const params = createMockChartParams({
        cfgType: configType.SCRAPREASON,
        yAxis: yAxisKey.ENTITY_ALT_COUNT,
        visibleColumns: [calcMeasure.SCRAP_QTY_PCT],
      });
      const result = getScrapReasonConfig(params);

      const pctRow = result.find((row: TooltipRowConfig) => row.valueKey === calcMeasure.SCRAP_QTY_PCT);
      expect(pctRow?.tooltipValueKey).toBe('scrapAltQtyPctFormatted');
    });
  });

  describe('conditional visibility - good production', () => {
    it('should hide good production when groupBy is ENTITY_ID', () => {
      const params = createMockChartParams({
        cfgType: configType.SCRAPREASON,
        groupBy: [xAxisKey.ENTITY_ID],
        visibleColumns: [measure.GOOD_PRODUCTION],
      });
      const result = getScrapReasonConfig(params);

      const goodProdRow = result.find((row: TooltipRowConfig) => row.valueKey === measure.GOOD_PRODUCTION);
      // Should be filtered out by filterHidden()
      expect(goodProdRow).toBeUndefined();
    });

    it('should hide good production when groupBy is ENTITY_GROUP_ID', () => {
      const params = createMockChartParams({
        cfgType: configType.SCRAPREASON,
        groupBy: [xAxisKey.ENTITY_GROUP_ID],
        visibleColumns: [measure.GOOD_PRODUCTION],
      });
      const result = getScrapReasonConfig(params);

      const goodProdRow = result.find((row: TooltipRowConfig) => row.valueKey === measure.GOOD_PRODUCTION);
      expect(goodProdRow).toBeUndefined();
    });

    it('should show good production when groupBy is not ENTITY_ID or ENTITY_GROUP_ID', () => {
      const params = createMockChartParams({
        cfgType: configType.SCRAPREASON,
        groupBy: [xAxisKey.STATION_ID],
        visibleColumns: [measure.GOOD_PRODUCTION],
      });
      const result = getScrapReasonConfig(params);

      const goodProdRow = result.find((row: TooltipRowConfig) => row.valueKey === measure.GOOD_PRODUCTION);
      expect(goodProdRow).toBeDefined();
      expect(goodProdRow?.tooltipValueKey).toBe('goodProductionFormatted');
    });
  });

  describe('row configuration', () => {
    it('should configure scrap row correctly', () => {
      const params = createMockChartParams({
        cfgType: configType.SCRAPREASON,
        visibleColumns: [measure.SCRAP_QTY],
      });
      const result = getScrapReasonConfig(params);

      const scrapRow = result.find((row: TooltipRowConfig) => row.valueKey === measure.SCRAP_QTY);
      expect(scrapRow).toBeDefined();
      expect(scrapRow?.tooltipValueKey).toBe('scrapQtyFormatted');
      expect(scrapRow?.text).toBe('Scrap');
    });

    it('should configure scrap duration row correctly', () => {
      const params = createMockChartParams({
        cfgType: configType.SCRAPREASON,
        visibleColumns: [measure.SCRAP_DURATION],
      });
      const result = getScrapReasonConfig(params);

      const durationRow = result.find((row: TooltipRowConfig) => row.valueKey === measure.SCRAP_DURATION);
      expect(durationRow).toBeDefined();
      expect(durationRow?.tooltipValueKey).toBe('scrapDurationFormatted');
      expect(durationRow?.text).toBe('Time lost');
    });

    it('should configure entity % planned time row correctly', () => {
      const params = createMockChartParams({
        cfgType: configType.SCRAPREASON,
        visibleColumns: [calcMeasure.ENTITY_PCT_PLANNED_TIME],
      });
      const result = getScrapReasonConfig(params);

      const pctRow = result.find((row: TooltipRowConfig) => row.valueKey === calcMeasure.ENTITY_PCT_PLANNED_TIME);
      expect(pctRow).toBeDefined();
      expect(pctRow?.tooltipValueKey).toBe('entityPctPlannedTimeLabel');
    });
  });

  describe('icon resolution', () => {
    it('should use createRowWithIcon for scrap row', () => {
      const params = createMockChartParams({
        cfgType: configType.SCRAPREASON,
        yAxis: yAxisKey.VALUE,
        visibleColumns: [measure.SCRAP_QTY],
      });
      const result = getScrapReasonConfig(params);

      const scrapRow = result.find((row: TooltipRowConfig) => row.valueKey === measure.SCRAP_QTY);
      expect(scrapRow?.icon).toBeDefined();
    });

    it('should use createRowWithIcon for scrap qty pct row', () => {
      const params = createMockChartParams({
        cfgType: configType.SCRAPREASON,
        yAxis: yAxisKey.VALUE,
        visibleColumns: [calcMeasure.SCRAP_QTY_PCT],
      });
      const result = getScrapReasonConfig(params);

      const pctRow = result.find((row: TooltipRowConfig) => row.valueKey === calcMeasure.SCRAP_QTY_PCT);
      expect(pctRow?.icon).toBeDefined();
    });

    it('should use createRowWithIcon for entity pct planned time row', () => {
      const params = createMockChartParams({
        cfgType: configType.SCRAPREASON,
        yAxis: yAxisKey.VALUE,
        visibleColumns: [calcMeasure.ENTITY_PCT_PLANNED_TIME],
      });
      const result = getScrapReasonConfig(params);

      const pctRow = result.find((row: TooltipRowConfig) => row.valueKey === calcMeasure.ENTITY_PCT_PLANNED_TIME);
      expect(pctRow?.icon).toBeDefined();
    });

    it('should handle dual Y-axes configuration', () => {
      const params = createMockChartParams({
        cfgType: configType.SCRAPREASON,
        yAxis: yAxisKey.VALUE,
        yAxisRight: yAxisKey.ENTITY_COUNT,
        visibleColumns: [measure.SCRAP_QTY, calcMeasure.SCRAP_QTY_PCT],
      });

      expect(() => getScrapReasonConfig(params)).not.toThrow();
      const result = getScrapReasonConfig(params);
      expect(result.length).toBeGreaterThan(0);
    });
  });
});
