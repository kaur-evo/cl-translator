import ReportsDataMap from './ReportsDataMap';

import { formatSetAsStr, formatSetOrValAsArray } from '@/stores/reportsConfig/configurations/formatsConfiguration';
import specialKey from '@/stores/reportsConfig/constants/specialKey';

const getTotalQty = (obj) => obj.scrapGroupTotalQty || obj.goodGroupTotalQty || obj.potentialGroupTotalQty || 0;
const getTotalAltQty = (obj) => obj.scrapGroupTotalAltQty || obj.goodGroupTotalAltQty || obj.potentialGroupTotalAltQty || 0;
const getScrapQty = (obj) => obj.scrapGroupScrapQty || 0;
const getScrapAltQty = (obj) => obj.scrapGroupScrapAltQty || 0;
const getGoodQty = (obj) => obj.goodGroupGoodQty || 0;
const getGoodAltQty = (obj) => obj.goodGroupGoodAltQty || 0;
const getIdealQtyForCalc = (obj) => obj.potentialGroupIdealQty || 0;
const getIdealAltQtyForCalc = (obj) => obj.potentialGroupIdealAltQty || 0;
const getIdealQty = (obj) => obj.scrapGroupIdealQty || obj.goodGroupIdealQty || obj.potentialGroupIdealQty || 0;
const getIdealAltQty = (obj) => obj.scrapGroupIdealAltQty || obj.goodGroupIdealAltQty || obj.potentialGroupIdealAltQty || 0;
const getIdealPerformanceQty = (obj) => obj.scrapGroupIdealPerformanceQty || obj.goodGroupIdealPerformanceQty || obj.potentialGroupIdealPerformanceQty || 0;
const getIdealPerformanceAltQty = (obj) => obj.scrapGroupIdealPerformanceAltQty || obj.goodGroupIdealPerformanceAltQty || obj.potentialGroupIdealPerformanceAltQty || 0;
function calcScrapPct(obj) {
  return (getScrapQty(obj) / getTotalQty(obj)) || 0;
}
function calcGoodQtyPct(obj) {
  return (getGoodQty(obj) / getTotalQty(obj)) || 0;
}
function calcPotentialQty(obj) {
  const potential = getIdealQtyForCalc(obj) - getTotalQty(obj);
  return potential > 0 ? potential : 0;
}
function calcPotentialAltQty(obj) {
  const potential = getIdealAltQtyForCalc(obj) - getTotalAltQty(obj);
  return potential > 0 ? potential : 0;
}

function calcValue(obj) {
  return getScrapQty(obj) + getGoodQty(obj) + calcPotentialQty(obj);
}
function calcAltValue(obj) {
  return getScrapAltQty(obj) + getGoodAltQty(obj) + calcPotentialAltQty(obj);
}

function calcPerformanceLossQty(obj) {
  return Math.max((getIdealPerformanceQty(obj) - getTotalQty(obj)), 0);
}

function calcPerformanceLossAltQty(obj) {
  return Math.max((getIdealPerformanceAltQty(obj) - getTotalAltQty(obj)), 0);
}

function calcAvailabilityLossQty(obj) {
  return Math.max((getIdealQty(obj) - getIdealPerformanceQty(obj)), 0);
}

function calcAvailabilityLossAltQty(obj) {
  return Math.max((getIdealAltQty(obj) - getIdealPerformanceAltQty(obj)), 0);
}

export default class QuantityDataMap extends ReportsDataMap {
  // requires granularity, groupBy, secondaryLabels, dataPctTotal

  inputItemDefaults = {
    isFake: false,
  };

