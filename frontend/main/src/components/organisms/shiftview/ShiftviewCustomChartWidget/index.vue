<template>
  <shiftview-custom-chart
    v-if="!loading && metricsData.length"
    class="pt-4"
    :data="metricsData"
    :screen-width="screenWidth"
    :widget-conf="widgetConf"
    :timezone="lineviewStation.zoneId"
  />
  <small-placeholder-text
    v-else-if="!loading && !metricsData.length"
    :primary-text="$t('No data available')"
    :secondary-text="$t('Please check back later or edit settings')"
  />
</template>
<script>
import { mapState } from 'pinia';
import { DateTime } from 'luxon';

import ShiftviewCustomChart from './ShiftviewCustomChart.vue';

import widgetsApi from '@/api/widgetsApi';
import SmallPlaceholderText from '@/components/atoms/SmallPlaceholderText/index.vue';
import CustomInterval from '@/helpers/interval/CustomInterval';
import { formatNumber } from '@/helpers/numbers/formatNumber';
import {
  useDeviceStore,
  useStationStore,
  useShiftStore,
  useProfileStore,
} from '@/stores';

export default {
  name: 'ProductSpeedWidgetBase',
  components: {
    ShiftviewCustomChart,
    SmallPlaceholderText,
  },
  props: {
    config: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      loading: true,
      metricsData: [],
      intervalRef: null,
    };
  },
  computed: {
    ...mapState(useDeviceStore, ['screenWidth', 'isBrowserTabActive']),
    ...mapState(useStationStore, ['lineviewStation']),
    ...mapState(useShiftStore, ['shift']),
    ...mapState(useProfileStore, ['timeFormat']),
    widgetConf() {
      return this.config;
    },
    dataPoints() {
      return this.widgetConf.dataPoints;
    },
    updateInterval() {
      return this.widgetConf.updateInterval;
    },
    shiftId() {
      return this.shift.id;
    },
    includeNoDataDatapoints() {
      return !this.widgetConf.excludeNoDataDatapoints;
    },
  },
  watch: {
    shiftId() {
      this.initialFetchMetricsData();
      this.setIntervalTicker();
    },
    updateInterval() {
      this.setIntervalTicker();
    },
    isBrowserTabActive(val, prevVal) {
      if (val && val !== prevVal) this.setIntervalTicker();
      else this.clearInterval();
    },
    widgetConf() {
      this.initialFetchMetricsData();
    },
  },
  mounted() {
    this.initialFetchMetricsData();
    this.setIntervalTicker();
  },
  beforeUnmount() {
    this.clearInterval();
  },
  methods: {
    setIntervalTicker() {
      this.clearInterval();
      this.intervalRef = new CustomInterval(this.fetchMetricsData, this.updateInterval).set();
    },
    clearInterval() {
      if (this.intervalRef) {
        this.intervalRef = this.intervalRef.clear();
      }
    },
    async initialFetchMetricsData() {
      this.loading = true;
      await this.fetchMetricsData();
      this.loading = false;
    },
    async fetchMetricsData() {
      const metricsResponse = await widgetsApi.getMetrics(
        this.lineviewStation.id,
        this.dataPoints,
        this.shift.endTime,
        this.shift.startTime,
        this.includeNoDataDatapoints,
      );
      this.metricsData = this.mapResult(metricsResponse);
    },
    mapResult(response) {
      const map = response.reduce((timeMap, elem) => {
        const dateTime = DateTime.fromISO(elem.eventTimeISO, { zone: this.lineviewStation.zoneId });
        const remap = timeMap.get(elem.eventTimeISO) || {
          measure: dateTime.toJSDate(),
          measureLabel: dateTime.toFormat(this.timeFormat.luxonLong),
          time: elem.eventTimeISO,
        };
        this.dataPoints.forEach((measureName) => {
          if (measureName === elem.measureName) {
            remap[measureName] = Number(elem.measureValue);
            remap[`${measureName}Label`] = `${formatNumber(Number(elem.measureValue))}${elem.measureUnit}`;
          } else if (!remap[measureName]) {
            remap[measureName] = 0;
            remap[`${measureName}Label`] = 0;
          }
        });
        timeMap.set(elem.eventTimeISO, { ...remap });
        return timeMap;
      }, new Map());
      return Array.from(map.values());
    },
  },
};
</script>
