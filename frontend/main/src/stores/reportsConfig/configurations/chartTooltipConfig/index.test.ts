import { describe, expect, it, vi, beforeEach } from 'vitest';

import getTooltipConfig from '@/stores/reportsConfig/configurations/chartTooltipConfig/index';
// eslint-disable-next-line import/order
import { createMockChartParams } from '@/stores/reportsConfig/configurations/chartTooltipConfig/test-helpers/mockFactory';

// Mock all chart-specific config functions
vi.mock('@/stores/reportsConfig/configurations/chartTooltipConfig/downtimeTooltipConfig', () => ({
  default: vi.fn(() => [{ text: 'Downtime Mock', valueKey: 'duration' }]),
}));

vi.mock('@/stores/reportsConfig/configurations/chartTooltipConfig/speedlossTooltipConfig', () => ({
  default: vi.fn(() => [{ text: 'Speedloss Mock', valueKey: 'duration' }]),
}));

vi.mock('@/stores/reportsConfig/configurations/chartTooltipConfig/scrapTooltipConfig', () => ({
  default: vi.fn(() => [{ text: 'Scrap Mock', valueKey: 'count' }]),
}));

vi.mock('@/stores/reportsConfig/configurations/chartTooltipConfig/OEETooltipConfig', () => ({
  default: vi.fn(() => [{ text: 'OEE Mock', valueKey: 'oee' }]),
}));

vi.mock('@/stores/reportsConfig/configurations/chartTooltipConfig/quantityTooltipConfig', () => ({
  default: vi.fn(() => [{ text: 'Quantity Mock', valueKey: 'quantity' }]),
}));

vi.mock('@/stores/reportsConfig/configurations/chartTooltipConfig/timeUsageTooltipConfig', () => ({
  default: vi.fn(() => [{ text: 'Time Usage Mock', valueKey: 'time' }]),
}));

vi.mock('@/stores/reportsConfig/configurations/chartTooltipConfig/checklistTooltipConfig', () => ({
  default: vi.fn(() => [{ text: 'Checklist Mock', valueKey: 'count' }]),
}));

vi.mock('@/stores/reportsConfig/configurations/chartTooltipConfig/productionSpeedTooltipConfig', () => ({
  default: vi.fn(() => [{ text: 'Production Speed Mock', valueKey: 'speed' }]),
}));

// Import mocked functions to spy on them
import getDowntimeConfig from '@/stores/reportsConfig/configurations/chartTooltipConfig/downtimeTooltipConfig';
import getSpeedlossConfig from '@/stores/reportsConfig/configurations/chartTooltipConfig/speedlossTooltipConfig';
import getScrapReasonConfig from '@/stores/reportsConfig/configurations/chartTooltipConfig/scrapTooltipConfig';
import getOEEConfig from '@/stores/reportsConfig/configurations/chartTooltipConfig/OEETooltipConfig';
import getQuantityConfig from '@/stores/reportsConfig/configurations/chartTooltipConfig/quantityTooltipConfig';
import getTimeUsageConfig from '@/stores/reportsConfig/configurations/chartTooltipConfig/timeUsageTooltipConfig';
import getChecklistConfig from '@/stores/reportsConfig/configurations/chartTooltipConfig/checklistTooltipConfig';
import getProductionSpeedConfig from '@/stores/reportsConfig/configurations/chartTooltipConfig/productionSpeedTooltipConfig';
import configType from '@/stores/reportsConfig/constants/configType';

