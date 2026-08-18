<template>
  <v-progress-circular
    v-if="loading"
    indeterminate
    color="primary"
    size="50"
  />
  <component
    :is="templateComponent"
    v-if="currentData.shiftProductionType"
    :target-value="widgetData.target"
    :labels-data="donutsData"
  >
    <template #compact-header>
      <v-row class="align-center">
        <v-col
          :class="isVerticalOeeWidgetCard ? 'text-center' : 'text-end'"
        >
          <span class="text-headline-large">{{ formatPercentage(innerCircleData.value * 100) }}</span>
        </v-col>
        <v-col
          :cols="isVerticalOeeWidgetCard ? 12 : ''"
          :class="isVerticalOeeWidgetCard ? 'text-center' : 'text-start ml-4'"
        >
          <span
            :class="getTextColor(innerCircleData)"
            class="text-headline-small"
          >
            <span class="text-no-wrap">{{ formattedComparison(innerCircleData.value, innerCircleData.previousValue) }}</span>
            <span class="text-no-wrap">(
              <v-icon
                v-if="smartPercentageChange !== 0"
                :color="getTextColor(innerCircleData).split('-')[0]"
                class="mx-n2"
              >
                {{ smartPercentageChange > 0 ? mdiMenuUp : mdiMenuDown }}
              </v-icon>
              {{ formatPercentage(Math.abs(smartPercentageChange)) }})
            </span>
          </span>
        </v-col>
      </v-row>
    </template>
    <template #chart>
      <donut-graph
        v-if="isDonutGraphVisible"
        :donuts-data="donutsData"
        :inner-circle-data="innerCircleData"
        :i="i"
        :update-trigger="updateTrigger"
        :tooltip-h-t-m-l-func="tooltipHTMLFunc"
      />
      <oee-horizontal-graph
        v-else
        :graph-data="donutsData"
        :i="i"
        :update-trigger="updateTrigger"
        :tooltip-h-t-m-l-func="tooltipHTMLFunc"
      />
    </template>
    <template #target-label="{ targetValue }">
      <span>
        <div class="text-body-small font-weight-regular">
          {{ $t("Target") }} {{ `(${$t('OEE')})` }}
        </div>
        <span class="text-headline-small">
          {{ formatPercentage(targetValue, { decimalPlaces: null }) }}
        </span>
      </span>
    </template>
    <template #label="{ labelData }">
      <span>
        <div class="text-body-small font-weight-regular text-no-wrap">
          {{ labelData.label }}
        </div>
        <div
          class="text-headline-small"
        >{{ labelData.formattedValue }}</div>
        <div
          class="text-body-small font-weight-regular"
          :class="getTextColor(labelData)"
        >{{ labelData.formattedComparison }} </div>
      </span>
    </template>
  </component>
  <small-placeholder-text
    v-else
    :primary-text="$t('No data available')"
    :secondary-text="$t('Please check back later or edit settings')"
  />
</template>
<script>
import { mapState } from 'pinia';
import {
  mdiCircleMedium,
  mdiMenuUp,
  mdiMenuDown,
} from '@mdi/js';

import { CUSTOM } from '@/constants/predefinedTimePeriodNames';
import { formatPercentage } from '@/helpers/numbers/formatNumber';
import DonutGraph from '@/components/atoms/DonutGraph/index.vue';
import OeeHorizontalGraph from '@/components/atoms/OeeHorizontalGraph/index.vue';
import statisticsApi from '@/api/statisticsApi';
import { smartPercentageChange } from '@/helpers/d3Helpers';
import vIconRawTemplate from '@/helpers/html/vIconRawTemplate';
import colorConstants from '@/constants/colorConstants';
import OEEWidgetCompactTemplate from '@/components/templates/OEEWidgetCompactTemplate/index.vue';
import OEEWidgetRegularTemplate from '@/components/templates/OEEWidgetRegularTemplate/index.vue';
import SmallPlaceholderText from '@/components/atoms/SmallPlaceholderText/index.vue';
import { useStationStore } from '@/stores/index';

const icons = { mdiMenuUp, mdiMenuDown };

