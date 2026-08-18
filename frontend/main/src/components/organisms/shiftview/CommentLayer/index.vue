<template>
  <div class="comment-layer">
    <div
      v-for="(shiftHour, i) in shiftHours"
      :key="`comment-hour-${i}`"
      class="delay-row"
    >
      <comment-slice
        v-for="(comment, j) in hourComments.get(shiftHour.dateTime)"
        :key="`comment-slice-${j}`"
        :comment-segment="comment"
        :hour-line-height="hourLineHeight"
        class="flex-grow-1 flex-shrink-0"
        :is-hovered="hoveredComment && hoveredComment.id === comment.parent.id"
        @click="handleClickEvent($event, true)"
        @hover="onCommentHover"
      />
      <performance-loss-slice
        v-for="(slice, k) in hourYellowSlices.get(shiftHour.dateTime)"
        :key="`performance-loss-slice-${k}`"
        :slice="slice"
        @click="handleClickEvent($event)"
      />
    </div>
  </div>
</template>
<script>
import { mapState, mapActions } from 'pinia';

import {
  useShiftviewSelectionStore, useCommentStore, useStationStore,
  useShiftviewTimelineStore, useProfileStore, useGenericDialogStore, useGenericNotificationStore,
} from '@/stores/index';
import shiftviewDialogs from '@/constants/dialogConfigs';
import editTeamDialogConfig from '@/constants/shiftviewDialogConfigs/editTeamDialogConfig';
import i18n from '@/services/i18n';
import { splitSliceByHours } from '@/helpers/timelineUtils';
import CommentSlice from '@/components/organisms/shiftview/CommentSlice/index.vue';
import PerformanceLossSlice from '@/components/organisms/shiftview/PerformanceLossSlice/index.vue';

export default {
  name: 'CommentLayer',
  components: {
    CommentSlice,
    PerformanceLossSlice,
  },
  props: {
    shiftHours: { type: Array, default: () => [] },
    requireOperator: { type: Boolean },
    hourLineHeight: { type: Number, default: 0 },
  },
  data() {
    return {
      clickTimeout: null,
      clicks: 0,
      hoveredComment: null,
    };
  },
  computed: {
    ...mapState(useShiftviewSelectionStore, ['isSelectionActive']),
    ...mapState(useCommentStore, ['commentsRealMap']),
    ...mapState(useStationStore, ['lineviewStation']),
    ...mapState(useShiftviewTimelineStore, ['slicesByType', 'hourYellowSlices']),
    ...mapState(useProfileStore, ['isReadOnly']),
    hourComments() {
      const hourComments = new Map();
      this.slicesByType.uncommented
        .concat(this.slicesByType.commented)
        .concat(this.slicesByType.planned)
        .forEach((commentSlice) => {
          const commentParts = splitSliceByHours(commentSlice, this.lineviewStation.zoneId);
          const commentPartNames = this.getCommentPartNames(commentParts);
          for (let i = 0; i < commentParts.length; i += 1) {
            const commentPart = commentParts[i];
            const hourComment = { ...commentPart };
            const oneSecondValue = 36;
            hourComment.startPosition = commentPart.startSecond / oneSecondValue;
            hourComment.commentWidth = commentPart.elementDuration / oneSecondValue;
            hourComment.name = commentPartNames[i] || '';
            const hourCommentsArray = hourComments.get(commentPart.hourStart) || [];
            hourCommentsArray.push(hourComment);
            hourComments.set(commentPart.hourStart, hourCommentsArray);
          }
        });
      return hourComments;
    },
  },
  beforeUnmount() {
    clearTimeout(this.clickTimeout);
  },
  methods: {
    ...mapActions(useGenericDialogStore, ['openDialog']),
    ...mapActions(useGenericNotificationStore, ['notifyError', 'notifyWarning']),
    ...mapActions(useShiftviewSelectionStore, ['selectSlice']),
    requestOperator() {
      this.openDialog(editTeamDialogConfig);
      this.notifyWarning({ text: i18n.global.t('Please select team first') });
    },
    handleClickEvent(slice, isCommentSlice) {
      if (this.requireOperator) {
        this.requestOperator();
        return;
      }
      if (this.isReadOnly) {
        this.notifyError(this.$t('You are in read-only mode'));
        return;
      }
      this.clicks += 1;
      if (this.clicks === 1) { // click
        this.clickTimeout = setTimeout(() => {
          this.clicks = 0;
          this.selectSlice(slice);
        }, 200);
      } else { // dblclick
        clearTimeout(this.clickTimeout);
        if (!this.isSelectionActive) this.selectSlice(slice);
        if (isCommentSlice) this.openDialog(shiftviewDialogs.COMMENT_DOWNTIME);
        else this.openDialog(shiftviewDialogs.COMMENT_SPEED_LOSS);
        this.clicks = 0;
      }
    },
    getCommentPartNames(commentParts) {
      if (!commentParts || !commentParts.length) {
        return { 0: '' };
      }

      const commentName = this.getSliceComment(commentParts[0].parent.commentId);
      if (
        commentParts.length > 1
        // eslint-disable-next-line no-magic-numbers
        && commentParts[0].elementDuration <= 180
        && commentParts[1].elementDuration > commentParts[0].elementDuration
        && commentParts[1].elementDuration >= 60
      ) {
        return { 1: commentName };
      }

      if (commentParts[0].elementDuration < 60) {
        return { 0: '' };
      }

      return { 0: commentName };
    },
    getSliceComment(commentId) {
      if (!commentId) return '';
      const comment = this.commentsRealMap.get(commentId);
      return comment ? comment.name : '';
    },
    onCommentHover(comment) {
      // note: this exists to enable setting hovered state over multiple hour lines
      this.hoveredComment = comment;
    },
  },
};
</script>
<style lang="scss" scoped>
.comment-layer {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  z-index: 1;
  pointer-events: none;

  .delay-row {
    flex: 1;
    position: relative;
  }
}
</style>