describe('getTooltipConfig (index router)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('routing to chart-specific configs', () => {
    it('should route DOWNTIME to getDowntimeConfig', () => {
      const params = createMockChartParams({ cfgType: configType.DOWNTIME });
      const result = getTooltipConfig(params);

      expect(getDowntimeConfig).toHaveBeenCalledOnce();
      expect(result).toEqual([{ text: 'Downtime Mock', valueKey: 'duration' }]);
    });

    it('should route SPEEDLOSS to getSpeedlossConfig', () => {
      const params = createMockChartParams({ cfgType: configType.SPEEDLOSS });
      const result = getTooltipConfig(params);

      expect(getSpeedlossConfig).toHaveBeenCalledOnce();
      expect(result).toEqual([{ text: 'Speedloss Mock', valueKey: 'duration' }]);
    });

    it('should route SCRAPREASON to getScrapReasonConfig', () => {
      const params = createMockChartParams({ cfgType: configType.SCRAPREASON });
      const result = getTooltipConfig(params);

      expect(getScrapReasonConfig).toHaveBeenCalledOnce();
      expect(result).toEqual([{ text: 'Scrap Mock', valueKey: 'count' }]);
    });

    it('should route OEE to getOEEConfig', () => {
      const params = createMockChartParams({ cfgType: configType.OEE });
      const result = getTooltipConfig(params);

      expect(getOEEConfig).toHaveBeenCalledOnce();
      expect(result).toEqual([{ text: 'OEE Mock', valueKey: 'oee' }]);
    });

    it('should route QUANTITY to getQuantityConfig', () => {
      const params = createMockChartParams({ cfgType: configType.QUANTITY });
      const result = getTooltipConfig(params);

      expect(getQuantityConfig).toHaveBeenCalledOnce();
      expect(result).toEqual([{ text: 'Quantity Mock', valueKey: 'quantity' }]);
    });

    it('should route TIME_USAGE to getTimeUsageConfig', () => {
      const params = createMockChartParams({ cfgType: configType.TIME_USAGE });
      const result = getTooltipConfig(params);

      expect(getTimeUsageConfig).toHaveBeenCalledOnce();
      expect(result).toEqual([{ text: 'Time Usage Mock', valueKey: 'time' }]);
    });

    it('should route CHECKLIST to getChecklistConfig', () => {
      const params = createMockChartParams({ cfgType: configType.CHECKLIST });
      const result = getTooltipConfig(params);

      expect(getChecklistConfig).toHaveBeenCalledOnce();
      expect(result).toEqual([{ text: 'Checklist Mock', valueKey: 'count' }]);
    });

    it('should route PRODUCTION_SPEED to getProductionSpeedConfig', () => {
      const params = createMockChartParams({ cfgType: configType.PRODUCTION_SPEED });
      const result = getTooltipConfig(params);

      expect(getProductionSpeedConfig).toHaveBeenCalledOnce();
      expect(result).toEqual([{ text: 'Production Speed Mock', valueKey: 'speed' }]);
    });
  });

  describe('parameter passing', () => {
    it('should pass all parameters to chart config function', () => {
      const params = createMockChartParams({
        cfgType: configType.DOWNTIME,
      });

      getTooltipConfig(params);

      expect(getDowntimeConfig).toHaveBeenCalledWith({
        data: params.data,
        groupBy: params.groupBy,
        cfgType: params.cfgType,
        granularity: params.granularity,
        yAxis: params.yAxis,
        yAxisRight: params.yAxisRight,
        chartLegendState: params.chartLegendState,
        totals: params.totals,
        visibleColumns: params.visibleColumns,
      });
    });

    it('should default visibleColumns to empty array when undefined', () => {
      const params = createMockChartParams({
        cfgType: configType.DOWNTIME,
        visibleColumns: undefined,
      });

      getTooltipConfig(params);

      expect(getDowntimeConfig).toHaveBeenCalledWith(
        expect.objectContaining({
          visibleColumns: [],
        }),
      );
    });

    it('should default visibleColumns to empty array when null', () => {
      const params = createMockChartParams({
        cfgType: configType.DOWNTIME,
        visibleColumns: null as unknown as string[],
      });

      getTooltipConfig(params);

      expect(getDowntimeConfig).toHaveBeenCalledWith(
        expect.objectContaining({
          visibleColumns: [],
        }),
      );
    });

    it('should preserve provided visibleColumns array', () => {
      const visibleColumns = ['duration', 'count'];
      const params = createMockChartParams({
        cfgType: configType.DOWNTIME,
        visibleColumns,
      });

      getTooltipConfig(params);

      expect(getDowntimeConfig).toHaveBeenCalledWith(
        expect.objectContaining({
          visibleColumns,
        }),
      );
    });
  });

  describe('error handling', () => {
    it('should throw error for unknown cfgType', () => {
      const params = createMockChartParams({
        cfgType: 'UNKNOWN_TYPE' as typeof configType.DOWNTIME,
      });

      expect(() => getTooltipConfig(params)).toThrow(
        'No configuration found for cfgType: UNKNOWN_TYPE',
      );
    });

    it('should throw error for null cfgType', () => {
      const params = createMockChartParams({
        cfgType: null as unknown as typeof configType.DOWNTIME,
      });

      expect(() => getTooltipConfig(params)).toThrow(
        'No configuration found for cfgType: null',
      );
    });

    it('should throw error for undefined cfgType', () => {
      const params = createMockChartParams({
        cfgType: undefined as unknown as typeof configType.DOWNTIME,
      });

      expect(() => getTooltipConfig(params)).toThrow(
        'No configuration found for cfgType: undefined',
      );
    });
  });

  describe('return value', () => {
    it('should return array of TooltipRowConfig', () => {
      const params = createMockChartParams({ cfgType: configType.DOWNTIME });
      const result = getTooltipConfig(params);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('text');
    });

    it('should return different configs for different chart types', () => {
      const downtimeParams = createMockChartParams({ cfgType: configType.DOWNTIME });
      const oeeParams = createMockChartParams({ cfgType: configType.OEE });

      const downtimeResult = getTooltipConfig(downtimeParams);
      const oeeResult = getTooltipConfig(oeeParams);

      expect(downtimeResult).not.toEqual(oeeResult);
      expect(downtimeResult[0]?.text).toBe('Downtime Mock');
      expect(oeeResult[0]?.text).toBe('OEE Mock');
    });
  });

  describe('integration', () => {
    it('should work with all chart types without errors', () => {
      const chartTypes = [
        configType.DOWNTIME,
        configType.SPEEDLOSS,
        configType.SCRAPREASON,
        configType.OEE,
        configType.QUANTITY,
        configType.TIME_USAGE,
        configType.CHECKLIST,
        configType.PRODUCTION_SPEED,
      ];

      chartTypes.forEach((cfgType) => {
        const params = createMockChartParams({ cfgType });
        expect(() => getTooltipConfig(params)).not.toThrow();

        const result = getTooltipConfig(params);
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBeGreaterThan(0);
      });
    });
  });
});
