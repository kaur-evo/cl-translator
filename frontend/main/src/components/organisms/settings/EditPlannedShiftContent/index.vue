<template>
  <shift-times-edit-form
    :start-date="startDate"
    :start-time="startTime"
    :end-date="endDate"
    :end-time="endTime"
    :start-time-error="startTimeError"
    :end-time-error="endTimeError"
    :start-range-dates="startRangeDates"
    :is-start-time-input-disabled="minStartTime && maxStartTime ? minStartTime.equals(maxStartTime) : false"
    :is-end-time-input-disabled="minEndTime && maxEndTime ? minEndTime.equals(maxEndTime) : false"
    @update:start-date="$emit('update:start-date', $event)"
    @update:start-time="$emit('update:start-time', $event)"
    @update:end-time="$emit('update:end-time', $event)"
  >
    <template #info-blocks>
      <div class="mb-n2 d-block">
        <info-block
          :header="$t('Shift duration (max 24 h)')"
          :body="shiftDuration"
          :icon="mdiInformationOutline"
          class="mb-2"
        />
        <info-block
          v-if="startTimeError"
          :header="$t('Start time range')"
          :body="formattedStartRange"
          :color="colorConstants.dark.error"
          :icon="mdiInformationOutline"
          class="mb-2"
        />
        <info-block
          v-if="endTimeError"
          :header="$t('End time range')"
          :body="formattedEndRange"
          :color="colorConstants.dark.error"
          :icon="mdiInformationOutline"
          class="mb-2"
        />
      </div>
    </template>
  </shift-times-edit-form>
</template>
<script setup="EditShiftContent">
import { computed, watch } from 'vue';
import { DateTime } from 'luxon';
import { isWithinInterval } from 'date-fns';
import { mdiInformationOutline } from '@mdi/js';

import useProfileStore from '@/stores/profile';
import colorConstants from '@/constants/colorConstants';
import { formatTimeRange } from '@/helpers/time/formatTimeRange';
import { getDateTimeFromTimeString } from '@/helpers/date/getDateTimeFromTimeString';
import InfoBlock from '@/components/atoms/InfoBlock/index.vue';
import ShiftTimesEditForm from '@/components/organisms/shiftview/ShiftTimesEditForm/index.vue';

const profileStore = useProfileStore();

const props = defineProps({
  startDate: {
    type: String,
    default: '',
  },
  startTime: {
    type: String,
    default: '',
  },
  endDate: {
    type: String,
    default: '',
  },
  endTime: {
    type: String,
    default: '',
  },
  shiftDuration: {
    type: String,
    default: '',
  },
  minStartTime: {
    type: Object,
    default: () => ({}),
  },
  maxStartTime: {
    type: Object,
    default: () => ({}),
  },
  minEndTime: {
    type: Object,
    default: () => ({}),
  },
  maxEndTime: {
    type: Object,
    default: () => ({}),
  },
  station: {
    type: Object,
    required: true,
  },
  shift: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['update:start-date', 'update:start-time', 'update:end-time', 'update:save-btn-disabled']);

const timeFormat = computed(() => profileStore.timeFormat);
const dateFormat = computed(() => profileStore.dateFormat);
const isShiftRunning = computed(() => props.shift.running);


const startDateTime = computed(() => getDateTimeFromTimeString(props.startDate, props.startTime, props.station.zoneId));
const endDateTime = computed(() => getDateTimeFromTimeString(props.endDate, props.endTime, props.station.zoneId));

const startTimeError = computed(() => {
  if (!startDateTime.value) return true;
  return !isWithinInterval(
    startDateTime.value.toISO(),
    {
      start: props.minStartTime.toISO(),
      end: props.maxStartTime.toISO(),
    },
  );
});

const hasLatestPossibleEndTimeError = computed(() => endDateTime.value.toISO() > props.maxEndTime.toISO());

const endTimeError = computed(() => {
  if (!endDateTime.value) return true;
  return hasLatestPossibleEndTimeError.value || !isWithinInterval(
    endDateTime.value.toISO(),
    {
      start: props.minEndTime.startOf('minute').toISO(),
      end: props.maxEndTime.startOf('minute').toISO(),
    },
  );
});

const isSaveBtnDisabled = computed(() => startTimeError.value || endTimeError.value);

const getShiftStartRange = computed(() => {
  if (isShiftRunning.value) {
    return [props.minStartTime, DateTime.local().setZone(props.station.zoneId).startOf('minute')];
  }
  return [props.minStartTime, DateTime.fromISO(props.shift.endTimeISO, { zone: props.station.zoneId }).minus({ minutes: 1 })];
});

const getShiftEndRange = computed(() => {
  if (isShiftRunning.value) {
    return [DateTime.local().setZone(props.station.zoneId).plus({ minutes: 1 }).startOf('minute'), props.maxEndTime];
  }
  return [DateTime.fromISO(props.shift.startTimeISO, { zone: props.station.zoneId }).plus({ minutes: 1 }), props.maxEndTime];
});

const formattedStartRange = computed(() => formatTimeRange(getShiftStartRange.value, dateFormat.value, timeFormat.value));
const formattedEndRange = computed(() => formatTimeRange(getShiftEndRange.value, dateFormat.value, timeFormat.value));
const startRangeDates = computed(() => {
  const start = DateTime.fromISO(props.startDate, { zone: props.station.zoneId }).startOf('day');
  return [{
    name: start.toFormat(dateFormat.value.short),
    date: start.toFormat('yyyy-MM-dd'),
  }];
});

watch(isSaveBtnDisabled, (newVal) => {
  emit('update:save-btn-disabled', newVal);
});
</script>
