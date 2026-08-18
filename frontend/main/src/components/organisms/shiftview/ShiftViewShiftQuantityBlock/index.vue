<template>
  <div :class="[paddingClass, { 'bg-black flex-grow-1': !compact, 'align-center': !compact && !loading }]" class="d-flex flex-column rounded overflow-hidden">
    <shift-view-skeleton-loader v-if="loading" />
    <template v-else>
      <div
        class="shift-view-label text-truncate"
        :class="{ 'large-label': large }"
      >
        {{ $t('Shift quantity') }}
      </div>
      <div v-if="compact" :class="valueClass" class="text-truncate max-width-100">
        {{ shiftTotalLabel }} / {{ shiftIdealLabel }} {{ shiftUnit }}
      </div>
      <div v-else class="d-flex flex-column align-center justify-center flex-grow-1 max-width-100">
        <div ref="scaledTextEl" :class="valueClass" class="max-width-100 overflow-hidden text-no-wrap">
          {{ shiftTotalLabel }}
        </div>
        <div :class="targetClass" class="text-quaternary-dark-2 d-flex align-center max-width-100 font-weight-regular">
          <div class="text-truncate">
            {{ shiftIdealLabel }} {{ shiftUnit }}
          </div>
          <icon-with-tooltip
            :icon="mdiInformationOutline"
            :tooltip-text="$t('Learn more')"
            color="white"
            :icon-clicked-fn="onIconClick"
            :button-size="large ? 'small' : 'extra-small'"
          />
        </div>
      </div>
    </template>
  </div>
</template>
<script setup name="ShiftViewShiftQuantityBlock">
import { computed, toRefs } from 'vue';
import { isAfter, isBefore } from 'date-fns';
import { mdiInformationOutline } from '@mdi/js';

import ShiftViewSkeletonLoader from '@/components/atoms/ShiftViewSkeletonLoader/index.vue';
import IconWithTooltip from '@/components/atoms/IconWithTooltip/index.vue';
import { formatNumber } from '@/helpers/numbers/formatNumber';
import useFittedFontSize from '@/composables/useFittedFontSize';
import {
  useShiftviewTimelineStore,
  useUserPreferencesStore,
  useShiftStore,
} from '@/stores';

const props = defineProps({
  loading: Boolean,
  compact: { type: Boolean, default: false },
  valueClass: { type: String, default: '' },
  targetClass: { type: String, default: '' },
  large: { type: Boolean, default: false },
  minShiftTotalFontSize: { type: Number, default: null },
  maxShiftTotalFontSize: { type: Number, default: null },
});

const shiftviewTimelineStore = useShiftviewTimelineStore();
const userPreferencesStore = useUserPreferencesStore();
const shiftStore = useShiftStore();

const paddingClass = computed(() => {
  if (props.loading) return '';
  return props.large ? 'px-2 py-4' : 'px-2 py-2';
});


const { minShiftTotalFontSize, maxShiftTotalFontSize } = toRefs(props);
const { scaledTextEl } = useFittedFontSize(minShiftTotalFontSize, maxShiftTotalFontSize);

const shiftScrapDisplayValue = computed(() => shiftviewTimelineStore.shiftScrapDisplayValue);
const shiftTotalDisplayValue = computed(() => shiftviewTimelineStore.shiftTotalDisplayValue);
const batches = computed(() => shiftviewTimelineStore.batches);
const viewSettings = computed(() => userPreferencesStore.viewSettings);
const shift = computed(() => shiftStore.shift);
const statistics = computed(() => shiftStore.statistics);

const shiftTotalLabel = computed(() => {
  const qty = viewSettings.value.useShiftGoodQty ? shiftTotalDisplayValue.value - shiftScrapDisplayValue.value : shiftTotalDisplayValue.value;
  return formatNumber(qty);
});

const shiftIdealLabel = computed(() => {
  const { usePrimaryUnit } = viewSettings.value;
  const key = usePrimaryUnit ? 'idealQty' : 'idealAltQty';
  const idealQty = statistics.value?.shiftTotal?.[key] || 0;
  return formatNumber(idealQty);
});

const shiftUnit = computed(() => {
  const unitKey = viewSettings.value.usePrimaryUnit ? 'unitId' : 'alternativeUnitId';
  const batchValues = [...batches.value.values()];
  const shiftUnits = batchValues.reduce((acc, batch) => {
    const batchEnd = batch.endTimeISO ? new Date(batch.endTimeISO) : new Date();
    if (isAfter(batchEnd, new Date(shift.value.startTimeISO))
      && isBefore(new Date(batch.startTimeISO), new Date(shift.value.endTimeISO))) {
      const unit = batch[unitKey]?.toLowerCase();
      acc.add(unit);
    }
    const unit = batch.unit?.toLowerCase();
    if (unit) acc.add(unit);
    return acc;
  }, new Set());
  if (shiftUnits.size > 1) return '';
  return [...shiftUnits][0];
});

const onIconClick = () => {
  window.open('https://support.evocon.com/Shift-View-overview-3f0871bf0974427fba060b82cca8549f', '_blank');
};
</script>
