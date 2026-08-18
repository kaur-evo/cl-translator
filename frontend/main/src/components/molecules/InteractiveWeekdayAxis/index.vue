<template>
  <v-row class="fill-height">
    <v-col
      v-for="date in props.dates"
      :key="date"
      class="pa-0 ma-0 weekday-col"
    >
      <slot
        v-if="slots['weekday-chip']"
        name="weekday-chip"
        :label="formatTick(date)"
        :is-today="isTickToday(date)"
      />
      <evocon-v-chip
        v-else
        :label="formatTick(date)"
        type="outlined"
        :active="isTickToday(date)"
        @click="onWeekdayClick(date)"
      />
    </v-col>
  </v-row>
</template>
<script setup>

import { DateTime } from 'luxon';
import { useSlots } from 'vue';

import EvoconVChip from '@/components/atoms/EvoconVChip/index.vue';
import { asInZoneTimeLuxon } from '@/helpers/time/inputTime';
const props = defineProps({
  language: {
    type: String,
    required: true,
  },
  dates: {
    type: Array,
    required: true,
  },
  zoneId: {
    type: String,
    required: true,
  },
});
const slots = useSlots();
const emit = defineEmits(['weekdayClick']);
function formatTick(d) {
  return asInZoneTimeLuxon(d.toISOString(), props.zoneId).toJSDate().toLocaleString(props.language, { weekday: 'short', day: '2-digit' });
}
function isTickToday(d) {
  return asInZoneTimeLuxon(d.toISOString(), props.zoneId).hasSame(asInZoneTimeLuxon(DateTime.now(), props.zoneId), 'day');
}

function onWeekdayClick(date) {
  emit('weekdayClick', DateTime.fromJSDate(date));
}

</script>
<style scoped>
.weekday-col {
  flex: 1 1 0%;
  text-align: center;
  border-right: 1px solid rgb(var(--v-theme-quaternary-dark-2));
}
</style>
