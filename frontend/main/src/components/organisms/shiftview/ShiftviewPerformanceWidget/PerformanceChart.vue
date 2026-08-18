<template>
  <div class="fill-height">
    <div
      :id="instanceId"
      ref="chart-wrapper"
      class="fill-height"
    />
  </div>
</template>

<script>
import { mdiCircleMedium } from '@mdi/js';
import { mapState } from 'pinia';

import PerformanceChart from './PerformanceChart';
import { highIsGoodTypes } from './processChartData';

import { formatNumber } from '@/helpers/numbers/formatNumber';
import vIconRawTemplate from '@/helpers/html/vIconRawTemplate';
import sliceType from '@/constants/sliceType';
import performanceWidgetType from '@/constants/performanceWidgetType';
import getUnitIdFormatted from '@/helpers/getUnitIdFormatted';
import { useDeviceStore } from '@/stores';

const SEC_UNIT_WIDGET_TYPES = new Set([performanceWidgetType.SECOND_PER_SIGNAL, performanceWidgetType.SECOND_PER_UNIT]);
const MOBILE_TRANSITION_DURATION = 50;
const TRANSITION_DURATION = 800;

export default {
  name: 'PerformanceChart',
  props: {
    data: { type: Array, default: () => [] },
    screenWidth: { type: Number, default: 0 },
    xDomainMinStart: { type: String, default: null },
    xDomainMinFinish: { type: Date, default: null },
    timezone: { type: String, default: null },
    chartMode: { type: String, default: performanceWidgetType.UNIT_PER_MINUTE },
  },
  emits: ['chart-ready', 'chart-zoom'],
  data() {
    return {
      instanceId: `performance-${this.$.uid}`,
      resizeTimeout: null,
      mountedTimeout: null,
      chart: null,
    };
  },
  computed: {
    ...mapState(useDeviceStore, ['isMobileView']),
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
    // add a timeout so that chart would use full height
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
      this.chart = new PerformanceChart({
        data: this.data,
        element: this.$refs['chart-wrapper'],
        isDark: true,
        translations: this.translations,
        xDomainMinStart: this.xDomainMinStart,
        xDomainMinFinish: this.xDomainMinFinish,
        fontSize: this.$vuetify.display.md ? 10 : 12,
        id: this.instanceId,
        yAxisFormat: formatNumber,
        timezone: this.timezone,
        yDomainInverted: false,
        favorHigherValues: highIsGoodTypes.has(this.chartMode),
        cornerLabel: SEC_UNIT_WIDGET_TYPES.has(this.chartMode) ? this.$t('Sec') : null,
        transitionDuration: this.isMobileView ? MOBILE_TRANSITION_DURATION : TRANSITION_DURATION,
        onZoom: (zoomLevel) => this.$emit('chart-zoom', zoomLevel),
      });
      this.chart.tooltipHTMLFunc = this.getTooltip;
      this.$emit('chart-ready', this.chart);
    },
    updateChartData() {
      if (this.chart && this.chart.data) {
        this.chart.data = this.data;
        this.chart.favorHigherValues = highIsGoodTypes.has(this.chartMode);
        this.chart.cornerLabel = SEC_UNIT_WIDGET_TYPES.has(this.chartMode) ? this.$t('Sec') : null;
        this.chart.update({ isDataUpdate: true });
      }
    },
    getUnitLabel(d) {
      if (this.chartMode === performanceWidgetType.SECOND_PER_SIGNAL) {
        return this.$t('sec/signal');
      }
      return getUnitIdFormatted(this.chartMode, d[0].unitId);
    },

    formatTooltipValue(d) {
      const value = d[0].type === sliceType.PRODUCT ? d[0].value : 0;
      return `${formatNumber(value)} ${this.getUnitLabel(d)}`;
    },

    formatTooltipTarget(d) {
      return `${formatNumber(d[0].target)} ${this.getUnitLabel(d)}`;
    },

    getTooltip() {
      return (d) => this.getTooltipTemplate(d, this.formatTooltipValue, this.formatTooltipTarget);
    },
    getTooltipTemplate(d, formatValueFn, formatTargetFn) {
      if (d?.[0]?.measure) {
        const dotIcon = vIconRawTemplate(mdiCircleMedium, 24, d[0].dotColor);
        const dotLabel = `<span class="text-label-small">${d[0].measureLabel}</span>`;
        const dotRow = `<div class="d-flex align-center ml-n2">${dotIcon}${dotLabel}</div>`;
        const valueRow = `<div class="text-body-medium font-weight-medium">${formatValueFn(d)}</div>`;
        const targetRow = `
        <div class="text-label-small font-weight-regular d-flex">
          <span class="text-tertiary-dark font-weight-medium">${this.$t('Target')}:</span>
          <span class="text-body-small font-weight-medium text-none">${formatTargetFn(d)}</span>
        </div>`;
        const productRow = `
        <div class="text-label-small font-weight-regular d-flex">
          <span class="text-tertiary-dark font-weight-medium">${this.$t('Product')}:</span>
          <span class="text-body-small font-weight-medium text-none">${d[0].productName}</span>
        </div>`;
        const template = `
        <div class="row align-center">
          <v-col>
            ${dotRow}
            ${valueRow}
            ${targetRow}
            ${productRow}
          </v-col>
        </div>`;
        return template;
      }
      return '';
    },
  },
};
</script>
