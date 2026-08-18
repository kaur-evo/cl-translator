import { describe, expect, it, vi, beforeEach } from 'vitest';

import {
  isHighestLevel,
  buildSubGroupTooltipConfig,
  groupByMap,
  getTooltipConfigByGroupBy,
} from './groupingHelpers';

import type { ChartDataPoint, LabelTextConfig } from '@/stores/reportsConfig/configurations/chartTooltipConfig/types';
import { createMockChartDataPoint } from '@/stores/reportsConfig/configurations/chartTooltipConfig/test-helpers/mockFactory';
import { resolveIcon } from '@/helpers/tooltips/IconResolver';
import xAxisKey from '@/stores/reportsConfig/constants/xAxisKey';
import granularityType from '@/stores/reportsConfig/constants/granularity';
import configType from '@/stores/reportsConfig/constants/configType';


// Mock IconResolver
vi.mock('@/helpers/tooltips/IconResolver', () => ({
  resolveIcon: vi.fn(() => 'iconYAxis'),
}));

describe('groupingHelpers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('isHighestLevel', () => {
    it('should return true when data has no groups property', () => {
      const data: ChartDataPoint = { entityName: 'Test' };
      expect(isHighestLevel(data)).toBe(true);
    });

    it('should return true when groups is undefined', () => {
      const data: ChartDataPoint = { entityName: 'Test', groups: undefined };
      expect(isHighestLevel(data)).toBe(true);
    });

    it('should return false when data has groups property with array', () => {
      const data: ChartDataPoint = {
        entityName: 'Test',
        groups: [{ entityName: 'Child' }],
      };
      expect(isHighestLevel(data)).toBe(false);
    });

    it('should return false when groups is empty array', () => {
      const data: ChartDataPoint = { entityName: 'Test', groups: [] };
      expect(isHighestLevel(data)).toBe(false);
    });
  });

  describe('buildSubGroupTooltipConfig', () => {
    const mockData = createMockChartDataPoint();

    it('should return a function', () => {
      const fn = buildSubGroupTooltipConfig('entity', 'entityName');
      expect(typeof fn).toBe('function');
    });

    it('should generate config with correct text when labelText is string', () => {
      const fn = buildSubGroupTooltipConfig('entity', 'entityName');
      const config = fn([xAxisKey.ENTITY_ID], 0, mockData, 'Entity Label', configType.DOWNTIME);

      expect(config.text).toBe('Entity Label');
    });

    it('should set tooltipValueKey only when index > 0', () => {
      const fn = buildSubGroupTooltipConfig('entity', 'entityName');

      const config0 = fn([xAxisKey.ENTITY_ID], 0, mockData, 'Label', configType.DOWNTIME);
      expect(config0.tooltipValueKey).toBeUndefined();

      const config1 = fn([xAxisKey.ENTITY_ID, xAxisKey.PRODUCT_ID], 1, mockData, 'Label', configType.DOWNTIME);
      expect(config1.tooltipValueKey).toBe('entityName');
    });

    it('should call resolveIcon with correct parameters', () => {
      const fn = buildSubGroupTooltipConfig('entity', 'entityName');
      const groupBy = [xAxisKey.ENTITY_ID, xAxisKey.PRODUCT_ID];
      const index = 1;

      fn(groupBy, index, mockData, 'Label', configType.DOWNTIME);

      expect(resolveIcon).toHaveBeenCalledWith({
        key: 'entity',
        groupBy,
        index,
      });
    });

    it('should use icon from IconResolver', () => {
      vi.mocked(resolveIcon).mockReturnValue('iconXAxis');
      const fn = buildSubGroupTooltipConfig('entity', 'entityName');

      const config = fn([xAxisKey.ENTITY_ID], 0, mockData, 'Label', configType.DOWNTIME);

      expect(config.icon).toBe('iconXAxis');
    });

    it('should use data.color as default color', () => {
      const testData = createMockChartDataPoint({ color: '#00FF00' });
      const fn = buildSubGroupTooltipConfig('entity', 'entityName');

      const config = fn([xAxisKey.ENTITY_ID], 0, testData, 'Label', configType.DOWNTIME);

      expect(config.color).toBe('#00FF00');
    });

    describe('complex labelText handling', () => {
      it('should extract text from labelText object', () => {
        const fn = buildSubGroupTooltipConfig('entity', 'entityName');
        const labelText: LabelTextConfig = {
          text: 'Complex Label',
          icon: 'iconDot',
          color: '#FF0000',
        };

        const config = fn([xAxisKey.ENTITY_ID], 0, mockData, labelText, configType.DOWNTIME);

        expect(config.text).toBe('Complex Label');
      });

      it('should use icon from labelText when provided', () => {
        const fn = buildSubGroupTooltipConfig('entity', 'entityName');
        const labelText: LabelTextConfig = {
          text: 'Label',
          icon: 'iconDot',
        };

        const config = fn([xAxisKey.ENTITY_ID], 0, mockData, labelText, configType.DOWNTIME);

        expect(config.icon).toBe('iconDot');
      });

      it('should use iconColor from labelText when provided', () => {
        const fn = buildSubGroupTooltipConfig('entity', 'entityName');
        const labelText: LabelTextConfig = {
          text: 'Label',
          color: '#FF0000',
        };

        const config = fn([xAxisKey.ENTITY_ID], 0, mockData, labelText, configType.DOWNTIME);

        expect(config.color).toBe('#FF0000');
      });

      it('should handle dynamic text function', () => {
        const fn = buildSubGroupTooltipConfig('entity', 'entityName');
        const textFn = (data: ChartDataPoint) => `Name: ${data.entityName}`;
        const labelText: LabelTextConfig = {
          text: textFn,
        };

        const config = fn([xAxisKey.ENTITY_ID], 0, mockData, labelText, configType.DOWNTIME);

        expect(config.text).toBe(textFn);
      });

      it('should handle dynamic iconColor function', () => {
        const fn = buildSubGroupTooltipConfig('entity', 'entityName');
        const colorFn = (data: ChartDataPoint) => data.color as string;
        const labelText: LabelTextConfig = {
          text: 'Label',
          color: colorFn,
        };

        const config = fn([xAxisKey.ENTITY_ID], 0, mockData, labelText, configType.DOWNTIME);

        expect(config.color).toBe(colorFn);
      });
    });

    describe('CHECKLIST special case', () => {
      it('should use checklistGroupName for entityGroupName in CHECKLIST charts', () => {
        const fn = buildSubGroupTooltipConfig(xAxisKey.ENTITY_GROUP_ID, 'entityGroupName');
        const config = fn([xAxisKey.ENTITY_GROUP_ID], 1, mockData, 'Label', configType.CHECKLIST);

        expect(config.tooltipValueKey).toBe('checklistGroupName');
      });

      it('should not change valueKey for non-CHECKLIST charts', () => {
        const fn = buildSubGroupTooltipConfig(xAxisKey.ENTITY_GROUP_ID, 'entityGroupName');
        const config = fn([xAxisKey.ENTITY_GROUP_ID], 1, mockData, 'Label', configType.DOWNTIME);

        expect(config.tooltipValueKey).toBe('entityGroupName');
      });

      it('should not change non-entityGroupName valueKeys in CHECKLIST charts', () => {
        const fn = buildSubGroupTooltipConfig(xAxisKey.ENTITY_ID, 'entityName');
        const config = fn([xAxisKey.ENTITY_ID], 1, mockData, 'Label', configType.CHECKLIST);

        expect(config.tooltipValueKey).toBe('entityName');
      });
    });
  });

  describe('groupByMap', () => {
    it('should contain entries for all xAxisKey values', () => {
      expect(groupByMap.has(xAxisKey.ENTITY_ID)).toBe(true);
      expect(groupByMap.has(xAxisKey.ENTITY_GROUP_ID)).toBe(true);
      expect(groupByMap.has(xAxisKey.POSITION_ID)).toBe(true);
      expect(groupByMap.has(xAxisKey.STATION_ID)).toBe(true);
      expect(groupByMap.has(xAxisKey.STATION_GROUP_ID)).toBe(true);
      expect(groupByMap.has(xAxisKey.FACTORY_ID)).toBe(true);
      expect(groupByMap.has(xAxisKey.SINGLE_OPERATOR)).toBe(true);
      expect(groupByMap.has(xAxisKey.SHIFT_TEMPLATE)).toBe(true);
      expect(groupByMap.has(xAxisKey.PRODUCT_ID)).toBe(true);
      expect(groupByMap.has(xAxisKey.PRODUCT_GROUP_ID)).toBe(true);
      expect(groupByMap.has(xAxisKey.SKU)).toBe(true);
      expect(groupByMap.has(xAxisKey.LOT_CODE)).toBe(true);
      expect(groupByMap.has(xAxisKey.PRODUCTION_ORDER)).toBe(true);
    });

    it('should contain entries for all granularity types', () => {
      expect(groupByMap.has(granularityType.DATE)).toBe(true);
      expect(groupByMap.has(granularityType.DAYOFWEEK)).toBe(true);
      expect(groupByMap.has(granularityType.WEEKOFYEAR)).toBe(true);
      expect(groupByMap.has(granularityType.QUARTER)).toBe(true);
      expect(groupByMap.has(granularityType.STARTTIME)).toBe(true);
      expect(groupByMap.has(granularityType.MONTH)).toBe(true);
      expect(groupByMap.has(granularityType.YEAR)).toBe(true);
    });

    it('should map all entries to functions', () => {
      groupByMap.forEach((value) => {
        expect(typeof value).toBe('function');
      });
    });

    it('should have consistent Map size', () => {
      // 13 xAxisKey + 7 granularityType = 20 total entries
      expect(groupByMap.size).toBe(20);
    });
  });

  describe('getTooltipConfigByGroupBy', () => {
    it('should return function for valid entity key', () => {
      const fn = getTooltipConfigByGroupBy(xAxisKey.ENTITY_ID);
      expect(typeof fn).toBe('function');
    });

    it('should return function for valid granularity key', () => {
      const fn = getTooltipConfigByGroupBy(granularityType.DATE);
      expect(typeof fn).toBe('function');
    });

    it('should return undefined for unknown key', () => {
      const fn = getTooltipConfigByGroupBy('unknown_key');
      expect(fn).toBeUndefined();
    });

    it('should return same function as groupByMap.get', () => {
      const key = xAxisKey.ENTITY_ID;
      expect(getTooltipConfigByGroupBy(key)).toBe(groupByMap.get(key));
    });

    it('should work for all valid keys', () => {
      const validKeys = [
        xAxisKey.ENTITY_ID,
        xAxisKey.STATION_ID,
        xAxisKey.PRODUCT_ID,
        granularityType.DATE,
        granularityType.MONTH,
      ];

      validKeys.forEach((key) => {
        const fn = getTooltipConfigByGroupBy(key);
        expect(fn).toBeDefined();
        expect(typeof fn).toBe('function');
      });
    });
  });
});
