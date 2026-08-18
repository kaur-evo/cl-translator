<template>
  <div>
    <dialog-toolbar
      id="dialog-toolbar"
      :title="$t('Checklists')"
      :title-icon="mdiPlaylistCheck"
      icon-color="lw-green"
    />
    <v-card-text class="py-0">
      <generic-tabs-row
        v-model="tab"
        :items="statuses"
        :height="isMobileView ? 40 : 48"
        :disabled-rule-func="isTabDisabled"
        label-key="name"
      />
      <info-block
        v-if="hasActiveFilters"
        :body="$t('Some checklists may be hidden, filters applied in View Settings')"
        :icon="mdiInformationOutline"
        class="mt-2 mb-n2"
      />
      <shiftview-cards-list
        v-if="filteredChecklists.length"
        id="checklists-items-list"
        :items="filteredChecklists"
        :selectable="true"
        title-text-key="name"
        :subtitle-items-props="subtitleItemsProps"
        border-color-key="borderColor"
        class="card-list mx-n4 px-4 pt-4"
        :dense="isMobileView"
        :class="{
          'card-list--mobile': isMobileView,
          'card-list--tablet': showFullscreenDialogs && !isMobileView,
        }"
        :secondary-action-icon="getSecondaryActionIcon"
        :secondary-action-tooltip="$t('Delete')"
        :primary-action-icon="getPrimaryActionIcon"
        :primary-action-text="getPrimaryActionText"
        :primary-action-tooltip="isReadOnly ? $t('View') : $t('Edit')"
        @item-clicked="openEditDialog"
        @secondary-action="onDeleteChecklist"
        @primary-action="openEditDialog"
      />
      <empty-view
        v-else
        id="empty-state"
        :header="$t('No checklists')"
        img-url="checklists"
        :img-width="isMobileView ? '210px' : '340px'"
        :small="isMobileView"
      />
    </v-card-text>
    <v-card-actions
      :class="{ 'fullscreen-card-actions': showFullscreenDialogs }"
    >
      <evocon-v-button
        v-if="canStartManualChecklist"
        id="add-manual-checklist"
        type="primary-light"
        :icon="mdiPlus"
        :text="$t('Checklist')"
        class="mr-4"
        @click="onAddNewChecklist"
      />
      <v-spacer />
      <evocon-v-button
        id="overview-close-btn"
        type="secondary"
        :text="$t('Close')"
        @click="closeDialog"
      />
    </v-card-actions>
  </div>
</template>

<script>
import {
  mdiPencil, mdiMessageReply, mdiPlaylistCheck, mdiPlus, mdiDraw, mdiChevronRight, mdiDelete, mdiImageOutline,
  mdiInformationOutline,
} from '@mdi/js';
import { DateTime } from 'luxon';
import { mapState, mapActions } from 'pinia';

import {
  useProfileStore, useDeviceStore, useChecklistTaskStore, useStationStore,
  useChecklistTemplateStore, useShiftviewTimelineStore, useShiftStore,
  useUserPreferencesStore, useGenericDialogStore, useProductStore,
  useGenericNotificationStore, useConfirmDialogStore,
} from '@/stores/index';
import ShiftviewCardsList from '@/components/organisms/shiftview/ShiftviewCardsList/index.vue';
import { checklistStatuses, checkStatusColors } from '@/constants/checklistsConstants';
import { SHIFT_HISTORY_VISIBLE_DAYS } from '@/constants/shiftviewPinConstants';
import { formatTimeInZone } from '@/helpers/time/formatTime';
import { getCheckTasksFilledString } from '@/helpers/checklist/checkTasksFilledCalculations';
import getChecklistFrequencyStrings from '@/helpers/checklist/getChecklistFrequencyStrings';
import EmptyView from '@/components/atoms/EmptyView/index.vue';
import shiftviewDialogs from '@/constants/dialogConfigs';
import checklistEditDialogConfig from '@/constants/shiftviewDialogConfigs/checklistEditDialogConfig';
import DialogToolbar from '@/components/atoms/DialogToolbar/index.vue';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import { getSubmissionTime } from '@/helpers/checklist/getSubmissionTime';
import GenericTabsRow from '@/components/molecules/GenericTabsRow/index.vue';
import InfoBlock from '@/components/atoms/InfoBlock/index.vue';
import filterVisibleChecklists from '@/helpers/checklist/filterVisibleChecklists';


