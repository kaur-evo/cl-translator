import type { PreprocessorLabelConfig, PreprocessorValueConfig, ChartDataPoint, TotalsData } from '@/stores/reportsConfig/configurations/chartTooltipConfig/types';
import measure from '@/stores/reportsConfig/constants/measure';
import yAxisKey from '@/stores/reportsConfig/constants/yAxisKey';
import i18n from '@/services/i18n';
import colorConstants from '@/constants/colorConstants';
import { formatPercentage, formatNumber } from '@/helpers/numbers/formatNumber';
import getUnitIdFormatted from '@/helpers/getUnitIdFormatted';
import graphColors from '@/constants/graphColors';

/**
 * Returns label configuration for production speed tooltip rows.
 * Normalized to match other config function signatures.
 */
export function getProductionSpeedLabelConfig(type: string): PreprocessorLabelConfig {
  const typeConfigMap: Record<string, PreprocessorLabelConfig> = {
    primaryValue: {
      isPrimary: true,
    } as PreprocessorLabelConfig,
    alternativePrimaryLabel: {
      text: (entry: ChartDataPoint) => (entry.isFasterThanTarget ? i18n.global.t('Faster than target') : i18n.global.t('Slower than target')),
      icon: 'iconDot',
      color: (entry: ChartDataPoint) => (entry.isFasterThanTarget ? colorConstants.dark.primary : graphColors['graph-yellow']),
    },
    [measure.PRODUCTION_SPEED_COUNT]: {
      text: i18n.global.t('Count'),
    },
    [measure.PRODCUTION_TIME]: {
      text: i18n.global.t('Production time'),
    },
    [measure.TARGET]: {
      text: i18n.global.t('Target speed'),
      icon: 'iconDot',
      color: colorConstants.dark.black,
    },
    [measure.MODE]: {
      text: i18n.global.t('Most frequent'),
      icon: 'iconDot',
      color: graphColors['graph-blue'],
    },
  };
  const config = typeConfigMap[type];
  if (!config) {
    throw new Error(`getProductionSpeedLabelConfig unknown type: ${type}`);
  }
  return config;
}

/**
 * Returns value configuration for production speed tooltip rows.
 *
 * Unlike other configs, ProductionSpeed requires runtime context (groupBy, totals)
 * because tooltip values are computed dynamically with percentage calculations
 * and unit formatting that depend on the current grouping and aggregated totals.
 *
 * Visibility (isHidden) is handled separately in the config file to keep this
 * function focused on value formatting.
 */
export function getProductionSpeedValueConfig(
  type: string,
  context: { groupBy: string[]; totals: TotalsData },
): PreprocessorValueConfig {
  const { groupBy, totals } = context;
  const typeConfigMap: Record<string, PreprocessorValueConfig> = {
    primaryValue: {
      tooltipValue: (entry: ChartDataPoint) => {
        const start = formatNumber(entry.rangeStart as number);
        const end = formatNumber(entry.rangeEnd as number);
        const unit = getUnitIdFormatted(groupBy[0], entry.unitId as string);
        return `${start} - ${end} ${unit}`;
      },
      yAxisValueKey: 'primaryValue',
    } as PreprocessorValueConfig,
    [measure.PRODUCTION_SPEED_COUNT]: {
      tooltipValue: (entry: ChartDataPoint) => `${entry.productionCountLabel} (${formatPercentage(((entry.productionCount as number) / (totals.productionCount ?? 1)) * 100)})`,
      yAxisValueKey: yAxisKey.PRODUCTION_COUNT,
    } as PreprocessorValueConfig,
    [measure.PRODCUTION_TIME]: {
      tooltipValue: (entry: ChartDataPoint) => `${entry.productionTimeLabel} (${formatPercentage(((entry.productionTime as number) / (totals.productionTime ?? 1)) * 100)})`,
      yAxisValueKey: yAxisKey.PRODUCTION_TIME,
    } as PreprocessorValueConfig,
    [measure.TARGET]: {
      tooltipValue: (entry: ChartDataPoint) => `${entry.targetLabel} ${getUnitIdFormatted(groupBy[0], entry.unitId as string)}`,
      visibility: 'always',
    } as PreprocessorValueConfig,
    [measure.MODE]: {
      tooltipValue: (entry: ChartDataPoint) => `${entry.modeLabel} ${getUnitIdFormatted(groupBy[0], entry.unitId as string)}`,
      visibility: 'always',
    } as PreprocessorValueConfig,
  };
  const config = typeConfigMap[type];
  if (!config) {
    throw new Error(`getProductionSpeedValueConfig unknown type: ${type}`);
  }
  return config;
}
