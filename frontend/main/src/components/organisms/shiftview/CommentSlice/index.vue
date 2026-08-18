<template>
  <div>
    <div
      :id="sliceId"
      class="comment"
      :class="className"
      :slice-type="commentSegment.parent.type"
      :style="commentStyle"
      @mouseenter="onMouseEnter($event, commentSegment.parent)"
      @mousemove="setTooltipPosition"
      @mouseleave="onMouseLeave"
      @click="$emit('click', commentSegment.parent)"
    >
      <slice-notes-icon
        v-if="commentSegment.parent.notes.length > 0 && commentSegment.name"
        :slice-width="sliceWidth"
      />
      <span
        class="comment-text"
        :class="{
          'pl-3': hasJoinIcon,
          'pl-2': !hasJoinIcon && $vuetify.display.smAndDown,
          'pl-4': !hasJoinIcon && $vuetify.display.mdAndUp,
        }"
        :style="{ 'font-size': fontSize }"
      >
        <v-icon
          v-if="hasJoinIcon"
          class="mr-1 join-icon"
          :size="iconSize"
        >
          {{ mdiLink }}
        </v-icon>
        {{ commentSegment.name }}
      </span>
    </div>
    <v-tooltip
      v-if="isHovered && isTooltipVisible && !isSelectionActive"
      :model-value="isTooltipVisible"
      location="top"
      :target="[tooltipPosition.left + 2, tooltipPosition.top]"
    >
      <evocon-v-tooltip
        :type="$t('Downtime')"
        :title="comment.name"
        :title-icon="commentSegment.parent.joinId ? mdiLink : ''"
        :icon-color="tooltipIconColor"
        :rows="tooltipRows"
      />
    </v-tooltip>
  </div>
</template>

<script>
import { mapState } from 'pinia';
import { mdiLink } from '@mdi/js';

import EvoconVTooltip from '@/components/atoms/EvoconVTooltip/index.vue';
import humanizeDuration from '@/helpers/time/humanizeDuration';
import { formatNumber } from '@/helpers/numbers/formatNumber';
import { formatTimeInZone } from '@/helpers/time/formatTime';
import { altUnitConversion, getUnitId } from '@/helpers/timeline/altUnitConversion';
import { getBatchTitle } from '@/helpers/batch/batchHelpers';
import { getThrottleToFrame } from '@/helpers/throttle';
import SliceNotesIcon from '@/components/molecules/SliceNotesIcon/index.vue';
import {
  useShiftviewSelectionStore,
  useCommentStore,
  usePositionStore,
  useShiftviewTimelineStore,
  useStationStore,
  useDeviceStore,
} from '@/stores';

const icons = { mdiLink };

