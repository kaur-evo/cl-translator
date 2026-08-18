<template>
  <div class="d-flex flex-column flex-nowrap fill-height justify-center align-center">
    <v-progress-circular
      v-if="loading || !mounted"
      indeterminate
      color="primary"
      size="50"
    />
    <div
      v-else
      class="d-flex full-width fill-height justify-center align-center"
    >
      <bar-chart-horizontal
        v-show="!loading && chartData && !!chartData.length"
        :chart-data="chartData"
        :i="i"
        :update-trigger="updateTrigger"
        :comparison-arrows-enabled="comparisonArrowsEnabled"
        :comparison-arrows-data="chartData"
        :tooltip-h-t-m-l-func="tooltipHTMLFunc"
      />
      <small-placeholder-text
        v-show="!loading && chartData && !chartData.length"
        :primary-text="$t('No data available')"
        :secondary-text="$t('Please check back later or edit settings')"
      />
    </div>
  </div>
</template>
<script>
import {
  mdiCircleMedium,
  mdiMenuUp,
  mdiMenuDown,
} from '@mdi/js';
import { mapState } from 'pinia';

import statisticsApi from '@/api/statisticsApi';
import formatSecondsShort from '@/helpers/time/formatSecondsShort';
import { DELAYS_CHART, SPEEDLOSS_CHART, SCRAP_CHART } from '@/constants/dashboardWidgetTypes';
import { CUSTOM } from '@/constants/predefinedTimePeriodNames';
import { requestWidgetViewTypes } from '@/constants/widgetViewTypes';
import colorConstants from '@/constants/colorConstants';
import { smartPercentageChange } from '@/helpers/d3Helpers';
import vIconRawTemplate from '@/helpers/html/vIconRawTemplate';
import comparisonType, { getComparisonType } from '@/constants/dashboardComparisonType';
import { formatNumber, formatPercentage } from '@/helpers/numbers/formatNumber';
import BarChartHorizontal from '@/components/atoms/BarChartHorizontal/index.vue';
import SmallPlaceholderText from '@/components/atoms/SmallPlaceholderText/index.vue';
import i18n from '@/services/i18n';
import { useStationStore } from '@/stores/index';

