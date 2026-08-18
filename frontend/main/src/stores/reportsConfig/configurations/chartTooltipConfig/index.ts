import configType from '@/stores/reportsConfig/constants/configType';
import getDowntimeConfig from '@/stores/reportsConfig/configurations/chartTooltipConfig/downtimeTooltipConfig';
import getSpeedlossConfig from '@/stores/reportsConfig/configurations/chartTooltipConfig/speedlossTooltipConfig';
import getScrapReasonConfig from '@/stores/reportsConfig/configurations/chartTooltipConfig/scrapTooltipConfig';
import getOEEConfig from '@/stores/reportsConfig/configurations/chartTooltipConfig/OEETooltipConfig';
import getQuantityConfig from '@/stores/reportsConfig/configurations/chartTooltipConfig/quantityTooltipConfig';
import getTimeUsageConfig from '@/stores/reportsConfig/configurations/chartTooltipConfig/timeUsageTooltipConfig';
import getChecklistConfig from '@/stores/reportsConfig/configurations/chartTooltipConfig/checklistTooltipConfig';
import getProductionSpeedConfig from '@/stores/reportsConfig/configurations/chartTooltipConfig/productionSpeedTooltipConfig';
import type { ChartConfigParams, TooltipRowConfig } from '@/stores/reportsConfig/configurations/chartTooltipConfig/types';

type TooltipConfigFunction = (params: ChartConfigParams) => TooltipRowConfig[];

/**
 * Main entry point for tooltip configuration.
 * Routes to chart-specific configuration based on chart type.
 * @param params - Chart configuration parameters
 * @returns Array of tooltip row configurations
 */
export default function getTooltipConfig({
  cfgType, groupBy, yAxis, data, yAxisRight, granularity, chartLegendState, totals, visibleColumns,
}: ChartConfigParams): TooltipRowConfig[] {
  const configMap = new Map<string, TooltipConfigFunction>([
    [configType.DOWNTIME, getDowntimeConfig as TooltipConfigFunction],
    [configType.SPEEDLOSS, getSpeedlossConfig as TooltipConfigFunction],
    [configType.SCRAPREASON, getScrapReasonConfig as TooltipConfigFunction],
    [configType.OEE, getOEEConfig as TooltipConfigFunction],
    [configType.QUANTITY, getQuantityConfig as TooltipConfigFunction],
    [configType.TIME_USAGE, getTimeUsageConfig as TooltipConfigFunction],
    [configType.CHECKLIST, getChecklistConfig as TooltipConfigFunction],
    [configType.PRODUCTION_SPEED, getProductionSpeedConfig as TooltipConfigFunction],
  ]);
  const columns = visibleColumns || [];
  const getConfigFn = configMap.get(cfgType);
  if (!getConfigFn) {
    throw new Error(`No configuration found for cfgType: ${cfgType}`);
  }
  const config = getConfigFn({
    data, groupBy, cfgType, granularity, yAxis, yAxisRight, chartLegendState, totals, visibleColumns: columns,
  });

  return config;
}
