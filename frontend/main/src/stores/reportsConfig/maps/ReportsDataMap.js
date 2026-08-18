import { format, parseISO } from 'date-fns';

import getGranularityValueAsDate from '../getGranularityValueAsDate';
import specialKey from '../constants/specialKey';

import DataMap from './DataMap';

import formatDateAsMonthRange from '@/helpers/date/formatDateAsMonthRange';
import { formatSetAsStr } from '@/stores/reportsConfig/configurations/formatsConfiguration';
import granularity from '@/stores/reportsConfig/constants/granularity';
import { firstUpper } from '@/helpers/string-formatting';
import calculateDatapointDateRange from '@/stores/reportsConfig/calculateDatapointDateRange';
import { formatWeekday } from '@/helpers/date/formatLocaleDate';


export function getMapValue(map, key) {
  if (key && map[key] !== undefined) {
    return map[key];
  }
  return map.default;
}

export default class ReportsDataMap extends DataMap {
  idKeyNameKeyMap = {
    factoryId: 'factory',
    stationId: 'station',
    stationgroupId: 'stationgroup',
    singleoperator: 'singleoperator',
    shifttemplate: 'shifttemplate',
    productId: 'product',
    productgroupId: 'productgroup',
    sku: 'sku',
    lotCode: 'lotCode',
    productionOrder: 'productionOrder',
    default: 'station',
  };

  get xScaleTooltipFormat() {
    if (!this.formattingOptions.timeFormat) return {};
    return {
      starttime: `${this.formattingOptions.timeFormat.short} ${this.formattingOptions.dateFormat.long}`,
      duetime: `${this.formattingOptions.timeFormat.short} ${this.formattingOptions.dateFormat.long}`,
      date: this.formattingOptions.dateFormat.long,
      dayofweek: 'formatWeekday',
      weekofyear: 'formatWeek',
      month: 'formatDateAsMonthRange',
      quarter: 'QQQ yyyy',
      year: 'yyyy',
    };
  }

  get xScaleLabelFormat() {
    if (!this.formattingOptions.timeFormat) return {};
    return {
      starttime: this.formattingOptions.timeFormat.short,
      duetime: this.formattingOptions.timeFormat.short,
      date: 'd',
      dayofweek: 'formatWeekday',
      weekofyear: 'I',
      month: 'MMMM',
      quarter: 'QQQ yyyy',
      year: 'yyyy',
    };
  }

  get xScaleTableLabelFormat() {
    if (!this.formattingOptions.timeFormat) return {};
    return {
      starttime: `${this.formattingOptions.dateFormat.short} ${this.formattingOptions.timeFormat.short}`,
      duetime: `${this.formattingOptions.dateFormat.short} ${this.formattingOptions.timeFormat.short}`,
      date: this.formattingOptions.dateFormat.long,
      dayofweek: 'formatWeekday',
      weekofyear: 'formatWeek',
      month: 'MMMM',
      quarter: 'QQQ yyyy',
      year: 'yyyy',
    };
  }

  get xScaleValueKey() {
    if (this.granularity === granularity.TOTAL) {
      return this.itemGroupingIdKey;
    }
    return this.granularity;
  }

  get xScaleValueLabelKey() {
    if (this.granularity === granularity.TOTAL || this.item.currentGroupByLevel <= 1) {
      return this.entityNameKey;
    }
    return this.granularity;
  }

  get entityNameKey() {
    if (this.item.currentGroupByKey === specialKey.PREPROCESSED_GROUP_ID_KEY) {
      return getMapValue(this.idKeyNameKeyMap, this.item[this.item.currentGroupByKey]);
    }
    return getMapValue(this.idKeyNameKeyMap, this.item.currentGroupByKey);
  }

  get itemGroupingIdKey() {
    return this.item.currentGroupByKey;
  }

  get remappedGroupBy() {
    return this.item.primaryGroupByKey;
  }

  getGroupingKey() {
    if (this.granularity === granularity.TOTAL) {
      return this.item[this.remappedGroupBy];
    }
    return this.item[this.granularity];
  }

  getXScaleLabel(val, formatRules) {
    if (!val) return '';
    if (this.granularity === granularity.TOTAL || this.item.currentGroupByLevel <= 1) {
      return formatSetAsStr(val);
    }

    return this.granularityLabelFormatter(val, formatRules);
  }

  granularityLabelFormatter(val, formats) {
    const m = getGranularityValueAsDate(val, this.granularity);
    if (!m) return '';
    const helpers = {
      formatDateAsMonthRange: () => formatDateAsMonthRange(m, this.startDate, this.endDate, this.formattingOptions.dateFormat.long),
      formatWeek: () => `${this.translations.Week} ${format(m, 'I')}`,
      formatWeekday: () => firstUpper(formatWeekday(m, this.locale, 'long')),
    };
    if (formats[this.granularity] !== undefined) {
      if (helpers[formats[this.granularity]] !== undefined) {
        return helpers[formats[this.granularity]]();
      }
      return format(m, formats[this.granularity]);
    }
    return m;
  }

  getDatapointDateRange() {
    const ret = calculateDatapointDateRange({
      rangeStart: this.startDate,
      rangeEnd: this.endDate,
      granularity: this.granularity,
      groupingKey: this.getGroupingKey(),
      cfgType: this.configType,
      weekStartsOn: this.formattingOptions.firstDayOfWeek,
    });
    return ret;
  }

  static getDurationFromDateRange(range) {
    const [startDate, endDate] = range;
    const startDt = parseISO(`${startDate}T00:00:00.000Z`);
    const endDt = parseISO(`${endDate}T23:59:59.999Z`);
    return Math.round((endDt - startDt) / 1000);
  }

  static getAppendableUnitId(obj) {
    return obj.unitId?.size === 1 ? ` ${[...obj.unitId][0]}` : '';
  }

  static getAppendableAltUnitId(obj) {
    return obj.alternativeUnitId?.size === 1 ? ` ${[...obj.alternativeUnitId][0]}` : '';
  }
}
