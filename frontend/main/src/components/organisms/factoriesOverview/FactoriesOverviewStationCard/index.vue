<template>
  <v-card
    ref="root"
    :height="height"
    :color="getBackgroundColor(viewData)"
    class="px-4 py-3 cursor-move d-flex flex-column"
    @click="goToShiftview(station)"
  >
    <!-- header -->
    <div
      class="d-flex align-start justify-space-between flex-nowrap flex-shrink-1 flex-grow-0"
      :class="textColorClass"
    >
      <span
        :class="$vuetify.display.xxl ? 'text-headline-large line-clamp-2-40 font-weight-medium' : 'text-headline-small line-clamp-2-28'"
        class="cursor-pointer"
      >
        {{ station.name }}
      </span>
      <v-tooltip :text="$t('Shift OEE')" location="top right">
        <template #activator="{ props }">
          <span
            v-if="viewData"
            v-bind="props"
            :id="`oee-value${stationData.id}`"
            class="ml-2 font-weight-semi-medium white-space-nowrap"
            :class="isMobileView ? 'text-headline-large' : 'text-display-small'"
          >
            {{ formatPercentage(viewData.oee * 100) }}
          </span>
        </template>
      </v-tooltip>
    </div>
    <div
      v-if="viewData"
      :class="[textColorClass, isMobileView ? 'mt-1' : 'mt-2']"
      class="d-flex flex-column text-body-medium flex-nowrap white-space-nowrap flex-shrink-0 flex-grow-1"
    >
      <!-- shift qty -->
      <v-tooltip :text="`${$t('Shift total quantity')} / ${$t('idealqty')}`" location="top right">
        <template #activator="{ props }">
          <div
            v-bind="props"
            class="d-flex justify-space-between rounded info-row"
            :class="{ 'info-row--dark': isDark }"
          >
            <span>{{ $t('Shift quantity') }}</span>
            <span>{{ shiftProducedQty }} / {{ shiftPlannedQty }} {{ shiftUnit }}</span>
          </div>
        </template>
      </v-tooltip>
      <!-- batch & batch qty -->
      <v-tooltip
        :text="getBatchSectionTooltipText"
        :disabled="viewData.plannedQty > 0 && !viewData.estimatedTimeLeft"
        location="top right"
      >
        <template #activator="{ props }">
          <div
            v-bind="props"
            class="d-flex justify-space-between rounded info-row"
            :class="{ 'info-row--dark': isDark }"
          >
            <span
              id="product-name"
              class="text-truncate"
            >
              {{ `${viewData.productionOrder || ''} ${viewData.productSku || ''} ${viewData.productName}` }}
            </span>
            <span
              v-if="!isNaN(parseInt(viewData.producedQty - viewData.scrapQty))"
              v-show="quantityElementVisible"
            >
              {{ `${batchGoodQty} / ${batchPlannedQty} ${batchUnit}` }}
            </span>
            <span v-show="!quantityElementVisible">
              {{ estimatedTimeLeftLabel }}
            </span>
          </div>
        </template>
      </v-tooltip>
      <!-- progressbar -->
      <div
        :id="`progress${stationData.id}`"
        class="lineview-progress my-2"
        :class="{ inverted: isYellow }"
      >
        <div
          :style="progressBarWidth"
          class="progress"
        />
      </div>
      <div
        v-if="viewData.lineStatus === 'stopped'"
        class="text-center my-auto text-body-small"
      >
        <div class="text-uppercase">
          {{ viewData.productName ? $t("No active shift") : $t("No production") }}
        </div>
        <div>
          {{ $t('Please check back later or edit settings') }}
        </div>
      </div>
      <template v-else-if="viewData.lineStatus === 'running'">
        <div
          :id="`element-chart${stationData.id}`"
          ref="chartWrapper"
          class="chart"
        />
        <div class="text-body-small mt-auto mb-0">
          <div
            v-if="['standby', 'stoppage', 'planned_stoppage'].includes(viewData.lastSlice?.typ?.toLowerCase())"
            class="d-flex justify-space-between"
          >
            <span>{{ getCommentName(viewData.lastSlice.cId) }}</span>
            <span>{{ commentTime }}</span>
          </div>
          <div
            v-else
            :id="`chart-text${stationData.id}`"
          >
            {{
              $t("Production speed ({unit}/min) – last hour", { unit: viewData.unitId })
            }}
          </div>
        </div>
      </template>
    </div>
    <div v-else class="d-flex justify-center align-center flex-grow-1 flex-shrink-0">
      <v-img
        max-width="120px"
        cover
        src="@/assets/images/mr-evocon-maintenance.svg"
      />
    </div>
  </v-card>
</template>

