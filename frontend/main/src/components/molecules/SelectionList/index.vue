<template>
  <v-row :style="{ 'max-width': maxWidth }">
    <v-col cols="12">
      <selection-list-search-input
        v-if="showSearch"
        v-model="internalSearch"
        :disabled="disabled"
        :loading="loading"
        :error="!valid"
        :is-focused="isSearchFocused"
        :is-dropdown="isDropdown"
        @blur="$emit('blur')"
        @update:model-value="$emit('update:search', $event)"
      />
      <div
        ref="overflow-container"
        class="overflow-container rounded"
        :style="{ height, maxHeight, width }"
      >
        <v-list
          class="v-select-list"
          variant="flat"
        >
          <template v-if="!(noSearchResults || noData) && !isSingleSelect && !hideSelectAll">
            <list-item-toggle-all
              :model-value="internalModelValue"
              :items="items"
              :filtered-items="filteredItems"
              :item-value="itemValue"
              :disabled="noSearchResults || noData"
              :item-disabled="itemDisabled"
              :disabled-values="valuesGroupedByDisabled.disabled"
              :not-disabled-values="valuesGroupedByDisabled.notDisabled"
              :error="!valid"
              :dense="dense"
              :inverted="inverted"
              :total-count="totalCount"
              :search="searchVal"
              :dark="isDark"
              @toggle-all="toggleAllSelected"
            />
            <v-divider class="mx-3" />
          </template>

          <v-list-item
            v-if="noSearchResults || noData"
            height="48px"
          >
            <template #subtitle>
              <span class="line-height-normal">
                {{ noSearchResults ? $t('No search results') : $t('No data') }}
              </span>
            </template>
          </v-list-item>
          <selection-list-item-group
            v-bind="$attrs"
            :items="filteredItems"
            :list-selection="listSelection"
            :is-single-select="isSingleSelect"
            :item-flag="itemFlag"
            :item-icon="itemIcon"
            :icon-key="iconKey"
            :icon-color="iconColor"
            :item-icon-color-key="itemIconColorKey"
            :error="!valid"
            :search="internalSearch"
            :disabled="disabled"
            :item-disabled="itemDisabled"
            :dense="dense"
            :dark="isDark"
            :checkbox="checkbox"
            :search-by-secondary-text="searchBySecondaryText"
            @update:model-value="emitModelValue"
          >
            <template #primary-title-append="{ item }">
              <slot name="primary-title-append" :item="item" />
            </template>
            <template #append="{ item }">
              <slot name="append" :item="item" />
            </template>
          </selection-list-item-group>
        </v-list>
      </div>
    </v-col>
  </v-row>
</template>
<script>
import ListItemToggleAll from '@/components/molecules/ListItemToggleAll/index.vue';
import ListSelection, { selectionValueAllSelected } from '@/helpers/listSelection/ListSelection';
import SelectionListSearchInput from '@/components/atoms/SelectionListSearchInput/index.vue';
import SelectionListItemGroup from '@/components/molecules/SelectionListItemGroup/index.vue';

