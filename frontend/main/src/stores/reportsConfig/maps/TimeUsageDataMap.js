import ReportsDataMap from './ReportsDataMap';

import specialKey from '@/stores/reportsConfig/constants/specialKey';
import { formatSetAsStr, formatSetOrValAsArray } from '@/stores/reportsConfig/configurations/formatsConfiguration';
import yAxisKey from '@/stores/reportsConfig/constants/yAxisKey';

const getPlannedStopIncludedInOEE = (obj) => obj.plannedStopInclGroupPlannedStopIncludedInOEE
  || obj.goodGroupPlannedStopIncludedInOEE
  || obj.slowGroupPlannedStopIncludedInOEE
  || obj.plannedStopNotInclGroupPlannedStopIncludedInOEE
  || obj.unplannedStopGroupPlannedStopIncludedInOEE
  || obj.uncommentedStopGroupPlannedStopIncludedInOEE;

const getPlannedStopNotIncludedInOEE = (obj) => obj.plannedStopNotInclGroupPlannedStopNotIncludedInOEE
  || obj.goodGroupPlannedStopNotIncludedInOEE
  || obj.slowGroupPlannedStopNotIncludedInOEE
  || obj.plannedStopInclGroupPlannedStopNotIncludedInOEE
  || obj.unplannedStopGroupPlannedStopNotIncludedInOEE
  || obj.uncommentedStopGroupPlannedStopNotIncludedInOEE;

const getPlannedTime = (obj) => obj.goodGroupPlannedTime
  || obj.slowGroupPlannedTime
  || obj.plannedStopInclGroupPlannedTime
  || obj.plannedStopNotInclGroupPlannedTime
  || obj.unplannedStopGroupPlannedTime
  || obj.uncommentedStopGroupPlannedTime;

const getSlowProduction = (obj) => obj.slowGroupSlowProduction || 0;
const getGoodProduction = (obj) => obj.goodGroupGoodProduction || 0;
const getUnplannedStop = (obj) => obj.unplannedStopGroupUnplannedStop || 0;
const getUncommentedStop = (obj) => obj.uncommentedStopGroupUncommentedStop || 0;

function calcTotalVisibleTime(obj) {
  return getPlannedTime(obj) + getPlannedStopNotIncludedInOEE(obj) || 0;
}
function calcOperatingTime(obj) {
  return (getSlowProduction(obj) + getGoodProduction(obj)) || 0;
}
function calcOperatingTimePct(obj) {
  return calcOperatingTime(obj) / calcTotalVisibleTime(obj) || 0;
}
function calcOperatingTimePctOfPlannedTime(obj) {
  return calcOperatingTime(obj) / getPlannedTime(obj) || 0;
}
function calcSlowPct(obj) {
  return getSlowProduction(obj) / calcTotalVisibleTime(obj) || 0;
}
function calcSlowPctOfPlannedTime(obj) {
  return getSlowProduction(obj) / getPlannedTime(obj) || 0;
}
function calcGoodDurPct(obj) {
  return getGoodProduction(obj) / calcTotalVisibleTime(obj) || 0;
}
function calcGoodDurPctOfPlannedTime(obj) {
  return getGoodProduction(obj) / getPlannedTime(obj) || 0;
}
function calcPlannedNotIncludedInOEEPct(obj) {
  return getPlannedStopNotIncludedInOEE(obj) / calcTotalVisibleTime(obj) || 0;
}
function calcPlannedIncludedInOEEPct(obj) {
  return getPlannedStopIncludedInOEE(obj) / calcTotalVisibleTime(obj) || 0;
}
function calcPlannedIncludedInOEEPctOfPlannedTime(obj) {
  return getPlannedStopIncludedInOEE(obj) / getPlannedTime(obj) || 0;
}
function calcUnplannedPct(obj) {
  return getUnplannedStop(obj) / calcTotalVisibleTime(obj) || 0;
}
function calcUnplannedPctOfPlannedTime(obj) {
  return getUnplannedStop(obj) / getPlannedTime(obj) || 0;
}
function calcUncommentedPct(obj) {
  return getUncommentedStop(obj) / calcTotalVisibleTime(obj) || 0;
}
function calcUncommentedPctOfPlannedTime(obj) {
  return getUncommentedStop(obj) / getPlannedTime(obj) || 0;
}

