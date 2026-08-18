<template>
  <v-radio
    :model-value="props.modelValue"
    v-bind="$attrs"
    color="primary"
    :true-icon="mdiCheckCircle"
    @update:model-value="emit('update:model-value', $event)"
  >
    <template #label>
      <input-label
        class="ml-4"
        :label="props.label"
        :sub-label="props.subLabel"
      />
      <slot name="label-append" />
    </template>
  </v-radio>
</template>

<script setup name="EvoconVRadio">
import { mdiCheckCircle } from '@mdi/js';

import InputLabel from '@/components/atoms/InputLabel/index.vue';

const props = defineProps({
  modelValue: {
    type: [Boolean, String, Number, Array],
    default: false,
  },
  label: {
    type: String,
    default: '',
  },
  subLabel: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['update:model-value']);
</script>

<style scoped lang="scss">
.v-radio {
  &.v-selection-control--density-default {
    --v-selection-control-size: 24px;
  }
}
</style>
