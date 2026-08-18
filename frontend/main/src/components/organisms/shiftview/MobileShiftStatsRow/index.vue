<template>
  <div class="stats-row-container">
    <div class="d-flex mt-1 align-start stats-row-scroll">
      <shift-view-oee-block class="slot" compact value-class="text-body-medium font-weight-medium" />
      <shift-view-shift-quantity-block class="slot" compact value-class="text-body-medium font-weight-medium" />
      <div class="slot">
        <span class="shift-view-label">{{ $t('Batch quantity') }}</span>
        <batch-quantity-amount :batch="currentBatch" show-progress text-class="text-body-medium font-weight-medium text-truncate max-width-100" />
      </div>
      <div v-if="currentBatch.productionOrder" class="slot">
        <div class="shift-view-label">
          {{ $t('Order') }}
        </div>
        <div class="text-body-medium font-weight-medium text-truncate max-width-100">
          {{ currentBatch.productionOrder }}
        </div>
      </div>
      <div class="slot">
        <div class="shift-view-label">
          {{ $t('Product') }}
        </div>
        <div class="text-body-medium font-weight-medium text-truncate max-width-100">
          {{ sku }}{{ currentBatch.productName }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup name="MobileShiftStatsRow">
import { computed } from 'vue';

import { useShiftviewTimelineStore } from '@/stores/index';
import ShiftViewOeeBlock from '@/components/organisms/shiftview/ShiftViewOeeBlock/index.vue';
import ShiftViewShiftQuantityBlock from '@/components/organisms/shiftview/ShiftViewShiftQuantityBlock/index.vue';
import BatchQuantityAmount from '@/components/organisms/shiftview/BatchQuantityAmount/index.vue';

const shiftviewTimelineStore = useShiftviewTimelineStore();

const currentBatch = computed(() => shiftviewTimelineStore.currentBatch);

const sku = computed(() => {
  const { productName, productSku } = currentBatch.value;
  return productSku && productSku === productName ? '' : `${productSku} `;
});
</script>

<style lang="scss" scoped>
.stats-row-container {
  position: relative;

  &::before,
  &::after {
    content: "";
    position: absolute;
    top: 0;
    bottom: 0;
    width: 16px;
    z-index: 1;
    pointer-events: none;
  }

  &::before {
    left: 0;
    background: linear-gradient(90deg, rgb(var(--v-theme-primary-dark)) 0%, rgba(var(--v-theme-primary-dark), 0) 100%);
  }

  &::after {
    right: 0;
    background: linear-gradient(270deg, rgb(var(--v-theme-primary-dark)) 0%, rgba(var(--v-theme-primary-dark), 0) 100%);
  }
}

.stats-row-scroll {
  overflow-x: auto;
  scrollbar-width: none;
  padding: 0 8px;
}

.slot {
  padding: 8px;
  margin-right: 8px;
  display: flex;
  flex-direction: column;
  flex-grow: 0;
  flex-shrink: 0;
  justify-content: flex-start;
  align-items: flex-start;
  max-width: 400px;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
