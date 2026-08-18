import round from 'lodash/round';

import ReportsDataMap from './ReportsDataMap';

import calcPercentage from '@/helpers/percentage/calcPercentage';
import { formatSetAsStr, formatSetOrValAsArray } from '@/stores/reportsConfig/configurations/formatsConfiguration';

function calcScrapPct(obj) {
  const total = obj.rowProducedQty || obj.totalProducedQty;
  if (!total) return 0;
  return (obj.scrapQty / total) || 0;
}

function calcScrapAltPct(obj) {
  const total = obj.rowProducedAltQty || obj.totalProducedAltQty;
  if (!total) return 0;
  return (obj.scrapAltQty / total) || 0;
}

export default class ScrapDataMap extends ReportsDataMap {
  // requires granularity, groupBy, secondaryLabels, dataPctTotal

  inputItemDefaults = {
    scrapreason: '',
    scrapreasongroup: '',
    scrapreasonid: '',
    scrapreasongroupid: '',
    scrapColor: '#000000',
    scrapqty: 0,
    isFake: false,
  };

  get keyMap() {
    return new Map([
      ['entityKey', 'entityKey'],
      ['entityId', 'scrapreasonid'],
      ['entityName', 'scrapreason'],
      ['stationId', 'stationId'],
      ['entityGroupId', 'scrapreasongroupid'],
      ['entityGroupName', 'scrapreasongroupname'],
      ['product', 'product'],
      ['productGroup', 'productgroup'],
      ['productGroupId', 'productgroupId'],
      ['entityCount', 'scrapqty'],
      ['entityAltCount', 'scrapaltqty'],
      ['scrapQty', 'scrapqty'],
      ['scrapAltQty', 'scrapaltqty'],
      ['totalProducedQty', 'totalproducedqty'],
      ['totalProducedAltQty', 'totalproducedaltqty'],
      ['rowProducedQty', 'rowproducedqty'],
      ['goodProduction', 'goodproduction'],
      ['shiftTemplate', 'shifttemplate'],
      ['shiftTemplateLabel', 'shifttemplatelabel'],
      ['operatorId', 'singleoperatorId'],
      ['operator', 'operator'],
      ['singleOperator', 'singleoperator'],
      ['station', 'station'],
      ['stationGroupId', 'stationgroupId'],
      ['stationGroup', 'stationgroup'],
      ['sku', 'sku'],
      ['skuLabel', 'skulabel'],
      ['lotCode', 'lotCode'],
      ['productionOrder', 'productionOrder'],
      ['factoryId', 'factoryId'],
      ['factory', 'factory'],
      ['unitId', 'unitId'],
      ['alternativeUnitId', 'alternativeUnitId'],

      ['scrapQtyFormatted', 'scrapqty'],
      ['scrapAltQtyFormatted', 'scrapaltqty'],
      ['goodProductionFormatted', 'goodproduction'],
      ['totalQtyFormatted', 'totalproducedqty'],
      ['totalAltQtyFormatted', 'totalproducedaltqty'],

      ['scrapQtyPct', null],
      ['scrapQtyPctFormatted', null],
      ['scrapAltQtyPct', null],
      ['scrapAltQtyPctFormatted', null],
      ['totalPlannedTime', 'totalplannedtime'],
      ['rowPlannedTime', 'rowplannedtime'],
      ['entityPctPlannedTime', null],
      ['entityPctPlannedTimeLabel', null],
      ['scrapDuration', 'scrapduration'],
      ['scrapDurationFormatted', 'scrapduration'],

      ['color', 'scrapColor'],

      ['measure', this.xScaleValueKey],
      ['xScaleValue', this.xScaleValueKey],
      ['xScaleValueFormatted', this.xScaleValueKey],
      ['groupingKey', null],

      ['tooltipXLabel', this.xScaleValueLabelKey],
      ['measureLabel', this.xScaleValueLabelKey],
      ['tableTimeLabel', this.xScaleValueLabelKey],

      ['itemGroupingId', this.itemGroupingIdKey],
      ['isFake', 'isFake'],
      ['defined', null],
      ['xAxisKey', 'xAxisKey'],
      ['entriesCount', 'entriesCount'],
      ['noData', 'noData'],
    ]);
  }

