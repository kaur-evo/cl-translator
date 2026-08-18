<template>
  <selection-input
    :model-value="[modelValue]"
    :items="filteredColors"
    :placeholder="$t('Color')"
    :hint="hint"
    :item-icon="mdiCheckboxBlankCircle"
    :selected-item-icon="mdiCheckboxMarkedCircle"
    :disabled="disabled"
    item-icon-color-key="hex"
    item-value="hex"
    :checkbox="false"
    is-single-select
    hide-search
    required
    @update:model-value="onModelValueChange"
  >
    <template v-if="modelValue" #prepend-inner>
      <v-icon size="24" :color="modelValue">
        {{ mdiCheckboxMarkedCircle }}
      </v-icon>
    </template>
  </selection-input>
</template>
<script setup>
import { computed } from 'vue';
import { mdiCheckboxBlankCircle, mdiCheckboxMarkedCircle } from '@mdi/js';

import SelectionInput from '@/components/molecules/SelectionInput/index.vue';
import { getUserSelectableColors } from '@/constants/userSelectableColors';
const emit = defineEmits(['update:model-value']);
const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  removedColors: {
    type: Set,
    default: () => new Set(),
  },
  hint: {
    type: String,
    default: '',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});

const filteredColors = computed(() => getUserSelectableColors().filter((color) => !props.removedColors.has(color.id)));

const onModelValueChange = (value) => {
  emit('update:model-value', value[0] ?? null);
};

</script>
