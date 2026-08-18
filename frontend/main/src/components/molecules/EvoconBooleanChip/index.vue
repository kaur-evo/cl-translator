<template>
  <span>
    <selection-input
      :model-value="[modelValue]"
      :items="items"
      :menu-input-type="modelValue ? 'primary': 'secondary'"
      item-value="value"
      icon-key="icon"
      :checkbox="false"
      is-single-select
      use-chips
      auto-width
      required
      @update:model-value="$emit('update:model-value', $event[0])"
    >
      <template v-if="$slots.prepend" #prepend>
        <slot name="prepend" />
      </template>
      <template v-if="appendInnerIcon" #append>
        <v-icon
          class="ml-1 selection-chip-icon"
          @click.stop="$emit('click:append-inner')"
        >
          {{ appendInnerIcon }}
        </v-icon>
      </template>
    </selection-input>
  </span>
</template>

<script setup name="EvoconBooleanChip">
import { computed } from 'vue';
import { mdiThumbUp, mdiThumbDown } from '@mdi/js';
import { useI18n } from 'vue-i18n';

import SelectionInput from '@/components/molecules/SelectionInput/index.vue';

const { t } = useI18n();

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: null,
  },
  appendInnerIcon: {
    type: String,
    default: null,
  },
});

defineEmits(['update:model-value', 'click:append-inner']);

const items = computed(() => [
  { value: true, icon: mdiThumbUp, name: t('Yes') },
  { value: false, icon: mdiThumbDown, name: t('No') },
]);
</script>
