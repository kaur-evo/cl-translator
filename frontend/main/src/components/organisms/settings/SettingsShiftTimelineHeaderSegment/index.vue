<template>
  <div class="py-2 align-center d-flex flex-wrap">
    <span class="d-flex">
      <evocon-v-chip
        :active="viewRangeConfig.isActive"
        :label="viewRangeConfig.resetChipLabel"
        type="primary"
        class="mr-2"
        @click="viewRangeConfig.onResetToCurrent"
      />
    </span>
    <span class="d-flex mr-4">
      <settings-shift-timeline-navigation-chip
        v-model:current-range-type="currentRangeType"
        :view-range-config="viewRangeConfig"
      />
    </span>

    <span class="d-flex text-headline-small font-weight-medium text-nowrap" :class="{'my-2': isMobileView }">
      {{ monthRangeLabel }}
    </span>
  </div>
</template>

<script setup>
import { computed } from 'vue';

import useProfileStore from '@/stores/profile';
import useDeviceStore from '@/stores/device';
import EvoconVChip from '@/components/atoms/EvoconVChip/index.vue';
import { viewRange } from '@/components/organisms/settings/SettingsShiftTimelineBlock/constants.js';
import { luxonApplyLocale } from '@/helpers/time/luxonHelpers.js';
import SettingsShiftTimelineNavigationChip from '@/components/organisms/settings/SettingsShiftTimelineNavigationChip/index.vue';
import { luxonApplyAsInZoneTime } from '@/helpers/time/inputTime.js';
const profileStore = useProfileStore();
const deviceStore = useDeviceStore();
const props = defineProps({ viewRangeConfig: { type: Object, required: true }, zoneId: { type: String, required: true } });
const language = computed(() => profileStore.language);
const startDate = defineModel('startDate', { type: Object, required: true });
const currentRangeType = defineModel('currentRangeType', { type: String, required: true, default: viewRange.WEEK });

const isMobileView = computed(() => deviceStore.isMobileView);

const monthRangeLabel = computed(() => {
  const start = luxonApplyAsInZoneTime(luxonApplyLocale(startDate.value), props.zoneId).startOf(currentRangeType.value, { useLocaleWeeks: true });
  const end = luxonApplyAsInZoneTime(luxonApplyLocale(startDate.value), props.zoneId).endOf(currentRangeType.value, { useLocaleWeeks: true });
  if (start.hasSame(end, 'month')) {
    return start.toJSDate().toLocaleString(language.value, { year: 'numeric', month: 'long' });
  }
  return `${start.toJSDate().toLocaleString(language.value, { month: 'long' })} - ${end.toJSDate().toLocaleString(language.value, { year: 'numeric', month: 'long' })}`;
});


</script>
