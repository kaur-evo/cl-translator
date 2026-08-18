<template>
  <v-tooltip location="top">
    <template #activator="{ props }">
      <div class="d-flex align-start flex-column full-width" v-bind="props">
        <header-label-value-row
          v-if="currentBatch.productionOrder"
          :label="$t('Order')"
          :value="currentBatch.productionOrder"
          :large="large"
          :value-class="`${valueClass} text-truncate`"
          :class="{ 'mb-2': large }"
        />
        <header-label-value-row
          :label="$t('Product')"
          :value="`${sku}${currentBatch.productName}`"
          :large="large"
          :value-class="`${valueClass} text-truncate`"
          :class="{ 'mb-2': large }"
        />
        <batch-progress-row
          :large="large"
          :progress-type="progressType"
          :value-class="valueClass"
          :show-flag-icon="showFlagIcon"
          :expanded="expanded"
          :class="{ 'mb-2 flex-wrap': large }"
        />
        <header-label-value-row
          v-if="estimatedTime"
          :label="$t('Estimated time')"
          :large="large"
          :value-class="`${valueClass} d-flex align-center`"
          label-class="text-truncate"
        >
          <div :class="valueClass" class="mr-1 text-no-wrap">
            {{ estimatedTime }}
          </div>
          <evocon-v-tooltip-wrap :text="$t('Learn more')">
            <template #activator="{ props: activatorProps }">
              <v-icon
                v-bind="activatorProps"
                :size="large ? 24 : 16"
                @click="openHelp"
              >
                {{ mdiInformationOutline }}
              </v-icon>
            </template>
          </evocon-v-tooltip-wrap>
        </header-label-value-row>
      </div>
    </template>
    <evocon-v-tooltip
      :type="$t('Changeover')"
      :title="getBatchTitle(currentBatch)"
      :icon-color="colorConstants.dark['lw-blue']"
      :rows="getBatchTooltipRows(currentBatch, shift.shiftDate)"
    />
  </v-tooltip>
</template>
<script setup name="CurrentBatch">
import { computed } from 'vue';
import { mdiInformationOutline } from '@mdi/js';

import { getBatchTitle, getBatchTooltipRows } from '@/helpers/batch/batchHelpers';
import formatSecondsFriendly from '@/helpers/time/formatSecondsFriendly';
import EvoconVTooltipWrap from '@/components/atoms/EvoconVTooltipWrap/index.vue';
import HeaderLabelValueRow from '@/components/molecules/HeaderLabelValueRow/index.vue';
import BatchProgressRow from '@/components/organisms/shiftview/BatchProgressRow/index.vue';
import EvoconVTooltip from '@/components/atoms/EvoconVTooltip/index.vue';
import colorConstants from '@/constants/colorConstants';
import { useShiftviewTimelineStore, useShiftStore } from '@/stores';

const timelineStore = useShiftviewTimelineStore();
const shiftStore = useShiftStore();

defineProps({
  large: Boolean,
  valueClass: { type: String, default: '' },
  progressType: { type: String, default: 'bar' },
  showFlagIcon: Boolean,
  expanded: Boolean,
});

const currentBatch = computed(() => timelineStore.currentBatch);
const shift = computed(() => shiftStore.shift);

const sku = computed(() => {
  const { productName, productSku } = currentBatch.value;
  return productSku && productSku === productName ? '' : `${productSku} `;
});

const estimatedTime = computed(() => {
  const time = currentBatch.value.estimatedTimeLeft;
  if (!time) return '';
  return formatSecondsFriendly(time);
});

const openHelp = () => {
  window.open('https://support.evocon.com/Estimated-production-time-in-Shift-View-1904c0624c3e43c1a075b2075cc3b3b1', '_blank');
};
</script>
