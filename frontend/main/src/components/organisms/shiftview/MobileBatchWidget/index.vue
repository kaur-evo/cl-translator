<template>
  <div v-if="items.length">
    <div
      v-for="(item, index) in items"
      :key="`batch-item-${index}`"
    >
      <header-label-value-row
        v-for="(row, rowIndex) in item.rows"
        :key="`batch-row-${row.label}-${rowIndex}`"
        :label="row.label"
        :value="row.value"
        value-class="text-body-medium"
      >
        <template v-if="row.slot" #default>
          <batch-quantity-amount
            class="flex-shrink-0"
            :batch="row.slot.batch"
            :show-good-qty="row.slot.showGoodQty"
          />
        </template>
      </header-label-value-row>
      <v-divider v-if="index < items.length - 1" class="my-1" />
    </div>
  </div>
  <small-placeholder-text
    v-else
    :primary-text="$t('No data available')"
  />
</template>
<script setup name="MobileBatchWidget">
import SmallPlaceholderText from '@/components/atoms/SmallPlaceholderText/index.vue';
import HeaderLabelValueRow from '@/components/molecules/HeaderLabelValueRow/index.vue';
import BatchQuantityAmount from '@/components/organisms/shiftview/BatchQuantityAmount/index.vue';

defineProps({
  items: {
    type: Array,
    required: true,
  },
});
</script>
