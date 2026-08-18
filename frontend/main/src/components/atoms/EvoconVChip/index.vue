<template>
  <v-chip
    v-bind="{ ...$attrs, ...props }"
    :class="[
      `type-${type}`,
      { 'v-chip--active': active },
      isDark ? 'dark' : 'light',
      { 'evocon-v-chip--grow': allowGrow },
      { 'evocon-v-chip--error': error },
    ]"
    :disabled="disabled"
    class="evocon-v-chip"
    @click="$emit('select')"
  >
    <slot
      v-if="$slots.prepend"
      name="prepend"
    />
    <v-icon
      v-if="icon"
      start
      :size="getIconSize()"
      class="ml-0 mr-1"
      :class="iconClass"
    >
      {{ icon }}
    </v-icon>
    <v-img
      v-if="imgSrc"
      class="mr-1"
      :width="getIconSize()"
      :src="imgSrc"
    />
    <truncated-text
      :text="label"
      class="text-body-medium"
    />
    <span
      v-if="secondaryLabel"
      class="evocon-chip-label ml-1 text-tertiary-text text-body-medium"
    >
      {{ secondaryLabel }}
    </span>
    <slot
      v-if="$slots.append"
      name="append"
    />
  </v-chip>
</template>
<script>
import { isBoolean } from 'lodash';

import TruncatedText from '@/components/atoms/TruncatedText/index.vue';

export default {
  name: 'EvoconVChip',
  components: {
    TruncatedText,
  },
  props: {
    icon: {
      type: String,
      default: '',
    },
    label: {
      type: String,
      default: '',
    },
    secondaryLabel: {
      type: String,
      default: null,
    },
    disabled: {
      type: Boolean,
    },
    type: {
      type: String,
      default: 'neutral', // primary, secondary, neutral, outlined
    },
    iconSize: {
      type: Number,
      default: null,
    },
    imgSrc: {
      type: String,
      default: '',
    },
    active: {
      type: Boolean,
    },
    dark: {
      type: Boolean,
      default: null,
    },
    iconClass: {
      type: String,
      default: '',
    },
    allowGrow: {
      type: Boolean,
    },
    error: {
      type: Boolean,
    },
  },
  emits: ['select'],
  computed: {
    isDark() {
      if (isBoolean(this.dark)) return this.dark;
      return this.$vuetify.theme.name === 'dark';
    },
  },
  methods: {
    getIconSize() {
      /* eslint-disable no-magic-numbers */
      if (this.iconSize) return this.iconSize;
      return 18;
      /* eslint-enable no-magic-numbers */
    },
  },
};
</script>
