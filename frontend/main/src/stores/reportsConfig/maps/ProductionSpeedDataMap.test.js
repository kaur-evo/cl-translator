import { describe, it, expect } from 'vitest';

import ProductionSpeedDataMap from './ProductionSpeedDataMap';

import colorConstants from '@/constants/colorConstants';
import graphColors from '@/constants/graphColors';

describe('ProductionSpeedDataMap', () => {
  let productionSpeedDataMap;

  beforeEach(() => {
    productionSpeedDataMap = new ProductionSpeedDataMap();
    productionSpeedDataMap.groupBy = ['SECOND_PER_UNIT'];
  });

  it('should have correct default input item values', () => {
    expect(productionSpeedDataMap.inputItemDefaults).toEqual({
      rangeKey: '',
      rangeStart: null,
      rangeEnd: null,
      factoryId: [],
      factory: [],
      stationId: [],
      station: [],
      stationgroupId: [],
      stationgroup: [],
      productId: [],
      product: [],
      productgroupId: [],
      productgroup: [],
      operator: [],
      shifttemplate: [],
      sku: [],
      isFake: false,
    });
  });

  it('should have correct keyMap values', () => {
    const { keyMap } = productionSpeedDataMap;
    expect(keyMap.get('entityKey')).toBe(null);
    expect(keyMap.get('isFasterThanTarget')).toBe('isFasterThanTarget');
    expect(keyMap.get('rangeKey')).toBe('rangekey');
    expect(keyMap.get('rangeStart')).toBe('rangestart');
    expect(keyMap.get('rangeEnd')).toBe('rangeend');
    expect(keyMap.get('target')).toBe('target');
    expect(keyMap.get('mode')).toBe('mode');
    expect(keyMap.get('productionTime')).toBe('productiontime');
    expect(keyMap.get('productionTimeDt')).toBe('productiontime');
    expect(keyMap.get('productionCount')).toBe('count');
    expect(keyMap.get('productionTimeLabel')).toBe('productiontime');
    expect(keyMap.get('productionCountLabel')).toBe('count');
    expect(keyMap.get('modeLabel')).toBe('mode');
    expect(keyMap.get('targetLabel')).toBe('target');
    expect(keyMap.get('isMarker')).toBe('isMarker');
    expect(keyMap.get('entityGroupName')).toBe('entityGroupName');
    expect(keyMap.get('containsTarget')).toBe('containsTarget');
    expect(keyMap.get('containsMode')).toBe('containsMode');
    expect(keyMap.get('unitId')).toBe('unitid');
    expect(keyMap.get('belowTargetCount')).toBe('belowTargetCount');
    expect(keyMap.get('entityName')).toBe('rangekey');
    expect(keyMap.get('factoryId')).toBe('factoryId');
    expect(keyMap.get('factory')).toBe('factory');
    expect(keyMap.get('stationId')).toBe('stationId');
    expect(keyMap.get('location')).toBe('stoplocation');
    expect(keyMap.get('positionId')).toBe('positionId');
    expect(keyMap.get('product')).toBe('product');
    expect(keyMap.get('productId')).toBe('productId');
    expect(keyMap.get('productGroup')).toBe('productgroup');
    expect(keyMap.get('productGroupId')).toBe('productgroupId');
    expect(keyMap.get('shiftTemplate')).toBe('shifttemplate');
    expect(keyMap.get('operatorId')).toBe('singleoperatorId');
    expect(keyMap.get('operator')).toBe('operator');
    expect(keyMap.get('singleOperator')).toBe('singleoperator');
    expect(keyMap.get('station')).toBe('station');
    expect(keyMap.get('stationGroupId')).toBe('stationgroupId');
    expect(keyMap.get('stationGroup')).toBe('stationgroup');
    expect(keyMap.get('sku')).toBe('sku');
    expect(keyMap.get('value')).toBe('count');
    expect(keyMap.get('color')).toBe(null);
    expect(keyMap.get('binOrder')).toBe(null);
    expect(keyMap.get('xScaleValue')).toBe(productionSpeedDataMap.xScaleValueKey);
    expect(keyMap.get('groupingKey')).toBe(productionSpeedDataMap.xScaleValueKey);
    expect(keyMap.get('measureLabel')).toBe(productionSpeedDataMap.xScaleValueLabelKey);
    expect(keyMap.get('tableTimeLabel')).toBe(productionSpeedDataMap.xScaleValueLabelKey);
    expect(keyMap.get('isFake')).toBe('isFake');
    expect(keyMap.get('defined')).toBe(null);
    expect(keyMap.get('noData')).toBe('noData');
  });

  it('should have correct formatMap values', () => {
    const { formatMap } = productionSpeedDataMap;
    expect(formatMap.get('entityKey')()).toBe('rangekey');
    expect(formatMap.get('value')(null)).toBe(0);
    expect(formatMap.get('value')(5)).toBe(5);
    expect(formatMap.get('color')(null, { isFasterThanTarget: true })).toBe(colorConstants.light.primary);
    expect(formatMap.get('color')(null, { isFasterThanTarget: false })).toBe(graphColors['graph-yellow']);
    expect(formatMap.get('entityName')('test')).toBe('test');
    expect(formatMap.get('station')('test')).toBe('test');
    expect(formatMap.get('stationGroup')('test')).toBe('test');
    expect(formatMap.get('location')('test')).toBe('test');
    expect(formatMap.get('product')('test')).toBe('test');
    expect(formatMap.get('productGroup')('test')).toBe('test');
    expect(formatMap.get('shiftTemplate')('test')).toBe('test');
    expect(formatMap.get('singleOperator')('test')).toBe('test');
    expect(formatMap.get('entityId')('test')).toEqual(['test']);
    expect(formatMap.get('productId')('test')).toEqual(['test']);
    expect(formatMap.get('productGroupId')('test')).toEqual(['test']);
    expect(formatMap.get('operatorId')('test')).toEqual(['test']);
    expect(formatMap.get('stationId')('test')).toEqual(['test']);
    expect(formatMap.get('stationGroupId')('test')).toEqual(['test']);
    expect(formatMap.get('positionId')('test')).toEqual(['test']);
    expect(formatMap.get('sku')('test')).toBe('test');
    expect(formatMap.get('factory')('test')).toBe('test');
    expect(formatMap.get('factoryId')('test')).toEqual(['test']);
    expect(formatMap.get('entityGroupName')('test')).toBe('test');
    expect(formatMap.get('target')('test')).toBe('test');
    expect(formatMap.get('targetLabel')(123.345)).toBe('123,35');
    expect(formatMap.get('mode')('test')).toBe('test');
    expect(formatMap.get('modeLabel')(123.345)).toBe('123,35');
    expect(formatMap.get('productionTimeLabel')(60)).toBe('01m 00s');
    expect(formatMap.get('productionCountLabel')(1000)).toBe('1 000');
    expect(formatMap.get('unitId')('test')).toBe('test');
    expect(formatMap.get('productionTimeDt')(1609459200)).toEqual(new Date(1609459200000));
    expect(formatMap.get('binOrder')(null, { rangeEnd: 1 })).toBe(1);
    expect(formatMap.get('defined')(null, { isFake: false })).toBe(true);
  });

  it('should have correct idKeyMap values', () => {
    expect(productionSpeedDataMap.idKeyMap.default).toBe('rangekey');
  });

  it('should have correct idKeyNameKeyMap values', () => {
    expect(productionSpeedDataMap.idKeyNameKeyMap.default).toBe('midPoint');
  });
});