function calcValue(obj) {
  switch (obj[specialKey.PREPROCESSED_GROUP_ID_KEY]) {
    case 'good': return calcGoodDurPct(obj);
    case 'slow': return calcSlowPct(obj);
    case 'plannedStopIncludedInOee': return calcPlannedIncludedInOEEPct(obj);
    case 'plannedStopNotIncludedInOee': return calcPlannedNotIncludedInOEEPct(obj);
    case 'unplannedStop': return calcUnplannedPct(obj);
    case 'uncommentedStop': return calcUncommentedPct(obj);
    default:
      return calcGoodDurPct(obj)
        || calcSlowPct(obj)
        || calcPlannedIncludedInOEEPct(obj)
        || calcPlannedNotIncludedInOEEPct(obj)
        || calcUnplannedPct(obj)
        || calcUncommentedPct(obj);
  }
}

function calcValueOfPlannedTime(obj) {
  switch (obj[specialKey.PREPROCESSED_GROUP_ID_KEY]) {
    case 'good': return calcGoodDurPctOfPlannedTime(obj);
    case 'slow': return calcSlowPctOfPlannedTime(obj);
    case 'plannedStopIncludedInOee': return calcPlannedIncludedInOEEPctOfPlannedTime(obj);
    case 'plannedStopNotIncludedInOee': return 0;
    case 'unplannedStop': return calcUnplannedPctOfPlannedTime(obj);
    case 'uncommentedStop': return calcUncommentedPctOfPlannedTime(obj);
    default:
      return calcGoodDurPctOfPlannedTime(obj)
        || calcSlowPctOfPlannedTime(obj)
        || calcPlannedIncludedInOEEPctOfPlannedTime(obj)
        || calcUnplannedPctOfPlannedTime(obj)
        || calcUncommentedPctOfPlannedTime(obj)
        || 0;
  }
}

function calcDuration(obj) {
  switch (obj[specialKey.PREPROCESSED_GROUP_ID_KEY]) {
    case 'good': return getGoodProduction(obj);
    case 'slow': return getSlowProduction(obj);
    case 'plannedStopIncludedInOee': return getPlannedStopIncludedInOEE(obj);
    case 'plannedStopNotIncludedInOee': return getPlannedStopNotIncludedInOEE(obj);
    case 'unplannedStop': return getUnplannedStop(obj);
    case 'uncommentedStop': return getUncommentedStop(obj);
    default:
      return getGoodProduction(obj)
        || getSlowProduction(obj)
        || getPlannedStopIncludedInOEE(obj)
        || getPlannedStopNotIncludedInOEE(obj)
        || getUnplannedStop(obj)
        || getUncommentedStop(obj);
  }
}

export default class TimeUsageDataMap extends ReportsDataMap {
  // requires granularity, groupBy, secondaryLabels, dataPctTotal

  inputItemDefaults = {
    isFake: false,
  };

  getTimeUsagePercentage(val, options = {}) {
    return this.formatPercentage(val * 100, options);
  }

  getTooltipValue({ value, shiftTimePct, plannedTimePct }) {
    const valueLabel = `${this.formatSecondsReadable(value)} `;
    let ptcLabel = '';
    if (this.yAxis === yAxisKey.VALUE) ptcLabel = this.getTimeUsagePercentage(shiftTimePct);
    else if (this.yAxis === yAxisKey.PCT_OF_PLANNED_TIME) ptcLabel = this.getTimeUsagePercentage(plannedTimePct);
    else if (this.yAxis === yAxisKey.DURATION) ptcLabel = `${this.getTimeUsagePercentage(plannedTimePct)} / ${this.getTimeUsagePercentage(shiftTimePct)}`;
    return `${valueLabel} (${ptcLabel})`;
  }

  getUncommentedTooltipValue(obj) {
    return this.getTooltipValue({
      value: getUncommentedStop(obj),
      shiftTimePct: calcUncommentedPct(obj),
      plannedTimePct: calcUncommentedPctOfPlannedTime(obj),
    });
  }

  getUnPlannedTooltipValue(obj) {
    return this.getTooltipValue({
      value: getUnplannedStop(obj),
      shiftTimePct: calcUnplannedPct(obj),
      plannedTimePct: calcUnplannedPctOfPlannedTime(obj),
    });
  }

  getPlannedIncluedInOEETooltipValue(obj) {
    return this.getTooltipValue({
      value: getPlannedStopIncludedInOEE(obj),
      shiftTimePct: calcPlannedIncludedInOEEPct(obj),
      plannedTimePct: calcPlannedIncludedInOEEPctOfPlannedTime(obj),
    });
  }

