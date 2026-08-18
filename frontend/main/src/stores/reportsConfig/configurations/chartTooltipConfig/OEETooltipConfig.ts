import TooltipConfigBuilder from '@/stores/reportsConfig/configurations/chartTooltipConfig/TooltipConfigBuilder';
import createPreprocessedChartConfig from '@/stores/reportsConfig/configurations/chartTooltipConfig/helpers/preprocessedChartFactory';
import measure from '@/stores/reportsConfig/constants/measure';
import { getOEELabelConfig, getOEEValueConfig } from '@/stores/reportsConfig/configurations/chartTooltipConfig/OEETooltipBaseConfig';
import preprocessorGroupType from '@/stores/reportsConfig/constants/preprocessorGroupType';
import configType from '@/stores/reportsConfig/constants/configType';
import type { ChartConfigParams, TooltipRowConfig } from '@/stores/reportsConfig/configurations/chartTooltipConfig/types';

/**
 * Generates tooltip configuration for OEE charts.
 * @param params - Chart configuration parameters including OEE-specific data, grouping, and visible columns
 * @returns Array of tooltip row configurations
 */
export default function getOEEConfig({
  data, groupBy, cfgType, granularity, yAxis, visibleColumns = [], chartLegendState = [],
}: ChartConfigParams<typeof configType.OEE>): TooltipRowConfig[] {
  const builder = new TooltipConfigBuilder('OEE');

  builder.addStandardGroupingRows({ data, groupBy, cfgType, granularity, yAxis });

  builder
    .addRow(createPreprocessedChartConfig({
      measure: measure.OEE,
      labelConfigFn: getOEELabelConfig,
      valueConfigFn: getOEEValueConfig,
      preprocessorGroupType: preprocessorGroupType.OEE,
      chartLegendKey: 'oee',
      data,
      chartLegendState,
    }))
    .addRow(createPreprocessedChartConfig({
      measure: measure.AVAILABILITY,
      labelConfigFn: getOEELabelConfig,
      valueConfigFn: getOEEValueConfig,
      preprocessorGroupType: preprocessorGroupType.AVAILABILITY,
      chartLegendKey: 'availability',
      data,
      chartLegendState,
    }))
    .addRow(createPreprocessedChartConfig({
      measure: measure.PERFORMANCE,
      labelConfigFn: getOEELabelConfig,
      valueConfigFn: getOEEValueConfig,
      preprocessorGroupType: preprocessorGroupType.PERFORMANCE,
      chartLegendKey: 'performance',
      data,
      chartLegendState,
    }))
    .addRow(createPreprocessedChartConfig({
      measure: measure.QUALITY,
      labelConfigFn: getOEELabelConfig,
      valueConfigFn: getOEEValueConfig,
      preprocessorGroupType: preprocessorGroupType.QUALITY,
      chartLegendKey: 'quality',
      data,
      chartLegendState,
    }))
    .addRow(createPreprocessedChartConfig({
      measure: measure.TECHNICAL_AVAILABILITY,
      labelConfigFn: getOEELabelConfig,
      valueConfigFn: getOEEValueConfig,
      preprocessorGroupType: preprocessorGroupType.TECHNICAL_AVAILABILITY,
      chartLegendKey: 'technicalAvailability',
      data,
      chartLegendState,
    }));

  return builder
    .filterByColumns(visibleColumns)
    .filterHidden()
    .build();
}
