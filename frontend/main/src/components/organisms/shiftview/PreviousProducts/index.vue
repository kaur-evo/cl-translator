<template>
  <mobile-batch-widget v-if="isMobileView" :items="mobileBatchItems" />
  <batch-widget
    v-else
    class="previous-products pr-1"
    title="Previous"
    :productlist="visibleBatches"
    :value-class="valueClass"
    show-tooltip
  />
</template>
<script setup name="PreviousProducts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import { formatDate } from '@/helpers/date/formatDate';
import { formatTime } from '@/helpers/time/formatTime';
import BatchWidget from '@/components/organisms/shiftview/BatchWidget/index.vue';
import MobileBatchWidget from '@/components/organisms/shiftview/MobileBatchWidget/index.vue';
import { useDeviceStore, useShiftviewTimelineStore } from '@/stores';

const deviceStore = useDeviceStore();
const timelineStore = useShiftviewTimelineStore();
const { t } = useI18n();

defineProps({
  valueClass: {
    type: String,
    default: '',
  },
});

const isMobileView = computed(() => deviceStore.isMobileView);
const batches = computed(() => timelineStore.batches);
const currentBatch = computed(() => timelineStore.currentBatch);

const visibleBatches = computed(() => {
  const currentId = currentBatch.value.id;
  return [...batches.value.values()].filter((batch) => batch.id !== currentId);
});

const getBatchStartTime = (batch) => `${formatTime(batch.startTime)} - ${formatDate(batch.startTime, 'long')}`;

const mobileBatchItems = computed(() => visibleBatches.value.map((batch) => ({
  rows: [
    batch.productionOrder && { label: t('Order'), value: batch.productionOrder },
    { label: t('Product'), value: batch.productName },
    { label: t('quantity'), slot: { batch, showGoodQty: true } },
    { label: t('Start time'), value: getBatchStartTime(batch) },
    batch.notes && { label: t('Extra note'), value: batch.notes },
  ].filter(Boolean),
})));
</script>
