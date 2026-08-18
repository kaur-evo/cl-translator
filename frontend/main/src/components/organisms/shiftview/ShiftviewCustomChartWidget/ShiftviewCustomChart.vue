<template>
  <div
    :id="instanceId"
    ref="chart-wrapper"
    class="fill-height full-width"
  />
</template>

<script>
import ShiftviewCustomChart from './ShiftviewCustomChart';

export default {
  name: 'ShiftviewCustomChart',
  props: {
    data: { type: Array, default: () => [] },
    screenWidth: { type: Number, default: 0 },
    widgetConf: { type: Object, default: () => {} },
    timezone: { type: String, required: true },
  },
  data() {
    return {
      instanceId: `custom-widget-${this.$.uid}`,
      resizeTimeout: null,
      mountedTimeout: null,
      chart: null,
    };
  },
  watch: {
    data() {
      this.updateChartData();
    },
    screenWidth(newVal) {
      if (newVal) {
        clearTimeout(this.resizeTimeout);
        this.resizeTimeout = setTimeout(() => {
          this.createNewchart();
        }, 200);
      }
    },
  },
  mounted() {
    // add a timeout so that chart would use full heigth
    this.mountedTimeout = setTimeout(() => {
      this.createNewchart();
      this.updateChartData();
    }, 200);
  },
  beforeUnmount() {
    clearTimeout(this.resizeTimeout);
    clearTimeout(this.mountedTimeout);
  },
  methods: {
    createNewchart() {
      this.chart = new ShiftviewCustomChart({
        data: this.data,
        element: this.$refs['chart-wrapper'],
        isDark: true,
        widgetConfig: this.widgetConf,
        fontSize: this.$vuetify.display.md ? 10 : 12,
        timezone: this.timezone,
      });
    },
    updateChartData() {
      if (this.chart && this.chart.data) {
        this.chart.data = this.data;
        this.chart.update();
      }
    },
  },
};
</script>
