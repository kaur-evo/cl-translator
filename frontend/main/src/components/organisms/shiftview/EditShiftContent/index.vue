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
      />
    </template>
  </shift-times-edit-form>
</template>
<script setup="EditShiftContent">
import { computed, watch } from 'vue';
import { DateTime } from 'luxon';
import { isWithinInterval, roundToNearestMinutes } from 'date-fns';
import { mdiInformationOutline } from '@mdi/js';

import { useStationStore, useProfileStore, useShiftStore, useShiftviewTimelineStore } from '@/stores/index';
import colorConstants from '@/constants/colorConstants';
import { getDatesWithinRange } from '@/helpers/date/getDatesWithinRange';
import { filterInvalidDateTimes } from '@/helpers/date/filterInvalidDateTimes';
import { formatTimeRange } from '@/helpers/time/formatTimeRange';
import { getDateTimeFromTimeString } from '@/helpers/date/getDateTimeFromTimeString';
import InfoBlock from '@/components/atoms/InfoBlock/index.vue';
import ShiftTimesEditForm from '@/components/organisms/shiftview/ShiftTimesEditForm/index.vue';

const stationStore = useStationStore();
const profileStore = useProfileStore();
const shiftStore = useShiftStore();
const shiftviewTimelineStore = useShiftviewTimelineStore();

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
  minStartFromRequest: {
    type: Object,
    default: () => ({}),
  },
  maxStartFromRequest: {
    type: Object,
    default: () => ({}),
  },
  minEndFromRequest: {
    type: Object,
    default: () => ({}),
  },
  maxEndFromRequest: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(['update:start-date', 'update:start-time', 'update:end-time', 'update:save-btn-disabled']);

const lineviewStation = computed(() => stationStore.lineviewStation);
const timeFormat = computed(() => profileStore.timeFormat);
const dateFormat = computed(() => profileStore.dateFormat);
const shift = computed(() => shiftStore.shift);
const isShiftRunning = computed(() => shiftStore.isShiftRunning);
const slicesByType = computed(() => shiftviewTimelineStore.slicesByType);

const productSlices = computed(() => slicesByType.value.products);
const changeOverSlices = computed(() => slicesByType.value.productChanges);
const isShiftMissingSlices = computed(() => !productSlices.value.length && !changeOverSlices.value.length);

const startDateTime = computed(() => getDateTimeFromTimeString(props.startDate, props.startTime, lineviewStation.value.zoneId));
const endDateTime = computed(() => getDateTimeFromTimeString(props.endDate, props.endTime, lineviewStation.value.zoneId));
const startTimePlus24h = computed(() => startDateTime.value?.plus({ hours: 24 }));
const endTimeMinus24h = computed(() => endDateTime.value?.minus({ hours: 24 }));

const getTimeBySlices = (isStartRange) => {
  let productSliceISO;
  let changeOverSliceISO;
  if (isStartRange) {
    productSliceISO = productSlices.value[0]?.sliceStartTmISO;
    changeOverSliceISO = changeOverSlices.value[0]?.sliceStartTmISO;
  } else {
    productSliceISO = productSlices.value[productSlices.value.length - 1]?.sliceEndTmISO;
    changeOverSliceISO = changeOverSlices.value[changeOverSlices.value.length - 1]?.sliceStartTmISO;
  }

  let rangeStart;
  if (productSliceISO && changeOverSliceISO && isStartRange) rangeStart = productSliceISO < changeOverSliceISO ? productSliceISO : changeOverSliceISO;
  else if (productSliceISO && changeOverSliceISO) rangeStart = productSliceISO > changeOverSliceISO ? productSliceISO : changeOverSliceISO;
  else if (productSliceISO) rangeStart = productSliceISO;
  else if (changeOverSliceISO) rangeStart = changeOverSliceISO;
  return rangeStart;
};

const minStartTime = computed(() => {
  const validDateTimes = filterInvalidDateTimes([props.minStartFromRequest, endTimeMinus24h.value]);
  return DateTime.max(...validDateTimes);
});

