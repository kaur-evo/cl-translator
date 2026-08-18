<template>
  <div class="d-flex flex-column flex-nowrap fill-height justify-center align-center">
    <v-progress-circular
      v-if="loading"
      indeterminate
      color="primary"
      size="50"
    />
    <div
      v-else
      class="d-flex full-width fill-height justify-center align-center"
    >
      <bar-chart-vertical
        v-if="hasData"
        :chart-data="chartData"
        :i="i"
        :update-trigger="updateTrigger"
        :data-type="isAbsData ? 'abs' : 'pct'"
        :x-axis-label="xAxisLabel"
        :target-line-enabled="targetLineEnabled"
        :target-line-data-obj="targetLineDataObj"
        :trend-line-enabled="trendLineEnabled"
        :trend-line-data-obj="trendLineDataObj"
        :comparison-bars-enabled="comparisonBarsEnabled"
        :comparison-bars-data="comparisonBarsData"
        :area-highlights-enabled="areaHighlightsEnabled"
        :tooltip-h-t-m-l-func="tooltipHTMLFunc"
        :y-axis-options="yAxisOptions"
        :production-units-in-use="productionUnitsInUse"
      />
      <small-placeholder-text
        v-if="!hasData"
        :primary-text="$t('No data available')"
        :secondary-text="$t('Please check back later or edit settings')"
      />
    </div>
  </div>
</template>
<script>
import * as d3 from 'd3';
import { mapState } from 'pinia';
import { mdiMenuDown, mdiMenuUp } from '@mdi/js';
import { addDays } from 'date-fns';

import BarChartVertical from '@/components/atoms/BarChartVertical/index.vue';
import statisticsApi from '@/api/statisticsApi';
import SmallPlaceholderText from '@/components/atoms/SmallPlaceholderText/index.vue';
import vIconRawTemplate from '@/helpers/html/vIconRawTemplate';
import { leastSquares, smartPercentageChange } from '@/helpers/d3Helpers';
import comparisonType, { getComparisonType } from '@/constants/dashboardComparisonType';
import colorConstants from '@/constants/colorConstants';
import { formatNumber, formatPercentage } from '@/helpers/numbers/formatNumber';
import { formatDate } from '@/helpers/date/formatDate';
import parseDateStr from '@/helpers/date/parseDateStr';
import { isWeekendDay } from '@/helpers/date/isWeekendDay';
import { getCurrentPeriod } from '@/constants/rollingPeriodRangeDefinitions';
import { getDateLabelFormats } from '@/helpers/date/dashboardDateFormat';
import {
  THIS_WEEK,
  ROLLING_7_DAYS,
  THIS_MONTH,
  ROLLING_30_DAYS,
  THIS_YEAR,
  ROLLING_12_MONTHS,
  ROLLING_7_SHIFTS,
  ONGOING_SHIFT,
  PREVIOUS_SHIFT,
  LAST_WEEK,
  LAST_MONTH,
  LAST_YEAR,
  CUSTOM,
} from '@/constants/predefinedTimePeriodNames';
import graphColors from '@/constants/graphColors';
import { useStationStore, useProfileStore, useConfigurationStore } from '@/stores/index';

const colors = colorConstants.dark;

const altUnitMeasures = {
  altqty: 'altqty',
  goodaltqty: 'goodaltqty',
  scrapaltqty: 'scrapaltqty',
};

const aboveTargetColorMap = {
  qty: colors['lw-purple'],
  [altUnitMeasures.altqty]: colors['lw-purple'],
  goodqty: colors['lw-purple'],
  [altUnitMeasures.goodaltqty]: colors['lw-purple'],
  scrapqty: graphColors['above-target-scrap-qty'],
  [altUnitMeasures.scrapaltqty]: graphColors['above-target-scrap-qty'],
  oee: graphColors['above-target-oee'],
  quality: colors.secondary,
  availability: colors.primary,
  performance: colors['lw-yellow'],
  technicalavailability: graphColors['above-target-technical-availability'],
};

