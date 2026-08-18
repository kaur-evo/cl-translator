<template>
  <v-row
    class="grouped-multiselect"
    :style="{ 'max-width': maxWidth }"
  >
    <v-col cols="12">
      <selection-list-search-input
        v-if="!hideSearch"
        v-model="internalSearch"
        :label="label"
        :disabled="disabled"
        :loading="isLoading"
        :error="!valid"
        :is-focused="isSearchFocused"
        :is-dropdown="isDropdown"
        @keydown.enter="onInputEnterDown"
        @blur="$emit('blur')"
        @update:model-value="$emit('update:search', $event)"
      />
      <slot name="list-prepend" />
      <div
        ref="overflow-container"
        class="overflow-container rounded"
        :class="isDark ? 'dark' : 'light'"
        :style="{ 'max-height': height }"
      >
        <v-list
          v-model:opened="openGroups"
          :variant="flat ? 'flat' : 'text'"
          open-strategy="multiple"
        >
          <v-list-item v-if="orderedGroupsList.length === 0 ">
            <v-list-item-subtitle>
              {{ internalSearch.length ? $t('No search results') : $t('No data') }}
            </v-list-item-subtitle>
          </v-list-item>
          <template v-else-if="hasSelectAllOption && !isSingleSelect">
            <list-item-toggle-all
              :model-value="internalModelValue"
              :items="items"
              :filtered-items="filteredItems"
              :item-value="itemIdKey"
              :disabled="disabled"
              :not-disabled-values="items"
              :error="!valid"
              :dense="dense"
              :inverted="inverted"
              :total-count="totalCount"
              :search="search"
              :dark="isDark"
              :limit="limit"
              :some-selected="someSelected"
              :empty-equals-all-selected="emptyEqualsAllSelected"
              @toggle-all="toggleAllSelected"
            />
            <v-divider :class="{ 'mx-3': isDropdown }" />
          </template>
          <v-list-group
            v-for="(group, groupId) in orderedGroupsList"
            :key="`item-${groupId}`"
            :value="`group-${group[groupIdKey]}`"
            :density="dense ? 'compact' : 'default'"
            @click.stop=""
          >
            <template #activator="{ props }">
              <v-list-item v-bind="props" :density="dense ? 'compact' : 'default'">
                <list-item-contents
                  :input-value="isGroupActive(group)"
                  :disabled="disabled"
                  :primary-text="group.groupLabel"
                  :primary-highlight="internalSearch"
                  :indeterminate="areSomeItemsSelected(group.groupItems)"
                  :error="!valid"
                  :dense="dense"
                  color="primary"
                  :checkbox="!isSingleSelect"
                  :dark="isDark"
                  is-group-activator-item
                  @checkbox-click.stop="toggleGroupSelection(group.groupItems)"
                />
              </v-list-item>
            </template>
            <selection-list-item-group
              :key="internalSearch"
              :items="group.groupItems"
              :list-selection="listSelection"
              :is-single-select="isSingleSelect"
              :error="!valid"
              :search="internalSearch"
              :disabled="disabled"
              :dense="dense"
              :tertiary-text-classes="itemTertiaryTextClasses"
              :tertiary-text-style="itemTertiaryTextStyle"
              :dark="isDark"
              :disabled-values="disabledValues"
              :item-id-key="itemIdKey"
              :search-by-secondary-text="searchBySecondaryText"
              :group-id="groupId"
              :all-selection-value="allSelectionValue"
              :show-append-on-hover="showAppendOnHover"
              class="ml-3"
              @update:model-value="emitModelValue($event)"
            >
              <template #append="{ item }">
                <slot name="append" :item="item" />
              </template>
            </selection-list-item-group>
          </v-list-group>
        </v-list>
      </div>
    </v-col>
  </v-row>
</template>
<script>

