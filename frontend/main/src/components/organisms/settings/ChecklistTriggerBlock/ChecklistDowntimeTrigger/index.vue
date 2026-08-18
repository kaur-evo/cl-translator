<template>
  <slot name="frequency-type" />
  <selection-input
    :model-value="requirements.commentIds"
    :items="filteredComments"
    :groups="commentGroupsIncludePredefined"
    :prepend-text="`${$t('Stops')}:`"
    use-chips
    is-grouped-select
    groups-order-by="ordering"
    numeric-order-by
    show-empty-array-as-all-selected
    remove-non-existent-selections
    max-width="300px"
    min-width="300px"
    menu-input-class="ma-1"
    @update:model-value="$emit('update:requirements', { commentIds: $event })"
  />
  <selection-input
    :model-value="[subType]"
    :items="subTypesArray"
    menu-input-class="ma-1"
    use-chips
    is-single-select
    hide-search
    required
    @update:model-value="onCheckSubTypeChange"
  />
  <template v-if="subType === alertSubtypes.EXCEEDS">
    <evocon-duration-chip
      :model-value="requirements.setpoint"
      :max-hours="99"
      class="ma-1"
      :error="hasStopReasonDurationError"
      @update:model-value="$emit('update:requirements', { setpoint: $event })"
    />
    <span v-if="hasStopReasonDurationError" class="ml-1 text-body-small text-error"> {{ $t('At least {value} min', { value: 5 }) }}</span>
  </template>
  <slot name="frequency-actions" />
</template>
<script setup name="ChecklistDowntimeTrigger">
import { ref, computed, watch } from 'vue';

import useCommentStore from '@/stores/comment';
import useConfigurationStore from '@/stores/configuration';
import i18n from '@/services/i18n';
import { alertSubtypes } from '@/constants/alerts';
import EvoconDurationChip from '@/components/atoms/EvoconDurationChip/index.vue';
import SelectionInput from '@/components/molecules/SelectionInput/index.vue';

const commentStore = useCommentStore();
const configurationStore = useConfigurationStore();

const props = defineProps({
  requirements: {
    type: Object,
    default: () => {},
  },
});

const emit = defineEmits(['update:requirements', 'update:is-trigger-complete', 'update:has-trigger-error']);

const subType = ref(props.requirements.setpoint === 0 ? alertSubtypes.ADDED : alertSubtypes.EXCEEDS);
const comments = computed(() => commentStore.comments);
const commentGroupsIncludePredefined = computed(() => commentStore.commentGroupsIncludePredefined);
const commentGroupsMap = computed(() => commentStore.commentGroupsMap);
const adminChecklistStations = computed(() => configurationStore.adminChecklistStations);

const availableStationIds = computed(() => (props.requirements.stationIds.length ? props.requirements.stationIds : adminChecklistStations.value));

const hasStopReasonDurationError = computed(() => subType.value === alertSubtypes.EXCEEDS && props.requirements.setpoint < 5 * 60 && props.requirements.setpoint !== null);

const subTypesArray = computed(() => [
  { id: alertSubtypes.EXCEEDS, name: i18n.global.t('Lasts longer than'), durationDefault: null, countDefault: 1 },
  { id: alertSubtypes.ADDED, name: i18n.global.t('Is added'), durationDefault: 0, countDefault: 1 },
]);

const filteredComments = computed(() => comments.value.filter((comment) => {
  if (!commentGroupsMap.value[comment.groupId]?.local) return true;
  return comment.stationIds.some((id) => availableStationIds.value.includes(id));
}));

const isTriggerComplete = computed(() => {
  if (subType.value === alertSubtypes.EXCEEDS) {
    return props.requirements.setpoint !== null;
  }
  return true;
});

const onCheckSubTypeChange = (newSubType) => {
  subType.value = newSubType[0];
  const currentSubType = subTypesArray.value.find((type) => type.id === newSubType[0]);
  emit('update:requirements', { setpoint: currentSubType.durationDefault, count: currentSubType.countDefault });
  if (newSubType[0] === alertSubtypes.ADDED) {
    const commentIds = props.requirements.commentIds.length
      ? props.requirements.commentIds.filter((id) => id !== 0)
      : filteredComments.value.map((comment) => comment.id);
    emit('update:requirements', { commentIds });
  }
};

const updateSubType = (newType) => {
  subType.value = newType;
};

const validate = () => {
  if (!isTriggerComplete.value && subType.value === alertSubtypes.EXCEEDS) emit('update:requirements', { setpoint: 0 });
};

watch(isTriggerComplete, (newVal) => {
  emit('update:is-trigger-complete', newVal);
}, { immediate: true });

watch(hasStopReasonDurationError, (newVal) => {
  emit('update:has-trigger-error', newVal);
}, { immediate: true });

defineExpose({ updateSubType, validate });
</script>
