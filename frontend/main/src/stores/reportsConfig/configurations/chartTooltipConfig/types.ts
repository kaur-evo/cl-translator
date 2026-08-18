import type { ConfigType } from '@/stores/reportsConfig/constants/configType';
import type { GranularityType } from '@/stores/reportsConfig/constants/granularity';
import type { YAxisKey } from '@/stores/reportsConfig/constants/yAxisKey';
// eslint-disable-next-line import/order
import type { XAxisKey } from '@/stores/reportsConfig/constants/xAxisKey';

/**
 * Tooltip-specific types for the chartTooltipConfig module.
 *
 * Chart data point types have been moved to @/stores/reportsConfig/types.ts
 * as they are generic data structures used throughout the reportsConfig module,
 * not specific to tooltip configuration.
 */

// ==================== RE-EXPORTED CHART DATA POINT TYPES ====================
// Re-export for backward compatibility
export type {
  ChartDataPoint,
  ChartDataPointBase,
  ChartDataPointForConfig,
  OEEDataPoint,
  OEEDataPointExtension,
  QuantityDataPoint,
  QuantityDataPointExtension,
  ProductionSpeedDataPoint,
  ProductionSpeedDataPointExtension,
  DowntimeDataPoint,
  DowntimeDataPointExtension,
  SpeedlossDataPoint,
  SpeedlossDataPointExtension,
  ScrapDataPoint,
  ScrapDataPointExtension,
  TimeUsageDataPoint,
  TimeUsageDataPointExtension,
  ChecklistDataPoint,
  ChecklistDataPointExtension,
  TotalsData,
} from '@/stores/reportsConfig/types';

// Import for use in this file
import type { ChartDataPoint, ChartDataPointForConfig, TotalsData } from '@/stores/reportsConfig/types';

// ==================== TOOLTIP-SPECIFIC TYPES ====================

export type LabelTextConfig = string | {
  text: string | ((data: ChartDataPoint) => string);
  icon?: string;
  color?: string | ((data: ChartDataPoint) => string);
};

export type TooltipIconType = 'iconXAxis' | 'iconXZAxis' | 'iconYAxis' | 'icon2ndYAxis' | 'iconDot';

/**
 * Controls how a row participates in column filtering.
 *
 * ## Visibility Mechanisms (in order of evaluation)
 *
 * 1. **No valueKey**: Row is exempt from column filtering (always shown if not hidden)
 * 2. **isPrimary: true**: Row is exempt from column filtering (always shown if not hidden)
 * 3. **visibility: 'always'**: Row is exempt from column filtering
 * 4. **visibility: 'conditional'**: Row is exempt from column filtering (visibility controlled by isHidden)
 * 5. **visibility: 'column-filtered'** (default): Row is shown only if valueKey is in visibleColumns
 *
 * After column filtering, `filterHidden()` removes all rows where `isHidden: true`.
 */
export type VisibilityType = 'always' | 'column-filtered' | 'conditional';

/**
 * Configuration for a single tooltip row.
 */
export interface TooltipRowConfig {
  valueKey?: string;
  tooltipValueKey?: string;
  tooltipSecondaryValueKey?: string;
  text?: string | number | ((data: ChartDataPoint) => string);
  icon?: string | ((data: ChartDataPoint) => string) | null;
  color?: string | ((data: ChartDataPoint) => string);
  isPrimary?: boolean;
  isHidden?: boolean;
  visibility?: VisibilityType;
  tooltipValue?: string | ((data: ChartDataPoint) => string);
}
export interface IconResolverParams {
  key: string;
  groupBy: (XAxisKey | GranularityType)[];
  yAxis?: YAxisKey;
  yAxisRight?: YAxisKey | null;
  index?: number;
}
export interface PreprocessorLabelConfig {
  text?: string | number | ((data: ChartDataPoint) => string);
  icon?: string;
  color?: string | ((data: ChartDataPoint) => string);
  isPrimary?: boolean;
}
export interface PreprocessorValueConfig {
  tooltipValueKey?: string;
  tooltipSecondaryValueKey?: string;
  tooltipValue?: string | ((data: ChartDataPoint) => string);
  yAxisValueKey?: string;
  visibility?: VisibilityType;
  isHidden?: boolean;
}
/**
 * Main configuration parameters for chart tooltips.
 * Now supports generic type parameter for chart-specific type safety.
 *
 * @template T - The ConfigType constant for type-safe data access
 *
 */
export interface ChartConfigParams<T extends ConfigType = ConfigType> {
  data: ChartDataPointForConfig<T>;
  groupBy: (XAxisKey | GranularityType)[];
  cfgType: T;
  granularity: GranularityType;
  yAxis: YAxisKey;
  yAxisRight?: YAxisKey | null;
  visibleColumns?: string[];
  chartLegendState?: string[];
  totals?: TotalsData;
}

export interface AddGroupingRowsParams {
  data: ChartDataPoint;
  groupBy: (XAxisKey | GranularityType)[];
  cfgType: ConfigType;
  granularity: GranularityType;
  yAxis?: YAxisKey;
  chartLegendState?: string[];
  totals?: TotalsData;
}

export type GroupingConfigFn = (
  groupBy: (XAxisKey | GranularityType)[],
  index: number,
  data: ChartDataPoint,
  labelText: LabelTextConfig,
  cfgType: ConfigType,
) => TooltipRowConfig;
