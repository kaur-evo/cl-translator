import shouldUseTotalMeasures from './shouldUseTotalMeasures';

import yAxisKey from '@/stores/reportsConfig/constants/yAxisKey';
import configType from '@/stores/reportsConfig/constants/configType';
import granularityType from '@/stores/reportsConfig/constants/granularity';
import measure from '@/stores/reportsConfig/constants/measure';
import dimension from '@/stores/reportsConfig/constants/dimension';
import xAxisKey from '@/stores/reportsConfig/constants/xAxisKey';

export const getRequestMeasures = ({ type, granularity, groupBy }) => {
  const plannedTimeMeasure = shouldUseTotalMeasures(granularity, groupBy?.[0]) ? measure.TOTAL_PLANNED_TIME : measure.ROW_PLANNED_TIME;
  const producedMeasure = shouldUseTotalMeasures(granularity, groupBy?.[0]) ? [measure.TOTAL_PRODUCED_QTY, measure.TOTAL_PRODUCED_ALT_QTY] : [measure.ROW_PRODUCED_QTY, measure.ROW_PRODUCED_ALT_QTY];
  switch (type) {
    case configType.DOWNTIME: {
      if (granularity === granularityType.STARTTIME) {
        return [
          measure.NOTES_COUNT,
          measure.STOP_DURATION,
          measure.STOP_COUNT,
        ];
      }

      return [
        measure.STOP_COUNT,
        measure.NOTES_COUNT,
        measure.STOP_PCT,
        measure.STOP_DURATION,
        measure.STOPS_INCLUDED_IN_OEE,
        measure.STOP_TYPE,
        plannedTimeMeasure,
        measure.IDEAL_QTY,
        measure.IDEAL_ALT_QTY,
      ];
    }
    case configType.SPEEDLOSS:
      if (granularity === granularityType.STARTTIME) {
        return [
          measure.PERFORMANCE_LOSS_NOTES_COUNT,
          measure.PERFORMANCE_LOSS_DURATION,
          measure.PERFORMANCE_LOSS_COUNT,
        ];
      }
      return [
        measure.PERFORMANCE_LOSS_COUNT,
        measure.PERFORMANCE_LOSS_NOTES_COUNT,
        measure.PERFORMANCE_LOSS_PCT,
        measure.PERFORMANCE_LOSS_DURATION,
        measure.IDEAL_QTY,
        measure.IDEAL_ALT_QTY,
        measure.ROW_PRODUCED_QTY,
        measure.ROW_PRODUCED_ALT_QTY,
      ];

    case configType.SCRAPREASON:
      if (granularity === granularityType.STARTTIME) {
        return [];
      }
      return [
        measure.SCRAP_QTY,
        measure.SCRAP_ALT_QTY,
        ...producedMeasure,
        measure.GOOD_PRODUCTION,
        measure.SCRAP_DURATION,
        plannedTimeMeasure,
      ];

    case configType.OEE:
      return [
        measure.PLANNED_TIME,
        measure.ROW_PRODUCED_QTY,
        measure.ROW_PRODUCED_ALT_QTY,
        measure.TECHNICAL_AVAILABILITY,
        measure.AVAILABILITY,
        measure.PERFORMANCE,
        measure.QUALITY,
        measure.OEE,
        measure.PLANNED_STOP_NOT_INCLUDED_IN_OEE,
      ];

    case configType.QUANTITY:
      return [
        measure.ROW_PRODUCED_QTY,
        measure.ROW_PRODUCED_ALT_QTY,
        measure.SCRAP_QTY,
        measure.SCRAP_ALT_QTY,
        measure.IDEAL_QTY,
        measure.IDEAL_ALT_QTY,
        measure.GOOD_QTY,
        measure.GOOD_ALT_QTY,
        measure.IDEAL_PERFORMANCE_QTY,
        measure.IDEAL_PERFORMANCE_ALT_QTY,
        measure.AVAILABILITY,
        measure.PLANNED_TIME,
      ];

    case configType.TIME_USAGE:
      return [
        measure.PLANNED_TIME,
        measure.GOOD_PRODUCTION,
        measure.SLOW_PRODUCTION,
        measure.STOPS,
        measure.UNPLANNED_STOP,
        measure.PLANNED_STOP,
        measure.UNCOMMENTED_STOP,
        measure.PLANNED_STOP_INCLUDED_IN_OEE,
        measure.PLANNED_STOP_NOT_INCLUDED_IN_OEE,
      ];
    case configType.CHECKLIST:
      return [
        measure.CHECKLIST_MISSED_COUNT,
        measure.CHECKLIST_SUCCESSFUL_COUNT,
        measure.CHECKLIST_UNSUCCESSFUL_COUNT,
        measure.CHECKLIST_TOTAL_COUNT,
        measure.CHEKLIST_MISSING_DURATION,
        measure.CHEKLIST_SUCCESSFUL_DURATION,
        measure.CHEKLIST_UNSUCCESSFUL_DURATION,
        measure.NOTES_COUNT,
        measure.MEDIAN_CHECK_DURATION,
      ];
    case configType.PRODUCTION_SPEED:
      return [
        measure.PRODUCTION_SPEED_COUNT,
        measure.PRODCUTION_TIME,
        measure.MODE,
        measure.TARGET,
      ];
    default:
      return [];
  }
};