import {
  mdiMagnify,
  mdiMinusBox,
  mdiCheckboxBlankOutline,
  mdiCheckboxMarked,
  mdiChevronDown,
} from '@mdi/js';
import { isBoolean, orderBy, isEqual } from 'lodash';
import { toRaw } from 'vue';

import ListItemContents from '@/components/molecules/ListItemContents/index.vue';
import ListItemToggleAll from '@/components/molecules/ListItemToggleAll/index.vue';
import ListSelection, { selectionValueAllSelected } from '@/helpers/listSelection/ListSelection';
import SelectionListSearchInput from '@/components/atoms/SelectionListSearchInput/index.vue';
import SelectionListItemGroup from '@/components/molecules/SelectionListItemGroup/index.vue';


const vectorIcons = {
  mdiMagnify,
  mdiMinusBox,
  mdiCheckboxBlankOutline,
  mdiCheckboxMarked,
  mdiChevronDown,
};

export default {
  name: 'GroupedSelection',
  components: {
    ListItemContents,
    ListItemToggleAll,
    SelectionListSearchInput,
    SelectionListItemGroup,
  },
  props: {
    modelValue: {
      type: Array,
      default: () => [],
    },
    label: {
      type: String,
      default: null,
    },
    disabled: Boolean,
    groupIdKey: {
      type: String,
      default: 'id',
    },
    groupLabelKey: {
      type: String,
      default: 'name',
    },
    itemLabelKey: {
      type: [String, Number, Function],
      default: 'name',
    },
    itemSecondaryText: {
      type: [String, Number, Function],
      default: '',
    },
    itemTertiaryText: {
      type: [String, Number, Function],
      default: '',
    },
    itemIdKey: {
      type: String,
      default: 'id',
    },
    itemGroupIdKey: {
      type: String,
      default: 'groupId',
    },
    allowedItemIds: {
      type: Array,
      default: () => [],
    },
    allowedGroupItemIds: {
      type: Array,
      default: () => [],
    },
    groups: {
      type: Array,
      default: () => [],
    },
    groupsOrderBy: {
      type: String,
      default: 'name',
    },
    numericOrderBy: {
      type: Boolean,
    },
    items: {
      type: Array,
      default: () => [],
    },
    valid: {
      type: Boolean,
      default: true,
    },
    defaultGroupsOpen: {
      type: Boolean,
    },
    height: {
      type: String,
      default: '288px',
    },
    hasSelectAllOption: {
      type: Boolean,
    },
    dense: {
      type: Boolean,
    },
    maxWidth: {
      type: String,
      default: '',
    },
    isDropdown: {
      type: Boolean,
    },
    isSingleSelect: { type: Boolean, default: false },
    inverted: { type: Boolean, default: null },
    totalCount: { type: Number, default: null },
    loading: { type: Boolean },
    search: { type: String, default: '' },
    required: { type: Boolean, default: false },
    dark: { type: Boolean, default: null },
    hideSearch: { type: Boolean },
    itemTertiaryTextClasses: { type: String, default: '' },
    itemTertiaryTextStyle: { type: Object, default: () => {} },
    disabledValues: { type: Array, default: () => [] },
    menuOpen: { type: Boolean },
    useCustomSorting: { type: Boolean },
    isSearchFocused: { type: Boolean },
    searchBySecondaryText: { type: Boolean },
    flat: { type: Boolean },
    emptyEqualsAllSelected: { type: Boolean },
    someSelected: { type: Boolean },
    showAppendOnHover: {
      type: [Boolean, Function],
      default: false,
    },
    limit: { type: Number, default: null },
  },
  emits: ['update:model-value', 'group-selection', 'toggle-all', 'blur', 'update:search', 'update:some-selected'],
  data() {
    return {
      internalLoading: false,
      internalSearch: '',
      filteredItems: [],
      groupedItems: {},
      customOrderedGroups: [],
      openGroups: [],
      ...vectorIcons,
    };
  },
  computed: {
    internalModelValue() {
      if (selectionValueAllSelected(this.emptyEqualsAllSelected, this.modelValue, this.someSelected)) {
        return this.listSelection.getAllItemValues();
      }
      return this.modelValue;
    },
    isDark() {
      if (isBoolean(this.dark)) return this.dark;
      return this.$vuetify.theme.name === 'dark';
    },
    listSelection() {
      return ListSelection({
        itemsList: this.items,
        selectedValuesList: this.modelValue,
        selectionKey: this.itemIdKey,
        inverted: this.inverted,
        totalCount: this.totalCount,
        disabledValues: this.disabledValues,
        itemText: this.itemLabelKey,
        itemSecondaryText: this.itemSecondaryText,
        itemTertiaryText: this.itemTertiaryText,
        isSingleSelect: this.isSingleSelect,
        required: this.required,
        emptyEqualsAllSelected: this.emptyEqualsAllSelected,
        someSelected: this.someSelected,
      });
    },
    groupsMap() {
      return this.groups.reduce(
        (map, gItem) => ({ ...map, [gItem[this.groupIdKey]]: gItem }),
        {},
      );
    },
    itemsMap() {
      return this.items.reduce(
        (map, item) => ({ ...map, [this.getItemValue(item)]: item }),
        {},
      );
    },
    selectedItemGroupIds() {
      return Array.from(
        new Set(this.internalModelValue.reduce((idsArray, id) => {
          if (!this.itemsMap[id]) return idsArray;
          idsArray.push(this.itemsMap[id][this.itemGroupIdKey]);
          return idsArray;
        }, [])),
      );
    },
    orderedGroupsList() {
      const groupedItemsValues = Object.values(this.groupedItems);
      if (this.useCustomSorting && groupedItemsValues.length && this.customOrderedGroups.length) return this.customOrderedGroups;
      return groupedItemsValues.sort((a, b) => {
        if (this.numericOrderBy) {
          return this.numericSortAsc(
            a[this.groupsOrderBy],
            b[this.groupsOrderBy],
          );
        }
        return this.stringSortAsc(a[this.groupsOrderBy], b[this.groupsOrderBy]);
      });
    },
    isLoading() {
      return this.loading || this.internalLoading;
    },
  },
  watch: {
    search(val) {
      this.internalSearch = val;
    },
    allowedItemIds() {
      this.getGroupedItems();
    },
    allowedGroupItemIds() {
      this.getGroupedItems();
    },
    internalSearch() {
      this.getGroupedItems();
    },
    items() {
      this.getGroupedItems();
    },
    groups() {
      this.getGroupedItems();
    },
    selectedItemGroupIds(val) {
      this.$emit('group-selection', val);
    },
    menuOpen(val) {
      if (val) this.orderGroups();
    },
    orderedGroupsList(val, prevVal) {
      if (isEqual(val, prevVal)) return;
      this.openGroups = val.reduce((acc, group) => {
        if (this.isGroupOpen(group)) acc.push(`group-${group[this.groupIdKey]}`);
        return acc;
      }, []);
    },
  },
  mounted() {
    this.getGroupedItems();
    this.$emit(
      'group-selection',
      this.selectedItemGroupIds,
    );
  },
  methods: {
    getGroupedItems() {
      this.internalLoading = true;
      // cant pass functions to web workers
      const isSecondaryTextFunction = typeof this.itemSecondaryText === 'function';
      const items = toRaw(this.items.map((item) => {
        const rawItem = toRaw(item);
        if (isSecondaryTextFunction) {
          rawItem.calculatedSecondaryText = this.itemSecondaryText(item);
        }
        return rawItem;
      }));

      const data = {
        search: this.internalSearch,
        items,
        groupsMap: Object.entries(this.groupsMap).reduce((map, [id, group]) => ({ ...map, [id]: toRaw(group) }), {}),
        itemGroupIdKey: this.itemGroupIdKey,
        groupLabelKey: this.groupLabelKey,
        itemLabelKey: this.itemLabelKey,
        secondaryItemLabelKey: isSecondaryTextFunction ? 'calculatedSecondaryText' : this.itemSecondaryText,
        groupsOrderBy: this.groupsOrderBy,
        defaultGroupsOpen: this.defaultGroupsOpen,
        unGroupedLabel: this.$t('Ungrouped'),
        searchBySecondaryText: this.searchBySecondaryText,
      };
      window.WorkerService.process('processGroupedSelection', JSON.parse(JSON.stringify(data))).then(
        ({ filteredItemsList, itemGroupsMap }) => {
          this.groupedItems = itemGroupsMap ?? [];
          this.filteredItems = filteredItemsList ?? {};
          this.internalLoading = false;
          this.orderGroups();
        },
      );
    },
    getItemValue(item) {
      return this.listSelection.getItemValue(item);
    },
    areAllItemsSelected(items) {
      return this.listSelection.areAllItemsSelected(items);
    },
    areSomeItemsSelected(items) {
      return this.listSelection.areSomeItemsSelected(items);
    },
    numericSortAsc(a, b) {
      return Number(a) - Number(b);
    },
    stringSortAsc(a, b) {
      return String(a).localeCompare(String(b));
    },
    toggleItemSelection(item) {
      if (this.disabled || this.isItemDisabled(item)) return;
      this.emitModelValue(this.listSelection.getToggleItemSelectionState(item));
    },
    toggleGroupSelection(items) {
      this.emitModelValue(this.listSelection.getToggleGroupSelectionState(items));
    },
    onInputEnterDown() {
      if (
        this.orderedGroupsList.length === 1
        && this.orderedGroupsList[0].groupItems
        && this.orderedGroupsList[0].groupItems.length === 1
      ) {
        const selectedItem = this.orderedGroupsList[0].groupItems[0];
        this.toggleItemSelection(selectedItem);
      }
    },
    toggleAllSelected(val) {
      this.emitModelValue(val);
      this.emitToggleAll(val);
    },
    isGroupOpen(group) {
      return group.isOpen || (this.isSingleSelect && this.areSomeItemsSelected(group.groupItems));
    },
    isGroupActive(group) {
      if (this.isSingleSelect) {
        return this.areSomeItemsSelected(group.groupItems);
      }
      return this.areAllItemsSelected(group.groupItems);
    },
    isItemDisabled(item) {
      return this.disabledValues.includes(item[this.itemIdKey]);
    },
    orderGroups() {
      const isPredefined = (val) => val.id === -1;
      const areSomeGroupItemsSelected = (val) => this.internalModelValue && val.groupItems.some((item) => this.internalModelValue.includes(item.id));
      const areAllGroupItemsSelected = (val) => this.internalModelValue && val.groupItems.every((item) => this.internalModelValue.includes(item.id));
      const lowerName = (val) => val.name?.toLowerCase();
      this.customOrderedGroups = orderBy(Object.values(this.groupedItems), [areAllGroupItemsSelected, areSomeGroupItemsSelected, isPredefined, lowerName], ['desc', 'desc', 'desc', 'asc']);
    },
    emitModelValue(val) {
      if (!this.internalSearch.length && this.emptyEqualsAllSelected && val.length === this.items.length) {
        this.$emit('update:model-value', []);
      } else if (this.emptyEqualsAllSelected && this.areAllItemsSelected(this.items) && val.length === 1) {
        this.$emit('update:model-value', this.items.map((item) => this.getItemValue(item)).filter((item) => item !== val[0]));
      } else {
        this.$emit('update:model-value', val);
      }
      this.$emit('update:some-selected', !!val.length);
    },
    emitToggleAll(val) {
      if (!this.internalSearch.length && this.emptyEqualsAllSelected && val.length === this.items.length) {
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
