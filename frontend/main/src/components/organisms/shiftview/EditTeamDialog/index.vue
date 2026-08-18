<template>
  <div>
    <dialog-toolbar
      :title-icon="mdiAccountHardHat"
      :title="$t('Operators')"
    />
    <empty-view
      v-if="shiftviewStationOperators.length === 0"
      :header="$t('No operators available.')"
      :description="settingsAllowed ? $t('To add operators for this station, please go to operator settings.') : $t('Please contact your administrator.')"
      :primary-btn="settingsAllowed ? $t('Go to settings') : ''"
      img-url="operators"
      :small="isMobileView"
      class="dialog-content"
      :class="{ 'px-2 pt-0 pb-2 ': isMobileView }"
      @button-clicked="goToSettings"
    />
    <v-card-text v-else class="pb-0 dialog-content">
      <evocon-v-input
        v-model="searchString"
        :prepend-inner-icon="mdiMagnify"
        :placeholder="$t('Search')"
        hide-details
        clearable
        :density="isMobileView ? 'compact' : 'default'"
      />
      <v-form
        ref="form"
        v-model="valid"
        @submit="saveTeam"
      >
        <div
          class="mt-2 operator-select"
          :class="{
            'operator-select--mobile': isMobileView,
            'operator-select--tablet': !isMobileView && showFullscreenDialogs,
          }"
        >
          <evocon-v-checkbox
            v-for="operator in filteredOperators"
            :key="`operator-${operator.id}`"
            v-model="formData.operatorIds"
            :true-value="operator.id"
            class="px-4"
            :class="isMobileView ? 'my-2' : 'my-4'"
            hide-details
            :density="isMobileView ? 'compact' : 'default'"
            :label="operator.name"
          />
        </div>
        <v-row class="mt-4">
          <v-col
            cols="12"
            sm="6"
            class="mb-2"
          >
            <evocon-time-input
              v-model="startTime"
              :hint="$t('Start time')"
              :rules="[startTimeRule]"
              class="mr-sm-1"
              :density="isMobileView ? 'compact' : 'default'"
              @update:model-value="setTime('startTimeISO', $event)"
            />
          </v-col>
          <v-col
            cols="12"
            sm="6"
            class="mb-2"
          >
            <evocon-time-input
              v-model="endTime"
              :hint="$t('End time')"
              :rules="[endTimeRule]"
              class="ml-sm-1"
              :density="isMobileView ? 'compact' : 'default'"
              @update:model-value="setTime('endTimeISO', $event)"
            />
          </v-col>
        </v-row>
      </v-form>
    </v-card-text>
    <v-card-actions
      class="justify-end"
      :class="{ 'fullscreen-card-actions': showFullscreenDialogs }"
    >
      <evocon-v-button
        :text="shiftviewStationOperators.length ? $t('Cancel') : $t('Close')"
        type="secondary"
        @click="close"
      />
      <evocon-v-button
        v-if="shiftviewStationOperators.length"
        :text="$t('Save')"
        color="primary"
        :loading="saveLoading"
        :disabled="isSaveBtnDisabled"
        @click="onSave"
      />
    </v-card-actions>
  </div>
</template>

<script>
import { mdiAccountHardHat, mdiMagnify } from '@mdi/js';
import { isEqual } from 'lodash';
import { DateTime } from 'luxon';
import { mapState, mapActions } from 'pinia';

import {
  useGenericDialogStore, useOperatorStore, useShiftStore, useStationStore,
  useShiftviewTimelineStore, useDeviceStore, useProfileStore, useGenericNotificationStore,
} from '@/stores/index';
import EmptyView from '@/components/atoms/EmptyView/index.vue';
import EvoconVInput from '@/components/atoms/EvoconVInput/index.vue';
import EvoconTimeInput from '@/components/atoms/EvoconTimeInput/index.vue';
import operatorApi from '@/api/operatorApi';
import DialogToolbar from '@/components/atoms/DialogToolbar/index.vue';
import validateTeams from '@/helpers/teams/validateTeams';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import EvoconVCheckbox from '@/components/atoms/EvoconVCheckbox/index.vue';
import { eventBus } from '@/eventBus';

