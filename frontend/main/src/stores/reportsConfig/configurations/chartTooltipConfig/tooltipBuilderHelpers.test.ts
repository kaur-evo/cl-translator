import { describe, expect, it, vi, beforeEach } from 'vitest';

import {
  createRowWithIcon,
  createRowFromBaseConfigs,
} from '@/stores/reportsConfig/configurations/chartTooltipConfig/tooltipBuilderHelpers';
import type { PreprocessorLabelConfig, PreprocessorValueConfig, ChartDataPoint } from '@/stores/reportsConfig/configurations/chartTooltipConfig/types';

// Mock dependencies
vi.mock('@/stores/reportsConfig/configurations/chartTooltipConfig/helpers/groupingHelpers', () => ({
  getGroupingRows: vi.fn(),
  isHighestLevel: vi.fn(),
  groupByMap: new Map(),
}));

vi.mock('@/stores/reportsConfig/configurations/labelsByChartTypeAndGrouping', () => ({
  getEntityLabelMap: vi.fn().mockReturnValue({}),
}));

vi.mock('@/stores/reportsConfig/configurations/chartTooltipConfig/helpers/preprocessorHelpers', () => ({
  getAlternativePrimaryLabelConfig: vi.fn(),
  getTooltipPrimaryValueConfig: vi.fn(),
}));

vi.mock('@/helpers/tooltips/IconResolver', () => ({
  resolveIcon: vi.fn(),
}));

