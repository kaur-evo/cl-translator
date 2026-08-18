import ReportsDataMap from './ReportsDataMap';

import specialKey from '@/stores/reportsConfig/constants/specialKey';
import { formatSetAsStr, formatSetOrValAsArray } from '@/stores/reportsConfig/configurations/formatsConfiguration';

/*
  oee datapoints are calculated partially based on duplicate data,
  to avoid duplicate merging in data granulating some keys are renamed
  for eg. performanceGroup prefix applies only for performance datapoints, no prefix applies to oee
*/
const getTotalQty = (obj) => obj.oeeGroupTotalQty
  || obj.technicalGroupTotalQty
  || obj.availabilityGroupTotalQty
  || obj.performanceGroupTotalQty
  || obj.qualityGroupTotalQty
  || 0;
const getTotalAltQty = (obj) => obj.oeeGroupTotalAltQty
  || obj.technicalGroupTotalAltQty
  || obj.availabilityGroupTotalAltQty
  || obj.performanceGroupTotalAltQty
  || obj.qualityGroupTotalAltQty
  || 0;
const getPlannedTime = (obj) => obj.oeeGroupPlannedTime
  || obj.technicalGroupPlannedTime
  || obj.availabilityGroupPlannedTime
  || obj.performanceGroupPlannedTime
  || obj.qualityGroupPlannedTime
  || 0;
const getPlannedStopNotIncludedInOEE = (obj) => obj.oeeGroupPlannedStopNotIncludedInOEE
  || obj.technicalGroupPlannedStopNotIncludedInOEE
  || obj.availabilityGroupPlannedStopNotIncludedInOEE
  || obj.performanceGroupPlannedStopNotIncludedInOEE
  || obj.qualityGroupPlannedStopNotIncludedInOEE
  || 0;

// using station here, because stationId is value if split by stations
export function getCalendarTimeSec(obj, dateRange) {
  return ReportsDataMap.getDurationFromDateRange(dateRange) * (obj?.station?.size || 1);
}

export function calcAvailability(obj) {
  const productionTime = obj.productionTime || obj.availabilityGroupProductionTime || 0;
  const plannedTime = obj.plannedTime || obj.availabilityGroupPlannedTime || 0;
  const ret = productionTime / plannedTime;
  return Number.isFinite(ret) ? ret : 0;
}

export function calcPerformance(obj) {
  const qty = obj.qty || obj.performanceGroupQty || 0;
  const idealPerformanceQty = obj.idealPerformanceQty || obj.performanceGroupIdealPerfQty || 0;
  const ret = qty / idealPerformanceQty;
  return Number.isFinite(ret) ? ret : 0;
}
export function calcQuality(obj) {
  const scrapQty = obj.scrapQty || obj.qualityGroupScrapQty || 0;
  const qty = obj.qty || obj.qualityGroupQty || 0;
  if (qty === 0) return 0;
  return 1 - (scrapQty / qty || 0);
}
export function calcTechnicalAvailability(obj) {
  const technicalStop = obj.technicalStop || obj.technicalGroupTechnicalStop || 0;
  const plannedTime = obj.plannedTime || obj.technicalGroupPlannedTime || 0;

  return 1 - (technicalStop / plannedTime || 0);
}
export function calcRowProducedQty(obj) {
  return obj.availabilityGroupRowProducedQty || obj.performanceGroupRowProducedQty || obj.qualityGroupRowProducedQty;
}
function calcShiftTime(obj) {
  return getPlannedTime(obj) + getPlannedStopNotIncludedInOEE(obj) || 0;
}

function calcShiftTotalAvailability(obj) {
  const productionTime = obj.productionTime || obj.availabilityGroupProductionTime || 0;
  const shiftTime = calcShiftTime(obj);
  const ret = productionTime / shiftTime;
  return Number.isFinite(ret) ? ret : 0;
}

export function calcCalendarTimeAvailability(obj, dateRange) {
  const productionTime = obj.productionTime || obj.availabilityGroupProductionTime || 0;
  const ret = productionTime / getCalendarTimeSec(obj, dateRange);
  return Number.isFinite(ret) ? ret : 0;
}

export function calcOEE(obj) {
  return calcAvailability(obj) * calcPerformance(obj) * calcQuality(obj);
}
export function calcOperatingTime(obj) {
  return obj.productionTime || 0;
}
function calcOperatingTimePct(obj) {
  return calcOperatingTime(obj) / calcShiftTime(obj) || 0;
}
function calcOperatingTimePctOfPlannedTime(obj) {
  return calcOperatingTime(obj) / getPlannedTime(obj) || 0;
}
export function calcOOE(obj) {
  return calcShiftTotalAvailability(obj) * calcPerformance(obj) * calcQuality(obj);
}
export function calcTEEP(obj, dateRange) {
  return calcCalendarTimeAvailability(obj, dateRange) * calcPerformance(obj) * calcQuality(obj);
}

