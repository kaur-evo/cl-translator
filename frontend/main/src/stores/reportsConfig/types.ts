/**
 * Core types for the reportsConfig module.
 *
 * This file contains types for data structures created by DataMap classes
 * in the maps/ directory. These types are used throughout the reportsConfig
 * module, including tooltips, charts, and data processing.
 */

import type { ConfigType } from '@/stores/reportsConfig/constants/configType';
import configType from '@/stores/reportsConfig/constants/configType';

// ==================== CHART DATA POINT TYPES ====================

/**
 * Base chart data point interface containing properties common to ALL chart types.
 *
 * This interface represents the data structure created by DataMap classes and consumed
 * throughout the reportsConfig module. It uses an index signature to allow dynamic
 * properties from JavaScript DataMap sources, while explicitly typing all known
 * common properties for better IDE support and type safety.
 */
export interface ChartDataPointBase {
  /** Allows dynamic properties from data source - maintains backward compatibility */
  [key: string]: unknown;

  // ===== STRUCTURAL PROPERTIES =====
  /** Nested data points for drill-down (absence indicates highest aggregation level) */
  groups?: ChartDataPoint[];
  /** Pre-formatted label for the X-axis value */
  tooltipXLabel?: string;
  /** Color associated with this data point */
  color?: string;
  /** Indicates if data is real (vs fake/placeholder data) */
  defined?: boolean;
  /** Indicates if data is fake/placeholder */
  isFake?: boolean;
  /** Chart x-axis measure label */
  measureLabel?: string;
  /** Table time column label */
  tableTimeLabel?: string;
  /** X-axis scale value (date, number, or string depending on granularity) */
  xScaleValue?: number | string | Date;
  /** Formatted x-axis scale value */
  xScaleValueFormatted?: string;
  /** Grouping key for frontend grouping */
  groupingKey?: string;
  /** Indicates no data available */
  noData?: boolean;

  // ===== GROUPING DIMENSION VALUES (present in all/most chart types) =====
  entityName?: string;
  entityId?: string | string[];
  entityKey?: string;
  entityGroupName?: string;
  entityGroupId?: string | string[];

  // Station/Factory dimensions
  station?: string;
  stationId?: string | string[];
  stationGroup?: string;
  stationGroupId?: string | string[];
  factory?: string;
  factoryId?: string | string[];

  // Product dimensions
  product?: string;
  productId?: string | string[];
  productGroup?: string;
  productGroupId?: string | string[];
  sku?: string;
  skuLabel?: string;

  // Operator dimensions
  operator?: string;
  singleOperator?: string;
  operatorId?: string | string[];

  // Shift dimensions
  shiftTemplate?: string;
  shiftTemplateLabel?: string;

  // Other dimensions
  location?: string;
  positionId?: string | string[];
  notes?: string;
  notesCount?: number;

  // ===== UNIT IDENTIFIERS =====
  unitId?: string;
  alternativeUnitId?: string;

  // ===== COMMON METRIC FIELDS =====
  value?: number | Date;
  entityCount?: number;
  entityCountLabel?: string;
  valueLabel?: string;

  // ===== GROUPING METADATA =====
  itemGroupingId?: string;

  // ===== SPECIAL KEYS =====
  /** Preprocessed group identifier for charts like OEE, Quantity, TimeUsage, Checklist */
  __preprocessedGroupId?: string;
}

// ==================== CHART-SPECIFIC EXTENSION INTERFACES ====================

/**
 * OEE chart-specific properties.
 * Includes availability, performance, quality metrics and their formatted versions.
 */
export interface OEEDataPointExtension {
  // Core OEE metrics
  oee?: number;
  availability?: number;
  performance?: number;
  quality?: number;
  technicalAvailability?: number;
  ooe?: number;
  teep?: number;

  // Time metrics
  operatingTime?: number;
  shiftTime?: number;
  plannedTime?: number;
  productionTime?: number;
  technicalStop?: number;
  calendarTime?: number;

  // Quantity metrics
  idealPerformanceQty?: number;
  scrapQty?: number;
  qty?: number;
  rowProducedQty?: number;
  rowProducedAltQty?: number;

