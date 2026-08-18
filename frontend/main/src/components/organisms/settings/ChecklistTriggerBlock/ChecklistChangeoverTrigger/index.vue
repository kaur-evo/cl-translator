<template>
  <slot name="frequency-type" />
  <span class="d-flex align-center white-space-nowrap">
    <span class="ma-1">{{ $t('Show').toLowerCase() }}</span>
    <selection-input
      :model-value="[selectedTiming]"
      :items="timingOptions"
      use-chips
      is-single-select
      hide-search
      required
      menu-input-class="ma-1"
      @update:model-value="onSelectTiming($event[0])"
    />
    <evocon-number-input
      v-if="selectedTiming === BEFORE"
      :model-value="leadTimeMinutes"
      :error="hasLeadTimeError"
      :allow-float="false"
      suffix="min"
      use-chip
      grow
      class="ma-1"
      @update:model-value="onLeadTimeInput($event)"
    />
    <evocon-duration-chip
      v-else
      :model-value="requirements.delayTime"
      :max-hours="9999"
      class="ma-1"
      @update:model-value="$emit('update:requirements', { delayTime: $event })"
    />
    <span v-if="hasLeadTimeError" class="ma-1 text-caption text-error">
      {{ $t('Value must be between {min} and {max}', { min: LEAD_TIME_LIMITS.min, max: LEAD_TIME_LIMITS.max }) }}
    </span>
    <icon-with-tooltip
      v-if="selectedTiming === BEFORE"
      :icon="mdiInformationOutline"
      :tooltip-text="$t('Checklist is triggered by changeover, but shown on the previous product.')"
      additional-classes="ml-2"
    />
  </span>
  <slot name="frequency-actions" />
</template>
<script setup name="ChecklistChangeoverTrigger">
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { mdiInformationOutline } from '@mdi/js';

import EvoconDurationChip from '@/components/atoms/EvoconDurationChip/index.vue';
import EvoconNumberInput from '@/components/atoms/EvoconNumberInput/index.vue';
import IconWithTooltip from '@/components/atoms/IconWithTooltip/index.vue';
import SelectionInput from '@/components/molecules/SelectionInput/index.vue';
import { changeoverTriggerAppearances } from '@/constants/checklistsConstants';

const { t } = useI18n();

const LEAD_TIME_LIMITS = { min: 1, max: 30 };
const { BEFORE, AFTER } = changeoverTriggerAppearances;

const props = defineProps({
  requirements: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(['update:requirements', 'update:is-trigger-complete', 'update:has-trigger-error']);

const timingOptions = computed(() => [
  { name: t('Before'), id: BEFORE },
  { name: t('After'), id: AFTER },
]);

const selectedTiming = ref(props.requirements.leadTime > 0 ? BEFORE : AFTER);

const leadTimeMinutes = computed(() => (props.requirements.leadTime > 0 ? props.requirements.leadTime / 60 : null));

const hasLeadTimeError = computed(() => {
  if (selectedTiming.value !== BEFORE) return false;
  if (leadTimeMinutes.value === null) return true;
  return leadTimeMinutes.value < LEAD_TIME_LIMITS.min || leadTimeMinutes.value > LEAD_TIME_LIMITS.max;
});

const isTriggerComplete = computed(() => !hasLeadTimeError.value);

const onSelectTiming = (timing) => {
  selectedTiming.value = timing;
  if (timing === BEFORE) {
    emit('update:requirements', { delayTime: 0, leadTime: LEAD_TIME_LIMITS.min * 60 });
  } else {
    emit('update:requirements', { leadTime: 0, delayTime: 0 });
  }
};

const onLeadTimeInput = (minutes) => {
  emit('update:requirements', { leadTime: minutes === null ? null : minutes * 60 });
};

const validate = () => {
  if (!isTriggerComplete.value) emit('update:requirements', { leadTime: props.requirements.leadTime ?? null });
};

watch(isTriggerComplete, (newVal) => {
  emit('update:is-trigger-complete', newVal);
}, { immediate: true });

watch(hasLeadTimeError, (newVal) => {
  emit('update:has-trigger-error', newVal);
}, { immediate: true });

defineExpose({ validate });
</script>
