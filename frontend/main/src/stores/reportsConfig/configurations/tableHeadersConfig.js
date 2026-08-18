import configType from '@/stores/reportsConfig/constants/configType';
import getCommonTimeColumns from '@/stores/reportsConfig/configurations/tableColumns/commonTimeColumns';
import getChecklistColumns from '@/stores/reportsConfig/configurations/tableColumns/checklistColumns';
import getDowntimeColumns from '@/stores/reportsConfig/configurations/tableColumns/downtimeColumns';
import getSpeedlossColumns from '@/stores/reportsConfig/configurations/tableColumns/speedlossColumns';
import getScrapColumns from '@/stores/reportsConfig/configurations/tableColumns/scrapColumns';
import getQuantityColumns from '@/stores/reportsConfig/configurations/tableColumns/quantityColumns';
import getTimeUsageColumns from '@/stores/reportsConfig/configurations/tableColumns/timeUsageColumns';
import getOeeColumns from '@/stores/reportsConfig/configurations/tableColumns/oeeColumns';
import getCommonColumns from '@/stores/reportsConfig/configurations/tableColumns/commonColumns';
import getProductionSpeedColumns from '@/stores/reportsConfig/configurations/tableColumns/productionSpeedColumns';

export default function getTableHeadersConfig(options) {
  const commonTimeColumns = getCommonTimeColumns(options);
  const commonColumn = getCommonColumns(options);

  switch (options.configType) {
    case configType.DOWNTIME: {
      const downtimeColumn = getDowntimeColumns(options);
      return [
        ...commonTimeColumns,
        downtimeColumn.COMMENT,
        downtimeColumn.COMMENT_GROUP,
        commonColumn.STATION,
        commonColumn.STATION_GROUP,
        commonColumn.FACTORY,
        commonColumn.SINGLE_OPERATOR,
        downtimeColumn.STOP_TYPE,
        downtimeColumn.STOP_LOCATION,
        commonColumn.PRODUCT_GROUP,
        commonColumn.PRODUCT,
        commonColumn.SKU,
        commonColumn.LOT_CODE,
        commonColumn.PRODUCTION_ORDER,
        commonColumn.SHIFT_TEMPLATE,
        commonColumn.OPERATOR,
        downtimeColumn.STOP_COUNT,
        commonColumn.NOTES_COUNT,
        downtimeColumn.IDEAL_QTY,
        downtimeColumn.IDEAL_ALT_QTY,
        downtimeColumn.STOP_DURATION,
        commonColumn.AVG_DURATION,
        downtimeColumn.INCL_IN_OEE_STOP_DURATION,
        commonColumn.ROW_PLANNED_TIME,
        commonColumn.TOTAL_PLANNED_TIME,
        commonColumn.ENTITY_PCT_PLANNED_TIME,
        commonColumn.NOTES,
      ];
    }
    case configType.SPEEDLOSS: {
      const speedlossColumn = getSpeedlossColumns(options);
      return [
        ...commonTimeColumns,
        speedlossColumn.PERFORMANCE_COMMENT,
        speedlossColumn.PERFORMANCE_COMMENT_GROUP,
        commonColumn.STATION,
        commonColumn.STATION_GROUP,
        commonColumn.FACTORY,
        commonColumn.SINGLE_OPERATOR,
        speedlossColumn.PERFORMANCE_LOSS_LOCATION,
        commonColumn.PRODUCT_GROUP,
        commonColumn.PRODUCT,
        commonColumn.SKU,
        commonColumn.LOT_CODE,
        commonColumn.PRODUCTION_ORDER,
        commonColumn.SHIFT_TEMPLATE,
        commonColumn.OPERATOR,
        speedlossColumn.PERFORMANCE_LOSS_COUNT,
        commonColumn.NOTES_COUNT,
        speedlossColumn.PERFORMANCE_LOSS_NOTES_COUNT,
        speedlossColumn.PERFORMANCE_LOSS_QTY,
        speedlossColumn.PERFORMANCE_LOSS_ALT_QTY,
        speedlossColumn.PERFORMANCE_LOSS_DURATION,
        commonColumn.AVG_DURATION,
        commonColumn.NOTES,
      ];
    }
    case configType.SCRAPREASON: {
      const scrapColumn = getScrapColumns(options);
      return [
        ...commonTimeColumns,
        scrapColumn.SCRAP_REASON,
        scrapColumn.SCRAP_REASON_GROUP,
        commonColumn.STATION,
        commonColumn.STATION_GROUP,
        commonColumn.FACTORY,
        commonColumn.SINGLE_OPERATOR,
        commonColumn.PRODUCT_GROUP,
        commonColumn.PRODUCT,
        commonColumn.SKU,
        commonColumn.LOT_CODE,
        commonColumn.PRODUCTION_ORDER,
        commonColumn.SHIFT_TEMPLATE,
        commonColumn.OPERATOR,
        commonColumn.NOTES_COUNT,
        commonColumn.AVG_DURATION,
        commonColumn.NOTES,
        scrapColumn.SCRAP_QTY,
        scrapColumn.SCRAP_ALT_QTY,
        scrapColumn.SCRAP_QTY_PCT,
        scrapColumn.SCRAP_ALT_QTY_PCT,
        scrapColumn.GOOD_PRODUCTION,
        scrapColumn.SCRAP_DURATION,
        commonColumn.ROW_PLANNED_TIME,
        commonColumn.TOTAL_PLANNED_TIME,
        commonColumn.ENTITY_PCT_PLANNED_TIME,
      ];
    }
    case configType.OEE: {
      const oeeColumn = getOeeColumns(options);
      return [
        ...commonTimeColumns,
        commonColumn.STATION,
        commonColumn.STATION_GROUP,
        commonColumn.FACTORY,
        commonColumn.SINGLE_OPERATOR,
        commonColumn.PRODUCT_GROUP,
        commonColumn.PRODUCT,
        commonColumn.SKU,
        commonColumn.LOT_CODE,
        commonColumn.PRODUCTION_ORDER,
        commonColumn.SHIFT_TEMPLATE,
        commonColumn.OPERATOR,
        commonColumn.NOTES_COUNT,
        commonColumn.AVG_DURATION,
        commonColumn.NOTES,
        oeeColumn.AVAILABILITY,
        oeeColumn.TECHNICAL_AVAILABILITY,
        oeeColumn.PERFORMANCE,
        oeeColumn.QUALITY,
        oeeColumn.OEE,
        oeeColumn.OOE,
        oeeColumn.TEEP,
        commonColumn.OPERATING_TIME,
        commonColumn.PLANNED_TIME,
        commonColumn.SHIFT_TIME,
        commonColumn.CALENDAR_TIME,
        commonColumn.ROW_PRODUCED_QTY,
        commonColumn.ROW_PRODUCED_ALT_QTY,
      ];
    }
    case configType.QUANTITY: {
      const quantityColumn = getQuantityColumns();
      return [
        ...commonTimeColumns,
        commonColumn.STATION,
        commonColumn.STATION_GROUP,
        commonColumn.FACTORY,
        commonColumn.SINGLE_OPERATOR,
        commonColumn.PRODUCT_GROUP,
        commonColumn.PRODUCT,
        commonColumn.SKU,
        commonColumn.LOT_CODE,
        commonColumn.PRODUCTION_ORDER,
        commonColumn.SHIFT_TEMPLATE,
        commonColumn.OPERATOR,
        commonColumn.NOTES_COUNT,
        commonColumn.AVG_DURATION,
        commonColumn.NOTES,
        quantityColumn.GOOD_QTY,
        quantityColumn.GOOD_ALT_QTY,
        quantityColumn.SCRAP_QTY,
        quantityColumn.SCRAP_ALT_QTY,
        commonColumn.ROW_PRODUCED_QTY,
        commonColumn.ROW_PRODUCED_ALT_QTY,
        quantityColumn.IDEAL_QTY,
        quantityColumn.IDEAL_ALT_QTY,
        quantityColumn.PERFORMANCE_LOSS_QTY,
        quantityColumn.PERFORMANCE_LOSS_ALT_QTY,
        quantityColumn.AVAILABILITY_LOSS_QTY,
        quantityColumn.AVAILABILITY_LOSS_ALT_QTY,
        quantityColumn.POTENTIAL_QTY,
        quantityColumn.POTENTIAL_ALT_QTY,
      ];
    }
    case configType.TIME_USAGE: {
      const timeUsageColumn = getTimeUsageColumns(options);
      return [
        ...commonTimeColumns,
        commonColumn.STATION,
        commonColumn.STATION_GROUP,
        commonColumn.FACTORY,
        commonColumn.SINGLE_OPERATOR,
        commonColumn.PRODUCT_GROUP,
        commonColumn.PRODUCT,
        commonColumn.SKU,
        commonColumn.LOT_CODE,
        commonColumn.PRODUCTION_ORDER,
        commonColumn.SHIFT_TEMPLATE,
        commonColumn.OPERATOR,
        commonColumn.NOTES_COUNT,
        commonColumn.AVG_DURATION,
        commonColumn.NOTES,
        timeUsageColumn.GOOD_PRODUCTION,
        timeUsageColumn.SLOW_PRODUCTION,
        timeUsageColumn.UNPLANNED_STOP,
        timeUsageColumn.UNCOMMENTED_STOP,
        timeUsageColumn.PLANNED_STOP_INCLUDED_IN_OEE,
        timeUsageColumn.PLANNED_STOP_NOT_INCLUDED_IN_OEE,
        commonColumn.OPERATING_TIME,
        commonColumn.PLANNED_TIME,
        commonColumn.SHIFT_TIME,
      ];
    }
    case configType.CHECKLIST: {
      const checklistColumn = getChecklistColumns(options);
      return [
        ...commonTimeColumns,
        checklistColumn.CHECKLIST,
        checklistColumn.CHECKLIST_GROUP,
        commonColumn.STATION,
        commonColumn.STATION_GROUP,
        commonColumn.FACTORY,
        commonColumn.SINGLE_OPERATOR,
        commonColumn.PRODUCT_GROUP,
        commonColumn.PRODUCT,
        commonColumn.SKU,
        commonColumn.SHIFT_TEMPLATE,
        commonColumn.OPERATOR,
        checklistColumn.CHECKLIST_DONE_BY,
        checklistColumn.CHECKLIST_TOTAL_COUNT,
        checklistColumn.CHECKLIST_SUCCESSFUL_COUNT,
        checklistColumn.CHECKLIST_UNSUCCESSFUL_COUNT,
        checklistColumn.CHECKLIST_MISSED_COUNT,
        commonColumn.AVG_TIME,
        checklistColumn.MEDIAN_CHECK_DURATION,
      ];
    }
    case configType.PRODUCTION_SPEED: {
      const productionSpeedColumn = getProductionSpeedColumns(options);
      return [
        productionSpeedColumn.RANGE,
        commonColumn.STATION,
        commonColumn.STATION_GROUP,
        commonColumn.FACTORY,
        commonColumn.SINGLE_OPERATOR,
        commonColumn.PRODUCT_GROUP,
        commonColumn.PRODUCT,
        commonColumn.SKU,
        commonColumn.SHIFT_TEMPLATE,
        commonColumn.OPERATOR,
        productionSpeedColumn.PRODUCTION_COUNT,
        productionSpeedColumn.PRODUCTION_TIME,
      ];
    }
    default:
      return [
        ...commonTimeColumns,
        commonColumn.STATION,
        commonColumn.STATION_GROUP,
        commonColumn.FACTORY,
        commonColumn.SINGLE_OPERATOR,
        commonColumn.PRODUCT_GROUP,
        commonColumn.PRODUCT,
        commonColumn.SKU,
        commonColumn.SHIFT_TEMPLATE,
        commonColumn.OPERATOR,
      ];
  }
}
