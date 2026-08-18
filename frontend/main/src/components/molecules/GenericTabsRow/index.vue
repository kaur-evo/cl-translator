<template>
  <v-tabs
    v-bind="$attrs"
    ref="tabs"
    class="generic-tabs-row flex-shrink-0"
    :model-value="modelValue"
    :color="color ? colors[color] : ''"
    :height="height"
    :grow="grow"
    lazy
    @update:model-value="onChange"
  >
    <v-tab
      v-for="(tab, i) in items"
      :key="i"
      class="text-none"
      stacked
      :class="{ 'not-clickable': notClickable }"
      slider-color="primary"
      :disabled="isDisabled(tab, i) || notClickable"
      ripple
    >
      <div
        :class="getTextClasses(i, isDisabled(tab, i))"
        class="d-flex"
      >
        <span>{{ getTabName(tab) }}</span>
        <template v-if="countFunc">
          <span class="ml-1">({{ countFunc(tab) }})</span>
        </template>
        <slot name="append-inner" :current-tab="tab" />
      </div>
      <slot name="append" :current-tab="tab" />
    </v-tab>
  </v-tabs>
</template>
<script>
import colorConstants from '@/constants/colorConstants';

export default {
  name: 'GenericTabsRow',
  props: {
    modelValue: { type: Number, default: 0 },
    items: { type: Array, default: () => [] },
    disabledRuleFunc: { type: Function, default: null },
    countFunc: { type: Function, default: null },
    height: { type: [String, Number], default: '56' },
    labelKey: { type: String, default: 'label' },
    grow: { type: Boolean },
    color: { type: String, default: '' },
    notClickable: { type: Boolean },
    tabNameFn: { type: Function, default: () => {} },
    dark: { type: Boolean, default: null },
    sizeClass: { type: String, default: '' },
  },
  emits: ['update:model-value'],
  computed: {
    colors() {
      return colorConstants[this.$vuetify.theme.name];
    },
    isDark() {
      return this.dark === null ? this.$vuetify.theme.name === 'dark' : this.dark;
    },
  },
  methods: {
    getTabName(tab) {
      if (this.tabNameFn(tab)) return this.tabNameFn(tab);
      if (this.labelKey) return tab[this.labelKey];
      return tab;
    },
    getTextClasses(i, isDisabled) {
      if (isDisabled) return 'font-weight-regular';
      let emphasisClass = '';
      if (this.isDark) {
        emphasisClass = this.modelValue === i ? 'text-primary-text' : 'text-secondary-text';
      }
      const weightClass = this.modelValue === i ? 'font-weight-medium' : 'font-weight-regular';
      return `${weightClass} ${emphasisClass} ${this.sizeClass}`;
    },
    onChange(val) {
      sessionStorage.setItem('activeTab', val);
      this.$emit('update:model-value', val);
    },
    isDisabled(val, i) {
      if (this.disabledRuleFunc) {
        return this.disabledRuleFunc(val, i);
      }
      return false;
    },
  },
};
</script>

<style lang="less">
.not-clickable {
  color: white !important;
  opacity: 1 !important;
}
.generic-tabs-row {
  .v-tab {
    user-select: none;
  }

  .v-slide-group {
    padding-bottom: 0 !important;

    .v-slide-group__container {
      .v-slide-group__content {
        .v-btn {
          .v-btn__content {
            display: flex !important;
            flex-direction: column !important;
          }
        }
      }
    }
  }
}
</style>
