import measure from '@/stores/reportsConfig/constants/measure';
import dimension from '@/stores/reportsConfig/constants/dimension';
import xAxisKey from '@/stores/reportsConfig/constants/xAxisKey';
import calcMeasure from '@/stores/reportsConfig/constants/calcMeasure';

export default {
  DOWNTIME: [
    dimension.COMMENT, dimension.COMMENT_GROUP, dimension.FACTORY, dimension.STATION, dimension.STATION_GROUP, measure.STOP_TYPE,
    dimension.STOP_LOCATION, dimension.PRODUCT, dimension.PRODUCT_GROUP, xAxisKey.SKU, dimension.LOT_CODE, dimension.PRODUCTION_ORDER, dimension.SHIFT_TEMPLATE, dimension.OPERATOR,
    measure.STOP_COUNT, measure.NOTES_COUNT, measure.STOP_DURATION, measure.STOPS_INCLUDED_IN_OEE, calcMeasure.AVG_DURATION, measure.ROW_PLANNED_TIME,
    calcMeasure.ENTITY_PCT_PLANNED_TIME, measure.TOTAL_PLANNED_TIME, measure.IDEAL_QTY,
  ],
  SPEEDLOSS: [
    dimension.PERFORMANCE_COMMENT, dimension.PERFORMANCE_COMMENT_GROUP, dimension.FACTORY, dimension.STATION, dimension.STATION_GROUP, dimension.PERFORMANCE_LOSS_LOCATION,
    dimension.PRODUCT, dimension.PRODUCT_GROUP, xAxisKey.SKU, dimension.LOT_CODE, dimension.PRODUCTION_ORDER,
    dimension.SHIFT_TEMPLATE, dimension.OPERATOR, measure.PERFORMANCE_LOSS_COUNT, measure.PERFORMANCE_LOSS_NOTES_COUNT,
    measure.PERFORMANCE_LOSS_DURATION, calcMeasure.AVG_DURATION, measure.IDEAL_QTY,
  ],
  SCRAP: [
    dimension.SCRAP_REASON, dimension.SCRAP_REASON_GROUP, dimension.FACTORY, dimension.STATION, dimension.STATION_GROUP, dimension.PRODUCT,
    xAxisKey.SKU, dimension.LOT_CODE, dimension.PRODUCTION_ORDER, dimension.SHIFT_TEMPLATE, dimension.OPERATOR, measure.SCRAP_QTY, calcMeasure.SCRAP_QTY_PCT, measure.GOOD_PRODUCTION,
    measure.SCRAP_DURATION, measure.ROW_PLANNED_TIME, measure.TOTAL_PLANNED_TIME, calcMeasure.ENTITY_PCT_PLANNED_TIME,
  ],
  OEE: [
    dimension.FACTORY, dimension.STATION, dimension.STATION_GROUP, dimension.PRODUCT, xAxisKey.SKU, dimension.LOT_CODE, dimension.PRODUCTION_ORDER, dimension.SHIFT_TEMPLATE, dimension.OPERATOR,
    measure.AVAILABILITY, measure.TECHNICAL_AVAILABILITY, measure.PERFORMANCE, measure.QUALITY, measure.OEE, calcMeasure.OOE, calcMeasure.TEEP,
    calcMeasure.OPERATING_TIME, measure.PLANNED_TIME, calcMeasure.SHIFT_TIME, calcMeasure.CALENDAR_TIME, measure.ROW_PRODUCED_QTY,
  ],
  QUANTITY: [
    dimension.FACTORY, dimension.STATION, dimension.STATION_GROUP, dimension.PRODUCT, xAxisKey.SKU, dimension.LOT_CODE, dimension.PRODUCTION_ORDER, dimension.SHIFT_TEMPLATE, dimension.OPERATOR,
    measure.SCRAP_QTY, measure.GOOD_QTY, measure.ROW_PRODUCED_QTY, calcMeasure.POTENTIAL_QTY, measure.IDEAL_QTY, calcMeasure.PERFORMANCE_LOSS_QTY, calcMeasure.AVAILABILITY_LOSS_QTY,
  ],
  TIME_USAGE: [
    dimension.STATION, dimension.STATION_GROUP, dimension.PRODUCT, xAxisKey.SKU, dimension.LOT_CODE, dimension.PRODUCTION_ORDER, dimension.SHIFT_TEMPLATE, dimension.OPERATOR,
    measure.GOOD_PRODUCTION, measure.SLOW_PRODUCTION, measure.PLANNED_STOP_INCLUDED_IN_OEE, measure.PLANNED_STOP_NOT_INCLUDED_IN_OEE,
    measure.UNPLANNED_STOP, measure.UNCOMMENTED_STOP, measure.PLANNED_TIME, calcMeasure.SHIFT_TIME, calcMeasure.OPERATING_TIME,
  ],
  CHECKLISTS: [
    dimension.CHECKLIST, dimension.CHECKLIST_GROUP, dimension.FACTORY, dimension.STATION, dimension.STATION_GROUP, dimension.PRODUCT, dimension.PRODUCT_GROUP, xAxisKey.SKU,
    dimension.SHIFT_TEMPLATE, dimension.OPERATOR, dimension.CHECKLIST_DONE_BY, measure.CHECKLIST_MISSED_COUNT, measure.CHECKLIST_SUCCESSFUL_COUNT,
    measure.CHECKLIST_UNSUCCESSFUL_COUNT, measure.CHECKLIST_TOTAL_COUNT, calcMeasure.AVG_TIME, measure.MEDIAN_CHECK_DURATION,
  ],
  PRODUCTION_SPEED: [
    dimension.PRODUCTION_SPEED_RANGE, dimension.FACTORY, dimension.STATION, dimension.STATION_GROUP,
    dimension.PRODUCT, dimension.PRODUCT_GROUP, xAxisKey.SKU, dimension.SHIFT_TEMPLATE, dimension.OPERATOR,
    measure.PRODUCTION_SPEED_COUNT, measure.PRODCUTION_TIME, measure.MODE, measure.TARGET,
  ],
};