  get formatMap() {
    return new Map([
      ['entityKey', () => 'scrapReasonId'],
      ['value', (val) => new Date(val * 1000)],
      ['groupingKey', () => this.getGroupingKey()],
      ['notesCount', (val) => val || 0],
      ['tooltipXLabel', (val) => this.getXScaleLabel(val, this.xScaleTooltipFormat)],
      ['measureLabel', (val) => this.getXScaleLabel(val, this.xScaleLabelFormat)],
      ['tableTimeLabel', (val) => this.getXScaleLabel(val, this.xScaleTableLabelFormat)],
      ['valueLabel', (val) => this.formatSecondsReadable(val)],
      ['entityCount', (val) => round(val, 2)],
      ['entityAltCount', (val) => round(val, 2)],
      ['scrapQtyFormatted', (val, obj) => this.formatNumberFixed(val) + ReportsDataMap.getAppendableUnitId(obj)],
      ['scrapAltQtyFormatted', (val, obj) => this.formatNumberFixed(val) + ReportsDataMap.getAppendableAltUnitId(obj)],
      ['scrapQtyPct', (val, obj) => calcScrapPct(obj)],
      ['scrapQtyPctFormatted', (val, obj) => this.formatPercentage(calcScrapPct(obj) * 100)],
      ['scrapAltQtyPct', (val, obj) => calcScrapAltPct(obj)],
      ['scrapAltQtyPctFormatted', (val, obj) => this.formatPercentage(calcScrapAltPct(obj) * 100)],
      ['entityPctPlannedTime', (val, obj) => calcPercentage(obj, 'scrapDuration', obj.rowPlannedTime ? 'rowPlannedTime' : 'totalPlannedTime')],
      ['entityPctPlannedTimeLabel', (val, obj) => this.formatPercentage(calcPercentage(obj, 'scrapDuration', obj.rowPlannedTime ? 'rowPlannedTime' : 'totalPlannedTime') * 100)],
      ['scrapDurationFormatted', (val) => this.formatSecondsReadable(val)],
      ['totalQtyFormatted', (val, obj) => this.formatNumberFixed(obj.rowProducedQty || obj.totalProducedQty) + ReportsDataMap.getAppendableUnitId(obj)],
      ['totalAltQtyFormatted', (val, obj) => this.formatNumberFixed(obj.rowProducedAltQty || obj.totalProducedAltQty) + ReportsDataMap.getAppendableAltUnitId(obj)],
      ['goodProductionFormatted', (val) => `${this.formatSecondsReadable(val)}`],
      ['xScaleValueFormatted', (val) => this.granularityLabelFormatter(val, this.xScaleTooltipFormat)],
      ['color', formatSetAsStr],
      ['entityName', formatSetAsStr],
      ['entityGroupName', formatSetAsStr],
      ['station', formatSetAsStr],
      ['stationGroup', formatSetAsStr],
      ['product', formatSetAsStr],
      ['productGroup', formatSetAsStr],
      ['shiftTemplate', formatSetAsStr],
      ['shiftTemplateLabel', formatSetAsStr],
      ['singleOperator', formatSetAsStr],
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

      ['defined', (val, obj) => !obj.isFake],
    ]);
  }

  idKeyNameKeyMap = {
    scrapreasonid: 'scrapreason',
    scrapreasongroupid: 'scrapreasongroupname',
    stationId: 'station',
    stationgroupId: 'stationgroup',
    factoryId: 'factory',
    singleoperator: 'singleoperator',
    shifttemplate: 'shifttemplate',
    productId: 'product',
    productgroupId: 'productgroup',
    sku: 'sku',
    lotCode: 'lotCode',
    productionOrder: 'productionOrder',
  };
}