export default {
  name: 'DashboardHorizontalBarWidget',
  components: {
    BarChartHorizontal,
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
  },
  data() {
    return {
      chartData: [],
      loading: false,
      mounted: false,
    };
  },
  computed: {
    ...mapState(useStationStore, ['stationsMap']),
    colors() {
      return colorConstants[this.$vuetify.theme.name];
    },
    comparisonMode() {
      return getComparisonType({
        includeComparison: this.widgetData.includeComparison,
        _periodType: this.widgetData.periodName,
        _widgetType: this.type,
        _comparisonType: this.widgetData.comparisonType,
      });
    },
    comparisonArrowsEnabled() {
      return this.comparisonMode !== comparisonType.NO_COMPARISON;
    },
    requestParams() {
      const params = {
        factoryIds: this.widgetData.factoryId,
        stationIds: this.widgetData.stationId.filter((id) => !!this.stationsMap[id]), // check permissions
        entityIds: this.widgetData.entityIds,
        periodName: this.widgetData.periodName,
        top: this.widgetData.top,
        comparisonMode: this.comparisonMode,
        groupBy: requestWidgetViewTypes[this.widgetData.viewBy],
        useAlternativeUnit: this.widgetData.useAlternativeUnit,
      };
      if (this.widgetData.periodName === CUSTOM) params.range = this.widgetData.range;
      return params;
    },
  },
  watch: {
    fetchTrigger() {
      this.fetchWidgetData();
    },
  },
  async mounted() {
    await this.fetchWidgetData();
    this.mounted = true;
  },
  methods: {
    async fetchWidgetData() {
      this.loading = true;
      if (this.type === DELAYS_CHART) {
        await this.fetchPeriodDelays();
      } else if (this.type === SPEEDLOSS_CHART) {
        await this.fetchPeriodSpeedLossReasons();
      } else if (this.type === SCRAP_CHART) {
        await this.fetchPeriodScrapReasons();
      }
      this.loading = false;
    },
    formattedComparison(val, prev, formatSeconds, formatCount) {
      const diff = val - prev;
      let sign = '';
      if (diff > 0) sign = '+';
      if (diff < 0) sign = '-';
      if (formatSeconds) {
        return sign + formatSecondsShort(Math.abs(diff), true, true);
      }
      if (formatCount) {
        return sign + formatNumber(Math.abs(diff));
      }
      return sign + Math.abs(diff);
    },
    getChangeRowProperties(changeValue) {
      let rowColor = '';
      let trendIcon = '';
      const pctDiffFormatted = changeValue
        ? formatPercentage(Math.abs(changeValue))
        : changeValue;
      if (changeValue > 0) {
        rowColor = 'text-error';
        trendIcon = vIconRawTemplate(mdiMenuUp, 24, '', rowColor);
      }
      if (changeValue < 0) {
        rowColor = 'text-primary';
        trendIcon = vIconRawTemplate(mdiMenuDown, 24, '', rowColor);
      }
      if (changeValue === '') {
        rowColor = 'text-error';
        trendIcon = '';
      }
      return {
        rowColor,
        trendIcon,
        pctDiffFormatted,
      };
    },
    tooltipHTMLFunc(d) {
      const rows = [];
      const dotIcon = vIconRawTemplate(mdiCircleMedium, 24, d.tooltipDotColor);
      const dotLabel = `<span class="text-label-small">${d.tooltipDotLabel}</span>`;
      const row1 = `<div class="d-flex flew-row align-center ml-n2">${dotIcon}${dotLabel}</div>`;
      const valueLabel = `<span class="text-body-medium font-weight-medium">${d.tooltipLabelValue || ''}</span>`;
      let timesLabel = '';
      if (d.tooltipSecondaryValue && d.tooltipSecondaryAppend) {
        timesLabel = `<span class="text-body-medium">(<span class="font-weight-medium">${formatNumber(d.tooltipSecondaryValue)}</span> ${d.tooltipSecondaryAppend})</span>`;
      } else if (d.tooltipSecondaryAppend) {
        timesLabel = `<span class="text-body-medium">${d.tooltipSecondaryAppend}</span>`;
      }
      const row2 = `<div>${valueLabel} ${timesLabel || ''}</div>`;
      rows.push(row1, row2);
      if (this.comparisonArrowsEnabled) {
        const friendlyDiff = d.tooltipFormattedTimeComparison
          ? `<span class="text-body-medium">${d.tooltipFormattedTimeComparison}</span>`
          : '';
        const { rowColor, trendIcon, pctDiffFormatted } = this.getChangeRowProperties(d.tooltipPercentageChange);
        const percetageDiffSpan = `<span class="text-body-medium">${pctDiffFormatted || 'N/A'}</span>`;

        const row3 = `<div class="${rowColor} d-flex align-center">${friendlyDiff}&nbsp;(${trendIcon} ${percetageDiffSpan})</div>`;
        rows.push(row3);
      }
      if (d.tooltipPtcOfTotal) {
        const { rowColor, trendIcon, pctDiffFormatted } = this.getChangeRowProperties(d.tooltipPlannedPctPercentageChange);
        const percetageDiffSpan = `<span class="text-body-medium">${pctDiffFormatted || 'N/A'}</span>`;
        const comparisonInfo = this.comparisonArrowsEnabled ? `&nbsp;(${trendIcon} ${percetageDiffSpan})` : '';
        const ptcOfTotalRow = `<div class="${rowColor} d-flex align-center"><span class="text-body-medium">${d.tooltipPtcOfTotal}</span>${comparisonInfo}</div>`;
        rows.push(ptcOfTotalRow);
      }
      return rows.join('');
    },
    async fetchPeriodDelays() {
      const response = await statisticsApi.getPeriodDelays(this.requestParams);

      this.chartData = response.map((d) => {
        let labelAppend = '';
        if (d.count) labelAppend = i18n.global.t('times');
        const formattedDuration = formatSecondsShort(d.value, true);
        const formattedTooltipDuration = formatSecondsShort(d.value, true, true);
        const formattedComparison = this.formattedComparison(
          d.value,
          d.comparison,
          true,
        );
        return {
          value: formattedDuration,
          measure: d.value,
          measureLabel: d.valueLabel,
          color: d.color,
          tooltipDotColor: d.color,
          tooltipDotLabel: d.valueLabel,
          tooltipLabelValue: formattedTooltipDuration,
          tooltipSecondaryValue: d.count,
          tooltipSecondaryAppend: labelAppend,
          tooltipFormattedTimeComparison: formattedComparison,
          tooltipPercentageChange: smartPercentageChange(d.comparison, d.value),
          tooltipPlannedPctPercentageChange: smartPercentageChange(d.comparisonPlannedTimePct, d.plannedTimePct),
          comparison: d.comparison,
          tooltipPtcOfTotal: d.plannedTimePct ? i18n.global.t('{pct} of planned time', { pct: formatPercentage(d.plannedTimePct * 100) }) : '',
        };
      });
    },
    async fetchPeriodSpeedLossReasons() {
      const response = await statisticsApi.getPeriodSpeedLosses(
        this.requestParams,
      );
      this.chartData = response.map((d) => {
        let labelAppend = '';
        if (d.count) labelAppend = i18n.global.t('times');
        const formattedComparison = this.formattedComparison(
          d.value,
          d.comparison,
          true,
        );
        const formattedDuration = formatSecondsShort(d.value, true);
        const formattedTooltipDuration = formatSecondsShort(d.value, true, true);
        return {
          value: formattedDuration,
          measure: d.value,
          measureLabel: d.valueLabel,
          color: d.color,
          tooltipDotColor: d.color,
          tooltipDotLabel: d.valueLabel,
          tooltipLabelValue: formattedTooltipDuration,
          tooltipSecondaryValue: d.count,
          tooltipSecondaryAppend: labelAppend,
          tooltipFormattedTimeComparison: formattedComparison,
          tooltipPercentageChange: smartPercentageChange(d.comparison, d.value),
          comparison: d.comparison,
          textColor: d.color === this.colors['lw-yellow'] && d.entityId === 0 ? this.colors['primary-dark'] : null,
        };
      });
    },
    formatUnitQuantity(value, productionUnit) {
      return value + (productionUnit?.length === 1 ? ` ${productionUnit}` : '');
    },
    async fetchPeriodScrapReasons() {
      const response = await statisticsApi.getPeriodScrapReasons(this.requestParams);
      this.chartData = response.map((d) => {
        const formattedComparison = this.formattedComparison(
          d.value,
          d.comparison,
          false,
          true,
        );
        return {
          value: this.formatUnitQuantity(formatNumber(d.value), d.productionUnit),
          measure: d.value,
          measureLabel: d.valueLabel,
          color: d.color,
          tooltipDotColor: d.color,
          tooltipDotLabel: d.valueLabel,
          tooltipSecondaryAppend: this.formatUnitQuantity(formatNumber(d.value), d.productionUnit),
          tooltipValue: d.value,
          comparison: d.comparison,
          tooltipFormattedTimeComparison: this.formatUnitQuantity(formattedComparison, d.productionUnit),
          tooltipPercentageChange: smartPercentageChange(d.comparison, d.value),
          tooltipPtcOfTotal: d.producedPct ? formatPercentage(d.producedPct * 100).slice(0, -1) + i18n.global.t('% of produced') : '',
          tooltipPlannedPctPercentageChange: smartPercentageChange(d.comparisonProducedPct, d.producedPct),
        };
      });
    },
  },
};
</script>
