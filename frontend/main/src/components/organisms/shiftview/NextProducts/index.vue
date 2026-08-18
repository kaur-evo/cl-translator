<template>
  <mobile-batch-widget v-if="isMobileView" :items="mobileBatchItems" />
  <batch-widget
    v-else
    title="Coming up"
    :productlist="orders"
    :value-class="valueClass"
  />
</template>
<script setup name="NextProducts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import BatchWidget from '@/components/organisms/shiftview/BatchWidget/index.vue';
import MobileBatchWidget from '@/components/organisms/shiftview/MobileBatchWidget/index.vue';
import { useDeviceStore, useShiftViewStore } from '@/stores';

const deviceStore = useDeviceStore();
const shiftViewStore = useShiftViewStore();
const { t } = useI18n();

defineProps({
  valueClass: {
    type: String,
    default: '',
  },
});

const isMobileView = computed(() => deviceStore.isMobileView);
const orders = computed(() => shiftViewStore.orders);

const mobileBatchItems = computed(() => orders.value.map((order) => ({
  rows: [
    order.productionOrder && { label: t('Order'), value: order.productionOrder },
    { label: t('Product'), value: order.productName },
    { label: t('quantity'), slot: { batch: order, showGoodQty: false } },
    order.productionOrderNote && { label: t('Extra note'), value: order.productionOrderNote },
  ].filter(Boolean),
})));
</script>
