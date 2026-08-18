<template>
  <v-row class="timeline-row-chart height-56">
    <v-progress-linear
      v-show="isLoading"
      class="mt-1"
      indeterminate
    />
    <v-col
      v-show="!isLoading"
      :ref="`timeline-row-chart${stationId}`"
      class="fill-height"
    />
  </v-row>
</template>

<script>
import { mapState, mapActions } from 'pinia';
import isEmpty from 'lodash/isEmpty';
import { nextTick } from 'vue';

import TimelineRow from './TimelineRow';

import useFactoryOverviewConfigStore from '@/stores/factoryOverviewConfig';

export default {
  name: 'TimelineRowChart',
  props: {
    xScale: {
      type: Function,
      required: true,
    },
    zoneId: {
      type: String,
      required: true,
    },
    stationId: {
      type: Number,
      required: true,
    },
    tooltipHTMLFunc: {
      type: Function,
      required: true,
    },
  },
  data() {
    return {
      chart: null,
    };
  },
  computed: {
    ...mapState(useFactoryOverviewConfigStore, ['rollingTimelines', 'loading', 'loadingStations', 'timelinesIntervalEndTime', 'timelinesInterval']),
    isLoading() {
      return this.loading.length > 0 || this.loadingStations[this.stationId];
    },
  },
  watch: {
    async xScale() {
      await nextTick();
      this.drawGraph();
    },
    timelinesIntervalEndTime(prevVal, newVal) {
      if (prevVal === newVal) return;
      this.fetchTimeline();
    },
    timelinesInterval(newVal, oldVal) {
      if (newVal === oldVal) return;
      this.fetchTimeline();
    },
  },
  mounted() {
    this.fetchTimeline();
  },
  unmounted() {
    if (this.chart) this.chart.onSliceHoverEnd();
    // close socket connection
    this.chart = null;
    this.cancelStationRequest(this.stationId);
    if (!isEmpty(this.rollingTimelines)) {
      this.unsubscribeFromFactoryViewRollingTimeline(this.stationId);
    }
  },
  methods: {
    ...mapActions(useFactoryOverviewConfigStore, [
      'fetchFactoryViewRollingStationTimeline',
      'subscribeToFactoryViewRollingTimeline',
      'unsubscribeFromFactoryViewRollingTimeline',
      'cancelStationRequest',
    ]),
    drawGraph() {
      const chart = this.$refs[`timeline-row-chart${this.stationId}`];
      if (!chart) return;
      this.chart = new TimelineRow({
        data: this.rollingTimelines[this.stationId] || { timeline: [], changeovers: [] },
        element: chart.$el,
        xScale: this.xScale,
        zoneId: this.zoneId,
        stationId: this.stationId,
        tooltipHTMLFunc: this.tooltipHTMLFunc,
      });
    },
    fetchTimeline() {
      this.fetchFactoryViewRollingStationTimeline({ stationId: this.stationId });
      if (this.timelinesIntervalEndTime) this.unsubscribeFromFactoryViewRollingTimeline(this.stationId);
      else this.subscribeToFactoryViewRollingTimeline(this.stationId);
    },
  },
};
</script>

<style lang="less" scoped>
.height-56 {
  height: 56px;
}
</style>
