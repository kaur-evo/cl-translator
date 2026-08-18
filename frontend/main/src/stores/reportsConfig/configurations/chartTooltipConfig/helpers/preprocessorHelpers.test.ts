import { describe, expect, it, vi, beforeEach } from 'vitest';

import {
  preProcessedCharts,
  tooltipValueConfigMap,
  tooltipLabelConfigMap,
  getTooltipPrimaryValueConfig,
  getAlternativePrimaryLabelConfig,
} from './preprocessorHelpers';

import type { ChartDataPoint } from '@/stores/reportsConfig/configurations/chartTooltipConfig/types';
import configType from '@/stores/reportsConfig/constants/configType';
import specialKey from '@/stores/reportsConfig/constants/specialKey';
import preprocessorGroupType from '@/stores/reportsConfig/constants/preprocessorGroupType';
import { getOEELabelConfig, getOEEValueConfig } from '@/stores/reportsConfig/configurations/chartTooltipConfig/OEETooltipBaseConfig';
import { getQuantityLabelConfig, getQuantityValueConfig } from '@/stores/reportsConfig/configurations/chartTooltipConfig/quantityTooltipBaseConfig';
import { getTimeUsageLabelConfig, getTimeUsageValueConfig } from '@/stores/reportsConfig/configurations/chartTooltipConfig/timeUsageTooltipBaseConfig';
import { getChecklistLabelConfig, getChecklistValueConfig } from '@/stores/reportsConfig/configurations/chartTooltipConfig/checklistTooltipBaseConfig';