export function calcValue(obj) {
  switch (obj[specialKey.PREPROCESSED_GROUP_ID_KEY]) {
    case 'availability': return calcAvailability(obj);
    case 'performance': return calcPerformance(obj);
    case 'quality': return calcQuality(obj);
    case 'technicalAvailability': return calcTechnicalAvailability(obj);
    default:
      return calcOEE(obj);
  }
}

export default class OEEDataMap extends ReportsDataMap {
  // requires granularity, groupBy, secondaryLabels, dataPctTotal
  inputItemDefaults = {
    isFake: false,
  };

  get keyMap() {
    return new Map([
      ['isFake', 'isFake'],
      [specialKey.PREPROCESSED_GROUP_ID_KEY, specialKey.PREPROCESSED_GROUP_ID_KEY],
      ['value', null],

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

      ['plannedTime', 'plannedtime'],
      ['productionTime', 'productiontime'],
      ['technicalStop', 'technicalstop'],
      ['idealPerformanceQty', 'idealperformanceqty'],
      ['scrapQty', 'scrapqty'],
      ['qty', 'qty'],

      ['unitId', 'unitId'],
      ['alternativeUnitId', 'alternativeUnitId'],

      ['oeeGroupTotalQty', 'oeeGroupTotalQty'],
      ['oeeGroupTotalAltQty', 'oeeGroupTotalAltQty'],
      ['oeeGroupPlannedStopNotIncludedInOEE', 'oeeGroupPlannedStopNotIncludedInOEE'],
      ['oeeGroupCalendarTimeSec', 'oeeGroupCalendarTimeSec'],

      ['technicalGroupTechnicalStop', 'technicalGroupTechnicalStop'],
      ['technicalGroupPlannedTime', 'technicalGroupPlannedTime'],
      ['technicalGroupTotalQty', 'technicalGroupTotalQty'],
      ['technicalGroupTotalAltQty', 'technicalGroupTotalAltQty'],
      ['technicalGroupPlannedStopNotIncludedInOEE', 'technicalGroupPlannedStopNotIncludedInOEE'],
      ['technicalGroupCalendarTimeSec', 'technicalGroupCalendarTimeSec'],

      ['availabilityGroupProductionTime', 'availabilityGroupProductionTime'],
      ['availabilityGroupPlannedTime', 'availabilityGroupPlannedTime'],
      ['availabilityGroupTotalQty', 'availabilityGroupTotalQty'],
      ['availabilityGroupTotalAltQty', 'availabilityGroupTotalAltQty'],
      ['availabilityGroupPlannedStopNotIncludedInOEE', 'availabilityGroupPlannedStopNotIncludedInOEE'],
      ['availabilityGroupCalendarTimeSec', 'availabilityGroupCalendarTimeSec'],

      ['performanceGroupQty', 'performanceGroupQty'],
      ['performanceGroupIdealPerfQty', 'performanceGroupIdealPerfQty'],
      ['performanceGroupTotalQty', 'performanceGroupTotalQty'],
      ['performanceGroupTotalAltQty', 'performanceGroupTotalAltQty'],
      ['performanceGroupPlannedStopNotIncludedInOEE', 'performanceGroupPlannedStopNotIncludedInOEE'],
      ['performanceGroupCalendarTimeSec', 'performanceGroupCalendarTimeSec'],

      ['qualityGroupScrapQty', 'qualityGroupScrapQty'],
      ['qualityGroupQty', 'qualityGroupQty'],
      ['qualityGroupTotalQty', 'qualityGroupTotalQty'],
      ['qualityGroupTotalAltQty', 'qualityGroupTotalAltQty'],
      ['qualityGroupPlannedStopNotIncludedInOEE', 'qualityGroupPlannedStopNotIncludedInOEE'],
      ['qualityGroupCalendarTimeSec', 'qualityGroupCalendarTimeSec'],

      ['definedScrapQty', 'definedScrapQty'],
      ['definedQty', 'definedQty'],

      ['oee', null],
      ['ooe', null],
      ['teep', null],
      ['performance', null],
      ['quality', null],
      ['availability', null],
      ['technicalAvailability', null],
      ['rowProducedQty', null],
      ['rowProducedAltQty', null],
      ['operatingTime', null],
      ['shiftTime', null],

      ['oeeFormatted', null],
      ['ooeFormatted', null],
      ['teepFormatted', null],
      ['performanceFormatted', null],
      ['qualityFormatted', null],
      ['availabilityFormatted', null],
      ['technicalAvailabilityFormatted', null],
      ['rowProducedQtyFormatted', null],
      ['rowProducedAltQtyFormatted', null],

      ['operatingTimeFormatted', null],
      ['operatingTimePctFormatted', null],
      ['shiftTimeFormatted', null],
      ['plannedTimeFormatted', null],

      ['trendValue', null],
      ['color', 'color'],

      ['xScaleValue', this.xScaleValueKey],
      ['xScaleValueFormatted', this.xScaleValueKey],
      ['groupingKey', null],

      ['tooltipXLabel', this.xScaleValueLabelKey],
      ['measureLabel', this.xScaleValueLabelKey],
      ['tableTimeLabel', this.xScaleValueLabelKey],

      ['entityName', this.entityNameKey],
      ['entityGroupName', 'entityGroupName'],
      ['calendarTime', null],
      ['defined', null],
      ['datapointDateRange', null],
    ]);
  }

