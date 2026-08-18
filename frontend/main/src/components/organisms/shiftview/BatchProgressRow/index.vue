<template>
  <div class="d-flex align-center full-width">
    <template v-if="batchQuantityParts.plannedQty">
      <div class="d-flex align-center" :class="large ? 'mr-2' : 'mr-1'" :style="{ order: large ? 0 : 1 }">
        <v-progress-circular
          v-if="progressType === 'circle'"
          :color="isOverTarget ? 'lw-yellow' : 'primary'"
          :model-value="producedPercentage"
          size="12"
          width="2"
          class="mr-1 my-auto"
        />
        <div>
          <span :class="valueClass" class="text-no-wrap text-primary">{{ batchQuantityParts.goodQty }}</span>
          <span v-if="batchQuantityParts.scrapQty" :class="valueClass" class="text-no-wrap text-lw-orange ml-1">({{ batchQuantityParts.scrapQty }})</span>
        </div>
      </div>
      <div class="d-flex align-center text-no-wrap text-truncate" :class="{ 'justify-end': large }" :style="{ order: large ? 1 : 3, flex: large ? 1 : '' }">
        <v-icon v-if="showFlagIcon && isTargetReached" :size="large ? 24 : 16">
          {{ mdiFlagCheckered }}
        </v-icon>
        <span v-else-if="!showFlagIcon && !expanded">/</span>
        <span :class="valueClass" class="text-truncate ml-1">{{ batchQuantityParts.plannedQty }} {{ batchQuantityParts.unitId }}</span>
      </div>
      <v-progress-linear
        v-if="progressType === 'bar'"
        :color="isOverTarget ? 'lw-yellow' : 'primary'"
        :model-value="producedPercentage"
        bg-color="lw-gray"
        bg-opacity="1"
        :height="large ? 10 : 6"
        :class="large ? 'my-2' : 'mr-1'"
        :style="{ order: 2, flex: large ? '' : 1 }"
        rounded
      />
    </template>
    <header-label-value-row v-else :label="$t('quantity')" :large="large">
      <span :class="valueClass" class="text-no-wrap text-primary">{{ batchQuantityParts.goodQty }}</span>
      <span v-if="batchQuantityParts.scrapQty" :class="valueClass" class="text-no-wrap text-lw-orange ml-1">({{ batchQuantityParts.scrapQty }})</span>
      <span :class="valueClass" class="text-no-wrap ml-1">{{ batchQuantityParts.unitId }}</span>
    </header-label-value-row>
  </div>
</template>
<script setup name="BatchProgressRow">
import { computed } from 'vue';
import { mdiFlagCheckered } from '@mdi/js';

import { getBatchQuantityParts } from '@/helpers/batch/batchHelpers';
import HeaderLabelValueRow from '@/components/molecules/HeaderLabelValueRow/index.vue';
import { useShiftviewTimelineStore, useUserPreferencesStore } from '@/stores';

const timelineStore = useShiftviewTimelineStore();
const userPreferencesStore = useUserPreferencesStore();

defineProps({
  large: Boolean,
  showFlagIcon: Boolean,
  expanded: Boolean,
  progressType: { type: String, default: 'bar' }, // 'bar' | 'circle'
  valueClass: { type: String, default: '' },
});

const currentBatch = computed(() => timelineStore.currentBatch);
const preferAltUnit = computed(() => !userPreferencesStore.viewSettings?.usePrimaryUnit);

const batchQuantityParts = computed(() => getBatchQuantityParts(currentBatch.value, preferAltUnit.value));

const goodQtyPrimary = computed(() => currentBatch.value.producedQty - currentBatch.value.scrapQty);

const isOverTarget = computed(() => goodQtyPrimary.value > currentBatch.value.plannedQty);
const isTargetReached = computed(() => currentBatch.value.plannedQty > 0 && goodQtyPrimary.value >= currentBatch.value.plannedQty);

const producedPercentage = computed(() => {
  let percent = 0;
  if (currentBatch.value.productId && currentBatch.value.plannedQty !== 0) {
    percent = Math.min(goodQtyPrimary.value, currentBatch.value.plannedQty) / currentBatch.value.plannedQty;
  }
  return percent * 100;
});
</script>
