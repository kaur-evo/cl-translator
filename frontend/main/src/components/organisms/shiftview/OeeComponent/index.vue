<template>
  <div class="d-flex flex-column bg-black flex-grow-1 rounded overflow-hidden" :class="{ 'pa-2': !loading }">
    <shift-view-skeleton-loader v-if="loading" />
    <template v-else>
      <shift-view-oee-block :value-class="oeeClass" :label-class="labelClass" :expanded="expanded" />
      <div
        class="d-flex flex-grow-1 align-center"
        :class="vertical ? 'flex-column' : 'flex-row overflow-hidden'"
      >
        <shift-view-mr-evocon-wrapper :has-fixed-height="expanded" />
        <v-tooltip location="bottom">
          <template #activator="tooltipProps">
            <div
              v-bind="tooltipProps.props"
              class="d-flex flex-nowrap font-weight-medium max-width-100 align-center"
              :class="[oeeComponentsClass, vertical ? 'flex-row mt-4' : 'flex-column oee-text-wrapper ml-1']"
            >
              <oee-percentage-value
                v-if="!vertical"
                class="mb-1"
                :min-font-size="minOeeFontSize"
                :max-font-size="maxOeeFontSize"
              />
              <div class="white-space-nowrap text-primary text-truncate">
                {{ $t('availability').charAt(0) }} {{ shiftAvailability }}
              </div>
              <div class="white-space-nowrap text-lw-yellow text-truncate" :class="{ 'mx-2': vertical}">
                {{ $t('performance').charAt(0) }} {{ shiftPerformance }}
              </div>
              <div class="white-space-nowrap text-lw-orange text-truncate">
                {{ $t('quality').charAt(0) }} {{ shiftQuality }}
              </div>
            </div>
          </template>
          <evocon-v-tooltip :rows="tooltipRows" />
        </v-tooltip>
      </div>
    </template>
  </div>
</template>
<script setup name="OeeComponent">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import ShiftViewSkeletonLoader from '@/components/atoms/ShiftViewSkeletonLoader/index.vue';
import ShiftViewOeeBlock from '@/components/organisms/shiftview/ShiftViewOeeBlock/index.vue';
import ShiftViewMrEvoconWrapper from '@/components/organisms/shiftview/ShiftViewMrEvoconWrapper/index.vue';
import EvoconVTooltip from '@/components/atoms/EvoconVTooltip/index.vue';
import OeePercentageValue from '@/components/atoms/OeePercentageValue/index.vue';
import { formatPercentage } from '@/helpers/numbers/formatNumber';
import { useShiftStore } from '@/stores';

const { t } = useI18n();
const shiftStore = useShiftStore();

defineProps({
  loading: Boolean,
  oeeClass: {
    type: String,
    default: '',
  },
  oeeComponentsClass: {
    type: String,
    default: '',
  },
  labelClass: {
    type: String,
    default: '',
  },
  vertical: {
    type: Boolean,
    default: false,
  },
  minOeeFontSize: {
    type: Number,
    default: null,
  },
  maxOeeFontSize: {
    type: Number,
    default: null,
  },
  expanded: Boolean,
});

const shiftStats = computed(() => shiftStore.statistics.shiftTotal);

const shiftAvailability = computed(() => {
  const { oee, availability, delaysTime } = shiftStats.value;
  const formattedAvailability = formatPercentage((availability ?? 0) * 100);
  if (oee > 0 || delaysTime > 0) return formattedAvailability;
  return '-';
});

const shiftPerformance = computed(() => {
  const { performance } = shiftStats.value;
  return shiftStats.value.oee ? formatPercentage((performance ?? 0) * 100) : '-';
});

const shiftQuality = computed(() => {
  const { quality } = shiftStats.value;
  return shiftStats.value.oee ? formatPercentage((quality ?? 0) * 100) : '-';
});

const tooltipRows = computed(() => [
  { dotColor: 'primary', key: t('availability'), value: shiftAvailability.value },
  { dotColor: 'lw-yellow', key: t('performance'), value: shiftPerformance.value },
  { dotColor: 'lw-orange', key: t('quality'), value: shiftQuality.value },
]);

</script>
<style lang="scss" scoped>
.oee-text-wrapper {
  flex: 0 1 auto;
  max-width: 50%;
}
</style>
