<template>
  <component
    :is="currentTemplate"
    :id="id"
    v-model:items="orderedStationsCopy"
    @drag-end="setNewOrder"
  >
    <template #group-name>
      <div
        class="d-flex fill-height flex-nowrap text-body-large align-center"
        :class="isHandheldDevice ? 'px-2' : 'px-4'"
      >
        <v-icon
          v-if="$vuetify.display.mdAndUp"
          :color="isDragDisabled ? 'transparent' : 'white'"
          class="ml-n2 mr-2 handle"
          :class="isDragDisabled ? '' : 'grabbable'"
        >
          {{ mdiDragVertical }}
        </v-icon>
        <evocon-v-tooltip-wrap
          location="right"
          :text="groupName"
        >
          <template #activator="{ props }">
            <span class="text-truncate" v-bind="props">{{ groupName }}</span>
          </template>
        </evocon-v-tooltip-wrap>
      </div>
    </template>
    <template #axis>
      <div ref="axis-container" class="d-flex pa-0 fill-height">
        <timeline-axis :id="id" :x-scale="xScale" :time-zones="timezoneOffsets" />
      </div>
    </template>
    <template #measureName>
      <div class="d-flex fill-height px-4 align-center justify-end">
        <evocon-v-tooltip-wrap
          position="left"
          :text="measureName"
        >
          <template #activator="{ props }">
            <v-icon v-bind="props">
              {{ mdiBullseye }}
            </v-icon>
          </template>
        </evocon-v-tooltip-wrap>
      </div>
    </template>
    <template #station-name="{ item, dragDisabled }">
      <div
        v-if="item"
        class="d-flex align-center fill-height flex-nowrap pr-2"
      >
        <v-icon
          v-if="!isHandheldDevice"
          color="white"
          class="mx-2 handle"
          :class="dragDisabled ? 'text-disabled' : 'grabbable'"
        >
          {{ mdiDragVertical }}
        </v-icon>
        <v-tooltip
          location="right"
          :text="`${item.name} ${$t('Shift view')}`"
        >
          <template #activator="{ props }">
            <span
              class="font-weight-regular text-truncate cursor-pointer dark text-body-medium hover-underline-animation"
              v-bind="props"
              @click="goToShiftview(item)"
            >
              {{ item.name }}
            </span>
          </template>
        </v-tooltip>
      </div>
    </template>
    <template #timeline-chart="{ item }">
      <timeline-row-chart
        v-if="item"
        :x-scale="xScale"
        :zone-id="item.zoneId"
        :station-id="item.id"
        :tooltip-h-t-m-l-func="tooltipHTMLFunc"
      />
    </template>
    <template #stats="{ item }">
      <div
        v-if="item?.id !== undefined && elementData[item.id] && elementData[item.id] !== 'error'"
        class="d-flex fill-height align-center justify-end flex-wrap text-body-medium"
      >
        <span class="white-space-nowrap">
          {{ getStatValue(item) }}
        </span>
        <span v-if="['Good quantity', 'Good quantity alternative'].includes(measure)" class="ml-1">
          {{ getUnitLabel(item) }}
        </span>
      </div>
    </template>
  </component>
</template>

<script>
import * as d3 from 'd3';
import { mdiDragVertical, mdiBullseye } from '@mdi/js';
import { mapState, mapActions } from 'pinia';
import { DateTime } from 'luxon';

import CustomInterval from '@/helpers/interval/CustomInterval';
import { formatNumber, formatPercentage } from '@/helpers/numbers/formatNumber';
import TimelineRowChart from '@/components/atoms/TimelineRowChart/index.vue';
import TimelineAxis from '@/components/atoms/TimelineAxis/index.vue';
import TimelineViewGroupRegularTemplate from '@/components/templates/TimelineViewGroupRegularTemplate/index.vue';
import TimelineViewGroupMobileTemplate from '@/components/templates/TimelineViewGroupMobileTemplate/index.vue';
import EvoconVTooltipWrap from '@/components/atoms/EvoconVTooltipWrap/index.vue';
import oeeComponents from '@/constants/oeeComponents';
import { useDeviceStore, useFactoryOverviewConfigStore } from '@/stores';

