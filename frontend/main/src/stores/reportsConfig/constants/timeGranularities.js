import granularityType from '@/stores/reportsConfig/constants/granularity';

export default new Set([
  granularityType.DATE,
  granularityType.DAYOFWEEK,
  granularityType.WEEKOFYEAR,
  granularityType.QUARTER,
  granularityType.MONTH,
  granularityType.YEAR,
]);
