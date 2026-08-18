import { describe, it, expect } from 'vitest';

import granularity from '../constants/granularity';

import ChecklistsDataMap from './ChecklistsDataMap';

describe('ChecklistsDataMap', () => {
  let instance;

  beforeEach(() => {
    instance = new ChecklistsDataMap();
    instance.groupBy = [granularity.DATE];
  });

  it('should have correct formatMap keys and values', () => {
    const { formatMap } = instance;
    expect(formatMap.get('entityKey')()).toBe('checklistId');
    expect(formatMap.get('value')).toBeInstanceOf(Function);
    expect(formatMap.get('groupingKey')).toBeInstanceOf(Function);
    expect(formatMap.get('tooltipXLabel')).toBeInstanceOf(Function);
    expect(formatMap.get('measureLabel')).toBeInstanceOf(Function);
    expect(formatMap.get('tableTimeLabel')).toBeInstanceOf(Function);
    expect(formatMap.get('avgTime')).toBeInstanceOf(Function);
    expect(formatMap.get('avgTimeVal')).toBeInstanceOf(Function);
    expect(formatMap.get('avgTimeFormatted')).toBeInstanceOf(Function);
    expect(formatMap.get('medianCheckTime')).toBeInstanceOf(Function);
    expect(formatMap.get('medianCheckTimeFormatted')).toBeInstanceOf(Function);
    expect(formatMap.get('entityCount')).toBeInstanceOf(Function);
    expect(formatMap.get('entityCountPct')).toBeInstanceOf(Function);
    expect(formatMap.get('entityCountPctFormatted')).toBeInstanceOf(Function);
    expect(formatMap.get('missedChecks')).toBeInstanceOf(Function);
    expect(formatMap.get('missedChecksPctFormatted')).toBeInstanceOf(Function);
    expect(formatMap.get('successfulChecks')).toBeInstanceOf(Function);
    expect(formatMap.get('successfulChecksPctFormatted')).toBeInstanceOf(Function);
    expect(formatMap.get('unsuccessfulChecks')).toBeInstanceOf(Function);
    expect(formatMap.get('unsuccessfulChecksPctFormatted')).toBeInstanceOf(Function);
    expect(formatMap.get('entityCountLabel')).toBeInstanceOf(Function);
    expect(formatMap.get('entitySubType')).toBeInstanceOf(Function);
    expect(formatMap.get('location')).toBeInstanceOf(Function);
    expect(formatMap.get('notes')).toBeInstanceOf(Function);
    expect(formatMap.get('positionId')).toBeInstanceOf(Function);
    expect(formatMap.get('sku')).toBeInstanceOf(Function);
    expect(formatMap.get('factory')).toBeInstanceOf(Function);
    expect(formatMap.get('factoryId')).toBeInstanceOf(Function);
    expect(formatMap.get('color')).toBeInstanceOf(Function);
    expect(formatMap.get('entityName')).toBeInstanceOf(Function);
    expect(formatMap.get('checklistGroupName')).toBeInstanceOf(Function);
    expect(formatMap.get('notesCount')).toBeInstanceOf(Function);
    expect(formatMap.get('entityGroupName')).toBeInstanceOf(Function);
    expect(formatMap.get('entityId')).toBeInstanceOf(Function);
    expect(formatMap.get('entityGroupId')).toBeInstanceOf(Function);
    expect(formatMap.get('productId')).toBeInstanceOf(Function);
    expect(formatMap.get('productGroupId')).toBeInstanceOf(Function);
    expect(formatMap.get('product')).toBeInstanceOf(Function);
    expect(formatMap.get('productGroup')).toBeInstanceOf(Function);
    expect(formatMap.get('operatorId')).toBeInstanceOf(Function);
    expect(formatMap.get('station')).toBeInstanceOf(Function);
    expect(formatMap.get('stationGroup')).toBeInstanceOf(Function);
    expect(formatMap.get('stationId')).toBeInstanceOf(Function);
    expect(formatMap.get('stationGroupId')).toBeInstanceOf(Function);
    expect(formatMap.get('shiftTemplate')).toBeInstanceOf(Function);
    expect(formatMap.get('singleOperator')).toBeInstanceOf(Function);
    expect(formatMap.get('operatorId')).toBeInstanceOf(Function);
    expect(formatMap.get('checklistpin')).toBeInstanceOf(Function);
    expect(formatMap.get('checklistpinId')).toBeInstanceOf(Function);
    expect(formatMap.get('defined')).toBeInstanceOf(Function);
    expect(formatMap.get('doneBy')).toBeInstanceOf(Function);

    // const userPctDecimalPlaces = instance.numberFormattingOptions.pctDecimalPlaces;
    Array.from(Array(3).keys()).forEach((idx) => {
      expect(formatMap.get(`entityCountPctFormatted-${idx}`)).toBeInstanceOf(Function);
    });
  });

  it('should have correct keyMap keys and values', () => {
    const { keyMap } = instance;
    expect(keyMap.get('successfulGroupTotalQty')).toBe('successfulGroupTotalQty');
    expect(keyMap.get('successfulGroupSuccessfulQty')).toBe('successfulGroupSuccessfulQty');
    expect(keyMap.get('unsuccessfulGroupTotalQty')).toBe('unsuccessfulGroupTotalQty');
    expect(keyMap.get('unsuccessfulGroupUnsuccessfulQty')).toBe('unsuccessfulGroupUnsuccessfulQty');
    expect(keyMap.get('missedGroupTotalQty')).toBe('missedGroupTotalQty');
    expect(keyMap.get('missedGroupMissedQty')).toBe('missedGroupMissedQty');
    expect(keyMap.get('successfulGroupSuccessfulTime')).toBe('successfulGroupSuccessfulTime');
    expect(keyMap.get('unsuccessfulGroupUnsuccessfulTime')).toBe('unsuccessfulGroupUnsuccessfulTime');
    expect(keyMap.get('missedGroupMissedTime')).toBe('missedGroupMissedTime');
    expect(keyMap.get('checklistpinId')).toBe('checklistpinId');
    expect(keyMap.get('checklistpin')).toBe('checklistpin');
    expect(keyMap.get('entityKey')).toBe('entityKey');
    expect(keyMap.get('entityId')).toBe('checklistId');
    expect(keyMap.get('entityName')).toBe('checklist');
    expect(keyMap.get('shiftTemplate')).toBe('shifttemplate');
    expect(keyMap.get('operatorId')).toBe('singleoperatorId');
    expect(keyMap.get('operator')).toBe('operator');
    expect(keyMap.get('singleOperator')).toBe('singleoperator');
    expect(keyMap.get('stationId')).toBe('stationId');
    expect(keyMap.get('entityGroupId')).toBe('checklistgroupId');
    expect(keyMap.get('entityGroupName')).toBe('entityGroupName');
    expect(keyMap.get('checklistGroupName')).toBe('checklistgroup');
    expect(keyMap.get('notesCount')).toBe('notescount');
    expect(keyMap.get('product')).toBe('product');
    expect(keyMap.get('productId')).toBe('productId');
    expect(keyMap.get('productGroup')).toBe('productgroup');
    expect(keyMap.get('productGroupId')).toBe('productgroupId');
    expect(keyMap.get('sku')).toBe('sku');
    expect(keyMap.get('station')).toBe('station');
    expect(keyMap.get('stationGroupId')).toBe('stationgroupId');
    expect(keyMap.get('stationGroup')).toBe('stationgroup');
    expect(keyMap.get('factoryId')).toBe('factoryId');
    expect(keyMap.get('factory')).toBe('factory');
    expect(keyMap.get('entityCount')).toBeNull();
    expect(keyMap.get('entityCountPct')).toBeNull();
    expect(keyMap.get('entityCountPctFormatted')).toBeNull();
    expect(keyMap.get('entityCountPctFormatted-0')).toBeNull();
    expect(keyMap.get('entityCountPctFormatted-1')).toBeNull();
    expect(keyMap.get('entityCountPctFormatted-2')).toBeNull();
    expect(keyMap.get('unsuccessfulChecks')).toBeNull();
    expect(keyMap.get('unsuccessfulChecksPctFormatted')).toBeNull();
    expect(keyMap.get('successfulChecks')).toBeNull();
    expect(keyMap.get('successfulChecksPctFormatted')).toBeNull();
    expect(keyMap.get('missedChecks')).toBeNull();
    expect(keyMap.get('missedChecksPctFormatted')).toBeNull();
    expect(keyMap.get('checkType')).toBe('checkType');
    expect(keyMap.get('color')).toBe('color');
    expect(keyMap.get('xScaleValue')).toBe(instance.xScaleValueKey);
    expect(keyMap.get('groupingKey')).toBe(null);
    expect(keyMap.get('tooltipXLabel')).toBe(instance.xScaleValueLabelKey);
    expect(keyMap.get('measureLabel')).toBe(instance.xScaleValueLabelKey);
    expect(keyMap.get('tableTimeLabel')).toBe(instance.xScaleValueLabelKey);
    expect(keyMap.get('itemGroupingId')).toBe(instance.itemGroupingIdKey);
    expect(keyMap.get('isFake')).toBe('isFake');
    expect(keyMap.get('avgTime')).toBeNull();
    expect(keyMap.get('avgTimeVal')).toBeNull();
    expect(keyMap.get('avgTimeFormatted')).toBeNull();
    expect(keyMap.get('medianCheckTime')).toBe('medianCheckDuration');
    expect(keyMap.get('medianCheckTimeFormatted')).toBe('medianCheckDuration');
    expect(keyMap.get('defined')).toBeNull();
    expect(keyMap.get('doneBy')).toBe('doneBy');
  });

  it('should have correct idKeyNameKeyMap keys and values', () => {
    const { idKeyNameKeyMap } = instance;
    expect(idKeyNameKeyMap.checklistId).toBe('checklist');
    expect(idKeyNameKeyMap.checklistgroupId).toBe('checklistgroup');
    expect(idKeyNameKeyMap.checkType).toBe('checkType');
    expect(idKeyNameKeyMap.stationId).toBe('station');
    expect(idKeyNameKeyMap.stationgroupId).toBe('stationgroup');
    expect(idKeyNameKeyMap.factoryId).toBe('factory');
    expect(idKeyNameKeyMap.singleoperator).toBe('singleoperator');
    expect(idKeyNameKeyMap.shifttemplate).toBe('shifttemplate');
    expect(idKeyNameKeyMap.productId).toBe('product');
    expect(idKeyNameKeyMap.productgroupId).toBe('productgroup');
    expect(idKeyNameKeyMap.sku).toBe('sku');
    expect(idKeyNameKeyMap.doneBy).toBe('doneBy');
    expect(idKeyNameKeyMap.default).toBe('checklist');
  });

  it('should format percentage correctly', () => {
    const pct = instance.getPctFormatted(0.1234);
    expect(pct).toBe('12,34%');
  });

  it('should format seconds to readable format correctly', () => {
    const readable = instance.formatSecondsReadable(3661);
    expect(readable).toBe('1h 01m 01s');
  });

  it('should format number correctly', () => {
    const formattedNumber = instance.formatNumber(1234567.89);
    expect(formattedNumber).toBe('1 234 567,89');
  });

  it('should return correct groupingKey', () => {
    const groupingKey = instance.getGroupingKey();
    expect(groupingKey).toBe(instance.xScaleValueKey);
  });

  it('should return correct itemGroupingIdKey', () => {
    const { itemGroupingIdKey } = instance;
    expect(itemGroupingIdKey).toBe(instance.itemGroupingIdKey);
  });
});
