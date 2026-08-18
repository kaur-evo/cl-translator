import config from '@/stores/reportsConfig/constants/configType';
import chartType from '@/stores/reportsConfig/constants/chartType';

export function getLabeledBarChartBehaviour({ groupBy }) {
  if (groupBy.length > 1) {
    return [chartType.GROUPED_COLUMN];
  }
  return [chartType.STACKED_COLUMN, chartType.DATAPOINT_LABELS];
}

export function getBarChartBehaviour({ groupBy }) {
  if (groupBy.length > 1) {
    return [chartType.GROUPED_COLUMN];
  }
  return [chartType.STACKED_COLUMN];
}

export function getOEEChartBehaviour({ previousChartType }) {
  if (previousChartType === chartType.LINE) {
    return [chartType.LINE, chartType.DOT_PLOT];
  }
  return [chartType.GROUPED_COLUMN];
}

export default function getChartType(configType, args) {
  switch (configType) {
    case config.DOWNTIME:
      return getLabeledBarChartBehaviour(args);
    case config.SPEEDLOSS:
      return getLabeledBarChartBehaviour(args);
    case config.SCRAPREASON:
      return getLabeledBarChartBehaviour(args);
    case config.OEE:
      return getOEEChartBehaviour(args);
    case config.TIME_USAGE:
      return getBarChartBehaviour(args);
    case config.QUANTITY:
      return getBarChartBehaviour(args);
    case config.CHECKLIST:
      return getBarChartBehaviour(args);
    case config.PRODUCTION_SPEED:
      return getBarChartBehaviour(args);
    default:
      throw new Error(`Unknown configType: ${configType}`);
  }
}
