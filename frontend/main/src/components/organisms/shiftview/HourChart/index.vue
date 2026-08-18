<template>
  <div
    class="canvas"
    :style="{ '--canvas-height': canvasHeight }"
  >
    <hour-lines-layer
      :shift-hours="shiftHours"
      :require-operator="requireOperator"
      @product-hover="onProductHover"
      @set-hour-line-height="hourLineHeight = $event"
    />
    <comment-layer
      v-if="hourLineHeight"
      :shift-hours="shiftHours"
      :comments="comments"
      :require-operator="requireOperator"
      :hour-line-height="hourLineHeight"
      @close-interaction="closeInteraction"
    />
    <circle-layer
      v-if="hourLineHeight"
      :product-slices="slicesByType.products"
      :hovered-product="tooltipProps?.productSlice"
      :shift-hours="shiftHours"
      :hour-line-height="hourLineHeight"
      :require-operator="requireOperator"
      @hover-change="onProductHover"
    />
    <timeline-icons-layer
      v-if="hourLineHeight"
      :shift-hours="shiftHours"
      :changeovers="slicesByType.productChanges"
      :hour-line-height="hourLineHeight"
      :require-operator="requireOperator"
    />
    <bracket-layer
      :shift-hours="shiftHours"
      @close-interaction="closeInteraction"
    />
    <product-tooltip
      v-if="tooltipProps"
      :tooltip-props="tooltipProps"
    />
  </div>
</template>
<script>
import { mapState, mapActions } from 'pinia';

import timelineApi from '@/api/timelineApi';
import CircleLayer from '@/components/organisms/shiftview/CircleLayer/index.vue';
import BracketLayer from '@/components/organisms/shiftview/BracketLayer/index.vue';
import HourLinesLayer from '@/components/organisms/shiftview/HourLinesLayer/index.vue';
import CommentLayer from '@/components/organisms/shiftview/CommentLayer/index.vue';
import TimelineIconsLayer from '@/components/organisms/shiftview/TimelineIconsLayer/index.vue';
import ProductTooltip from '@/components/organisms/shiftview/ProductTooltip/index.vue';
import {
  useShiftStore,
  useShiftviewSelectionStore,
  useShiftviewTimelineStore,
  useStationStore,
  useGenericDialogStore,
} from '@/stores';

export default {
  name: 'HourChart',
  components: {
    CommentLayer,
    HourLinesLayer,
    CircleLayer,
    TimelineIconsLayer,
    BracketLayer,
    ProductTooltip,
  },
  props: {
    comments: { type: Map, default: () => new Map() },
    shiftHours: { type: Array, default: () => [] },
    requireOperator: { type: Boolean },
  },
  data() {
    return {
      hourLineHeight: null,
      tooltipProps: null,
    };
  },
  computed: {
    ...mapState(useShiftStore, ['currentShift', 'shift']),
    ...mapState(useShiftviewSelectionStore, ['bracketSelectedSlices']),
    ...mapState(useShiftviewTimelineStore, ['timeline', 'slicesByType']),
    ...mapState(useStationStore, ['lineviewStation']),
    ...mapState(useGenericDialogStore, ['isDialogOpened']),
    canvasHeight() {
      /* eslint-disable no-magic-numbers */
      const minLineHeigth = this.$vuetify.display.xs ? 28 : 36;
      return `${this.shiftHours.length * minLineHeigth * 1.3}px`; // 20% inner padding and 10% outer padding
      /* eslint-enable no-magic-numbers */
    },
  },
  mounted() {
    globalThis.addEventListener('keydown', this.onKeyDown);
  },
  unmounted() {
    globalThis.removeEventListener('keydown', this.onKeyDown);
  },
  methods: {
    ...mapActions(useShiftviewSelectionStore, ['clearSliceSelection', 'selectSlice']),
    onKeyDown(event) {
      if (this.bracketSelectedSlices.length === 0 && !this.isDialogOpened && !this.requireOperator) {
        if (event.shiftKey && event.key === 'ArrowRight') {
          this.nextShift();
        } else if (event.shiftKey && event.key === 'ArrowLeft') {
          this.previousShift();
        } else if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
          this.selectSlice(this.timeline[0]);
        } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
          const lastSlice = this.timeline[this.timeline.length - 1].batchId > 0 ? this.timeline[this.timeline.length - 1] : this.timeline[this.timeline.length - 2];
          this.selectSlice(lastSlice);
        }
      }
    },
    closeInteraction() {
      this.clearSliceSelection();
    },
    async previousShift() {
      const timelineResponse = await timelineApi.selectPrevious(this.shift.id);
      this.$router.push({ name: 'shiftview', params: { stationId: this.lineviewStation.id, shiftId: timelineResponse.shift.id } }).catch((e) => e);
    },
    async nextShift() {
      if (this.shift.id !== this.currentShift.id) {
        const timelineResponse = await timelineApi.selectNext(this.shift.id);
        this.$router.push({ name: 'shiftview', params: { stationId: this.lineviewStation.id, shiftId: timelineResponse.shift.id } }).catch((e) => e);
      }
    },
    onProductHover(props) {
      this.tooltipProps = props;
    },
  },
};
</script>

<style lang="less" scoped>
.canvas {
  position: relative;
  height: var(--canvas-height);
  min-height: 100%;
  width: 100%;

  &::before {
    content: "";
    background: url("./minute-lines.svg");
    height: 100%;
    width: 100%;
    position: absolute;
    pointer-events: none;
    z-index: 1;
  }

}
</style>
