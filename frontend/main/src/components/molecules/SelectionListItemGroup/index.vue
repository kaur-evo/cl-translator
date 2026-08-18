<template>
  <v-hover
    v-for="item in orderedItems"
    :key="`item-${groupId}-sub-${getItemValue(item)}`"
  >
    <template #default="{ isHovering, props }">
      <v-list-item
        v-bind="props"
        :value="getItemValue(item)"
        :disabled="isItemDisabled(item)"
        :density="dense ? 'compact' : 'default'"
        :class="getListItemClass(item)"
        class="py-0"
        :height="dense ? '40px' : '48px'"
        @click="toggleItemSelection(item)"
      >
        <list-item-contents
          v-bind="props"
          :input-value="isItemSelected(item)"
          :disabled="disabled || isItemDisabled(item)"
          :primary-text="getItemText(item)"
          :secondary-text="getItemSecondaryText(item)"
          :tertiary-text="getItemTertiaryText(item)"
          :tertiary-text-classes="itemTertiaryTextClasses"
          :tertiary-text-style="itemTertiaryTextStyle"
          :primary-highlight="search"
          :secondary-highlight="searchBySecondaryText ? search : ''"
          :error="error"
          color="primary"
          :dark="isDark"
          :flag-country-code="item[itemFlag]"
          :dense="dense"
          :icon="getItemIcon(item)"
          :icon-color="getIconColor(item)"
          :checkbox="checkbox"
          :is-single-select="isSingleSelect"
        >
          <template #primary-title-append>
            <slot name="primary-title-append" :item="item" />
          </template>
          <template #text-append>
            <new-indicator v-if="item.newIndicatorShownUntil" class="ml-2" :shown-until="item.newIndicatorShownUntil" />
          </template>
          <template v-if="!shouldShowAppendOnHover(item) || isHovering" #append>
            <slot name="append" :item="item" />
          </template>
        </list-item-contents>
      </v-list-item>
    </template>
  </v-hover>
</template>
<script>
import { isBoolean, orderBy } from 'lodash';

import ListItemContents from '@/components/molecules/ListItemContents/index.vue';
import NewIndicator from '@/components/atoms/NewIndicator/index.vue';

export default {
  name: 'SelectionListItemGroup',
  components: {
    ListItemContents,
    NewIndicator,
  },
  props: {
    items: { type: Array, default: () => [] },
    isSingleSelect: { type: Boolean },
    error: { type: Boolean },
    search: { type: String, default: '' },
    itemFlag: { type: String, default: null },
    listSelection: { type: Object, default: null },
    itemTertiaryTextClasses: { type: String, default: '' },
    itemTertiaryTextStyle: { type: Object, default: () => {} },
    dark: { type: Boolean, default: null },
    disabledValues: { type: Array, default: () => [] },
    disabled: { type: Boolean },
    itemDisabled: { type: Function, default: null },
    dense: { type: Boolean },
    itemIdKey: { type: String, default: 'id' },
    searchBySecondaryText: { type: Boolean },
    orderItemsBy: { type: String, default: 'ordering' },
    itemIcon: { type: String, default: null },
    iconKey: { type: String, default: null },
    iconColor: { type: Function, default: null },
    itemIconColorKey: { type: String, default: '' },
    checkbox: { type: Boolean, default: true },
    groupId: { type: [String, Number], default: '-1' },
    showAppendOnHover: { type: Boolean, Function },
  },
  emits: ['update:model-value'],
  computed: {
    orderedItems() {
      return orderBy(this.items, [this.orderItemsBy], ['asc']);
    },
    isDark() {
      if (isBoolean(this.dark)) return this.dark;
      return this.$vuetify.theme.name === 'dark';
    },
  },
  methods: {
    getItemValue(item) {
      return this.listSelection.getItemValue(item);
    },
    getItemText(item) {
      return this.listSelection.getItemText(item);
    },
    getItemSecondaryText(item) {
      return this.listSelection.getItemSecondaryText(item);
    },
    getItemTertiaryText(item) {
      return this.listSelection.getItemTertiaryText(item);
    },
    isItemSelected(item) {
      return this.listSelection.isItemSelected(item);
    },
    toggleItemSelection(item) {
      if (this.disabled || this.isItemDisabled(item)) return;
      this.$emit('update:model-value', this.listSelection.getToggleItemSelectionState(item));
    },
    isItemDisabled(item) {
      if (this.itemDisabled) return this.itemDisabled(item);
      return this.disabledValues.includes(item[this.itemIdKey]);
    },
    getListItemClass(item) {
      const classes = [];

      if (this.isSingleSelect && this.isItemSelected(item)) {
        classes.push('bg-primary-tint');
      }

      return classes;
    },
    getIconColor(item) {
      if (this.iconColor) return this.iconColor(item);
      return item[this.itemIconColorKey];
    },
    shouldShowAppendOnHover(item) {
      if (typeof this.showAppendOnHover === 'function') return this.showAppendOnHover(item);
      return this.showAppendOnHover || false;
    },
    getItemIcon(item) {
      if (this.isItemSelected(item) && this.$attrs['selected-item-icon']) return this.$attrs['selected-item-icon'];
      if (this.itemIcon) return this.itemIcon;
      if (this.iconKey) return item[this.iconKey];
      return null;
    },
  },
};
</script>