  get formatMap() {
    return new Map([
      ['value', (val, obj) => calcValue(obj)],
      ['groupingKey', () => this.getGroupingKey()],
      ['tooltipXLabel', (val) => this.getXScaleLabel(val, this.xScaleTooltipFormat)],
      ['measureLabel', (val) => this.getXScaleLabel(val, this.xScaleLabelFormat)],
      ['tableTimeLabel', (val) => this.getXScaleLabel(val, this.xScaleTableLabelFormat)],
      ['availability', (val, obj) => calcAvailability(obj)],
      ['performance', (val, obj) => calcPerformance(obj)],
      ['quality', (val, obj) => calcQuality(obj)],
      ['technicalAvailability', (val, obj) => calcTechnicalAvailability(obj)],
      ['oee', (val, obj) => calcOEE(obj)],
      ['ooe', (val, obj) => calcOOE(obj)],
      ['teep', (val, obj) => calcTEEP(obj, this.getDatapointDateRange())],
      ['operatingTime', (val, obj) => calcOperatingTime(obj)],
      ['shiftTime', (val, obj) => calcShiftTime(obj)],
      ['plannedTime', (val, obj) => getPlannedTime(obj)],
      ['calendarTime', (val, obj) => getCalendarTimeSec(obj, this.getDatapointDateRange())],

      ['availabilityFormatted', (val, obj) => this.formatPercentage(calcAvailability(obj) * 100)],
      ['performanceFormatted', (val, obj) => this.formatPercentage(calcPerformance(obj) * 100)],
      ['qualityFormatted', (val, obj) => this.formatPercentage(calcQuality(obj) * 100)],
      ['technicalAvailabilityFormatted', (val, obj) => this.formatPercentage(calcTechnicalAvailability(obj) * 100)],
      ['oeeFormatted', (val, obj) => this.formatPercentage(calcOEE(obj) * 100)],
      ['ooeFormatted', (val, obj) => this.formatPercentage(calcOOE(obj) * 100)],
      ['teepFormatted', (val, obj) => this.formatPercentage(calcTEEP(obj, this.getDatapointDateRange()) * 100)],
      ['trendValue', (val, obj) => calcOEE(obj)],
      ['xScaleValueFormatted', (val) => this.granularityLabelFormatter(val, this.xScaleTooltipFormat)],
      ['rowProducedQty', (val, obj) => getTotalQty(obj)],
      ['rowProducedAltQty', (val, obj) => getTotalAltQty(obj)],
      ['rowProducedQtyFormatted', (val, obj) => this.formatNumberFixed(getTotalQty(obj)) + ReportsDataMap.getAppendableUnitId(obj)],
      ['rowProducedAltQtyFormatted', (val, obj) => this.formatNumberFixed(getTotalAltQty(obj)) + ReportsDataMap.getAppendableAltUnitId(obj)],
      ['operatingTimeFormatted', (val, obj) => this.formatSecondsReadable(calcOperatingTime(obj))],
      ['operatingTimePctFormatted', (val, obj) => `${this.formatPercentage(calcOperatingTimePctOfPlannedTime(obj) * 100)} / ${this.formatPercentage(calcOperatingTimePct(obj) * 100)}`],
      ['shiftTimeFormatted', (val, obj) => this.formatSecondsReadable(calcShiftTime(obj))],
      ['plannedTimeFormatted', (val, obj) => this.formatSecondsReadable(getPlannedTime(obj))],

      ['idealPerformanceQty', (val, obj) => obj.idealPerformanceQty || obj.performanceGroupIdealPerfQty || 0],
      ['scrapQty', (val, obj) => obj.scrapQty || obj.qualityGroupScrapQty || 0],
      ['qty', (val, obj) => obj.qty || obj.qualityGroupQty || 0],

      ['definedScrapQty', (val, obj) => obj.definedScrapQty || 0],
      ['definedQty', (val, obj) => obj.definedQty || 0],

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
      ['factory', formatSetAsStr],
      ['factoryId', formatSetOrValAsArray],

      ['defined', (val, obj) => !obj.isFake],

    ]);
  }
}