  // Formatted metrics
  oeeFormatted?: string;
  availabilityFormatted?: string;
  performanceFormatted?: string;
  qualityFormatted?: string;
  technicalAvailabilityFormatted?: string;
  ooeFormatted?: string;
  teepFormatted?: string;
  operatingTimeFormatted?: string;
  operatingTimePctFormatted?: string;
  shiftTimeFormatted?: string;
  plannedTimeFormatted?: string;
  rowProducedQtyFormatted?: string;
  rowProducedAltQtyFormatted?: string;

  // Trend value
  trendValue?: number;

  // Group-specific properties (subset - used for calculations)
  oeeGroupTotalQty?: number;
  oeeGroupTotalAltQty?: number;
  oeeGroupPlannedStopNotIncludedInOEE?: number;
  oeeGroupCalendarTimeSec?: number;

  technicalGroupTechnicalStop?: number;
  technicalGroupPlannedTime?: number;
  technicalGroupTotalQty?: number;
  technicalGroupTotalAltQty?: number;
  technicalGroupPlannedStopNotIncludedInOEE?: number;
  technicalGroupCalendarTimeSec?: number;

  availabilityGroupProductionTime?: number;
  availabilityGroupPlannedTime?: number;
  availabilityGroupTotalQty?: number;
  availabilityGroupTotalAltQty?: number;
  availabilityGroupRowProducedQty?: number;
  availabilityGroupPlannedStopNotIncludedInOEE?: number;
  availabilityGroupCalendarTimeSec?: number;

  performanceGroupQty?: number;
  performanceGroupIdealPerfQty?: number;
  performanceGroupTotalQty?: number;
  performanceGroupTotalAltQty?: number;
  performanceGroupRowProducedQty?: number;
  performanceGroupPlannedStopNotIncludedInOEE?: number;
  performanceGroupCalendarTimeSec?: number;

  qualityGroupScrapQty?: number;
  qualityGroupQty?: number;
  qualityGroupTotalQty?: number;
  qualityGroupTotalAltQty?: number;
  qualityGroupRowProducedQty?: number;
  qualityGroupPlannedStopNotIncludedInOEE?: number;
  qualityGroupCalendarTimeSec?: number;

  definedScrapQty?: number;
  definedQty?: number;

  // Date range for datapoint calculations
  datapointDateRange?: unknown;
}

/**
 * Quantity chart-specific properties.
 * Includes ideal, scrap, good, and potential quantities with loss calculations.
 */
export interface QuantityDataPointExtension {
  altValue?: number;

  // Quantity metrics
  idealQty?: number;
  idealAltQty?: number;
  scrapQty?: number;
  scrapAltQty?: number;
  goodQty?: number;
  goodAltQty?: number;
  rowProducedQty?: number;
  rowProducedAltQty?: number;
  potentialQty?: number;
  potentialAltQty?: number;

  // Loss calculations
  performanceLossQty?: number;
  performanceLossAltQty?: number;
  availabilityLossQty?: number;
  availabilityLossAltQty?: number;

  // Percentages
  scrapQtyPct?: number;
  goodQtyPct?: number;

  // Formatted values
  idealQtyFormatted?: string;
  idealAltQtyFormatted?: string;
  scrapQtyFormatted?: string;
  scrapAltQtyFormatted?: string;
  goodQtyFormatted?: string;
  goodAltQtyFormatted?: string;
  rowProducedQtyFormatted?: string;
  rowProducedAltQtyFormatted?: string;
  potentialQtyFormatted?: string;
  potentialAltQtyFormatted?: string;
  performanceLossQtyFormatted?: string;
  performanceLossAltQtyFormatted?: string;
  availabilityLossQtyFormatted?: string;
  availabilityLossAltQtyFormatted?: string;
  scrapQtyPctFormatted?: string;
  goodQtyPctFormatted?: string;
  potentialQtyPctFormatted?: string;

  // Group-specific properties
  scrapGroupTotalQty?: number;
  scrapGroupTotalAltQty?: number;
  scrapGroupScrapQty?: number;
  scrapGroupScrapAltQty?: number;
  scrapGroupIdealQty?: number;
  scrapGroupIdealAltQty?: number;
  scrapGroupIdealPerformanceQty?: number;
  scrapGroupIdealPerformanceAltQty?: number;

