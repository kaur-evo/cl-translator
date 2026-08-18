import productionSpeedLegendType from '@/stores/reportsConfig/constants/productionSpeedLegendType';

export function isModeVisible(entry, chartLegendState) {
  return entry.containsMode && chartLegendState.includes(productionSpeedLegendType.MOST_FREQUENT);
}
export function isTargetVisible(entry, chartLegendState) {
  return entry.containsTarget && chartLegendState.includes(productionSpeedLegendType.TARGET_SPEED);
}
export function areRequiredFiltersValid(requestFilterState) {
  const { stationId, productId } = requestFilterState;
  const validStationId = stationId && Array.isArray(stationId) && stationId.length === 1;
  const validProductId = productId && Array.isArray(productId) && productId.length === 1;
  return validStationId && validProductId;
}
