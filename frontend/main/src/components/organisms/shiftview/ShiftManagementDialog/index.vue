<template>
  <shift-management-dialog-toolbar
    :is-start-shift-dialog="isStartShiftDialog"
    :is-shift-start-selection-visible="isShiftStartSelectionVisible"
    @on-back-button-click="onBackButtonClick"
    @on-help-click="openHelp"
  />
  <v-progress-linear
    v-if="loading"
    indeterminate
  />
  <shift-start-selection
    v-else-if="isStartShiftDialog && isShiftStartSelectionVisible && !loading"
    :min-start-from-request="minStartTimeFromLimitsReq"
    :max-start-from-request="maxStartTimeFromLimitsReq"
    :max-end-from-request="maxEndTimeFromLimitsReq"
    :next-shift-start-from-request="nextShiftStartDateTime"
    :next-shift-end-from-request="nextShiftEndDateTime"
    :next-shift-name="nextShiftName"
    @on-shift-start-card-click="onShiftStartSelectionClick"
  />
  <start-planned-shift-content
    v-else-if="isStartShiftDialog && isPlannedShiftStartSelected"
    :start-date="startDate"
    :end-date="endDate"
    :start-time="startTime"
    :end-time="endTime"
    :shift-duration="shiftDuration"
    :min-start-from-request="minStartTimeFromLimitsReq"
    :next-shift-end-from-request="nextShiftEndDateTime"
    @update:start-date="startDate = $event"
    @update:start-time="startTime = $event"
    @update:end-time="endTime = $event"
    @update:save-btn-disabled="isSaveBtnDisabled = $event"
  />
  <start-extra-shift-content
    v-else-if="isStartShiftDialog"
    :start-date="startDate"
    :end-date="endDate"
    :start-time="startTime"
    :end-time="endTime"
    :shift-duration="shiftDuration"
    :min-start-from-request="minStartTimeFromLimitsReq"
    :max-start-from-request="maxStartTimeFromLimitsReq"
    :min-end-from-request="minEndTimeFromLimitsReq"
    :max-end-from-request="maxEndTimeFromLimitsReq"
    :next-shift-start-from-request="nextShiftStartDateTime"
    @update:start-date="startDate = $event"
    @update:start-time="startTime = $event"
    @update:end-time="endTime = $event"
    @update:save-btn-disabled="isSaveBtnDisabled = $event"
  />
  <edit-shift-content
    v-else
    :start-date="startDate"
    :end-date="endDate"
    :start-time="startTime"
    :end-time="endTime"
    :shift-duration="shiftDuration"
    :min-start-from-request="minStartTimeFromLimitsReq"
    :max-start-from-request="maxStartTimeFromLimitsReq"
    :min-end-from-request="minEndTimeFromLimitsReq"
    :max-end-from-request="maxEndTimeFromLimitsReq"
    @update:start-date="startDate = $event"
    @update:start-time="startTime = $event"
    @update:end-time="endTime = $event"
    @update:save-btn-disabled="isSaveBtnDisabled = $event"
  />
  <v-card-actions
    class="justify-end"
    :class="{ 'fullscreen-card-actions': showFullscreenDialogs }"
  >
    <evocon-v-button
      :text="$t('Cancel')"
      type="secondary"
      @click="closeDialog"
    />
    <evocon-v-button
      v-if="!isShiftStartSelectionVisible"
      :text="$t('Save')"
      color="primary"
      :disabled="isSavingDisabled"
      :loading="saveLoading"
      @click="onSave"
    />
  </v-card-actions>
</template>
<script setup name="ShiftManagementDialog">
import { ref, computed, onBeforeMount } from 'vue';
import { useRouter } from 'vue-router';
import { DateTime } from 'luxon';
import { format, addDays, roundToNearestMinutes } from 'date-fns';

import {
  useGenericDialogStore, useDeviceStore, useStationStore,
  useProfileStore, useShiftStore, useGenericNotificationStore, useShiftViewStore,
} from '@/stores/index';
import i18n from '@/services/i18n';
import stationApi from '@/api/stationApi';
import shiftApi from '@/api/shiftApi';
import { getDateTimeFromTimeString } from '@/helpers/date/getDateTimeFromTimeString';
import { isTimeBetweenRange } from '@/helpers/time/timeComparison';
import parseDateStr from '@/helpers/date/parseDateStr';
import userHasTimeRestriction from '@/helpers/timeRestriction';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import ShiftManagementDialogToolbar from '@/components/organisms/shiftview/ShiftManagementDialogToolbar/index.vue';
import ShiftStartSelection from '@/components/organisms/shiftview/ShiftStartSelection/index.vue';
import StartPlannedShiftContent from '@/components/organisms/shiftview/StartPlannedShiftContent/index.vue';
import StartExtraShiftContent from '@/components/organisms/shiftview/StartExtraShiftContent/index.vue';
import EditShiftContent from '@/components/organisms/shiftview/EditShiftContent/index.vue';

