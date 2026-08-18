<template>
  <v-lazy class="text-truncate row">
    <div class="d-flex flex-nowrap align-center">
      <!-- prepend part -->
      <div class="d-flex">
        <v-list-item-action
          v-if="loading"
          class="mr-3 ml-1 my-0"
        >
          <v-progress-circular
            :color="color"
            indeterminate
            size="20"
            width="2"
          />
        </v-list-item-action>
        <template v-else>
          <list-item-checkbox
            v-if="checkbox"
            :value="isCheckboxModeActive"
            :indeterminate="!isCheckboxModeActive && indeterminate"
            class="mr-2"
            :error="error"
            :disabled="isDisabled"
            :is-single-select="isSingleSelect"
            :dark="isDark"
            @click="$emit('checkbox-click', $event)"
          />
          <v-icon
            v-if="icon"
            class="mr-3"
            :class="additionalIconClasses"
            :color="internalIconColor"
            :size="internalIconSize"
          >
            {{ icon }}
          </v-icon>
          <slot v-if="icon" name="icon-append" />
          <v-list-item-action
            v-if="flagCountryCode"
            class="ml-1 mr-3 my-0"
          >
            <span class="fill-height align-center">
              <evocon-flag-icon :flag-country-code="flagCountryCode" add-border />
            </span>
          </v-list-item-action>
        </template>
      </div>

      <!-- main content -->
      <div class="overflow-hidden">
        <evocon-v-tooltip-wrap
          :model-value="isTooltipVisible"
          :internal-activator="true"
          :disabled="!isTooltipVisible"
          :text="primaryText"
        >
          <template #activator="{ props }">
            <v-list-item-title
              :class="titleClass"
              class="font-weight-regular"
              @mouseenter="onMouseEnter"
              @mouseleave="onMouseLeave"
            >
              <text-highlight
                :class="{ 'font-weight-medium': isMenuActive && !isGroupActivatorItem }"
                :text="String(primaryText)"
                :highlight="primaryHighlight"
                :dark="isDark"
                v-bind="props"
              />
              <slot name="primary-title-append" />
            </v-list-item-title>
          </template>
        </evocon-v-tooltip-wrap>
        <v-list-item-subtitle
          v-if="secondaryText"
          class="text-body-small text-secondary-text"
        >
          <text-highlight
            :text="secondaryText"
            :highlight="secondaryHighlight"
            :dark="isDark"
          />
        </v-list-item-subtitle>
      </div>

      <slot name="text-append" />

      <!-- append part/tertiary -->
      <div
        class="mr-0 ml-auto"
        :style="tertiaryTextStyle"
        :class="tertiaryTextClasses"
      >
        <span
          class="text-body-small text-secondary-text"
        >
          <text-highlight
            :text="tertiaryText"
            :highlight="tertiaryHighlight"
            :dark="isDark"
          />
        </span>
        <slot name="append" />
      </div>
    </div>
  </v-lazy>
</template>
<script>
import { isBoolean } from 'lodash';
import { mapState } from 'pinia';

import { useDeviceStore } from '@/stores/index';
import TextHighlight from '@/components/atoms/TextHighlight/index.vue';
import EvoconFlagIcon from '@/components/atoms/EvoconFlagIcon/index.vue';
import ListItemCheckbox from '@/components/molecules/ListItemCheckbox/index.vue';
import EvoconVTooltipWrap from '@/components/atoms/EvoconVTooltipWrap/index.vue';

export default {
  name: 'ListItemContents',
  components: {
    EvoconFlagIcon, TextHighlight, ListItemCheckbox, EvoconVTooltipWrap,
  },
  props: {
    inputValue: {
      type: Boolean,
    },
    primaryText: {
      type: [String, Number],
      default: '',
    },
    primaryHighlight: {
      type: String,
      default: '',
    },
    secondaryText: {
      type: String,
      default: '',
    },
    secondaryHighlight: {
      type: String,
      default: '',
    },
    tertiaryText: {
      type: String,
      default: '',
    },
    tertiaryHighlight: {
      type: String,
      default: '',
    },
    flagCountryCode: {
      type: String,
      default: '',
    },
    color: {
      type: String,
      default: 'primary',
    },
    icon: { type: String, default: '' },
    iconColor: { type: String, default: '' },
    error: { type: Boolean },
    disabled: { type: Boolean },
    dense: { type: Boolean },
    checkbox: { type: Boolean },
    loading: { type: Boolean },
    indeterminate: { type: Boolean },
    dark: { type: Boolean, default: null },
    isSingleSelect: { type: Boolean },
    tertiaryTextClasses: { type: String, default: '' },
    tertiaryTextStyle: { type: Object, default: () => {} },
    isGroupActivatorItem: { type: Boolean },
    iconSize: { type: String, default: '' },
    additionalIconClasses: { type: String, default: null },
  },
  emits: ['checkbox-click'],
  data() {
    return {
      isTooltipVisible: false,
    };
  },
  computed: {
    ...mapState(useDeviceStore, ['isMobileView']),
    isDark() {
      if (isBoolean(this.dark)) return this.dark;
      return this.$vuetify.theme.name === 'dark';
    },
    isDisabled() {
      return this.disabled || this.loading;
    },
    labelClass() {
      if (this.isDark === true) return 'text-white';
      return '';
    },
    titleClass() {
      const classes = [];
      if (!this.isDisabled) {
        classes.push(this.labelClass);
      }
      if (this.dense) {
        classes.push('text-body-medium');
      } else {
        classes.push('text-body-large');
      }
      return classes;
    },
    isCheckboxModeActive() {
      return this.checkbox && this.inputValue;
    },
    isMenuActive() {
      return (!this.checkbox || this.isSingleSelect) && this.inputValue;
    },
    internalIconSize() {
      if (this.iconSize) return this.iconSize;
      return this.dense ? '20' : '24';
    },
    internalIconColor() {
      if (this.iconColor) return this.iconColor;
      if (this.isDark) return 'white';
      return 'secondary-text';
    },
  },
  methods: {
    isElementOverflowing(elem) {
      return elem.scrollWidth > elem.offsetWidth;
    },
    onMouseEnter(ev) {
      if ((this.isElementOverflowing(ev.target)) && !this.isMobileView) {
        this.isTooltipVisible = true;
      } else {
        this.onMouseLeave();
      }
    },
    onMouseLeave() {
      this.isTooltipVisible = false;
    },
  },
};
</script>
