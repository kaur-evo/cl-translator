<template>
  <div class="chart-wrapper">
    <div
      id="reports-chart"
      ref="chart-wrapper"
    />
  </div>
</template>

<script>
import { mapState, mapActions } from 'pinia';

import ReportsChart from './ReportsChart';

import { useConfigurationStore, useProfileStore, useReportsConfigStore } from '@/stores';
import getYAxisConfig from '@/stores/reportsConfig/configurations/yAxisConfig';
import getChartTranslations from '@/stores/reportsConfig/configurations/chartTranslations';


let redrawTimeout = null;
export default {
  name: 'ReportsInternalChart',
  props: {
    screenPxTotal: { type: Number, default: 0 },
    isSideMenuOpen: { type: Boolean, required: true },
    totals: { type: Object, required: true },
  },
  emits: ['drilldown'],
  data() {
    return {
      scrollPct: 0,
      chart: null,
    };
  },
  computed: {
    ...mapState(useProfileStore, ['firstDayOfWeek']),
    ...mapState(useReportsConfigStore, [
      'configType',
      'granularity',
      'orderDir',
      'chartType',
      'chartCurve',
      'yAxis',
      'yAxisRight',
      'isGeneratingPdf',
      'orderedDateRange',
      'chartData',
      'chartLegendState',
      'groupBy',
      'trendlineData',
    ]),
    ...mapState(useConfigurationStore, ['disableTrendline']),
  },
  watch: {
    granularity(val) {
      if (this.chart) this.chart.granularity = val;
      this.setInitialScrollPosition();
    },
    screenPxTotal(newVal, oldVal) {
      if (newVal && newVal !== oldVal) {
        this.redraw();
      }
    },
    isSideMenuOpen() {
      this.redraw();
    },
    chartData() {
      this.updateChartWithCalculatedData();
    },
    chartType(val) {
      if (this.chart) {
        this.chart.chartType = val;
      }
    },
    isGeneratingPdf(val) {
      this.chart.isGeneratingPdf = val;
      this.chart.updateBottomAxis();
    },
    trendlineData(val) {
      if (this.chart) {
        this.chart.trendlineData = val;
        this.chart.updateTrendline();
      }
    },
  },
  mounted() {
    this.redraw();
    this.setInitialScrollPosition();
  },
  unmounted() {
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
  },
  methods: {
    ...mapActions(useReportsConfigStore, ['initMapperCalculation']),
    updateChartWithCalculatedData() {
      if (this.chart !== null) {
        const yAxisConfig = getYAxisConfig({
          type: this.configType,
          yAxis: this.yAxis,
        });
        Object.assign(this.chart, yAxisConfig);

        if (this.yAxisRight) {
          const yAxisRightConfig = getYAxisConfig({
            type: this.configType,
            yAxis: this.yAxisRight,
            keySuffix: 'Right',
          });
          Object.assign(this.chart, yAxisRightConfig);
        }
        // things that will be modified/configured regarding the chart AFTER mapping/grouping/sorting
        this.chart.calculatedData = this.chartData;
        this.chart.totals = this.totals;
        this.chart.configType = this.configType;
        this.chart.curveType = this.chartCurve;
        this.chart.yAxisKey = this.yAxis;
        this.chart.yAxisKeyRight = this.yAxisRight;
        this.chart.dateRange = this.orderedDateRange;
        this.chart.firstDayOfWeek = this.firstDayOfWeek;
        this.chart.chartLegendState = this.chartLegendState;
        this.chart.totals = this.totals;
        this.chart.groupBy = this.groupBy;
        if (this.scrollPct) {
        // maintain chart scroll position even when redrawn (by resize for example)
          this.chart.scrollLeftPct = this.scrollPct;
        }
        this.chart.update();
      }
    },
    setInitialScrollPosition() {
      const scrollToEnd = this.orderDir[0] === 'asc';
      this.scrollPct = scrollToEnd ? 100 : 0;
      if (this.chart) this.chart.scrollLeftPct = this.scrollPct;
    },
    redraw() {
      if (redrawTimeout) {
        clearTimeout(redrawTimeout);
        redrawTimeout = null;
      }
      redrawTimeout = setTimeout(() => {
        this.createNewChart();
        this.reMapAndCalculateRawData();
      }, 200);
    },
    createNewChart() {
      this.chart = new ReportsChart({
        element: this.$refs['chart-wrapper'],
        translations: getChartTranslations(),
        granularity: this.granularity,
        isDark: false,
        chartType: this.chartType,
        yAxisKey: this.yAxis,
        yAxisKeyRight: this.yAxisRight,
        dateRange: this.orderedDateRange,
        firstDayOfWeek: this.firstDayOfWeek,
        chartLegendState: this.chartLegendState,
        disableTrendline: this.disableTrendline,
        trendlineData: this.trendlineData,
        totals: this.totals,
      });
      this.chart.onHoverHighlightClick = (ev) => this.$emit('drilldown', ev);
      this.chart.onScrollLeftChange = (scrollPct) => {
        this.scrollPct = scrollPct;
      };
    },
    reMapAndCalculateRawData() {
      if (this.chart) {
        this.initMapperCalculation({
          translationsObj: getChartTranslations(),
          isCompactFormatted: this.$vuetify.display.mdAndDown,
        });
      }
    },
  },
};
</script>
<style lang="scss" scoped>
#reports-chart {
  position: absolute;
  display: block;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}
.chart-wrapper {
  position: relative;
  height: 100%;
  width: 100%;
}

</style>
