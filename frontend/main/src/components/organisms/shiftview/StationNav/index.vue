<template>
  <div>
    <evocon-v-tooltip-wrap
      location="bottom"
      :text="$t('Previous station')"
    >
      <template #activator="{ props }">
        <evocon-v-button
          id="prev-station-btn"
          v-bind="props"
          color="white"
          :icon="mdiChevronLeft"
          :size="large ? 'large' : 'default'"
          @click.stop="navigateToStation(-1)"
        />
      </template>
    </evocon-v-tooltip-wrap>
    <evocon-v-tooltip-wrap
      location="bottom"
      :text="$t('Next station')"
    >
      <template #activator="{ props }">
        <evocon-v-button
          id="next-station-btn"
          v-bind="props"
          color="white"
          :icon="mdiChevronRight"
          :size="large ? 'large' : 'default'"
          @click.stop="navigateToStation(1)"
        />
      </template>
    </evocon-v-tooltip-wrap>
  </div>
</template>
<script setup name="StationNav">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';
import { mdiChevronLeft, mdiChevronRight } from '@mdi/js';

import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import EvoconVTooltipWrap from '@/components/atoms/EvoconVTooltipWrap/index.vue';
import { useStationStore, useFactoryStore } from '@/stores/index';

const stationStore = useStationStore();
const factoryStore = useFactoryStore();
const router = useRouter();

defineProps({
  large: { type: Boolean, default: false },
});

const { lineviewStation } = storeToRefs(stationStore);
const { orderedFactories } = storeToRefs(factoryStore);

const orderedStations = computed(() => orderedFactories.value.reduce((result, factory) => {
  result.push(...factory.stations);
  return result;
}, []));

const currentStationIndex = computed(() => orderedStations.value.findIndex((station) => station.id === lineviewStation.value.id));

const navigateToStation = (step) => {
  let index = currentStationIndex.value + step;
  if (index === -1) index = orderedStations.value.length - 1;
  else if (index === orderedStations.value.length) index = 0;
  router.push({ name: 'shiftview', params: { stationId: orderedStations.value[index].id } }).catch((e) => e);
};
</script>
