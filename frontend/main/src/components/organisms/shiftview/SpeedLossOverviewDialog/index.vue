<template>
  <div>
    <dialog-toolbar :title="$t('Speed loss overview')" :title-icon="mdiSpeedometerSlow" icon-color="lw-yellow" />
    <v-card-text class="py-0">
      <generic-tabs-row
        v-model="tab"
        :items="tabs"
        :height="48"
        label-key="name"
        class="mb-2"
        :disabled-rule-func="tab => tab.ranges.length === 0"
        :count-func="tab => tab.ranges.length"
      >
        <template #append="{ currentTab }">
          <div
            class="text-body-medium"
            :class="{ 'text-secondary-text': currentTab.count === 0 }"
          >
            {{ getTabDuration(currentTab) }}
          </div>
        </template>
      </generic-tabs-row>
      <shiftview-cards-list
        :items="items"
        :disabled="isReadOnly"
        :title-text-key="getTitleText"
        :subtitle-items-props="subtitleItemsProps"
        :additional-line-props="{ icon: mdiMessageReply, valueKey: 'notes' }"
        :border-color-key="() => tab === 0 ? 'lw-yellow' : 'lw-commented-yellow'"
        class="card-list mx-n4 px-4 align-content-start"
        :dense="isMobileView"
        :class="{ 'card-list--mobile': isMobileView, 'card-list--tablet': showFullscreenDialogs && !isMobileView }"
        :secondary-action-icon="tab === 0 ? '' : mdiPencil"
        @item-clicked="editSpeedLossReason"
        @primary-action="editSpeedLossReason"
        @secondary-action="onDeleteComment"
      />
    </v-card-text>
    <v-card-actions
      class="justify-end"
      :class="{ 'fullscreen-card-actions': showFullscreenDialogs }"
    >
      <evocon-v-button
        id="overview-close-btn"
        :text="$t('Close')"
        type="secondary"
        @click="closeDialog"
      />
    </v-card-actions>
  </div>
</template>

<script>
import { mdiSpeedometerSlow, mdiMessageReply } from '@mdi/js';
import { mapState, mapActions } from 'pinia';
import { DateTime } from 'luxon';

import {
  useProfileStore, useShiftviewTimelineStore, useStationStore, usePerfCommentStore,
  usePositionStore, useDeviceStore, useGenericDialogStore, useConfirmDialogStore,
  useGenericNotificationStore, useShiftviewSelectionStore,
} from '@/stores/index';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import ShiftviewCardsList from '@/components/organisms/shiftview/ShiftviewCardsList/index.vue';
import GenericTabsRow from '@/components/molecules/GenericTabsRow/index.vue';
import performanceCommentApi from '@/api/performanceCommentApi';
import humanizeDuration from '@/helpers/time/humanizeDuration';
import shiftviewDialogs from '@/constants/dialogConfigs';
import DialogToolbar from '@/components/atoms/DialogToolbar/index.vue';
import { formatTimeInZone } from '@/helpers/time/formatTime';

