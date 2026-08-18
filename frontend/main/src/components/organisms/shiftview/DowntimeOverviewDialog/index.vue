<template>
  <div>
    <dialog-toolbar
      :title="$t('Downtime overview')"
      :title-icon="mdiHelpCircleOutline"
      icon-color="lw-red"
    />
    <v-card-text class="px-4 py-0">
      <generic-tabs-row
        v-model="tab"
        :items="tabs"
        :height="48"
        label-key="name"
        :disabled-rule-func="(tab) => isTabDisabled(tab)"
        :count-func="(tab) => getTabCount(tab)"
      >
        <template #append="{ currentTab }">
          <div
            class="text-body-medium"
            :class="{ 'text-secondary-text': !isTabDisabled(currentTab) }"
          >
            {{ calculateDowntimeDurationSum(currentTab) }}
          </div>
        </template>
      </generic-tabs-row>
      <v-window
        v-model="tab"
        class="overflow-visible"
      >
        <v-window-item
          v-for="(t) in tabs"
          :key="`tab-item-${t.key}`"
        >
          <shiftview-cards-list
            :items="groupedDowntimeSlices"
            :disabled="isReadOnly"
            :title-text-key="getTitleText"
            :subtitle-items-props="getSubtitleItemsProps"
            :additional-line-props="{ icon: mdiMessageReply, valueKey: 'notes' }"
            class="card-list mx-n4 px-4 pt-4 align-content-start"
            :dense="isMobileView"
            :class="{ 'card-list--mobile': isMobileView, 'card-list--tablet': showFullscreenDialogs && !isMobileView }"
            :border-color-key="(item) => getBorderColor(item.slices[0])"
            :title-icon-fn="(item) => isJoinedStop(item) ? mdiLink : ''"
            :tertiary-action-icon="(item) => isJoinedStop(item) ? mdiLinkOff : ''"
            :tertiary-action-tooltip="$t('Unjoin')"
            :secondary-action-icon="tab === 0 ? '' : mdiDelete"
            @item-clicked="editComment"
            @primary-action="editComment"
            @secondary-action="onDeleteComment"
            @tertiary-action="onUnjoinComment"
          >
            <template #expansion-btn="{ item, i }">
              <evocon-v-button
                v-if="item.slices[0].joinId"
                :icon="openedCards.includes(i) ? mdiChevronUp : mdiChevronDown"
                class="ml-2 my-auto"
                @click.stop="onCollapseClick(i)"
              />
            </template>
            <template #expansion-content="{ item, i }">
              <v-expand-transition v-if="item.slices[0].joinId">
                <div v-show="openedCards.includes(i)" class="mb-n2 mx-n4">
                  <v-divider class="my-2" />
                  <div v-for="(slice, j) in item.slices" :key="`joined-item-${j}`" class="ml-8 mb-2">
                    <div class="d-flex align-center">
                      <span class="text-body-small">{{ getFormattedTime(slice.sliceStartTmISO) }} - {{ getFormattedTime(slice.sliceEndTmISO) }}</span>
                      <list-item-subtitle-content
                        v-if="slice.positionId"
                        class="d-flex align-center ml-4"
                        :title="$t('Machine location')"
                        :primary-value="positionsRealMap.get(slice.positionId)?.name"
                      />
                      <list-item-subtitle-content
                        class="d-flex align-center ml-4"
                        :title="$t('Duration')"
                        :primary-value="getFormattedDuration(slice.duration)"
                      />
                    </div>
                    <list-item-subtitle-content
                      v-if="slice.notes"
                      class="d-flex my-1"
                      :icon="mdiMessageReply"
                      :primary-value="slice.notes"
                    />
                    <v-divider
                      v-if="j !== item.slices.length - 1"
                      class="mt-1"
                    />
                  </div>
                </div>
              </v-expand-transition>
            </template>
          </shiftview-cards-list>
        </v-window-item>
      </v-window>
    </v-card-text>
    <v-card-actions
      :class="{ 'fullscreen-card-actions': showFullscreenDialogs }"
    >
      <v-spacer />
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
import {
  mdiHelpCircleOutline, mdiDelete, mdiPencil, mdiMessageReply, mdiLink, mdiLinkOff, mdiChevronUp, mdiChevronDown,
} from '@mdi/js';
import { mapState, mapActions } from 'pinia';

