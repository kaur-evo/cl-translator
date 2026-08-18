<template>
  <slot name="frequency-type" />
  <span class="d-flex align-center white-space-nowrap">
    <span class="ma-1">{{ $t('Show every').toLowerCase() }}</span>
    <evocon-number-input
      :model-value="requirements.targetQty"
      :error="hasTriggerError"
      :suffix="$t('units')"
      use-chip
      grow
      class="ma-1"
      @update:model-value="$emit('update:requirements', { targetQty: $event })"
    />
  </span>
  <slot name="frequency-actions" />
</template>
<script setup name="ChecklistQuantityTrigger">
import { computed, watch } from 'vue';

import EvoconNumberInput from '@/components/atoms/EvoconNumberInput/index.vue';

const props = defineProps({
  requirements: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(['update:requirements', 'update:is-trigger-complete', 'update:has-trigger-error']);

const isTriggerComplete = computed(() => props.requirements.targetQty > 0);
const hasTriggerError = computed(() => props.requirements.targetQty === 0);

const validate = () => {
  if (!isTriggerComplete.value) emit('update:requirements', { targetQty: 0 });
};

watch(isTriggerComplete, (newVal) => {
  emit('update:is-trigger-complete', newVal);
}, { immediate: true });

watch(hasTriggerError, (newVal) => {
  emit('update:has-trigger-error', newVal);
}, { immediate: true });

defineExpose({ validate });
</script>