const icons = { mdiSpeedometerSlow, mdiMessageReply };
export default {
  name: 'SpeedLossOverviewDialog',
  components: {
    EvoconVButton, ShiftviewCardsList, DialogToolbar, GenericTabsRow,
  },
  data() {
    return {
      ...icons,
      tab: 0,
    };
  },
  computed: {
    ...mapState(useProfileStore, ['isReadOnly']),
    ...mapState(useShiftviewTimelineStore, ['yellowRanges']),
    ...mapState(useStationStore, ['lineviewStation']),
    ...mapState(usePerfCommentStore, ['perfCommentsRealMap', 'perfCommentGroupsRealMap']),
    ...mapState(usePositionStore, ['positionsRealMap']),
    ...mapState(useDeviceStore, ['showFullscreenDialogs', 'isMobileView']),
    items() {
      const res = this.yellowRanges.reduce((acc, range) => {
        if (this.tab === 0 && range.perfLossCommentId !== 0) return acc;
        if (this.tab === 1 && range.perfLossCommentId === 0) return acc;
        const comment = this.perfCommentsRealMap.get(range.perfLossCommentId);
        const groupId = comment?.groupId;
        const firstSlice = range.yellowSlices[0];
        acc.push({
          ...range,
          stopGroupName: this.perfCommentGroupsRealMap.get(groupId)?.name,
          locationName: firstSlice.perfLossPositionId ? this.positionsRealMap.get(firstSlice.perfLossPositionId)?.name : '',
          durationString: this.getDurationString(range),
          count: range.yellowSlices.length,
          notes: firstSlice.perfLossNotes,
        });
        return acc;
      }, []);
      return res;
    },
    subtitleItemsProps() {
      return [
        { text: this.$t('Group'), valueKey: 'stopGroupName' },
        { text: this.$t('Machine location'), valueKey: 'locationName' },
        { text: this.$t('Count'), valueKey: 'count' },
        { text: this.$t('Duration'), valueKey: 'durationString' },
      ];
    },
    tabs() {
      return [
        {
          key: 'uncommented', name: this.$t('Uncommented'), ranges: this.yellowRanges.filter((range) => range.perfLossCommentId === 0),
        },
        {
          key: 'commented', name: this.$t('Commented'), ranges: this.yellowRanges.filter((range) => range.perfLossCommentId !== 0),
        },
      ];
    },
  },
  watch: {
    items(val) {
      if (val.length === 0) {
        this.tab = this.tab === 0 ? 1 : 0;
      }
    },
  },
  mounted() {
    if (this.items.length === 0) {
      this.tab = 1;
    }
  },
  methods: {
    ...mapActions(useGenericDialogStore, ['closeDialog', 'openDialog']),
    ...mapActions(useConfirmDialogStore, ['openConfirmDialog']),
    ...mapActions(useGenericNotificationStore, ['notifyDeleted', 'notifyError']),
    ...mapActions(useShiftviewSelectionStore, ['selectSlice']),
    onDeleteComment(item) {
      const confirmDialogConfig = {
        title: this.$t('Confirmation'),
        text: this.$t('Are you sure you want to delete this speed loss reason?'),
        action: () => {
          this.deleteComment(item);
        },
        confirmText: this.$t('Delete'),
        cancelText: this.$t('Cancel'),
      };
      this.openConfirmDialog(confirmDialogConfig);
    },
    editSpeedLossReason({ item }) {
      this.selectSlice({ ...item, isYellowRange: true });
      this.openDialog(shiftviewDialogs.COMMENT_SPEED_LOSS);
    },
    async deleteComment({ item }) {
      const eventTime = DateTime.fromISO(item.yellowSlices[0].perfLossTimelineStart).toFormat('yyyyMMddHHmmssZZZ');
      const response = await performanceCommentApi.deleteTimelinePerformanceComment(this.lineviewStation.id, eventTime);
      if (response.success) {
        this.notifyDeleted(this.perfCommentsRealMap.get(item.perfLossCommentId).name);
      } else {
        this.notifyError(response.message);
      }
    },
    getDurationString(range) {
      let duration = 0;
      range.yellowSlices.forEach((slice) => {
        duration += slice.yellowDuration;
      });
      return humanizeDuration(duration);
    },
    formatTimeInZone(time) {
      return formatTimeInZone(time, this.lineviewStation.zoneId);
    },
    getTabDuration(tab) {
      let duration = 0;
      tab.ranges.forEach((range) => {
        range.yellowSlices.forEach((slice) => {
          duration += slice.yellowDuration;
        });
      });
      return humanizeDuration(duration);
    },
    getTitleText(range) {
      const comment = this.perfCommentsRealMap.get(range.perfLossCommentId);
      return `${this.formatTimeInZone(range.yellowSlices[0].sliceStartTmISO)} - ${this.formatTimeInZone(range.yellowSlices[range.yellowSlices.length - 1].yellowEnd)} — ${comment?.name}`;
    },
  },
};
</script>

<style lang="scss" scoped>
.card-list {
  max-height: calc(var(--app-height) * 0.9px - 142px);
  overflow-y: auto;

  &--tablet {
    max-height: calc(var(--app-height) * 1px - 180px);
  }

  &--mobile {
    max-height: calc(var(--app-height) * 1px - 164px);
  }
}
</style>
