<template>
  <v-row
    v-if="measuresData.length"
    class="fill-height pa-2"
  >
    <v-col
      v-for="(measure, i) in measuresData"
      :key="`measure-${i}`"
      :cols="large ? 12 : 12/measuresData.length"
      class="overflow-hidden"
      :class="{
        'border-right': i < measuresData.length - 1 && !large,
        'border-bottom': i < measuresData.length - 1 && large
      }"
    >
      <div class="fill-height d-flex flex-column justify-center align-center">
        <span class="shift-view-label text-truncate max-width-100" :class="{ 'large-label': large }">
          {{ $t(measure.currentName) }} ({{ measure.measureUnit }})
        </span>
        <div :class="valueClass" class="max-width-100 text-truncate">
          <template v-if="showCalculatedValues(measure.currentName)">
            {{ formatNumber(measureValueSums[measure.currentName].sum, { decimalPlaces }) }}
          </template>
          <template v-else>
            {{ formatNumber(measure.currentValue, { decimalPlaces }) }}
          </template>
        </div>
        <div class="shift-view-label text-truncate max-width-100" :class="{ 'large-label': large }">
          <template v-if="showCalculatedValues(measure.currentName)">
            {{ `${$t('Average')}: ${formatNumber(measureValueSums[measure.currentName].sum / measureValueSums[measure.currentName].count, { decimalPlaces })}` }}
          </template>
          <template v-else>
            <span>{{ $t('Previous') }}: </span>
            <span v-if="measure.prevValue">
              {{ formatNumber(measure.prevValue, { decimalPlaces }) }}
            </span>
            <span v-else> - </span>
          </template>
        </div>
      </div>
    </v-col>
  </v-row>
  <small-placeholder-text
    v-else
    :primary-text="$t('No data available')"
    :secondary-text="$t('Please check back later or edit settings')"
  />
</template>
<script>
import { DateTime } from 'luxon';
import { mapState } from 'pinia';

import widgetsApi from '@/api/widgetsApi';
import { isSameOrBefore } from '@/helpers/date/dateComparison';
import SmallPlaceholderText from '@/components/atoms/SmallPlaceholderText/index.vue';
import CustomInterval from '@/helpers/interval/CustomInterval';
import { formatNumber } from '@/helpers/numbers/formatNumber';
import {
  useDeviceStore,
  useStationStore,
  useShiftviewTimelineStore,
  useShiftStore,
} from '@/stores';

export default {
  name: 'MeasuresWidget',
  components: {
    SmallPlaceholderText,
  },
  props: {
    config: {
      type: Object,
      required: true,
    },
    large: {
      type: Boolean,
    },
    valueClass: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      measuresResponse: [],
      measuresData: [],
      intervalRef: null,
    };
  },
  computed: {
    ...mapState(useDeviceStore, ['isBrowserTabActive']),
    ...mapState(useStationStore, ['lineviewStation']),
    ...mapState(useShiftviewTimelineStore, ['currentBatch']),
    ...mapState(useShiftStore, ['shift']),
    measureValueSums() {
      return this.measuresResponse.reduce((sums, measure) => {
        const sumsCopy = { ...sums };
        if (!(measure.measureName in sums)) {
          sumsCopy[measure.measureName] = { sum: 0, count: 0 };
        }
        sumsCopy[measure.measureName].sum += Number(measure.measureValue);
        sumsCopy[measure.measureName].count += 1;
        return sumsCopy;
      }, {});
    },
    updateInterval() {
      const defaultMs = 120000;
      return this.widgetConfig.updateInterval ?? defaultMs;
    },
    decimalPlaces() {
      return this.widgetConfig.decimalPlaces ?? 2;
    },
    widgetConfig() {
      return this.config;
    },
  },
  watch: {
    shift(newVal) {
      if (newVal) {
        this.setMeasuresData();
        this.setIntervalTicker();
      }
    },
    updateInterval() {
      this.setIntervalTicker();
    },
    isBrowserTabActive(val, prevVal) {
      if (val && val !== prevVal) this.setIntervalTicker();
      else this.clearInterval();
    },
    config() {
      this.setMeasuresData();
      this.setIntervalTicker();
    },
  },
  mounted() {
    this.setMeasuresData();
    this.setIntervalTicker();
  },
  beforeUnmount() {
    this.clearInterval();
  },
  methods: {
    formatNumber,
    setIntervalTicker() {
      this.clearInterval();
      this.intervalRef = new CustomInterval(this.setMeasuresData, this.updateInterval).set();
    },
    clearInterval() {
      if (this.intervalRef) {
        this.intervalRef = this.intervalRef.clear();
      }
    },
    showCalculatedValues(measureName) {
      return this.widgetConfig.measures && this.widgetConfig.measures.calculate && !!this.widgetConfig.measures.calculate[measureName];
    },
    async setMeasuresData() {
      const now = this.getCurrentTime();
      const endTime = isSameOrBefore(now, this.shift.endTime) ? now : this.shift.endTime;
      const { measureName } = this.widgetConfig.measures;
      const includeNoDataDatapoints = !this.widgetConfig.singleValue;
      const response = await widgetsApi.getMeasures(this.lineviewStation.id, measureName, this.currentBatch.productionOrder, endTime, this.shift.startTime, includeNoDataDatapoints) ?? [];
      this.measuresResponse = response.reverse();
      if (this.measuresResponse && this.measuresResponse.length) {
        this.measuresData = this.modifyMeasures(this.measuresResponse);
      } else {
        this.measuresResponse = [];
        this.measuresData = [];
      }
    },
    getCurrentTime() {
      return DateTime.local().setZone(this.lineviewStation.zoneId).toFormat("yyyy-MM-dd'T'HH:mm:ss");
    },
    modifyMeasures(measuresArray) {
      const result = {};
      measuresArray.forEach((measure) => {
        if (!result[measure.measureName]) {
          result[measure.measureName] = {
            currentName: measure.measureName,
            currentValue: measure.measureValue,
            measureUnit: measure.measureUnit,
            prevValue: null,
          };
        } else if (!result[measure.measureName].prevValue) {
          result[measure.measureName].prevValue = measure.measureValue;
        }
      });
      return Object.values(result);
    },
  },
};
</script>

<style scoped>
.border-right {
  border-right: 1px solid rgb(var(--v-theme-tertiary-text));
}
.border-bottom {
  border-bottom: 1px solid rgb(var(--v-theme-tertiary-text));
}
</style>
