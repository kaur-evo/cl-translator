<template>
  <!-- CHIP -->
  <evocon-v-chip
    v-if="useChips"
    v-bind="$attrs"
    :active="isSingleSelect ? modelValue.length : !isAllSelected"
    :disabled="disabled"
    :type="type"
    :icon="$attrs.prependInnerIcon || $attrs['prepend-inner-icon']"
    :label="showPlaceholder ? $attrs.placeholder : [prependText, selectedText].join(' ')"
    :secondary-label="getSecondaryItemText(itemsMap[modelValue[0]])"
    :class="menuInputClass"
    :error="error"
  >
    <template v-if="$slots.prepend" #prepend>
      <slot name="prepend" />
    </template>
    <template v-if="chipAppendIcon || $slots.append" #append>
      <slot v-if="$slots.append" name="append" />
      <v-icon
        v-else
        class="ml-1 selection-chip-icon"
        @click="onAppendIconClick"
      >
        {{ chipAppendIcon }}
      </v-icon>
    </template>
  </evocon-v-chip>
  <!-- REGULAR INPUT -->
  <evocon-v-input
    v-else
    v-bind="$attrs"
    readonly
    :model-value="selectedText"
    :loading="loading"
    :error="error"
    :disabled="disabled"
    :filled="filled"
    :class="menuInputClass"
    :is-icon-activated="isIconActivated"
    truncate-input
    :prefix="prependText"
  >
    <template
      v-for="slot in Object.keys($slots)"
      #[slot]="scope"
    >
      <slot :name="slot" v-bind="scope" />
    </template>
    <template #append-inner>
      <span>
        <v-icon
          v-if="appendIcon"
          @click.stop="onAppendIconClick"
        >
          {{ appendIcon }}
        </v-icon>
        <v-icon
          v-else
          :color="isDark ? 'white' : 'secondary-text'"
          :class="isOpen ? 'rotate180deg' : ''"
        >
          {{ mdiMenuDown }}
        </v-icon>
      </span>
    </template>
    <template v-if="flagCountryCode" #prepend-inner>
      <v-row class="text-body-large d-block prepend">
        <evocon-flag-icon
          :flag-country-code="flagCountryCode"
          add-border
        />
      </v-row>
    </template>
  </evocon-v-input>
</template>

<script>
import { mdiMenuUp, mdiMenuDown } from '@mdi/js';
import { isFunction } from 'lodash';

import listToShortenedString from '@/helpers/list/listToShortenedString';
import EvoconFlagIcon from '@/components/atoms/EvoconFlagIcon/index.vue';
import EvoconVInput from '@/components/atoms/EvoconVInput/index.vue';
import EvoconVChip from '@/components/atoms/EvoconVChip/index.vue';
import { selectionValueAllSelected } from '@/helpers/listSelection/ListSelection';

