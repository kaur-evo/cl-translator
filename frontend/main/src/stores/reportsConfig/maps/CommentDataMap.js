import round from 'lodash/round';

import ReportsDataMap from './ReportsDataMap';

import calcPercentage from '@/helpers/percentage/calcPercentage';
import { formatSetAsStr, formatListAsStr, formatSetOrValAsArray } from '@/stores/reportsConfig/configurations/formatsConfiguration';

function calculateAvgDuration(obj) {
  return round(obj.valueSec / obj.entityCount, 0) || 0;
}
export default class CommentDataMap extends ReportsDataMap {
  // requires granularity, groupBy, secondaryLabels, dataPctTotal

  inputItemDefaults = {
    comment: '',
    commentGroupName: '',
    commentId: '',
    commentGroupId: '',
    stopduration: 0,
    commentColor: '#000000',
    stopcount: 0,
    isFake: false,
  };

  get keyMap() {
    return new Map([
      ['entityKey', 'entityKey'],
      ['entityId', 'commentId'],
      ['entityName', 'comment'],
      ['factoryId', 'factoryId'],
      ['factory', 'factory'],
      ['stationId', 'stationId'],
      ['entityGroupId', 'commentgroupId'],
      ['entityGroupName', 'commentGroupName'],
      ['entitySubType', 'stoptype'],
      ['notesCount', 'notescount'],
      ['notes', 'notes'],
      ['location', 'stoplocation'],
      ['positionId', 'positionId'],
      ['product', 'product'],
      ['productId', 'productId'],
      ['productGroup', 'productgroup'],
      ['productGroupId', 'productgroupId'],
      ['entityCount', 'stopcount'],
      ['entityCountLabel', 'stopcount'],
      ['shiftTemplate', 'shifttemplate'],
      ['shiftTemplateLabel', 'shifttemplatelabel'],
      ['operatorId', 'singleoperatorId'],
      ['operator', 'operator'],
      ['singleOperator', 'singleoperator'],
      ['station', 'station'],
      ['stationGroupId', 'stationgroupId'],
      ['stationGroup', 'stationgroup'],
      ['includedInOeeStops', 'includedinoeestops'],
      ['sku', 'sku'],
      ['skuLabel', 'skulabel'],
      ['lotCode', 'lotCode'],
      ['productionOrder', 'productionOrder'],

      ['value', 'stopduration'],
      ['valueSec', 'stopduration'],
      ['valueLabel', 'stopduration'],

      ['color', 'commentColor'],

      ['totalPlannedTime', 'totalplannedtime'],
      ['rowPlannedTime', 'rowplannedtime'],
      ['idealQty', 'idealqty'],
      ['idealAltQty', 'idealaltqty'],
      ['idealQtyFormatted', 'idealqty'],
      ['idealAltQtyFormatted', 'idealaltqty'],
      ['unitId', 'unitId'],
      ['alternativeUnitId', 'alternativeUnitId'],
      ['entityPctPlannedTime', null],
      ['entityPctPlannedTimeLabel', null],

      ['xScaleValue', this.xScaleValueKey],
      ['xScaleValueFormatted', this.xScaleValueKey],
      ['groupingKey', null],

      ['tooltipXLabel', this.xScaleValueLabelKey],
      ['measureLabel', this.xScaleValueLabelKey],
      ['tableTimeLabel', this.xScaleValueLabelKey],

      ['itemGroupingId', this.itemGroupingIdKey],
      ['isFake', 'isFake'],
      ['avgDuration', null],
      ['avgDurationVal', null],
      ['avgDurationFormatted', null],
      ['defined', null],
      ['noData', 'noData'],
    ]);
  }

  get formatMap() {
    return new Map([
      ['entityKey', () => 'commentId'],
      ['value', (val) => new Date(val * 1000)],
      ['groupingKey', () => this.getGroupingKey()],
      ['tooltipXLabel', (val) => this.getXScaleLabel(val, this.xScaleTooltipFormat)],
      ['measureLabel', (val) => this.getXScaleLabel(val, this.xScaleLabelFormat)],
      ['tableTimeLabel', (val) => this.getXScaleLabel(val, this.xScaleTableLabelFormat)],
      ['avgDurationVal', (val, obj) => new Date(calculateAvgDuration(obj) * 1000)],
      ['entityPctPlannedTime', (val, obj) => calcPercentage(obj, 'includedInOeeStops', obj.rowPlannedTime ? 'rowPlannedTime' : 'totalPlannedTime')],
      ['entityPctPlannedTimeLabel', (val, obj) => this.formatPercentage(calcPercentage(obj, 'includedInOeeStops', obj.rowPlannedTime ? 'rowPlannedTime' : 'totalPlannedTime') * 100)],
      ['valueLabel', (val) => this.formatSecondsReadable(val)],
      ['avgDuration', (val, obj) => calculateAvgDuration(obj)],
      ['avgDurationFormatted', (val, obj) => this.formatSecondsReadable(calculateAvgDuration(obj))],
      ['entityCountLabel', (val) => this.formatNumber(val)],
      ['xScaleValueFormatted', (val) => this.granularityLabelFormatter(val, this.xScaleTooltipFormat)],
      ['idealQtyFormatted', (val, obj) => this.formatNumberFixed(val) + ReportsDataMap.getAppendableUnitId(obj)],
      ['idealAltQtyFormatted', (val, obj) => this.formatNumberFixed(val) + ReportsDataMap.getAppendableAltUnitId(obj)],

      ['color', formatSetAsStr],
      ['entityName', formatSetAsStr],
      ['entityGroupName', formatSetAsStr],
      ['station', formatSetAsStr],
      ['stationGroup', formatSetAsStr],
      ['entitySubType', (val) => formatListAsStr(val ? Array.from(val)?.map?.((type) => this.translations[type] ?? type) : [])],
      ['location', formatSetAsStr],
      ['product', formatSetAsStr],
      ['productGroup', formatSetAsStr],
      ['shiftTemplate', formatSetAsStr],
      ['shiftTemplateLabel', formatSetAsStr],
      ['notes', formatSetAsStr],
      ['singleOperator', formatSetAsStr],
      ['entityId', formatSetOrValAsArray],
      ['entityGroupId', formatSetOrValAsArray],
      ['productId', formatSetOrValAsArray],
      ['productGroupId', formatSetOrValAsArray],
      ['operatorId', formatSetOrValAsArray],
      ['stationId', formatSetOrValAsArray],
      ['stationGroupId', formatSetOrValAsArray],
      ['positionId', formatSetOrValAsArray],
      ['sku', formatSetAsStr],
      ['skuLabel', formatSetAsStr],
      ['lotCode', formatSetAsStr],
      ['productionOrder', formatSetAsStr],
      ['factory', formatSetAsStr],
      ['factoryId', formatSetOrValAsArray],

      ['defined', (val, obj) => !obj.isFake],
    ]);
  }

  idKeyNameKeyMap = {
    commentId: 'comment',
    commentgroupId: 'commentGroupName',
    stationId: 'station',
    factoryId: 'factory',
    stationgroupId: 'stationgroup',
    singleoperator: 'singleoperator',
    shifttemplate: 'shifttemplate',
    productId: 'product',
    productgroupId: 'productgroup',
    sku: 'sku',
    lotCode: 'lotCode',
    productionOrder: 'productionOrder',
    positionId: 'stoplocation',
    default: 'comment',
  };
}
