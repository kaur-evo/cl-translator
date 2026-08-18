<template>
  <div
    class="circle-layer"
    :class="{ 'd-none': isMobileView }"
  >
    <svg class="product-layer" />
  </div>
</template>
<script>
import { select, scaleBand } from 'd3';
import { mapState, mapActions } from 'pinia';
import { DateTime } from 'luxon';

import { getSecondsFromHourStart } from '@/helpers/timelineUtils';
import { getThrottleToFrame } from '@/helpers/throttle';
import { INNER_PADDING, OUTER_PADDING } from '@/d3/constants';
import editTeamDialogConfig from '@/constants/shiftviewDialogConfigs/editTeamDialogConfig';
import i18n from '@/services/i18n';
import {
  useShiftStore,
  useShiftviewSelectionStore,
  useFeatureStore,
  useDeviceStore,
  useStationStore,
  useGenericDialogStore,
  useGenericNotificationStore,
} from '@/stores';

const isLastCircleOfShift = (sliceEndTmISO, shiftEndLuxon, timezone) => {
  const sliceEndTmLuxon = DateTime.fromISO(sliceEndTmISO, { zone: timezone });
  return sliceEndTmLuxon
    .diff(shiftEndLuxon, 'seconds')
    .toObject().seconds === 0 && sliceEndTmLuxon.minute === 0 && sliceEndTmLuxon.second === 0;
};

const applyAttributes = (circles, yScale, sliceEndTmLuxon, circleRadius, timezone) => circles
  .attr('id', (d) => `product-circle-${d.id}`)
  .attr('r', circleRadius)
  .attr('cx', (d) => {
    let cx = 0;
    if (isLastCircleOfShift(d.sliceEndTmISO, sliceEndTmLuxon, timezone)) {
      cx = 100;
    } else {
      // percentage
      const oneSecondValue = 36;
      cx = getSecondsFromHourStart(d.sliceEndTmISO, timezone) / oneSecondValue;
    }
    return `${cx}%`;
  })
  .attr('cy', (d) => {
    let cy = 0;
    const sliceEndTmISOLuxon = DateTime.fromISO(d.sliceEndTmISO, { zone: timezone });
    if (isLastCircleOfShift(d.sliceEndTmISO, sliceEndTmLuxon, timezone)) {
      cy = yScale(sliceEndTmISOLuxon.minus(1, 'hour').startOf('hour').toISO()) + yScale.bandwidth();
    } else {
      cy = yScale(sliceEndTmISOLuxon.startOf('hour').toISO()) + yScale.bandwidth();
    }
    return `${cy}%`;
  });

const renderCircles = (svgElem, y, productSlices, mouseEventHandler, shiftEndTime, circleRadius, timezone, hideScrap, selectedSlices) => {
  const shiftEndLuxon = DateTime.fromISO(shiftEndTime, { zone: timezone });
  if (productSlices.length && (productSlices[productSlices.length - 1].batchId === -1 || productSlices[productSlices.length - 1].isFake)) {
    productSlices.pop();
  }
  const applyClassNames = (d) => {
    let className = 'product';
    if (d.scrapQty > 0) {
      className += ' scrap';
      if (hideScrap) {
        className += ' hidden-scrap';
      }
    } else if (d.signalNotes) {
      className += ' signal-note';
    }
    if (selectedSlices.find((slice) => slice.id === d.id)) {
      className += ' selected';
    }
    return className;
  };
  const svg = select(svgElem);
  svg
    .selectAll('circle')
    .data(productSlices, (d) => `${d.sliceEndTmISO}_${d.shiftId}`)
    .join(
      (enter) => applyAttributes(enter.append('circle'), y, shiftEndLuxon, circleRadius, timezone)
        .attr('class', applyClassNames)
        .on('mouseenter', mouseEventHandler)
        .on('mouseleave', mouseEventHandler)
        .on('click', mouseEventHandler),
      (update) => update.attr('class', applyClassNames),
      (exit) => exit.remove(),
    );
};

