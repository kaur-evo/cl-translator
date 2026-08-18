<template>
  <span :class="{ 'regular-input-wrapper': !useChips }">
    <selection-menu
      v-bind="$attrs"
      :model-value="modelValue"
      :items="items"
      :item-text="itemText"
      :item-secondary-text="itemSecondaryText"
      :item-tertiary-text="itemTertiaryText"
      :item-flag="itemFlag"
      :item-value="itemValue"
      :item-icon="itemIcon"
      :icon-key="iconKey"
      :item-icon-color-key="itemIconColorKey"
      :groups="groups"
      :groups-order-by="groupsOrderBy"
      :numeric-order-by="numericOrderBy"
      :group-id-key="groupIdKey"
      :item-group-id-key="itemGroupIdKey"
      :disabled-values="disabledValues"
      :item-disabled="itemDisabled"
      :dense="isDense || useChips"
      :checkbox="checkbox"
      :is-single-select="isSingleSelect"
      :is-grouped="isGroupedSelect"
      :required="required"
      :loading="loading"
      :dark="dark"
      :width="$attrs['min-width'] || `${inputWidth}px`"
      :hide-search="hideSearch"
      :menu-open="isMenuOpen"
      :inverted="inverted"
      :emit-toggle-all="emitToggleAll"
      :menu-y-offset="menuYOffset"
      :some-selected="someSelected"
      :empty-equals-all-selected="emptyEqualsAllSelected"
      @update:some-selected="$emit('update:some-selected', $event)"
      @change="$emit('update:model-value', $event)"
      @update:menu-open="onMenuOpened"
      @search-input="$emit('search-input', $event)"
    >
      <template #list-prepend>
        <slot name="list-prepend" />
      </template>
      <template #item-append="{ item }">
        <slot name="item-append" :item="item" />
      </template>
      <template #primary-title-append="{ item }">
        <slot name="primary-title-append" :item="item" />
      </template>
      <template #activator="{ props }">
        <span v-bind="disabled ? null : props">
          <span v-if="$slots['selection-input-activator']" class="text-truncate">
            <slot name="selection-input-activator" />
          </span>
          <span v-else ref="selectionMenuInput">
            <selection-menu-input
              :model-value="modelValue"
              :items-map="itemsAsMap"
              :placeholder="placeholder"
              :hint="hint"
              :prepend-text="prependText"
              :append-text="appendText"
              :total-count="totalCount || items.length"
              :use-chips="useChips"
              :error="error"
              :dark="dark"
              :is-open="isMenuOpen"
              :density="useChips ? 'default' : density"
              :item-flag="itemFlag"
              :item-text="itemText"
              :item-value="itemValue"
              :disabled="disabled"
              :loading="loading"
              :filled="filled"
              :is-single-select="isSingleSelect"
              :rules="[inputRules]"
              :show-empty-array-as-all-selected="showEmptyArrayAsAllSelected"
              :prepend-inner-icon="$attrs.prependInnerIcon || $attrs['prepend-inner-icon']"
              :inverted="inverted"
              :menu-input-class="menuInputClass"
              :hidden-items-count="hiddenItemsCount"
              :some-selected="someSelected"
              :empty-equals-all-selected="emptyEqualsAllSelected"
              :color-active-prepend="colorActivePrepend"
              :type="menuInputType"
              @update:menu-open="onMenuOpened"
              @info-btn-click="$emit('info-btn-click')"
            >
              <template
                v-for="slot in Object.keys($slots)"
                #[slot]="scope"
              >
                <slot :name="slot" v-bind="scope" />
                <v-icon v-if="selectedItemIcon && slot === 'prepend'" :key="slot" class="mr-1">
                  {{ selectedItemIcon }}
                </v-icon>
              </template>
              <slot name="prepend-inner-icon">
                <v-icon v-if="selectedItemIcon" class="mr-1">
                  {{ selectedItemIcon }}
                </v-icon>
              </slot>
            </selection-menu-input>
          </span>
        </span>
      </template>
    </selection-menu>
  </span>
</template>
<script>
import { isEqual } from 'lodash';
import { nextTick } from 'vue';

import SelectionMenuInput from '@/components/molecules/SelectionMenuInput/index.vue';
import SelectionMenu from '@/components/molecules/SelectionMenu/index.vue';
import listToKeyMap from '@/helpers/list/listToKeyMap';


