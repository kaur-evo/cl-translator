<template>
  <range-chip-selection
    :prev-btn-tooltip-text="viewRangeConfig.prevBtnTooltipText"
    :previous-disabled="viewRangeConfig.isPreviousDisabled"
    :next-btn-tooltip-text="viewRangeConfig.nextBtnTooltipText"
    :next-disabled="viewRangeConfig.isNextDisabled"
    :range-label="viewRangeConfig.label"
    is-chip-active
    :is-open="isViewRangeOpenCalculated"
    @click-previous="viewRangeConfig.onPreviousClick"
    @click-next="viewRangeConfig.onNextClick"
    @update:is-open="setViewRangeMenuOpen($event)"
  >
    <template #selection-list>
      <selection-list
        :model-value="[currentRangeType]"
        :items="Array.from(viewRangeOptions.values())"
        is-single-select
        hide-search
        required
        dense
        :height="null"
        width="300px"
        item-text="label"
        item-value="value"
        @update:model-value="currentRangeType = $event[0]"
      />
    </template>
  </range-chip-selection>
</template>
<script setup>

import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';

import useDeviceStore from '@/stores/device';
import RangeChipSelection from '@/components/molecules/RangeChipSelection/index.vue';
import SelectionList from '@/components/molecules/SelectionList/index.vue';
import { viewRange } from '@/components/organisms/settings/SettingsShiftTimelineBlock/constants.js';

const { t } = useI18n();
const props = defineProps({ viewRangeConfig: { type: Object, required: true } });
const currentRangeType = defineModel('currentRangeType', { type: String, required: true });

const deviceStore = useDeviceStore();
const isViewRangeOpen = ref(false);
const isMobileView = computed(() => deviceStore.isMobileView);
const isViewRangeOpenCalculated = computed(() => (isMobileView.value ? false : isViewRangeOpen.value));

function setViewRangeMenuOpen(val) {
  if (isMobileView.value) {
    isViewRangeOpen.value = false;
  } else {
    isViewRangeOpen.value = val;
  }
}

const viewRangeOptions = new Map([
  [viewRange.DAY, { value: viewRange.DAY, label: t('Day') }],
  [viewRange.WEEK, { value: viewRange.WEEK, label: t('Week') }],
]);

</script>
