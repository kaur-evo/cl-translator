<template>
  <div :class="{ 'd-flex flex-column align-center': !compact}">
    <div
      class="shift-view-label d-flex"
      :class="labelClass"
    >
      {{ $t('OEE') }} ({{ lineviewStation.oeeGoalHappy }}%)
    </div>
    <oee-percentage-value v-if="expanded || compact" :value-class="valueClass" />
  </div>
</template>
<script setup name="ShiftViewOeeBlock">
import { computed } from 'vue';

import OeePercentageValue from '@/components/atoms/OeePercentageValue/index.vue';
import { useStationStore } from '@/stores';

const stationStore = useStationStore();

defineProps({
  labelClass: { type: String, default: '' },
  valueClass: { type: String, default: '' },
  compact: Boolean,
  expanded: Boolean,
});

const lineviewStation = computed(() => stationStore.lineviewStation);
</script>