  get keyMap() {
    return new Map([
      ['isFake', 'isFake'],
      [specialKey.PREPROCESSED_GROUP_ID_KEY, specialKey.PREPROCESSED_GROUP_ID_KEY],
      ['value', null],
      ['altValue', null],
      ['color', 'color'],

      ['notesCount', 'notescount'],
      ['notes', 'notes'],
      ['product', 'product'],
      ['productId', 'productId'],
      ['productGroup', 'productgroup'],
      ['productGroupId', 'productgroupId'],
      ['shiftTemplate', 'shifttemplate'],
      ['shiftTemplateLabel', 'shifttemplatelabel'],
      ['operatorId', 'singleoperatorId'],
      ['operator', 'operator'],
      ['singleOperator', 'singleoperator'],
      ['stationId', 'stationId'],
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

      ['scrapGroupTotalQty', 'scrapGroupTotalQty'],
      ['scrapGroupTotalAltQty', 'scrapGroupTotalAltQty'],
      ['scrapGroupScrapQty', 'scrapGroupScrapQty'],
      ['scrapGroupScrapAltQty', 'scrapGroupScrapAltQty'],
      ['scrapGroupIdealQty', 'scrapGroupIdealQty'],
      ['scrapGroupIdealAltQty', 'scrapGroupIdealAltQty'],
      ['scrapGroupIdealPerformanceQty', 'scrapGroupIdealPerformanceQty'],
      ['scrapGroupIdealPerformanceAltQty', 'scrapGroupIdealPerformanceAltQty'],

      ['goodGroupTotalQty', 'goodGroupTotalQty'],
      ['goodGroupTotalAltQty', 'goodGroupTotalAltQty'],
      ['goodGroupGoodQty', 'goodGroupGoodQty'],
      ['goodGroupGoodAltQty', 'goodGroupGoodAltQty'],
      ['goodGroupIdealQty', 'goodGroupIdealQty'],
      ['goodGroupIdealAltQty', 'goodGroupIdealAltQty'],
      ['goodGroupIdealPerformanceQty', 'goodGroupIdealPerformanceQty'],
      ['goodGroupIdealPerformanceAltQty', 'goodGroupIdealPerformanceAltQty'],

      ['potentialGroupTotalQty', 'potentialGroupTotalQty'],
      ['potentialGroupTotalAltQty', 'potentialGroupTotalAltQty'],
      ['potentialGroupIdealQty', 'potentialGroupIdealQty'],
      ['potentialGroupIdealAltQty', 'potentialGroupIdealAltQty'],
      ['potentialGroupIdealPerformanceQty', 'potentialGroupIdealPerformanceQty'],
      ['potentialGroupIdealPerformanceAltQty', 'potentialGroupIdealPerformanceAltQty'],

      ['idealQty', null],
      ['idealAltQty', null],
      ['scrapQty', null],
      ['scrapAltQty', null],
      ['goodQty', null],
      ['goodAltQty', null],
      ['rowProducedQty', null],
      ['rowProducedAltQty', null],
      ['potentialQty', null],
      ['potentialAltQty', null],

      ['idealQtyFormatted', null],
      ['idealAltQtyFormatted', null],
      ['scrapQtyFormatted', null],
      ['scrapAltQtyFormatted', null],
      ['goodQtyFormatted', null],
      ['goodAltQtyFormatted', null],
      ['rowProducedQtyFormatted', null],
      ['rowProducedAltQtyFormatted', null],
      ['potentialQtyFormatted', null],
      ['potentialAltQtyFormatted', null],

      ['performanceLossQty', null],
      ['performanceLossAltQty', null],
      ['performanceLossQtyFormatted', null],
      ['performanceLossAltQtyFormatted', null],
      ['availabilityLossQty', null],
      ['availabilityLossAltQty', null],
      ['availabilityLossQtyFormatted', null],
      ['availabilityLossAltQtyFormatted', null],

      ['scrapQtyPct', null],
      ['goodQtyPct', null],

      ['scrapQtyPctFormatted', null],
      ['goodQtyPctFormatted', null],
      ['potentialQtyPctFormatted', null],

      ['xScaleValue', this.xScaleValueKey],
      ['xScaleValueFormatted', this.xScaleValueKey],
      ['groupingKey', null],

      ['tooltipXLabel', this.xScaleValueLabelKey],
      ['measureLabel', this.xScaleValueLabelKey],
      ['tableTimeLabel', this.xScaleValueLabelKey],

      ['entityName', this.entityNameKey],
      ['itemGroupingId', this.itemGroupingIdKey],
      ['entityGroupName', 'entityGroupName'],
      ['defined', null],
    ]);
  }