describe('preprocessorHelpers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('preProcessedCharts', () => {
    it('should contain OEE config type', () => {
      expect(preProcessedCharts.has(configType.OEE)).toBe(true);
    });

    it('should contain QUANTITY config type', () => {
      expect(preProcessedCharts.has(configType.QUANTITY)).toBe(true);
    });

    it('should contain TIME_USAGE config type', () => {
      expect(preProcessedCharts.has(configType.TIME_USAGE)).toBe(true);
    });

    it('should contain CHECKLIST config type', () => {
      expect(preProcessedCharts.has(configType.CHECKLIST)).toBe(true);
    });

    it('should not contain other config types', () => {
      expect(preProcessedCharts.has('NON_EXISTENT_TYPE')).toBe(false);
      expect(preProcessedCharts.has(configType.DOWNTIME)).toBe(false);
      expect(preProcessedCharts.has(configType.SPEEDLOSS)).toBe(false);
    });

    it('should have exactly 4 preprocessed chart types', () => {
      expect(preProcessedCharts.size).toBe(4);
    });
  });

  describe('tooltipValueConfigMap', () => {
    it('should return getOEEValueConfig for OEE config type', () => {
      const configFn = tooltipValueConfigMap.get(configType.OEE);
      expect(configFn).toBe(getOEEValueConfig);
    });

    it('should return getQuantityValueConfig for QUANTITY config type', () => {
      const configFn = tooltipValueConfigMap.get(configType.QUANTITY);
      expect(configFn).toBe(getQuantityValueConfig);
    });

    it('should return getTimeUsageValueConfig for TIME_USAGE config type', () => {
      const configFn = tooltipValueConfigMap.get(configType.TIME_USAGE);
      expect(configFn).toBe(getTimeUsageValueConfig);
    });

    it('should return getChecklistValueConfig for CHECKLIST config type', () => {
      const configFn = tooltipValueConfigMap.get(configType.CHECKLIST);
      expect(configFn).toBe(getChecklistValueConfig);
    });

    it('should return undefined for a non-existent config type', () => {
      const configFn = tooltipValueConfigMap.get('NON_EXISTENT_TYPE');
      expect(configFn).toBeUndefined();
    });

    it('should have exactly 4 entries', () => {
      expect(tooltipValueConfigMap.size).toBe(4);
    });
  });

  describe('tooltipLabelConfigMap', () => {
    it('should return getOEELabelConfig for OEE config type', () => {
      const configFn = tooltipLabelConfigMap.get(configType.OEE);
      expect(configFn).toBe(getOEELabelConfig);
    });

    it('should return getQuantityLabelConfig for QUANTITY config type', () => {
      const configFn = tooltipLabelConfigMap.get(configType.QUANTITY);
      expect(configFn).toBe(getQuantityLabelConfig);
    });

    it('should return getTimeUsageLabelConfig for TIME_USAGE config type', () => {
      const configFn = tooltipLabelConfigMap.get(configType.TIME_USAGE);
      expect(configFn).toBe(getTimeUsageLabelConfig);
    });

    it('should return getChecklistLabelConfig for CHECKLIST config type', () => {
      const configFn = tooltipLabelConfigMap.get(configType.CHECKLIST);
      expect(configFn).toBe(getChecklistLabelConfig);
    });

    it('should return undefined for a non-existent config type', () => {
      const configFn = tooltipLabelConfigMap.get('NON_EXISTENT_TYPE');
      expect(configFn).toBeUndefined();
    });

    it('should have exactly 4 entries', () => {
      expect(tooltipLabelConfigMap.size).toBe(4);
    });
  });

  describe('getTooltipPrimaryValueConfig', () => {
    it('should return tooltipXLabel when cfgType is not in preProcessedCharts', () => {
      const data: ChartDataPoint = { tooltipXLabel: 'Test Label' };
      const cfgType = 'DOWNTIME';
      const yAxis = 'duration';

      const result = getTooltipPrimaryValueConfig(data, cfgType, yAxis);

      expect(result).toEqual({
        text: 'Test Label',
        isPrimary: true,
      });
    });

    it('should return tooltipXLabel when data has groups (drilled down level)', () => {
      const data: ChartDataPoint = {
        tooltipXLabel: 'Entity Label',
        groups: [{ entityName: 'group1' }],
        [specialKey.PREPROCESSED_GROUP_ID_KEY]: 'oee',
      };
      const cfgType = configType.OEE;
      const yAxis = 'oee';

      const result = getTooltipPrimaryValueConfig(data, cfgType, yAxis);

      expect(result).toEqual({
        text: 'Entity Label',
        isPrimary: true,
      });
    });

    it('should return processed value when cfgType is OEE and data is at highest level', () => {
      const data: ChartDataPoint = {
        tooltipXLabel: 'OEE Label',
        [specialKey.PREPROCESSED_GROUP_ID_KEY]: 'oee',
        oeeFormatted: '85.5%',
      };
      const cfgType = configType.OEE;
      const yAxis = 'oee';

      const result = getTooltipPrimaryValueConfig(data, cfgType, yAxis);

      expect(result).toEqual({
        text: '85.5%',
        isPrimary: true,
      });
    });

    it('should return processed value when cfgType is QUANTITY and data is at highest level', () => {
      const data: ChartDataPoint = {
        tooltipXLabel: 'Quantity Label',
        [specialKey.PREPROCESSED_GROUP_ID_KEY]: 'potential',
        potentialQtyFormatted: '1,000',
      };
      const cfgType = configType.QUANTITY;
      const yAxis = 'potential';

      const result = getTooltipPrimaryValueConfig(data, cfgType, yAxis);

      expect(result).toEqual({
        text: '1,000',
        isPrimary: true,
      });
    });

    it('should handle missing tooltipValueKey gracefully', () => {
      const data: ChartDataPoint = {
        tooltipXLabel: 'Label',
        [specialKey.PREPROCESSED_GROUP_ID_KEY]: 'unknown',
      };
      const cfgType = configType.OEE;
      const yAxis = 'oee';

      // Mock the config function to return an empty object
      const originalMap = tooltipValueConfigMap.get(configType.OEE);
      tooltipValueConfigMap.set(configType.OEE, () => ({ tooltipValueKey: undefined }));

      const result = getTooltipPrimaryValueConfig(data, cfgType, yAxis);

      // When tooltipValueKey is undefined, it falls back to tooltipXLabel
      expect(result).toEqual({
        text: 'Label',
        isPrimary: true,
      });

      // Restore original
      if (originalMap) {
        tooltipValueConfigMap.set(configType.OEE, originalMap);
      }
    });

    it('should handle missing preprocessed value key in data', () => {
      const data: ChartDataPoint = {
        tooltipXLabel: 'Label',
        [specialKey.PREPROCESSED_GROUP_ID_KEY]: 'oee',
        // oeeFormatted is missing
      };
      const cfgType = configType.OEE;
      const yAxis = 'oee';

      const result = getTooltipPrimaryValueConfig(data, cfgType, yAxis);

      // When data[tooltipValueKey] is undefined, text becomes undefined which becomes ''
      expect(result).toEqual({
        text: '',
        isPrimary: true,
      });
    });

    it('should fallback to empty string when tooltipXLabel is undefined', () => {
      const data: ChartDataPoint = {
        // tooltipXLabel is missing
      };
      const cfgType = 'DOWNTIME';
      const yAxis = 'duration';

      const result = getTooltipPrimaryValueConfig(data, cfgType, yAxis);

      expect(result).toEqual({
        text: '',
        isPrimary: true,
      });
    });

    it('should pass yAxis parameter to value config function', () => {
      const data: ChartDataPoint = {
        tooltipXLabel: 'Label',
        [specialKey.PREPROCESSED_GROUP_ID_KEY]: 'good',
        goodQtyFormatted: '950',
      };
      const cfgType = configType.QUANTITY;
      const yAxis = 'good';

      const result = getTooltipPrimaryValueConfig(data, cfgType, yAxis);

      expect(result.text).toBe('950');
    });
  });

  describe('getAlternativePrimaryLabelConfig', () => {
    it('should return null when cfgType is not in preProcessedCharts', () => {
      const cfgType = 'DOWNTIME';
      const data: ChartDataPoint = {};

      const result = getAlternativePrimaryLabelConfig({ cfgType, data });

      expect(result).toBeNull();
    });

    it('should return null when data has groups (drilled down level)', () => {
      const cfgType = configType.OEE;
      const data: ChartDataPoint = {
        groups: [{ entityName: 'group1' }],
        [specialKey.PREPROCESSED_GROUP_ID_KEY]: 'oee',
      };

      const result = getAlternativePrimaryLabelConfig({ cfgType, data });

      expect(result).toBeNull();
    });

    it('should return label config when cfgType is OEE and data is at highest level', () => {
      const cfgType = configType.OEE;
      const data: ChartDataPoint = {
        [specialKey.PREPROCESSED_GROUP_ID_KEY]: 'oee',
      };

      const result = getAlternativePrimaryLabelConfig({ cfgType, data });

      expect(result).toBeTruthy();
      expect(result).toHaveProperty('text');
    });

    it('should return label config when cfgType is QUANTITY and data is at highest level', () => {
      const cfgType = configType.QUANTITY;
      const data: ChartDataPoint = {
        [specialKey.PREPROCESSED_GROUP_ID_KEY]: 'potential',
      };

      const result = getAlternativePrimaryLabelConfig({ cfgType, data });

      expect(result).toBeTruthy();
      expect(result).toHaveProperty('text');
    });

    it('should return label config when cfgType is TIME_USAGE and data is at highest level', () => {
      const cfgType = configType.TIME_USAGE;
      const data: ChartDataPoint = {
        [specialKey.PREPROCESSED_GROUP_ID_KEY]: preprocessorGroupType.UNCOMMENTED_STOP,
      };

      const result = getAlternativePrimaryLabelConfig({ cfgType, data });

      expect(result).toBeTruthy();
      expect(result).toHaveProperty('text');
      expect(result).toHaveProperty('icon');
      expect(result).toHaveProperty('color');
    });

    it('should return label config when cfgType is CHECKLIST and data is at highest level', () => {
      const cfgType = configType.CHECKLIST;
      const data: ChartDataPoint = {
        [specialKey.PREPROCESSED_GROUP_ID_KEY]: preprocessorGroupType.CHECKLIST_SUCCESSFUL,
      };

      const result = getAlternativePrimaryLabelConfig({ cfgType, data });

      expect(result).toBeTruthy();
      expect(result).toHaveProperty('text');
      expect(result).toHaveProperty('icon');
      expect(result).toHaveProperty('color');
    });

    it('should handle missing config function gracefully', () => {
      const cfgType = configType.OEE;
      const data: ChartDataPoint = {
        [specialKey.PREPROCESSED_GROUP_ID_KEY]: 'oee',
      };

      // Remove the config function temporarily
      const originalFn = tooltipLabelConfigMap.get(configType.OEE);
      tooltipLabelConfigMap.delete(configType.OEE);

      const result = getAlternativePrimaryLabelConfig({ cfgType, data });

      expect(result).toBeNull();

      // Restore original
      if (originalFn) {
        tooltipLabelConfigMap.set(configType.OEE, originalFn);
      }
    });

    it('should return different configs for different preprocessor group types', () => {
      const cfgType = configType.OEE;

      const oeeData: ChartDataPoint = {
        [specialKey.PREPROCESSED_GROUP_ID_KEY]: 'oee',
      };

      const availabilityData: ChartDataPoint = {
        [specialKey.PREPROCESSED_GROUP_ID_KEY]: 'availability',
      };

      const oeeResult = getAlternativePrimaryLabelConfig({ cfgType, data: oeeData });
      const availabilityResult = getAlternativePrimaryLabelConfig({ cfgType, data: availabilityData });

      expect(oeeResult).not.toEqual(availabilityResult);
    });
  });
});
