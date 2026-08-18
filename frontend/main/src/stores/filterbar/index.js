import { defineStore } from 'pinia';
import { cloneDeep } from 'lodash';

import FB from '@/stores/filterbar/FilterBar';
import fromEntries from '@/helpers/object/fromEntries';
import configType from '@/stores/reportsConfig/constants/configType';
import UrlParams from '@/helpers/UrlParams';
import useDeviceStore from '@/stores/device';
import useCommentStore from '@/stores/comment';
import usePerfCommentStore from '@/stores/perfComment';
import useScrapReasonStore from '@/stores/scrapReason';
import useProductStore from '@/stores/product';
import useFactoryStore from '@/stores/factory';
import useStationStore from '@/stores/station';
import useChecklistTemplateStore from '@/stores/checklistTemplate';
import useUserStore from '@/stores/user';
import usePositionStore from '@/stores/position';
import useOperatorStore from '@/stores/operator';
import useReportsConfigStore from '@/stores/reportsConfig';
import useShiftTemplateStore from '@/stores/shiftTemplate';

const storeMap = {
  checklistTemplate: () => useChecklistTemplateStore(),
  comment: () => useCommentStore(),
  factory: () => useFactoryStore(),
  filterbar: () => useFilterbarStore(),
  operator: () => useOperatorStore(),
  perfComment: () => usePerfCommentStore(),
  position: () => usePositionStore(),
  product: () => useProductStore(),
  reportsConfig: () => useReportsConfigStore(),
  scrapReason: () => useScrapReasonStore(),
  shiftTemplate: () => useShiftTemplateStore(),
  station: () => useStationStore(),
  user: () => useUserStore(),
};

export function resolvePiniaGetter(getterPath) {
  if (!getterPath) return undefined;
  const [moduleName, getterName] = getterPath.split('/');
  const storeGetter = storeMap[moduleName];
  if (!storeGetter) return undefined;
  return storeGetter()[getterName];
}

export function resolvePiniaAction(actionPath, payload) {
  if (!actionPath) return Promise.resolve(undefined);
  const [moduleName, actionName] = actionPath.split('/');
  const storeGetter = storeMap[moduleName];
  if (!storeGetter) return Promise.resolve(undefined);
  const action = storeGetter()[actionName];
  if (!action) return Promise.resolve(undefined);
  return Promise.resolve(action(payload));
}

export function isVisible({ state }, filter, isDialog = false) {
  if (!state.calculatedFilterConfig.has(filter)) return false;
  const configuration = state.calculatedFilterConfig.get(filter);
  const deviceStore = useDeviceStore();
  if (!isDialog && deviceStore.isMobileView) return configuration.isPersistent;
  const items = resolvePiniaGetter(configuration.storeItemsGetterPath) ?? [];
  if (filter === 'factoryId') {
    return items.length > 1;
  }
  return !configuration.hidden;
}

let FilterBar = null;

const useFilterbarStore = defineStore('filterbar', {
  state: () => ({
    currentFilters: [],
    currentFilterState: {},
    requestFilterState: {},
    calculatedFilterConfig: new Map(),
    filterConfigAsList: [],
    currentFilterItemsMap: {},
    menuOpen: false,
  }),
  actions: {
    setCurrentFilterState(payload) {
      this.currentFilterState = { ...this.currentFilterState, ...payload };
    },
    removeFromCurrentFilterState(key) {
      const newState = { ...this.currentFilterState };
      delete newState[key];
      this.currentFilterState = newState;
    },
    resetCurrentFilterState() {
      this.currentFilterState = { ...this.requestFilterState };
    },
    resetRequestFilterState() {
      this.requestFilterState = {};
    },
    setCurrentFilterItemsMap(payload) {
      this.currentFilterItemsMap = { ...this.currentFilterItemsMap, ...payload };
    },
    initialize({
      filterConfiguration, defaultFilters, disabledFilters, isMobileFilterBar, persistentFilters = [],
    }) {
      const config = cloneDeep(filterConfiguration);
      persistentFilters.forEach((filter) => {
        if (config.has(filter)) {
          const currentValue = this.requestFilterState[filter];
          if (currentValue !== undefined) {
            config.get(filter).defaultValue = currentValue;
          }
        }
      });
      FilterBar = new FB({ isMobileFilterBar });
      this.setReactiveFilterState({
        filterConfiguration: config, defaultFilters, disabledFilters,
      });
      this.triggerDataRequest(true);
    },
    updateFilterValue(updates) {
      this.setCurrentFilterState(updates);
    },
    updateFilterSelection(filter) {
      setTimeout(() => {
        this.menuOpen = filter;
      }, 300);
      FilterBar.updateFiltersEnabledState(filter);
      this.triggerDataRequest();
    },
    removeFilter(filter) {
      FilterBar.removeSingleFilter(filter);
      this.removeFromCurrentFilterState(filter);
    },
    setReactiveFilterState({
      filterConfiguration, defaultFilters, disabledFilters,
    }) {
      const filterStateMap = FilterBar.calculateFilterState({
        filterConfiguration, defaultFilters, disabledFilters,
      });
      this.currentFilters = FilterBar.getOrderedFilters();
      this.requestFilterState = { ...fromEntries(filterStateMap) };
      this.currentFilterState = { ...this.requestFilterState };
      this.filterConfigAsList = Array.from(FilterBar.filterConfiguration, ([k, v]) => ({ ...v, name: k }));
      this.calculatedFilterConfig = FilterBar.filterConfiguration;
    },
    setFilterMenuState({ isOpen, filter }) {
      const newState = isOpen ? filter : false;
      this.menuOpen = newState;
    },
    applyFilterState() {
      this.menuOpen = false;
      this.triggerDataRequest();
    },
    cancelFilterChange() {
      this.menuOpen = false;
      this.resetCurrentFilterState();
    },
    triggerDataRequest() {
      FilterBar.updateFilterValue(this.currentFilterState);
    },
  },
  getters: {
    allFiltersAsList(state) {
      return state.filterConfigAsList.filter((f) => isVisible({ state }, f.name));
    },
    notAppliedFilters(state) {
      return this.allFiltersAsList.filter((filter) => !state.currentFilters.includes(filter.name) && filter.removable);
    },
    visibleFilters: (state) => (isDialog = false) => [...state.currentFilters.filter((f) => isVisible({ state }, f, isDialog))],
    getUrlWithPassableFilterValues: (state) => (url, config) => {
      const urlParams = new UrlParams(url);
      config.forEach((configuration, filter) => {
        const isValuePassing = configuration.isValuePassing === undefined || configuration.isValuePassing;
        if (state.requestFilterState[filter] !== undefined && isValuePassing) {
          const prevValue = state.requestFilterState[filter];
          urlParams.set(filter, prevValue);
        }
      });
      if (urlParams.get('type') === configType.OEE) {
        const storageValue = localStorage.getItem('reportingOeeChartType');
        if (storageValue) {
          const parsedValue = JSON.parse(storageValue);
          urlParams.set('chartType', parsedValue);
        }
      }
      return urlParams.asHashString();
    },
  },
});

export default useFilterbarStore;