  goodGroupTotalQty?: number;
  goodGroupTotalAltQty?: number;
  goodGroupGoodQty?: number;
  goodGroupGoodAltQty?: number;
  goodGroupIdealQty?: number;
  goodGroupIdealAltQty?: number;
  goodGroupIdealPerformanceQty?: number;
  goodGroupIdealPerformanceAltQty?: number;

  potentialGroupTotalQty?: number;
  potentialGroupTotalAltQty?: number;
  potentialGroupIdealQty?: number;
  potentialGroupIdealAltQty?: number;
  potentialGroupIdealPerformanceQty?: number;
  potentialGroupIdealPerformanceAltQty?: number;
}

/**
 * Production Speed chart-specific properties.
 * Includes range binning and speed vs target comparisons.
 */
export interface ProductionSpeedDataPointExtension {
  rangeKey?: string;
  rangeStart?: number;
  rangeEnd?: number;
  isFasterThanTarget?: boolean;
  target?: number | string;
  mode?: number | string;
  productionCount?: number;
  productionTime?: number;
  productionTimeDt?: Date;
  binOrder?: number;
  isMarker?: boolean;
  containsTarget?: boolean;
  containsMode?: boolean;
  belowTargetCount?: number;

  // Formatted labels
  targetLabel?: string;
  modeLabel?: string;
  productionCountLabel?: string;
  productionTimeLabel?: string;
}

/**
 * Downtime (Comment) chart-specific properties.
 * Includes stop duration, count, and type information.
 */
export interface DowntimeDataPointExtension {
  valueSec?: number;
  avgDuration?: number;
  avgDurationVal?: Date;
  avgDurationFormatted?: string;
  entitySubType?: string;
  entityPctPlannedTime?: number;
  entityPctPlannedTimeLabel?: string;
  totalPlannedTime?: number;
  rowPlannedTime?: number;
  idealQty?: number;
  idealAltQty?: number;
  idealQtyFormatted?: string;
  idealAltQtyFormatted?: string;
  includedInOeeStops?: boolean;
}

/**
 * Speedloss (Performance Comment) chart-specific properties.
 * Extends downtime with loss quantity calculations.
 */
export interface SpeedlossDataPointExtension extends DowntimeDataPointExtension {
  lossQty?: number;
  lossAltQty?: number;
  lossQtyFormatted?: string;
  lossAltQtyFormatted?: string;
  rowProducedQty?: number;
  rowProducedAltQty?: number;
  performancePositionId?: string | string[];
  date?: string;
}

/**
 * Scrap Reason chart-specific properties.
 * Includes scrap quantities, percentages, and duration.
 */
export interface ScrapDataPointExtension {
  entityAltCount?: number;
  scrapQty?: number;
  scrapAltQty?: number;
  scrapQtyPct?: number;
  scrapAltQtyPct?: number;
  scrapDuration?: number;
  totalProducedQty?: number;
  totalProducedAltQty?: number;
  rowProducedQty?: number;
  rowProducedAltQty?: number;
  goodProduction?: number;
  totalPlannedTime?: number;
  rowPlannedTime?: number;
  entityPctPlannedTime?: number;

  // Formatted values
  scrapQtyFormatted?: string;
  scrapAltQtyFormatted?: string;
  scrapQtyPctFormatted?: string;
  scrapAltQtyPctFormatted?: string;
  scrapDurationFormatted?: string;
  goodProductionFormatted?: string;
  totalQtyFormatted?: string;
  totalAltQtyFormatted?: string;
  entityPctPlannedTimeLabel?: string;

  // Additional metadata
  xAxisKey?: string;
  entriesCount?: number;
}

/**
 * Time Usage chart-specific properties.
 * Includes breakdown of time into good, slow, planned, unplanned, uncommented categories.
 */
export interface TimeUsageDataPointExtension {
  pctOfPlannedTime?: number;
  duration?: number | Date;
  durationFormatted?: string;

