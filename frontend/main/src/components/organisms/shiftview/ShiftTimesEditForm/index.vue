<template>
  <v-card-text class="pa-4">
    <v-row class="mx-n1">
      <v-col
        cols="12"
        sm="4"
        class="px-1 mb-2"
      >
        <selection-input
          :model-value="[startDate]"
          item-value="date"
          :items="startRangeDates"
          :hint="$t('date')"
          :prepend-inner-icon="mdiCalendar"
          :disabled="startRangeDates.length === 1"
          is-single-select
          hide-search
          required
          @update:model-value="$emit('update:start-date', $event[0])"
        />
      </v-col>
      <v-col
        cols="12"
        sm="4"
        class="px-1 mb-2"
      >
        <evocon-time-input
          :model-value="startTime"
          :error="startTimeError"
          :disabled="isStartTimeInputDisabled"
          :prepend-inner-icon="mdiClockOutline"
          :hint="$t('Start time')"
          @update:model-value="$emit('update:start-time', $event)"
        />
      </v-col>
      <v-col
        cols="12"
        sm="4"
        class="px-1 mb-2"
      >
        <evocon-time-input
          :model-value="endTime"
          :error="endTimeError"
          :disabled="isEndTimeInputDisabled"
          :prepend-inner-icon="mdiClockOutline"
          :hint="$t('Planned end time')"
          :suffix="endDateSuffix"
          @update:model-value="$emit('update:end-time', $event)"
        />
      </v-col>
    </v-row>
    <slot name="info-blocks" />
  </v-card-text>
</template>
<script setup name="ShiftTimesEditForm">
import { computed } from 'vue';
import { format } from 'date-fns';
import { mdiCalendar, mdiClockOutline } from '@mdi/js';

import { useProfileStore } from '@/stores/index';
import EvoconTimeInput from '@/components/atoms/EvoconTimeInput/index.vue';
import SelectionInput from '@/components/molecules/SelectionInput/index.vue';

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
  startTimeError: { type: Boolean },
  endDate: {
    type: String,
    default: '',
  },
  endTime: {
    type: String,
    default: '',
  },
  endTimeError: { type: Boolean },
  startRangeDates: {
    type: Array,
    default: () => [],
  },
  isStartTimeInputDisabled: { type: Boolean },
  isEndTimeInputDisabled: { type: Boolean },
});

defineEmits(['update:start-date', 'update:start-time', 'update:end-time']);

const dateFormat = computed(() => profileStore.dateFormat);

const endDateSuffix = computed(() => (props.endDate ? format(props.endDate, dateFormat.value.short) : ''));
</script>
