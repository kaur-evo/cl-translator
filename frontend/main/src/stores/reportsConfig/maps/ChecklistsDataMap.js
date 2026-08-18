import { formatSetAsStr, formatListAsStr, formatSetOrValAsArray } from '@/stores/reportsConfig/configurations/formatsConfiguration';
import ReportsDataMap from '@/stores/reportsConfig/maps/ReportsDataMap';
import specialKey from '@/stores/reportsConfig/constants/specialKey';

const getTotalCount = (val, obj) => obj.missedGroupTotalQty || obj.successfulGroupTotalQty || obj.unsuccessfulGroupTotalQty;

const getMissedCount = (val, obj) => obj.missedGroupMissedQty || 0;
const getSuccessfulCount = (val, obj) => obj.successfulGroupSuccessfulQty || 0;
const getUnsuccessfulCount = (val, obj) => obj.unsuccessfulGroupUnsuccessfulQty || 0;
const getCurrentGroupCount = (val, obj) => getMissedCount(val, obj) + getSuccessfulCount(val, obj) + getUnsuccessfulCount(val, obj);

const getMissedTime = (val, obj) => obj.missedGroupMissedTime || 0;
const getSuccessfultime = (val, obj) => obj.successfulGroupSuccessfulTime || 0;
const getUnsuccesfulTime = (val, obj) => obj.unsuccessfulGroupUnsuccessfulTime || 0;
const getCurrentGroupTime = (val, obj) => getMissedTime(val, obj) + getSuccessfultime(val, obj) + getUnsuccesfulTime(val, obj);

const getMissedCountPct = (val, obj) => {
  const ret = getMissedCount(val, obj) / getTotalCount(val, obj);
  return Number.isFinite(ret) ? ret : 0;
};
const getSuccessfulCountPct = (val, obj) => {
  const ret = getSuccessfulCount(val, obj) / getTotalCount(val, obj);
  return Number.isFinite(ret) ? ret : 0;
};
const getUnsccessfulCountPct = (val, obj) => {
  const ret = getUnsuccessfulCount(val, obj) / getTotalCount(val, obj);
  return Number.isFinite(ret) ? ret : 0;
};

const getCurrentGroupTimeAvg = (val, obj) => {
  const ret = getCurrentGroupTime(val, obj) / (getCurrentGroupCount(val, obj) - getMissedCount(val, obj));
  return Number.isFinite(ret) ? ret : 0;
};

const getCurrentGroupCountPct = (val, obj) => {
  const ret = getCurrentGroupCount(val, obj) / getTotalCount(val, obj);
  return Number.isFinite(ret) ? ret : 0;
};

export default class ChecklistsDataMap extends ReportsDataMap {
  getPctFormatted(val, options = {}) {
    return this.formatPercentage(val * 100, options);
  }

  inputItemDefaults = {
    isFake: false,
  };

  get keyMap() {
    return new Map([
      [specialKey.PREPROCESSED_GROUP_ID_KEY, specialKey.PREPROCESSED_GROUP_ID_KEY],
      ['successfulGroupTotalQty', 'successfulGroupTotalQty'],
      ['successfulGroupSuccessfulQty', 'successfulGroupSuccessfulQty'],
      ['unsuccessfulGroupTotalQty', 'unsuccessfulGroupTotalQty'],
      ['unsuccessfulGroupUnsuccessfulQty', 'unsuccessfulGroupUnsuccessfulQty'],
      ['missedGroupTotalQty', 'missedGroupTotalQty'],
      ['missedGroupMissedQty', 'missedGroupMissedQty'],
      ['successfulGroupSuccessfulTime', 'successfulGroupSuccessfulTime'],
      ['unsuccessfulGroupUnsuccessfulTime', 'unsuccessfulGroupUnsuccessfulTime'],
      ['missedGroupMissedTime', 'missedGroupMissedTime'],
      ['checklistpinId', 'checklistpinId'],
      ['checklistpin', 'checklistpin'],
      ['entityKey', 'entityKey'],
      ['entityId', 'checklistId'],
      ['entityName', 'checklist'],
      ['shiftTemplate', 'shifttemplate'],
      ['shiftTemplateLabel', 'shifttemplatelabel'],
      ['operatorId', 'singleoperatorId'],
      ['operator', 'operator'],
      ['singleOperator', 'singleoperator'],
      ['stationId', 'stationId'],
      ['entityGroupId', 'checklistgroupId'],
      ['entityGroupName', 'entityGroupName'],
      ['checklistGroupName', 'checklistgroup'],
      ['notesCount', 'notescount'],
      ['product', 'product'],
      ['productId', 'productId'],
      ['productGroup', 'productgroup'],
      ['productGroupId', 'productgroupId'],
      ['sku', 'sku'],
      ['skuLabel', 'skulabel'],
      ['station', 'station'],
      ['stationGroupId', 'stationgroupId'],
      ['stationGroup', 'stationgroup'],
      ['factoryId', 'factoryId'],
      ['factory', 'factory'],
      ['entityCount', null],
      ['entityCountPct', null],
      ['entityCountPctFormatted', null],
      ['entityCountPctFormatted-0', null],
      ['entityCountPctFormatted-1', null],
      ['entityCountPctFormatted-2', null],

      ['unsuccessfulChecks', null],
      ['unsuccessfulChecksPctFormatted', null],
      ['successfulChecks', null],
      ['successfulChecksPctFormatted', null],
      ['missedChecks', null],
      ['missedChecksPctFormatted', null],
      ['checkType', 'checkType'],
      ['color', 'color'],

      ['xScaleValue', this.xScaleValueKey],
      ['xScaleValueFormatted', this.xScaleValueKey],
      ['groupingKey', null],

      ['tooltipXLabel', this.xScaleValueLabelKey],
      ['measureLabel', this.xScaleValueLabelKey],
      ['tableTimeLabel', this.xScaleValueLabelKey],

      ['itemGroupingId', this.itemGroupingIdKey],
      ['isFake', 'isFake'],
      ['avgTime', null],
      ['avgTimeVal', null],
      ['avgTimeFormatted', null],
      ['medianCheckTime', 'medianCheckDuration'],
      ['medianCheckTimeFormatted', 'medianCheckDuration'],
      ['defined', null],
      ['doneBy', 'doneBy'],
    ]);
  }

