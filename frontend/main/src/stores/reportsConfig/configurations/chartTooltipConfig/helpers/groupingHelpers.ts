import type { ChartDataPoint, GroupingConfigFn, TooltipRowConfig, LabelTextConfig } from '@/stores/reportsConfig/configurations/chartTooltipConfig/types';
import { resolveIcon } from '@/helpers/tooltips/IconResolver';
import xAxisKey from '@/stores/reportsConfig/constants/xAxisKey';
import granularityType from '@/stores/reportsConfig/constants/granularity';
import configType from '@/stores/reportsConfig/constants/configType';

/**
 * Checks if data point is at the highest aggregation level.
 * @param data - Chart data point
 * @returns True if data has no nested groups
 */
export function isHighestLevel(data: ChartDataPoint): boolean {
  return !data.groups;
}

/**
 * Builds tooltip configuration for a grouping dimension.
 * @param id - Dimension identifier
 * @param _valueKey - Default value key for this dimension
 * @returns Function that generates tooltip row config for this dimension
 */
export function buildSubGroupTooltipConfig(id: string, _valueKey: string): GroupingConfigFn {
  return (groupBy: string[], index: number, data: ChartDataPoint, labelText: LabelTextConfig, cfgType: string): TooltipRowConfig => {
    let valueKey = _valueKey;

    // Special case: CHECKLIST chart uses different field name for entity groups
    if (cfgType === configType.CHECKLIST && _valueKey === 'entityGroupName') {
      valueKey = 'checklistGroupName';
    }

    let text: string | ((data: ChartDataPoint) => string) = labelText as string;
    let icon: string | null = resolveIcon({ key: id, groupBy, index });
    let color: string | ((data: ChartDataPoint) => string) | undefined = data.color as string;

    if (labelText && typeof labelText === 'object' && 'text' in labelText) {
      const { text: labelTextValue, icon: labelIcon, color: labelColor } = labelText;
      text = labelTextValue;
      if (labelIcon) {
        icon = labelIcon;
      }
      if (labelColor) {
        color = labelColor;
      }
    }

    return {
      text,
      tooltipValueKey: index > 0 ? valueKey : undefined,
      // No valueKey means automatically exempt from column filtering
      icon: icon ?? undefined,
      color,
    };
  };
}

export const groupByMap: Map<string, GroupingConfigFn> = new Map([
  [xAxisKey.ENTITY_ID, buildSubGroupTooltipConfig(xAxisKey.ENTITY_ID, 'entityName')],
  [xAxisKey.ENTITY_GROUP_ID, buildSubGroupTooltipConfig(xAxisKey.ENTITY_GROUP_ID, 'entityGroupName')],
  [xAxisKey.POSITION_ID, buildSubGroupTooltipConfig(xAxisKey.POSITION_ID, 'location')],
  [xAxisKey.STATION_ID, buildSubGroupTooltipConfig(xAxisKey.STATION_ID, 'station')],
  [xAxisKey.STATION_GROUP_ID, buildSubGroupTooltipConfig(xAxisKey.STATION_GROUP_ID, 'stationGroup')],
  [xAxisKey.FACTORY_ID, buildSubGroupTooltipConfig(xAxisKey.FACTORY_ID, 'factory')],
  [xAxisKey.SINGLE_OPERATOR, buildSubGroupTooltipConfig(xAxisKey.SINGLE_OPERATOR, 'singleOperator')],
  [xAxisKey.SHIFT_TEMPLATE, buildSubGroupTooltipConfig(xAxisKey.SHIFT_TEMPLATE, 'shiftTemplate')],
  [xAxisKey.PRODUCT_ID, buildSubGroupTooltipConfig(xAxisKey.PRODUCT_ID, 'product')],
  [xAxisKey.PRODUCT_GROUP_ID, buildSubGroupTooltipConfig(xAxisKey.PRODUCT_GROUP_ID, 'productGroup')],
  [xAxisKey.SKU, buildSubGroupTooltipConfig(xAxisKey.SKU, 'sku')],
  [xAxisKey.LOT_CODE, buildSubGroupTooltipConfig(xAxisKey.LOT_CODE, 'lotCode')],
  [xAxisKey.PRODUCTION_ORDER, buildSubGroupTooltipConfig(xAxisKey.PRODUCTION_ORDER, 'productionOrder')],
  [granularityType.DATE, buildSubGroupTooltipConfig(granularityType.DATE, 'xScaleValueFormatted')],
  [granularityType.DAYOFWEEK, buildSubGroupTooltipConfig(granularityType.DAYOFWEEK, 'xScaleValueFormatted')],
  [granularityType.WEEKOFYEAR, buildSubGroupTooltipConfig(granularityType.WEEKOFYEAR, 'xScaleValueFormatted')],
  [granularityType.QUARTER, buildSubGroupTooltipConfig(granularityType.QUARTER, 'xScaleValueFormatted')],
  [granularityType.STARTTIME, buildSubGroupTooltipConfig(granularityType.STARTTIME, 'xScaleValueFormatted')],
  [granularityType.MONTH, buildSubGroupTooltipConfig(granularityType.MONTH, 'xScaleValueFormatted')],
  [granularityType.YEAR, buildSubGroupTooltipConfig(granularityType.YEAR, 'xScaleValueFormatted')],
]);

/**
 * Retrieves tooltip configuration function for a grouping key.
 * @param key - Grouping dimension key
 * @returns Configuration function or undefined if not found
 */
export function getTooltipConfigByGroupBy(key: string): GroupingConfigFn | undefined {
  return groupByMap.get(key);
}