export default {
  name: 'DashboardOeeDonutWidget',
  components: {
    DonutGraph,
    OeeHorizontalGraph,
    OEEWidgetCompactTemplate,
    OEEWidgetRegularTemplate,
    SmallPlaceholderText,
  },
  props: {
    i: {
      type: [String, Number],
      required: true,
    },
    widgetData: {
      type: Object,
      required: true,
    },
    updateTrigger: {
      type: Number,
      default: 0,
    },
    fetchTrigger: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      ...icons,
      loading: false,
      graphData: {},
      currentQuality: 0,
      currentPerformance: 0,
      currentAvailability: 0,
      prevQuality: 0,
      prevPerformance: 0,
      prevAvailability: 0,
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      currentData: {},
    };
  },
  computed: {
    ...mapState(useStationStore, ['stationsMap']),
    templateComponent() {
      return this.isDonutGraphVisible ? 'OEEWidgetRegularTemplate' : 'OEEWidgetCompactTemplate';
    },
    colors() {
      return colorConstants[this.$vuetify.theme.name];
    },
    currentOee() {
      return this.calcOEE(
        this.currentQuality,
        this.currentPerformance,
        this.currentAvailability,
      );
    },
    donutsData() {
      return this.getDonutsData(
        this.currentQuality,
        this.currentPerformance,
        this.currentAvailability,
        this.prevQuality,
        this.prevPerformance,
        this.prevAvailability,
      ).reverse();
    },
    prevOee() {
      return this.calcOEE(
        this.prevQuality,
        this.prevPerformance,
        this.prevAvailability,
      );
    },
    innerCircleData() {
      return this.getInnerCircleData(this.currentOee, this.prevOee);
    },
    isDonutGraphVisible() {
      // eslint-disable-next-line no-magic-numbers
      return this.screenWidth > 1400 && this.screenHeight > 900;
    },
    isVerticalOeeWidgetCard() {
      return !this.isDonutGraphVisible;
    },
    smartPercentageChange() {
      return smartPercentageChange(this.innerCircleData.previousValue, this.innerCircleData.value);
    },
  },
  watch: {
    fetchTrigger() {
      this.fetchOeeSummary();
    },
  },
  mounted() {
    window.addEventListener('resize', this.handleResize);
    this.fetchOeeSummary();
  },
  unmounted() {
    window.removeEventListener('resize', this.handleResize);
  },
  methods: {
    getTextColor(data) {
      const diff = (data.value - data.previousValue) * 100;
      if (diff > 0) return 'text-primary';
      if (diff < 0) return 'text-error';
      return '';
    },
    calcInnerCircleColor() {
      const { target } = this.widgetData;
      return target && this.graphData.periodOee < target
        ? 'rgba(255, 0, 0, 0.2)'
        : '#212121';
    },
    calcQuality(obj) {
      if (!obj.quantity) return 0;
      return (obj.quantity - obj.scrapQty) / obj.quantity;
    },
    calcPerformance(obj) {
      if (!obj.productIdealQty) return 0;
      return obj.quantity / obj.productIdealQty || 0;
    },
    calcAvailability(obj) {
      const totalProdTime = obj.productionTime + obj.delayTime;
      if (!totalProdTime) return 0;
      return obj.productionTime / totalProdTime || 0;
    },
    calcOEE(quality, performance, availability) {
      return quality * performance * availability;
    },
    formattedComparison(val, prev) {
      const diff = val - prev;
      let sign = '';
      if (diff > 0) sign = '+';
      if (diff < 0) sign = '-';
      return `${sign}${this.formatPercentage(Math.abs(diff * 100))}`;
    },
    tooltipHTMLFunc(d) {
      const rows = [];
      const dotIcon = vIconRawTemplate(mdiCircleMedium, 24, d.color);
      const dotLabel = `<span class="text-label-small">${d.tooltipPrimaryLabel}</span>`;
      const value = `<span class="text-body-medium font-weight-medium">${d.tooltipPrimaryValue}</span>`;
      const row1 = `<div class="align-center d-flex flex-row ml-n2">${dotIcon}${dotLabel}</div>`;
      const row2 = `<div>${value}</div>`;
      const diff = smartPercentageChange(d.previousValue, d.value);
      const iconMargin = 'mx-n1';
      const trendIconClass = `${this.getTextColor(d)} ${iconMargin}`;
      let trendIcon = '';
      if (diff > 0) {
        trendIcon = vIconRawTemplate(mdiMenuUp, 24, '', trendIconClass);
      }
      if (diff < 0) {
        trendIcon = vIconRawTemplate(mdiMenuDown, 24, '', trendIconClass);
      }
      if (diff === '') {
        trendIcon = vIconRawTemplate(mdiMenuUp, 24, '', trendIconClass);
      }
      const formattedDiff = this.formattedComparison(d.value, d.previousValue);
      const diffValue = `<span class="text-body-medium">${formattedDiff}</span>`;

      const pctChangeStr = `(${trendIcon} <span class="text-body-medium">${this.formatPercentage(Math.abs(diff))}</span>)`;
      const row3 = `<div class="${trendIconClass} d-flex align-center">${diffValue}&nbsp;${pctChangeStr}</div>`;
      rows.push(row1, row2, row3);

      return rows.join('');
    },
    getDonutsData(
      quality,
      performance,
      availability,
      prevQuality,
      prevPerformance,
      prevAvailability,
    ) {
      return [
        {
          value: quality,
          formattedValue: quality ? formatPercentage(quality * 100) : '-',
          formattedComparison: quality ? this.formattedComparison(quality, prevQuality) : '',
          previousValue: prevQuality,
          tooltipPrimaryValue: this.formatPercentage(quality * 100),
          tooltipSecondaryPrepend: this.$t('Previous'),
          tooltipSecondaryValue: this.formatPercentage(prevQuality * 100),
          color: this.colors['lw-orange'],
          tooltipPrimaryLabel: this.$t('quality'),
          label: this.$t('quality'),
          class: 'text-lw-orange',
          order: 0,
        },
        {
          value: performance,
          formattedValue: performance ? formatPercentage(performance * 100) : '-',
          formattedComparison: performance ? this.formattedComparison(performance, prevPerformance) : '',
          previousValue: prevPerformance,
          tooltipPrimaryValue: this.formatPercentage(performance * 100),
          tooltipSecondaryPrepend: this.$t('Previous'),
          tooltipSecondaryValue: this.formatPercentage(prevPerformance * 100),
          color: this.colors['lw-yellow'],
          tooltipPrimaryLabel: this.$t('performance'),
          label: this.$t('performance'),
          class: 'text-lw-yellow',
          order: 1,
        },
        {
          value: availability,
          formattedValue: formatPercentage(availability * 100),
          formattedComparison: this.formattedComparison(availability, prevAvailability),
          previousValue: prevAvailability,
          tooltipPrimaryValue: this.formatPercentage(availability * 100),
          tooltipSecondaryPrepend: this.$t('Previous'),
          tooltipSecondaryValue: this.formatPercentage(prevAvailability * 100),
          color: this.colors.primary,
          tooltipPrimaryLabel: this.$t('availability'),
          label: this.$t('availability'),
          class: 'text-primary',
          order: 2,
        },
      ];
    },
    getInnerCircleData(oee, prevOee) {
      let trending = 0;
      if (oee > prevOee) trending = 1;
      if (prevOee > oee) trending = -1;
      return {
        value: oee,
        previousValue: prevOee,
        secondary: Math.abs(prevOee - oee),
        color: this.calcInnerCircleColor(),
        trending,
        tooltipPrimaryLabel: this.$t('OEE'),
        tooltipPrimaryValue: this.formatPercentage(oee * 100),
        tooltipSecondaryPrepend: this.$t('Previous'),
        tooltipSecondaryValue: this.formatPercentage(prevOee * 100),
      };
    },
    async fetchOeeSummary() {
      try {
        this.loading = true;
        const params = {
          factoryIds: this.widgetData.factoryId,
          stationIds: this.widgetData.stationId.filter(
            (id) => !!this.stationsMap[id],
          ), // check permissions
          periodName: this.widgetData.periodName,
        };
        if (this.widgetData.periodName === CUSTOM) params.range = this.widgetData.range;
        const { current, previous } = await statisticsApi.getOeeSummary(params);
        this.currentData = current;
        this.currentQuality = this.calcQuality(current);
        this.currentPerformance = this.calcPerformance(current);
        this.currentAvailability = this.calcAvailability(current);
        this.prevQuality = this.calcQuality(previous);
        this.prevPerformance = this.calcPerformance(previous);
        this.prevAvailability = this.calcAvailability(previous);
      } catch {
        // pass for tests
      } finally {
        this.loading = false;
      }
    },
    handleResize() {
      this.screenWidth = window.innerWidth;
      this.screenHeight = window.innerHeight;
    },
    formatPercentage,
  },
};
</script>