const vectorIcons = { mdiDragVertical, mdiBullseye };
export default {
  name: 'FactoriesOverviewTimelinesChart',
  components: {
    TimelineRowChart,
    TimelineAxis,
    TimelineViewGroupRegularTemplate,
    TimelineViewGroupMobileTemplate,
    EvoconVTooltipWrap,
  },
  props: {
    items: { type: Array, default: () => [] },
    id: { type: [Number, String], required: true },
    measure: { type: String, required: true },
    tooltipHTMLFunc: { type: Function, required: true },
    groupName: { type: String, required: true },
    timezoneOffsets: { type: Array, default: () => ([]) },
    isDragDisabled: { type: Boolean },
  },
  data() {
    return {
      ...vectorIcons,
      xScale: d3.scaleTime().range([0, 0]),
      orderedStationsCopy: [],
      updateTimer: null,
    };
  },
  computed: {
    ...mapState(useDeviceStore, ['isBrowserTabActive']),
    ...mapState(useFactoryOverviewConfigStore, [
      'timelinesInterval',
      'rollingTimelines',
      'timelinesIntervalEndTime',
    ]),
    currentTemplate() {
      if (this.isHandheldDevice) {
        return TimelineViewGroupMobileTemplate;
      }
      return TimelineViewGroupRegularTemplate;
    },
    elementData() {
      return this.rollingTimelines || {};
    },
    isHandheldDevice() {
      return this.$vuetify.display.smAndDown;
    },
    showAlternativeUnit() {
      return this.measure === 'Good quantity alternative';
    },
    measureName() {
      if (this.measure === 'Good quantity') return `${this.$t('Good quantity')} (${this.$t('Primary unit')})`;
      if (this.measure === 'Good quantity alternative') return `${this.$t('Good quantity')} (${this.$t('Alternative unit')})`;
      return this.$t(this.measure);
    },
  },
  watch: {
    timelinesInterval() {
      this.setScale();
    },
    elementData() {
      this.setScale();
    },
    items(val) {
      this.orderedStationsCopy = [...val];
    },
    isBrowserTabActive(val, prevVal) {
      if (val && val !== prevVal) this.addUpdateInterval();
      else this.clearUpdateInterval();
    },
  },
  mounted() {
    this.orderedStationsCopy = [...this.items];
    this.element = d3.select(this.$el);
    this.setScale();
    window.addEventListener('resize', this.setScale);
    this.addUpdateInterval();
  },
  unmounted() {
    window.removeEventListener('resize', this.setScale);
    this.clearUpdateInterval();
  },
  methods: {
    ...mapActions(useFactoryOverviewConfigStore, ['modifyTimelineOrdering']),
    setNewOrder() {
      this.modifyTimelineOrdering(this.orderedStationsCopy);
    },
    goToShiftview(item) {
      window.open(
        `${window.location.origin}/#/shiftview/${item.id}/`,
        '_blank',
      );
    },
    setScale() {
      if (this.$refs['axis-container'] === undefined) return;
      const { clientWidth } = this.$refs['axis-container'];
      this.xScale = d3.scaleTime().range([0, clientWidth]);
      const endTime = this.timelinesIntervalEndTime || DateTime.now().toUTC();
      const startTime = endTime.minus({ hours: this.timelinesInterval });
      this.xScale.domain([startTime.toJSDate(), endTime.toJSDate()]);
    },
    addUpdateInterval() {
      this.updateTimer = new CustomInterval(this.setScale, 60 * 1000).set();
    },
    clearUpdateInterval() {
      if (this.updateTimer) this.updateTimer = this.updateTimer.clear();
    },
    getUnitLabel(item) {
      const { timeline } = this.elementData[item.id];
      const units = timeline.reduce((acc, slice) => {
        if (slice.typ !== 'PRODUCT') return acc;
        if (this.showAlternativeUnit && !!slice.aUId) acc.add(slice.aUId);
        else acc.add(slice.uId);
        return acc;
      }, new Set());
      if (units.size === 1) return units.values().next().value;
      return '';
    },
    shouldShowStat(availability, timeline) {
      if (availability > 0) return true;
      if ([oeeComponents.QUALITY, oeeComponents.PERFORMANCE].includes(this.measure)) return false;
      if ([oeeComponents.AVAILABILITY, oeeComponents.OEE].includes(this.measure)) return timeline.some((slice) => slice.inOee);
      return true;
    },
    getStatValue(item) {
      const data = this.elementData[item.id];
      const { total } = data.stats;
      if (!this.shouldShowStat(total.availability, data.timeline)) return '-';
      if (this.measure === 'Good quantity alternative') {
        return formatNumber(total.altQuantity - total.altScrapQty);
      }
      if (this.measure === 'Good quantity') {
        return formatNumber(total.quantity - total.scrapQty);
      }
      return formatPercentage(total[this.measure] * 100);
    },
  },
};
</script>
