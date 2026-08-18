/**
 * Helper functions for building tooltip configurations with TooltipConfigBuilder.
 *
 * ## Row Creation Patterns
 *
 * There are three patterns for creating tooltip rows, each suited to different use cases:
 *
 * ### 1. `createRowWithIcon` (this file)
 * Use for: Simple charts with axis-based icon resolution (Downtime, Speedloss, Scrap)
 * - Automatically resolves icons based on Y-axis configuration
 * - Best when tooltip values are simple data key lookups
 * - Example: Duration, count, and percentage rows
 *
 * ### 2. `createRowFromBaseConfigs` (this file)
 * Use for: Charts with separate label/value configuration (ProductionSpeed)
 * - Merges label config (text, icon, color) with value config (tooltipValue, visibility)
 * - Best when label and value logic are defined separately
 * - Allows explicit isHidden control at row creation
 *
 * ### 3. `createPreprocessedChartConfig` (helpers/preprocessedChartFactory.ts)
 * Use for: Preprocessed charts with legend state (OEE, Quantity, TimeUsage, Checklist)
 * - Handles legend-based visibility automatically
 * - Manages highest-level aggregation display logic
 * - Best for charts where rows correspond to legend items
 */

import type { TooltipRowConfig, PreprocessorLabelConfig, PreprocessorValueConfig, ChartDataPoint, IconResolverParams } from '@/stores/reportsConfig/configurations/chartTooltipConfig/types';
import { resolveIcon } from '@/helpers/tooltips/IconResolver';

/**
 * Creates a tooltip row with axis-based icon resolution.
 * Use for simple charts where icons depend on Y-axis configuration.
 */
export function createRowWithIcon({
  valueKey,
  tooltipValueKey,
  text,
  iconKey,
  axisConfig,
  ...rest
}: {
  valueKey: string;
  tooltipValueKey: string;
  text: string | ((data: ChartDataPoint) => string);
  iconKey: string;
  axisConfig: Omit<IconResolverParams, 'key'>;
}): TooltipRowConfig {
  const { groupBy, yAxis, yAxisRight, index } = axisConfig;

  const icon = resolveIcon({
    key: iconKey,
    groupBy,
    yAxis,
    yAxisRight,
    index,
  });

  return {
    valueKey,
    tooltipValueKey,
    text,
    icon,
    ...rest,
  };
}

/**
 * Creates a tooltip row by merging separate label and value configurations.
 * Use when label and value logic are defined in separate config functions.
 */
export function createRowFromBaseConfigs({
  valueKey,
  labelConfig,
  valueConfig,
  isHidden = false,
}: {
  valueKey: string;
  labelConfig: PreprocessorLabelConfig;
  valueConfig: PreprocessorValueConfig;
  isHidden?: boolean;
}): TooltipRowConfig {
  return {
    valueKey,
    ...labelConfig,
    ...valueConfig,
    isHidden,
  };
}

export default {
  createRowWithIcon,
  createRowFromBaseConfigs,
};
