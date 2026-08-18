<template>
  <comment-dialog
    v-model:position-id="formData.positionId"
    v-model:notes="formData.notes"
    :reason-id="formData.commentId"
    :selected-reason="selectedComment"
    :toolbar-color="toolbarColor"
    :toolbar-title="toolbarTitle"
    :toolbar-icon="joinId ? mdiLink : ''"
    :reasons="shiftviewStationComments"
    :reasons-map="commentsMap"
    :groups="shiftviewStationCommentGroups"
    :groups-map="commentGroupsMap"
    :positions="enabledPositions"
    :position-entity-prop="'commentIds'"
    :empty-view-header="$t('Uncommented downtime')"
    :empty-view-description="$t('To comment downtime, please go to Settings and define reasons for downtime')"
    empty-view-img="no-downtime-reasons"
    settings-module="comments"
    :loading="loading"
    :top-reasons="topReasons"
    :top-reasons-loading="topReasonsLoading"
    :save-disabled="isSaveBtnDisabled"
    :note-storage-key="'downtimeNoteSuggestions'"
    :extra-note-required="isExtraNoteRequired"
    :save-callback="onSave"
    :delete-callback="onDelete"
    :original-reasons-count="shiftviewStationComments.length"
    :is-edit="isEdit"
    @update:reason-id="selectComment"
  >
    <template #item-append="{ item }">
      <evocon-v-tooltip-wrap :text="$t('Multiple stops must be selected.')">
        <template #activator="{ props }">
          <div v-bind="isJoinChipEnabled(item) || isMobileView ? null : props">
            <evocon-v-chip
              v-if="item.joiningAllowed"
              :active="item.id === formData.commentId && joinId"
              :label="$t('Join')"
              :icon="mdiLink"
              type="primary"
              class="ml-2"
              :class="item.id === formData.commentId && joinId ? 'text-primary' : 'text-primary-dark'"
              :disabled="!isJoinChipEnabled(item)"
              @click.stop="onJoinClick(item.id)"
            />
          </div>
        </template>
      </evocon-v-tooltip-wrap>
    </template>
  </comment-dialog>
</template>

<script>
import { mapState, mapActions } from 'pinia';
import { mdiLink } from '@mdi/js';
import { DateTime } from 'luxon';

import {
  useCommentStore,
  useStationStore,
  useShiftStore,
  useShiftviewSelectionStore,
  useProfileStore,
  useDeviceStore,
  useGenericDialogStore,
  usePositionStore,
  useGenericNotificationStore,
} from '@/stores/index';
import statisticsApi from '@/api/statisticsApi';
import commentApi from '@/api/commentApi';
import { formatTimeInZone } from '@/helpers/time/formatTime';
import { getNormalizedValue } from '@/helpers/getNormalizedValue';
import CommentDialog from '@/components/organisms/shiftview/CommentDialog/index.vue';
import EvoconVChip from '@/components/atoms/EvoconVChip/index.vue';
import EvoconVTooltipWrap from '@/components/atoms/EvoconVTooltipWrap/index.vue';

const icons = { mdiLink };

