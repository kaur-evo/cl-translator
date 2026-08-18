import round from 'lodash/round';

import ReportsDataMap from './ReportsDataMap';

import { formatSetAsStr, formatSetOrValAsArray } from '@/stores/reportsConfig/configurations/formatsConfiguration';

function calculateAvgDuration(obj) {
  return round(obj.valueSec / obj.entityCount, 0) || 0;
}

function calculateLossQty(obj) {
  return Math.max((obj.idealQty - obj.rowProducedQty), 0);
}

function calculateLossAltQty(obj) {
  return Math.max((obj.idealAltQty - obj.rowProducedAltQty), 0);
}
export default class PerformanceCommentDataMap extends ReportsDataMap {
  // requires granularity, groupBy, secondaryLabels, dataPctTotal

  inputItemDefaults = {
    performanceComment: '',
    performancelossgroup: '',
    performanceCommentId: '',
    performanceCommentGroupId: '',
    performancelossduration: 0,
    performanceCommentColor: '#000000',
    performancelosscount: 0,
    isFake: false,
  };

  get keyMap() {
    return new Map([
      ['entityKey', 'entityKey'],
      ['entityId', 'performanceCommentId'],
      ['entityName', 'performanceComment'],
      ['stationId', 'stationId'],
      ['entityGroupId', 'performanceCommentGroupId'],
      ['entityGroupName', 'performancelossgroupName'],
      ['notesCount', 'performancelossnotescount'],
      ['notes', 'performancelossnotes'],
      ['location', 'performancelosslocation'],
      ['performancePositionId', 'performancePositionId'],
      ['product', 'product'],
      ['productId', 'productId'],
      ['productGroup', 'productgroup'],
      ['productGroupId', 'productgroupId'],
      ['entityCount', 'performancelosscount'],
      ['entityCountLabel', 'performancelosscount'],
      ['shiftTemplate', 'shifttemplate'],
      ['shiftTemplateLabel', 'shifttemplatelabel'],
      ['operatorId', 'singleoperatorId'],
      ['operator', 'operator'],
      ['singleOperator', 'singleoperator'],
      ['station', 'station'],
      ['stationGroupId', 'stationgroupId'],
      ['stationGroup', 'stationgroup'],
      ['date', 'date'],
      ['sku', 'sku'],
      ['skuLabel', 'skulabel'],
      ['lotCode', 'lotCode'],
      ['productionOrder', 'productionOrder'],
      ['factoryId', 'factoryId'],
      ['factory', 'factory'],

      ['value', 'performancelossduration'],
      ['valueSec', 'performancelossduration'],
      ['valueLabel', 'performancelossduration'],

      ['idealQty', 'idealqty'],
      ['idealAltQty', 'idealaltqty'],
      ['rowProducedQty', 'rowproducedqty'],
      ['rowProducedAltQty', 'rowproducedaltqty'],
      ['unitId', 'unitId'],
      ['alternativeUnitId', 'alternativeUnitId'],

      ['lossQty', null],
      ['lossAltQty', null],
      ['lossQtyFormatted', null],
      ['lossAltQtyFormatted', null],

      ['color', 'performanceCommentColor'],

      ['measure', this.xScaleValueKey],
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
      ['entityKey', () => 'performanceCommentId'],
      ['value', (val) => new Date(val * 1000)],
      ['groupingKey', () => this.getGroupingKey()],
      ['notesCount', (val) => val || 0],
      ['tooltipXLabel', (val) => this.getXScaleLabel(val, this.xScaleTooltipFormat)],
      ['measureLabel', (val) => this.getXScaleLabel(val, this.xScaleLabelFormat)],
      ['tableTimeLabel', (val) => this.getXScaleLabel(val, this.xScaleTableLabelFormat)],
      ['valueLabel', (val) => this.formatSecondsReadable(val)],
      ['avgDuration', (val, obj) => calculateAvgDuration(obj)],
      ['avgDurationVal', (val, obj) => new Date(calculateAvgDuration(obj) * 1000)],
      ['avgDurationFormatted', (val, obj) => this.formatSecondsReadable(calculateAvgDuration(obj))],
      ['entityCountLabel', (val) => this.formatNumber(val)],
      ['xScaleValueFormatted', (val) => this.granularityLabelFormatter(val, this.xScaleTooltipFormat)],
      ['lossQty', (val, obj) => calculateLossQty(obj)],
      ['lossAltQty', (val, obj) => calculateLossAltQty(obj)],
      ['lossQtyFormatted', (val, obj) => this.formatNumberFixed(calculateLossQty(obj)) + ReportsDataMap.getAppendableUnitId(obj)],
      ['lossAltQtyFormatted', (val, obj) => this.formatNumberFixed(calculateLossAltQty(obj)) + ReportsDataMap.getAppendableAltUnitId(obj)],

      ['date', formatSetAsStr],
      ['color', formatSetAsStr],
      ['entityName', formatSetAsStr],
      ['entityGroupName', formatSetAsStr],
      ['station', formatSetAsStr],
      ['stationGroup', formatSetAsStr],
      ['location', formatSetAsStr],
      ['product', formatSetAsStr],
      ['productGroup', formatSetAsStr],
      ['notes', formatSetAsStr],
      ['singleOperator', formatSetAsStr],
      ['shiftTemplate', formatSetAsStr],
      ['shiftTemplateLabel', formatSetAsStr],
      ['entityId', formatSetOrValAsArray],
      ['entityGroupId', formatSetOrValAsArray],
      ['productId', formatSetOrValAsArray],
      ['productGroupId', formatSetOrValAsArray],
      ['operatorId', formatSetOrValAsArray],
      ['stationId', formatSetOrValAsArray],
      ['stationGroupId', formatSetOrValAsArray],
      ['sku', formatSetAsStr],
      ['skuLabel', formatSetAsStr],
      ['lotCode', formatSetAsStr],
      ['productionOrder', formatSetAsStr],
      ['factory', formatSetAsStr],
      ['factoryId', formatSetOrValAsArray],
      ['performancePositionId', formatSetOrValAsArray],

      ['defined', (val, obj) => !obj.isFake],
    ]);
  }

  idKeyNameKeyMap = {
    performanceCommentId: 'performanceComment',
    performanceCommentGroupId: 'performancelossgroupName',
    stationId: 'station',
    stationGroupId: 'stationgroup',
    factoryId: 'factory',
    singleoperator: 'singleoperator',
    shifttemplate: 'shifttemplate',
    productId: 'product',
    productgroupId: 'productgroup',
    sku: 'sku',
    lotCode: 'lotCode',
    productionOrder: 'productionOrder',
    performancePositionId: 'performancelosslocation',
  };
}
