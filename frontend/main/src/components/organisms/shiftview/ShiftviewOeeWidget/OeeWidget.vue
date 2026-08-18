<template>
  <div
    :id="instanceId"
    ref="chart-wrapper"
    class="fill-height"
  />
</template>

<script>
import OeeChart from './OeeChart';

export default {
  name: 'OeeWidget',
  props: {
    data: { type: Array, default: () => [] },
    screenWidth: { type: Number, default: 0 },
    xDomain: { type: Array, default: () => [] },
    timezone: { type: String, default: 'UTC' },
  },
  data() {
    return {
      instanceId: `oee-widget-${this.$.uid}`,
      resizeTimeout: null,
      mountedTimeout: null,
      chart: null,
    };
  },
  computed: {
    translations() {
      return {
        OEE: this.$t('OEE'),
        Availability: this.$t('availability'),
        Quality: this.$t('quality'),
        Performance: this.$t('performance'),
      };
    },
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
  unmounted() {
    clearTimeout(this.resizeTimeout);
    clearTimeout(this.mountedTimeout);
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
  },
  methods: {
    createNewchart() {
      if (this.data.length === 0) return;
      this.chart = new OeeChart({
        data: this.data,
        element: this.$refs['chart-wrapper'],
        isDark: true,
        translations: this.translations,
        dataType: 'pct',
        xDomainOpt: this.xDomain,
        fontSize: this.$vuetify.display.md ? 10 : 12,
        timezone: this.timezone,
      });
    },
    updateChartData() {
      if (this.chart && this.chart.data) {
        this.chart.data = this.data;
        this.chart.update();
      } else {
        this.createNewchart();
      }
    },
  },
};
</script>