export default {
  name: 'SelectionList',
  components: {
    ListItemToggleAll,
    SelectionListSearchInput,
    SelectionListItemGroup,
  },
  props: {
    modelValue: {
      type: Array,
      default: () => [],
    },
    itemText: {
      type: [String, Number, Function],
      default: 'text',
    },
    itemFlag: {
      type: String,
      default: '',
    },
    itemSecondaryText: {
      type: [String, Number, Function],
      default: '',
    },
    itemTertiaryText: {
      type: [String, Number, Function],
      default: '',
    },
    itemValue: {
      type: String,
      default: 'value',
    },
    items: {
      type: Array,
      default: () => [],
    },
    valid: {
      type: Boolean,
      default: true,
    },
    loading: {
      type: Boolean,
    },
    height: {
      type: String,
      default: '350px',
    },
    width: {
      type: String,
      default: null,
    },
    maxHeight: {
      type: String,
      default: '',
    },
    hideSearch: {
      type: Boolean,
    },
    itemDisabled: {
      type: [String, Array, Function],
      default: '',
    },
    dense: {
      type: Boolean,
    },
    search: {
      type: String,
      default: '',
    },
    maxWidth: {
      type: String,
      default: '',
    },
    inverted: { type: Boolean, default: null },
    totalCount: { type: Number, default: null },
    isSingleSelect: { type: Boolean },
    isSearchFocused: { type: Boolean },
    disabled: { type: Boolean },
    required: { type: Boolean },
    dark: { type: Boolean, default: null },
    hideSelectAll: { type: Boolean },
    searchBySecondaryText: { type: Boolean },
    itemIcon: { type: String, default: null },
    iconKey: { type: String, default: null },
    iconColor: { type: Function, default: null },
    itemIconColorKey: { type: String, default: '' },
    checkbox: { type: Boolean, default: true },
    isDropdown: { type: Boolean, default: true },
    emptyEqualsAllSelected: { type: Boolean },
    someSelected: { type: Boolean },
  },
  emits: ['update:model-value', 'update:some-selected', 'blur', 'update:search', 'toggle-all'],
  data() {
    return {
      internalSearch: '',
    };
  },
  computed: {
    showSearch() {
      if (this.hideSearch) return false;
      if (this.internalSearch.length > 0) return true;
      return this.items.length > 5;
    },
    internalModelValue() {
      if (selectionValueAllSelected(this.emptyEqualsAllSelected, this.modelValue, this.someSelected)) {
        return this.listSelection.getAllItemValues();
      }
      return this.modelValue;
    },
    listSelection() {
      return ListSelection({
        itemsList: this.items,
        selectedValuesList: this.modelValue,
        selectionKey: this.itemValue,
        inverted: this.inverted,
        totalCount: this.totalCount,
        itemText: this.itemText,
        itemSecondaryText: this.itemSecondaryText,
        itemTertiaryText: this.itemTertiaryText,
        itemDisabled: this.itemDisabled,
        isSingleSelect: this.isSingleSelect,
        required: this.required,
        emptyEqualsAllSelected: this.emptyEqualsAllSelected,
        someSelected: this.someSelected,
      });
    },
    searchVal() {
      return this.search ? this.search : this.internalSearch;
    },
    noSearchResults() {
      return !this.filteredItems.length && !!this.items.length;
    },
    noData() {
      return !this.items.length;
    },
    filteredItems() {
      return this.items.filter((item) => {
        const secondaryText = this.getItemSecondaryText(item);
        const matchesPrimaryText = this.matchesSearch(this.getItemText(item));
        const matchesSecondaryText = this.searchBySecondaryText && secondaryText && this.matchesSearch(secondaryText);
        return matchesPrimaryText || matchesSecondaryText;
      });
    },
    valuesGroupedByDisabled() {
      return this.items.reduce((obj, item) => {
        const itemValue = this.getItemValue(item);

        if (this.isItemDisabled(item) && this.isItemSelected(item)) {
          obj.disabled.push(itemValue);
        } else if (!this.isItemDisabled(item)) {
          obj.notDisabled.push(itemValue);
        }
        return obj;
      }, { disabled: [], notDisabled: [] });
    },
    isDark() {
      return this.dark === null ? this.$vuetify.theme.name === 'dark' : this.dark;
    },
  },
  methods: {
    matchesSearch(val) {
      return String(val).toLowerCase().includes(String(this.searchVal).toLowerCase());
    },
    getItemValue(item) {
      return this.listSelection.getItemValue(item);
    },
    areAllItemsSelected(items) {
      return this.listSelection.areAllItemsSelected(items);
    },
    isItemSelected(item) {
      return this.listSelection.isItemSelected(item);
    },
    getItemText(item) {
      return this.listSelection.getItemText(item);
    },
    getItemSecondaryText(item) {
      return this.listSelection.getItemSecondaryText(item);
    },
    isItemDisabled(item) {
      return this.listSelection.isItemDisabled(item);
    },
    toggleAllSelected(val) {
      this.emitModelValue(val);
      this.emitToggleAll(val);
    },

    emitModelValue(val) {
      if (this.emptyEqualsAllSelected && val.length === this.items.length) {
        this.$emit('update:model-value', []);
      } else if (this.emptyEqualsAllSelected && this.areAllItemsSelected(this.items) && val.length === 1) {
        const itemValues = this.items.map((item) => this.getItemValue(item));
        const filteredValues = itemValues.filter((item) => item !== val[0]);
        this.$emit('update:model-value', filteredValues);
      } else {
        this.$emit('update:model-value', val);
      }
      this.$emit('update:some-selected', !!val.length);
    },
    emitToggleAll(val) {
      if (this.emptyEqualsAllSelected && val.length === this.items.length) {
        this.$emit('toggle-all', []);
      } else {
        this.$emit('toggle-all', val);
      }
      this.$emit('update:some-selected', !!val.length);
    },
  },
};
</script>
<style lang="scss" scoped>
.overflow-container {
  overflow-y: auto;
  &.light {
    &::-webkit-scrollbar {
      width: 6px;
    }
    &::-webkit-scrollbar-track {
      background: rgba(0, 0, 0, 0.12);
    }
    &::-webkit-scrollbar-thumb {
      background: rgb(var(--v-theme-tertiary-dark));
      border-radius: 16px;
    }
  }
  &.dark {
    &::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.12);
    }
    &::-webkit-scrollbar-thumb {
      background: rgb(var(--v-theme-tertiary-dark));
    }
  }
  &::-webkit-scrollbar-thumb {
    border-radius: 16px;
  }
  &::-webkit-scrollbar {
    width: 6px;
  }
}

</style>
