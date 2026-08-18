<template>
  <div class="bracket-layer">
    <div
      v-for="(rowparams, index) in overlayPos"
      :key="`overlay${index}`"
      :class="shiftviewSelectionType ? shiftviewSelectionType.toLowerCase() : ''"
      class="row-overlay"
      :style="rowparams"
    />
    <div
      id="left-bracket"
      class="bracket"
      :style="{ left: `${leftPos.left}px`, top: `${leftPos.top}px`, height: `${height}px` }"
    >
      <span
        v-for="n in 2"
        :key="`left-bracket-${n}`"
        class="drag"
      />
    </div>
    <div
      id="right-bracket"
      class="bracket"
      :style="{ left: `${rightPos.left}px`, top: `${rightPos.top}px`, height: `${height}px` }"
    >
      <span
        v-for="n in 2"
        :key="`right-bracket-${n}`"
        class="drag"
      />
    </div>
  </div>
</template>

<script>
/* eslint-disable no-magic-numbers */
import { scaleBand, select, drag } from 'd3';
import { mapState } from 'pinia';
import { DateTime } from 'luxon';

import PositionCalculator from './PositionCalculator';

import {
  useShiftviewSelectionStore,
  useShiftStore,
  useGenericDialogStore,
  useStationStore,
} from '@/stores';

export default {
  name: 'ShiftviewBrackets',
  props: {
    shiftHours: { type: Array, default: () => [] },
  },
  emits: ['selection-updated', 'cancel'],
  data() {
    return {
      position: null,
      y: {},
      leftPos: {
        top: null,
        left: null,
      },
      rightPos: {
        top: null,
        left: null,
      },
      height: 0,
    };
  },
  computed: {
    ...mapState(useShiftviewSelectionStore, ['bracketRange', 'shiftviewSelectionType', 'sliceSelection']),
    ...mapState(useShiftStore, ['shift']),
    ...mapState(useGenericDialogStore, ['isDialogOpened']),
    ...mapState(useStationStore, ['lineviewStation']),
    overlayPos() {
      if (this.y && this.y.bandwidth) {
        const bandwidthMarginOffset = (this.y.bandwidth() - this.height) / 2;
        const rowCount = Math.ceil((this.rightPos.top - this.leftPos.top + bandwidthMarginOffset) / this.y.bandwidth());
        const rows = [];
        for (let i = 0; i < rowCount; i += 1) {
          const rowTopPos = this.leftPos.top + (i * this.y.bandwidth());
          const rowParams = {
            left: 0, right: 0, top: `${rowTopPos}px`, height: `${this.height}px`,
          };
          rows.push(rowParams);
        }
        if (rows.length) {
          // cut off the beginning of first row by first bracket
          rows[0].left = `${this.leftPos.left + 15}px`;
          // cut off the end of last row by second bracket
          rows[rows.length - 1].right = `${String(this.$el.offsetWidth - this.rightPos.left)}px`;
        }

        return rows;
      }
      return [];
    },
  },
  mounted() {
    this.y = scaleBand()
      .range([0, this.$el.offsetHeight])
      .domain(this.shiftHours.map((n) => n.dateTime));
    this.position = new PositionCalculator({
      startTime: this.bracketRange.startTime,
      endTime: this.bracketRange.endTime,
      xStart: 0,
      xEnd: this.$el.clientWidth,
      yScale: this.y,
      selectedRange: this.bracketRange.selectedRange,
      currentShift: this.shift,
      timezone: this.lineviewStation.zoneId,
    });
    this.updatePositions();

    select(this.$el).call(
      drag()
        .on('start', (event) => {
          this.position.onDragStart(event);
        })
        .on('drag', (event) => {
          this.position.onDrag(event);
          this.updatePositions();
        })
        .on('end', (event) => {
          this.position.onDragEnd(event);
          if (this.shiftviewSelectionType === 'SLOW') {
            this.snapYellowBrackets();
          }
        }),
    );

    globalThis.addEventListener('resize', this.cancelCrop);
  },
  beforeUnmount() {
    globalThis.removeEventListener('resize', this.cancelCrop);
  },
  methods: {
    updatePositions() {
      const start = this.position.getStartPosition();
      const end = this.position.getEndPosition();
      this.leftPos = {
        left: start[0] - 15, // 15 == bracket width
        top: start[1] + (this.y.bandwidth() * 0.075),
      };
      this.rightPos = {
        left: end[0],
        top: end[1] + (this.y.bandwidth() * 0.075),
      };
      this.height = this.y.bandwidth() * 0.85;
      const selectedRange = this.position.getSelectedRange();
      this.$emit('selection-updated', selectedRange);
    },
    cancelCrop() {
      if (!this.isDialogOpened) {
        this.$emit('cancel');
      }
    },
    snapYellowBrackets() {
      const start = DateTime.fromISO(this.sliceSelection[0].sliceStartTmISO, { zone: this.lineviewStation.zoneId });
      const startPosition = this.position.getTimePosition(start);
      const end = DateTime.fromISO(this.sliceSelection[this.sliceSelection.length - 1].yellowEnd, { zone: this.lineviewStation.zoneId });
      const endPosition = this.position.getTimePosition(end);

      this.leftPos = {
        left: startPosition.x - 15, // 15 == bracket width
        top: startPosition.y + (this.y.bandwidth() * 0.075),
      };
      this.rightPos = {
        left: endPosition.x,
        top: endPosition.y + (this.y.bandwidth() * 0.075),
      };

      this.position.setSelectedRange(start, end);
      this.updatePositions();
    },
  },
};
</script>

<style lang="less" scoped>

.bracket-actions {
  position: absolute;
  z-index: 99;
  left: 15px;
  top: -15px;
  display: flex;
  transition: left 0.3s cubic-bezier(0.25, 0.8, 0.5, 1) 0s;

  .v-btn {
    margin-left: 6px;
  }
}

.bracket-layer {
  position: absolute;
  height: 100%;
  width: 100%;
  pointer-events: none;
}

.bracket {
  position: absolute;
  top: 0;
  left: 0;
  width: 15px;
  background: #fff;
  z-index: 99;
  transition: transform 0.2s ease;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 4px 0;
  pointer-events: all;
  .drag {
    width: 2px;
    background: black;
    height: 100%;
    margin: 0 1px;
  }

  &#left-bracket {
    border-radius: 4px 0 0 4px;
    box-shadow: -10px 1px 20px rgba(0, 0, 0, 0.4);
  }

  &#right-bracket {
    border-radius: 0 4px 4px 0;
    box-shadow: 10px 1px 20px rgba(0, 0, 0, 0.4);
  }
}
.row-overlay {
  position: absolute;
  opacity: .54;
  background-color: #ffffbf;

  &.stoppage {
    background-color: #ffdedf;
  }

  &.product {
    background-color: #ffffff;
  }
}
</style>