describe('tooltipBuilderHelpers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createRowWithIcon', () => {
    it('should create row with resolved icon', async () => {
      const { resolveIcon } = await import('@/helpers/tooltips/IconResolver');

      vi.mocked(resolveIcon).mockReturnValue('iconYAxis');


      const result = createRowWithIcon({
        valueKey: 'duration',
        tooltipValueKey: 'durationFormatted',
        text: 'Duration',
        iconKey: 'duration',
        axisConfig: {
          groupBy: ['entity'],
          yAxis: 'duration',
        },
      });

      expect(resolveIcon).toHaveBeenCalledWith({
        key: 'duration',
        groupBy: ['entity'],
        yAxis: 'duration',
        yAxisRight: undefined,
        index: undefined,
      });

      expect(result).toEqual({
        valueKey: 'duration',
        tooltipValueKey: 'durationFormatted',
        text: 'Duration',
        icon: 'iconYAxis',
      });
    });

    it('should handle function text', async () => {
      const { resolveIcon } = await import('@/helpers/tooltips/IconResolver');

      vi.mocked(resolveIcon).mockReturnValue('iconDot');

      const textFn = (data: ChartDataPoint) => `Entity: ${data.entityName}`;


      const result = createRowWithIcon({
        valueKey: 'entity',
        tooltipValueKey: 'entityName',
        text: textFn,
        iconKey: 'entity',
        axisConfig: {
          groupBy: ['entity', 'product'],
          yAxis: 'duration',
          index: 0,
        },
      });

      expect(result.text).toBe(textFn);
      expect(typeof result.text).toBe('function');
    });

    it('should pass all axis config parameters to resolveIcon', async () => {
      const { resolveIcon } = await import('@/helpers/tooltips/IconResolver');

      vi.mocked(resolveIcon).mockReturnValue('iconXZAxis');

      createRowWithIcon({
        valueKey: 'count',
        tooltipValueKey: 'countFormatted',
        text: 'Count',
        iconKey: 'count',
        axisConfig: {
          groupBy: ['entity', 'product'],
          yAxis: 'duration',
          yAxisRight: 'entityCount',
          index: 1,
        },
      });

      expect(resolveIcon).toHaveBeenCalledWith({
        key: 'count',
        groupBy: ['entity', 'product'],
        yAxis: 'duration',
        yAxisRight: 'entityCount',
        index: 1,
      });
    });

    it('should spread additional properties into row config', async () => {
      const { resolveIcon } = await import('@/helpers/tooltips/IconResolver');

      vi.mocked(resolveIcon).mockReturnValue('iconYAxis');

      // @ts-expect-error: test allows unknown for flexibility
      const result = createRowWithIcon({
        valueKey: 'duration',
        tooltipValueKey: 'durationFormatted',
        text: 'Duration',
        iconKey: 'duration',
        axisConfig: {
          groupBy: ['entity'],
          yAxis: 'duration',
        },
        color: '#FF0000',
        visibility: 'always',
      } as unknown);

      expect(result).toEqual({
        valueKey: 'duration',
        tooltipValueKey: 'durationFormatted',
        text: 'Duration',
        icon: 'iconYAxis',
        color: '#FF0000',
        visibility: 'always',
      });
    });
  });

  describe('createRowFromBaseConfigs', () => {
    it('should merge label and value configs with valueKey', () => {
      const labelConfig: PreprocessorLabelConfig = {
        text: 'OEE',
        icon: 'iconDot',
        color: '#00FF00',
      };

      const valueConfig: PreprocessorValueConfig = {
        tooltipValueKey: 'oeeFormatted',
        yAxisValueKey: 'oee',
      };

      const result = createRowFromBaseConfigs({
        valueKey: 'oee',
        labelConfig,
        valueConfig,
      });

      expect(result).toEqual({
        valueKey: 'oee',
        text: 'OEE',
        icon: 'iconDot',
        color: '#00FF00',
        tooltipValueKey: 'oeeFormatted',
        yAxisValueKey: 'oee',
        isHidden: false,
      });
    });

    it('should set isHidden to true when specified', () => {
      const labelConfig: PreprocessorLabelConfig = {
        text: 'Availability',
      };

      const valueConfig: PreprocessorValueConfig = {
        tooltipValueKey: 'availabilityFormatted',
      };

      const result = createRowFromBaseConfigs({
        valueKey: 'availability',
        labelConfig,
        valueConfig,
        isHidden: true,
      });

      expect(result.isHidden).toBe(true);
    });

    it('should default isHidden to false when not specified', () => {
      const labelConfig: PreprocessorLabelConfig = {
        text: 'Performance',
      };

      const valueConfig: PreprocessorValueConfig = {
        tooltipValueKey: 'performanceFormatted',
      };

      const result = createRowFromBaseConfigs({
        valueKey: 'performance',
        labelConfig,
        valueConfig,
      });

      expect(result.isHidden).toBe(false);
    });

    it('should handle minimal label and value configs', () => {
      const labelConfig: PreprocessorLabelConfig = {
        text: 'Minimal',
      };

      const valueConfig: PreprocessorValueConfig = {
        tooltipValueKey: 'value',
      };

      const result = createRowFromBaseConfigs({
        valueKey: 'minimal',
        labelConfig,
        valueConfig,
      });

      expect(result).toEqual({
        valueKey: 'minimal',
        text: 'Minimal',
        tooltipValueKey: 'value',
        isHidden: false,
      });
    });

    it('should handle function-based text in labelConfig', () => {
      const textFn = (data: ChartDataPoint) => `Dynamic: ${data.entityName}`;

      const labelConfig: PreprocessorLabelConfig = {
        text: textFn,
        icon: 'iconDot',
      };

      const valueConfig: PreprocessorValueConfig = {
        tooltipValueKey: 'dynamicValue',
      };

      const result = createRowFromBaseConfigs({
        valueKey: 'dynamic',
        labelConfig,
        valueConfig,
      });

      expect(result.text).toBe(textFn);
      expect(typeof result.text).toBe('function');
    });

    it('should handle function-based color in labelConfig', () => {
      const colorFn = (data: ChartDataPoint) => (data.isFasterThanTarget ? '#00FF00' : '#FF0000');

      const labelConfig: PreprocessorLabelConfig = {
        text: 'Speed',
        color: colorFn,
      };

      const valueConfig: PreprocessorValueConfig = {
        tooltipValueKey: 'speedFormatted',
      };

      const result = createRowFromBaseConfigs({
        valueKey: 'speed',
        labelConfig,
        valueConfig,
      });

      expect(result.color).toBe(colorFn);
      expect(typeof result.color).toBe('function');
    });
  });
});
