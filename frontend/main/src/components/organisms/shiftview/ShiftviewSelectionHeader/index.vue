<template>
  <div
    v-if="isVisible"
    id="selection-header"
    :class="isMobileView ? 'text-body-medium' : 'text-headline-medium'"
  >
    {{ $t('To exit click or tap anywhere outside the timeline') }}
  </div>
</template>

<script>
import { DateTime } from 'luxon';
import { mapState, mapActions } from 'pinia';

import {
  useShiftviewSelectionStore, useGenericDialogStore, useShiftStore,
  useDeviceStore, useStationStore, useShiftviewTimelineStore,
} from '@/stores/index';

export default {
  name: 'ShiftviewSelectionHeader',
  computed: {
    ...mapState(useShiftviewSelectionStore, ['bracketSelectedSlices', 'canMoveLeft', 'canMoveRight', 'isSelectionActive']),
    ...mapState(useGenericDialogStore, ['isDialogOpened']),
    ...mapState(useShiftStore, ['shift']),
    ...mapState(useDeviceStore, ['isMobileView']),
    ...mapState(useStationStore, ['lineviewStation']),
    ...mapState(useShiftviewTimelineStore, ['timeline']),
    isVisible() {
      return this.isSelectionActive;
    },
  },
  watch: {
    isVisible(val) {
      if (val) document.addEventListener('keydown', this.keyListener);
      else document.removeEventListener('keydown', this.keyListener);
    },
  },
  beforeUnmount() {
    document.removeEventListener('keydown', this.keyListener);
  },
  methods: {
    ...mapActions(useShiftviewSelectionStore, ['clearSliceSelection', 'selectSliceOnLeft', 'selectSliceOnRight', 'selectSlice', 'clearPinSelection']),
    keyListener(event) {
      if (!this.isDialogOpened) {
        if (event.key === 'ArrowRight') {
          if (this.canMoveRight) {
            this.selectSliceOnRight();
          }
        } else if (event.key === 'ArrowLeft') {
          if (this.canMoveLeft) {
            this.selectSliceOnLeft();
          }
        } else if (event.key === 'Escape') {
          this.clearSliceSelection();
          this.clearPinSelection();
        } else if (event.key === 'ArrowUp') {
          this.moveByHour(-1);
        } else if (event.key === 'ArrowDown') {
          this.moveByHour(1);
        }
      }
    },
    moveByHour(step) {
      if (this.bracketSelectedSlices.length === 1) {
        const currentSelectedSlice = this.bracketSelectedSlices[0];
        const selectedTime = step === 1 ? currentSelectedSlice.sliceEndTmISO : currentSelectedSlice.sliceStartTmISO;
        const newTime = DateTime.fromISO(selectedTime, { zone: this.lineviewStation.zoneId }).plus({ hours: step });
        const range = {
          start: currentSelectedSlice.id,
          end: step === 1 ? this.timeline.length : 0,
          step,
        };
        const newSlice = this.findClosestSlice(newTime, range);
        this.clearSliceSelection();
        this.selectSlice(newSlice);
      }
    },
    findClosestSlice(time, range) {
      const currentTime = DateTime.local().setZone(this.lineviewStation.zoneId);
      const shiftEnd = DateTime.fromISO(this.shift.endTimeISO, { zone: this.lineviewStation.zoneId });
      const shiftStart = DateTime.fromISO(this.shift.startTimeISO, { zone: this.lineviewStation.zoneId });
      if (time > shiftEnd || time > currentTime) {
        return this.timeline[this.timeline.length - 1].batchId > 0 ? this.timeline[this.timeline.length - 1] : this.timeline[this.timeline.length - 2];
      }
      if (time < shiftStart) {
        return this.timeline[0];
      }
      for (let i = range.start; range.step === 1 ? i < this.timeline.length : i >= 0; i += range.step) {
        const slice = this.timeline[i];
        const sliceStart = DateTime.fromISO(slice.sliceStartTmISO, { zone: this.lineviewStation.zoneId });
        const sliceEnd = DateTime.fromISO(slice.sliceEndTmISO, { zone: this.lineviewStation.zoneId });
        if (sliceStart <= time && time <= sliceEnd) {
          return slice;
        }
      }
      return null;
    },
  },
};
</script>

<style lang="less" scoped>

#selection-header {
  z-index: 2;
  position: absolute;
  top: 0px;
  left: 0px;
  width: 100%;
  height: 100%;
  background: rgba(var(--v-theme-black), 0.87);
  color: rgb(var(--v-theme-quaternary-dark-2));
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