export default {
  name: 'CircleLayer',
  props: {
    productSlices: { type: Array, default: () => [] },
    shiftHours: { type: Array, default: () => [] },
    requireOperator: { type: Boolean },
    hoveredProduct: { type: Object, default: () => {} },
    hourLineHeight: { type: Number, default: 0 },
  },
  emits: ['hover-change'],
  data() {
    return {
    };
  },
  computed: {
    ...mapState(useShiftStore, ['shift']),
    ...mapState(useShiftviewSelectionStore, ['bracketRange', 'bracketSelectedSlices']),
    ...mapState(useFeatureStore, ['qualityYieldEnabled']),
    ...mapState(useDeviceStore, ['isMobileView']),
    ...mapState(useStationStore, ['lineviewStation']),
    yScale() {
      return scaleBand()
        .paddingOuter(OUTER_PADDING)
        .paddingInner(INNER_PADDING)
        .domain(this.shiftHours.map((n) => n.dateTime))
        .range([0, 100]);
    },
    shiftEndTime() {
      return this.shift.endTimeISO;
    },
    circleRadius() {
      const smallHeightThreshold = 40;
      const mediumHeightThreshold = 95;
      if (this.hourLineHeight <= smallHeightThreshold) return 4;
      if (this.hourLineHeight <= mediumHeightThreshold) return 5;
      return 7;
    },
  },
  watch: {
    productSlices() {
      this.renderCircles();
    },
    bracketRange: {
      handler() {
        this.renderCircles();
      },
      deep: true,
    },
    shiftHours(val, prev) {
      if (val.length !== prev.length) {
        const circles = select(this.svg).selectAll('circle');
        if (circles) circles.remove();
        this.renderCircles();
      }
    },
    hourLineHeight() {
      this.renderCircles();
    },
    hoveredProduct(newVal, prevVal) {
      if (prevVal) {
        const prevCircle = this.$el.querySelector(`#product-circle-${prevVal.id}`);
        if (prevCircle) prevCircle.classList.remove('hovered');
      }
      if (newVal) {
        this.throttleToFrame(() => {
          const newCircle = this.$el.querySelector(`#product-circle-${newVal.id}`);
          if (newCircle) newCircle.classList.add('hovered');
        });
      }
    },
  },
  created() {
    this.throttleToFrame = getThrottleToFrame();
    this.svg = null;
  },
  mounted() {
    this.svg = this.$el.querySelector('.product-layer');
    this.renderCircles();
  },
  methods: {
    ...mapActions(useShiftviewSelectionStore, ['selectSlice']),
    ...mapActions(useGenericDialogStore, ['openDialog']),
    ...mapActions(useGenericNotificationStore, ['notifyWarning']),
    requestOperator() {
      this.openDialog(editTeamDialogConfig);
      this.notifyWarning({ text: i18n.global.t('Please select team first') });
    },
    handleMouseEvent($event, productSlice) {
      this.throttleToFrame(() => {
        switch ($event.type) {
          case 'mouseenter':
            this.$emit('hover-change', { x: $event.pageX, y: $event.pageX, productSlice });
            break;
          case 'mouseleave':
            this.$emit('hover-change', null);
            break;
          case 'click':
            $event.stopPropagation();
            this.click(productSlice);
            break;
          default:
        }
      });
    },
    click(productSlice) {
      if (this.requireOperator) this.requestOperator();
      else this.selectSlice(productSlice);
    },
    renderCircles() {
      renderCircles(
        this.svg,
        this.yScale,
        this.productSlices,
        this.handleMouseEvent,
        this.shiftEndTime,
        this.circleRadius,
        this.lineviewStation.zoneId,
        this.qualityYieldEnabled,
        this.bracketSelectedSlices,
      );
    },
  },
};
</script>

<style lang="less">

.product-layer {
  pointer-events: none;
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  z-index: 3;
  fill: #000 !important;
  circle {
    &.product {
      shape-rendering: auto;
      stroke: #fff;
      stroke-width: 2px;
      cursor: pointer;
      pointer-events: auto;
      &.signal-note {
        fill: #CACACA;
        stroke: #CACACA;
      }
      &.scrap:not(.hidden-scrap) {
        fill: rgb(var(--v-theme-lw-orange));
        stroke: rgb(var(--v-theme-lw-orange));
      }
      &.selected {
        fill: #FFFFFF;
      }
      &.hovered {
        fill: #FFFFFF !important;
      }
    }
  }
}

</style>