import {
  useProfileStore, useDeviceStore, useShiftviewTimelineStore, useStationStore,
  useShiftStore, useCommentStore, usePositionStore, useGenericDialogStore,
  useConfirmDialogStore, useGenericNotificationStore, useShiftviewSelectionStore,
} from '@/stores/index';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import GenericTabsRow from '@/components/molecules/GenericTabsRow/index.vue';
import ShiftviewCardsList from '@/components/organisms/shiftview/ShiftviewCardsList/index.vue';
import humanizeDuration from '@/helpers/time/humanizeDuration';
import commentApi from '@/api/commentApi';
import shiftviewDialogs from '@/constants/dialogConfigs';
import DialogToolbar from '@/components/atoms/DialogToolbar/index.vue';
import ListItemSubtitleContent from '@/components/atoms/ListItemSubtitleContent/index.vue';
import { formatTimeInZone } from '@/helpers/time/formatTime';

const icons = {
  mdiHelpCircleOutline, mdiDelete, mdiPencil, mdiMessageReply, mdiLink, mdiLinkOff, mdiChevronUp, mdiChevronDown,
};
export default {
  name: 'DowntimeOverviewDialog',
  components: {
    EvoconVButton,
    GenericTabsRow,
    ShiftviewCardsList,
    DialogToolbar,
    ListItemSubtitleContent,
  },
  data() {
    return {
      ...icons,
      tab: 0,
      openedCards: [],
    };
  },
  computed: {
    ...mapState(useProfileStore, ['isReadOnly']),
    ...mapState(useDeviceStore, ['showFullscreenDialogs', 'isMobileView']),
    ...mapState(useShiftviewTimelineStore, ['slicesByType']),
    ...mapState(useStationStore, ['lineviewStation']),
    ...mapState(useShiftStore, ['shift']),
    ...mapState(useCommentStore, ['commentsRealMap', 'commentGroupsRealMap']),
    ...mapState(usePositionStore, ['positionsRealMap']),
    ...mapState(useGenericDialogStore, ['dialogData']),
    tabs() {
      return [
        {
          key: 'uncommented', name: this.$t('Uncommented'), count: this.slicesByType.uncommented.length,
        },
        {
          key: 'commented', name: this.$t('Unplanned'), count: this.getTabItemsCount(this.slicesByType.commented),
        },
        {
          key: 'planned', name: this.$t('Planned'), count: this.getTabItemsCount(this.slicesByType.planned),
        },
      ];
    },
    groupedDowntimeSlices() {
      // eslint-disable-next-line sonarjs/cognitive-complexity
      return Object.values(this.slicesByType[this.tabs[this.tab].key].reduce((acc, obj) => {
        const key = obj.joinId ? obj.joinId : obj.sliceStartTmISO;
        const comment = this.commentsRealMap.get(obj.commentId);
        if (!acc[key]) {
          if (obj.joinId) acc[key] = { slices: [], locationsCount: 0, notesCount: 0 };
          else acc[key] = { slices: [] };
        }
        if (!acc[key].stopName) acc[key].stopName = comment?.name || '';
        if (!acc[key].stopGroupName) acc[key].stopGroupName = comment?.id ? this.commentGroupsRealMap.get(comment.groupId)?.name : '';
        if (!acc[key].includeInOeeString) acc[key].includeInOeeString = obj.type === 'STANDBY' ? this.getIncludeInOeeString(obj) : '';
        if (obj.joinId && obj.positionId) {
          acc[key].locationsCount += 1;
        } else {
          acc[key].locationName = this.positionsRealMap.get(obj.positionId)?.name || '';
        }
        if (obj.joinId && obj.notes) {
          acc[key].notesCount += 1;
        } else {
          acc[key].notes = obj.notes || '';
        }
        acc[key].slices.push(obj);
        acc[key].durationString = this.getFormattedDuration(acc[key].slices.reduce((duration, g) => duration + g.duration, 0));
        return acc;
      }, {}));
    },
  },
  watch: {
    groupedDowntimeSlices(val) {
      if (val.length === 0) this.setFirstEnabledTab();
    },
    tab(val) {
      this.updateDialogData({ tab: val });
    },
  },
  mounted() {
    const previouslySelectedTab = this.dialogData.tab;
    if (previouslySelectedTab) this.tab = previouslySelectedTab;
    else this.setFirstEnabledTab();
  },
  methods: {
    ...mapActions(useGenericDialogStore, ['closeDialog', 'openDialog', 'updateDialogData']),
    ...mapActions(useConfirmDialogStore, ['openConfirmDialog']),
    ...mapActions(useGenericNotificationStore, ['notifyDeleted', 'notifyError', 'notifySuccess']),
    ...mapActions(useShiftviewSelectionStore, ['selectSlice']),
    getTabItemsCount(items) {
      return new Set(items.map((item) => item.joinId || item.sliceStartTmISO)).size;
    },
    getBorderColor(slice) {
      if (!slice.commentId) return 'lw-red';
      if (slice.type === 'STANDBY' && slice.includeInOee) return 'secondary-dark';
      if (slice.type === 'STANDBY') return 'lw-gray';
      return 'lw-dark-red';
    },
    getTitleText(item) {
      const firstSliceStartTime = this.getFormattedTime(item.slices[0].sliceStartTmISO);
      if (item.slices.length > 1) {
        const lastSliceEndTime = this.getFormattedTime(item.slices[item.slices.length - 1].sliceEndTmISO);
        return `${firstSliceStartTime} — ${lastSliceEndTime} — ${item.stopName}`;
      }
      return `${firstSliceStartTime} — ${item.stopName}`;
    },
    getIncludeInOeeString(item) {
      if (item.includeInOee) return this.$t('Included');
      return this.$t('Excluded');
    },
    getFormattedTime(time) {
      return formatTimeInZone(time, this.lineviewStation.zoneId);
    },
    getFormattedDuration(duration) {
      return humanizeDuration(duration, { largest: 'hour' });
    },
    getSubtitleItemsProps(item) {
      return [
        { text: this.$t('Group'), valueKey: 'stopGroupName' },
        { text: this.$t('Machine location'), valueKey: item.locationName ? 'locationName' : 'locationsCount' },
        { text: this.$t('Duration'), valueKey: 'durationString' },
        { text: this.$t('OEE calculation'), valueKey: 'includeInOeeString' },
        { icon: mdiMessageReply, valueKey: 'notesCount' },
      ];
    },
    isJoinedStop(item) {
      return item.slices[0].joinId;
    },
    async onUnjoinComment({ item }) {
      const slices = item.slices.map((slice) => ({
        commentId: slice.commentId,
        startTimeISO: slice.sliceStartTmISO,
        endTimeISO: slice.sliceEndTmISO,
        positionId: slice.positionId,
        notes: slice.notes,
      }));
      try {
        await commentApi.saveComment(this.lineviewStation.id, this.shift.id, slices);
        this.notifySuccess(this.$t('{stopReason} unjoined', { stopReason: item.stopName }));
      } catch (error) {
        this.notifyError(error.message);
      }
    },
    onDeleteComment({ item }) {
      const confirmDialogConfig = {
        title: this.$t('Confirmation'),
        text: this.$t('Are you sure you want to delete this production stop reason?'),
        action: () => {
          this.deleteComment(item);
        },
        confirmText: this.$t('Delete'),
        cancelText: this.$t('Cancel'),
      };
      this.openConfirmDialog(confirmDialogConfig);
    },
    calculateDowntimeDurationSum(tab) {
      const items = this.slicesByType[tab.key];
      const duration = items.map((item) => item.duration).reduce((a, b) => a + b, 0);
      return this.getFormattedDuration(duration);
    },
    editComment({ item }) {
      this.selectSlice(item.slices[0]);
      this.openDialog(shiftviewDialogs.COMMENT_DOWNTIME);
    },
    async deleteComment(item) {
      const slices = item.slices.map((slice) => ({
        commentId: 0,
        startTimeISO: slice.sliceStartTmISO,
        endTimeISO: slice.sliceEndTmISO,
        positionId: 0,
        notes: '',
      }));
      const response = await commentApi.saveComment(this.lineviewStation.id, this.shift.id, slices);
      if (response.success) this.notifyDeleted(item.stopName);
      else this.notifyError(response.message);
    },
    setFirstEnabledTab() {
      this.tab = this.tabs.findIndex((tab) => tab.count > 0);
    },
    getTabCount(tab) {
      return tab.count;
    },
    isTabDisabled(tab) {
      return tab.count === 0;
    },
    onCollapseClick(id) {
      if (this.openedCards.includes(id)) {
        this.openedCards = this.openedCards.filter((i) => i !== id);
      } else {
        this.openedCards.push(id);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.card-list {
  max-height: calc(var(--app-height) * 0.9px - 214px) ;
  overflow-y: auto;

  &--tablet {
    max-height: calc(var(--app-height) * 1px - 172px);
  }

  &--mobile {
    max-height: calc(var(--app-height) * 1px - 156px);
  }
}
</style>
