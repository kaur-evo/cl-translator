<template>
  <v-tooltip
    :disabled="isOpen"
    :text="tooltipContent"
    :location="tooltipDirectionTop ? 'top' : 'bottom'"
    :content-class="!configuration.tooltipHidden && Array.isArray(value) && value.length > 1
      ? 'text-body-small px-4 py-2'
      : 'd-none'
    "
  >
    <template #activator="{ props: tooltipProps }">
      <span
        v-bind="{ ...wrapperAttributes, ...tooltipProps }"
        class="d-block"
        :class="{ 'chip-container': useChips }"
      >
        <component
          :is="component"
          v-bind="attributes"
          v-model:some-selected="someSelected"
          :model-value="value"
          :items="filteredItemsList"
          :groups="groups"
          :loading="isLoading"
          :menu-open="isOpen"
          :inverted="isInverted"
          :total-count="itemsTotalCount"
          :remove-non-existent-selections="!backendFilteringConfig"
          :menu-y-offset="menuYOffset"
          :dense="useChips || dense"
          :configuration="configuration"
          :limit="limit"
          :has-actions="!isMobileView"
          @toggle-all="onToggleSelectAll"
          @change="onFilterChange"
          @update:model-value="onFilterInput($event, filter)"
          @created="fetchFilterItems()"
          @update:menu-open="onUpdateMenuOpen($event, filter)"
          @apply="onApply"
          @cancel="cancelFilterChange(filter)"
          @search-input="onSearchInput"
          @click:append-inner="onFilterInput('', filter)"
        >
          <template #activator="{ props }">
            <span v-bind="props">
              <selection-menu-input
                v-bind="{ ...attributes, tooltipProps }"
                :model-value="value"
                :is-open="isOpen"
                :error="value.length === 0 && attributes.required"
                :item-text="inputItemTextKey"
                :item-secondary-text="inputItemSecondaryTextKey"
                :items-map="inputItemsObj"
                :total-count="itemsTotalCount"
                :prepend-text="inputPrependText"
                :inverted="isInverted"
                :use-chips="useChips"
                color-active-prepend
                :append-icon="appendIcon"
                :some-selected="someSelected"
                show-empty-array-as-all-selected
                @append-icon-click="onEmptyFilter"
                @update:menu-open="onUpdateMenuOpen($event, filter)"
              >
                <template
                  v-for="slot in Object.keys($slots)"
                  #[slot]="scope"
                >
                  <slot :name="slot" v-bind="scope" />
                </template>
              </selection-menu-input>
            </span>
          </template>
          <template #actions>
            <evocon-v-button
              v-if="isRemovable"
              :icon="mdiDelete"
              size="small"
              @click="removeFilter(filter)"
            />
          </template>
        </component>
      </span>
    </template>
  </v-tooltip>
</template>
<script>
import { mdiCloseCircle, mdiDelete } from '@mdi/js';
import { mapState, mapActions } from 'pinia';
import { isEqual, uniqBy, isArray } from 'lodash';

import SelectionMenu from '@/components/molecules/SelectionMenu/index.vue';
import SingleSelectList from '@/components/molecules/SingleSelectList/index.vue';
import EvoconVInput from '@/components/atoms/EvoconVInput/index.vue';
import DateRangeFilter from '@/components/molecules/DateRangeFilter/index.vue';
import { NOT_SPECIFIED_ID } from '@/constants/identificators';
import filterItemsApi from '@/api/filterItemsApi';
import UrlParams from '@/helpers/UrlParams';
import { getCurrentPeriod } from '@/constants/rollingPeriodRangeDefinitions';
import EvoconInputChip from '@/components/atoms/EvoconInputChip/index.vue';
import listToKeyMap from '@/helpers/list/listToKeyMap';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import SelectionMenuInput from '@/components/molecules/SelectionMenuInput/index.vue';
import AdvancedSelectionInput from '@/components/molecules/AdvancedSelectionInput/index.vue';
import useDeviceStore from '@/stores/device';
import useFilterbarStore, { resolvePiniaGetter, resolvePiniaAction } from '@/stores/filterbar';
import useProfileStore from '@/stores/profile';

const icons = { mdiCloseCircle, mdiDelete };

