/**
 * @file TooltipRenderer
 * @description Static utility methods for rendering tooltip data
 * Extracted from ReportsChart.js to make tooltip logic reusable and testable
 */

import { isString, isFunction } from 'lodash';

import type { TooltipRowConfig, ChartDataPoint, ChartConfigParams } from '@/stores/reportsConfig/configurations/chartTooltipConfig/types';

export type DynamicTooltipValue = string | ((data: ChartDataPoint) => string) | undefined;

export interface TooltipParamRow {
  key?: string;
  value?: string | number;
  secondaryValue?: string | number;
  color?: string;
  icon?: string | null;
  isPrimary?: boolean;
}

export interface TooltipTemplateParams {
  paramRows: TooltipParamRow[];
  useAxisIcons: boolean;
}

export type TooltipTemplateFn = (params: TooltipTemplateParams) => string;

export type TooltipConfigFn = (options: ChartConfigParams & { data: ChartDataPoint }) => TooltipRowConfig[];

export interface GenerateTooltipOptions {
  cfgType: string;
  groupBy: string[];
  yAxis: string;
  yAxisRight?: string | null;
  granularity?: string;
  chartLegendState?: string[];
  totals?: Record<string, unknown>;
  visibleColumns?: string[];
}

/**
 * Extracts tooltip data from D3 event data object
 *
 * @param d - D3 event data (may have various shapes depending on chart type)
 * @returns The data object or null if no valid data found
 */
export function getTooltipData(d: unknown): ChartDataPoint | null {
  if (d && typeof d === 'object' && 'data' in d) {
    const { data } = d as { data: unknown };
    if (data) {
      return data as ChartDataPoint;
    }
  }

  if (d && typeof d === 'object' && 0 in d) {
    const firstElement = (d as { 0: unknown })[0];
    if (firstElement) {
      return firstElement as ChartDataPoint;
    }
  }

  return null;
}

/**
 * Resolves a tooltip value from configuration
 * Handles static strings, data lookups, and dynamic functions
 *
 * @param data - The data object containing tooltip values
 * @param tooltipValue - Value or function to resolve
 * @param tooltipValueKey - Fallback key to lookup in data object
 * @returns The resolved value
 */
export function getTooltipValue(
  data: ChartDataPoint,
  tooltipValue: DynamicTooltipValue,
  tooltipValueKey: string | undefined,
): unknown {
  if (tooltipValue !== undefined) {
    if (isFunction(tooltipValue)) {
      return tooltipValue(data);
    }
    if (isString(tooltipValue)) {
      return tooltipValue;
    }
  }

  const value = tooltipValueKey ? data[tooltipValueKey] : undefined;

  const optionalKeys = ['icon', 'text', 'color'];
  if (value === undefined && tooltipValueKey && !optionalKeys.includes(tooltipValueKey)) {
    console.warn(`Tooltip: data.${tooltipValueKey} is undefined`, {
      data,
      tooltipValueKey,
      availableKeys: Object.keys(data),
    });
  }

  return value;
}

/**
 * Transforms tooltip configuration array into parameter rows for template
 *
 * @param tooltipConfig - Array of tooltip row configs
 * @param data - The data object for this tooltip
 * @returns Array of parameter rows ready for template
 */
export function getTooltipParamRows(tooltipConfig: TooltipRowConfig[], data: ChartDataPoint): TooltipParamRow[] {
  const rows = tooltipConfig.map(({
    tooltipValueKey,
    text,
    color,
    icon,
    tooltipSecondaryValueKey,
    isPrimary,
    tooltipValue,
  }) => {
    // For primary rows, text IS the value (legacy behavior)
    const isPrimaryValueRow = isPrimary && !tooltipValueKey && !tooltipValue;

    const row: TooltipParamRow = {
      key: isPrimaryValueRow ? undefined : getTooltipValue(data, text as DynamicTooltipValue, 'text') as string | undefined,
      value: isPrimaryValueRow ? text as string | number : getTooltipValue(data, tooltipValue, tooltipValueKey) as string | number | undefined,
      secondaryValue: tooltipSecondaryValueKey ? data[tooltipSecondaryValueKey] as string | number | undefined : undefined,
      color: getTooltipValue(data, color, 'color') as string | undefined,
      icon: getTooltipValue(data, icon as DynamicTooltipValue, 'icon') as string | null | undefined,
      isPrimary,
    };

    return row;
  });

  return rows;
}

/**
 * Generates complete tooltip HTML from configuration and data
 *
 * @param getConfigFn - Function that returns tooltip configuration
 * @param templateFn - Function that renders parameter rows to HTML
 * @param options - Options for configuration generation
 * @param eventData - D3 event data
 * @returns HTML string for tooltip or empty string if no data
 */
export function generateTooltipHTML(
  getConfigFn: TooltipConfigFn,
  templateFn: TooltipTemplateFn,
  options: GenerateTooltipOptions,
  eventData: unknown,
): string {
  try {
    const data = getTooltipData(eventData);

    if (data === null) {
      return '';
    }

    const tooltipConfig = getConfigFn({
      ...options,
      data,
    } as ChartConfigParams & { data: ChartDataPoint });

    if (!tooltipConfig) {
      throw new Error(
        `Tooltip configuration not found for chart type: ${options.cfgType}. `
        + 'Ensure this chart type is registered in chartTooltipConfig.',
      );
    }

    const paramRows = getTooltipParamRows(tooltipConfig, data);

    return templateFn({
      paramRows,
      useAxisIcons: true,
    });
  } catch (error) {
    const contextInfo = options.cfgType
      ? `Failed to generate tooltip for ${options.cfgType} chart `
      + `(yAxis: ${options.yAxis}, groupBy: [${options.groupBy?.join(', ')}])`
      : 'Failed to generate tooltip';

    throw new Error(`${contextInfo}: ${(error as Error).message}`);
  }
}

export default {
  getTooltipData,
  getTooltipValue,
  getTooltipParamRows,
  generateTooltipHTML,
};
