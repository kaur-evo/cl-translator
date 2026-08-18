<template>
  <div :class="[paddingClass, { 'align-center': !loading }]" class="bg-black d-flex flex-column rounded overflow-hidden">
    <shift-view-skeleton-loader v-if="loading" />
    <template v-else>
      <div
        class="shift-view-label mb-2"
        :class="{ 'large-label': large }"
      >
        {{ $t('Current batch') }}
      </div>
      <current-batch
        :large="large"
        :value-class="valueClass"
        :progress-type="progressType"
        :show-flag-icon="showFlagIcon"
      />
    </template>
  </div>
</template>
<script setup name="ShiftViewCurrentBatchBlock">
import { computed } from 'vue';

import ShiftViewSkeletonLoader from '@/components/atoms/ShiftViewSkeletonLoader/index.vue';
import CurrentBatch from '@/components/organisms/shiftview/CurrentBatch/index.vue';

const props = defineProps({
  loading: Boolean,
  large: Boolean,
  valueClass: { type: String, default: '' },
  progressType: { type: String, default: 'bar' },
  showFlagIcon: Boolean,
});

const paddingClass = computed(() => {
  if (props.loading) return '';
  return props.large ? 'pa-4' : 'pa-2';
});
</script>