export default {
  name: 'FilterBarFilter',
  components: {
    SelectionMenu,
    SelectionMenuInput,
    SingleSelectList,
    EvoconVInput,
    DateRangeFilter,
    EvoconVButton,
    EvoconInputChip,
    AdvancedSelectionInput,
  },
  props: {
    filter: { type: String, required: true },
    limit: { type: Number, default: 300 },
    useChips: { type: Boolean },
    dense: { type: Boolean },
  },
  data() {
    return {
      ...icons,
      backendLoading: false,
      isSearchActive: false,
      items: [],
      selectedItems: [],
      initialized: false,
      isFirstFilteredValueChange: true,
      someSelected: false,
      pendingOnValueChange: null,
      lastFetchedSelectionIds: null,
    };
  },
  computed: {
    ...mapState(useFilterbarStore, ['requestFilterState', 'currentFilterState', 'menuOpen', 'calculatedFilterConfig', 'visibleFilters']),
    ...mapState(useProfileStore, ['firstDayOfWeek']),
    ...mapState(useDeviceStore, ['isMobileView']),
    tooltipDirectionTop() {
      const characterCountFittingAbove = 400;
      return this.tooltipContent.length < characterCountFittingAbove;
    },
    fetchedItems() {
      if (this.isSearchActive) {
        return this.items;
      }
      return uniqBy([...this.selectedItems, ...this.items], this.attributes?.itemValue);
    },
    isOpen() {
      return this.menuOpen === this.filter;
    },
    configuration() {
      return this.calculatedFilterConfig.get(this.filter);
    },
    isRemovable() {
      return !this.isMobileView && this.configuration?.removable;
    },
    attributes() {
      if (this.isMobileView) {
        return {
          ...this.configuration?.attr,
          width: 'auto',
        };
      }
      return this.configuration?.attr;
    },
    wrapperAttributes() {
      return this.configuration?.wrapperAttr;
    },
    inputItemTextKey() {
      return this.attributes?.itemText;
    },
    inputItemSecondaryTextKey() {
      return this.attributes?.inputItemSecondaryText;
    },
    inputPrependText() {
      return this.attributes?.prependText;
    },
    component() {
      return this.configuration?.component;
    },
    backendFilteringConfig() {
      return this.configuration?.backendFilteringConfig;
    },
    filteredValue() {
      // requestFilterState is being used for cross-filtering
      // for state to revert when some limiting groups are being deselected
      const filterState = this.isOpen || this.isMobileView ? this.currentFilterState : this.requestFilterState;
      if (filterState[this.filter] === undefined) return [];
      if (isArray(filterState[this.filter]) && this.filter !== 'period') {
        return filterState[this.filter].filter((val) => !!this.itemsObj[val]);
      }
      return filterState[this.filter];
    },
    value() {
      if (this.currentFilterState[this.filter] === undefined) return [];
      return this.currentFilterState[this.filter];
    },
    useSelectionInversion() {
      return !!this.configuration?.useSelectionInversion;
    },
    isInverted() {
      if (this.useSelectionInversion) {
        return this.currentFilterState?.invertedFilters?.includes(this.filter);
      }
      return false;
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
      return listToKeyMap(this.filteredItemsList, this.attributes?.itemValue);
    },
    inputItemsObj() {
      return { ...listToKeyMap(this.selectedItems, this.attributes?.itemValue), ...this.itemsObj };
    },
    filteredItemsList() {
      return this.itemsList.filter(this.isAllowedEntityItem);
    },
    itemsList() {
      const { backendFilteringConfig, configuration } = this;
      if (backendFilteringConfig) {
        return [...this.fetchedItems].slice(0, this.limit);
      }
      if (configuration?.storeItemsGetterPath) {
        return resolvePiniaGetter(configuration.storeItemsGetterPath) ?? [];
      }
      if (configuration?.items) {
        return configuration.items;
      }
      return [];
    },
    itemsTotalCount() {
      if (this.backendFilteringConfig) {
        if (this.filteredItemsList.length < this.limit && !this.isSearchActive) {
          return this.filteredItemsList.length;
        }
        return -1;
      }
      return this.filteredItemsList.length;
    },
    groups() {
      const path = this.configuration?.storeItemGroupsGetterPath;
      if (path) {
        return resolvePiniaGetter(path) ?? [];
      }
      if (this.configuration?.groups) {
        return this.configuration.groups;
      }
      return [];
    },
    tooltipContent() {
      const displayCount = 10;
      if (!Array.isArray(this.value)) return '';
      const values = this.value;
      const displayValues = values.length > displayCount ? values.slice(0, displayCount) : values;
      const namesText = displayValues.map(this.getItemText).join(', ');
      const andMoreText = ` + ${values.length - displayCount} ${this.$t('selected')}.`;
      return `${this.inputPrependText} ${namesText}${values.length > displayCount ? andMoreText : ''}`;
    },
    menuYOffset() {
      if (this.useChips) return '8px';
      return '0px';
    },
    appendIcon() {
      if (!isEqual(this.value, this.configuration?.defaultValue) && !this.isOpen && !this.attributes?.isSingleSelect) return mdiCloseCircle;
      return '';
    },
  },
  watch: {
    isOpen(val, prev) {
      if (this.initialized && this.backendFilteringConfig && val && !prev) {
        this.getItemsBackendFiltered();
      }
      if (!val && prev && !this.isMobileView) {
        this.cancelFilterChange(this.filter);
      }
      if (!val && prev) {
        this.pendingOnValueChange = null;
      }
      if (!prev && val) {
        this.updateFilterValue({ [this.filter]: this.value });
      }
    },
    value(val) {
      const isAnotherMenuOpen = this.menuOpen && !this.isOpen;
      // make sure it is triggered from another filter menu not elsewhere (eg. entering url)
      if (!isEqual(val, this.currentFilterState[this.filter]) && isAnotherMenuOpen) {
        // if another filter modifies this filter's state also update temporary queryState value;
        // another filter save submits this filter's state to requestState
        // and cancelling resets everything to currentState
        this.updateFilterValue({ [this.filter]: this.value });
      }
      if (this.useSelectionInversion) {
        this.invertSelectionIfNeeded();
      }
      // Store callback info instead of executing immediately to prevent race condition
      // where callback reads stale requestFilterState before it's committed
      const { onValueChange } = this.calculatedFilterConfig.get(this.filter);
      if (this.isOpen && onValueChange) {
        this.pendingOnValueChange = {
          callback: onValueChange,
          value: val,
          item: this.itemsObj[val],
        };
      }
    },
    filteredValue(newVal, prevVal) {
      if (isEqual(newVal, prevVal)) return;
      if (!this.visibleFilters().includes(this.filter)) return; // do not update if filter is not visible - race condition
      if (this.backendFilteringConfig && !this.backendLoading) {
        const requestVal = this.requestFilterState[this.filter];
        const hasUnknownIds = Array.isArray(requestVal) && requestVal.some((id) => !this.itemsObj[id]);
        if (hasUnknownIds && !isEqual(this.lastFetchedSelectionIds, requestVal)) {
          this.getItemsBackendFiltered();
          return;
        }
      }
      if (this.isFirstFilteredValueChange) {
        // this logic is needed to sanitize filter value on first load but breaks drilldown otherwise
        if (!this.isOpen && !isEqual(newVal, this.currentFilterState[this.filter])) {
          this.updateFilterValue({ [this.filter]: newVal });
        }
        this.isFirstFilteredValueChange = false;
      } else if (!this.isOpen && newVal.length !== prevVal.length) {
        this.updateFilterValue({ [this.filter]: newVal });
      }
    },
    itemsObj() {
      this.setCurrentFilterItemsMap({ [this.filter]: this.inputItemsObj });
    },
  },
  methods: {
    ...mapActions(useFilterbarStore, [
      'updateFilterValue',
      'removeFilter',
      'setFilterMenuState',
      'applyFilterState',
      'cancelFilterChange',
      'triggerDataRequest',
      'setCurrentFilterItemsMap',
    ]),
    invertSelectionIfNeeded() {
      if (this.itemsTotalCount > 2 && this.value.length > (this.itemsTotalCount / 2) && !this.isSearchActive) {
        const newValue = this.getInvertedSelection();
        this.updateFilterValue({ [this.filter]: newValue });
        this.toggleFilterInversion();
      }
    },
    getInvertedSelection() {
      const itemsObjCopy = { ...this.itemsObj };
      this.value.forEach((id) => {
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
      const queryParams = {};
      if (searchInput) {
        this.items = await this.getFilterItems({ limit: this.limit, searchTerm: searchInput });
      } else {
        queryParams.limit = this.limit;
        const resultQuery = this.getFilterItems({ limit: this.limit });
        let selectionQuery;
        if (this.value.length) {
          selectionQuery = this.getFilterItems({ limit: this.limit, id: this.value });
        } else {
          selectionQuery = [];
        }
        this.backendLoading = true;
        const [result, selection] = await Promise.all([resultQuery, selectionQuery]);
        this.backendLoading = false;
        this.items = result;
        this.selectedItems = selection;
        this.lastFetchedSelectionIds = [...this.value];
        if (this.useSelectionInversion) {
          this.invertSelectionIfNeeded();
        }
      }
    },
    getFilterItems(extraParams) {
      const {
        entity, filterBy, convertValueKey, convertValueFunc, extraRequestParams,
      } = this.backendFilteringConfig;
      let queryParams = {};
      const extraParamsCopy = { ...extraParams };
      const urlSearchParams = new UrlParams();
      const urlPeriod = urlSearchParams.get('period');
      let period;
      const currentPeriod = getCurrentPeriod(urlPeriod, { weekStartsOn: this.firstDayOfWeek });
      if (currentPeriod) {
        period = currentPeriod;
      } else if (Array.isArray(urlPeriod)) {
        period = urlPeriod;
      }
      if (period) {
        const [start, end] = period;
        queryParams.startDate = start;
        queryParams.endDate = end;
      }

      filterBy?.forEach(([filterStateKey, entityKey]) => {
        const stateValue = urlSearchParams.get(filterStateKey);
        if (stateValue !== undefined) {
          if (Array.isArray(stateValue)) {
            queryParams[entityKey] = stateValue;
          } else {
            queryParams[entityKey] = [stateValue];
          }
        }
      });

      if (convertValueKey && extraParamsCopy[convertValueKey]) {
        extraParamsCopy[convertValueKey] = convertValueFunc(extraParams[convertValueKey]);
      }
      queryParams = { ...queryParams, ...extraParamsCopy, ...extraRequestParams };

      return filterItemsApi.getFilterItems(entity, queryParams);
    },
    isEntityItemUnspecified(item) {
      // uncommented, no operator, no location etc.
      return item.id === NOT_SPECIFIED_ID;
    },
    isAllowedEntityItem(item) {
      const { configuration, currentFilterState } = this;
      const isUnspecified = this.isEntityItemUnspecified(item);
      if (isUnspecified) return true;

      const allowedByFilters = ({ configKey, resolveValue }) => {
        if (!configuration[configKey]) return true;
        return configuration[configKey].every(([filterStateKey, entityKey]) => {
          const stateValue = resolveValue(filterStateKey);
          if (stateValue === undefined || stateValue.length === 0) return true;
          const entityValue = item[entityKey];
          const isGlobal = entityKey === 'factoryIds' && Array.isArray(entityValue) && entityValue.length === 0;
          if (isGlobal) return true;

          const isStateValArray = Array.isArray(stateValue);
          const isEntityValArray = Array.isArray(entityValue);
          if (isStateValArray && isEntityValArray) {
            return stateValue.some((val) => entityValue.includes(val));
          }
          if (isStateValArray) return stateValue.includes(entityValue);
          if (isEntityValArray) return entityValue.includes(stateValue);
          return entityValue === stateValue;
        });
      };

      return allowedByFilters({ configKey: 'filterByGetter', resolveValue: (key) => resolvePiniaGetter(key) })
        && allowedByFilters({ configKey: 'filterBy', resolveValue: (key) => currentFilterState[key] });
    },
    async fetchFilterItems() {
      const paths = this.calculatedFilterConfig.get(this.filter).storeDispatchPaths;
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
    getItemText(itemId) {
      if (this.itemsObj?.[itemId] !== undefined && this.inputItemTextKey) {
        return this.itemsObj[itemId][this.inputItemTextKey] || '';
      }
      return itemId;
    },
    onUpdateMenuOpen(val, filter) {
      if (val || this.isMobileView) this.setFilterMenuState({ isOpen: val, filter });
      else this.cancelFilterChange(filter);
    },
    onFilterInput(val, filter) {
      if (this.calculatedFilterConfig.get(filter).updateOnInput) {
        this.updateFilterValue({ [filter]: val });
      }
      if (this.calculatedFilterConfig.get(filter).updateRequestStateOnInput) {
        this.triggerDataRequest();
      }
    },
    onSearchInput(val) {
      this.isSearchActive = val.length > 0;
      if (this.backendFilteringConfig) {
        this.getItemsBackendFiltered(val);
      }
    },
    onFilterChange(value) {
      if (this.filter === 'search') return;
      this.updateFilterValue({ [this.filter]: value });
      if (this.attributes?.isSingleSelect && !this.isMobileView) {
        const config = this.calculatedFilterConfig.get(this.filter);

        this.clearDependentRequiredSingleSelectFilters(this.filter);

        if (config.onValueChangeBeforeApply) {
          try {
            config.onValueChangeBeforeApply({
              value,
              item: this.itemsObj[value],
            });
          } catch (error) {
            console.error(`[FilterBarFilter] onValueChangeBeforeApply failed for ${this.filter}:`, error);
          }
        }

        this.applyFilterState();

        if (config.onValueChange) {
          this.pendingOnValueChange = {
            callback: config.onValueChange,
            value,
            item: this.itemsObj[value],
          };
          this.$nextTick(() => this.executePendingOnValueChange());
        }
      }
    },
    onApply() {
      this.isSearchActive = false;
      if (this.backendFilteringConfig) {
        this.getItemsBackendFiltered().finally(() => {
          this.applyFilterState();
          this.executePendingOnValueChange();
        });
      } else {
        this.applyFilterState();
        this.executePendingOnValueChange();
      }
    },
    executePendingOnValueChange() {
      if (this.pendingOnValueChange) {
        const { callback, value, item } = this.pendingOnValueChange;
        callback({ value, item });
        this.pendingOnValueChange = null;
      }
    },
    clearDependentRequiredSingleSelectFilters(changedFilter) {
      const filtersToClear = [];

      for (const [filterKey, filterConfig] of this.calculatedFilterConfig) {
        if (filterKey === changedFilter) continue;

        const filterBy = filterConfig.backendFilteringConfig?.filterBy;
        if (!filterBy) continue;

        const dependsOnChangedFilter = filterBy.some(([dependencyFilter]) => dependencyFilter === changedFilter);
        if (!dependsOnChangedFilter) continue;

        const isRequired = filterConfig.attr?.required === true;
        const isSingleSelect = filterConfig.attr?.isSingleSelect === true;

        if (isRequired && isSingleSelect) {
          filtersToClear.push(filterKey);
        }
      }

      if (filtersToClear.length > 0) {
        const updates = {};
        filtersToClear.forEach((filterKey) => {
          updates[filterKey] = [];
        });
        this.updateFilterValue(updates);
      }
    },
    onToggleSelectAll(value) {
      if (this.useSelectionInversion) {
        if (this.isSearchActive) {
          this.updateFilterValue({ [this.filter]: value });
          this.invertSelectionIfNeeded();
        } else {
          this.toggleFilterInversion();
          this.updateFilterValue({ [this.filter]: [] });
        }
      } else {
        this.updateFilterValue({ [this.filter]: value });
      }
    },
    toggleFilterInversion() {
      if (this.isInverted) {
        const index = this.currentFilterState.invertedFilters.indexOf(this.filter);
        if (index > -1) {
          const invertedFilters = [...this.currentFilterState.invertedFilters];
          invertedFilters.splice(index, 1);
          this.updateFilterValue({
            invertedFilters: Array.from(new Set(invertedFilters)),
          });
        }
      } else {
        this.updateFilterValue({
          invertedFilters: Array.from(new Set([
            ...this.currentFilterState.invertedFilters,
            this.filter,
          ])),
        });
      }
    },
    onEmptyFilter() {
      this.updateFilterValue({ [this.filter]: this.configuration?.defaultValue || [] });
      if (!this.isMobileView) this.triggerDataRequest();
    },
  },
};
</script>

<style scoped>
.chip-container {
  max-width: var(--chip-max-width);
}
</style>