  getSlowTooltipValue(obj) {
    return this.getTooltipValue({
      value: getSlowProduction(obj),
      shiftTimePct: calcSlowPct(obj),
      plannedTimePct: calcSlowPctOfPlannedTime(obj),
    });
  }

  getGoodProductionTooltipValue(obj) {
    return this.getTooltipValue({
      value: getGoodProduction(obj),
      shiftTimePct: calcGoodDurPct(obj),
      plannedTimePct: calcGoodDurPctOfPlannedTime(obj),
    });
  }

  get keyMap() {
    return new Map([
      [specialKey.PREPROCESSED_GROUP_ID_KEY, specialKey.PREPROCESSED_GROUP_ID_KEY],
      ['isFake', 'isFake'],
      ['value', null],
      ['valueFormatted-0', null],
      ['valueFormatted-1', null],
      ['valueFormatted-2', null],

      ['pctOfPlannedTime', null],
      ['pctOfPlannedTimeFormatted-0', null],
      ['pctOfPlannedTimeFormatted-1', null],
      ['pctOfPlannedTimeFormatted-2', null],

      ['duration', null],
      ['durationFormatted', ''],

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
      ['factoryId', 'factoryId'],
      ['factory', 'factory'],
      ['stationGroupId', 'stationgroupId'],
      ['stationGroup', 'stationgroup'],
      ['sku', 'sku'],
      ['skuLabel', 'skulabel'],
      ['lotCode', 'lotCode'],
      ['productionOrder', 'productionOrder'],

      ['goodGroupPlannedStop', 'goodGroupPlannedStop'],
      ['slowGroupPlannedStop', 'slowGroupPlannedStop'],
      ['plannedStopGroupPlannedStop', 'plannedStopGroupPlannedStop'],
      ['unplannedStopGroupPlannedStop', 'unplannedStopGroupPlannedStop'],
      ['uncommentedStopGroupPlannedStop', 'uncommentedStopGroupPlannedStop'],
      ['plannedStopInclGroupPlannedStop', 'plannedStopInclGroupPlannedStop'],
      ['plannedStopNotInclGroupPlannedStop', 'plannedStopNotInclGroupPlannedStop'],

      ['goodGroupPlannedStopIncludedInOEE', 'goodGroupPlannedStopIncludedInOEE'],
      ['slowGroupPlannedStopIncludedInOEE', 'slowGroupPlannedStopIncludedInOEE'],
      ['plannedStopGroupPlannedStopIncludedInOEE', 'plannedStopGroupPlannedStopIncludedInOEE'],
      ['unplannedStopGroupPlannedStopIncludedInOEE', 'unplannedStopGroupPlannedStopIncludedInOEE'],
      ['uncommentedStopGroupPlannedStopIncludedInOEE', 'uncommentedStopGroupPlannedStopIncludedInOEE'],
      ['plannedStopInclGroupPlannedStopIncludedInOEE', 'plannedStopInclGroupPlannedStopIncludedInOEE'],
      ['plannedStopNotInclGroupPlannedStopIncludedInOEE', 'plannedStopNotInclGroupPlannedStopIncludedInOEE'],

      ['goodGroupPlannedStopNotIncludedInOEE', 'goodGroupPlannedStopNotIncludedInOEE'],
      ['slowGroupPlannedStopNotIncludedInOEE', 'slowGroupPlannedStopNotIncludedInOEE'],
      ['plannedStopGroupPlannedStopNotIncludedInOEE', 'plannedStopGroupPlannedStopNotIncludedInOEE'],
      ['unplannedStopGroupPlannedStopNotIncludedInOEE', 'unplannedStopGroupPlannedStopNotIncludedInOEE'],
      ['uncommentedStopGroupPlannedStopNotIncludedInOEE', 'uncommentedStopGroupPlannedStopNotIncludedInOEE'],
      ['plannedStopInclGroupPlannedStopNotIncludedInOEE', 'plannedStopInclGroupPlannedStopNotIncludedInOEE'],
      ['plannedStopNotInclGroupPlannedStopNotIncludedInOEE', 'plannedStopNotInclGroupPlannedStopNotIncludedInOEE'],

      ['goodGroupPlannedTime', 'goodGroupPlannedTime'],
      ['slowGroupPlannedTime', 'slowGroupPlannedTime'],
      ['plannedStopGroupPlannedTime', 'plannedStopGroupPlannedTime'],
      ['unplannedStopGroupPlannedTime', 'unplannedStopGroupPlannedTime'],
      ['uncommentedStopGroupPlannedTime', 'uncommentedStopGroupPlannedTime'],
      ['plannedStopInclGroupPlannedTime', 'plannedStopInclGroupPlannedTime'],
      ['plannedStopNotInclGroupPlannedTime', 'plannedStopNotInclGroupPlannedTime'],

      ['slowGroupSlowProduction', 'slowGroupSlowProduction'],
      ['goodGroupGoodProduction', 'goodGroupGoodProduction'],
      ['unplannedStopGroupUnplannedStop', 'unplannedStopGroupUnplannedStop'],
      ['uncommentedStopGroupUncommentedStop', 'uncommentedStopGroupUncommentedStop'],

      ['stops', 'stops'],

      ['plannedTime', null],
      ['goodProduction', null],
      ['slowProduction', null],
      ['plannedStop', null],
      ['unplannedStop', null],
      ['uncommentedStop', null],
      ['plannedStopIncludedInOEE', null],
      ['plannedStopNotIncludedInOEE', null],
      ['shiftTime', null],
      ['shiftTimeFormatted', null],
      ['operatingTime', null],
      ['operatingTimeFormatted', null],

      ['goodDurPct', null],
      ['slowPct', null],
      ['plannedPct', null],
      ['unplannedPct', null],
      ['uncommentedPct', null],

      ['operatingTimePctFormatted', null],
      ['goodDurPctFormatted', null],
      ['slowPctFormatted', null],
      ['plannedPctFormatted', null],
      ['plannedIncludedInOEEPctFormatted', null],
      ['plannedNotIncludedInOEEPctFormatted', null],
      ['unplannedPctFormatted', null],
      ['uncommentedPctFormatted', null],

      ['goodDurFormatted', null],
      ['slowFormatted', null],
      ['plannedFormatted', null],
      ['plannedIncludedInOEEFormatted', null],
      ['plannedNotIncludedInOEEFormatted', null],
      ['unplannedFormatted', null],
      ['uncommentedFormatted', null],
      ['plannedTimeFormatted', null],

      ['goodProductionTooltipValue', null],
      ['slowTooltipValue', null],
      ['plannedIncludedInOEETooltipValue', null],
      ['plannedNotIncludedInOEETooltipValue', null],
      ['unplannedTooltipValue', null],
      ['uncommentedTooltipValue', null],

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
    const map = new Map([
      ['value', (val, obj) => calcValue(obj)],
      ['duration', (val, obj) => new Date(calcDuration(obj) * 1000)],
      ['durationFormatted', (val, obj) => this.formatSecondsToHour(calcDuration(obj))],

      ['pctOfPlannedTime', (val, obj) => calcValueOfPlannedTime(obj)],

      ['groupingKey', () => this.getGroupingKey()],

      ['tooltipXLabel', (val) => this.getXScaleLabel(val, this.xScaleTooltipFormat)],
      ['measureLabel', (val) => this.getXScaleLabel(val, this.xScaleLabelFormat)],
      ['tableTimeLabel', (val) => this.getXScaleLabel(val, this.xScaleTableLabelFormat)],

      ['plannedTime', (val, obj) => getPlannedTime(obj)],
      ['goodProduction', (val, obj) => getGoodProduction(obj)],
      ['slowProduction', (val, obj) => getSlowProduction(obj)],
      ['unplannedStop', (val, obj) => getUnplannedStop(obj)],
      ['uncommentedStop', (val, obj) => getUncommentedStop(obj)],
      ['plannedStopIncludedInOEE', (val, obj) => getPlannedStopIncludedInOEE(obj)],
      ['plannedStopNotIncludedInOEE', (val, obj) => getPlannedStopNotIncludedInOEE(obj)],
      ['shiftTime', (val, obj) => calcTotalVisibleTime(obj)],
      ['shiftTimeFormatted', (val, obj) => this.formatSecondsReadable(calcTotalVisibleTime(obj))],
      ['operatingTime', (val, obj) => calcOperatingTime(obj)],
      ['operatingTimeFormatted', (val, obj) => this.formatSecondsReadable(calcOperatingTime(obj))],
      ['operatingTimePctFormatted', (val, obj) => `${this.getTimeUsagePercentage(calcOperatingTimePctOfPlannedTime(obj))} / ${this.getTimeUsagePercentage(calcOperatingTimePct(obj))}`],

      ['goodDurPct', (val, obj) => calcGoodDurPct(obj)],
      ['slowPct', (val, obj) => calcSlowPct(obj)],
      ['unplannedPct', (val, obj) => calcUnplannedPct(obj)],
      ['uncommentedPct', (val, obj) => calcUncommentedPct(obj)],

      ['goodDurPctFormatted', (val, obj) => `${this.getTimeUsagePercentage(calcGoodDurPctOfPlannedTime(obj))} / ${this.getTimeUsagePercentage(calcGoodDurPct(obj))}`],
      ['slowPctFormatted', (val, obj) => `${this.getTimeUsagePercentage(calcSlowPctOfPlannedTime(obj))} / ${this.getTimeUsagePercentage(calcSlowPct(obj))}`],
      ['plannedIncludedInOEEPctFormatted',
        (val, obj) => `${this.getTimeUsagePercentage(calcPlannedIncludedInOEEPctOfPlannedTime(obj))} / ${this.getTimeUsagePercentage(calcPlannedIncludedInOEEPct(obj))}`],
      ['plannedNotIncludedInOEEPctFormatted', (val, obj) => this.getTimeUsagePercentage(calcPlannedNotIncludedInOEEPct(obj))],
      ['unplannedPctFormatted', (val, obj) => `${this.getTimeUsagePercentage(calcUnplannedPctOfPlannedTime(obj))} / ${this.getTimeUsagePercentage(calcUnplannedPct(obj))}`],
      ['uncommentedPctFormatted', (val, obj) => `${this.getTimeUsagePercentage(calcUncommentedPctOfPlannedTime(obj))} / ${this.getTimeUsagePercentage(calcUncommentedPct(obj))}`],

      ['goodDurFormatted', (val, obj) => this.formatSecondsReadable(getGoodProduction(obj))],
      ['slowFormatted', (val, obj) => this.formatSecondsReadable(getSlowProduction(obj))],
      ['plannedIncludedInOEEFormatted', (val, obj) => this.formatSecondsReadable(getPlannedStopIncludedInOEE(obj))],
      ['plannedNotIncludedInOEEFormatted', (val, obj) => this.formatSecondsReadable(getPlannedStopNotIncludedInOEE(obj))],
      ['unplannedFormatted', (val, obj) => this.formatSecondsReadable(getUnplannedStop(obj))],
      ['uncommentedFormatted', (val, obj) => this.formatSecondsReadable(getUncommentedStop(obj))],
      ['plannedTimeFormatted', (val, obj) => this.formatSecondsReadable(getPlannedTime(obj))],

      ['goodProductionTooltipValue', (val, obj) => this.getGoodProductionTooltipValue(obj)],
      ['slowTooltipValue', (val, obj) => this.getSlowTooltipValue(obj)],
      ['plannedIncludedInOEETooltipValue', (val, obj) => this.getPlannedIncluedInOEETooltipValue(obj)],
      ['plannedNotIncludedInOEETooltipValue', (val, obj) => `${this.formatSecondsReadable(getPlannedStopNotIncludedInOEE(obj))} (${this.getTimeUsagePercentage(calcPlannedNotIncludedInOEEPct(obj))})`],
      ['unplannedTooltipValue', (val, obj) => this.getUnPlannedTooltipValue(obj)],
      ['uncommentedTooltipValue', (val, obj) => this.getUncommentedTooltipValue(obj)],

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
      ['factory', formatSetAsStr],
      ['factoryId', formatSetOrValAsArray],

      ['defined', (val, obj) => !obj.isFake],
    ]);

    const userPctDecimalPlaces = this.numberFormattingOptions.pctDecimalPlaces;

    const maxDecimals = 3;
    Array.from(Array(maxDecimals).keys()).forEach((idx) => {
      map.set(`valueFormatted-${idx}`, (val, obj) => this.getTimeUsagePercentage(calcValue(obj), { pctDecimalPlaces: Math.min(idx, userPctDecimalPlaces) }));
      map.set(`pctOfPlannedTimeFormatted-${idx}`, (val, obj) => this.getTimeUsagePercentage(calcValueOfPlannedTime(obj), { pctDecimalPlaces: Math.min(idx, userPctDecimalPlaces) }));
    });

    return map;
  }
}
