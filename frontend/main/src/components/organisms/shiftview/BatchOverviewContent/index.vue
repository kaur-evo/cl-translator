<template>
  <div class="batch-overview-content pb-1">
    <generic-tabs-row
      v-model="activeTabIndex"
      :items="tabs"
      :height="48"
      :dark="false"
      :disabled-rule-func="isTabDisabled"
      label-key="name"
      class="px-4"
    />
    <v-window
      v-model="activeTabIndex"
      class="batch-overview-window"
      :class="{ 'batch-overview-window--scrollable': scrollable }"
    >
      <v-window-item
        v-for="tabObj in tabs"
        :key="`tab-item-${tabObj.key}`"
        class="px-4"
      >
        <shiftview-cards-list
          :items="tabObj.items"
          :title-text-key="tabObj.titleTextKey"
          :subtitle-items-props="tabObj.subtitleItemsProps"
          vertical-subtitle
          disabled
        />
      </v-window-item>
    </v-window>
  </div>
</template>
<script setup name="BatchOverviewContent">
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import GenericTabsRow from '@/components/molecules/GenericTabsRow/index.vue';
import ShiftviewCardsList from '@/components/organisms/shiftview/ShiftviewCardsList/index.vue';
import { formatBatchTargetDisplay, formatBatchEstimatedTime, getBatchCardTitle, getBatchQuantityParts } from '@/helpers/batch/batchHelpers';
import {
  useConfigurationStore,
  useShiftviewTimelineStore,
  useShiftViewStore,
  useUserPreferencesStore,
} from '@/stores';

const props = defineProps({
  tab: {
    type: String,
    default: '',
  },
  scrollable: Boolean,
});

const { t } = useI18n();

const configurationStore = useConfigurationStore();
const timelineStore = useShiftviewTimelineStore();
const shiftViewStore = useShiftViewStore();
const userPreferencesStore = useUserPreferencesStore();

const productChangeTabs = computed(() => configurationStore.productChangeTabs);
const batches = computed(() => timelineStore.batches);
const currentBatch = computed(() => timelineStore.currentBatch);
const orders = computed(() => shiftViewStore.orders);
const viewSettings = computed(() => userPreferencesStore.viewSettings);
const preferAltUnit = computed(() => !viewSettings.value?.usePrimaryUnit);

const ordersEnabled = computed(() => productChangeTabs.value.includes('orders'));

const completedItems = computed(() => {
  const allBatches = Array.from(batches.value.values());
  const currentBatchId = currentBatch.value?.id;
  return allBatches
    .filter((batch) => batch.id !== currentBatchId)
    .map((batch) => ({ ...batch, ...getQuantityFields(batch) }));
});

const currentItem = computed(() => {
  const batch = currentBatch.value;
  if (!batch || !batch.id) return [];
  return [{
    ...batch,
    estimatedTimeDisplay: formatBatchEstimatedTime(batch),
    ...getQuantityFields(batch),
  }];
});

const upcomingItems = computed(() => orders.value.map((order) => ({
  ...order,
  targetDisplay: formatBatchTargetDisplay(order),
})));

const getQuantityFields = (batch) => {
  const { goodQty, scrapQty, plannedQty, unitId } = getBatchQuantityParts(batch, preferAltUnit.value);
  return {
    quantityPrimary: `${goodQty}`,
    quantitySecondary: scrapQty ? `${scrapQty}` : '',
    quantityTertiary: plannedQty ? `/ ${plannedQty} ${unitId}` : unitId,
  };
};

const quantitySubtitleItem = {
  text: t('quantity'),
  valueKey: 'quantityPrimary',
  primaryValueClass: 'text-primary',
  secondaryValueKey: 'quantitySecondary',
  secondaryValueClass: 'text-lw-orange',
  tertiaryValueKey: 'quantityTertiary',
  isVisible: true,
};

const completedSubtitleProps = (item) => filterVisibleFields([
  { text: t('Product code'), valueKey: 'productSku' },
  { text: t('Product'), valueKey: 'productName', isVisible: showProductName },
  quantitySubtitleItem,
  { text: t('LOT/Batch'), valueKey: 'lotCode' },
  { text: t('Extra note'), valueKey: 'notes' },
], item);

const currentSubtitleProps = (item) => filterVisibleFields([
  { text: t('Product code'), valueKey: 'productSku' },
  { text: t('Product'), valueKey: 'productName', isVisible: showProductName },
  quantitySubtitleItem,
  { text: t('Estimated time'), valueKey: 'estimatedTimeDisplay' },
  { text: t('LOT/Batch'), valueKey: 'lotCode' },
  { text: t('Extra note'), valueKey: 'notes' },
], item);

const upcomingSubtitleProps = (item) => filterVisibleFields([
  { text: t('Product code'), valueKey: 'productSku' },
  { text: t('Product'), valueKey: 'productName' },
  { text: t('Target'), valueKey: 'targetDisplay' },
], item);

const tabs = computed(() => {
  const list = [
    {
      key: 'completed',
      name: t('Completed batches'),
      items: completedItems.value,
      titleTextKey: getBatchCardTitle,
      subtitleItemsProps: completedSubtitleProps,
    },
    {
      key: 'current',
      name: t('Current batch'),
      items: currentItem.value,
      titleTextKey: getBatchCardTitle,
      subtitleItemsProps: currentSubtitleProps,
    },
  ];

  if (ordersEnabled.value) {
    list.push({
      key: 'upcoming',
      name: t('Upcoming batches'),
      items: upcomingItems.value,
      titleTextKey: 'productionOrder',
      subtitleItemsProps: upcomingSubtitleProps,
    });
  }

  return list;
});

const isTabDisabled = (tab) => !tab.items?.length;

const findTabIndex = (key) => {
  const index = tabs.value.findIndex((tab) => tab.key === key);
  if (index >= 0 && !isTabDisabled(tabs.value[index])) return index;
  const firstEnabledIndex = tabs.value.findIndex((tab) => !isTabDisabled(tab));
  return firstEnabledIndex >= 0 ? firstEnabledIndex : 0;
};

const activeTabIndex = ref(findTabIndex(props.tab));

watch(() => props.tab, (newKey) => {
  activeTabIndex.value = findTabIndex(newKey);
});

const showProductName = (item) => !!item.productionOrder;

const filterVisibleFields = (fields, item) => fields.filter(({ valueKey, isVisible }) => {
  if (isVisible === true) return true;
  if (!item[valueKey]) return false;
  return !isVisible || isVisible(item);
});
</script>

<style lang="scss" scoped>
.batch-overview-content {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.batch-overview-window {
  overflow-y: auto;
  flex: 1 1 auto;

  &--scrollable {
    max-height: calc(var(--app-height) * 0.9px - 180px);
  }
}
</style>
