<template>
  <div>
    <div
      :id="sliceId"
      class="performance-loss"
      :class="{ hovered: tooltipProps && tooltipProps.slice.parent.id === slice.parent.id }"
      :style="{ left: `${slice.startSecond / 36}%`, width: `${slice.elementDuration / 36}%` }"
      @click="$emit('click', slice)"
      @mouseenter="tooltipProps = { pageX: $event.pageX, pageY: $event.pageY, slice }"
      @mouseleave="tooltipProps = undefined"
    >
      <slice-notes-icon
        v-if="hasNotes(slice)"
        :slice-width="sliceWidth"
      />
    </div>
    <v-tooltip
      v-if="tooltipProps && !isSelectionActive"
      :model-value="!!tooltipProps"
      location="top"
      :target="[tooltipProps.pageX + 20, tooltipProps.pageY]"
    >
      <evocon-v-tooltip
        :type="$t('Speed loss')"
        :title="tooltipTitle"
        icon-color="lw-yellow"
        :rows="tooltipRows"
      />
    </v-tooltip>
  </div>
</template>
<script>
import { DateTime } from 'luxon';
import { mapState } from 'pinia';

import { altUnitConversion, getUnitId } from '@/helpers/timeline/altUnitConversion';
import { formatTimeInZone } from '@/helpers/time/formatTime';
import { formatNumber } from '@/helpers/numbers/formatNumber';
import HumanizeDuration from '@/helpers/time/humanizeDuration';
import EvoconVTooltip from '@/components/atoms/EvoconVTooltip/index.vue';
import SliceNotesIcon from '@/components/molecules/SliceNotesIcon/index.vue';
import {
  useStationStore,
  usePerfCommentStore,
  useShiftviewTimelineStore,
  useShiftviewSelectionStore,
  usePositionStore,
  useDeviceStore,
} from '@/stores';

export default {
  name: 'PerformanceLossSlice',
  components: { EvoconVTooltip, SliceNotesIcon },
  props: {
    slice: { type: Object, default: () => {} },
  },
  emits: ['click'],
  data() {
    return {
      sliceWidth: null,
      tooltipProps: undefined,
    };
  },
  computed: {
    ...mapState(useStationStore, ['lineviewStation']),
    ...mapState(usePerfCommentStore, ['perfCommentsRealMap', 'perfCommentGroupsRealMap']),
    ...mapState(useShiftviewTimelineStore, ['batches', 'currentBatch', 'performanceLossTimeline']),
    ...mapState(useShiftviewSelectionStore, ['isSelectionActive']),
    ...mapState(usePositionStore, ['positionsRealMap']),
    ...mapState(useDeviceStore, ['screenWidth']),
    sliceId() {
      return `performance-loss-${this.slice.parent.id}`;
    },
    tooltipRows() {
      const slice = this.tooltipProps.slice.parent;
      const start = formatTimeInZone(slice.sliceStartTmISO, this.lineviewStation.zoneId);
      const duration = DateTime.fromISO(slice.sliceEndTmISO).diff(DateTime.fromISO(slice.sliceStartTmISO), 'seconds').toObject().seconds;
      const groupId = this.perfCommentsRealMap.get(this.hoveredYellow.commentId)?.groupId;
      let batch = slice.batchId === -1 ? this.currentBatch : this.batches.get(slice.batchId);
      if (!batch) batch = {};
      const unitId = getUnitId(batch);
      const lossVal = altUnitConversion(batch, duration / batch.cycleTimeGood);
      return [
        { key: this.$t('Group'), value: this.perfCommentGroupsRealMap.get(groupId)?.name },
        { key: this.$t('Start'), value: `${start} (${HumanizeDuration(duration)})` },
        { key: this.$t('Product'), value: `${batch.productName} (${batch.productSku})` },
        { key: this.$t('Machine location'), value: this.positionsRealMap.get(this.hoveredYellow.positionId)?.name },
        { key: this.$t('Loss'), value: `${formatNumber(lossVal)} ${unitId}`, valueClass: 'text-secondary' },
        { key: this.$t('Extra note'), value: this.hoveredYellow.notes, allowTextWrap: true },
      ];
    },
    hoveredYellow() {
      return this.getCurrentTimelineElem(this.tooltipProps.slice);
    },
    tooltipTitle() {
      return this.perfCommentsRealMap.get(this.hoveredYellow.commentId)?.name || '';
    },
  },
  watch: {
    screenWidth() {
      this.setSliceWidth();
    },
  },
  mounted() {
    this.setSliceWidth();
  },
  methods: {
    getCurrentTimelineElem(slice) {
      const sliceStartTime = DateTime.fromISO(slice.parent.sliceStartTmISO, { zone: this.lineviewStation.zoneId });
      for (let elem = 0; elem < this.performanceLossTimeline.length; elem += 1) {
        const perfLossStart = DateTime.fromISO(this.performanceLossTimeline[elem].startTimeISO, { zone: this.lineviewStation.zoneId });
        const perfLossEnd = DateTime.fromISO(this.performanceLossTimeline[elem].endTimeISO, { zone: this.lineviewStation.zoneId });
        if (perfLossStart <= sliceStartTime && sliceStartTime < perfLossEnd) {
          return this.performanceLossTimeline[elem];
        }
      }
      return {};
    },
    hasNotes(slice) {
      return this.performanceLossTimeline.find((elem) => elem.startTimeISO === slice.parent.sliceStartTmISO)?.notes.length;
    },
    setSliceWidth() {
      this.sliceWidth = document.getElementById(this.sliceId)?.getBoundingClientRect().width;
    },
  },
};
</script>
<style lang="scss" scoped>
.performance-loss {
  top: 10%;
  height: 80%;
  position: absolute;
  cursor: pointer;
  pointer-events: all;

  &.hovered {
    background: var(--lw-slice-hover);
  }
}
</style>
