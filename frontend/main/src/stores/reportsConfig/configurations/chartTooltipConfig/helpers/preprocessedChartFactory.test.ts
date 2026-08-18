import { describe, expect, it, vi } from 'vitest';

import type { PreprocessorLabelConfig, PreprocessorValueConfig, ChartDataPoint } from '@/stores/reportsConfig/configurations/chartTooltipConfig/types';
import createPreprocessedChartConfig from '@/stores/reportsConfig/configurations/chartTooltipConfig/helpers/preprocessedChartFactory';

describe('createPreprocessedChartConfig', () => {
  const mockLabelConfig: PreprocessorLabelConfig = { text: 'Label' };
  const mockValueConfig: PreprocessorValueConfig = { tooltipValueKey: 'value' };
  const mockData: ChartDataPoint = { groups: [] }; // Not highest level

  const mockLabelConfigFn = vi.fn().mockReturnValue(mockLabelConfig);
  const mockValueConfigFn = vi.fn().mockReturnValue(mockValueConfig);

  it('should create a row config with isHidden=false when legend key is present', () => {
    const result = createPreprocessedChartConfig({
      measure: 'testMeasure',
      labelConfigFn: mockLabelConfigFn,
      valueConfigFn: mockValueConfigFn,
      preprocessorGroupType: 'testType',
      chartLegendKey: 'testKey',
      data: mockData,
      chartLegendState: ['testKey', 'otherKey'],
    });

    expect(result.isHidden).toBe(false);
    expect(result.valueKey).toBe('testMeasure');
  });

  it('should create a row config with isHidden=true when legend key is missing', () => {
    const result = createPreprocessedChartConfig({
      measure: 'testMeasure',
      labelConfigFn: mockLabelConfigFn,
      valueConfigFn: mockValueConfigFn,
      preprocessorGroupType: 'testType',
      chartLegendKey: 'testKey',
      data: mockData,
      chartLegendState: ['otherKey'],
    });

    expect(result.isHidden).toBe(true);
  });

  it('should respect additionalHideCondition', () => {
    const result = createPreprocessedChartConfig({
      measure: 'testMeasure',
      labelConfigFn: mockLabelConfigFn,
      valueConfigFn: mockValueConfigFn,
      preprocessorGroupType: 'testType',
      chartLegendKey: 'testKey',
      data: mockData,
      chartLegendState: ['testKey'],
      additionalHideCondition: true,
    });

    expect(result.isHidden).toBe(true);
  });
});
