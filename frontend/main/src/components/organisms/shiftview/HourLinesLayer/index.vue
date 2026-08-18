<!-- eslint-disable vuetify/no-deprecated-colors -->
<template>
  <svg
    id="shiftview-hour-lines"
    ref="shiftview-hour-lines"
    class="hour-lines"
    viewBox="0 0 3600 1000"
    height="100%"
    width="100%"
    preserveAspectRatio="none"
  >
    <path
      class="uncommented"
      :class="{ selected: isSelected }"
      :d="uncommentedPath"
      :stroke-width="y.bandwidth()"
    />
    <path
      class="commented"
      :class="{ selected: isSelected }"
      :d="commentedPath"
      :stroke-width="y.bandwidth()"
    />
    <path
      class="planned-excluded-from-oee"
      :class="{ selected: isSelected }"
      :d="plannedExclInOeePath"
      :stroke-width="y.bandwidth()"
    />
    <path
      class="planned-included-in-oee"
      :class="{ selected: isSelected }"
      :d="plannedInclInOeePath"
      :stroke-width="y.bandwidth()"
    />
    <path
      class="yellow"
      :class="{ selected: isSelected }"
      :d="yellowPath"
      :stroke-width="y.bandwidth()"
    />
    <path
      class="green"
      :class="{ selected: isSelected }"
      :d="greenPath"
      :stroke-width="y.bandwidth()"
      @click.stop="onGreenAreaClick"
    />
    <path
      class="speedLoss"
      :class="{ selected: isSelected }"
      :d="commentedYellowPath"
      :stroke-width="y.bandwidth()"
    />
    <path
      v-if="hoveredPath || performanceHoverPath || batchHoverPath"
      class="green hovered"
      :d="hoveredPath || performanceHoverPath || batchHoverPath"
      :stroke-width="y.bandwidth()"
      @mouseleave="hoveredPath = ''"
      @click.stop="onGreenAreaClick"
    />
  </svg>
</template>
<script>
import { scaleBand } from 'd3';
import { mapState, mapActions } from 'pinia';
import cloneDeep from 'lodash/cloneDeep';

import CommentPath from './CommentPath';
import CommentedYellowPath from './CommentedYellowPath';

import editTeamDialogConfig from '@/constants/shiftviewDialogConfigs/editTeamDialogConfig';
import i18n from '@/services/i18n';
import { isIOS } from '@/helpers/ios/DetectIOSTouch';
import PositionCalculator from '@/components/organisms/shiftview/Brackets/PositionCalculator';
import { getThrottleToFrame } from '@/helpers/throttle';
import { eventBus } from '@/eventBus';
import { INNER_PADDING, OUTER_PADDING } from '@/d3/constants';
import {
  useShiftviewTimelineStore,
  useShiftviewSelectionStore,
  useShiftStore,
  useStationStore,
  useGenericDialogStore,
  useGenericNotificationStore,
} from '@/stores';

