<template>
  <v-list-item
    :disabled="!notDisabledValues.length || disabled"
    :density="dense ? 'compact' : 'default'"
    :height="dense ? '40px' : '48px'"
    @click.stop="toggleAllSelected"
  >
    <list-item-contents
      :input-value="areAllVisibleItemsSelected"
      :indeterminate="areSomeVisibleItemsSelected && !areAllVisibleItemsSelected"
      :error="error"
      :primary-text="search.length ? $t('Select all visible') : $t('Select all')"
      :disabled="disabled"
      checkbox
      :dense="dense"
      :dark="dark"
    />
  </v-list-item>
</template>
<script>
import ListSelection from '@/helpers/listSelection/ListSelection';
import ListItemContents from '@/components/molecules/ListItemContents/index.vue';

export default {
  name: 'ListItemToggleAll',
  components: { ListItemContents },
  props: {
    items: { type: Array, default: () => [] },
    filteredItems: { type: [Array, Boolean], default: false },
    modelValue: { type: Array, default: () => [] },
    itemValue: { type: String, default: '' },
    error: { type: Boolean },
    dense: { type: Boolean },
    disabled: { type: Boolean },
    itemDisabled: { type: [String, Array, Function], default: '' },
    disabledValues: { type: Array, default: () => [] },
    notDisabledValues: { type: Array, default: () => [] },
    inverted: { type: Boolean, default: null },
    totalCount: { type: Number, default: null },
    search: { type: String, default: '' },
    dark: { type: Boolean, default: null },
    limit: { type: Number, default: null },
    someSelected: { type: Boolean },
    emptyEqualsAllSelected: { type: Boolean },
  },
  emits: ['update:model-value', 'change', 'toggle-all'],
  computed: {
    listSelection() {
      return ListSelection({
        itemsList: this.listSelectionItems,
        selectedValuesList: this.modelValue,
        selectionKey: this.itemValue,
        inverted: this.inverted,
        totalCount: this.currentTotalCount,
        disabledValues: this.disabledValues,
        search: this.search,
        someSelected: this.someSelected,
        emptyEqualsAllSelected: this.emptyEqualsAllSelected,
        limit: this.limit,
      });
    },
    listSelectionItems() {
      if (this.itemDisabled) return this.currentlyVisibleItems.filter((item) => !this.itemDisabled(item));
      return this.currentlyVisibleItems;
    },
    currentlyVisibleItems() {
      if (this.filteredItems) return this.filteredItems;
      return this.items;
    },
    currentTotalCount() {
      return this.search.length ? this.filteredItems.length : this.totalCount;
    },
    areAllVisibleItemsSelected() {
      return this.listSelection.areTotalAllItemsSelected();
    },
    areSomeVisibleItemsSelected() {
      return this.listSelection.areSomeItemsSelected();
    },
  },
  methods: {
    toggleAllSelected() {
      this.emitChanges(this.listSelection.getToggleTotalAllItemsState());
    },
    emitChanges(values) {
      this.$emit('update:model-value', values);
      this.$emit('change', values);
      this.$emit('toggle-all', values);
    },
  },
};
</script>