const icons = {
  mdiPencil, mdiMessageReply, mdiPlaylistCheck, mdiPlus, mdiDraw, mdiChevronRight, mdiImageOutline,
  mdiInformationOutline,
};

export default {
  name: 'ChecklistOverviewDialog',
  components: {
    ShiftviewCardsList,
    EmptyView,
    DialogToolbar,
    EvoconVButton,
    GenericTabsRow,
    InfoBlock,
  },
  data() {
    return {
      ...icons,
      tab: 0,
    };
  },
  computed: {
    ...mapState(useProfileStore, ['isReadOnly', 'shiftviewStationRoleAllows']),
    ...mapState(useDeviceStore, ['showFullscreenDialogs', 'isMobileView']),
    ...mapState(useChecklistTaskStore, ['checklistTasks']),
    ...mapState(useStationStore, ['lineviewStation']),
    ...mapState(useChecklistTemplateStore, ['shiftviewStationManualTemplates']),
    ...mapState(useShiftviewTimelineStore, ['currentBatch']),
    ...mapState(useShiftStore, ['shift', 'isShiftRunning']),
    ...mapState(useUserPreferencesStore, ['viewSettings']),
    hasActiveFilters() {
      if (!this.lineviewStation?.id) return false;
      const stationId = String(this.lineviewStation.id);
      const map = this.viewSettings.visibleChecklistIdsByStation;
      // Filters active only when station has specific IDs (not empty array = all selected)
      return map && stationId in map && map[stationId].length > 0;
    },
    visibleChecklistTasks() {
      if (!this.lineviewStation?.id) {
        return this.checklistTasks;
      }
      return filterVisibleChecklists(
        this.checklistTasks,
        this.viewSettings.visibleChecklistIdsByStation,
        this.lineviewStation.id,
      );
    },
    filteredChecklists() {
      const activeStatus = this.statuses[this.tab].id;
      const filtered = activeStatus === 'ALL'
        ? this.visibleChecklistTasks
        : this.visibleChecklistTasks.filter((el) => el.status === activeStatus);
      const result = filtered.map((el) => ({
        ...el,
        dueString: formatTimeInZone(el.dateTimeISO, this.lineviewStation.zoneId),
        tasksFilledString: getCheckTasksFilledString(el),
        frequencyString: getChecklistFrequencyStrings(el.frequency),
        borderColor: checkStatusColors[el.status],
        doneString: getSubmissionTime(el, this.lineviewStation.zoneId),
        commentsCount: el.elements.filter((e) => e.comment?.length).length,
      }));
      return result.reverse();
    },
    checksProductIds() {
      return this.checklistTasks.reduce((acc, check) => {
        if (check.frequency.productIds.length) {
          acc.push(check.frequency.productIds[0]);
        }
        return acc;
      }, []);
    },
    mappedChecklistTasks() {
      return this.visibleChecklistTasks.reduce((acc, check) => {
        if (!(check.status in acc)) acc[check.status] = [];
        acc[check.status].push(check);
        return acc;
      }, {});
    },
    statuses() {
      return [{
        name: `${this.$t('New')} (${this.mappedChecklistTasks[checklistStatuses.NEW]?.length || 0})`,
        id: checklistStatuses.NEW,
        count: this.mappedChecklistTasks[checklistStatuses.NEW]?.length || 0,
      },
      {
        name: `${this.$t('Successful')} (${this.mappedChecklistTasks[checklistStatuses.SUCCESSFUL]?.length || 0})`,
        id: checklistStatuses.SUCCESSFUL,
        count: this.mappedChecklistTasks[checklistStatuses.SUCCESSFUL]?.length || 0,
      },
      {
        name: `${this.$t('Unsuccessful')} (${this.mappedChecklistTasks[checklistStatuses.UNSUCCESSFUL]?.length || 0})`,
        id: checklistStatuses.UNSUCCESSFUL,
        count: this.mappedChecklistTasks[checklistStatuses.UNSUCCESSFUL]?.length || 0,
      },
      {
        name: `${this.$t('Missed')} (${this.mappedChecklistTasks[checklistStatuses.MISSED]?.length || 0})`,
        id: checklistStatuses.MISSED,
        count: this.mappedChecklistTasks[checklistStatuses.MISSED]?.length || 0,
      },
      {
        name: `${this.$t('All')} (${this.visibleChecklistTasks.length})`,
        id: 'ALL',
        count: this.visibleChecklistTasks.length,
      }];
    },
    canStartManualChecklist() {
      if (this.isReadOnly) return false;
      const now = DateTime.local().setZone(this.lineviewStation.zoneId);
      const shiftEnd = DateTime.fromISO(this.shift.endTimeISO, { zoneId: this.lineviewStation.zoneId });
      const diffInDays = now.diff(shiftEnd, 'days').toObject().days;
      return diffInDays <= SHIFT_HISTORY_VISIBLE_DAYS;
    },
    subtitleItemsProps() {
      return [
        { icon: mdiDraw, valueKey: 'doneBy' },
        { text: this.$t('Due'), valueKey: 'dueString' },
        { text: this.$t('Done'), valueKey: 'doneString' },
        { text: this.$t('Tasks filled'), valueKey: 'tasksFilledString' },
        { text: this.$t('Frequency'), valueKey: 'frequencyString' },
        { icon: mdiMessageReply, valueKey: 'commentsCount' },
        { icon: mdiImageOutline, valueKey: 'fileCount' },
      ];
    },
  },
  mounted() {
    if (this.statuses[0].count === 0) this.tab = 4;
    if (this.checksProductIds.length) this.fetchProducts({ id: this.checksProductIds });
  },
  methods: {
    ...mapActions(useGenericDialogStore, ['closeDialog', 'openDialog']),
    ...mapActions(useProductStore, ['fetchProducts']),
    ...mapActions(useGenericNotificationStore, ['notifyWarning']),
    ...mapActions(useConfirmDialogStore, ['openConfirmDialog']),
    ...mapActions(useChecklistTaskStore, ['deleteChecklistTask']),
    openEditDialog({ item }) {
      this.openDialog({ ...checklistEditDialogConfig, data: { item } });
    },
    onAddNewChecklist() {
      const availableChecklists = this.getCurrentProductManualChecklists();
      if (availableChecklists.length === 0) this.notifyWarning({ text: this.$t('No manual checklists available') });
      else {
        const time = this.isShiftRunning
          ? DateTime.local().setZone(this.lineviewStation.zoneId).toISO()
          : DateTime.fromISO(this.shift.endTimeISO).minus({ seconds: 1 }).toISO();
        this.openDialog({
          ...shiftviewDialogs.MANUAL_CHECKLIST,
          data: {
            templates: availableChecklists,
            time,
          },
        });
      }
    },
    onDeleteChecklist({ item }) {
      const dialogConfig = {
        title: this.$t('Confirmation'),
        text: this.$t('Are you sure you want to delete this checklist?'),
        action: () => this.deleteChecklistTask(item),
        confirmText: this.$t('Delete'),
        cancelText: this.$t('Cancel'),
      };
      this.openConfirmDialog(dialogConfig);
    },
    getCurrentProductManualChecklists() {
      return this.shiftviewStationManualTemplates.filter((template) => template.frequency.productIds.length === 0 || template.frequency.productIds.includes((this.currentBatch.productId)));
    },
    isTabDisabled(tab) {
      return tab.count === 0;
    },
    getSecondaryActionIcon(check) {
      if (this.shiftviewStationRoleAllows('deleteChecklist') && (check.status === checklistStatuses.SUCCESSFUL || check.status === checklistStatuses.UNSUCCESSFUL)) return mdiDelete;
      return '';
    },
    getPrimaryActionIcon(check) {
      if (this.isReadOnly) return mdiChevronRight;
      if (check.status === checklistStatuses.NEW) return '';
      return mdiPencil;
    },
    getPrimaryActionText(check) {
      if (this.isReadOnly) return '';
      return check.status === checklistStatuses.NEW ? this.$t('Start_verb') : '';
    },
  },
};
</script>

<style lang="scss" scoped>
.card-list {
  max-height: calc(var(--app-height) * 0.9px - 214px);
  overflow-y: auto;

  &--tablet {
    max-height: calc(var(--app-height) * 1px - 172px);
  }
  &--mobile {
    max-height: calc(var(--app-height) * 1px - 156px);
  }
}
</style>
