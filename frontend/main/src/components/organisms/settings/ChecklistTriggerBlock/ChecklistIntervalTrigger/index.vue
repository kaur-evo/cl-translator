<template>
  <slot name="frequency-type" />
  <span class="d-flex align-center white-space-nowrap">
    <span class="ma-1">{{ $t('Show every').toLowerCase() }}</span>
    <evocon-duration-chip
      :model-value="requirements.intervalTime"
      :max-hours="9999"
      class="ma-1"
      :error="hasIntervalError"
      @update:model-value="$emit('update:requirements', { intervalTime: $event })"
    />
    <span v-if="hasIntervalError" class="ma-1 text-body-small text-error"> {{ $t('At least {value} min', { value: 1 }) }}</span>
  </span>
  <slot name="frequency-actions" />
</template>
<script setup name="ChecklistIntervalTrigger">
import { computed, watch } from 'vue';

import EvoconDurationChip from '@/components/atoms/EvoconDurationChip/index.vue';

const props = defineProps({
  requirements: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(['update:requirements', 'update:is-trigger-complete', 'update:has-trigger-error']);

const isTriggerComplete = computed(() => props.requirements.intervalTime !== null);
const hasIntervalError = computed(() => props.requirements.intervalTime !== null && props.requirements.intervalTime < 60);

const validate = () => {
  if (!isTriggerComplete.value) emit('update:requirements', { intervalTime: 0 });
};

watch(isTriggerComplete, (newVal) => {
  emit('update:is-trigger-complete', newVal);
}, { immediate: true });

watch(hasIntervalError, (newVal) => {
  emit('update:has-trigger-error', newVal);
}, { immediate: true });

defineExpose({ validate });
</script>
