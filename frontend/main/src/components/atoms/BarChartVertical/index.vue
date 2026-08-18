<template>
  <div :ref="`bar-chart${i}`" class="bar-chart-vertical fill-height full-width" />
</template>

<script>
import BarChartVertical from './BarChartVertical';

import colorConstants from '@/constants/colorConstants';

export default {
  name: 'BarChartVertical',
  props: {
    i: {
      type: [String, Number],
      required: true,
    },
    chartData: {
      type: Array,
      default: () => [],
    },
    targetLineEnabled: {
      type: Boolean,
    },
    targetLineDataObj: {
      type: Object,
      default: () => {},
    },
    updateTrigger: {
      type: Number,
      default: 0,
    },
    dataType: {
      type: String,
      default: 'abs',
    },
    xAxisLabel: {
      type: String,
      default: '',
    },
    trendLineEnabled: {
      type: Boolean,
    },
    trendLineDataObj: {
      type: Object,
      default: () => ({ y1: 0, y2: 0, value: 'trendLineText' }),
    },
    comparisonBarsEnabled: {
      type: Boolean,
    },
    comparisonBarsData: {
      type: Array,
      default: () => [],
    },
    areaHighlightsEnabled: {
      type: Boolean,
    },
    tooltipHTMLFunc: {
      type: Function,
      default: () => {},
    },
    yAxisOptions: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      barChartVertical: null,
    };
  },
  computed: {
    isDark() {
      return this.$vuetify.theme.name === 'dark';
    },
  },
  watch: {
    isDark() {
      this.drawGraph();
    },
    chartData() {
      this.drawGraph();
    },
    updateTrigger() {
      this.drawGraph();
    },
    trendLineEnabled() {
      this.drawGraph();
    },
  },
  unmounted() {
    if (this.barChartVertical) {
      this.barChartVertical.destroy();
      this.barChartVertical = null;
    }
  },
  mounted() {
    this.drawGraph();
  },
  methods: {
    drawGraph() {
      this.barChartVertical = new BarChartVertical({
        data: this.chartData,
        element: this.$refs[`bar-chart${this.i}`],
        dataType: this.dataType,
        xAxisLabel: this.xAxisLabel,
        isDark: this.isDark,
        targetLineEnabled: this.targetLineEnabled,
        targetLineDataObj: this.targetLineDataObj,
        trendLineEnabled: this.trendLineEnabled,
        trendLineDataObj: this.trendLineDataObj,
        comparisonBarsEnabled: this.comparisonBarsEnabled,
        comparisonBarsData: this.comparisonBarsData,
        areaHighlightsEnabled: this.areaHighlightsEnabled,
        tooltipHTMLFunc: this.tooltipHTMLFunc,
        yAxisOptions: this.yAxisOptions,
        gradientColor: colorConstants[this.isDark ? 'dark' : 'light']['lw-background'],
      });
    },
  },
};
</script>
