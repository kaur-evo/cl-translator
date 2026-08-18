import xAxisKey from '@/stores/reportsConfig/constants/xAxisKey';
import granularityType from '@/stores/reportsConfig/constants/granularity';

export default (granularity, groupBy) => {
  const timeGranularities = [
    granularityType.DATE,
    granularityType.DAYOFWEEK,
    granularityType.WEEKOFYEAR,
    granularityType.QUARTER,
    granularityType.MONTH,
    granularityType.YEAR,
  ];
  if (timeGranularities.includes(granularity)) return false;
  const xAxisValuesWithTotalPlannedTime = [
    xAxisKey.ENTITY_ID,
    xAxisKey.ENTITY_GROUP_ID,
    xAxisKey.POSITION_ID,
    xAxisKey.PERFORMANCE_POSITION_ID,
  ];
  return xAxisValuesWithTotalPlannedTime.includes(groupBy) || xAxisValuesWithTotalPlannedTime.includes(granularity);
};
