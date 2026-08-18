<template>
  <div class="fill-height d-flex">
    <div class="performance-chart">
      <performance-chart
        v-if="processedChartData.length && !isLoading"
        :key="shiftId"
        :data="processedChartData"
        :screen-width="screenWidth"
        :x-domain-min-start="domainMinStart"
        :timezone="lineviewStation.zoneId"
        :chart-mode="widgetSubType"
        @chart-ready="chartInstance = $event"
        @chart-zoom="onChartZoom"
      />
    </div>
    <div>
      <evocon-zooming-slider
        :zoom-value="zoomSliderValue"
        @update:zoom-value="zoomSliderValue = $event"
      />
    </div>
  </div>
</template>

<script>
import { mapState } from 'pinia';
import { select } from 'd3';
import { toRaw } from 'vue';

import PerformanceChart from '@/components/organisms/shiftview/ShiftviewPerformanceWidget/PerformanceChart.vue';
import EvoconZoomingSlider from '@/components/molecules/EvoconZoomingSlider/index.vue';
import colorConstants from '@/constants/colorConstants';
import performanceWidgetType from '@/constants/performanceWidgetType';
import {
  useShiftStore,
  useShiftviewTimelineStore,
  useDeviceStore,
  useStationStore,
  useProfileStore,
  useUserPreferencesStore,
} from '@/stores';

export default {
  name: 'PerformanceGraphWidget',
  components: {
    PerformanceChart,
    EvoconZoomingSlider,
  },
  props: {
    widgetSubType: {
      type: String,
      default: performanceWidgetType.UNIT_PER_MINUTE,
    },
  },
  data() {
    return {
      processedChartData: [],
      zoomSliderValue: 0,
      chartInstance: null,
    };
  },
  computed: {
    ...mapState(useShiftStore, ['shift']),
    ...mapState(useShiftviewTimelineStore, ['timeline', 'currentBatch', 'batches']),
    ...mapState(useDeviceStore, ['screenWidth']),
    ...mapState(useStationStore, ['lineviewStation']),
    ...mapState(useProfileStore, ['timeFormat']),
    ...mapState(useUserPreferencesStore, ['viewSettings', 'isLoading']),
    colors() {
      return colorConstants[this.$vuetify.theme.name];
    },
    shiftId() {
      return this.shift.id;
    },
    domainMinStart() {
      return this.shift.startTimeISO;
    },
  },
  watch: {
    timeline() {
      this.processChartData();
    },
    viewSettings() {
      this.processChartData();
    },
    zoomSliderValue(newVal) {
      if (this.chartInstance && this.chartInstance.zoomModule) {
        const scale = this.chartInstance.zoomModule.sliderToScale(newVal);
        this.chartInstance.zoomModule.zoom.scaleTo(select(this.chartInstance.zoomModule.currentZoom.node()), scale);
      }
    },
  },
  mounted() {
    this.processChartData();
  },
  methods: {
    processChartData() {
      const payload = {
        timeline: toRaw(this.timeline),
        useConversion: !this.viewSettings.usePrimaryUnit,
        timeFormattingOptions: this.timeFormat,
        batches: toRaw(this.batches),
        currentBatch: toRaw(this.currentBatch),
        colors: this.colors,
        perfWidgetType: this.widgetSubType, // config
        zoneId: this.lineviewStation.zoneId,
      };
      window.WorkerService.process('processPerformanceChartData', payload).then((processedChartData) => {
        this.processedChartData = processedChartData;
      });
    },
    onChartZoom(newScale) {
      if (this.chartInstance && this.chartInstance.zoomModule) {
        this.zoomSliderValue = this.chartInstance.zoomModule.scaleToSlider(newScale);
      }
    },
  },
};
</script>
<style scoped lang="scss">
.performance-chart {
  flex: 1 1 0;
}
</style>