const belowTargetColorMap = {
  qty: graphColors['below-target-qty'],
  [altUnitMeasures.altqty]: graphColors['below-target-qty'],
  goodqty: graphColors['below-target-qty'],
  [altUnitMeasures.goodaltqty]: graphColors['below-target-qty'],
  scrapqty: colors.secondary,
  [altUnitMeasures.scrapaltqty]: colors.secondary,
  oee: graphColors['below-target-oee'],
  quality: graphColors['below-target-quality'],
  availability: graphColors['below-target-availability'],
  performance: graphColors['below-target-performance'],
  technicalavailability: graphColors['below-target-technical-availability'],
};

function parseArrayToValue(value) {
  if (Array.isArray(value)) {
    if (value.length === 1) {
      return value[0];
    }
    throw new Error('Expected a single value, but received an array with multiple values.');
  }
  return value;
}

export default {
  name: 'DashboardOeeBarWidget',
  components: {
    BarChartVertical,
    SmallPlaceholderText,
  },
  props: {
    i: {
      type: [String, Number],
      required: true,
    },
    widgetData: {
      type: Object,
      required: true,
    },
    updateTrigger: {
      type: Number,
      default: 0,
    },
    type: {
      type: String,
      required: true,
    },
    fetchTrigger: {
      type: Number,
      default: 0,
    },
    measure: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      loading: false,
      granularity: 'date',
      rawChartData: [],
      productionUnitsInUse: new Set(),
      chartData: [],
    };
  },
  computed: {
    ...mapState(useStationStore, ['stationsMap']),
    ...mapState(useProfileStore, ['dateFormat', 'firstDayOfWeek']),
    ...mapState(useConfigurationStore, ['includeNoDataDatapoints']),
    trendLineDataObj() {
      const data = [...this.chartData];
      const runningPeriods = [
        THIS_WEEK,
        ROLLING_7_DAYS,
        THIS_MONTH,
        ROLLING_30_DAYS,
        THIS_YEAR,
        ROLLING_12_MONTHS,
      ];
      const isRollingPeriod = runningPeriods.includes(
        this.widgetData.periodName,
      );

      if (data.length > 1 && isRollingPeriod) data.pop();

      const ySeries = data.reduce((arr, d) => {
        if (!this.isIncludedInTrendline(this.widgetData.measure, d.shiftproductiontype)) return arr;
        const arrClone = [...arr];
        arrClone.push(parseFloat(d.value));
        return arrClone;
      }, []);
      const xSeries = d3.range(1, ySeries.length + 1);
      const leastSquaresCoeff = leastSquares(xSeries, ySeries);
      const y1val = leastSquaresCoeff[0] + leastSquaresCoeff[1];
      const y2val = (leastSquaresCoeff[0] * xSeries.length) + leastSquaresCoeff[1];
      const x1val = data && data.length ? data[0].measure : 0;
      const x2val = data && data.length ? data[data.length - 1].measure : 0;
      const getTrendingLabel = (val) => {
        if (val < 0) return this.$t('Trend down');
        if (val > 0) return this.$t('Trend up');
        return this.$t('Flat trend');
      };
      // x, y values here arent px values but rather measured values used by chart scales
      return {
        x1val,
        y1val,
        x2val,
        y2val,
        tooltipPrimaryValue: getTrendingLabel(y2val - y1val),
      };
    },
    isAbsData() {
      return !!this.widgetData.measure.includes('qty');
    },
    aboveTargetColor() {
      return aboveTargetColorMap[this.widgetData.measure] || 'red';
    },
    belowTargetColor() {
      return belowTargetColorMap[this.widgetData.measure] || 'blue';
    },
    trendLineEnabled() {
      if (!this.includeNoDataDatapoints) return false;
      return typeof this.widgetData.trendEnabled === 'boolean' && this.chartData.length > 1
        ? this.widgetData.trendEnabled
        : false;
    },
    comparisonMode() {
      return getComparisonType({
        includeComparison: this.widgetData.includeComparison,
        _periodType: this.widgetData.periodName,
        _widgetType: this.type,
        _comparisonType: this.widgetData.comparisonType,
      });
    },
    comparisonBarsEnabled() {
      return this.comparisonMode !== comparisonType.NO_COMPARISON;
    },
    targetLineEnabled() {
      return !!this.widgetData.target;
    },
    target() {
      return this.isAbsData
        ? this.widgetData.target
        : this.widgetData.target / 100;
    },
    targetLineDataObj() {
      return {
        valueLabel: this.$t('Target'),
        value: this.target || 0,
        tooltipPrimaryValue: this.formatTooltipValue(this.target || 0, { decimalPlaces: null }) + this.getGlobalUnitSuffix(),
        color: '#FFF',
      };
    },
    needsDateFilling() {
      return [THIS_WEEK, LAST_WEEK, ROLLING_7_DAYS, THIS_MONTH, LAST_MONTH, ROLLING_30_DAYS, THIS_YEAR, LAST_YEAR, ROLLING_12_MONTHS].includes(this.widgetData.periodName);
    },
    periodDateArray() {
      if (!this.needsDateFilling) return [];
      const dateRange = getCurrentPeriod(this.widgetData.periodName, { weekStartsOn: this.firstDayOfWeek });
      if ([THIS_YEAR, LAST_YEAR, ROLLING_12_MONTHS].includes(this.widgetData.periodName)) {
        const periodArray = d3.timeMonths(parseDateStr(dateRange[0]), addDays(parseDateStr(dateRange[1]), 1)).map(
          (d) => formatDate(d, 'yyyy-MM-01'),
        );
        return periodArray;
      }
      const periodArray = d3.timeDays(parseDateStr(dateRange[0]), addDays(parseDateStr(dateRange[1]), 1)).map(
        (d) => formatDate(d, 'yyyy-MM-dd'),
      );
      return periodArray;
    },
    rawDataInclNoShiftDays() {
      if ( // data is already complete
        !this.needsDateFilling
        || this.rawChartData.length === 0
        || this.rawChartData.length === this.periodDateArray.length
      ) return this.rawChartData;
      // fill in missing days
      const emptyMap = this.periodDateArray.reduce((map, date) => {
        // eslint-disable-next-line no-param-reassign
        map[date] = {
          date,
          value: null,
          comparison: null,
          comparisonDate: null,
        };
        return map;
      }, {});
      const dateDataMap = this.rawChartData.reduce((map, d) => {
        // eslint-disable-next-line no-param-reassign
        map[d.date] = d;
        return map;
      }, {});
      const completeMap = { ...emptyMap, ...dateDataMap };
      return Object.values(completeMap).sort((a, b) => parseDateStr(a.date) - parseDateStr(b.date));
    },
    comparisonBarsData() {
      if (!this.comparisonBarsEnabled) return [];
      return this.rawDataInclNoShiftDays.reduce((list, d, index) => {
        const measure = this.isShiftGranularity(this.widgetData.periodName) ? index : d.date;
        const value = d.comparison;

        if (value !== undefined && value !== null) {
          list.push({
            value,
            measure,
            color: colors['lw-background'],
            strokeColor: colors.white,
          });
        }
        return list;
      }, []);
    },
    yAxisOptions() {
      return {
        tickFormat: (val) => (this.isPercentage ? formatPercentage(val * 100) : formatNumber(val)) + this.getGlobalUnitSuffix(),
      };
    },
    xAxisLabel() {
      if (this.granularity === 'shift') return this.$t('Shift');
      if (this.granularity === 'weekofyear') return this.$t('Week');
      if (this.granularity === 'month') return this.$t('Month');
      if (this.granularity === 'year') return this.$t('year');
      return this.$t('Day');
    },
    isPercentage() {
      return ['performance', 'quality', 'technicalavailability', 'availability', 'oee'].includes(this.measure);
    },
    hasData() {
      return this.rawChartData && this.rawChartData.length > 0;
    },
    areaHighlightsEnabled() {
      return this.granularity === 'date';
    },
  },
  watch: {
    fetchTrigger() {
      this.getGraphData();
    },
    rawDataInclNoShiftDays(newVal) {
      this.onRawChartDataChange(newVal);
    },
  },
  mounted() {
    this.getGraphData();
  },
  methods: {
    isShiftGranularity(periodName) {
      return [ROLLING_7_SHIFTS, ONGOING_SHIFT, PREVIOUS_SHIFT].includes(periodName);
    },
    onRawChartDataChange(newVal) {
      const currentChartData = [];
      newVal.forEach((d, index) => {
        if (this.isShiftGranularity(this.widgetData.periodName)) {
          currentChartData.push(this.getShiftGranularityMap(d, index));
        } else {
          currentChartData.push(this.getDateGranularityMap(d, index));
          this.updateProductionUnitsInUse(d);
        }
      });
      this.chartData = currentChartData;
    },
    getShiftGranularityMap(d, index) {
      return {
        measure: index,
        measureLabel: parseArrayToValue(d.shiftName),
        measureTooltipLabel: `${formatDate(d.date, 'short')} ${parseArrayToValue(d.shiftName)}`,
        comparison: d.comparison,
        value: d.value,
        color: this.getBarColor(d.value),
        activeColor: this.aboveTargetColor,
        tooltipPrimaryValue: `${this.formatTooltipValue(d.value)}${this.getDatapointUnitSuffix(d)}`,
        isAreaHighlighted: isWeekendDay(d.date),
        unitSuffix: this.getDatapointUnitSuffix(d),
        shiftproductiontype: d.shiftproductiontype,
      };
    },
    isMeasureAltUnit(measure) {
      return altUnitMeasures[measure] !== undefined;
    },
    getDatapointUnitSuffix(d) {
      if (this.isPercentage) {
        return '';
      }
      let ret = null;
      if (this.isMeasureAltUnit(this.widgetData.measure)) {
        if (d.alternativeUnitId?.length === 1) {
          [ret] = d.alternativeUnitId;
        }
      } else if (d.unitId?.length === 1) {
        [ret] = d.unitId;
      }

      if (ret === null) {
        return '';
      }
      this.productionUnitsInUse.add(ret);
      return ` ${ret}`;
    },
    updateProductionUnitsInUse(d) {
      if (this.isMeasureAltUnit(this.widgetData.measure)) {
        d.alternativeUnitId?.forEach((unitId) => {
          this.productionUnitsInUse.add(unitId);
        });
      } else {
        d.unitId?.forEach((unitId) => {
          this.productionUnitsInUse.add(unitId);
        });
      }
    },
    getGlobalUnitSuffix() {
      if (this.isPercentage) {
        return '';
      }
      if (this.productionUnitsInUse.size === 1) {
        return ` ${Array.from(this.productionUnitsInUse)[0]}`;
      }
      return '';
    },
    getDateGranularityMap(d) {
      const { labelFormat, shortFormat } = getDateLabelFormats(this.dateFormat, this.granularity, { week: this.$t('Week') });
      return {
        measure: d.date,
        measureLabel: formatDate(d.date, shortFormat),
        measureTooltipLabel: this.$t(formatDate(d.date, labelFormat)),
        comparison: d.comparison,
        value: d.value,
        color: this.getBarColor(d.value),
        activeColor: this.aboveTargetColor,
        tooltipPrimaryValue: `${this.formatTooltipValue(d.value)}${this.getDatapointUnitSuffix(d)}`,
        isAreaHighlighted: isWeekendDay(d.date),
        shiftproductiontype: d.shiftproductiontype,
        unitSuffix: this.getDatapointUnitSuffix(d),
      };
    },
    getBarColor(value) {
      const noTargetAndNotScrap = !this.target && !['scrapqty', altUnitMeasures.scrapaltqty].includes(this.widgetData.measure);
      const aboveTarget = this.target && value >= this.target;
      if (noTargetAndNotScrap || aboveTarget) return this.aboveTargetColor;
      return this.belowTargetColor;
    },
    formatTooltipValue(val, options = {}) {
      if (Number.isNaN(Number(val))) return val;
      if (!this.isAbsData) return formatPercentage(val * 100, options);
      return formatNumber(val, options);
    },
    async getGraphData() {
      try {
        this.loading = true;
        const payload = {
          factoryIds: this.widgetData.factoryId,
          stationIds: this.widgetData.stationId.filter(
            (id) => !!this.stationsMap[id],
          ), // check permissions
          measure: this.widgetData.measure,
          periodName: this.widgetData.periodName,
          comparisonMode: this.comparisonMode,
        };
        if (this.widgetData.periodName === CUSTOM) payload.range = this.widgetData.range;
        const { results, granularity } = await statisticsApi.getOeeWidgetData(payload);
        this.rawChartData = results;
        this.granularity = granularity;
      } catch {
        // pass for testing
      } finally {
        this.loading = false;
      }
    },
    formattedComparison(val, prev) {
      const diff = val - prev;
      let sign = '';
      if (diff > 0) sign = '+';
      if (diff < 0) sign = '-';
      const change = this.isPercentage ? formatPercentage(Math.abs(diff)) : formatNumber(Math.abs(diff));
      return sign + change;
    },
    getTextColor(diff) {
      if (['scrapqty', altUnitMeasures.scrapaltqty].includes(this.measure)) {
        return diff >= 0 ? 'text-error' : 'text-primary';
      }
      return diff > 0 ? 'text-primary' : 'text-error';
    },
    tooltipHTMLFunc(d) {
      if (d.value && d.comparison) {
        const currentValue = this.isPercentage ? d.value * 100 : d.value;
        const prevValue = this.isPercentage ? d.comparison * 100 : d.comparison;
        const diff = currentValue - prevValue;
        const rowColor = this.getTextColor(diff);
        let trendIcon = '';
        if (diff > 0) {
          trendIcon = vIconRawTemplate(mdiMenuUp, 24, '', rowColor);
        }
        if (diff < 0) {
          trendIcon = vIconRawTemplate(mdiMenuDown, 24, '', rowColor);
        }
        if (diff === '') {
          trendIcon = vIconRawTemplate(mdiMenuUp, 24, '', rowColor);
        }
        const formattedDiff = this.formattedComparison(currentValue, prevValue) + d.unitSuffix;
        const diffValue = `<span class="text-body-medium">${formattedDiff}</span>`;
        const tooltipPercentageChange = smartPercentageChange(d.comparison, d.value);
        const percentageDiff = tooltipPercentageChange
          ? formatPercentage(Math.abs(tooltipPercentageChange))
          : tooltipPercentageChange;
        const percetageDiffSpan = `<span class="text-body-medium">${percentageDiff}</span>`;
        const row = `<div class="${rowColor} d-flex align-center">${diffValue}&nbsp;(${trendIcon} ${percetageDiffSpan})</div>`;
        return row;
      }
      return '';
    },
    isIncludedInTrendline(measure, shiftproductiontype) {
      if (!shiftproductiontype) return false;
      const includedTypesByMeasure = {
        qty: [1, 2],
        goodqty: [1, 2],
        scrapqty: [2],
        oee: [1, 2],
        quality: [2],
        performance: [2],
        availability: [1, 2],
        technicalavailability: [1, 2],
      };
      return includedTypesByMeasure[measure]?.includes(shiftproductiontype) || false;
    },
  },
};
</script>
