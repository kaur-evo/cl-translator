<template>
  <slot name="frequency-type" />
  <slot name="frequency-actions" />
  <div class="d-flex flex-column full-width pa-2">
    <template v-for="item in offsetItems" :key="item.key">
      <span class="d-flex align-center">
        <evocon-v-checkbox
          :model-value="requirements[item.key] !== null"
          :error="showIncompleteError"
          @update:model-value="onToggleOffset(item.key, $event)"
        />
        <evocon-duration-chip
          :model-value="requirements[item.key]"
          :max-hours="99"
          class="ma-1"
          :disabled="requirements[item.key] === null"
          :error="item.error"
          @update:model-value="$emit('update:requirements', { [item.key]: $event })"
        />
        <span v-if="item.error && !isMobileView" class="ma-1 text-caption text-error">{{ $t('Shift duration (max 24 h)') }}</span>
        <span class="ml-1">{{ item.label }}</span>
      </span>
      <span v-if="item.error && isMobileView" class="pl-10 text-caption text-error">{{ $t('Shift duration (max 24 h)') }}</span>
    </template>
  </div>
</template>
<script setup name="ChecklistShiftTrigger">
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import useDeviceStore from '@/stores/device';
import EvoconVCheckbox from '@/components/atoms/EvoconVCheckbox/index.vue';
import EvoconDurationChip from '@/components/atoms/EvoconDurationChip/index.vue';

const MAX_HOURS = 24;
const MAX_SECONDS = MAX_HOURS * 3600;

const { t } = useI18n();
const deviceStore = useDeviceStore();

const props = defineProps({
  requirements: {
    type: Object,
    default: () => ({ offsetFromStartSeconds: null, offsetFromEndSeconds: null }),
  },
});

const emit = defineEmits(['update:requirements', 'update:is-trigger-complete', 'update:has-trigger-error']);

const isMobileView = computed(() => deviceStore.isMobileView);

const showIncompleteError = ref(false);

const hasOffsetError = (key) => props.requirements[key] !== null && props.requirements[key] > MAX_SECONDS;
const hasTriggerError = computed(() => hasOffsetError('offsetFromStartSeconds') || hasOffsetError('offsetFromEndSeconds') || showIncompleteError.value);

const isTriggerComplete = computed(() => props.requirements.offsetFromStartSeconds !== null || props.requirements.offsetFromEndSeconds !== null);

const offsetItems = computed(() => [
  { key: 'offsetFromStartSeconds', label: t('After shift start').toLowerCase(), error: hasOffsetError('offsetFromStartSeconds') },
  { key: 'offsetFromEndSeconds', label: t('Before shift end').toLowerCase(), error: hasOffsetError('offsetFromEndSeconds') },
]);

const onToggleOffset = (key, checked) => emit('update:requirements', { [key]: checked ? 0 : null });

const validate = () => {
  if (!isTriggerComplete.value) {
    showIncompleteError.value = true;
  }
};

watch(isTriggerComplete, (newVal) => {
  emit('update:is-trigger-complete', newVal);
  if (newVal) showIncompleteError.value = false;
}, { immediate: true });

watch(hasTriggerError, (newVal) => {
  emit('update:has-trigger-error', newVal);
}, { immediate: true });

defineExpose({ validate });
</script>
