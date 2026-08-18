import type { IconResolverParams, TooltipIconType } from '@/stores/reportsConfig/configurations/chartTooltipConfig/types';
import type { YAxisKey } from '@/stores/reportsConfig/constants/yAxisKey';
import type { XAxisKey } from '@/stores/reportsConfig/constants/xAxisKey';
import type { GranularityType } from '@/stores/reportsConfig/constants/granularity';

export const ICON_TYPES = {
  Y_AXIS: 'iconYAxis',
  Y_AXIS_2ND: 'icon2ndYAxis',
  X_AXIS: 'iconXAxis',
  XZ_AXIS: 'iconXZAxis',
  DOT: 'iconDot',
} as const satisfies Record<string, TooltipIconType | null>;

type GroupByValue = XAxisKey | GranularityType;

function getGroupingIcon(key: string, groupBy: GroupByValue[], index: number): TooltipIconType | null {
  const isCurrentGrouping = groupBy[index] === key;
  if (!isCurrentGrouping) {
    return null;
  }

  const isLastDimension = index === groupBy.length - 1;
  const isSecondDimension = index === 1;
  const hasMultipleGroupings = groupBy.length > 1;

  // RULE 1: Last grouping dimension → X-axis icon
  if (isLastDimension) {
    return ICON_TYPES.X_AXIS;
  }

  // RULE 2: Second dimension with multiple groupings → XZ-axis icon
  if (isSecondDimension && hasMultipleGroupings) {
    return ICON_TYPES.XZ_AXIS;
  }

  // RULE 3: Other dimensions with multiple groupings → Dot icon
  if (hasMultipleGroupings) {
    return ICON_TYPES.DOT;
  }

  return null;
}

function getAxisIcon(key: string, yAxis: YAxisKey | undefined, yAxisRight?: YAxisKey | null): TooltipIconType | null {
  // RULE 4: Primary Y-axis → Y-axis icon
  if (yAxis === key) {
    return ICON_TYPES.Y_AXIS;
  }

  // RULE 5: Secondary Y-axis → 2nd Y-axis icon
  if (yAxisRight && yAxisRight === key) {
    return ICON_TYPES.Y_AXIS_2ND;
  }

  return null;
}

/**
 * Decision matrix:
 * 1. Grouping dimensions (if index provided):
 *    - Last dimension → iconXAxis
 *    - Second dimension with multiple groupings → iconXZAxis
 *    - Other dimensions with multiple groupings → iconDot
 * 2. Primary Y-axis → iconYAxis
 * 3. Secondary Y-axis → icon2ndYAxis
 * 4. Otherwise → null
 */
export function resolveIcon({
  key,
  groupBy,
  yAxis,
  yAxisRight = null,
  index,
}: IconResolverParams): TooltipIconType | null {
  if (typeof index === 'number') {
    const groupingIcon = getGroupingIcon(key, groupBy, index);
    if (groupingIcon) {
      return groupingIcon;
    }
  }

  return getAxisIcon(key, yAxis, yAxisRight);
}

export default {
  resolveIcon,
  ICON_TYPES,
};
