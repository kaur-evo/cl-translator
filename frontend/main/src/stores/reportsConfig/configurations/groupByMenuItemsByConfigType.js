import {
  SPEEDLOSS, DOWNTIME, OEE, QUANTITY, TIME_USAGE, SCRAPREASON, CHECKLIST, PRODUCTION_SPEED,
} from '@/stores/reportsConfig/constants/configType';
import dimensionType from '@/stores/reportsConfig/constants/dimension';
import i18n from '@/services/i18n';
import xAxisKey from '@/stores/reportsConfig/constants/xAxisKey';
import queryParam from '@/stores/reportsConfig/constants/queryParam';
import getUnitIdFormatted from '@/helpers/getUnitIdFormatted';
import runtimeType from '@/constants/runtimeType';

export function getCurrentProductUnitId(currentFilterItemsMap, requestFilterState) {
  const productFilterItems = currentFilterItemsMap?.[queryParam.PRODUCT_ID];
  const productFilterValue = requestFilterState?.[queryParam.PRODUCT_ID];
  let unitId;
  if (!productFilterItems || !productFilterValue || productFilterValue.length !== 1) {
    unitId = '??';
  } else {
    unitId = productFilterItems[productFilterValue[0]]?.unitId ?? '??';
  }
  return unitId;
}

export const getProductionSpeedTextMethod = (runTimeType) => (item, { currentFilterItemsMap, requestFilterState }) => {
  const unitId = getCurrentProductUnitId(currentFilterItemsMap, requestFilterState);
  return getUnitIdFormatted(runTimeType, unitId);
};