const genericDialogStore = useGenericDialogStore();
const deviceStore = useDeviceStore();
const stationStore = useStationStore();
const profileStore = useProfileStore();
const shiftStore = useShiftStore();
const genericNotificationStore = useGenericNotificationStore();
const shiftViewStore = useShiftViewStore();
const router = useRouter();

const loading = ref(false);
const saveLoading = ref(false);
const startDate = ref(null);
const startTime = ref(null);
const endTime = ref(null);
const isSaveBtnDisabled = ref(false);
const minStartTimeFromLimitsReq = ref(null);
const maxStartTimeFromLimitsReq = ref(null);
const minEndTimeFromLimitsReq = ref(null);
const maxEndTimeFromLimitsReq = ref(null);
const nextShiftStartDateTime = ref(null);
const nextShiftEndDateTime = ref(null);
const nextShiftName = ref(null);
const nextShiftTemplateId = ref(null);
const isPlannedShiftStartSelected = ref(false);
const isShiftStartSelectionVisible = ref(true);

const isStartShiftDialog = computed(() => genericDialogStore.dialogData.isStartShift);
const showFullscreenDialogs = computed(() => deviceStore.showFullscreenDialogs);
const lineviewStation = computed(() => stationStore.lineviewStation);
const currentUser = computed(() => profileStore.currentUser);
const shiftviewStationUserRole = computed(() => profileStore.shiftviewStationUserRole);
const shift = computed(() => shiftStore.shift);
const shifts = computed(() => shiftStore.shifts);
const closeDialog = () => genericDialogStore.closeDialog();
const notifySuccess = (message) => genericNotificationStore.notifySuccess(message);
const notifyError = (message) => genericNotificationStore.notifyError(message);
const fetchCurrentShift = (params) => shiftStore.fetchCurrentShift(params);
const fetchShifts = (params) => shiftStore.fetchShifts(params);
const changeShift = (params) => shiftViewStore.changeShift(params);

const timeRestriction = computed(() => userHasTimeRestriction(currentUser.value, shift.value, shifts.value, shiftviewStationUserRole.value));

const endDate = computed(() => {
  if (startTime.value && endTime.value) {
    if (startTime.value !== endTime.value && isTimeBetweenRange(startTime.value, '00:00', endTime.value)) {
      if (endTime.value === '00:00') return format(addDays(parseDateStr(startDate.value), 1), 'yyyy-MM-dd');
      return startDate.value;
    }
    if (isTimeBetweenRange('00:00', startTime.value, endTime.value)) {
      return format(addDays(parseDateStr(startDate.value), 1), 'yyyy-MM-dd');
    }
  }
  return '';
});

const startDateTime = computed(() => getDateTimeFromTimeString(startDate.value, startTime.value, lineviewStation.value.zoneId));
const endDateTime = computed(() => getDateTimeFromTimeString(endDate.value, endTime.value, lineviewStation.value.zoneId));

const shiftDuration = computed(() => {
  if (startDateTime.value && endDateTime.value) {
    const diff = endDateTime.value.diff(startDateTime.value, ['hours', 'minutes']);
    return `${diff.hours}h ${diff.minutes}m`;
  }
  return '-';
});

const shiftStartTime = computed(() => DateTime.fromISO(shift.value.startTimeISO, { zone: lineviewStation.value.zoneId }));

const isSavingDisabled = computed(() => {
  if (isSaveBtnDisabled.value || saveLoading.value) return true;
  return !isStartShiftDialog.value && startDate.value === shiftStartTime.value.toFormat('yyyy-MM-dd')
    && startTime.value === shiftStartTime.value.toFormat('HH:mm')
    && endTime.value === DateTime.fromISO(shift.value.endTimeISO, { zone: lineviewStation.value.zoneId }).toFormat('HH:mm');
});

const onBackButtonClick = () => {
  isShiftStartSelectionVisible.value = true;
  isPlannedShiftStartSelected.value = false;
};

const onShiftStartSelectionClick = (plannedShiftStartSelected) => {
  isShiftStartSelectionVisible.value = false;
  isPlannedShiftStartSelected.value = plannedShiftStartSelected;
};

