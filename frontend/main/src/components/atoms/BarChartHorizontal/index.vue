<template>
  <div :ref="`bar-chart-horizontal${i}`" class="bar-chart-horizontal fill-height full-width" />
</template>

<script>
import BarChartHorizontal from './BarChartHorizontal';

export default {
  name: 'HBarChart',
  props: {
    i: {
      type: [String, Number],
      required: true,
    },
    chartData: {
      type: Array,
      default: () => [],
    },
    comparisonArrowsEnabled: {
      type: Boolean,
    },
    comparisonArrowsData: {
      type: Array,
      default: () => [],
    },
    updateTrigger: {
      type: Number,
      default: 0,
    },
    tooltipHTMLFunc: {
      type: Function,
      required: true,
    },
    isStacked: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      barChartHorizontal: null,
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
    updateTrigger() {
      this.drawGraph();
    },
    chartData() {
      this.drawGraph();
    },
  },
  mounted() {
    this.drawGraph();
  },
  unmounted() {
    if (this.barChartHorizontal) {
      this.barChartHorizontal.destroy();
      this.barChartHorizontal = null;
    }
  },
  methods: {
    drawGraph() {
      this.barChartHorizontal = new BarChartHorizontal({
        data: this.chartData,
        element: this.$refs[`bar-chart-horizontal${this.i}`],
        isDark: this.isDark,
        comparisonArrowsEnabled: this.comparisonArrowsEnabled,
        comparisonArrowsData: this.comparisonArrowsData,
        tooltipHTMLFunc: this.tooltipHTMLFunc,
        isStacked: this.isStacked,
      });
    },
  },
};
</script>
