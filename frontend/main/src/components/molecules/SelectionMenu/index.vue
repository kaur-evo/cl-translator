<template>
  <v-menu
    :model-value="menuOpenInternal"
    :close-on-content-click="isSingleSelect"
    v-bind="$attrs"
    :offset="menuYOffset"
    @update:model-value="onMenuChange()"
  >
    <template
      v-for="slot in Object.keys($slots)"
      #[slot]="scope"
    >
      <slot :name="slot" v-bind="scope" />
    </template>
    <v-sheet :theme="isDark ? 'dark' : 'light'">
      <grouped-selection
        v-if="isGrouped"
        ref="grouped-selection"
        v-model:search="internalSearch"
        height="300px"
        :model-value="valueCopy"
        :group-id-key="groupIdKey"
        :item-id-key="itemValue"
        :items="orderedItems"
        :groups="groups"
        :item-group-id-key="itemGroupIdKey"
        :groups-order-by="groupsOrderBy"
        :numeric-order-by="numericOrderBy"
        :item-secondary-text="itemSecondaryText"
        :item-tertiary-text="itemTertiaryText"
        :item-tertiary-text-classes="itemTertiaryTextClasses"
        :item-tertiary-text-style="itemTertiaryTextStyle"
        :dense="dense"
        has-select-all-option
        is-dropdown
        :inverted="inverted"
        :total-count="totalCount"
        :remove-non-existent-selections="removeNonExistentSelections"
        :loading="isLoading"
        :is-single-select="isSingleSelect"
        :required="required"
        :disabled-values="disabledValues"
        :use-custom-sorting="useCustomSorting"
        :menu-open="menuOpen"
        :is-search-focused="menuOpen"
        :hide-search="hideSearch"
        :dark="isDark"
        :flat="flat"
        :limit="limit"
        :search-by-secondary-text="searchBySecondaryText"
        :some-selected="someSelected"
        :empty-equals-all-selected="emptyEqualsAllSelected"
        @update:some-selected="$emit('update:some-selected', $event)"
        @update:model-value="onValueChange"
        @toggle-all="onAllToggled"
      >
        <template #list-prepend>
          <slot name="list-prepend" />
        </template>
        <template #append="{ item }">
          <slot name="item-append" :item="item" />
        </template>
      </grouped-selection>
      <selection-list
        v-else
        v-bind="$attrs"
        v-model:search="internalSearch"
        :model-value="valueCopy"
        :items="orderedItems"
        :item-text="itemText"
        :item-secondary-text="itemSecondaryText"
        :item-tertiary-text="itemTertiaryText"
        :item-value="itemValue"
        :item-flag="itemFlag"
        :item-icon="itemIcon"
        :icon-key="iconKey"
        :item-icon-color-key="itemIconColorKey"
        :item-disabled="isItemDisabled"
        :loading="isLoading"
        max-height="300px"
        height="auto"
        :dense="dense"
        :inverted="inverted"
        :total-count="totalCount"
        :is-search-focused="menuOpen"
        :is-single-select="isSingleSelect"
        :hide-search="hideSearch"
        :hide-select-all="hideSelectAll"
        :required="required"
        :dark="isDark"
        :checkbox="checkbox"
        :search-by-secondary-text="searchBySecondaryText"
        :some-selected="someSelected"
        :empty-equals-all-selected="emptyEqualsAllSelected"
        @update:some-selected="$emit('update:some-selected', $event)"
        @update:model-value="onValueChange"
        @toggle-all="onAllToggled"
      >
        <template #append="{ item }">
          <slot name="item-append" :item="item" />
        </template>
        <template #primary-title-append="{ item }">
          <slot name="primary-title-append" :item="item" />
        </template>
      </selection-list>
      <div
        v-if="showActions"
        id="menu-actions"
        class="pa-4 pt-2 d-flex justify-end"
      >
        <slot name="actions" />
        <v-spacer />
        <evocon-v-button
          class="mr-2"
          size="small"
          :text="$t('Cancel')"
          @click="$emit('cancel')"
        />
        <evocon-v-button
          color="primary"
          size="small"
          :text="$t('Apply')"
          :loading="saveLoading"
          @click="onSaveClick"
        />
      </div>
    </v-sheet>
  </v-menu>
</template>
<script>
import isFunction from 'lodash/isFunction';
import { mdiMagnify, mdiClose } from '@mdi/js';
import { orderBy, isEqual } from 'lodash';