  // Time breakdown
  goodProduction?: number;
  slowProduction?: number;
  plannedStop?: number;
  unplannedStop?: number;
  uncommentedStop?: number;
  plannedStopIncludedInOEE?: number;
  plannedStopNotIncludedInOEE?: number;
  shiftTime?: number;
  operatingTime?: number;
  plannedTime?: number;

  // Percentages
  goodDurPct?: number;
  slowPct?: number;
  plannedPct?: number;
  unplannedPct?: number;
  uncommentedPct?: number;

  // Formatted values with multiple decimal place variants
  'valueFormatted-0'?: string;
  'valueFormatted-1'?: string;
  'valueFormatted-2'?: string;
  'pctOfPlannedTimeFormatted-0'?: string;
  'pctOfPlannedTimeFormatted-1'?: string;
  'pctOfPlannedTimeFormatted-2'?: string;

  shiftTimeFormatted?: string;
  operatingTimeFormatted?: string;
  operatingTimePctFormatted?: string;
  goodDurPctFormatted?: string;
  slowPctFormatted?: string;
  plannedPctFormatted?: string;
  plannedIncludedInOEEPctFormatted?: string;
  plannedNotIncludedInOEEPctFormatted?: string;
  unplannedPctFormatted?: string;
  uncommentedPctFormatted?: string;

  goodDurFormatted?: string;
  slowFormatted?: string;
  plannedFormatted?: string;
  plannedIncludedInOEEFormatted?: string;
  plannedNotIncludedInOEEFormatted?: string;
  unplannedFormatted?: string;
  uncommentedFormatted?: string;
  plannedTimeFormatted?: string;

  // Tooltip values
  goodProductionTooltipValue?: string;
  slowTooltipValue?: string;
  plannedIncludedInOEETooltipValue?: string;
  plannedNotIncludedInOEETooltipValue?: string;
  unplannedTooltipValue?: string;
  uncommentedTooltipValue?: string;

  // Group-specific properties (subset)
  goodGroupPlannedStop?: number;
  slowGroupPlannedStop?: number;
  plannedStopGroupPlannedStop?: number;
  unplannedStopGroupPlannedStop?: number;
  uncommentedStopGroupPlannedStop?: number;
  plannedStopInclGroupPlannedStop?: number;
  plannedStopNotInclGroupPlannedStop?: number;

  goodGroupPlannedStopIncludedInOEE?: number;
  slowGroupPlannedStopIncludedInOEE?: number;
  plannedStopGroupPlannedStopIncludedInOEE?: number;
  unplannedStopGroupPlannedStopIncludedInOEE?: number;
  uncommentedStopGroupPlannedStopIncludedInOEE?: number;
  plannedStopInclGroupPlannedStopIncludedInOEE?: number;
  plannedStopNotInclGroupPlannedStopIncludedInOEE?: number;

  goodGroupPlannedStopNotIncludedInOEE?: number;
  slowGroupPlannedStopNotIncludedInOEE?: number;
  plannedStopGroupPlannedStopNotIncludedInOEE?: number;
  unplannedStopGroupPlannedStopNotIncludedInOEE?: number;
  uncommentedStopGroupPlannedStopNotIncludedInOEE?: number;
  plannedStopInclGroupPlannedStopNotIncludedInOEE?: number;
  plannedStopNotInclGroupPlannedStopNotIncludedInOEE?: number;

  goodGroupPlannedTime?: number;
  slowGroupPlannedTime?: number;
  plannedStopGroupPlannedTime?: number;
  unplannedStopGroupPlannedTime?: number;
  uncommentedStopGroupPlannedTime?: number;
  plannedStopInclGroupPlannedTime?: number;
  plannedStopNotInclGroupPlannedTime?: number;

  slowGroupSlowProduction?: number;
  goodGroupGoodProduction?: number;
  unplannedStopGroupUnplannedStop?: number;
  uncommentedStopGroupUncommentedStop?: number;

  stops?: unknown;
}

/**
 * Checklist chart-specific properties.
 * Includes successful, unsuccessful, and missed check counts and percentages.
 */
export interface ChecklistDataPointExtension {
  checklistGroupName?: string;
  checklistpinId?: string;
  checklistpin?: string;
  checkType?: string;
  doneBy?: string;

