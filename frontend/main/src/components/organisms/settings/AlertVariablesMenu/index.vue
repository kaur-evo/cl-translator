<template>
  <menu-with-button-activator
    :items="variables"
    :button-icon="mdiCodeBraces"
    :btn-tooltip-text="btnTooltipText"
    primary-text-field="displayName"
    tertiary-text-field="variableName"
    button-classes="mt-n1"
    size="small"
    @item-clicked="$emit('variable-selected', $event.variableName)"
  />
</template>

<script>
import { mdiCodeBraces } from '@mdi/js';

import MenuWithButtonActivator from '@/components/molecules/MenuWithButtonActivator/index.vue';

const icons = { mdiCodeBraces };

export default {
  name: 'AlertVariablesMenu',
  components: {
    MenuWithButtonActivator,
  },
  props: {
    variables: {
      type: Object,
      required: true,
    },
    btnTooltipText: {
      type: String,
      default: null,
    },
  },
  emits: ['variable-selected'],
  data() {
    return {
      ...icons,
    };
  },
};
</script>
