<template>
  <span class="selection-input-wrapper">
    <selection-input
      :model-value="temporaryState"
      v-bind="$attrs"
      :items="itemsList"
      :groups="groups"
      :loading="isLoading"
      :items-map="itemsObj"
      :menu-open="menuOpen"
      :inverted="temporaryIsInverted"
      :disabled="isLoading"
      emit-toggle-all
      @created="fetchFilterItems"
      @update:menu-open="onUpdateMenuOpen($event)"
      @update:model-value="onInput($event)"
      @search-input="onSearchInput"
      @change="onChange"
      @toggle-all="onToggleSelectAll"
    />
  </span>
</template>
<script>
import { uniqBy, isEqual } from 'lodash';

import filterItemsApi from '@/api/filterItemsApi';
import listToKeyMap from '@/helpers/list/listToKeyMap';
import SelectionInput from '@/components/molecules/SelectionInput/index.vue';
import { resolvePiniaGetter, resolvePiniaAction } from '@/stores/filterbar';

export default {
  name: 'AdvancedSelectionInput',
  components: {
    SelectionInput,
  },
  props: {
    limit: { type: Number, default: 300 },
    configuration: { type: Object, default: () => ({}) },
    modelValue: { type: Array, default: () => [] },
    isInverted: { type: Boolean },
    period: { type: Array, default: () => [] },
    filterBy: { type: Array, default: () => [] },
    selectAllAsEmpty: { type: Boolean },
  },
  emits: ['update:model-value', 'update:is-inverted'],
  data() {
    return {
      backendLoading: false,
      isSearchActive: false,
      items: [],
      selectedItems: [],
      initialized: false,
      temporaryState: [],
      temporaryIsInverted: false,
      menuOpen: false,
    };
  },
  computed: {
    fetchedItems() {
      if (this.isSearchActive) {
        return this.items;
      }
      return uniqBy([...this.selectedItems, ...this.items], this.attributes?.itemValue);
    },
    attributes() {
      return this.configuration?.attr;
    },
    backendFilteringConfig() {
      return this.configuration?.backendFilteringConfig;
    },
    useSelectionInversion() {
      return !!this.configuration?.useSelectionInversion;
    },
    isLoading() {
      const loading = [];
      if (this.backendFilteringConfig) {
        loading.push(this.backendLoading);
      }
      if (this.configuration?.storeLoadingGetterPath) {
        loading.push(resolvePiniaGetter(this.configuration.storeLoadingGetterPath));
      }
      return loading.some((val) => !!val);
    },
    itemsObj() {
      return listToKeyMap(this.itemsList, this.attributes?.itemValue);
    },
    itemsList() {
      const { backendFilteringConfig, configuration } = this;
      if (backendFilteringConfig) {
        return [...this.fetchedItems].slice(0, this.limit);
      }
      if (configuration?.storeItemsGetterPath) {
        return resolvePiniaGetter(configuration.storeItemsGetterPath);
      }
      if (configuration?.items) {
        return configuration.items;
      }
      return [];
    },
    itemsTotalCount() {
      if (this.backendFilteringConfig) {
        if (this.itemsList.length < this.limit && !this.isSearchActive) {
          return this.itemsList.length;
        }
        return -1;
      }
      return this.itemsList.length;
    },
    groups() {
      const path = this.configuration?.storeItemGroupsGetterPath;
      if (path) {
        return resolvePiniaGetter(path);
      }
      return [];
    },
  },
  watch: {
    modelValue() {
      this.temporaryState = this.modelValue;
      if (this.useSelectionInversion) {
        this.invertSelectionIfNeeded();
      }
      if (this.backendFilteringConfig) {
        this.getItemsBackendFiltered();
      }
    },
    isInverted(val) {
      this.temporaryIsInverted = val;
    },
    menuOpen(newVal, prevVal) {
      if (newVal && !prevVal) {
        this.temporaryState = this.modelValue;
      }
    },
    filterBy: {
      handler(newVal, oldVal) {
        if (this.backendFilteringConfig && !isEqual(newVal, oldVal)) {
          this.getItemsBackendFiltered();
        }
      },
      deep: true,
    },
  },
  mounted() {
    this.temporaryIsInverted = this.isInverted;
    this.temporaryState = this.modelValue;
  },
  methods: {
    invertSelectionIfNeeded() {
      if (this.itemsTotalCount > 2 && this.modelValue.length > (this.itemsTotalCount / 2) && !this.isSearchActive) {
        const newValue = this.getInvertedSelection();
        this.temporaryState = newValue;
        this.toggleFilterInversion();
      }
    },
    getInvertedSelection() {
      const itemsObjCopy = { ...this.itemsObj };
      this.modelValue.forEach((id) => {
        delete itemsObjCopy[id];
      });
      return Object.keys(itemsObjCopy).map((k) => {
        if (Number.isNaN(Number(k))) {
          return k;
        }
        return Number(k);
      });
    },
    async getItemsBackendFiltered(searchInput = '') {
      if (searchInput) {
        this.items = await this.getFilterItems({ limit: this.limit, searchTerm: searchInput });
      } else {
        const resultQuery = this.getFilterItems({ limit: this.limit });
        let selectionQuery;
        if (this.modelValue.length) {
          selectionQuery = this.getFilterItems({ limit: this.limit, id: this.modelValue });
        } else {
          selectionQuery = [];
        }
        this.backendLoading = true;
        const [result, selection] = await Promise.all([resultQuery, selectionQuery]);
        this.backendLoading = false;
        this.items = result;
        this.selectedItems = selection;
        if (this.useSelectionInversion) {
          this.invertSelectionIfNeeded();
        }
      }
    },
    getFilterItems(extraParams) {
      const { entity } = this.backendFilteringConfig;
      let queryParams = {};
      if (this.period) {
        const [start, end] = this.period;
        queryParams.startDate = start;
        queryParams.endDate = end;
      }
      this.filterBy?.forEach((filter) => {
        queryParams[filter.key] = filter.value;
      });
      queryParams = { ...queryParams, ...extraParams };
      return filterItemsApi.getFilterItems(entity, queryParams);
    },
    async fetchFilterItems() {
      const paths = this.configuration.storeDispatchPaths;
      const promises = [];
      if (this.backendFilteringConfig) {
        promises.push(this.getItemsBackendFiltered());
      }
      if (paths) {
        paths.forEach((path) => {
          promises.push(resolvePiniaAction(path));
        });
      }
      await Promise.all(promises);
      this.initialized = true;
    },
    onUpdateMenuOpen(val) {
      this.menuOpen = !val;
      if (!this.menuOpen) {
        this.onApply();
      }
    },
    onInput(val) {
      if (this.configuration.updateOnInput) {
        this.temporaryState = val;
      }
    },
    onSearchInput(val) {
      this.isSearchActive = val.length > 0;
      if (this.backendFilteringConfig) {
        this.getItemsBackendFiltered(val);
      }
    },
    onChange(value) {
      this.temporaryState = value;
    },
    onApply() {
      if (this.backendFilteringConfig) {
        const itemsShown = this.itemsTotalCount === -1 ? this.limit : Math.min(this.itemsTotalCount, this.limit);
        if (this.selectAllAsEmpty && this.temporaryState.length >= itemsShown) {
          this.temporaryState = [];
        }
      }
      this.$emit('update:model-value', this.temporaryState);
      this.$emit('update:is-inverted', this.temporaryIsInverted);
    },
    onToggleSelectAll(value) {
      if (this.useSelectionInversion) {
        if (this.isSearchActive) {
          this.temporaryState = value;
          this.invertSelectionIfNeeded();
        } else {
          this.toggleFilterInversion();
          this.temporaryState = [];
        }
      } else {
        this.temporaryState = value;
      }
    },
    toggleFilterInversion() {
      this.temporaryIsInverted = !this.temporaryIsInverted;
    },
  },
};
</script>
<style lang="scss" scoped>
.selection-input-wrapper {
  min-width: 0;
}
</style>