const icons = { mdiAccountHardHat, mdiMagnify };

export default {
  name: 'EditTeamDialog',
  components: {
    EmptyView, EvoconVInput, DialogToolbar, EvoconTimeInput, EvoconVButton, EvoconVCheckbox,
  },
  data() {
    return {
      ...icons,
      searchString: '',
      valid: true,
      saveLoading: false,
      startTime: '',
      endTime: '',
      formData: {
        operatorIds: [],
        startTimeISO: undefined,
        endTimeISO: undefined,
      },
    };
  },
  computed: {
    ...mapState(useGenericDialogStore, ['dialogData', 'previousState']),
    ...mapState(useOperatorStore, ['shiftviewStationOperators']),
    ...mapState(useShiftStore, ['shift']),
    ...mapState(useStationStore, ['lineviewStation']),
    ...mapState(useShiftviewTimelineStore, ['teamTimeline']),
    ...mapState(useDeviceStore, ['showFullscreenDialogs', 'isMobileView']),
    ...mapState(useProfileStore, ['highestRoleAllows']),
    filteredOperators() {
      if (!this.searchString) return this.shiftviewStationOperators;
      return this.shiftviewStationOperators.filter((operator) => operator.name.toLowerCase().includes(this.searchString.toLowerCase()));
    },
    shiftOverlapsMidnight() {
      const shiftStart = DateTime.fromISO(this.shift.startTimeISO, { zone: this.lineviewStation.zoneId });
      const shiftEnd = DateTime.fromISO(this.shift.endTimeISO, { zone: this.lineviewStation.zoneId });
      return shiftStart.startOf('day').toISO() !== shiftEnd.startOf('day').toISO();
    },
    isStartTimeValid() {
      if (!this.startTime) return false;
      if (!this.formData.endTimeISO) return true;
      if (this.formData.startTimeISO) {
        const startTime = DateTime.fromISO(this.formData.startTimeISO, { zone: this.lineviewStation.zoneId });
        const endTime = DateTime.fromISO(this.formData.endTimeISO, { zone: this.lineviewStation.zoneId });
        const shiftStart = DateTime.fromISO(this.shift.startTimeISO, { zone: this.lineviewStation.zoneId });
        return startTime < endTime && startTime >= shiftStart;
      }
      return false;
    },
    isEndTimeValid() {
      if (!this.endTime) return false;
      if (!this.formData.startTimeISO) return true;
      if (this.formData.endTimeISO) {
        const startTime = DateTime.fromISO(this.formData.startTimeISO, { zone: this.lineviewStation.zoneId });
        const endTime = DateTime.fromISO(this.formData.endTimeISO, { zone: this.lineviewStation.zoneId });
        const shiftEnd = DateTime.fromISO(this.shift.endTimeISO, { zone: this.lineviewStation.zoneId });
        return startTime < endTime && endTime <= shiftEnd;
      }
      return false;
    },
    settingsAllowed() {
      return this.highestRoleAllows('settings');
    },
    isSaveBtnDisabled() {
      if (!this.formData.operatorIds.length || this.saveLoading || !this.isStartTimeValid || !this.isEndTimeValid) return true;
      const isSameStartTime = this.formData.startTimeISO === this.dialogData.startTimeISO;
      const isSameEndTime = this.formData.endTimeISO === this.dialogData.endTimeISO;
      const areSameOperatorIds = isEqual(this.formData.operatorIds, this.dialogData.operatorIds);
      return isSameStartTime && isSameEndTime && areSameOperatorIds;
    },
  },
  mounted() {
    this.setFormData();
    this.startTime = this.displayTime(this.formData.startTimeISO);
    this.endTime = this.displayTime(this.formData.endTimeISO);
  },
  methods: {
    ...mapActions(useGenericDialogStore, ['closeDialog', 'openPreviousDialog']),
    ...mapActions(useGenericNotificationStore, ['notifySuccess', 'notifyError']),
    startTimeRule() {
      return this.isStartTimeValid || this.$t('Start time');
    },
    endTimeRule() {
      return this.isEndTimeValid || this.$t('End time');
    },
    async onSave() {
      if (!this.formData.operatorIds.length || this.saveLoading) return;
      await this.$refs.form.validate();
      if (this.valid) {
        await this.saveTeam();
      }
    },
    async saveTeam() {
      const data = {
        operatorIds: this.formData.operatorIds,
        startTimeISO: this.formData.startTimeISO,
        endTimeISO: this.formData.endTimeISO,
      };
      const newTimeline = [...this.teamTimeline];
      if (this.dialogData.order === undefined) { // adding new team
        newTimeline.push(data);
      } else { // editing existing team
        newTimeline[this.dialogData.order] = data;
      }
      const modifiedTeams = validateTeams(newTimeline, this.lineviewStation.zoneId);
      this.saveLoading = true;
      const response = await operatorApi.setTeams(this.lineviewStation.id, modifiedTeams);
      this.saveLoading = false;
      if (response.success) {
        this.close();
        this.notifySuccess(this.$t('Operators saved'));
        eventBus.$emit('team-saved');
      } else {
        this.notifyError(response.message);
      }
    },
    setFormData() {
      const startTimeISO = this.dialogData.startTimeISO ? this.dialogData.startTimeISO : this.getTeamStartTime();
      const endTimeISO = this.dialogData.endTimeISO ? this.dialogData.endTimeISO : this.shift.endTimeISO;
      this.formData.startTimeISO = startTimeISO;
      this.formData.endTimeISO = endTimeISO;
      if (this.dialogData.operatorIds) {
        this.formData.operatorIds = this.dialogData.operatorIds;
      }
    },
    getTeamStartTime() {
      if (this.teamTimeline.length === 0) return this.shift.startTimeISO;
      const lastTeamEnd = this.teamTimeline[this.teamTimeline.length - 1].endTimeISO;
      return lastTeamEnd === this.shift.endTimeISO ? this.shift.startTimeISO : lastTeamEnd;
    },
    setTime(key, input) {
      if (!input) return;
      if (input.length !== 5) return;
      const [hours, minutes] = input.split(':');
      let time = DateTime.fromISO(this.shift[key], { zone: this.lineviewStation.zoneId }).startOf('day').set({ hours, minutes });
      if (this.shiftOverlapsMidnight) {
        const shiftStart = DateTime.fromISO(this.shift.startTimeISO, { zone: this.lineviewStation.zoneId });
        const shiftEnd = DateTime.fromISO(this.shift.endTimeISO, { zone: this.lineviewStation.zoneId });
        if (key === 'startTimeISO' && time < shiftStart) {
          time = time.plus({ days: 1 });
        } else if (key === 'endTimeISO' && time > shiftEnd) {
          time = time.minus({ days: 1 });
        }
      }
      this.formData[key] = time.toISO();
    },
    displayTime(time) {
      return time ? DateTime.fromISO(time, { zone: this.lineviewStation.zoneId }).toFormat('HH:mm') : '';
    },
    close() {
      if (this.previousState.component && this.teamTimeline.length) {
        this.openPreviousDialog();
      } else {
        this.closeDialog();
      }
    },
    goToSettings() {
      const url = `${window.location.origin}/#/settings/operators`;
      window.open(url, '_blank');
    },
  },

};
</script>

<style lang="scss" scoped>
.dialog-content {
  max-height: calc(var(--app-height) * 1px - 116px);
  overflow-y: auto;
}
.operator-select {
  max-height: calc(var(--app-height) * 0.9px - 322px);
  overflow-y: auto;

  &--tablet {
    max-height: calc(var(--app-height) * 1px - 306px);
  }

  &--mobile {
    max-height: calc(var(--app-height) * 1px - 312px);
  }
}
</style>