export default {
  name: 'CommentDowntimeDialog',
  components: {
    CommentDialog,
    EvoconVChip,
    EvoconVTooltipWrap,
  },
  data() {
    return {
      ...icons,
      topReasonsLoading: false,
      topReasons: [],
      loading: false,
      joinId: null,
      formData: {
        commentId: 0,
        positionId: 0,
        notes: '',
      },
      isEdit: false,
    };
  },
  computed: {
    ...mapState(useCommentStore, ['commentsMap', 'shiftviewStationComments', 'shiftviewStationCommentGroups', 'commentGroupsMap']),
    ...mapState(useStationStore, ['lineviewStation']),
    ...mapState(useShiftStore, ['shift']),
    ...mapState(useShiftviewSelectionStore, ['bracketRange', 'hasSelectedEndChanged', 'firstSelectedSlice', 'sliceSelection']),
    ...mapState(useProfileStore, ['language']),
    ...mapState(useDeviceStore, ['isMobileView']),
    ...mapState(useGenericDialogStore, ['dialogData']),
    ...mapState(usePositionStore, ['shiftviewStationPositions']),
    toolbarTitle() {
      if (this.sliceSelection.length === 0) return '';
      if (this.isMobileView) return this.selectedComment.name;
      let durationString = '';
      if (this.sliceSelection.length > 1) {
        durationString = `(${this.sliceSelection.length}) (${this.calculateDuration(this.sliceSelection)}min)`;
      } else if (this.bracketRange.selectedRange) {
        durationString = `${
          formatTimeInZone(this.bracketRange.selectedRange[0], this.lineviewStation.zoneId)
        } - ${formatTimeInZone(this.bracketRange.selectedRange[1], this.lineviewStation.zoneId)}`;
      } else {
        durationString = `${
          formatTimeInZone(this.firstSelectedSlice.sliceStartTmISO, this.lineviewStation.zoneId)
        } - ${formatTimeInZone(this.firstSelectedSlice.sliceEndTmISO, this.lineviewStation.zoneId)}`;
      }
      return `${this.selectedComment.name} ${durationString}`;
    },
    toolbarColor() {
      if (!this.formData.commentId) return 'lw-red';
      if (this.selectedComment.category === 'STANDBY' && this.selectedComment.includeInOee) return 'secondary-dark';
      return this.selectedComment.negative ? 'lw-dark-red' : 'lw-gray';
    },
    selectedComment() {
      return this.commentsMap[this.formData.commentId] || { name: this.$t('Uncommented') };
    },
    isExtraNoteRequired() {
      if (!this.selectedComment) return false;
      if (this.selectedComment.noteRequiredDuration && this.selectedComment.noteRequired) {
        if (this.sliceSelection.length > 1) return this.sliceSelection.some((value) => value.duration > this.selectedComment.noteRequiredDuration);
        if (this.bracketRange.selectedRange) {
          const [start, end] = this.bracketRange.selectedRange;
          const startTm = DateTime.fromISO(start, { zone: this.lineviewStation.zoneId });
          const endTm = DateTime.fromISO(end, { zone: this.lineviewStation.zoneId });
          const duration = endTm.diff(startTm, 'seconds').toObject().seconds;
          return duration > this.selectedComment.noteRequiredDuration;
        }
        return this.sliceSelection[0].duration > this.selectedComment.noteRequiredDuration;
      }
      return this.selectedComment.noteRequired;
    },
    commentedSelectedStoppages() {
      return this.sliceSelection.reduce((acc, slice) => {
        if (slice.commentId) acc.push(slice);
        return acc;
      }, []);
    },
    isJoinedGroupEdit() {
      const firstSliceWithJoinId = this.sliceSelection.find((slice) => slice.joinId);
      if (!firstSliceWithJoinId) return false;
      return this.sliceSelection.every((slice) => slice.joinId === firstSliceWithJoinId.joinId || slice.commentId === 0);
    },
    areAllSelectedStoppagesIdentical() {
      if (this.commentedSelectedStoppages.length === 0) return false;
      const firstStoppage = this.commentedSelectedStoppages[0];
      return this.commentedSelectedStoppages.every((stoppage) => stoppage.commentId === firstStoppage.commentId
        && stoppage.positionId === firstStoppage.positionId && stoppage.notes === firstStoppage.notes);
    },
    isSaveBtnDisabled() {
      if (!this.formData.commentId) return true;
      if (this.hasSelectedEndChanged) return false;
      return this.sliceSelection.every((slice) => slice.commentId === this.formData.commentId
        && getNormalizedValue(slice.positionId) === getNormalizedValue(this.formData.positionId)
        && getNormalizedValue(slice.notes) === getNormalizedValue(this.formData.notes)
        && (this.joinId ? slice.joinId === this.joinId : !slice.joinId));
    },
    enabledPositions() {
      return this.shiftviewStationPositions.filter((pos) => pos.commentsEnabled);
    },
  },
  async mounted() {
    if (this.shiftviewStationComments.length === 0) return;
    this.loading = true;
    await this.fetchCommentGroups({ lang: this.language });
    await this.fetchAllComments({ lang: this.language });
    if (this.dialogData.commentId) {
      this.formData.commentId = this.dialogData.commentId;
    }
    if (this.areAllSelectedStoppagesIdentical || this.isJoinedGroupEdit) this.setDialogData(this.commentedSelectedStoppages);
    this.loading = false;
    this.setTop5Reasons();
  },
  methods: {
    ...mapActions(useGenericNotificationStore, ['notifyError']),
    ...mapActions(useCommentStore, ['fetchAllComments', 'fetchCommentGroups']),
    getPayloadSlices() {
      return this.sliceSelection.reduce((slices, selectionSlice, i) => {
        const sliceCopy = {
          commentId: this.formData.commentId,
          positionId: this.formData.positionId,
          notes: this.formData.notes,
          startTimeISO: selectionSlice.sliceStartTmISO,
          endTimeISO: null,
        };
        if (this.bracketRange.selectedRange) {
          const bracketStart = DateTime.fromISO(this.bracketRange.selectedRange[0], { zone: this.lineviewStation.zoneId });
          const sliceStart = DateTime.fromISO(selectionSlice.sliceStartTmISO, { zone: this.lineviewStation.zoneId });
          if (i === 0 && bracketStart > sliceStart) { // first slice can be selected partially
            sliceCopy.startTimeISO = bracketStart.startOf('second').toISO();
          }
          if (this.hasSelectedEndChanged && i === this.sliceSelection.length - 1) { // last slice can be selected partially
            const bracketEnd = DateTime.fromISO(this.bracketRange.selectedRange[1], { zone: this.lineviewStation.zoneId });
            sliceCopy.endTimeISO = bracketEnd.startOf('second').toISO();
          }
        }
        if (this.joinId && this.joinId !== 'fakeJoinId') sliceCopy.joinId = this.joinId;
        slices.push(sliceCopy);
        return slices;
      }, []);
    },
    async onSave() {
      const slices = this.getPayloadSlices();
      if (slices.length === 0) {
        this.notifyError(this.$t('No commentable area found'));
        return;
      }
      return await commentApi.saveComment(
        this.lineviewStation.id,
        this.shift.id,
        slices,
        this.joinId !== null,
      );
    },
    calculateDuration(slices) {
      let duration = null;
      let bracketStartTm;
      let bracketEndTm;
      if (this.bracketRange.selectedRange) {
        bracketStartTm = DateTime.fromISO(this.bracketRange.selectedRange[0], { zone: this.lineviewStation.zoneId });
        bracketEndTm = DateTime.fromISO(this.bracketRange.selectedRange[1], { zone: this.lineviewStation.zoneId });
      }
      slices.forEach((elem, i) => {
        let sliceDuration = elem.duration;
        if (this.bracketRange.selectedRange) {
          if (i === 0) {
            const sliceEnd = DateTime.fromISO(elem.sliceEndTmISO, { zone: this.lineviewStation.zoneId });
            sliceDuration = sliceEnd.diff(bracketStartTm, 'seconds').toObject().seconds;
          } else if (i === this.sliceSelection.length - 1) {
            const sliceStart = DateTime.fromISO(elem.sliceStartTmISO, { zone: this.lineviewStation.zoneId });
            sliceDuration = bracketEndTm.diff(sliceStart, 'seconds').toObject().seconds;
          }
        }
        duration += sliceDuration;
      });
      return Math.floor(duration / 60);
    },
    async setTop5Reasons() {
      if (this.shiftviewStationComments.length >= 10) {
        const params = {
          stationIds: [this.lineviewStation.id],
          lang: this.language,
        };
        try {
          this.topReasonsLoading = true;
          this.topReasons = await statisticsApi.getTopStopReasons(params);
        } finally {
          this.topReasonsLoading = false;
        }
      }
    },
    setDialogData(data) {
      this.formData.commentId = data[0].commentId;
      if (this.formData.commentId) this.isEdit = true;
      if (data.some((d) => d.joinId)) {
        const uniqueNotes = new Set(data.filter((d) => d.notes).map((d) => d.notes));
        const uniquePositions = new Set(data.filter((d) => d.positionId).map((d) => d.positionId));
        const uniqueJoinIds = new Set(data.filter((d) => d.joinId).map((d) => d.joinId));
        if (uniqueNotes.size === 1) this.formData.notes = uniqueNotes.values().next().value;
        if (uniquePositions.size === 1) this.formData.positionId = uniquePositions.values().next().value;
        if (uniqueJoinIds.size === 1) this.joinId = uniqueJoinIds.values().next().value;
      } else {
        this.formData.notes = data[0].notes;
        this.formData.positionId = data[0].positionId;
      }
    },
    isJoinChipEnabled(item) {
      if (this.sliceSelection.length === 1) {
        const isSameJoinId = this.sliceSelection[0].joinId && this.sliceSelection[0].joinId === this.joinId;
        return (item.id === this.formData.commentId && isSameJoinId) ?? false;
      }
      return true;
    },
    onJoinClick(reasonId) {
      if (this.selectedComment.id === reasonId && this.joinId) this.joinId = null;
      else this.joinId = 'fakeJoinId';
      if (this.selectedComment.id !== reasonId) this.selectComment(reasonId, false);
    },
    selectComment(reasonId, resetJoin = true) {
      this.formData.commentId = reasonId;
      if (resetJoin) this.joinId = null;
    },
    async onDelete() {
      this.formData.commentId = 0;
      this.joinId = null;
      this.formData.notes = '';
      this.formData.positionId = 0;
      return this.onSave();
    },
  },

};
</script>
