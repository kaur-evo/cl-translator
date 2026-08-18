import type { TooltipRowConfig, AddGroupingRowsParams, LabelTextConfig, ChartDataPoint } from '@/stores/reportsConfig/configurations/chartTooltipConfig/types';
import type { GranularityType } from '@/stores/reportsConfig/constants/granularity';
import type { XAxisKey } from '@/stores/reportsConfig/constants/xAxisKey';
import { groupByMap, isHighestLevel } from '@/stores/reportsConfig/configurations/chartTooltipConfig/helpers/groupingHelpers';
import { getEntityLabelMap } from '@/stores/reportsConfig/configurations/labelsByChartTypeAndGrouping';
import { getAlternativePrimaryLabelConfig, getTooltipPrimaryValueConfig } from '@/stores/reportsConfig/configurations/chartTooltipConfig/helpers/preprocessorHelpers';
import granularityType from '@/stores/reportsConfig/constants/granularity';
import xAxisKey from '@/stores/reportsConfig/constants/xAxisKey';

type GroupByValue = XAxisKey | GranularityType;

/**
 * Adjusts groupBy array based on data aggregation level and granularity.
 * @param data - Chart data point
 * @param groupBy - Original grouping dimensions
 * @param granularity - Time granularity
 * @returns Modified groupBy array for tooltip display
 */
function determineModifiedGroupBy(
  data: ChartDataPoint,
  groupBy: GroupByValue[],
  granularity: GranularityType,
): GroupByValue[] {
  const isAtHighestLevel = isHighestLevel(data);

  if (isAtHighestLevel) {
    if (granularity === granularityType.TOTAL) {
      return [...groupBy, xAxisKey.ENTITY_GROUP_ID].reverse();
    }
    if (groupBy.length > 1 && groupBy[1] !== undefined) {
      return [xAxisKey.ENTITY_GROUP_ID, groupBy[1], granularity];
    }
    return [xAxisKey.ENTITY_GROUP_ID, granularity];
  }

  if (granularity === granularityType.TOTAL && groupBy[0] !== undefined) {
    return [groupBy[0]];
  }
  return [granularity];
}

/**
 * Builder for constructing tooltip row configurations.
 * Provides a fluent API for building, filtering, and validating tooltip rows.
 */
export default class TooltipConfigBuilder {
  private rows: TooltipRowConfig[];

  /**
   * Creates a new tooltip configuration builder.
   * @param chartType - The chart type identifier
   */
  constructor(chartType: string) {
    if (!chartType || typeof chartType !== 'string') {
      throw new Error(
        `chartType must be a non-empty string, received: ${typeof chartType}`,
      );
    }

    this.rows = [];
  }

  /**
   * Adds standard grouping rows based on chart dimensions and hierarchy.
   * @param params - Configuration including data, grouping, chart type, and axes
   * @returns This builder for chaining
   */
  addStandardGroupingRows(params: AddGroupingRowsParams): this {
    const { data, groupBy, cfgType, granularity, yAxis } = params;
    const entityLabelMap = getEntityLabelMap()[cfgType] || {};
    const modifiedGroupBy = determineModifiedGroupBy(data, groupBy, granularity);

    modifiedGroupBy.forEach((group, index) => {
      const getGroupRowConfig = groupByMap.get(group);
      if (getGroupRowConfig) {
        const labelMap = entityLabelMap as Record<string, LabelTextConfig>;
        const label = labelMap[group] ?? group;
        const groupRowConfig = getGroupRowConfig(modifiedGroupBy, index, data, label, cfgType);
        if (groupRowConfig && !groupRowConfig.isHidden) {
          if (index === 0) {
            const alternativePrimaryLabelConfig = getAlternativePrimaryLabelConfig({ cfgType, data });
            if (alternativePrimaryLabelConfig) {
              this.addRow(alternativePrimaryLabelConfig);
            } else {
              this.addRow(groupRowConfig);
            }
            this.addRow(getTooltipPrimaryValueConfig(data, cfgType, yAxis));
          } else {
            this.addRow(groupRowConfig);
          }
        }
      }
    });

    return this;
  }

  /**
   * Adds a single row to the configuration.
   * @param row - The tooltip row configuration
   * @returns This builder for chaining
   */
  addRow(row: TooltipRowConfig): this {
    this.rows.push(row);
    return this;
  }

  /**
   * Adds multiple rows to the configuration.
   * @param rows - Array of tooltip row configurations
   * @returns This builder for chaining
   */
  addRows(rows: TooltipRowConfig[]): this {
    if (!Array.isArray(rows)) {
      throw new TypeError(
        `Expected an array, received: ${typeof rows}`,
      );
    }

    rows.forEach((row) => {
      this.addRow(row);
    });

    return this;
  }

  /**
   * Conditionally executes a callback based on a condition.
   * @param condition - Boolean or function that returns boolean
   * @param callback - Function to execute if condition is true
   * @returns This builder for chaining
   */
  when(condition: boolean | (() => boolean), callback: (builder: this) => void): this {
    const shouldExecute = typeof condition === 'function' ? condition() : condition;

    if (shouldExecute) {
      if (typeof callback !== 'function') {
        throw new TypeError(
          `Callback must be a function, received: ${typeof callback}`,
        );
      }
      callback(this);
    }

    return this;
  }

  /**
   * Filters rows based on visible columns.
   * @param visibleColumns - Array of column keys that are visible
   * @returns This builder for chaining
   */
  filterByColumns(visibleColumns: string[]): this {
    if (!Array.isArray(visibleColumns)) {
      throw new TypeError(
        `visibleColumns must be an array, received: ${typeof visibleColumns}`,
      );
    }

    this.rows = this.rows.filter((row) => {
      if (!row.valueKey) {
        return true;
      }

      if (row.isPrimary) {
        return true;
      }

      const visibility = row.visibility || 'column-filtered';

      if (visibility === 'always') {
        return true;
      }

      if (visibility === 'conditional') {
        return true; // Controlled by isHidden flag instead
      }

      return visibleColumns.includes(row.valueKey);
    });

    return this;
  }

  /**
   * Removes rows where isHidden is true.
   * @returns This builder for chaining
   */
  filterHidden(): this {
    this.rows = this.rows.filter((row) => !row.isHidden);
    return this;
  }

  /**
   * Builds and returns the final tooltip configuration.
   * @returns Array of tooltip row configurations
   */
  build(): TooltipRowConfig[] {
    if (this.rows.length === 0) {
      throw new Error(
        'Configuration must have at least one row',
      );
    }

    return this.rows;
  }

  get rowCount(): number {
    return this.rows.length;
  }

  /**
   * Clears all rows from the builder.
   * @returns This builder for chaining
   */
  clear(): this {
    this.rows = [];
    return this;
  }
}