export const getTrendlineMeasure = ({ type, yAxis }) => {
  const map = {
    [configType.DOWNTIME]: {
      [yAxisKey.VALUE]: measure.STOP_DURATION,
      [yAxisKey.ENTITY_COUNT]: measure.STOP_COUNT,
      [yAxisKey.NOTES_COUNT]: measure.NOTES_COUNT,
    },
    [configType.SPEEDLOSS]: {
      [yAxisKey.VALUE]: measure.PERFORMANCE_LOSS_DURATION,
      [yAxisKey.ENTITY_COUNT]: measure.PERFORMANCE_LOSS_COUNT,
      [yAxisKey.NOTES_COUNT]: measure.PERFORMANCE_LOSS_NOTES_COUNT,
    },
    [configType.SCRAPREASON]: {
      [yAxisKey.ENTITY_COUNT]: measure.SCRAP_QTY,
      [yAxisKey.ENTITY_ALT_COUNT]: measure.SCRAP_ALT_QTY,
    },
    [configType.OEE]: {
      [yAxisKey.VALUE]: measure.OEE,
    },
  };
  return map[type]?.[yAxis] || null;
};

export const getRequestDimensions = ({
  type, granularity, groupBy,
}) => {
  const dimensions = [];
  switch (type) {
    case configType.DOWNTIME:
      dimensions.push(
        dimension.COMMENT,
        dimension.COMMENT_GROUP,
        dimension.STOP_LOCATION,
        dimension.FACTORY,
        dimension.STATION,
        dimension.STATION_GROUP,
        dimension.SHIFT_TEMPLATE,
        dimension.PRODUCT,
        dimension.PRODUCT_GROUP,
        dimension.LOT_CODE,
        dimension.PRODUCTION_ORDER,
        dimension.OPERATOR,
      );
      if (granularity === granularityType.STARTTIME) {
        dimensions.push(dimension.TIMELINE_ID, dimension.STARTTIME);
      }
      break;

    case configType.SPEEDLOSS:
      dimensions.push(
        dimension.PERFORMANCE_COMMENT,
        dimension.PERFORMANCE_COMMENT_GROUP,
        dimension.PERFORMANCE_LOSS_LOCATION,
        dimension.FACTORY,
        dimension.STATION,
        dimension.STATION_GROUP,
        dimension.SHIFT_TEMPLATE,
        dimension.PRODUCT,
        dimension.PRODUCT_GROUP,
        dimension.LOT_CODE,
        dimension.PRODUCTION_ORDER,
        dimension.OPERATOR,
      );
      if (granularity === granularityType.STARTTIME) {
        dimensions.push(dimension.PERFORMANCE_LOSS_INSTANCE_ID, granularityType.DATE);
      }
      break;

    case configType.SCRAPREASON:
      dimensions.push(
        dimension.SCRAP_REASON,
        dimension.SCRAP_REASON_GROUP,
        dimension.FACTORY,
        dimension.STATION,
        dimension.STATION_GROUP,
        dimension.SHIFT_TEMPLATE,
        dimension.PRODUCT,
        dimension.PRODUCT_GROUP,
        dimension.LOT_CODE,
        dimension.PRODUCTION_ORDER,
        dimension.OPERATOR,
      );
      break;

    case configType.OEE:
    case configType.QUANTITY:
    case configType.TIME_USAGE:
      dimensions.push(
        dimension.PRODUCT,
        dimension.PRODUCT_GROUP,
        dimension.LOT_CODE,
        dimension.PRODUCTION_ORDER,
        dimension.OPERATOR,
        dimension.SHIFT_TEMPLATE,
        dimension.FACTORY,
        dimension.STATION,
        dimension.STATION_GROUP,
      );
      break;

    case configType.CHECKLIST:
      dimensions.push(
        dimension.CHECKLIST,
        dimension.CHECKLIST_GROUP,
        dimension.PRODUCT,
        dimension.PRODUCT_GROUP,
        dimension.OPERATOR,
        dimension.SHIFT_TEMPLATE,
        dimension.FACTORY,
        dimension.STATION,
        dimension.STATION_GROUP,
        dimension.CHECKLIST_PIN,
        dimension.CHECKLIST_DONE_BY,
      );
      break;

    case configType.PRODUCTION_SPEED: {
      dimensions.push(
        dimension.PRODUCT,
        dimension.PRODUCT_GROUP,
        dimension.OPERATOR,
        dimension.SHIFT_TEMPLATE,
        dimension.FACTORY,
        dimension.STATION,
        dimension.STATION_GROUP,
        dimension.TIMELINE_ID,
      );

      const allowedGroupByKeys = new Set([
        xAxisKey.UNIT_PER_SECOND,
        xAxisKey.UNIT_PER_MINUTE,
        xAxisKey.UNIT_PER_HOUR,
        xAxisKey.SECOND_PER_UNIT,
      ]);
      if (groupBy && groupBy.some((key) => allowedGroupByKeys.has(key))) {
        dimensions.push(dimension.PRODUCTION_SPEED_RANGE);
      }

      break;
    }

    default: break;
  }
  if (groupBy?.includes(xAxisKey.SINGLE_OPERATOR)) {
    dimensions.push(dimension.SINGLE_OPERATOR);
  }
  return dimensions;
};