const icons = { mdiMenuUp, mdiMenuDown };
export default {
  name: 'SelectionMenuInput',
  components: {
    EvoconFlagIcon,
    EvoconVInput,
    EvoconVChip,
  },
  props: {
    isOpen: { type: Boolean },
    modelValue: { type: Array, default: () => [] },
    itemsMap: { type: Object, default: () => {} },
    itemText: { type: String, default: '' },
    itemSecondaryText: { type: String, default: '' },
    prependText: { type: String, default: '' },
    appendText: { type: String, default: '' },
    totalCount: { type: Number, default: -1 },
    inverted: { type: Boolean, default: null },
    loading: { type: Boolean },
    useChips: { type: Boolean },
    error: { type: Boolean },
    disabled: { type: Boolean },
    showEmptyArrayAsAllSelected: { type: Boolean },
    dark: { type: Boolean, default: null },
    isSingleSelect: { type: Boolean },
    itemFlag: { type: String, default: '' },
    filled: { type: Boolean, default: true },
    menuInputClass: { type: String, default: null },
    hiddenItemsCount: { type: Number, default: 0 },
    someSelected: { type: Boolean },
    emptyEqualsAllSelected: { type: Boolean },
    colorActivePrepend: { type: Boolean },
    appendIcon: { type: String, default: '' },
    type: { type: String, default: 'primary' },
  },
  emits: ['update:menu-open', 'append-icon-click'],
  data() {
    return {
      ...icons,
    };
  },
  computed: {
    flagCountryCode() {
      return this.itemFlag && this.modelValue && this.itemsMap[this.modelValue] ? this.itemsMap[this.modelValue][this.itemFlag] : '';
    },
    showPlaceholder() {
      if (this.$attrs.placeholder && !this.showEmptyArrayAsAllSelected) {
        if (this.isSingleSelect) return !this.modelValue.length || (this.modelValue.length === 1 && !this.modelValue[0] && this.modelValue[0] !== false) || !this.itemsMap[this.modelValue[0]];
        return this.modelValue.length === 0;
      }
      return false;
    },
    chipAppendIcon() {
      if (this.appendIcon) return this.appendIcon;
      if (this.isOpen) return mdiMenuUp;
      return mdiMenuDown;
    },
    firstSelectedText() {
      const [firstSelectedId] = this.modelValue;
      return this.getItemText(this.itemsMap[firstSelectedId]);
    },
    isAllSelected() {
      if (this.isSingleSelect) return false;
      if (selectionValueAllSelected(this.emptyEqualsAllSelected, this.modelValue, this.someSelected)) return true;
      if (this.showEmptyArrayAsAllSelected && this.modelValue.length === 0) return true;
      if (this.totalCount > -1 && this.modelValue.length) { // -1 means unknown
        return this.modelValue.length - this.hiddenItemsCount === this.totalCount;
      }
      return false;
    },
    inversionLabel() {
      if (this.inverted) return this.modelValue.length === 1 ? '≠ ' : '-';
      return '';
    },
    selectedText() {
      if (this.isAllSelected) return this.$t('All');
      if (this.modelValue?.length === 1) {
        if (this.appendText) return `${this.inversionLabel}${this.firstSelectedText}${this.appendText}`;
        return `${this.inversionLabel}${this.firstSelectedText}`;
      }
      if (this.modelValue?.length || (this.modelValue?.length === 0 && !this.showEmptyArrayAsAllSelected)) {
        if (this.modelValue.length === 0 && this.$attrs.placeholder) {
          return ''; // don't show selected 0 if placeholder is set
        }
        if (this.showShortenedText) {
          const selectedValues = this.modelValue.map((id) => this.getItemText(this.itemsMap[id]));
          return listToShortenedString(selectedValues);
        }
        if (this.isSingleSelect && this.modelValue.length === 0) return '-';
        return `${this.inversionLabel}${this.modelValue.length}`;
      }
      return '';
    },
    showShortenedText() {
      return !this.useChips && !this.prependText.length;
    },
    isDark() {
      if (this.dark === null) return this.$vuetify.theme.name === 'dark';
      return this.dark;
    },
    isIconActivated() {
      if (!this.colorActivePrepend) return false;
      return this.modelValue.length > 0 && !this.isAllSelected;
    },
  },
  methods: {
    getItemText(item) {
      if (this.itemText) {
        if (isFunction(this.itemText)) {
          return this.itemText(item);
        }
        return item?.[this.itemText] ?? '';
      }
      return item;
    },
    getSecondaryItemText(item) {
      if (!item) return '';
      if (this.itemSecondaryText) {
        if (isFunction(this.itemSecondaryText)) {
          return this.itemSecondaryText(item);
        }
        return item?.[this.itemSecondaryText] ?? '';
      }
      return '';
    },
    onAppendIconClick() {
      if (this.appendIcon || this.useChips) this.$emit('append-icon-click');
      else this.$emit('update:menu-open', !this.isOpen);
    },
  },
};
</script>

<style lang="scss" scoped>
.prepend {
  z-index: 1;
}
</style>
