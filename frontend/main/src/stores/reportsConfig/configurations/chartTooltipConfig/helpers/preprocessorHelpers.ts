/** Helper functions for preprocessed chart types (OEE, Quantity, TimeUsage, Checklist) */

import type { PreprocessorLabelConfig, PreprocessorValueConfig, ChartDataPoint } from '@/stores/reportsConfig/configurations/chartTooltipConfig/types';
import configType from '@/stores/reportsConfig/constants/configType';
import specialKey from '@/stores/reportsConfig/constants/specialKey';
import { getOEELabelConfig, getOEEValueConfig } from '@/stores/reportsConfig/configurations/chartTooltipConfig/OEETooltipBaseConfig';
import { getQuantityLabelConfig, getQuantityValueConfig } from '@/stores/reportsConfig/configurations/chartTooltipConfig/quantityTooltipBaseConfig';
import { getTimeUsageLabelConfig, getTimeUsageValueConfig } from '@/stores/reportsConfig/configurations/chartTooltipConfig/timeUsageTooltipBaseConfig';
import { getChecklistLabelConfig, getChecklistValueConfig } from '@/stores/reportsConfig/configurations/chartTooltipConfig/checklistTooltipBaseConfig';

export const preProcessedCharts: Set<string> = new Set([
  configType.OEE,
  configType.QUANTITY,
  configType.TIME_USAGE,
  configType.CHECKLIST,
]);

export const tooltipValueConfigMap: Map<string, (type: string, yAxis?: string) => PreprocessorValueConfig> = new Map([
  [configType.OEE, getOEEValueConfig],
  [configType.QUANTITY, getQuantityValueConfig],
  [configType.TIME_USAGE, getTimeUsageValueConfig],
  [configType.CHECKLIST, getChecklistValueConfig],
]);

export const tooltipLabelConfigMap: Map<string, (type: string, yAxis?: string) => PreprocessorLabelConfig> = new Map([
  [configType.OEE, getOEELabelConfig],
  [configType.QUANTITY, getQuantityLabelConfig],
  [configType.TIME_USAGE, getTimeUsageLabelConfig],
  [configType.CHECKLIST, getChecklistLabelConfig],
]);

export function getTooltipPrimaryValueConfig(data: ChartDataPoint, cfgType: string, yAxis?: string): { text: string; isPrimary: boolean } {
  let text = data.tooltipXLabel;

  // For preprocessed charts at highest level, dynamically determine the value to show
  if (preProcessedCharts.has(cfgType) && !data.groups) {
    const currentGroupKey = data[specialKey.PREPROCESSED_GROUP_ID_KEY] as string;
    const currentConfigFn = tooltipValueConfigMap.get(cfgType);
    if (currentConfigFn) {
      const currentValueKey = currentConfigFn(currentGroupKey, yAxis).tooltipValueKey;
      if (currentValueKey) {
        text = data[currentValueKey] as string;
      }
    }
  }

  return {
    text: text ?? '',
    isPrimary: true, // isPrimary rows are automatically exempt from column filtering
  };
}

export function getAlternativePrimaryLabelConfig({
  cfgType,
  data,
}: {
  cfgType: string;
  data: ChartDataPoint;
}): PreprocessorLabelConfig | null {
  // Only applies to preprocessed charts at highest aggregation level
  if (preProcessedCharts.has(cfgType) && !data.groups) {
    const currentGroupKey = data[specialKey.PREPROCESSED_GROUP_ID_KEY] as string;
    const currentConfigFn = tooltipLabelConfigMap.get(cfgType);
    if (currentConfigFn) {
      const currentConfig = currentConfigFn(currentGroupKey);
      // No valueKey means automatically exempt from column filtering
      return currentConfig;
    }
  }

  return null;
}