export default function getGroupByMenuItemsByConfigType() {
  return {
    [DOWNTIME]: {
      [xAxisKey.ENTITY_ID]: { text: i18n.global.t('Stop reasons'), value: xAxisKey.ENTITY_ID, requestGroupByArgs: [dimensionType.COMMENT, dimensionType.COMMENT_GROUP] },
      [xAxisKey.ENTITY_GROUP_ID]: { text: i18n.global.t('Stop groups'), value: xAxisKey.ENTITY_GROUP_ID, requestGroupByArgs: [dimensionType.COMMENT_GROUP, dimensionType.COMMENT_GROUP] },
      [xAxisKey.POSITION_ID]: { text: i18n.global.t('Machine locations'), value: xAxisKey.POSITION_ID, requestGroupByArgs: [dimensionType.STOP_LOCATION, dimensionType.COMMENT_GROUP] },
      [xAxisKey.STATION_ID]: { text: i18n.global.t('Stations'), value: xAxisKey.STATION_ID, requestGroupByArgs: [dimensionType.STATION, dimensionType.COMMENT_GROUP] },
      [xAxisKey.STATION_GROUP_ID]: { text: i18n.global.t('Station groups'), value: xAxisKey.STATION_GROUP_ID, requestGroupByArgs: [dimensionType.STATION_GROUP, dimensionType.COMMENT_GROUP] },
      [xAxisKey.FACTORY_ID]: { text: i18n.global.t('Factories'), value: xAxisKey.FACTORY_ID, requestGroupByArgs: [dimensionType.FACTORY, dimensionType.COMMENT_GROUP] },
      [xAxisKey.SINGLE_OPERATOR]: { text: i18n.global.t('Operators'), value: xAxisKey.SINGLE_OPERATOR, requestGroupByArgs: [dimensionType.SINGLE_OPERATOR, dimensionType.COMMENT_GROUP] },
      [xAxisKey.PRODUCT_ID]: { text: i18n.global.t('products'), value: xAxisKey.PRODUCT_ID, requestGroupByArgs: [dimensionType.PRODUCT, dimensionType.COMMENT_GROUP] },
      [xAxisKey.SKU]: { text: i18n.global.t('Product code'), value: xAxisKey.SKU, requestGroupByArgs: [dimensionType.PRODUCT, dimensionType.COMMENT_GROUP] },
      [xAxisKey.PRODUCTION_ORDER]: { text: i18n.global.t('Orders'), value: xAxisKey.PRODUCTION_ORDER, requestGroupByArgs: [dimensionType.PRODUCTION_ORDER, dimensionType.COMMENT_GROUP] },
      [xAxisKey.LOT_CODE]: { text: i18n.global.t('LOT/Batch'), value: xAxisKey.LOT_CODE, requestGroupByArgs: [dimensionType.LOT_CODE, dimensionType.COMMENT_GROUP] },
      [xAxisKey.PRODUCT_GROUP_ID]: { text: i18n.global.t('Product groups'), value: xAxisKey.PRODUCT_GROUP_ID, requestGroupByArgs: [dimensionType.PRODUCT_GROUP, dimensionType.COMMENT_GROUP] },
      [xAxisKey.SHIFT_TEMPLATE]: { text: i18n.global.t('Shifts'), value: xAxisKey.SHIFT_TEMPLATE, requestGroupByArgs: [dimensionType.SHIFT_TEMPLATE, dimensionType.COMMENT_GROUP] },
    },
    [SPEEDLOSS]: {
      [xAxisKey.ENTITY_ID]: { text: i18n.global.t('Speed loss reasons'), value: xAxisKey.ENTITY_ID, requestGroupByArgs: [dimensionType.PERFORMANCE_COMMENT, dimensionType.PERFORMANCE_COMMENT_GROUP] },
      [xAxisKey.ENTITY_GROUP_ID]: {
        text: i18n.global.t('Speed loss groups'), value: xAxisKey.ENTITY_GROUP_ID, requestGroupByArgs: [dimensionType.PERFORMANCE_COMMENT_GROUP, dimensionType.PERFORMANCE_COMMENT_GROUP],
      },
      [xAxisKey.PERFORMANCE_POSITION_ID]: {
        text: i18n.global.t('Machine locations'), value: 'performancePositionId', requestGroupByArgs: [dimensionType.PERFORMANCE_LOSS_LOCATION, dimensionType.PERFORMANCE_COMMENT_GROUP],
      },
      [xAxisKey.STATION_ID]: { text: i18n.global.t('Stations'), value: xAxisKey.STATION_ID, requestGroupByArgs: [dimensionType.STATION, dimensionType.PERFORMANCE_COMMENT_GROUP] },
      [xAxisKey.STATION_GROUP_ID]: {
        text: i18n.global.t('Station groups'), value: xAxisKey.STATION_GROUP_ID, requestGroupByArgs: [dimensionType.STATION_GROUP, dimensionType.PERFORMANCE_COMMENT_GROUP],
      },
      [xAxisKey.FACTORY_ID]: { text: i18n.global.t('Factories'), value: xAxisKey.FACTORY_ID, requestGroupByArgs: [dimensionType.FACTORY, dimensionType.PERFORMANCE_COMMENT_GROUP] },
      [xAxisKey.SINGLE_OPERATOR]: { text: i18n.global.t('Operators'), value: xAxisKey.SINGLE_OPERATOR, requestGroupByArgs: [dimensionType.SINGLE_OPERATOR, dimensionType.PERFORMANCE_COMMENT_GROUP] },
      [xAxisKey.SHIFT_TEMPLATE]: { text: i18n.global.t('Shifts'), value: xAxisKey.SHIFT_TEMPLATE, requestGroupByArgs: [dimensionType.SHIFT_TEMPLATE, dimensionType.PERFORMANCE_COMMENT_GROUP] },
      [xAxisKey.PRODUCT_ID]: { text: i18n.global.t('products'), value: xAxisKey.PRODUCT_ID, requestGroupByArgs: [dimensionType.PRODUCT, dimensionType.PERFORMANCE_COMMENT_GROUP] },
      [xAxisKey.PRODUCT_GROUP_ID]: {
        text: i18n.global.t('Product groups'), value: xAxisKey.PRODUCT_GROUP_ID, requestGroupByArgs: [dimensionType.PRODUCT_GROUP, dimensionType.PERFORMANCE_COMMENT_GROUP],
      },
      [xAxisKey.SKU]: { text: i18n.global.t('Product code'), value: xAxisKey.SKU, requestGroupByArgs: [dimensionType.PRODUCT, dimensionType.PERFORMANCE_COMMENT_GROUP] },
      [xAxisKey.PRODUCTION_ORDER]: { text: i18n.global.t('Orders'), value: xAxisKey.PRODUCTION_ORDER, requestGroupByArgs: [dimensionType.PRODUCTION_ORDER, dimensionType.PERFORMANCE_COMMENT_GROUP] },
      [xAxisKey.LOT_CODE]: { text: i18n.global.t('LOT/Batch'), value: xAxisKey.LOT_CODE, requestGroupByArgs: [dimensionType.LOT_CODE, dimensionType.PERFORMANCE_COMMENT_GROUP] },
    },
    [SCRAPREASON]: {
      [xAxisKey.ENTITY_ID]: { text: i18n.global.t('Scrap reasons'), value: xAxisKey.ENTITY_ID, requestGroupByArgs: [dimensionType.SCRAP_REASON, dimensionType.SCRAP_REASON_GROUP] },
      [xAxisKey.ENTITY_GROUP_ID]: { text: i18n.global.t('Scrap groups'), value: xAxisKey.ENTITY_GROUP_ID, requestGroupByArgs: [dimensionType.SCRAP_REASON_GROUP, dimensionType.SCRAP_REASON_GROUP] },
      [xAxisKey.FACTORY_ID]: { text: i18n.global.t('Factories'), value: xAxisKey.FACTORY_ID, requestGroupByArgs: [dimensionType.FACTORY, dimensionType.SCRAP_REASON_GROUP] },
      [xAxisKey.STATION_ID]: { text: i18n.global.t('Stations'), value: xAxisKey.STATION_ID, requestGroupByArgs: [dimensionType.STATION, dimensionType.SCRAP_REASON_GROUP] },
      [xAxisKey.STATION_GROUP_ID]: { text: i18n.global.t('Station groups'), value: xAxisKey.STATION_GROUP_ID, requestGroupByArgs: [dimensionType.STATION_GROUP, dimensionType.SCRAP_REASON_GROUP] },
      [xAxisKey.SINGLE_OPERATOR]: { text: i18n.global.t('Operators'), value: xAxisKey.SINGLE_OPERATOR, requestGroupByArgs: [dimensionType.SINGLE_OPERATOR, dimensionType.SCRAP_REASON_GROUP] },
      [xAxisKey.SHIFT_TEMPLATE]: { text: i18n.global.t('Shifts'), value: xAxisKey.SHIFT_TEMPLATE, requestGroupByArgs: [dimensionType.SHIFT_TEMPLATE, dimensionType.SCRAP_REASON_GROUP] },
      [xAxisKey.PRODUCT_ID]: { text: i18n.global.t('products'), value: xAxisKey.PRODUCT_ID, requestGroupByArgs: [dimensionType.PRODUCT, dimensionType.SCRAP_REASON_GROUP] },
      [xAxisKey.SKU]: { text: i18n.global.t('Product code'), value: xAxisKey.SKU, requestGroupByArgs: [dimensionType.PRODUCT, dimensionType.SCRAP_REASON_GROUP] },
      [xAxisKey.PRODUCTION_ORDER]: { text: i18n.global.t('Orders'), value: xAxisKey.PRODUCTION_ORDER, requestGroupByArgs: [dimensionType.PRODUCTION_ORDER, dimensionType.SCRAP_REASON_GROUP] },
      [xAxisKey.LOT_CODE]: { text: i18n.global.t('LOT/Batch'), value: xAxisKey.LOT_CODE, requestGroupByArgs: [dimensionType.LOT_CODE, dimensionType.SCRAP_REASON_GROUP] },
      [xAxisKey.PRODUCT_GROUP_ID]: { text: i18n.global.t('Product groups'), value: xAxisKey.PRODUCT_GROUP_ID, requestGroupByArgs: [dimensionType.PRODUCT_GROUP, dimensionType.SCRAP_REASON_GROUP] },
    },
    [OEE]: {
      [xAxisKey.STATION_ID]: { text: i18n.global.t('Stations'), value: xAxisKey.STATION_ID, requestGroupByArgs: [dimensionType.STATION] },
      [xAxisKey.STATION_GROUP_ID]: { text: i18n.global.t('Station groups'), value: xAxisKey.STATION_GROUP_ID, requestGroupByArgs: [dimensionType.STATION_GROUP] },
      [xAxisKey.FACTORY_ID]: { text: i18n.global.t('Factories'), value: xAxisKey.FACTORY_ID, requestGroupByArgs: [dimensionType.FACTORY] },
      [xAxisKey.SINGLE_OPERATOR]: { text: i18n.global.t('Operators'), value: xAxisKey.SINGLE_OPERATOR, requestGroupByArgs: [dimensionType.SINGLE_OPERATOR] },
      [xAxisKey.PRODUCT_ID]: { text: i18n.global.t('products'), value: xAxisKey.PRODUCT_ID, requestGroupByArgs: [dimensionType.PRODUCT] },
      [xAxisKey.SKU]: { text: i18n.global.t('Product code'), value: xAxisKey.SKU, requestGroupByArgs: [dimensionType.PRODUCT] },
      [xAxisKey.PRODUCTION_ORDER]: { text: i18n.global.t('Orders'), value: xAxisKey.PRODUCTION_ORDER, requestGroupByArgs: [dimensionType.PRODUCTION_ORDER] },
      [xAxisKey.LOT_CODE]: { text: i18n.global.t('LOT/Batch'), value: xAxisKey.LOT_CODE, requestGroupByArgs: [dimensionType.LOT_CODE] },
      [xAxisKey.PRODUCT_GROUP_ID]: { text: i18n.global.t('Product groups'), value: xAxisKey.PRODUCT_GROUP_ID, requestGroupByArgs: [dimensionType.PRODUCT_GROUP] },
      [xAxisKey.SHIFT_TEMPLATE]: { text: i18n.global.t('Shifts'), value: xAxisKey.SHIFT_TEMPLATE, requestGroupByArgs: [dimensionType.SHIFT_TEMPLATE] },
    },
    [QUANTITY]: {
      [xAxisKey.STATION_ID]: { text: i18n.global.t('Stations'), value: xAxisKey.STATION_ID, requestGroupByArgs: [dimensionType.STATION] },
      [xAxisKey.STATION_GROUP_ID]: { text: i18n.global.t('Station groups'), value: xAxisKey.STATION_GROUP_ID, requestGroupByArgs: [dimensionType.STATION_GROUP] },
      [xAxisKey.FACTORY_ID]: { text: i18n.global.t('Factories'), value: xAxisKey.FACTORY_ID, requestGroupByArgs: [dimensionType.FACTORY] },
      [xAxisKey.SINGLE_OPERATOR]: { text: i18n.global.t('Operators'), value: xAxisKey.SINGLE_OPERATOR, requestGroupByArgs: [dimensionType.SINGLE_OPERATOR] },
      [xAxisKey.SHIFT_TEMPLATE]: { text: i18n.global.t('Shifts'), value: xAxisKey.SHIFT_TEMPLATE, requestGroupByArgs: [dimensionType.SHIFT_TEMPLATE] },
      [xAxisKey.PRODUCT_ID]: { text: i18n.global.t('products'), value: xAxisKey.PRODUCT_ID, requestGroupByArgs: [dimensionType.PRODUCT] },
      [xAxisKey.SKU]: { text: i18n.global.t('Product code'), value: xAxisKey.SKU, requestGroupByArgs: [dimensionType.PRODUCT] },
      [xAxisKey.PRODUCTION_ORDER]: { text: i18n.global.t('Orders'), value: xAxisKey.PRODUCTION_ORDER, requestGroupByArgs: [dimensionType.PRODUCTION_ORDER] },
      [xAxisKey.LOT_CODE]: { text: i18n.global.t('LOT/Batch'), value: xAxisKey.LOT_CODE, requestGroupByArgs: [dimensionType.LOT_CODE] },
      [xAxisKey.PRODUCT_GROUP_ID]: { text: i18n.global.t('Product groups'), value: xAxisKey.PRODUCT_GROUP_ID, requestGroupByArgs: [dimensionType.PRODUCT_GROUP] },
    },
    [TIME_USAGE]: {
      [xAxisKey.STATION_ID]: { text: i18n.global.t('Stations'), value: xAxisKey.STATION_ID, requestGroupByArgs: [dimensionType.STATION] },
      [xAxisKey.STATION_GROUP_ID]: { text: i18n.global.t('Station groups'), value: xAxisKey.STATION_GROUP_ID, requestGroupByArgs: [dimensionType.STATION_GROUP] },
      [xAxisKey.FACTORY_ID]: { text: i18n.global.t('Factories'), value: xAxisKey.FACTORY_ID, requestGroupByArgs: [dimensionType.FACTORY] },
      [xAxisKey.SINGLE_OPERATOR]: { text: i18n.global.t('Operators'), value: xAxisKey.SINGLE_OPERATOR, requestGroupByArgs: [dimensionType.SINGLE_OPERATOR] },
      [xAxisKey.PRODUCT_ID]: { text: i18n.global.t('products'), value: xAxisKey.PRODUCT_ID, requestGroupByArgs: [dimensionType.PRODUCT] },
      [xAxisKey.SKU]: { text: i18n.global.t('Product code'), value: xAxisKey.SKU, requestGroupByArgs: [dimensionType.PRODUCT] },
      [xAxisKey.PRODUCTION_ORDER]: { text: i18n.global.t('Orders'), value: xAxisKey.PRODUCTION_ORDER, requestGroupByArgs: [dimensionType.PRODUCTION_ORDER] },
      [xAxisKey.LOT_CODE]: { text: i18n.global.t('LOT/Batch'), value: xAxisKey.LOT_CODE, requestGroupByArgs: [dimensionType.LOT_CODE] },
      [xAxisKey.PRODUCT_GROUP_ID]: { text: i18n.global.t('Product groups'), value: xAxisKey.PRODUCT_GROUP_ID, requestGroupByArgs: [dimensionType.PRODUCT_GROUP] },
      [xAxisKey.SHIFT_TEMPLATE]: { text: i18n.global.t('Shifts'), value: xAxisKey.SHIFT_TEMPLATE, requestGroupByArgs: [dimensionType.SHIFT_TEMPLATE] },
    },
    [CHECKLIST]: {
      // groupBy id must be used due to versioning, if name is changed within period it shows both names for data-point comma separated
      [xAxisKey.ENTITY_ID]: { text: i18n.global.t('Checklists'), value: xAxisKey.ENTITY_ID, requestGroupByArgs: ['checklistId'] },
      [xAxisKey.ENTITY_GROUP_ID]: { text: i18n.global.t('Checklist groups'), value: xAxisKey.ENTITY_GROUP_ID, requestGroupByArgs: ['checklistgroupId'] },
      [xAxisKey.STATION_ID]: { text: i18n.global.t('Stations'), value: xAxisKey.STATION_ID, requestGroupByArgs: [dimensionType.STATION] },
      [xAxisKey.STATION_GROUP_ID]: { text: i18n.global.t('Station groups'), value: xAxisKey.STATION_GROUP_ID, requestGroupByArgs: [dimensionType.STATION_GROUP] },
      [xAxisKey.FACTORY_ID]: { text: i18n.global.t('Factories'), value: xAxisKey.FACTORY_ID, requestGroupByArgs: [dimensionType.FACTORY] },
      [xAxisKey.SINGLE_OPERATOR]: { text: i18n.global.t('Operators'), value: xAxisKey.SINGLE_OPERATOR, requestGroupByArgs: [dimensionType.SINGLE_OPERATOR] },
      [xAxisKey.CHECKLIST_DONE_BY]: { text: i18n.global.t('Done by'), value: 'doneBy', requestGroupByArgs: [dimensionType.CHECKLIST_DONE_BY] },
      [xAxisKey.PRODUCT_ID]: { text: i18n.global.t('products'), value: xAxisKey.PRODUCT_ID, requestGroupByArgs: [dimensionType.PRODUCT] },
      [xAxisKey.SKU]: { text: i18n.global.t('Product code'), value: xAxisKey.SKU, requestGroupByArgs: [dimensionType.PRODUCT] },
      [xAxisKey.PRODUCT_GROUP_ID]: { text: i18n.global.t('Product groups'), value: xAxisKey.PRODUCT_GROUP_ID, requestGroupByArgs: [dimensionType.PRODUCT_GROUP] },
      [xAxisKey.SHIFT_TEMPLATE]: { text: i18n.global.t('Shifts'), value: xAxisKey.SHIFT_TEMPLATE, requestGroupByArgs: [dimensionType.SHIFT_TEMPLATE] },
    },
    [PRODUCTION_SPEED]: {
      [xAxisKey.SECOND_PER_UNIT]: {
        text: getProductionSpeedTextMethod(runtimeType.SECOND_PER_UNIT),
        value: xAxisKey.SECOND_PER_UNIT,
        requestGroupByArgs: ['sec/unit'],
      },
      [xAxisKey.UNIT_PER_SECOND]: {
        text: getProductionSpeedTextMethod(runtimeType.UNIT_PER_SECOND),
        value: xAxisKey.UNIT_PER_SECOND,
        requestGroupByArgs: ['unit/sec'],
      },
      [xAxisKey.UNIT_PER_MINUTE]: {
        text: getProductionSpeedTextMethod(runtimeType.UNIT_PER_MINUTE),
        value: xAxisKey.UNIT_PER_MINUTE,
        requestGroupByArgs: ['unit/min'],
      },
      [xAxisKey.UNIT_PER_HOUR]: {
        text: getProductionSpeedTextMethod(runtimeType.UNIT_PER_HOUR),
        value: xAxisKey.UNIT_PER_HOUR,
        requestGroupByArgs: ['unit/hour'],
      },
    },
  };
}
