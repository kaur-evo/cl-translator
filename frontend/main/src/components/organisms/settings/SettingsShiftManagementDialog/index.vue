<template>
  <shift-management-dialog-toolbar
    :is-start-shift-dialog="false"
    :is-shift-start-selection-visible="false"
    @on-help-click="openHelp"
  />
  <v-progress-linear
    v-if="loading"
    indeterminate
  />
  <edit-planned-shift-content
    v-else
    :start-date="startDate"
    :end-date="endDate"
    :start-time="startTime"
    :end-time="endTime"
    :shift-duration="shiftDuration"
    :min-start-time="minStartTime"
    :max-start-time="maxStartTime"
    :min-end-time="minEndTime"
    :max-end-time="maxEndTime"
    :shift="shift"
    :station="station"
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
import { DateTime } from 'luxon';
import { format, addDays, roundToNearestMinutes } from 'date-fns';

import useGenericDialogStore from '@/stores/genericDialog';
import useDeviceStore from '@/stores/device';
import useShiftTemplateStore from '@/stores/shiftTemplate';
import stationApi from '@/api/stationApi';
import { getDateTimeFromTimeString } from '@/helpers/date/getDateTimeFromTimeString';
import { isTimeBetweenRange } from '@/helpers/time/timeComparison';
import parseDateStr from '@/helpers/date/parseDateStr';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import ShiftManagementDialogToolbar from '@/components/organisms/shiftview/ShiftManagementDialogToolbar/index.vue';
import EditPlannedShiftContent from '@/components/organisms/settings/EditPlannedShiftContent/index.vue';
import findShiftLimitsFromTimeline from '@/components/organisms/settings/SettingsShiftManagementDialog/findShiftLimitsFromTimeline';

const genericDialogStore = useGenericDialogStore();
const deviceStore = useDeviceStore();
const shiftTemplateStore = useShiftTemplateStore();

const loading = ref(false);
const saveLoading = ref(false);
const startDate = ref(null);
const startTime = ref(null);
const endTime = ref(null);
const isSaveBtnDisabled = ref(false);
const minStartTime = ref(null);
const maxStartTime = ref(null);
const minEndTime = ref(null);
const maxEndTime = ref(null);

const isShiftStartSelectionVisible = ref(true);

const isStartShiftDialog = computed(() => genericDialogStore.dialogData.isStartShift);
const dialogData = computed(() => genericDialogStore.dialogData || {});
const showFullscreenDialogs = computed(() => deviceStore.showFullscreenDialogs);
const station = computed(() => dialogData.value.station);
const shift = computed(() => dialogData.value.shift || {});
const shiftTimeline = computed(() => shiftTemplateStore.stationShiftTimeline(station.value.id));
const closeDialog = () => genericDialogStore.closeDialog();

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

const startDateTime = computed(() => getDateTimeFromTimeString(startDate.value, startTime.value, station.value.zoneId));
const endDateTime = computed(() => getDateTimeFromTimeString(endDate.value, endTime.value, station.value.zoneId));

const shiftDuration = computed(() => {
  if (startDateTime.value && endDateTime.value) {
    const diff = endDateTime.value.diff(startDateTime.value, ['hours', 'minutes']);
    return `${diff.hours}h ${diff.minutes}m`;
  }
  return '-';
});

const shiftStartTime = computed(() => DateTime.fromISO(shift.value.startTimeISO, { zone: station.value.zoneId }));

const isSavingDisabled = computed(() => {
  if (isSaveBtnDisabled.value || saveLoading.value) return true;
  return !isStartShiftDialog.value && startDate.value === shiftStartTime.value.toFormat('yyyy-MM-dd')
    && startTime.value === shiftStartTime.value.toFormat('HH:mm')
    && endTime.value === DateTime.fromISO(shift.value.endTimeISO, { zone: station.value.zoneId }).toFormat('HH:mm');
});


const startTimePlus24h = computed(() => startDateTime.value.plus({ hours: 24 }));
const endTimeMinus24h = computed(() => endDateTime.value.minus({ hours: 24 }));