export default {
  name: 'HourLinesLayer',
  props: {
    shiftHours: { type: Array, default: () => [] },
    requireOperator: { type: Boolean },
  },
  emits: ['product-hover', 'set-hour-line-height'],
  data() {
    return {
      greenPath: '',
      yellowPath: '',
      uncommentedPath: '',
      commentedPath: '',
      plannedExclInOeePath: '',
      plannedInclInOeePath: '',
      commentedYellowPath: '',
      positionCalculator: null,
      hoveredPath: '',
      performanceHoverPath: '',
      hoveredSlice: undefined,
      batchHoverPath: undefined,
      positionCalculatorTimeout: null,
    };
  },
  computed: {
    ...mapState(useShiftviewTimelineStore, ['yellowSlices', 'timeline', 'performanceLossTimeline', 'slicesByType']),
    ...mapState(useShiftviewSelectionStore, ['isSelectionActive']),
    ...mapState(useShiftStore, ['shift']),
    ...mapState(useStationStore, ['lineviewStation']),
    isSelected() {
      return this.isSelectionActive;
    },
    y() {
      return scaleBand()
        .paddingOuter(OUTER_PADDING)
        .paddingInner(INNER_PADDING)
        .range([0, 1000])
        .domain(Array.from(this.shiftHours).map((n) => n.dateTime));
    },
    greenYellowUpdateTrigger() {
      const { shiftHours, slicesByType } = this;
      return { shiftHours, slicesByType };
    },
  },
  watch: {
    greenYellowUpdateTrigger() {
      this.getGreensAndYellows();
    },
    shift() {
      this.setPositionCalculator();
      this.setHourLineHeight();
    },
  },
  created() {
    this.throttleToFrame = getThrottleToFrame();
  },
  mounted() {
    eventBus.$on('widget-chart-hover', this.onWidgetChartHover);

    eventBus.$on('changeover-hover', this.onBatchHover);

    this.getGreensAndYellows();
    this.positionCalculatorTimeout = setTimeout(() => {
      this.setPositionCalculator();
    }, 300);
    globalThis.addEventListener('resize', this.onResize);
    if (!isIOS()) globalThis.addEventListener('mousemove', this.onHover);
    this.setHourLineHeight();
  },
  unmounted() {
    clearTimeout(this.positionCalculatorTimeout);
    eventBus.$off('widget-chart-hover', this.onWidgetChartHover);
    eventBus.$off('changeover-hover', this.onBatchHover);
    globalThis.removeEventListener('resize', this.onResize);
    globalThis.removeEventListener('mousemove', this.onHover);
  },
  methods: {
    ...mapActions(useShiftviewSelectionStore, ['selectSlice']),
    ...mapActions(useGenericDialogStore, ['openDialog']),
    ...mapActions(useGenericNotificationStore, ['notifyWarning']),
    requestOperator() {
      this.openDialog(editTeamDialogConfig);
      this.notifyWarning({ text: i18n.global.t('Please select team first') });
    },
    onWidgetChartHover(time) {
      if (!time) {
        this.performanceHoverPath = '';
        return;
      }
      const prslice = this.getSliceByTime(time);
      const path = new CommentPath('hovered', this.y, [{
        ...prslice,
      }], this.lineviewStation.zoneId);
      this.performanceHoverPath = path.getPath();
    },
    getGreensAndYellows() {
      const uncommentedPaths = new CommentPath('commented', this.y, this.slicesByType.uncommented, this.lineviewStation.zoneId);
      const commentedPaths = new CommentPath('commented', this.y, this.slicesByType.commented, this.lineviewStation.zoneId);
      const plannedExclInOee = new CommentPath('plannedExclInOee', this.y, this.slicesByType.plannedExclInOee, this.lineviewStation.zoneId);
      const plannedInclInOee = new CommentPath('plannedInclInOee', this.y, this.slicesByType.plannedInclInOee, this.lineviewStation.zoneId);
      globalThis.WorkerService
        .process('processDiscreteProductPath', {
          slices: cloneDeep(this.slicesByType.products),
          shiftHours: this.shiftHours,
          timezone: this.lineviewStation.zoneId,
        })
        .then((res) => {
          useShiftviewTimelineStore().setYellowSlices(res.yellows);
          this.greenPath = res.greenPath;
          this.yellowPath = res.yellowPath;
          this.uncommentedPath = uncommentedPaths.getPath();
          this.commentedPath = commentedPaths.getPath();
          this.plannedExclInOeePath = plannedExclInOee.getPath();
          this.plannedInclInOeePath = plannedInclInOee.getPath();
          const commentedYellowPaths = new CommentedYellowPath(this.y, this.yellowSlices, this.performanceLossTimeline);
          this.commentedYellowPath = commentedYellowPaths.getPath();
        });
    },
    setPositionCalculator() {
      const elem = this.$el.getBoundingClientRect();
      this.positionCalculator = new PositionCalculator({
        startTime: this.shift.startTimeISO,
        endTime: this.shift.endTimeISO,
        xStart: elem.left,
        xEnd: elem.right,
        yScale: scaleBand()
          .range([elem.top, elem.bottom])
          .domain(Array.from(this.shiftHours).map((n) => n.dateTime)),
        selectedRange: [],
        currentShift: this.shift,
        timezone: this.lineviewStation.zoneId,
      });
    },
    getSliceByTime(time) {
      const targetTime = new Date(time);
      return this.timeline.find((slice) => {
        // note: this will give better performance with
        // js Date but will become incorrect if user's timezone DST change is different of station's
        const start = new Date(slice.sliceStartTmISO);
        const end = new Date(slice.sliceEndTmISO);
        return targetTime >= start && targetTime <= end;
      });
    },
    onGreenAreaClick(event) {
      if (this.requireOperator) {
        this.requestOperator();
        return;
      }
      const clickedSlice = this.hoveredSlice || this.getTargetProductSlice(event);
      this.selectSlice(clickedSlice);
    },
    removeHover() {
      this.hoveredSlice = undefined;
      this.hoveredPath = '';
    },
    getTargetProductSlice(event) {
      if (!event.target) return null;
      const { classList } = event.target;
      if (classList.contains('green') && this.positionCalculator) {
        const time = this.positionCalculator.getPositionTime(event.layerX, event.layerY);
        return this.getSliceByTime(time);
      }
      if (classList.contains('product')) {
        const index = event.target.getAttribute('id').split('-')[2];
        return this.timeline[index];
      }
      return null;
    },
    onHover(event) {
      this.throttleToFrame(() => {
        const hoveredSlice = this.getTargetProductSlice(event);
        if (hoveredSlice) {
          const productPath = new CommentPath('hovered', this.y, [{
            ...hoveredSlice,
            sliceStartTmISO: hoveredSlice.yellowEnd || hoveredSlice.sliceStartTmISO,
          }], this.lineviewStation.zoneId);
          this.hoveredPath = productPath.getPath();
          this.hoveredSlice = hoveredSlice;
          this.$emit('product-hover', { x: event.clientX, y: event.clientY, productSlice: hoveredSlice });
        } else {
          this.removeHover();
          this.$emit('product-hover', null);
        }
      });
    },
    setHourLineHeight() {
      const el = this.$refs['shiftview-hour-lines'];
      if (!el) return;
      const viewBoxRatio = el.getBoundingClientRect().height / 1000;
      this.$emit('set-hour-line-height', this.y.bandwidth() * viewBoxRatio);
    },
    onResize() {
      this.setPositionCalculator();
      this.setHourLineHeight();
    },
    onBatchHover(hoveredBatchId) {
      if (!hoveredBatchId) {
        this.batchHoverPath = '';
        return;
      }
      const hoverStart = this.timeline.find((slice) => slice.batchId === hoveredBatchId)?.sliceStartTmISO;
      const hoverEnd = this.timeline.findLast((slice) => slice.batchId === hoveredBatchId)?.sliceEndTmISO;
      const path = new CommentPath('hovered', this.y, [{
        sliceStartTmISO: hoverStart,
        sliceEndTmISO: hoverEnd,
      }], this.lineviewStation.zoneId);
      this.batchHoverPath = path.getPath();
    },
  },
};
</script>

<style lang="less" scoped>
.hour-lines {
  shape-rendering: crispEdges;
  position: absolute;

  .planned-excluded-from-oee {
    stroke: rgb(var(--v-theme-lw-gray));
  }
  .planned-included-in-oee {
    stroke: rgb(var(--v-theme-secondary-dark));
  }

  .uncommented {
    stroke: rgb(var(--v-theme-lw-red));
  }
  .commented {
    stroke: rgb(var(--v-theme-lw-dark-red));
  }

  .green {
    stroke: rgb(var(--v-theme-lw-green));
    &.hovered {
      stroke: var(--lw-slice-hover);
    }
  }

  .yellow {
    stroke: rgb(var(--v-theme-lw-yellow));
  }
  .speedLoss {
    stroke: rgb(var(--v-theme-lw-commented-yellow));
  }

  .selected {
    opacity: 0.65;
  }
}
</style>