export default {
  name: 'SelectionInput',
  components: {
    SelectionMenuInput,
    SelectionMenu,
  },
  props: {
    modelValue: {
      type: Array,
      default: () => [],
    },
    items: {
      type: Array,
      default: () => [],
    },
    itemsMap: {
      type: Object,
      default: () => null,
    },
    placeholder: {
      type: String,
      default: '',
    },
    hint: {
      type: String,
      default: '',
    },
    prependText: {
      type: String,
      default: '',
    },
    appendText: {
      type: String,
      default: null,
    },
    required: {
      type: Boolean,
    },
    isSingleSelect: {
      type: Boolean,
    },
    itemText: {
      type: String,
      default: 'name',
    },
    itemSecondaryText: {
      type: String,
      default: '',
    },
    itemTertiaryText: {
      type: [String, Function],
      default: '',
    },
    itemFlag: {
      type: String,
      default: '',
    },
    itemValue: {
      type: String,
      default: 'id',
    },
    isGroupedSelect: {
      type: Boolean,
    },
    groups: {
      type: Array,
      default: () => [],
    },
    groupIdKey: {
      type: String,
      default: 'id',
    },
    itemGroupIdKey: {
      type: String,
      default: 'groupId',
    },
    groupsOrderBy: {
      type: String,
      default: 'name',
    },
    numericOrderBy: {
      type: Boolean,
    },
    totalCount: {
      type: Number,
      default: 0,
    },
    itemDisabled: { type: Function, default: null },
    disabledValues: { type: Array, default: () => [] },
    disabled: { type: Boolean },
    loading: { type: Boolean },
    density: { type: String, default: null },
    hideSearch: { type: Boolean },
    dark: { type: Boolean, default: null },
    useChips: { type: Boolean },
    error: { type: Boolean },
    showEmptyArrayAsAllSelected: { type: Boolean },
    removeNonExistentSelections: { type: Boolean },
    itemIcon: { type: String, default: null },
    iconKey: { type: String, default: null },
    itemIconColorKey: { type: String, default: null },
    filled: { type: Boolean, default: true },
    checkbox: { type: Boolean, default: true },
    inverted: { type: Boolean },
    menuOpen: { type: Boolean, default: null },
    menuInputClass: { type: String, default: null },
    emitToggleAll: { type: Boolean },
    hiddenItemsCount: { type: Number, default: 0 },
    someSelected: { type: Boolean },
    emptyEqualsAllSelected: { type: Boolean },
    colorActivePrepend: { type: Boolean },
    menuInputType: { type: String, default: 'primary' },
    autoWidth: { type: Boolean, default: null },
  },
  emits: ['update:model-value', 'info-btn-click', 'search-input', 'update:menu-open', 'update:some-selected'],
  data() {
    return {
      inputWidth: 338,
      internalMenuOpen: false,
    };
  },
  computed: {
    itemsAsMap() {
      if (this.itemsMap) return this.itemsMap;
      return listToKeyMap(this.items, this.itemValue);
    },
    isDense() {
      return this.density === 'compact';
    },
    selectedItemIcon() {
      if (!this.modelValue.length || !this.iconKey) return null;
      return this.itemsAsMap[this.modelValue[0]]?.[this.iconKey] ?? null;
    },
    menuYOffset() {
      if (this.useChips) return '8px';
      if (this.isDense) return '0px';
      return this.hint ? '-22px' : '0px';
    },
    isMenuOpen() {
      return this.menuOpen === null ? this.internalMenuOpen : this.menuOpen;
    },
  },
  watch: {
    itemsAsMap(newVal, oldVal) {
      if (!isEqual(newVal, oldVal)) {
        this.sanitizeSelection();
      }
    },
  },
  async mounted() {
    await nextTick();
    this.inputWidth = this.setInputWidth();
    this.sanitizeSelection();
  },
  methods: {
    sanitizeSelection() {
      if (this.removeNonExistentSelections) {
        let selectedClone = [...this.modelValue];
        selectedClone = selectedClone.filter((id) => !!this.itemsAsMap[id]);
        this.$emit('update:model-value', selectedClone);
      }
    },
    inputRules(v) {
      return !this.required || !!v.length || this.hint;
    },
    setInputWidth() {
      if (this.useChips && !this.autoWidth) return 300;
      // eslint-disable-next-line no-magic-numbers
      return this.$refs?.selectionMenuInput?.getBoundingClientRect?.()?.width || 338;
    },
    onMenuOpened(val) {
      if (this.menuOpen === null) {
        this.internalMenuOpen = val;
      } else {
        this.$emit('update:menu-open', !val);
      }
      this.inputWidth = this.setInputWidth();
    },
  },
};
</script>
<style lang="scss" scoped>
.regular-input-wrapper {
  display: contents;
}
</style>
