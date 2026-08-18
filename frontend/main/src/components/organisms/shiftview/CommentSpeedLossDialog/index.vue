<template>
  <comment-dialog
    v-model:reason-id="formData.commentId"
    v-model:position-id="formData.positionId"
    v-model:notes="formData.notes"
    :selected-reason="selectedReason"
    :toolbar-color="toolbarColor"
    :toolbar-title="toolbarTitle"
    :reasons="shiftviewStationPerfComments"
    :reasons-map="perfCommentsMap"
    :groups="shiftviewStationPerfCommentGroups"
    :groups-map="perfCommentGroupsMap"
    :positions="enabledPositions"
    :position-entity-prop="'performanceCommentIds'"
    :empty-view-header="$t('Uncommented speed loss')"
    :empty-view-description="$t('To comment speed loss, please go to settings and define reasons for speed loss.')"
    empty-view-img="speedloss"
    settings-module="speedlossreasons"
    :loading="loading"
    :top-reasons="topReasons"
    :top-reasons-loading="topReasonsLoading"
    :save-disabled="isSaveBtnDisabled"
    :note-storage-key="'speedlossNoteSuggestions'"
    :extra-note-required="isExtraNoteRequired"
    :save-callback="onSave"
    :original-reasons-count="shiftviewStationPerfComments.length"
    :delete-callback="onDelete"
    :is-edit="selectedSlice?.commentId"
  />
</template>

<script>
import { mapState, mapActions } from 'pinia';
import { DateTime } from 'luxon';

import {
  usePerfCommentStore,
  useStationStore,
  useShiftviewSelectionStore,
  useShiftviewTimelineStore,
  useProfileStore,
  useDeviceStore,
  usePositionStore,
} from '@/stores/index';
import statisticsApi from '@/api/statisticsApi';
import performanceCommentApi from '@/api/performanceCommentApi';
import { formatTimeInZone } from '@/helpers/time/formatTime';
import { getNormalizedValue } from '@/helpers/getNormalizedValue';
import CommentDialog from '@/components/organisms/shiftview/CommentDialog/index.vue';

export default {
  name: 'CommentSpeedLossDialog',
  components: {
    CommentDialog,
  },
  data() {
    return {
      topReasonsLoading: false,
      topReasons: [],
      formData: {
        commentId: 0,
        positionId: 0,
        notes: '',
      },
      loading: false,
    };
  },
  computed: {
    ...mapState(usePerfCommentStore, ['perfCommentsMap', 'shiftviewStationPerfComments', 'shiftviewStationPerfCommentGroups', 'perfCommentGroupsMap']),
    ...mapState(useStationStore, ['lineviewStation']),
    ...mapState(useShiftviewSelectionStore, ['bracketRange', 'sliceSelection']),
    ...mapState(useShiftviewTimelineStore, ['performanceLossTimeline']),
    ...mapState(useProfileStore, ['language']),
    ...mapState(useDeviceStore, ['isMobileView']),
    ...mapState(usePositionStore, ['shiftviewStationPositions']),
    toolbarColor() {
      return this.formData.commentId ? 'lw-commented-yellow' : 'lw-yellow';
    },
    toolbarTitle() {
      const reasonName = this.selectedReason && this.selectedReason.id ? this.selectedReason.name : this.$t('Uncommented');
      if (this.isMobileView) return reasonName;
      const timeRange = `${formatTimeInZone(this.bracketRange.selectedRange[0], this.lineviewStation.zoneId)} - ${formatTimeInZone(this.bracketRange.selectedRange[1], this.lineviewStation.zoneId)}`;
      return `${reasonName} ${timeRange}`;
    },
    isExtraNoteRequired() {
      if (!this.selectedReason) return false;
      return !!this.selectedReason.noteRequired;
    },
    selectedPerfLossTimelineSliceStartTimes() {
      return this.sliceSelection.reduce((acc, slice) => {
        if (slice.perfLossCommentId) acc.add(slice.perfLossTimelineStart);
        return acc;
      }, new Set());
    },
    selectedSlice() {
      return this.performanceLossTimeline.find((slice) => slice.startTimeISO === [...this.selectedPerfLossTimelineSliceStartTimes][0]);
    },
    isSaveBtnDisabled() {
      if (!this.formData.commentId) return true;
      return this.selectedPerfLossTimelineSliceStartTimes.size === 1
        && this.sliceSelection.every((slice) => slice.perfLossCommentId === this.formData.commentId
          && getNormalizedValue(slice.perfLossPositionId) === getNormalizedValue(this.formData.positionId)
          && getNormalizedValue(slice.perfLossNotes) === getNormalizedValue(this.formData.notes));
    },
    selectedReason() {
      return this.perfCommentsMap[this.formData.commentId] || {};
    },
    enabledPositions() {
      return this.shiftviewStationPositions.filter((pos) => pos.performanceCommentsEnabled);
    },
  },
  async mounted() {
    if (this.shiftviewStationPerfComments.length === 0) return;
    this.loading = true;
    await this.fetchPerfCommentGroups({ lang: this.language });
    await this.fetchAllPerfComments({ lang: this.language });
    if (this.selectedPerfLossTimelineSliceStartTimes.size === 1) this.setFormData(this.selectedSlice);
    this.loading = false;
    this.setTop5Reasons();
  },
  methods: {
    ...mapActions(usePerfCommentStore, ['fetchAllPerfComments', 'fetchPerfCommentGroups']),
    async onSave() {
      return await performanceCommentApi.savePerformanceComment(this.lineviewStation.id, [{
        ...this.formData,
        startTimeISO: DateTime
          .fromISO(this.bracketRange.selectedRange[0], { zone: this.lineviewStation.zoneId })
          .startOf('second')
          .toISO(),
        endTimeISO: DateTime
          .fromISO(this.bracketRange.selectedRange[1], { zone: this.lineviewStation.zoneId })
          .startOf('second')
          .toISO(),
      }]);
    },
    async setTop5Reasons() {
      if (this.shiftviewStationPerfComments.length >= 10) {
        const params = {
          stationIds: [this.lineviewStation.id],
          lang: this.language,
        };
        try {
          this.topReasonsLoading = true;
          this.topReasons = await statisticsApi.getTopSpeedlossReasons(params);
        } finally {
          this.topReasonsLoading = false;
        }
      }
    },
    setFormData(slice) {
      if (!slice) return;
      this.formData.commentId = slice.commentId;
      this.formData.positionId = slice.positionId;
      this.formData.notes = slice.notes;
    },
    onDelete() {
      const eventTime = DateTime.fromISO(this.selectedSlice?.startTimeISO, { zone: this.lineviewStation.zoneId }).toFormat('yyyyMMddHHmmssZZZ');
      return performanceCommentApi.deleteTimelinePerformanceComment(this.lineviewStation.id, eventTime);
    },
  },
};
</script>
