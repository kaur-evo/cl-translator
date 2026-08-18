<template>
  <v-card-text class="px-4 py-2">
    <v-row>
      <v-col
        cols="12"
        sm="6"
        :class="{ 'pb-2': isMobileView, 'pr-2': !isMobileView }"
      >
        <clickable-card
          :title="lineviewStation.manualShiftName"
          :content="[$t('Shift can be started between'), extraShiftStartRangeInfo]"
          :btn-text="$t('Start_verb')"
          @click="$emit('on-shift-start-card-click', false)"
        />
      </v-col>
      <v-col
        cols="12"
        sm="6"
        :class="{ 'mt-2': isMobileView, 'pl-2': !isMobileView }"
      >
        <clickable-card
          v-if="nextShiftName && plannedShiftRangeInfo"
          :title="nextShiftName"
          :content="[$t('Planned shift'), plannedShiftRangeInfo]"
          :btn-text="$t('Start early')"
          @click="$emit('on-shift-start-card-click', true)"
        />
        <v-card v-else class="fill-height">
          <v-card-text class="fill-height d-flex flex-column align-center justify-center text-center">
            <span class="text-body-large font-weight-medium pb-2">{{ $t('Planned shift') }}</span>
            <span>{{ $t('No shifts scheduled in next 24 hours') }}</span>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-card-text>
</template>
<script setup name="ShiftStartSelection">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';

import { formatTimeRange } from '@/helpers/time/formatTimeRange';
import ClickableCard from '@/components/atoms/ClickableCard/index.vue';
import { useStationStore, useDeviceStore, useProfileStore } from '@/stores/index';

const stationStore = useStationStore();
const deviceStore = useDeviceStore();
const profileStore = useProfileStore();

const props = defineProps({
  minStartFromRequest: {
    type: Object,
    default: () => ({}),
  },
  maxStartFromRequest: {
    type: Object,
    default: () => ({}),
  },
  maxEndFromRequest: {
    type: Object,
    default: () => ({}),
  },
  nextShiftStartFromRequest: {
    type: Object,
    default: () => ({}),
  },
  nextShiftEndFromRequest: {
    type: Object,
    default: () => ({}),
  },
  nextShiftName: {
    type: String,
    default: '',
  },
});

defineEmits(['on-shift-start-card-click']);

const { lineviewStation } = storeToRefs(stationStore);
const { isMobileView } = storeToRefs(deviceStore);
const { timeFormat, dateFormat } = storeToRefs(profileStore);

const extraShiftStartRangeInfo = computed(() => formatTimeRange([props.minStartFromRequest, props.maxStartFromRequest], dateFormat.value, timeFormat.value));

const plannedShiftRangeInfo = computed(() => {
  if (props.nextShiftStartFromRequest.toISO() && props.nextShiftEndFromRequest.toISO() && props.nextShiftStartFromRequest.toISO() <= props.maxEndFromRequest.toISO()) {
    return formatTimeRange([props.nextShiftStartFromRequest, props.nextShiftEndFromRequest], dateFormat.value, timeFormat.value);
  }
  return null;
});
</script>