export default {
  name: 'CommentSlice',
  components: { EvoconVTooltip, SliceNotesIcon },
  props: {
    commentSegment: {
      type: Object,
      default: () => {},
    },
    isHovered: {
      type: Boolean,
    },
    hourLineHeight: {
      type: Number,
      default: 0,
    },
  },
  emits: ['hover', 'click'],
  data() {
    return {
      ...icons,
      sliceWidth: null,
      isTooltipVisible: false,
      tooltipPosition: { top: 0, left: 0 },
    };
  },
  computed: {
    ...mapState(useShiftviewSelectionStore, ['clickSelectedSlices', 'isSelectionActive', 'sliceSelection']),
    ...mapState(useCommentStore, ['commentsRealMap', 'commentGroupsRealMap']),
    ...mapState(usePositionStore, ['positionsRealMap']),
    ...mapState(useShiftviewTimelineStore, ['batches', 'currentBatch']),
    ...mapState(useStationStore, ['lineviewStation']),
    ...mapState(useDeviceStore, ['screenWidth']),
    sliceId() {
      return `comment-slice-${this.commentSegment.parent.id}`;
    },
    isCurrentSelected() {
      return this.sliceSelection.find((slice) => slice.id === this.commentSegment.parent.id);
    },
    isCurrentSelectedWithClick() {
      return Object.keys(this.clickSelectedSlices).length > 1 && !!this.clickSelectedSlices[this.commentSegment.parent.id];
    },
    className() {
      /* eslint-disable no-magic-numbers */
      return {
        separated: this.commentSegment.parent.commentId,
        uncommented: this.commentSegment.parent.commentId === 0 && this.commentSegment.commentWidth > 2.5 && this.commentSegment.isFirstSegment,
        hovered: this.isHovered && !this.isCurrentSelected,
        'not-selected': (!this.isCurrentSelected && this.sliceSelection.length > 0),
        selected: this.isCurrentSelectedWithClick,
        'small-icon': this.hourLineHeight < 41,
        'large-icon': this.hourLineHeight > 96,
      };
      /* eslint-enable no-magic-numbers */
    },
    hasJoinIcon() {
      return this.commentSegment.parent.joinId && this.commentSegment.name;
    },
    iconSize() {
      /* eslint-disable no-magic-numbers */
      if (this.hourLineHeight < 41) return 16;
      if (this.hourLineHeight > 96) return 24;
      return 20;
      /* eslint-enable no-magic-numbers */
    },
    commentStyle() {
      const style = {
        left: `${this.commentSegment.startPosition}%`,
        width: `${this.commentSegment.commentWidth}%`,
      };
      return style;
    },
    fontSize() {
      if (this.$vuetify.display.xs) return '12px';
      if (this.$vuetify.display.mdAndDown) return '14px';
      if (this.$vuetify.display.lg) return '16px';
      return '18px';
    },
    comment() {
      return this.commentsRealMap.get(this.commentSegment.parent.commentId) || {};
    },
    tooltipIconColor() {
      if (!this.slice.commentId) return 'lw-red';
      if (this.slice.includeInOee && this.slice.type === 'STANDBY') return 'secondary-dark';
      return this.comment.negative ? 'lw-dark-red' : 'lw-gray';
    },
    slice() {
      return this.commentSegment.parent;
    },
    tooltipRows() {
      let batch = this.slice.batchId === -1 ? this.currentBatch : this.batches.get(this.slice.batchId);
      if (!batch) batch = {};
      const groupId = this.commentsRealMap.get(this.slice.commentId)?.groupId;
      const unitId = getUnitId(batch);
      const lossVal = altUnitConversion(batch, this.slice.idealQty);
      const ret = [
        { key: this.$t('Group'), value: this.commentGroupsRealMap.get(groupId)?.name },
        { key: this.$t('Start'), value: `${formatTimeInZone(this.slice.sliceStartTmISO, this.lineviewStation.zoneId)} (${humanizeDuration(this.slice.duration, { largest: 'hour' })})` },
        { key: this.$t('Product'), value: getBatchTitle(batch) },
        { key: this.$t('Machine location'), value: this.slice.positionId && this.positionsRealMap.get(this.slice.positionId) ? this.positionsRealMap.get(this.slice.positionId).name : '' },
        { key: this.$t('Loss'), value: this.slice.includeInOee ? `${formatNumber(lossVal)} ${unitId}` : '', valueClass: 'text-secondary' },
      ];
      if (this.slice.type === 'STANDBY') {
        ret.push({ key: this.$t('OEE calculation'), value: this.slice.includeInOee ? this.$t('Included') : this.$t('Excluded') });
      }
      ret.push({ key: this.$t('Extra note'), value: this.slice.notes, allowTextWrap: true });
      return ret;
    },
  },
  watch: {
    screenWidth() {
      this.setSliceWidth();
    },
  },
  created() {
    this.throttleToFrame = getThrottleToFrame();
  },
  mounted() {
    this.setSliceWidth();
  },
  methods: {
    onMouseEnter(event, comment) {
      this.throttleToFrame(() => {
        this.setTooltipPosition(event);
        this.isTooltipVisible = true;
        this.$emit('hover', comment);
      });
    },
    setTooltipPosition(event) {
      this.tooltipPosition = {
        top: event.pageY,
        left: event.pageX,
      };
    },
    onMouseLeave() {
      this.$emit('hover', null);
      this.isTooltipVisible = false;
    },
    setSliceWidth() {
      this.sliceWidth = document.getElementById(this.sliceId)?.getBoundingClientRect().width;
    },
  },
};
</script>

<style lang="less">
.comment {
  fill: #fff;
  flex: 1;
  position: absolute;
  cursor: pointer;
  height: 80%;
  top: 10%;
  font-size: 16px;
  display: flex;
  align-items: center;
  opacity: 1;
  pointer-events: all;

  &.not-selected {
    opacity: 0.3;
  }

  &.uncommented {
    background-image: url('delay.svg');
    background-size: 20px auto;
    background-position-y: center;
    background-position-x: 12px;

    &.small-icon{
      background-size: 16px auto;
    }

    &.large-icon {
      background-size: 24px auto;
    }
  }

  &.separated {
    border-right: 1px solid black;
  }

  &.hovered {
    background-color: var(--lw-slice-hover);
  }

  .comment-text {
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    line-height: 1.3;
    color: white;
  }

  &.selected {
    background-color: rgba(255, 222, 223, .54) !important;
  }

  .join-icon {
    pointer-events: none;
  }
}
</style>
