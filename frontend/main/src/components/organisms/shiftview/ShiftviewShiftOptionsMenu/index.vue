<template>
  <v-list>
    <v-list-item
      v-for="(item, i) in visibleMenuItems"
      :key="`menu-item${i}`"
      class="list-item--flex pr-8 shift-menu-item"
      @click="onItemClick(item)"
    >
      <v-icon class="mr-8">
        {{ item.icon }}
      </v-icon>
      <v-list-item-title>
        {{ item.name }}
      </v-list-item-title>
    </v-list-item>
  </v-list>
</template>

<script>
import { mapState, mapActions } from 'pinia';
import {
  mdiPowerSettings, mdiPlayCircleOutline, mdiCircleEditOutline, mdiDelete,
} from '@mdi/js';
import { DateTime } from 'luxon';

import {
  useShiftStore, useStationStore, useProfileStore,
  useConfirmDialogStore, useGenericDialogStore, useGenericNotificationStore, useShiftViewStore,
} from '@/stores/index';
import shiftviewDialogs from '@/constants/dialogConfigs';
import shiftApi from '@/api/shiftApi';
import editTeamDialogConfig from '@/constants/shiftviewDialogConfigs/editTeamDialogConfig';
import i18n from '@/services/i18n';

export default {
  name: 'ShiftviewShiftOptionsMenu',
  props: {
    requireOperator: {
      type: Boolean,
    },
  },
  computed: {
    ...mapState(useShiftStore, ['isShiftRunning', 'shift', 'isLastShiftSelected', 'currentShift']),
    ...mapState(useStationStore, ['lineviewStation']),
    ...mapState(useProfileStore, ['shiftviewStationRoleAllows']),
    noShiftMenuItems() {
      return [
        {
          name: this.$t('Start shift'),
          icon: mdiPlayCircleOutline,
          action: this.onStartShift,
          hidden: !this.isLastShiftSelected,
        },
        {
          name: this.$t('Edit shift time'),
          icon: mdiCircleEditOutline,
          action: this.onEditShift,
          hidden: !this.shiftviewStationRoleAllows('editPastShift'),
        },
        {
          name: this.$t('Delete shift'),
          icon: mdiDelete,
          action: this.onDeleteShift,
          hidden: !this.shiftviewStationRoleAllows('deleteShift'),
        },
      ];
    },
    runningShiftItems() {
      return [
        {
          name: this.$t('Edit shift time'),
          icon: mdiCircleEditOutline,
          action: this.onEditShift,
        },
        {
          name: this.$t('Finish shift'),
          icon: mdiPowerSettings,
          action: this.onFinishShift,
        },
      ];
    },
    visibleMenuItems() {
      return this.isShiftRunning ? this.runningShiftItems : this.noShiftMenuItems.filter((item) => !item.hidden);
    },
  },
  methods: {
    ...mapActions(useConfirmDialogStore, ['openConfirmDialog']),
    ...mapActions(useGenericDialogStore, ['openDialog']),
    ...mapActions(useGenericNotificationStore, ['notifySuccess', 'notifyError', 'notifyWarning']),
    ...mapActions(useShiftStore, ['deleteShift', 'fetchCurrentShift']),
    requestOperator() {
      this.openDialog(editTeamDialogConfig);
      this.notifyWarning({ text: i18n.global.t('Please select team first') });
    },
    onFinishShift() {
      const confirmDialogConfig = {
        title: this.$t('Confirmation'),
        text: `${this.$t('Are you sure you want to finish current shift? You cannot undo this action')}!`,
        action: () => {
          this.finishShift();
        },
        confirmText: this.$t('Finish shift'),
        cancelText: this.$t('Cancel'),
      };
      this.openConfirmDialog(confirmDialogConfig);
    },
    onStartShift() {
      this.openDialog(shiftviewDialogs.START_SHIFT);
    },
    onEditShift() {
      this.openDialog(shiftviewDialogs.MODIFY_SHIFT);
    },
    onDeleteShift() {
      const confirmDialogConfig = {
        title: this.$t('Confirmation'),
        text: this.$t('Are you sure you want to delete this shift? You cannot undo this action!'),
        action: () => {
          this.onDeleteShiftAction();
        },
        confirmText: this.$t('Delete'),
        cancelText: this.$t('Cancel'),
      };
      this.openConfirmDialog(confirmDialogConfig);
    },
    async finishShift() {
      const endResponse = await shiftApi.putShift({
        stationId: this.lineviewStation.id,
        shiftId: this.shift.id,
        startTimeISO: this.shift.startTimeISO,
        endTimeISO: DateTime.local().setZone(this.lineviewStation.zoneId).startOf('minute').toISO(),
        eventTimeISO: this.shift.startTimeISO,
      });
      if (endResponse.id) {
        this.notifySuccess(i18n.global.t('Shift finished'));
        const shiftResponse = await shiftApi.getShift(endResponse.id);
        useShiftViewStore().changeShift({ shiftId: shiftResponse.id, stationId: shiftResponse.stationId, force: true });
      } else {
        this.notifyError(endResponse.message);
      }
    },
    async onDeleteShiftAction() {
      await this.deleteShift(this.shift);
      await this.fetchCurrentShift({ stationId: this.lineviewStation.id });
      this.$router.push({ name: 'shiftview', params: { stationId: this.lineviewStation.id, shiftId: this.currentShift.id } });
    },
    onItemClick(item) {
      if (this.requireOperator && this.isShiftRunning) this.requestOperator();
      else item.action();
    },
  },
};
</script>
