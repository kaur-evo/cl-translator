import { isHighestLevel } from '@/stores/reportsConfig/configurations/chartTooltipConfig/helpers/groupingHelpers';
import TooltipConfigBuilder from '@/stores/reportsConfig/configurations/chartTooltipConfig/TooltipConfigBuilder';
import createPreprocessedChartConfig from '@/stores/reportsConfig/configurations/chartTooltipConfig/helpers/preprocessedChartFactory';
import measure from '@/stores/reportsConfig/constants/measure';
import calcMeasure from '@/stores/reportsConfig/constants/calcMeasure';
import preprocessorGroupType from '@/stores/reportsConfig/constants/preprocessorGroupType';
import configType from '@/stores/reportsConfig/constants/configType';
import {
  getQuantityLabelConfig,
  getQuantityValueConfig,
} from '@/stores/reportsConfig/configurations/chartTooltipConfig/quantityTooltipBaseConfig';
import type { ChartConfigParams, TooltipRowConfig } from '@/stores/reportsConfig/configurations/chartTooltipConfig/types';

/**
 * Generates tooltip configuration for Quantity charts.
 * @param params - Chart configuration parameters including Quantity-specific data, grouping, and visible columns
 * @returns Array of tooltip row configurations
 */
export default function getQuantityConfig({
  data, groupBy, cfgType, granularity, yAxis, visibleColumns = [], chartLegendState = [],
}: ChartConfigParams<typeof configType.QUANTITY>): TooltipRowConfig[] {
  const builder = new TooltipConfigBuilder('QUANTITY');

  builder.addStandardGroupingRows({ data, groupBy, cfgType, granularity, yAxis });

  builder
    .addRow(createPreprocessedChartConfig({
      measure: calcMeasure.POTENTIAL_QTY,
      labelConfigFn: getQuantityLabelConfig,
      valueConfigFn: (type) => getQuantityValueConfig(type, yAxis),
      preprocessorGroupType: preprocessorGroupType.POTENTIAL,
      chartLegendKey: 'potential',
      data,
      additionalHideCondition: isHighestLevel(data),
      chartLegendState,
    }))
    .addRow(createPreprocessedChartConfig({
      measure: measure.GOOD_QTY,
      labelConfigFn: getQuantityLabelConfig,
      valueConfigFn: (type) => getQuantityValueConfig(type, yAxis),
      preprocessorGroupType: preprocessorGroupType.GOOD,
      chartLegendKey: 'good',
      data,
      additionalHideCondition: isHighestLevel(data),
      chartLegendState,
    }))
    .addRow(createPreprocessedChartConfig({
      measure: measure.SCRAP_QTY,
      labelConfigFn: getQuantityLabelConfig,
      valueConfigFn: (type) => getQuantityValueConfig(type, yAxis),
      preprocessorGroupType: preprocessorGroupType.SCRAP,
      chartLegendKey: 'scrap',
      data,
      additionalHideCondition: isHighestLevel(data),
      chartLegendState,
    }))
    .addRow(createPreprocessedChartConfig({
      measure: measure.ROW_PRODUCED_QTY,
      labelConfigFn: getQuantityLabelConfig,
      valueConfigFn: (type) => getQuantityValueConfig(type, yAxis),
      preprocessorGroupType: measure.ROW_PRODUCED_QTY,
      chartLegendKey: 'rowProducedQty',
      data,
      chartLegendState,
    }))
    .addRow(createPreprocessedChartConfig({
      measure: measure.IDEAL_QTY,
      labelConfigFn: getQuantityLabelConfig,
      valueConfigFn: (type) => getQuantityValueConfig(type, yAxis),
      preprocessorGroupType: measure.IDEAL_QTY,
      chartLegendKey: 'idealQty',
      data,
      chartLegendState,
    }));

  return builder
    .filterByColumns(visibleColumns)
    .filterHidden()
    .build();
}