  // Check counts
  missedChecks?: number;
  successfulChecks?: number;
  unsuccessfulChecks?: number;
  entityCountPct?: number;

  // Time metrics
  avgTime?: number;
  avgTimeVal?: Date;
  avgTimeFormatted?: string;
  medianCheckTime?: number | string;
  medianCheckTimeFormatted?: string;

  // Formatted percentages with decimal variants
  entityCountPctFormatted?: string;
  'entityCountPctFormatted-0'?: string;
  'entityCountPctFormatted-1'?: string;
  'entityCountPctFormatted-2'?: string;
  missedChecksPctFormatted?: string;
  successfulChecksPctFormatted?: string;
  unsuccessfulChecksPctFormatted?: string;

  // Group-specific properties
  successfulGroupTotalQty?: number;
  successfulGroupSuccessfulQty?: number;
  successfulGroupSuccessfulTime?: number;
  unsuccessfulGroupTotalQty?: number;
  unsuccessfulGroupUnsuccessfulQty?: number;
  unsuccessfulGroupUnsuccessfulTime?: number;
  missedGroupTotalQty?: number;
  missedGroupMissedQty?: number;
  missedGroupMissedTime?: number;
}

// ==================== GENERIC TYPE SYSTEM ====================

/**
 * Generic ChartDataPoint type that can be used with or without chart-specific extensions.
 *
 * @template TExtension - Optional chart-specific extension interface
 *
 * @example
 * // Generic usage (backward compatible)
 * const data: ChartDataPoint = { ... };
 *
 * // With OEE-specific typing
 * const oeeData: ChartDataPoint<OEEDataPointExtension> = { ... };
 * // or using the convenience alias:
 * const oeeData: OEEDataPoint = { ... };
 */
export type ChartDataPoint<TExtension = {}> = ChartDataPointBase & TExtension;

/**
 * Convenience type aliases for each chart type.
 * These provide chart-specific typing without needing to specify the generic parameter.
 */
export type OEEDataPoint = ChartDataPoint<OEEDataPointExtension>;
export type QuantityDataPoint = ChartDataPoint<QuantityDataPointExtension>;
export type ProductionSpeedDataPoint = ChartDataPoint<ProductionSpeedDataPointExtension>;
export type DowntimeDataPoint = ChartDataPoint<DowntimeDataPointExtension>;
export type SpeedlossDataPoint = ChartDataPoint<SpeedlossDataPointExtension>;
export type ScrapDataPoint = ChartDataPoint<ScrapDataPointExtension>;
export type TimeUsageDataPoint = ChartDataPoint<TimeUsageDataPointExtension>;
export type ChecklistDataPoint = ChartDataPoint<ChecklistDataPointExtension>;

/**
 * Helper type to get the appropriate ChartDataPoint type based on ConfigType.
 * Useful for adding type parameters to functions that receive a cfgType.
 *
 * @template T - The ConfigType constant
 *
 * @example
 * function processData<T extends ConfigType>(
 *   data: ChartDataPointForConfig<T>,
 *   cfgType: T
 * ) {
 *   // data is now correctly typed based on cfgType
 * }
 */
export type ChartDataPointForConfig<T extends ConfigType>
  = T extends typeof configType.OEE ? OEEDataPoint
    : T extends typeof configType.QUANTITY ? QuantityDataPoint
      : T extends typeof configType.PRODUCTION_SPEED ? ProductionSpeedDataPoint
        : T extends typeof configType.DOWNTIME ? DowntimeDataPoint
          : T extends typeof configType.SPEEDLOSS ? SpeedlossDataPoint
            : T extends typeof configType.SCRAPREASON ? ScrapDataPoint
              : T extends typeof configType.TIME_USAGE ? TimeUsageDataPoint
                : T extends typeof configType.CHECKLIST ? ChecklistDataPoint
                  : ChartDataPoint; // Fallback for unknown types

// ==================== AGGREGATED DATA TYPES ====================

/** Aggregated totals data for percentage calculations (used in Production Speed tooltips) */
export interface TotalsData {
  [key: string]: unknown;
  productionCount?: number;
  productionTime?: number;
}
