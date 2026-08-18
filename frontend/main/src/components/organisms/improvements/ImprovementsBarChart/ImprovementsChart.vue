<template>
  <div
    id="improvements-chart"
    ref="chart-wrapper"
    class="chart-wrapper"
  />
</template>
<script>
import ImprovementsBarChart from './ImprovementsBarChart';

export default {
  name: 'ImprovementsChart',
  props: {
    data: { type: Array, default: () => [] },
    project: { type: Object, default: () => {} },
    stats: { type: Object, default: () => {} },
    screenWidth: { type: Number, default: 0 },
    targetVal: { type: Number, default: 0 },
    baselineAverage: { type: Number, default: 0 },
    chartYKey: { type: String, default: 'duration' },
    chartColors: { type: Object, default: () => {} },
    isPerStopChart: { type: Boolean },
    isProjectDataMeasuredByTime: { type: Boolean },
    chartMaxVal: { type: Number, default: 0 },
    tickInterval: { type: Number, default: 0 },
    allDates: { type: Array, default: () => [] },
    completedActions: { type: Array, default: () => [] },
    solutions: { type: Array, default: () => [] },
    barTooltipHTMLFunc: { type: Function, default: () => {} },
    averageTooltipHTMLFunc: { type: Function, default: () => {} },
    measureTooltipHTMLFunc: { type: Function, default: () => {} },
  },
  watch: {
    screenWidth(newVal) {
      if (newVal) {
        setTimeout(() => {
          this.createNewChart();
        }, 200);
      }
    },
    completedActions(newVal) {
      if (newVal) {
        setTimeout(() => {
          this.createNewChart();
        }, 200);
      }
    },
    solutions(newVal) {
      if (newVal) {
        setTimeout(() => {
          this.createNewChart();
        }, 200);
      }
    },
  },
  mounted() {
    this.createNewChart();
  },
  methods: {
    createNewChart() {
      this.chart = new ImprovementsBarChart({
        data: this.data,
        project: this.project,
        stats: this.stats,
        allDates: this.allDates,
        targetVal: this.targetVal,
        baselineAverage: this.baselineAverage,
        completedActions: this.completedActions,
        solutions: this.solutions,
        chartColors: this.chartColors,
        isPerStopChart: this.isPerStopChart,
        isProjectDataMeasuredByTime: this.isProjectDataMeasuredByTime,
        chartYKey: this.chartYKey,
        chartMaxVal: this.chartMaxVal,
        tickInterval: this.tickInterval,
        element: this.$refs['chart-wrapper'],
        barTooltipHTMLFunc: this.barTooltipHTMLFunc,
        averageTooltipHTMLFunc: this.averageTooltipHTMLFunc,
        measureTooltipHTMLFunc: this.measureTooltipHTMLFunc,
      });
    },
  },
};
</script>
<style lang="less">
.chart-wrapper {
  width: 100%;
}

#improvements-chart {
  #custom-styled-scrollbar {
    &::-webkit-scrollbar {
      height: 6px;
    }
    &::-webkit-scrollbar-track {
      background: rgba(0, 0, 0, 0.12);
    }
    &::-webkit-scrollbar-thumb {
      background: rgb(var(--v-theme-tertiary-dark));
      border-radius: 4px;
    }
  }
}
</style>
