import config from '@/stores/reportsConfig/constants/configType';
import granularity from '@/stores/reportsConfig/constants/granularity';
import specialKey from '@/stores/reportsConfig/constants/specialKey';
import xAxisKey from '@/stores/reportsConfig/constants/xAxisKey';

export function getPrimaryGroupBy(configType, _requirements) {
  const commonGroupKeysMap = {
    [xAxisKey.FACTORY_ID]: 'factoryId',
    [xAxisKey.STATION_ID]: 'stationId',
    [xAxisKey.STATION_GROUP_ID]: 'stationgroupId',
    [xAxisKey.SINGLE_OPERATOR]: 'singleoperator',
    [xAxisKey.SHIFT_TEMPLATE]: 'shifttemplate',
    [xAxisKey.PRODUCT_ID]: 'productId',
    [xAxisKey.PRODUCT_GROUP_ID]: 'productgroupId',
    [xAxisKey.SKU]: 'sku',
    [xAxisKey.LOT_CODE]: 'lotCode',
    [xAxisKey.PRODUCTION_ORDER]: 'productionOrder',
  };
  const configGroupByMap = new Map([
    [config.DOWNTIME, {
      [xAxisKey.ENTITY_ID]: 'commentId',
      [xAxisKey.ENTITY_GROUP_ID]: 'commentgroupId',
      [xAxisKey.POSITION_ID]: 'positionId',
    }],
    [config.SPEEDLOSS, {
      [xAxisKey.ENTITY_ID]: 'performanceCommentId',
      [xAxisKey.ENTITY_GROUP_ID]: 'performanceCommentGroupId',
      [xAxisKey.PERFORMANCE_POSITION_ID]: 'performancePositionId',
      performancelossinstanceid: 'performancelossinstanceid',
    }],
    [config.SCRAPREASON, {
      [xAxisKey.ENTITY_ID]: 'scrapreasonid',
      [xAxisKey.ENTITY_GROUP_ID]: 'scrapreasongroupid',
    }],
    [config.CHECKLIST, {
      [xAxisKey.ENTITY_ID]: 'checklistId',
      [xAxisKey.ENTITY_GROUP_ID]: 'checklistgroupId',
      [xAxisKey.CHECKLIST_DONE_BY]: 'doneBy',
    }],
    [config.PRODUCTION_SPEED, {
      [xAxisKey.SECOND_PER_UNIT]: 'rangekey',
      [xAxisKey.UNIT_PER_SECOND]: 'rangekey',
      [xAxisKey.UNIT_PER_MINUTE]: 'rangekey',
      [xAxisKey.UNIT_PER_HOUR]: 'rangekey',
    }],
  ]);
  const configSpecificKeysMap = configGroupByMap.get(configType) || {};
  const groupByKeysMap = { ...commonGroupKeysMap, ...configSpecificKeysMap };
  if (_requirements.granularity === granularity.TOTAL) {
    return groupByKeysMap[_requirements.groupBy[0]];
  }
  return _requirements.granularity; // date granularities
}

export function getKeyString(entry, keys) {
  const values = [];
  let valid = true;
  keys.forEach((k) => {
    if (entry[k] === undefined) {
      valid = false;
    } else {
      values.push(entry[k]);
    }
  });
  if (!valid) return null;
  return values.join('-');
}

