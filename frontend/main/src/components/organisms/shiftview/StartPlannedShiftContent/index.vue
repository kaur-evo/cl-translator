<template>
  <shift-times-edit-form
    :start-date="startDate"
    :start-time="startTime"
    :end-date="endDate"
    :end-time="endTime"
    :start-time-error="startTimeError"
    :start-range-dates="startRangeDates"
    :is-start-time-input-disabled="minStartTime && maxStartTime ? minStartTime.equals(maxStartTime) : false"
    is-end-time-input-disabled
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
        :header="$t('Shift can be started between')"
        :body="formattedStartRange"
        :color="colorConstants.dark.error"
        :icon="mdiInformationOutline"
      />
    </template>
  </shift-times-edit-form>
</template>
<script setup name="StartPlannedShiftContent">
import { computed, onMounted, watch } from 'vue';
import { DateTime } from 'luxon';
import { isWithinInterval } from 'date-fns';
import { mdiInformationOutline } from '@mdi/js';

import { useStationStore, useProfileStore } from '@/stores/index';
import colorConstants from '@/constants/colorConstants';
import { filterInvalidDateTimes } from '@/helpers/date/filterInvalidDateTimes';
import { getDatesWithinRange } from '@/helpers/date/getDatesWithinRange';
import { getDateTimeFromTimeString } from '@/helpers/date/getDateTimeFromTimeString';
import { formatTimeRange } from '@/helpers/time/formatTimeRange';
import InfoBlock from '@/components/atoms/InfoBlock/index.vue';
import ShiftTimesEditForm from '@/components/organisms/shiftview/ShiftTimesEditForm/index.vue';

const stationStore = useStationStore();
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
  minStartFromRequest: {
    type: Object,
    default: () => ({}),
  },
  nextShiftEndFromRequest: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(['update:start-date', 'update:start-time', 'update:end-time', 'update:save-btn-disabled']);

const lineviewStation = computed(() => stationStore.lineviewStation);
const dateFormat = computed(() => profileStore.dateFormat);
const timeFormat = computed(() => profileStore.timeFormat);

const startDateTime = computed(() => getDateTimeFromTimeString(props.startDate, props.startTime, lineviewStation.value.zoneId));
const endDateTime = computed(() => getDateTimeFromTimeString(props.endDate, props.endTime, lineviewStation.value.zoneId));
const startTimePlus24h = computed(() => startDateTime.value?.plus({ hours: 24 }));
const endTimeMinus24h = computed(() => endDateTime.value?.minus({ hours: 24 }));

const minStartTime = computed(() => {
  const validDateTimes = filterInvalidDateTimes([props.minStartFromRequest, endTimeMinus24h.value]);
  return DateTime.max(...validDateTimes);
});

const maxStartTime = computed(() => {
  const validDateTimes = filterInvalidDateTimes([props.nextShiftEndFromRequest.minus({ minutes: 1 }), startTimePlus24h.value]);
  return DateTime.min(...validDateTimes);
});

const maxEndTime = computed(() => {
  const validDateTimes = filterInvalidDateTimes([props.nextShiftEndFromRequest, startTimePlus24h.value]);
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

const formattedStartRange = computed(() => formatTimeRange([props.minStartFromRequest, maxStartTime.value], dateFormat.value, timeFormat.value));

const startRangeDates = computed(() => getDatesWithinRange([props.minStartFromRequest, maxStartTime.value], dateFormat.value));

watch(startTimeError, (newVal) => {
  emit('update:save-btn-disabled', newVal);
});

onMounted(() => {
  emit('update:end-time', maxEndTime.value.toFormat('HH:mm'));
});
</script>