<script>
/* eslint-disable no-magic-numbers */
import * as d3 from 'd3';
import { mapState } from 'pinia';
import { DateTime } from 'luxon';
import { nextTick } from 'vue';

import CustomInterval from '@/helpers/interval/CustomInterval';
import { formatNumber, formatPercentage } from '@/helpers/numbers/formatNumber';
import humanizeDuration from '@/helpers/time/humanizeDuration';
import factoryOverviewStatuses from '@/constants/factoryOverviewStatuses';
import { useFactoryOverviewConfigStore, useCommentStore, useDeviceStore } from '@/stores';

export default {
  name: 'FactoriesOverviewStationCard',
  props: {
    stationData: {
      type: Object,
      required: true,
    },
    quantityElementVisible: {
      type: Boolean,
    },
    height: {
      type: String,
      default: '246px',
    },
  },
  data() {
    return {
      commentTime: '',
      yAxisParam: 0,
      updateInterval: null,
    };
  },
  computed: {
    ...mapState(useFactoryOverviewConfigStore, ['timelines', 'unitType']),
    ...mapState(useCommentStore, ['commentsMap']),
    ...mapState(useDeviceStore, ['isBrowserTabActive', 'isMobileView']),
    isYellow() {
      return this.getBackgroundColor(this.viewData) === 'lw-yellow-bg';
    },
    strokeColor() {
      return this.isYellow ? '#000' : '#FFF';
    },
    textColorClass() {
      return this.isYellow ? 'text-primary-dark' : 'text-primary-light';
    },
    station() {
      return this.stationData;
    },
    viewData() {
      return this.stationData ? this.timelines[this.stationData.id] : {};
    },
    progressBarWidth() {
      let progressPct = 0;
      if (this.viewData) {
        progressPct = ((this.viewData.producedQty - this.viewData.scrapQty) / this.viewData.plannedQty) * 100;
      }
      if (progressPct >= 100) {
        return { width: '100%' };
      }
      return {
        width: `${progressPct}%`,
      };
    },
    isDark() {
      return ['black', 'secondary-dark', 'lw-gray'].includes(this.getBackgroundColor(this.viewData));
    },
    getBatchSectionTooltipText() {
      if (this.quantityElementVisible || !this.viewData.plannedQty) return `${this.$t('Since changeover')} / ${this.$t('Target')}`;
      return this.$t('Estimated time of completion');
    },
    estimatedTimeLeftLabel() {
      if (this.viewData.producedQty - this.viewData.scrapQty >= this.viewData.plannedQty && this.viewData.plannedQty !== 0) {
        return this.$t('Target reached');
      }
      if (!this.viewData.estimatedTimeLeft) {
        return `${formatNumber(this.viewData.producedQty - this.viewData.scrapQty)}/${formatNumber(this.viewData.plannedQty)} ${this.batchUnit}`;
      }
      return humanizeDuration(this.viewData.estimatedTimeLeft, {
        type: 'seconds',
        largest: 'hour',
      });
    },
    showPrimaryUnit() {
      return this.unitType === 'primary';
    },
    shiftProducedQty() {
      const qty = this.showPrimaryUnit ? this.viewData?.shiftProducedQty : this.viewData?.altShiftProducedQty;
      return formatNumber(qty || 0);
    },
    shiftPlannedQty() {
      const qty = this.showPrimaryUnit ? this.viewData?.shiftPlannedQty : this.viewData?.altShiftPlannedQty;
      return formatNumber(qty || 0);
    },
    shiftUnit() {
      const hasAlternatives = this.viewData?.shiftAltUnitIds?.some((id) => id !== '');
      const units = this.showPrimaryUnit || !hasAlternatives ? this.viewData?.shiftUnitIds : this.viewData?.shiftAltUnitIds;
      if (units.length === 1) {
        return units[0];
      }
      return '';
    },
    batchUnit() {
      return this.showPrimaryUnit || !this.viewData.alternativeUnitId ? this.viewData?.unitId : this.viewData?.alternativeUnitId;
    },
    batchGoodQty() {
      const totalQty = this.showPrimaryUnit ? this.viewData?.producedQty : this.viewData?.altProducedQty || 0;
      const scrapQty = this.showPrimaryUnit ? this.viewData?.scrapQty : this.viewData?.altScrapQty || 0;
      return formatNumber(totalQty - scrapQty || 0);
    },
    batchPlannedQty() {
      const qty = this.showPrimaryUnit ? this.viewData?.plannedQty : this.viewData?.altPlannedQty;
      return formatNumber(qty || 0);
    },
  },
  watch: {
    viewData() {
      this.createChart();
    },
    isBrowserTabActive(val, prevVal) {
      if (val && val !== prevVal) this.setUpdateInterval();
      else if (!val) this.clearUpdateInterval();
    },
    unitType() {
      this.createChart();
    },
  },
  mounted() {
    window.addEventListener('resize', this.handleresize);
    this.setUpdateInterval();
    this.createChart();
  },
  beforeUnmount() {
    this.clearUpdateInterval();
    window.removeEventListener('resize', this.handleresize);
  },
  methods: {
    goToShiftview(item) {
      window.open(
        `${window.location.origin}/#/shiftview/${item.id}/`,
        '_blank',
      );
    },
    getBackgroundColor(viewData) {
      const statusTypes = viewData?.statusTypes || [];
      if (statusTypes.includes(factoryOverviewStatuses.NO_SHIFT)) return 'black';
      if (statusTypes.includes(factoryOverviewStatuses.UNCOMMENTED_STOP)) return 'lw-red';
      if (statusTypes.includes(factoryOverviewStatuses.UNPLANNED_STOP)) return 'lw-dark-red';
      if (statusTypes.includes(factoryOverviewStatuses.PLANNED_STOP_INCL_OEE)) return 'secondary-dark';
      if (statusTypes.includes(factoryOverviewStatuses.PLANNED_STOP_EXCL_OEE)) return 'lw-gray';
      if (statusTypes.includes(factoryOverviewStatuses.SLOW_PRODUCTION)) return 'lw-yellow-bg';
      if (statusTypes.includes(factoryOverviewStatuses.GOOD_PRODUCTION)) return 'lw-green';
      return 'black';
    },
    getCommentTime() {
      if (this.viewData && this.viewData !== 'error' && this.viewData.lastSlice) {
        const timezone = this.stationData.zoneId;
        const now = DateTime.local().setZone(timezone);
        const starts = DateTime.fromISO(this.viewData.lastSlice.stTmISO, { zone: timezone });
        const diff = now.diff(starts, 'seconds').toObject().seconds;
        let result = '';
        if (diff > 86400) {
          result = humanizeDuration(diff, {
            type: 'hour',
            largest: 'day',
          });
        } else if (diff > 3600) {
          result = humanizeDuration(diff, {
            type: 'min',
            largest: 'hour',
          });
        } else if (diff > 60) {
          result = humanizeDuration(diff, {
            type: 'seconds',
            largest: 'min',
          });
        } else {
          result = diff ? `${diff}s` : '';
        }
        this.commentTime = result;
      }
    },
    getCommentName(id) {
      if (id === 0) {
        return this.$t('Uncommented stop');
      }
      if (this.commentsMap[id]) {
        return this.commentsMap[id].name;
      }
      return this.$t('Unknown');
    },
    // eslint-disable-next-line sonarjs/cognitive-complexity
    async createChart() {
      if (this.$refs.root?.$el) {
        d3.select(this.$refs.root.$el).select('.chart-svg').remove();
      }
      if (this.viewData === 'error') {
        return;
      }
      if (this.viewData && this.viewData.lineStatus !== 'stopped') {
        await nextTick();
        if (!this.$refs.root?.$el) return;
        const qtyParam = this.showPrimaryUnit ? 'qty' : 'altQty';
        const targetParam = this.showPrimaryUnit ? 'target' : 'altTarget';
        const qtyValues = this.viewData.performanceData.map((x) => x[qtyParam]);
        const largestQtyValue = Math.max(...qtyValues);
        if (largestQtyValue >= 10000) {
          this.yAxisParam = 20;
        } else if (largestQtyValue >= 1000) {
          this.yAxisParam = 8;
        }
        if (d3.select(this.$refs.root?.$el).select('.chart-svg')) {
          d3.select(this.$refs.root?.$el).select('.chart-svg').remove();
        }
        const chartWrapperWidth = this.$refs.chartWrapper?.getBoundingClientRect().width || 0;
        this.width = chartWrapperWidth - this.yAxisParam;
        const height = this.isMobileView ? 80 : 90;
        const svg = d3
          .select(this.$refs.root.$el)
          .select('.chart')
          .append('svg')
          .attr('class', 'chart-svg')
          .attr('width', this.width > 0 ? this.width : 0)
          .attr('height', height);

        const y = d3.scaleLinear().range([height - 15, 0]);
        const x = d3.scaleLinear().range([0, this.width - 20]);
        d3.axisLeft().scale(x);
        d3.axisTop().scale(y);
        x.domain(d3.extent(this.viewData.performanceData, (d, i) => i));
        let yDomain = d3.extent(this.viewData.performanceData, (d) => d[qtyParam]);
        if (yDomain[0] === yDomain[1]) {
          yDomain = [yDomain[0], yDomain[1] + 1];
        } else {
          yDomain = [yDomain[0], (yDomain[1] + 1).toFixed(1)];
        }
        y.domain(yDomain);
        const createPath = d3
          .line()
          .x((d, i) => x(i))
          .y((d) => y(d))
          .curve(d3.curveMonotoneX);
        const targetArea = d3
          .area()
          .x((d, i) => x(i))
          .y0((d) => y(d[targetParam] < yDomain[1] ? d[targetParam] : yDomain[1]))
          .y1(() => y(yDomain[1]));
        svg
          .append('path')
          .datum(this.viewData.performanceData)
          .style('transform', `translate(${this.yAxisParam + 40}px, 8px)`)
          .attr('d', targetArea)
          .style('fill', '#000000')
          .style('opacity', '0.25');
        const areaBetweenTargetAndGraph = d3
          .area()
          .curve(d3.curveMonotoneX)
          .x((d, i) => x(i))
          .y0((d) => y(d[targetParam] < d[qtyParam] ? d[targetParam] : d[qtyParam]))
          .y1((d) => y(d[qtyParam]));
        svg
          .append('path')
          .datum(this.viewData.performanceData)
          .style('transform', `translate(${this.yAxisParam + 40}px, 8px)`)
          .attr('d', areaBetweenTargetAndGraph)
          .style('fill', '#000000')
          .style('opacity', '0.5');
        // gridlines
        svg
          .append('g')
          .attr('class', 'grid')
          .style('opacity', '0.25')
          .style('transform', `translate(${this.yAxisParam + 30}px, 8px)`)
          .call(
            d3
              .axisLeft(y)
              .ticks(3)
              .tickSize(20 - this.width)
              .tickPadding(5)
              .tickFormat(''),
          )
          .call((g) => g.select('.domain').remove());
        // left labels
        svg
          .append('g')
          .attr('class', 'grid')
          .style('opacity', '1')
          .style('transform', `translate(${this.yAxisParam + 30}px, 8px)`)
          .call(
            d3
              .axisLeft(y)
              .ticks(3)
              .tickSize(0)
              .tickPadding(5)
              .tickFormat(this.formatNumber),
          );
        if (this.viewData.performanceData.length > 1) {
          svg
            .append('path')
            .attr(
              'd',
              createPath(
                this.viewData.performanceData.map((perfData) => perfData[qtyParam]),
              ),
            )
            .style('transform', `translate(${this.yAxisParam + 40}px, 8px)`)
            .style('fill', 'none')
            .style('stroke', this.strokeColor)
            .style('stroke-width', '3px');
          svg
            .append('path')
            .attr(
              'd',
              createPath(
                this.viewData.performanceData.map((perfData) => perfData[targetParam]),
              ),
            )
            .style('transform', `translate(${this.yAxisParam + 40}px, 8px)`)
            .style('fill', 'none')
            .style('opacity', 0.75)
            .style('stroke', this.strokeColor)
            .style('stroke-width', '1px')
            .style('stroke-dasharray', '6');
        } else {
          svg
            .append('line')
            .attr('x1', 20)
            .attr('y1', 88)
            .attr('x2', this.width)
            .attr('y2', 88)
            .style('fill', 'none')
            .style('stroke', this.strokeColor)
            .style('stroke-width', '2px');
        }
        svg
          .append('path')
          .attr(
            'd',
            createPath(
              this.viewData.performanceData.map((perfData) => perfData[targetParam]),
            ),
          )
          .style('transform', `translate(${this.yAxisParam + 40}, 8)`)
          .style('fill', 'none');
        d3.select('.domain').remove();
      }
    },
    handleresize() {
      this.createChart();
    },
    updateViewData() {
      this.getCommentTime();
    },
    setUpdateInterval() {
      this.updateInterval = new CustomInterval(this.updateViewData, 1000).set();
    },
    clearUpdateInterval() {
      if (this.updateInterval) this.updateInterval = this.updateInterval.clear();
    },
    formatNumber,
    formatPercentage,
  },
};
</script>

<style lang="less" scoped>
.lineview-progress {
  background: rgba(0, 0, 0, 0.25);
  border-radius: 2px;
  position: relative;
  height: 5px;

  .progress {
    position: absolute;
    left: 0;
    bottom: 0;
    border-radius: 2px;
    background: #ffffff;
    z-index: 1;
    height: 5px;
  }
  &.inverted {
    .progress {
      background: #000;
    }
  }
}
.comment-group {
  background: linear-gradient(
    0deg,
    rgba(1, 1, 1, 0.5) 0%,
    rgba(1, 1, 1, 0) 100%
  );
  bottom: 0;
  position: absolute;
  width: 100%;
}

.info-row {
  margin: 0px -4px;
  padding: 0px 4px;

  &:hover {
    background: rgba(0, 0, 0, 0.12);
  }

  &--dark {
    &:hover {
      background: var(--color-12-light);
    }
  }
}
</style>