onBeforeMount(async () => {
  isShiftStartSelectionVisible.value = isStartShiftDialog.value;
  try {
    loading.value = true;
    let limits;
    if (isStartShiftDialog.value) {
      limits = await stationApi.getLimits(lineviewStation.value.id);
    } else {
      limits = await stationApi.getLimits(lineviewStation.value.id, { shiftId: shift.value.id });
    }

    minStartTimeFromLimitsReq.value = DateTime.fromISO(limits.minStartTimeISO, { zone: lineviewStation.value.zoneId }).startOf('minute');
    maxStartTimeFromLimitsReq.value = DateTime.fromISO(limits.maxStartTimeISO, { zone: lineviewStation.value.zoneId });
    const roundedMinEndTimeISOString = roundToNearestMinutes(new Date(limits.minEndTimeISO), { roundingMethod: 'ceil' }).toISOString();
    minEndTimeFromLimitsReq.value = DateTime.fromISO(roundedMinEndTimeISOString, { zone: lineviewStation.value.zoneId });
    maxEndTimeFromLimitsReq.value = DateTime.fromISO(limits.maxEndTimeISO, { zone: lineviewStation.value.zoneId });
    nextShiftStartDateTime.value = DateTime.fromISO(limits.nextShiftStartTimeISO, { zone: lineviewStation.value.zoneId });
    nextShiftEndDateTime.value = DateTime.fromISO(limits.nextShiftEndTimeISO, { zone: lineviewStation.value.zoneId });
    nextShiftName.value = limits.nextShiftName;
    nextShiftTemplateId.value = limits.nextShiftTemplateId;
    if (isStartShiftDialog.value) {
      startDate.value = DateTime.local().setZone(lineviewStation.value.zoneId).toFormat('yyyy-MM-dd');
      startTime.value = DateTime.local().setZone(lineviewStation.value.zoneId).toFormat('HH:mm');
    } else {
      startDate.value = shiftStartTime.value.toFormat('yyyy-MM-dd');
      startTime.value = shiftStartTime.value.toFormat('HH:mm');
      endTime.value = DateTime.fromISO(shift.value.endTimeISO, { zone: lineviewStation.value.zoneId }).toFormat('HH:mm');
    }
  } catch {
    // pass for tests
  } finally {
    loading.value = false;
  }
});

const openHelp = () => {
  if (isStartShiftDialog.value && isPlannedShiftStartSelected.value) {
    window.open('https://support.evocon.com/Start-a-planned-shift-early-11fdae0ba80280edbb6fea03667c3054', '_blank');
  } else if (isStartShiftDialog.value) {
    window.open('https://support.evocon.com/Starting-and-closing-extra-shifts-e9ab5d9e0a4b4c8ca45537e3c3c64a79', '_blank');
  } else {
    window.open('https://support.evocon.com/Editing-shift-time-343e33c0d53e46e0bf50b1dd77869158', '_blank');
  }
};

const navigateToAddedShiftIfPossible = (addedShift) => {
  const stationNow = DateTime.local().setZone(lineviewStation.value.zoneId).toISO();
  if (addedShift.startTimeISO < stationNow) {
    fetchCurrentShift({ stationId: lineviewStation.value.id });
    // router throws here error by design because there is a navigationGuard in ShiftView.vue
    // https://github.com/vuejs/vue-router/issues/2881#issuecomment-520554378
    router.push({ name: 'shiftview', params: { stationId: lineviewStation.value.id, shiftId: addedShift.id } }).catch(() => {});
    if (timeRestriction.value) fetchShifts({ stationId: lineviewStation.value.id, nrLastShifts: currentUser.value.lineviewTimeRestrictionValue });
  }
};

const onSave = async () => {
  saveLoading.value = true;
  const payload = {
    stationId: lineviewStation.value.id,
    startTimeISO: startDateTime.value.toISO(),
    endTimeISO: endDateTime.value.toISO(),
  };
  let shiftResponse;
  if (isStartShiftDialog.value) {
    if (isPlannedShiftStartSelected.value) shiftResponse = await shiftApi.startShift({ shiftTemplateId: nextShiftTemplateId.value, ...payload });
    else shiftResponse = await shiftApi.startShift(payload);
  } else shiftResponse = await shiftApi.putShift({ shiftId: shift.value.id, eventTimeISO: shift.value.startTimeISO, ...payload });
  saveLoading.value = false;
  if (shiftResponse.id && isStartShiftDialog.value) {
    notifySuccess(i18n.global.t('New shift saved'));
    closeDialog();
    navigateToAddedShiftIfPossible(shiftResponse);
  } else if (shiftResponse.id && !isStartShiftDialog.value) {
    notifySuccess(i18n.global.t('Shift time edited'));
    closeDialog();
    changeShift({ stationId: lineviewStation.value.id, shiftId: shiftResponse.id, force: true });
  } else {
    notifyError(shiftResponse.message);
  }
};
</script>
