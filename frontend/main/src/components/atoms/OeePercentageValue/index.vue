<template>
  <div
    ref="scaledTextEl"
    class="text-no-wrap max-width-100 overflow-hidden"
    :class="[isGoodOEE ? 'text-primary' : '', valueClass]"
  >
    {{ oeeValue }}
  </div>
</template>
<script setup name="OeePercentageValue">
import { computed } from 'vue';

import { formatPercentage } from '@/helpers/numbers/formatNumber';
import useFittedFontSize from '@/composables/useFittedFontSize';
import useShiftStore from '@/stores/shift';
import useStationStore from '@/stores/station';

const shiftStore = useShiftStore();
const stationStore = useStationStore();

const props = defineProps({
  valueClass: { type: String, default: '' },
  minFontSize: { type: Number, default: null },
  maxFontSize: { type: Number, default: null },
});

const { scaledTextEl } = useFittedFontSize(
  () => props.minFontSize,
  () => props.maxFontSize,
);

const statistics = computed(() => shiftStore.statistics);
const lineviewStation = computed(() => stationStore.lineviewStation);

const isGoodOEE = computed(() => (statistics.value?.shiftTotal?.oee ?? 0) * 100 >= lineviewStation.value.oeeGoalHappy);

const oeeValue = computed(() => {
  const { oee, delaysTime } = statistics.value.shiftTotal || {};
  if (oee > 0 || !!delaysTime) return formatPercentage((oee || 0) * 100);
  return '-';
});
</script>
