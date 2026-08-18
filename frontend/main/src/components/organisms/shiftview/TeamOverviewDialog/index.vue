<template>
  <div>
    <dialog-toolbar
      :title="$t('Operators')"
      :title-icon="mdiAccountHardHat"
    />
    <v-card-text class="py-0">
      <shiftview-cards-list
        :items="teams"
        :title-text-key="'cardTitle'"
        :subtitle-items-props="[{ icon: mdiClockOutline, valueKey: 'time' }]"
        class="card-list"
        :dense="isMobileView"
        :class="{ 'card-list--mobile': isMobileView, 'card-list--tablet': showFullscreenDialogs && !isMobileView }"
        :disabled="isReadOnly"
        @item-clicked="openEditDialog"
        @primary-action="openEditDialog"
        @secondary-action="onRemoveTeam"
      />
    </v-card-text>
    <v-card-actions
      :class="{ 'fullscreen-card-actions': showFullscreenDialogs }"
    >
      <evocon-v-button
        v-if="!isReadOnly"
        id="overview-close-btn"
        :icon="mdiPlus"
        :text="$t('Operators')"
        type="primary-light"
        @click="openEditDialog"
      />
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
  mdiAccountHardHat, mdiPlus, mdiClockOutline,
} from '@mdi/js';
import { DateTime } from 'luxon';
import { mapState, mapActions } from 'pinia';

import {
  useStationStore, useShiftviewTimelineStore, useOperatorStore, useDeviceStore,
  useProfileStore, useConfirmDialogStore, useGenericDialogStore, useGenericNotificationStore,
} from '@/stores/index';
import i18n from '@/services/i18n';
import ShiftviewCardsList from '@/components/organisms/shiftview/ShiftviewCardsList/index.vue';
import operatorApi from '@/api/operatorApi';
import DialogToolbar from '@/components/atoms/DialogToolbar/index.vue';
import { formatTime } from '@/helpers/time/formatTime';
import editTeamDialogConfig from '@/constants/shiftviewDialogConfigs/editTeamDialogConfig';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';

const icons = {
  mdiAccountHardHat, mdiPlus, mdiClockOutline,
};

export default {
  name: 'TeamOverviewDialog',
  components: { ShiftviewCardsList, DialogToolbar, EvoconVButton },
  data() {
    return {
      ...icons,
    };
  },
  computed: {
    ...mapState(useStationStore, ['lineviewStation']),
    ...mapState(useShiftviewTimelineStore, ['teamTimeline']),
    ...mapState(useOperatorStore, ['operatorsRealMap']),
    ...mapState(useDeviceStore, ['showFullscreenDialogs', 'isMobileView']),
    ...mapState(useProfileStore, ['isReadOnly']),
    ...mapState(useConfirmDialogStore, ['confirmPromise']),
    teams() {
      return this.teamTimeline.map((team) => ({
        ...team,
        time: `${formatTime(team.startTime)} - ${formatTime(team.endTime)}`,
        cardTitle: team.operatorIds.map((id) => this.operatorsRealMap.get(id)?.name || '').join(', '),
      }));
    },
  },
  watch: {
    async teamTimeline(newVal) {
      if (newVal.length === 0) {
        await this.confirmPromise;
        this.openEditDialog({});
      }
    },
  },
  methods: {
    ...mapActions(useGenericDialogStore, ['closeDialog', 'openDialog']),
    ...mapActions(useConfirmDialogStore, ['openConfirmDialog']),
    ...mapActions(useGenericNotificationStore, ['notifySuccess', 'notifyError']),
    onRemoveTeam({ item }) {
      const confirmDialogConfig = {
        title: this.$t('Confirmation'),
        text: this.$t('Are you sure you want to remove this team?'),
        action: async () => {
          await this.removeTeam(item);
        },
        confirmText: this.$t('Remove'),
        cancelText: this.$t('Cancel'),
      };
      this.openConfirmDialog(confirmDialogConfig);
    },
    async removeTeam(team) {
      const eventTime = DateTime.fromISO(team.startTimeISO, { zone: this.lineviewStation.zoneId }).plus({ seconds: 1 }).toFormat('yyyyMMddHHmmssZZZ');
      const response = await operatorApi.deleteTeams(this.lineviewStation.id, eventTime);
      if (response.success) {
        this.notifySuccess(i18n.global.t('Operators removed'));
      } else {
        this.notifyError(response.message);
      }
    },
    openEditDialog({ item, i }) {
      this.openDialog({
        ...editTeamDialogConfig,
        data: { ...item, order: i },
      });
    },
  },

};
</script>

<style lang="scss" scoped>
.card-list {
  max-height: calc(var(--app-height) * 0.9px - 148px);
  overflow-y: auto;

  &--tablet {
    max-height: calc(var(--app-height) * 1px - 124px);
  }

  &--mobile {
    max-height: calc(var(--app-height) * 1px - 116px);
  }
}
</style>
