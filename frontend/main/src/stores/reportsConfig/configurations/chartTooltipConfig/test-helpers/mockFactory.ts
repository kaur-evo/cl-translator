import type { ChartDataPoint, ChartConfigParams, TotalsData } from '@/stores/reportsConfig/configurations/chartTooltipConfig/types';
import configType, { type ConfigType } from '@/stores/reportsConfig/constants/configType';
import yAxisKey from '@/stores/reportsConfig/constants/yAxisKey';
import granularityType from '@/stores/reportsConfig/constants/granularity';
import xAxisKey from '@/stores/reportsConfig/constants/xAxisKey';

/**
 * Creates a mock ChartDataPoint with default values for all common fields.
 * Use overrides to customize specific fields for your test case.
 *
 * @example
 * const data = createMockChartDataPoint({ entityName: 'Custom Entity', productionCount: 50 });
 */
export const createMockChartDataPoint = (overrides?: Partial<ChartDataPoint>): ChartDataPoint => ({
  // Common fields
  entityName: 'Test Entity',
  entityGroupName: 'Test Entity Group',
  checklistGroupName: 'Test Checklist Group',
  location: 'Location A',
  station: 'Station 1',
  stationGroup: 'Station Group A',
  factory: 'Factory 1',
  singleOperator: 'Operator 1',
  product: 'Product X',
  productGroup: 'Product Group A',
  sku: 'SKU-123',
  shiftTemplate: 'Shift A',
  color: '#FF0000',
  tooltipXLabel: '2024-01-15',
  xScaleValueFormatted: '2024-01-15',

  // Downtime/Speedloss fields
  valueLabel: '1h 30m',
  avgDurationFormatted: '15m',
  entityCountLabel: '10',
  entityCount: 10,
  notesCount: 3,
  entityPctPlannedTimeLabel: '15.5%',

  // Scrap fields
  scrapQtyFormatted: '100',
  scrapAltQtyFormatted: '10',
  scrapQtyPctFormatted: '5.0%',
  scrapAltQtyPctFormatted: '5.0%',
  goodProductionFormatted: '1,900',
  scrapDurationFormatted: '30m',

  // OEE fields
  oeeFormatted: '85.0%',
  availabilityFormatted: '90.0%',
  performanceFormatted: '95.0%',
  qualityFormatted: '99.0%',
  technicalAvailabilityFormatted: '92.0%',

  // Quantity fields
  potentialQtyFormatted: '2,000',
  goodQtyFormatted: '1,900',
  rowProducedQtyFormatted: '2,000',
  idealQtyFormatted: '2,100',

  // Time Usage fields
  slowProductionFormatted: '1h',
  unplannedStopFormatted: '30m',
  uncommentedStopFormatted: '15m',
  plannedStopIncludedInOeeFormatted: '20m',
  plannedStopNotIncludedInOeeFormatted: '10m',
  plannedTimeFormatted: '8h',
  shiftTimeFormatted: '8h',
  operatingTimeFormatted: '7h',

  // Checklist fields
  checklistMissedFormatted: '2',
  checklistUnsuccessfulFormatted: '1',
  checklistSuccessfulFormatted: '15',
  avgTimeFormatted: '5m',
  medianCheckTimeFormatted: '4m',

  // ProductionSpeed fields
  rangeStart: 10,
  rangeEnd: 20,
  unitId: 'pcs/h',
  productionCount: 50,
  productionCountLabel: '50',
  productionTime: 3600,
  productionTimeLabel: '1h',
  targetLabel: '15',
  modeLabel: '12',
  isFasterThanTarget: true,

  // Preprocessed charts field (OEE, Quantity, TimeUsage, Checklist)
  // Default to 'oee' which is valid for OEE charts; override in tests for other chart types
  '%groupId': 'oee',

  ...overrides,
});

/**
 * Creates a mock TotalsData with default values.
 * Use overrides to customize specific fields for your test case.
 *
 * @example
 * const totals = createMockTotals({ productionCount: 200 });
 */
export const createMockTotals = (overrides?: Partial<TotalsData>): TotalsData => ({
  productionCount: 100,
  productionTime: 7200,
  ...overrides,
});

/**
 * Creates a mock ChartConfigParams with default values.
 * Use overrides to customize specific fields for your test case.
 *
 * When providing a cfgType override, TypeScript will infer the correct specific type.
 *
 * @example
 * const params = createMockChartParams({
 *   cfgType: configType.PRODUCTION_SPEED,
 *   totals: createMockTotals({ productionCount: 200 }),
 * });
 */
export const createMockChartParams = <T extends ConfigType = typeof configType.DOWNTIME>(
  overrides?: Partial<ChartConfigParams<T>> & { cfgType?: T },
): ChartConfigParams<T> => ({
  data: createMockChartDataPoint(),
  groupBy: [xAxisKey.ENTITY_ID],
  cfgType: configType.DOWNTIME as T,
  granularity: granularityType.DATE,
  yAxis: yAxisKey.VALUE,
  yAxisRight: null,
  visibleColumns: [],
  chartLegendState: [],
  totals: createMockTotals(),
  ...overrides,
} as ChartConfigParams<T>);

/**
 * Creates a mock ChartDataPoint with nested groups for testing drill-down scenarios.
 *
 * @example
 * const data = createNestedMockData({ entityName: 'Parent Entity' });
 */
export const createNestedMockData = (overrides?: Partial<ChartDataPoint>): ChartDataPoint => ({
  ...createMockChartDataPoint(overrides),
  groups: [
    createMockChartDataPoint({ entityName: 'Child Entity 1' }),
    createMockChartDataPoint({ entityName: 'Child Entity 2' }),
  ],
});