const maxStartTime = computed(() => {
  if (isShiftMissingSlices.value && isShiftRunning.value) return DateTime.local().setZone(lineviewStation.value.zoneId).startOf('minute');
  if (isShiftMissingSlices.value) return DateTime.fromISO(shift.value.endTimeISO, { zone: lineviewStation.value.zoneId }).minus({ minutes: 1 });
  const roundedFirstSliceTime = roundToNearestMinutes(new Date(getTimeBySlices(true)), { roundingMethod: 'floor' }).toISOString();
  const firstSliceTime = DateTime.fromISO(roundedFirstSliceTime, { zone: lineviewStation.value.zoneId });
  const validDateTimes = filterInvalidDateTimes([props.maxStartFromRequest, endTimeMinus24h.value, firstSliceTime]);
  return DateTime.max(...validDateTimes);
});

const minEndTime = computed(() => {
  if (isShiftMissingSlices.value && isShiftRunning.value) return DateTime.local().setZone(lineviewStation.value.zoneId).plus({ minutes: 1 }).startOf('minute');
  if (isShiftMissingSlices.value) return DateTime.fromISO(shift.value.startTimeISO, { zone: lineviewStation.value.zoneId }).plus({ minutes: 1 });
  const roundedLastSliceTime = roundToNearestMinutes(new Date(getTimeBySlices(false)), { roundingMethod: 'ceil' }).toISOString();
  const lastSliceTime = DateTime.fromISO(roundedLastSliceTime, { zone: lineviewStation.value.zoneId });
  const validDateTimes = filterInvalidDateTimes([props.minEndFromRequest, startTimePlus24h.value, lastSliceTime]);
  return DateTime.min(...validDateTimes);
});

const maxEndTime = computed(() => {
  const validDateTimes = filterInvalidDateTimes([props.maxEndFromRequest, startTimePlus24h.value]);
  return DateTime.min(...validDateTimes);
});

const startTimeError = computed(() => {
  if (!startDateTime.value) return true;
  return !isWithinInterval(
    startDateTime.value.toISO(),
    {
      start: minStartTime.value.toISO(),
      end: maxStartTime.value.toISO(),
    },
  );
});

const hasLatestPossibleEndTimeError = computed(() => endDateTime.value.toISO() > maxEndTime.value.toISO());

const endTimeError = computed(() => {
  if (!endDateTime.value) return true;
  return hasLatestPossibleEndTimeError.value || !isWithinInterval(
    endDateTime.value.toISO(),
    {
      start: minEndTime.value.startOf('minute').toISO(),
      end: maxEndTime.value.startOf('minute').toISO(),
    },
  );
});

const isSaveBtnDisabled = computed(() => startTimeError.value || endTimeError.value);

const getShiftStartRange = computed(() => {
  if (isShiftMissingSlices.value && isShiftRunning.value) {
    return [props.minStartFromRequest, DateTime.local().setZone(lineviewStation.value.zoneId).startOf('minute')];
  }
  if (isShiftMissingSlices.value) {
    return [props.minStartFromRequest, DateTime.fromISO(shift.value.endTimeISO, { zone: lineviewStation.value.zoneId }).minus({ minutes: 1 })];
  }
  return [props.minStartFromRequest, props.maxStartFromRequest];
});

const getShiftEndRange = computed(() => {
  if (isShiftMissingSlices.value && isShiftRunning.value) {
    return [DateTime.local().setZone(lineviewStation.value.zoneId).plus({ minutes: 1 }).startOf('minute'), props.maxEndFromRequest];
  }
  if (isShiftMissingSlices.value) {
    return [DateTime.fromISO(shift.value.startTimeISO, { zone: lineviewStation.value.zoneId }).plus({ minutes: 1 }), props.maxEndFromRequest];
  }
  return [props.minEndFromRequest, props.maxEndFromRequest];
});

const formattedStartRange = computed(() => formatTimeRange(getShiftStartRange.value, dateFormat.value, timeFormat.value));
const formattedEndRange = computed(() => formatTimeRange(getShiftEndRange.value, dateFormat.value, timeFormat.value));
const startRangeDates = computed(() => getDatesWithinRange(getShiftStartRange.value, dateFormat.value));

watch(isSaveBtnDisabled, (newVal) => {
  emit('update:save-btn-disabled', newVal);
});
</script>
