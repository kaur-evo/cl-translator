import TooltipConfigBuilder from '@/stores/reportsConfig/configurations/chartTooltipConfig/TooltipConfigBuilder';
import { createRowFromBaseConfigs } from '@/stores/reportsConfig/configurations/chartTooltipConfig/tooltipBuilderHelpers';
import measure from '@/stores/reportsConfig/constants/measure';
import configType from '@/stores/reportsConfig/constants/configType';
import { isModeVisible, isTargetVisible } from '@/stores/reportsConfig/configurations/productionSpeedCommonFn';
import { getProductionSpeedLabelConfig, getProductionSpeedValueConfig } from '@/stores/reportsConfig/configurations/chartTooltipConfig/productionSpeedTooltipBaseConfig';
import type { ChartConfigParams, TooltipRowConfig, TotalsData } from '@/stores/reportsConfig/configurations/chartTooltipConfig/types';

/**
 * Generates tooltip configuration for Production Speed charts.
 * @param params - Chart configuration parameters including ProductionSpeed-specific data, grouping, totals, and visible columns
 * @returns Array of tooltip row configurations
 */
export default function getProductionSpeedConfig({
  data, groupBy, chartLegendState = [], totals = {} as TotalsData, cfgType, granularity, yAxis, visibleColumns = [],
}: ChartConfigParams<typeof configType.PRODUCTION_SPEED>): TooltipRowConfig[] {
  const builder = new TooltipConfigBuilder('PRODUCTION_SPEED');
  const valueContext = { groupBy, totals };

  builder.addStandardGroupingRows({ data, groupBy, chartLegendState, totals, cfgType, granularity, yAxis });

  builder.addRow(createRowFromBaseConfigs({
    valueKey: 'primaryValue',
    labelConfig: getProductionSpeedLabelConfig('primaryValue'),
    valueConfig: getProductionSpeedValueConfig('primaryValue', valueContext),
  }));

  builder.addRow(createRowFromBaseConfigs({
    valueKey: measure.PRODUCTION_SPEED_COUNT,
    labelConfig: getProductionSpeedLabelConfig(measure.PRODUCTION_SPEED_COUNT),
    valueConfig: getProductionSpeedValueConfig(measure.PRODUCTION_SPEED_COUNT, valueContext),
  }));

  builder.addRow(createRowFromBaseConfigs({
    valueKey: measure.PRODCUTION_TIME,
    labelConfig: getProductionSpeedLabelConfig(measure.PRODCUTION_TIME),
    valueConfig: getProductionSpeedValueConfig(measure.PRODCUTION_TIME, valueContext),
  }));

  builder.addRow(createRowFromBaseConfigs({
    valueKey: measure.TARGET,
    labelConfig: getProductionSpeedLabelConfig(measure.TARGET),
    valueConfig: getProductionSpeedValueConfig(measure.TARGET, valueContext),
    isHidden: !isTargetVisible(data, chartLegendState),
  }));

  builder.addRow(createRowFromBaseConfigs({
    valueKey: measure.MODE,
    labelConfig: getProductionSpeedLabelConfig(measure.MODE),
    valueConfig: getProductionSpeedValueConfig(measure.MODE, valueContext),
    isHidden: !isModeVisible(data, chartLegendState),
  }));

  return builder
    .filterByColumns(visibleColumns)
    .filterHidden()
    .build();
}