onBeforeMount(async () => {
  isShiftStartSelectionVisible.value = isStartShiftDialog.value;
  try {
    loading.value = true;
    const apiLimits = await stationApi.getLimits(station.value.id, { shiftId: shift.value.id, baseDate: shiftStartTime.value.toISO() });
    const limitsFromTimeline = findShiftLimitsFromTimeline(shiftTimeline.value, shift.value.startTimeISO, station.value.zoneId);

    const apiRoundedMinEndTimeISOString = roundToNearestMinutes(new Date(apiLimits.minEndTimeISO), { roundingMethod: 'ceil' }).toISOString();
    const apiMinStartTimeISO = DateTime.fromISO(apiLimits.minStartTimeISO, { zone: station.value.zoneId }).startOf('minute');
    const apiMaxStartTimeISO = DateTime.fromISO(apiLimits.maxStartTimeISO, { zone: station.value.zoneId });
    const apiMinEndTimeISO = DateTime.fromISO(apiRoundedMinEndTimeISOString, { zone: station.value.zoneId });
    const apiMaxEndTimeISO = DateTime.fromISO(apiLimits.maxEndTimeISO, { zone: station.value.zoneId });

    const timelineRoundedMinEndTimeISOString = limitsFromTimeline.minEndTimeISO
      ? roundToNearestMinutes(new Date(limitsFromTimeline.minEndTimeISO), { roundingMethod: 'ceil' }).toISOString()
      : null;

    const timelineMinStartTimeISO = limitsFromTimeline.minStartTimeISO ? DateTime.fromISO(limitsFromTimeline.minStartTimeISO, { zone: station.value.zoneId }).startOf('minute') : null;
    const timelineMaxStartTimeISO = limitsFromTimeline.maxStartTimeISO ? DateTime.fromISO(limitsFromTimeline.maxStartTimeISO, { zone: station.value.zoneId }) : null;
    const timelineMinEndTimeISO = timelineRoundedMinEndTimeISOString ? DateTime.fromISO(timelineRoundedMinEndTimeISOString, { zone: station.value.zoneId }) : null;
    const timelineMaxEndTimeISO = limitsFromTimeline.maxEndTimeISO ? DateTime.fromISO(limitsFromTimeline.maxEndTimeISO, { zone: station.value.zoneId }) : null;
    startDate.value = shiftStartTime.value.toFormat('yyyy-MM-dd');
    startTime.value = shiftStartTime.value.toFormat('HH:mm');
    endTime.value = DateTime.fromISO(shift.value.endTimeISO, { zone: station.value.zoneId }).toFormat('HH:mm');

    minStartTime.value = timelineMinStartTimeISO ? DateTime.max(apiMinStartTimeISO, timelineMinStartTimeISO, endTimeMinus24h.value) : apiMinStartTimeISO;
    maxStartTime.value = DateTime.max(timelineMaxStartTimeISO ? DateTime.min(apiMaxStartTimeISO, timelineMaxStartTimeISO) : apiMaxStartTimeISO, endTimeMinus24h.value);
    minEndTime.value = DateTime.min(timelineMinEndTimeISO ? DateTime.max(apiMinEndTimeISO, timelineMinEndTimeISO) : apiMinEndTimeISO, startTimePlus24h.value);
    maxEndTime.value = timelineMaxEndTimeISO ? DateTime.min(apiMaxEndTimeISO, timelineMaxEndTimeISO, startTimePlus24h.value) : apiMaxEndTimeISO;
  } finally {
    loading.value = false;
  }
});

const openHelp = () => {
  window.open('https://support.evocon.com/Editing-shift-time-343e33c0d53e46e0bf50b1dd77869158', '_blank');
};

const onSave = async () => {
  saveLoading.value = true;
  const payload = {
    stationIds: [station.value.id],
    startTime: startDateTime.value.toISO(),
    endTime: endDateTime.value.toISO(),
    shiftTemplateId: shift.value.shiftTemplateId,
  };
  await shiftTemplateStore.saveShiftTemplateTimeDeviation({ ...payload });
  await shiftTemplateStore.fetchShiftTemplateTimeline({
    dateRange: dialogData.value.xScale.domain(),
    stationId: station.value.id,
  });
  saveLoading.value = false;
  closeDialog();
};
</script>
