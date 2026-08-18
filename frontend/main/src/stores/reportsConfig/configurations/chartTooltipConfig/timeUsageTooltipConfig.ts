import measure from '@/stores/reportsConfig/constants/measure';
import yAxisKey from '@/stores/reportsConfig/constants/yAxisKey';
import calcMeasure from '@/stores/reportsConfig/constants/calcMeasure';
import preprocessorGroupType from '@/stores/reportsConfig/constants/preprocessorGroupType';
import configType from '@/stores/reportsConfig/constants/configType';
import {
  getTimeUsageLabelConfig,
  getTimeUsageValueConfig,
} from '@/stores/reportsConfig/configurations/chartTooltipConfig/timeUsageTooltipBaseConfig';
import { isHighestLevel } from '@/stores/reportsConfig/configurations/chartTooltipConfig/helpers/groupingHelpers';
import TooltipConfigBuilder from '@/stores/reportsConfig/configurations/chartTooltipConfig/TooltipConfigBuilder';
import createPreprocessedChartConfig from '@/stores/reportsConfig/configurations/chartTooltipConfig/helpers/preprocessedChartFactory';
import type { ChartConfigParams, TooltipRowConfig } from '@/stores/reportsConfig/configurations/chartTooltipConfig/types';

/**
 * Generates tooltip configuration for Time Usage charts.
 * @param params - Chart configuration parameters including TimeUsage-specific data, grouping, and visible columns
 * @returns Array of tooltip row configurations
 */
export default function getTimeUsageConfig({
  data, groupBy, cfgType, granularity, yAxis, visibleColumns = [], chartLegendState = [],
}: ChartConfigParams<typeof configType.TIME_USAGE>): TooltipRowConfig[] {
  const builder = new TooltipConfigBuilder('TIME_USAGE');

  builder.addStandardGroupingRows({ data, groupBy, cfgType, granularity, yAxis });

  builder
    .addRow(createPreprocessedChartConfig({
      measure: measure.GOOD_PRODUCTION,
      labelConfigFn: getTimeUsageLabelConfig,
      valueConfigFn: getTimeUsageValueConfig,
      preprocessorGroupType: preprocessorGroupType.GOOD,
      chartLegendKey: 'good',
      data,
      additionalHideCondition: isHighestLevel(data),
      chartLegendState,
    }))
    .addRow(createPreprocessedChartConfig({
      measure: measure.SLOW_PRODUCTION,
      labelConfigFn: getTimeUsageLabelConfig,
      valueConfigFn: getTimeUsageValueConfig,
      preprocessorGroupType: preprocessorGroupType.SLOW,
      chartLegendKey: 'slow',
      data,
      additionalHideCondition: isHighestLevel(data),
      chartLegendState,
    }))
    .addRow(createPreprocessedChartConfig({
      measure: measure.UNPLANNED_STOP,
      labelConfigFn: getTimeUsageLabelConfig,
      valueConfigFn: getTimeUsageValueConfig,
      preprocessorGroupType: preprocessorGroupType.UNPLANNED_STOP,
      chartLegendKey: 'unplannedStop',
      data,
      additionalHideCondition: isHighestLevel(data),
      chartLegendState,
    }))
    .addRow(createPreprocessedChartConfig({
      measure: measure.UNCOMMENTED_STOP,
      labelConfigFn: getTimeUsageLabelConfig,
      valueConfigFn: getTimeUsageValueConfig,
      preprocessorGroupType: preprocessorGroupType.UNCOMMENTED_STOP,
      chartLegendKey: 'uncommentedStop',
      data,
      additionalHideCondition: isHighestLevel(data),
      chartLegendState,
    }))
    .addRow(createPreprocessedChartConfig({
      measure: measure.PLANNED_STOP_INCLUDED_IN_OEE,
      labelConfigFn: getTimeUsageLabelConfig,
      valueConfigFn: getTimeUsageValueConfig,
      preprocessorGroupType: preprocessorGroupType.PLANNED_STOP_INCLUDED_IN_OEE,
      chartLegendKey: 'plannedStopIncludedInOee',
      data,
      additionalHideCondition: isHighestLevel(data),
      chartLegendState,
    }))
    .addRow(createPreprocessedChartConfig({
      measure: measure.PLANNED_STOP_NOT_INCLUDED_IN_OEE,
      labelConfigFn: getTimeUsageLabelConfig,
      valueConfigFn: getTimeUsageValueConfig,
      preprocessorGroupType: preprocessorGroupType.PLANNED_STOP_NOT_INCLUDED_IN_OEE,
      chartLegendKey: 'plannedStopNotIncludedInOee',
      data,
      additionalHideCondition: yAxis === yAxisKey.PCT_OF_PLANNED_TIME || isHighestLevel(data),
      chartLegendState,
    }))
    .addRow(createPreprocessedChartConfig({
      measure: measure.PLANNED_TIME,
      labelConfigFn: getTimeUsageLabelConfig,
      valueConfigFn: getTimeUsageValueConfig,
      preprocessorGroupType: measure.PLANNED_TIME,
      chartLegendKey: 'plannedTime',
      data,
      additionalHideCondition: yAxis === yAxisKey.VALUE,
      chartLegendState,
    }))
    .addRow(createPreprocessedChartConfig({
      measure: calcMeasure.SHIFT_TIME,
      labelConfigFn: getTimeUsageLabelConfig,
      valueConfigFn: getTimeUsageValueConfig,
      preprocessorGroupType: calcMeasure.SHIFT_TIME,
      chartLegendKey: 'shiftTime',
      data,
      additionalHideCondition: yAxis === yAxisKey.PCT_OF_PLANNED_TIME,
      chartLegendState,
    }))
    .addRow(createPreprocessedChartConfig({
      measure: calcMeasure.OPERATING_TIME,
      labelConfigFn: getTimeUsageLabelConfig,
      valueConfigFn: getTimeUsageValueConfig,
      preprocessorGroupType: calcMeasure.OPERATING_TIME,
      chartLegendKey: 'operatingTime',
      data,
      additionalHideCondition: isHighestLevel(data),
      chartLegendState,
    }));

  return builder
    .filterByColumns(visibleColumns)
    .filterHidden()
    .build();
}