  get formatMap() {
    return new Map([
      ['value', (val, obj) => calcValue(obj)],
      ['altValue', (val, obj) => calcAltValue(obj)],

      ['groupingKey', () => this.getGroupingKey()],
      ['tooltipXLabel', (val) => this.getXScaleLabel(val, this.xScaleTooltipFormat)],
      ['measureLabel', (val) => this.getXScaleLabel(val, this.xScaleLabelFormat)],
      ['tableTimeLabel', (val) => this.getXScaleLabel(val, this.xScaleTableLabelFormat)],

      ['scrapQtyPct', (val, obj) => calcScrapPct(obj)],
      ['goodQtyPct', (val, obj) => calcGoodQtyPct(obj)],

      ['idealQty', (val, obj) => getIdealQty(obj)],
      ['idealAltQty', (val, obj) => getIdealAltQty(obj)],
      ['scrapQty', (val, obj) => getScrapQty(obj)],
      ['scrapAltQty', (val, obj) => getScrapAltQty(obj)],
      ['goodQty', (val, obj) => getGoodQty(obj)],
      ['goodAltQty', (val, obj) => getGoodAltQty(obj)],
      ['rowProducedQty', (val, obj) => getTotalQty(obj)],
      ['rowProducedAltQty', (val, obj) => getTotalAltQty(obj)],
      ['potentialQty', (val, obj) => calcPotentialQty(obj)],
      ['potentialAltQty', (val, obj) => calcPotentialAltQty(obj)],
      ['performanceLossQty', (val, obj) => calcPerformanceLossQty(obj)],
      ['performanceLossAltQty', (val, obj) => calcPerformanceLossAltQty(obj)],
      ['availabilityLossQty', (val, obj) => calcAvailabilityLossQty(obj)],
      ['availabilityLossAltQty', (val, obj) => calcAvailabilityLossAltQty(obj)],

      ['performanceLossQtyFormatted', (val, obj) => this.formatNumberFixed(calcPerformanceLossQty(obj)) + ReportsDataMap.getAppendableUnitId(obj)],
      ['performanceLossAltQtyFormatted', (val, obj) => this.formatNumberFixed(calcPerformanceLossAltQty(obj)) + ReportsDataMap.getAppendableAltUnitId(obj)],
      ['availabilityLossQtyFormatted', (val, obj) => this.formatNumberFixed(calcAvailabilityLossQty(obj)) + ReportsDataMap.getAppendableUnitId(obj)],
      ['availabilityLossAltQtyFormatted', (val, obj) => this.formatNumberFixed(calcAvailabilityLossAltQty(obj)) + ReportsDataMap.getAppendableAltUnitId(obj)],
      ['potentialQtyFormatted', (val, obj) => this.formatNumberFixed(calcPotentialQty(obj)) + ReportsDataMap.getAppendableUnitId(obj)],
      ['potentialAltQtyFormatted', (val, obj) => this.formatNumberFixed(calcPotentialAltQty(obj)) + ReportsDataMap.getAppendableAltUnitId(obj)],
      ['idealQtyFormatted', (val, obj) => this.formatNumberFixed(getIdealQty(obj)) + ReportsDataMap.getAppendableUnitId(obj)],
      ['idealAltQtyFormatted', (val, obj) => this.formatNumberFixed(getIdealAltQty(obj)) + ReportsDataMap.getAppendableAltUnitId(obj)],
      ['scrapQtyFormatted', (val, obj) => this.formatNumberFixed(getScrapQty(obj)) + ReportsDataMap.getAppendableUnitId(obj)],
      ['scrapAltQtyFormatted', (val, obj) => this.formatNumberFixed(getScrapAltQty(obj)) + ReportsDataMap.getAppendableAltUnitId(obj)],
      ['goodQtyFormatted', (val, obj) => this.formatNumberFixed(getGoodQty(obj)) + ReportsDataMap.getAppendableUnitId(obj)],
      ['goodAltQtyFormatted', (val, obj) => this.formatNumberFixed(getGoodAltQty(obj)) + ReportsDataMap.getAppendableAltUnitId(obj)],
      ['rowProducedQtyFormatted', (val, obj) => this.formatNumberFixed(getTotalQty(obj)) + ReportsDataMap.getAppendableUnitId(obj)],
      ['rowProducedAltQtyFormatted', (val, obj) => this.formatNumberFixed(getTotalAltQty(obj)) + ReportsDataMap.getAppendableAltUnitId(obj)],

      ['scrapQtyPctFormatted', (val, obj) => this.formatPercentage(calcScrapPct(obj) * 100)],
      ['goodQtyPctFormatted', (val, obj) => this.formatPercentage(calcGoodQtyPct(obj) * 100)],

      ['xScaleValueFormatted', (val) => this.granularityLabelFormatter(val, this.xScaleTooltipFormat)],

      ['color', formatSetAsStr],
      ['station', formatSetAsStr],
      ['stationGroup', formatSetAsStr],
      ['product', formatSetAsStr],
      ['productGroup', formatSetAsStr],
      ['shiftTemplate', formatSetAsStr],
      ['shiftTemplateLabel', formatSetAsStr],
      ['entityGroupName', formatSetAsStr],
      ['singleOperator', formatSetAsStr],
      ['productId', formatSetOrValAsArray],
      ['productGroupId', formatSetOrValAsArray],
      ['operatorId', formatSetOrValAsArray],
      ['stationId', formatSetOrValAsArray],
      ['stationGroupId', formatSetOrValAsArray],
      ['sku', formatSetAsStr],
      ['skuLabel', formatSetAsStr],
      ['lotCode', formatSetAsStr],
      ['productionOrder', formatSetAsStr],
      ['factoryId', formatSetOrValAsArray],
      ['factory', formatSetAsStr],

      ['defined', (val, obj) => !obj.isFake],
    ]);
  }
}
