<template>
  <!-- eslint-disable vue/custom-event-name-casing -->
  <evocon-input-chip
    v-if="useChip"
    v-bind="$attrs"
    ref="evoconInputChip"
    :model-value="modelValue"
    :grow="grow"
    :input-mask="inputMask"
    :input-with-bottom-border="inputWithBottomBorder"
    @click:append-inner="$emit('click:append-inner')"
    @update:model-value="$emit('update:model-value', $event)"
    @focus="$emit('focus')"
  >
    <template
      v-for="slot in Object.keys($slots)"
      #[slot]="scope"
    >
      <slot :name="slot" v-bind="scope" />
    </template>
  </evocon-input-chip>
  <v-text-field
    v-else
    v-bind="$attrs"
    ref="evoconTextField"
    v-maska="inputMask"
    :model-value="modelValue"
    persistent-hint
    persistent-counter
    color="primary"
    :maxlength="maxLength"
    :counter="maxLength"
    :variant="filled ? 'filled' : 'underlined'"
    :density="innerDensity"
    hide-details="auto"
    autocomplete="off"
    class="evocon-v-input"
    :type="type"
    :class="{
      'borderless-text-field': !filled,
      'text-field-truncate': truncateInput,
      'evocon-v-input--active-icon': isIconActivated,
      'evocon-v-input--rotate-prepend-icon-270-deg': $attrs.iconClass === 'rotate270deg',
    }"
    @focus="$emit('focus')"
    @update:model-value="$emit('update:model-value', $event)"
    @click:append-inner="$emit('click:append-inner')"
  >
    <template
      v-for="slot in Object.keys($slots)"
      #[slot]="scope"
    >
      <slot :name="slot" v-bind="scope" />
    </template>
  </v-text-field>
</template>

<script>
import { vMaska } from 'maska/vue';
import { mapState } from 'pinia';

import EvoconInputChip from '@/components/atoms/EvoconInputChip/index.vue';
import useDeviceStore from '@/stores/device';

export default {
  name: 'EvoconVInput',
  components: { EvoconInputChip },
  directives: { maska: vMaska },
  props: {
    modelValue: {
      type: [String, Number],
      default: '',
    },
    maxLength: {
      type: [String, Number],
      default: null,
    },
    type: {
      type: String,
      default: 'text',
    },
    useChip: {
      type: Boolean,
    },
    grow: {
      type: Boolean,
    },
    filled: {
      type: Boolean,
      default: true,
    },
    truncateInput: { type: Boolean },
    inputMask: {
      type: String,
      default: null,
    },
    inputWithBottomBorder: {
      type: Boolean,
      default: null,
    },
    isIconActivated: {
      type: Boolean,
      default: null,
    },
    density: {
      type: String,
      default: null,
    },
  },
  emits: ['update:model-value', 'click:append-inner', 'focus'],
  computed: {
    ...mapState(useDeviceStore, ['isMobileView']),
    innerDensity() {
      if (this.density) return this.density;
      if (this.isMobileView) return 'compact';
      return 'default';
    },
  },
};
</script>
<style lang="scss">
.borderless-text-field {
  font-weight: 600;

  input,
  .v-field__prepend-inner,
  .v-field__append-inner {
    padding-top: 0px !important;
    align-items: center !important;
  }

  .v-field__outline {
     display: none;
  }
}
.text-field-truncate {
  &.v-text-field input {
    text-overflow: ellipsis;
  }
}
</style>
