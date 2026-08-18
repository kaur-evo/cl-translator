<template>
  <evocon-v-combobox
    ref="shiftviewSearchCombo"
    v-bind="$attrs"
    :prepend-inner-icon="mdiMagnify"
    :items="items"
    :item-title="itemTitleKey"
    :item-value="itemValueKey"
    :placeholder="$t('Search')"
    hide-details
    :custom-filter="filterFunction"
    @update:search="search"
    @update:model-value="onItemSelected"
  >
    <template #item="{ item, props }">
      <v-list-item v-bind="props" class="py-3">
        <v-list-item-subtitle v-if="itemSubtitleKey && item[itemSubtitleKey]" class="line-height-normal">
          {{ item[itemSubtitleKey] }}
        </v-list-item-subtitle>
        <v-list-item-subtitle v-if="itemSubtitleFunction" class="line-height-normal">
          {{ itemSubtitleFunction(item) }}
        </v-list-item-subtitle>
      </v-list-item>
    </template>
    <template #no-data>
      <v-list-item>
        <v-list-item-title>
          {{ $t('No search results') }}
        </v-list-item-title>
      </v-list-item>
    </template>
  </evocon-v-combobox>
</template>
<script>
import { mdiMagnify } from '@mdi/js';

import EvoconVCombobox from '@/components/atoms/EvoconVCombobox/index.vue';

const vectorIcons = { mdiMagnify };

export default {
  name: 'ShiftviewSearch',
  components: { EvoconVCombobox },
  props: {
    items: {
      type: Array,
      default: () => [],
    },
    itemTitleKey: {
      type: String,
      default: 'name',
    },
    itemSubtitleKey: {
      type: String,
      default: '',
    },
    itemValueKey: {
      type: String,
      default: 'id',
    },
    itemSubtitleFunction: {
      type: Function,
      default: () => '',
    },
    filterItemsOnSearch: {
      type: Boolean,
      default: true,
    },
  },
  emits: ['item-selected', 'on-search'],
  data() {
    return {
      ...vectorIcons,
    };
  },
  methods: {
    onItemSelected($event) {
      if (!$event || typeof $event !== 'object') return;
      const foundItem = this.items.find((item) => item && item.id === $event.id);
      if (foundItem) this.$emit('item-selected', foundItem);
      this.$refs.shiftviewSearchCombo.$refs.evoconCombobox.reset();
    },
    filterFunction(itemText, searchText) {
      if (this.filterItemsOnSearch) {
        return itemText.toLocaleLowerCase().indexOf(searchText.toLocaleLowerCase()) > -1;
      }
      return true;
    },
    search(input) {
      if (typeof input !== 'string') return;
      this.$emit('on-search', input?.trim());
    },
  },
};
</script>