  get formatMap() {
    const map = new Map([
      ['entityKey', () => 'checklistId'],
      ['value', getCurrentGroupCount],
      ['groupingKey', () => this.getGroupingKey()],
      ['tooltipXLabel', (val) => this.getXScaleLabel(val, this.xScaleTooltipFormat)],
      ['measureLabel', (val) => this.getXScaleLabel(val, this.xScaleLabelFormat)],
      ['tableTimeLabel', (val) => this.getXScaleLabel(val, this.xScaleTableLabelFormat)],

      ['avgTime', getCurrentGroupTimeAvg],
      ['avgTimeVal', (val, obj) => new Date(getCurrentGroupTimeAvg(val, obj) * 1000)],
      ['avgTimeFormatted', (val, obj) => this.formatSecondsReadable(getCurrentGroupTimeAvg(val, obj))],

      ['medianCheckTime', formatSetAsStr],
      ['medianCheckTimeFormatted', (val, obj) => {
        const valueStr = formatSetAsStr(val, obj);
        if (Number.isNaN(Number(valueStr))) {
          return '-';
        }
        return this.formatSecondsReadable(valueStr);
      }],

      ['entityCount', getCurrentGroupCount],
      ['entityCountPct', getCurrentGroupCountPct],
      ['entityCountPctFormatted', (val, obj) => this.getPctFormatted(getCurrentGroupCountPct(val, obj), { pctDecimalPlaces: 0 })],

      ['missedChecks', getMissedCount],
      ['missedChecksPctFormatted', (val, obj) => this.getPctFormatted(getMissedCountPct(val, obj))],
      ['successfulChecks', getSuccessfulCount],
      ['successfulChecksPctFormatted', (val, obj) => this.getPctFormatted(getSuccessfulCountPct(val, obj))],
      ['unsuccessfulChecks', getUnsuccessfulCount],
      ['unsuccessfulChecksPctFormatted', (val, obj) => this.getPctFormatted(getUnsccessfulCountPct(val, obj))],

      ['xScaleValueFormatted', (val) => this.granularityLabelFormatter(val, this.xScaleTooltipFormat)],

      ['entityCountLabel', (val) => this.formatNumber(val)],

      ['entitySubType', (val) => formatListAsStr(val ? Array.from(val)?.map?.((type) => this.translations[type] ?? type) : [])],
      ['location', formatSetAsStr],
      ['notes', formatSetAsStr],
      ['positionId', formatSetOrValAsArray],
      ['sku', formatSetAsStr],
      ['skuLabel', formatSetAsStr],
      ['factory', formatSetAsStr],
      ['factoryId', formatSetOrValAsArray],

      ['color', (val) => {
        const ret = formatSetAsStr(val);
        if (ret.split(',').length > 1) {
          return '#CDCDCD';
        }
        return ret;
      }],
      ['entityName', formatSetAsStr],
      ['checklistGroupName', formatSetAsStr],
      ['notesCount', (value) => value ?? 0],
      ['entityGroupName', formatSetAsStr],
      ['entityId', formatSetOrValAsArray],
      ['entityGroupId', formatSetOrValAsArray],
      ['productId', formatSetOrValAsArray],
      ['productGroupId', formatSetOrValAsArray],
      ['product', formatSetAsStr],
      ['productGroup', formatSetAsStr],
      ['operatorId', formatSetOrValAsArray],
      ['station', formatSetAsStr],
      ['stationGroup', formatSetAsStr],
      ['stationId', formatSetOrValAsArray],
      ['stationGroupId', formatSetOrValAsArray],
      ['shiftTemplate', formatSetAsStr],
      ['shiftTemplateLabel', formatSetAsStr],
      ['singleOperator', formatSetAsStr],
      ['operatorId', formatSetOrValAsArray],

      ['checklistpin', formatSetAsStr],
      ['checklistpinId', formatSetAsStr],

      ['defined', () => true],
      ['doneBy', formatSetAsStr],
    ]);

    const userPctDecimalPlaces = this.numberFormattingOptions.pctDecimalPlaces;

    const maxDecimals = 3;
    Array.from(Array(maxDecimals).keys()).forEach((idx) => {
      map.set(`entityCountPctFormatted-${idx}`, (val, obj) => this.getPctFormatted(getCurrentGroupCountPct(val, obj), { pctDecimalPlaces: Math.min(idx, userPctDecimalPlaces) }));
    });

    return map;
  }

  idKeyNameKeyMap = {
    checklistId: 'checklist',
    checklistgroupId: 'checklistgroup',
    checkType: 'checkType',
    stationId: 'station',
    stationgroupId: 'stationgroup',
    factoryId: 'factory',
    singleoperator: 'singleoperator',
    shifttemplate: 'shifttemplate',
    productId: 'product',
    productgroupId: 'productgroup',
    sku: 'sku',
    doneBy: 'doneBy',
    default: 'checklist',
  };
}