import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import GroupedSelection from '@/components/molecules/GroupedSelection/index.vue';
import SelectionList from '@/components/molecules/SelectionList/index.vue';

const icons = { mdiClose, mdiMagnify };

export default {
  name: 'SelectionMenu',
  components: {
    SelectionList,
    GroupedSelection,
    EvoconVButton,
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
    itemText: {
      type: String,
      default: '',
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
      default: '',
    },
    menuOpen: {
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
    dense: { type: Boolean },
    hasActions: { type: Boolean },
    isGrouped: { type: Boolean },
    inverted: { type: Boolean },
    totalCount: { type: Number, default: null },
    removeNonExistentSelections: { type: Boolean, default: true },
    loading: { type: Boolean },
    isSingleSelect: { type: Boolean },
    required: { type: Boolean },
    itemTertiaryTextClasses: { type: String, default: '' },
    itemTertiaryTextStyle: { type: Object, default: () => {} },
    itemDisabled: { type: Function, default: null },
    disabledValues: { type: Array, default: () => [] },
    useCustomSorting: { type: Boolean },
    hideSearch: { type: Boolean },
    dark: { type: Boolean, default: null },
    hideSelectAll: { type: Boolean },
    searchBySecondaryText: { type: Boolean },
    flat: { type: Boolean },
    itemIcon: { type: String, default: null },
    iconKey: { type: String, default: null },
    itemIconColorKey: { type: String, default: null },
    checkbox: { type: Boolean, default: true },
    menuYOffset: { type: String, default: '0px' },
    emitToggleAll: { type: Boolean },
    someSelected: { type: Boolean },
    emptyEqualsAllSelected: { type: Boolean },
    limit: { type: Number, default: null },
  },
  emits: ['apply', 'created', 'change', 'toggle-all', 'cancel', 'search-input', 'update:menu-open', 'update:some-selected'],
  data() {
    return {
      ...icons,
      internalSearch: '',
      saveLoading: false,
      orderedItems: [],
      menuOpenInternal: false,
    };
  },
  computed: {
    valueCopy() {
      return this.modelValue;
    },
    isLoading() {
      return this.loading || this.saveLoading;
    },
    isDark() {
      return this.dark === null ? this.$vuetify.theme.name === 'dark' : this.dark;
    },
    showActions() {
      return this.hasActions && !this.isSingleSelect;
    },
  },
  watch: {
    internalSearch(val) {
      this.$emit('search-input', val);
    },
    isLoading(val) {
      if (!val) this.setOrderedItems();
    },
    menuOpen(val) {
      this.menuOpenInternal = val;
    },
    items(prevVal, newVal) {
      if (!isEqual(prevVal, newVal)) this.setOrderedItems();
    },
  },
  mounted() {
    this.setOrderedItems();
  },
  created() {
    this.$emit('created');
  },
  methods: {
    isItemDisabled(item) {
      return !!this.itemDisabled && !!isFunction(this.itemDisabled) && !!this.itemDisabled(item);
    },
    onSaveClick() {
      this.saveLoading = true;
      setTimeout(() => {
        this.$emit('apply');
        this.saveLoading = false;
        if (this.$refs['grouped-selection']) this.$refs['grouped-selection'].$refs['overflow-container'].scrollTop = 0;
        else if (this.$refs['multiselect-list']) this.$refs['multiselect-list'].$refs['overflow-container'].scrollTop = 0;
      }, 300);
    },
    onAllToggled(items) {
      if (this.emitToggleAll) {
        this.$emit('toggle-all', items);
      } else {
        this.$emit('change', items);
      }
    },
    onValueChange(input) {
      this.$emit('change', input);
      if (this.isSingleSelect) this.onMenuChange();
    },
    setOrderedItems() {
      if (this.useCustomSorting) {
        const isPredefined = (val) => [0, -1].includes(val.id);
        const isSelected = (val) => this.modelValue.includes(val.id);
        const lowerName = (val) => val.name?.toLowerCase();
        this.orderedItems = orderBy(this.items, [isSelected, isPredefined, 'deleted', lowerName], ['desc', 'desc', 'asc', 'asc']);
      } else this.orderedItems = this.items;
    },
    onMenuChange() {
      this.menuOpenInternal = !this.menuOpenInternal;
      this.$emit('update:menu-open', this.menuOpenInternal);
      this.internalSearch = '';
      this.setOrderedItems();
    },
  },
};

</script>
