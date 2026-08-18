<template>
  <v-chip-group
    v-if="(itemType === checkTypes.YES_NO && !isMultipleSelection) || itemType === checkTypes.CHECK"
    :model-value="singleChipGroupModelValue"
    :column="$vuetify.display.smAndDown"
    class="align-center"
    @update:model-value="onSingleChipGroupUpdate"
  >
    <evocon-v-chip
      id="approved-chip"
      ref="approved-chip"
      :value="true"
      :label="itemType === checkTypes.YES_NO ? $t('Yes') : $t('Done')"
      :icon="itemType === checkTypes.YES_NO ? mdiThumbUp : mdiCheckCircle"
      :disabled="disabled || notApplicableSelected"
      type="primary"
      :size="dense ? 'small' : 'default'"
      class="my-0"
      :dark="false"
    />
    <evocon-v-chip
      v-if="itemType === checkTypes.YES_NO"
      id="disapproved-chip"
      ref="disapproved-chip"
      :value="false"
      :label="$t('No')"
      :icon="mdiThumbDown"
      :disabled="disabled || notApplicableSelected"
      type="secondary"
      :size="dense ? 'small' : 'default'"
      class="my-0"
      :dark="false"
    />
  </v-chip-group>
  <v-chip-group
    v-else-if="itemType === checkTypes.YES_NO && isMultipleSelection"
    :column="$vuetify.display.smAndDown"
    selected-class=""
    class="align-center mb-2"
  >
    <evocon-v-chip
      id="add-yes-chip"
      :label="$t('Yes')"
      :icon="mdiThumbUp"
      :disabled="disabled || notApplicableSelected || isLimitReached"
      :size="dense ? 'small' : 'default'"
      class="my-0"
      :dark="false"
      @click.stop="$emit('update:model-value', [...(modelValue ?? []), true])"
    />
    <evocon-v-chip
      id="add-no-chip"
      :label="$t('No')"
      :icon="mdiThumbDown"
      :disabled="disabled || notApplicableSelected || isLimitReached"
      :size="dense ? 'small' : 'default'"
      class="my-0"
      :dark="false"
      @click.stop="$emit('update:model-value', [...(modelValue ?? []), false])"
    />
  </v-chip-group>
</template>
<script setup name="CheckCardChips">
import { computed } from 'vue';
import { mdiCheckCircle, mdiThumbUp, mdiThumbDown } from '@mdi/js';

import { checkTypes } from '@/constants/checklistsConstants';
import EvoconVChip from '@/components/atoms/EvoconVChip/index.vue';

const props = defineProps({
  itemType: {
    type: String,
    required: true,
  },
  isMultipleSelection: {
    type: Boolean,
    default: false,
  },
  modelValue: {
    type: [Boolean, Array, null],
    default: () => [],
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  notApplicableSelected: {
    type: Boolean,
    default: false,
  },
  dense: {
    type: Boolean,
    default: false,
  },
  limit: {
    type: Number,
    default: 0,
  },
});

const emit = defineEmits(['update:model-value']);

const isLimitReached = computed(() => props.limit > 0 && Array.isArray(props.modelValue) && props.modelValue.length >= props.limit);

const singleChipGroupModelValue = computed(() => {
  if (props.itemType !== checkTypes.YES_NO) return props.modelValue;
  return (Array.isArray(props.modelValue) ? props.modelValue[0] : null) ?? null;
});

const onSingleChipGroupUpdate = (event) => {
  if (props.itemType === checkTypes.YES_NO) {
    emit('update:model-value', event === undefined ? [] : [event]);
  } else {
    emit('update:model-value', event);
  }
};
</script>
