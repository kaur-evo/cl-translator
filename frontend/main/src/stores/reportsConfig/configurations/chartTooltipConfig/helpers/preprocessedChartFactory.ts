/** Factory function for creating preprocessed chart tooltip rows */

import type { TooltipRowConfig, PreprocessorLabelConfig, PreprocessorValueConfig, ChartDataPoint } from '@/stores/reportsConfig/configurations/chartTooltipConfig/types';
import { createRowFromBaseConfigs } from '@/stores/reportsConfig/configurations/chartTooltipConfig/tooltipBuilderHelpers';
import { isHighestLevel } from '@/stores/reportsConfig/configurations/chartTooltipConfig/helpers/groupingHelpers';

/** Creates a tooltip row configuration for preprocessed charts */
export function createPreprocessedChartConfig({
  measure,
  labelConfigFn,
  valueConfigFn,
  preprocessorGroupType,
  chartLegendKey,
  data,
  additionalHideCondition = false,
  chartLegendState,
}: {
  measure: string;
  labelConfigFn: (type: string, yAxis?: string) => PreprocessorLabelConfig;
  valueConfigFn: (type: string, yAxis?: string) => PreprocessorValueConfig;
  preprocessorGroupType: string;
  chartLegendKey: string;
  data: ChartDataPoint;
  additionalHideCondition?: boolean;
  chartLegendState: string[];
}): TooltipRowConfig {
  const labelConfig = labelConfigFn(preprocessorGroupType);
  const valueConfig = valueConfigFn(preprocessorGroupType);

  if (!labelConfig) {
    throw new Error(`Label config not found for preprocessorGroupType: ${preprocessorGroupType}`);
  }
  if (!valueConfig) {
    throw new Error(`Value config not found for preprocessorGroupType: ${preprocessorGroupType}`);
  }

  // Determine if row should be hidden based on:
  // 1. Chart legend state (user toggled off in legend)
  // 2. Data is at highest level (no drill-down, show alternative measures)
  // 3. Any additional hide condition passed in
  const isHidden = !chartLegendState.includes(chartLegendKey)
    || isHighestLevel(data)
    || additionalHideCondition;

  return createRowFromBaseConfigs({
    valueKey: measure,
    labelConfig,
    valueConfig,
    isHidden,
  });
}

export default createPreprocessedChartConfig;
