<template>
  <v-btn
    id="evocon-button"
    v-bind="$attrs"
    :class="[paddingClass]"
    :variant="variant"
    :color="type === 'primary-light' ? 'primary' : color"
    :icon="isIconBtn"
    :width="width"
    :size="internalSize"
    :min-width="width"
    :max-width="width"
    :height="height"
    :min-height="height"
    :max-height="height"
  >
    <img
      v-if="iconSrc"
      :src="iconSrc"
      :width="imageSize"
      :height="imageSize"
      alt=""
      :class="text.length === 0 ? '' : 'mr-2'"
    >
    <v-icon
      v-else-if="icon"
      class="evocon-button-icon"
      :class="text.length === 0 ? '' : 'mr-2'"
      :color="internalIconColor"
      :size="iconSize"
    >
      {{ icon }}
    </v-icon>
    <span
      v-if="text"
      id="evocon-button-text"
      :class="textClass"
    >
      {{ text }}
    </span>
  </v-btn>
</template>

<script>
import { mapState } from 'pinia';

import { useDeviceStore } from '@/stores/index';

export default {
  name: 'EvoconVButton',
  props: {
    icon: {
      type: String,
      default: '',
    },
    iconSrc: {
      type: String,
      default: null,
    },
    /** Overrides the default icon size for image-based icons (iconSrc). Falls back to iconSize. */
    iconSrcSize: {
      type: [Number, String],
      default: null,
    },
    text: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      default: 'primary',
    },
    color: {
      type: String,
      default: '',
    },
    iconColor: {
      type: String,
      default: '',
    },
    textClass: {
      type: String,
      default: '',
    },
  },
  computed: {
    ...mapState(useDeviceStore, ['isMobileView']),
    isIconBtn() {
      return (this.icon.length > 0 || !!this.iconSrc) && this.text.length === 0;
    },
    width() {
      if (this.isIconBtn && this.isExtraSmall) return '28px';
      if (this.isIconBtn && this.isSmall) return '32px';
      if (this.isIconBtn && this.isLarge) return '48px';
      if (this.isIconBtn) return '40px';
      return '';
    },
    height() {
      if (this.isIconBtn) return this.width;
      return '';
    },
    paddingClass() {
      if (this.isIconBtn) return '';
      if (this.isSmall && this.icon) return 'pl-2 pr-3';
      if (this.isSmall) return 'px-3';
      if (this.icon) return 'pl-3 pr-4';
      return 'px-4';
    },
    internalSize() {
      if (this.$attrs.size) return this.$attrs.size;
      return this.isMobileView ? 'small' : 'default';
    },
    isExtraSmall() {
      return this.internalSize === 'extra-small';
    },
    isSmall() {
      return this.internalSize === 'small';
    },
    isLarge() {
      return this.$attrs.size === 'large';
    },
    iconSize() {
      /* eslint-disable no-magic-numbers */
      if (this.isExtraSmall) return 16;
      if (this.isSmall) return 20;
      return 24;
      /* eslint-enable no-magic-numbers */
    },
    imageSize() {
      return this.iconSrcSize || this.iconSize;
    },
    variant() {
      if (this.type === 'primary-light') return 'tonal';
      if (this.type === 'secondary' || this.isIconBtn) return 'text';
      return 'flat';
    },
    internalIconColor() {
      if (this.iconColor) return this.iconColor;
      if (this.$attrs.disabled && this.isIconBtn) return 'text--secondary-text';
      if (this.isIconBtn) return this.color || 'icon-default';
      return '';
    },
  },
};
</script>