export function getSecondaryGroupBy(configType, _requirements) {
  const commonGroupKeysMap = {
    [xAxisKey.FACTORY_ID]: 'factoryId',
    [xAxisKey.STATION_ID]: 'stationId',
    [xAxisKey.STATION_GROUP_ID]: 'stationgroupId',
    [xAxisKey.SINGLE_OPERATOR]: 'singleoperator',
    [xAxisKey.SHIFT_TEMPLATE]: 'shifttemplate',
    [xAxisKey.PRODUCT_ID]: 'productId',
    [xAxisKey.PRODUCT_GROUP_ID]: 'productgroupId',
    [xAxisKey.SKU]: 'sku',
    [xAxisKey.LOT_CODE]: 'lotCode',
    [xAxisKey.PRODUCTION_ORDER]: 'productionOrder',
  };
  const configGroupByMap = new Map([
    [config.DOWNTIME, {
      [xAxisKey.ENTITY_ID]: 'commentId',
      [xAxisKey.ENTITY_GROUP_ID]: 'commentgroupId',
      [xAxisKey.POSITION_ID]: 'positionId',
    }],
    [config.SPEEDLOSS, {
      [xAxisKey.ENTITY_ID]: 'performanceCommentId',
      [xAxisKey.ENTITY_GROUP_ID]: 'performanceCommentGroupId',
      [xAxisKey.PERFORMANCE_POSITION_ID]: 'performancePositionId',
      performancelossinstanceid: 'performancelossinstanceid',
    }],
    [config.SCRAPREASON, {
      [xAxisKey.ENTITY_ID]: 'scrapreasonid',
      [xAxisKey.ENTITY_GROUP_ID]: 'scrapreasongroupid',
    }],
    [config.CHECKLIST, {
      [xAxisKey.ENTITY_ID]: 'checklistId',
      [xAxisKey.ENTITY_GROUP_ID]: 'checklistgroupId',
      [xAxisKey.CHECKLIST_DONE_BY]: 'doneBy',
    }],
  ]);
  const configSpecificKeysMap = configGroupByMap.get(configType) || {};
  const groupByKeysMap = { ...commonGroupKeysMap, ...configSpecificKeysMap };
  if (_requirements.groupBy.length > 1) {
    return groupByKeysMap[_requirements.groupBy[1]];
  }
  return getPrimaryGroupBy(configType, _requirements); // if no secondary groupBy, return primary twice to maintain consistent 3 groupBy levels for transitioning
}

export function getHighestLevelGroupBy(configType) {
  const groupByMap = new Map([
    [config.OEE, specialKey.PREPROCESSED_GROUP_ID_KEY],
    [config.TIME_USAGE, specialKey.PREPROCESSED_GROUP_ID_KEY],
    [config.QUANTITY, specialKey.PREPROCESSED_GROUP_ID_KEY],
    [config.DOWNTIME, 'commentgroupId'],
    [config.SPEEDLOSS, 'performanceCommentGroupId'],
    [config.SCRAPREASON, 'scrapreasongroupid'],
    [config.CHECKLIST, specialKey.PREPROCESSED_GROUP_ID_KEY],
    [config.PRODUCTION_SPEED, (entry) => getKeyString(entry, ['entityGroupName'])],
  ]);
  return groupByMap.get(configType);
}

export function getHighestLevelGroupBySorting(configType) {
  const groupByMap = new Map([
    [config.OEE, (entry) => getKeyString(entry, [specialKey.PREPROCESSED_ORDER_KEY, specialKey.PREPROCESSED_GROUP_ID_KEY])],
    [config.TIME_USAGE, (entry) => getKeyString(entry, [specialKey.PREPROCESSED_ORDER_KEY, specialKey.PREPROCESSED_GROUP_ID_KEY])],
    [config.QUANTITY, (entry) => getKeyString(entry, [specialKey.PREPROCESSED_ORDER_KEY, specialKey.PREPROCESSED_GROUP_ID_KEY])],
    [config.DOWNTIME, (entry) => getKeyString(entry, ['commentColor', 'commentgroupId'])],
    [config.SPEEDLOSS, (entry) => getKeyString(entry, ['performanceCommentColor', 'performanceCommentGroupId'])],
    [config.SCRAPREASON, (entry) => getKeyString(entry, ['scrapColor', 'scrapreasongroupid'])],
    [config.CHECKLIST, (entry) => getKeyString(entry, [specialKey.PREPROCESSED_ORDER_KEY, specialKey.PREPROCESSED_GROUP_ID_KEY])],
    [config.PRODUCTION_SPEED, (entry) => getKeyString(entry, ['entityGroupName'])],
  ]);
  return groupByMap.get(configType);
}
