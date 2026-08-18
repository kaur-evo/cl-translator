import runtimeType from '@/constants/runtimeType';

const xAxisKey = {
  STATION_ID: 'stationId',
  STATION_GROUP_ID: 'stationGroupId',
  FACTORY_ID: 'factoryId',
  SINGLE_OPERATOR: 'singleOperator',
  PRODUCT_ID: 'productId',
  PRODUCT_GROUP_ID: 'productGroupId',
  SKU: 'sku',
  LOT_CODE: 'lotCode',
  PRODUCTION_ORDER: 'productionOrder',
  SHIFT_TEMPLATE: 'shiftTemplate',
  OPERATOR: 'operator',
  ENTITY_ID: 'entityId',
  ENTITY_GROUP_ID: 'entityGroupId',
  ENTITY_COUNT: 'entityCount',
  POSITION_ID: 'positionId',
  PERFORMANCE_POSITION_ID: 'performancePositionId',
  CHECKLIST_DONE_BY: 'doneBy',
  SECOND_PER_UNIT: runtimeType.SECOND_PER_UNIT,
  UNIT_PER_SECOND: runtimeType.UNIT_PER_SECOND,
  UNIT_PER_MINUTE: runtimeType.UNIT_PER_MINUTE,
  UNIT_PER_HOUR: runtimeType.UNIT_PER_HOUR,
} as const;

export type XAxisKey = typeof xAxisKey[keyof typeof xAxisKey];

export default xAxisKey;
