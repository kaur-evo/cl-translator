<template>
  <v-tooltip
    :location="tooltipLocation"
    :text="tooltipText"
    open-on-click
  >
    <template #activator="{ props }">
      <!-- Clickable icon (MDI or image) -->
      <evocon-v-button
        v-if="iconClickedFn"
        :id="iconId || undefined"
        :class="{ [additionalClasses]: true }"
        :icon="icon"
        :icon-src="iconSrc"
        :icon-src-size="iconSrc ? size : undefined"
        :color="color"
        :size="internalButtonSize"
        v-bind="props"
        @click.stop="iconClickedFn()"
      />
      <!-- Static image icon -->
      <img
        v-else-if="iconSrc"
        v-bind="props"
        :src="iconSrc"
        :width="size"
        :height="size"
        alt=""
        class="cursor-default"
        :class="{ [additionalClasses]: true }"
      >
      <!-- Static MDI icon (existing) -->
      <v-icon
        v-else
        id="icon"
        class="cursor-default"
        :class="{ [additionalClasses]: true }"
        :size="size"
        :color="color || 'icon-default'"
        v-bind="props"
      >
        {{ icon }}
      </v-icon>
    </template>
  </v-tooltip>
</template>

<script>
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';

export default {
  name: 'IconWithTooltip',
  components: {
    EvoconVButton,
  },
  props: {
    color: {
      type: String,
      default: '',
    },
    icon: {
      type: String,
      default: '',
    },
    iconSrc: {
      type: String,
      default: '',
    },
    tooltipText: {
      type: String,
      default: '',
    },
    additionalClasses: {
      type: String,
      default: '',
    },
    size: {
      type: [Number, String],
      default: '16',
    },
    tooltipLocation: {
      type: String,
      default: 'top',
    },
    iconClickedFn: {
      type: Function,
      default: null,
    },
    iconId: {
      type: String,
      default: '',
    },
    buttonSize: {
      type: String,
      default: null,
    },
  },
  computed: {
    internalButtonSize() {
      return this.buttonSize || 'extra-small';
    },
  },
};
</script>

<style lang="less" scoped>
.cursor-default {
  cursor: default !important;
}
</style>
