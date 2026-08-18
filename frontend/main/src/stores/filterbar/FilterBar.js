import { RANDOM_BIG_NUMBER } from '@/constants/randomNumber';
import UrlParams from '@/helpers/UrlParams';

export default class FilterBar {
  constructor(opts) {
    this.filtersState = new Map();
    this.isMobileFilterBar = opts.isMobileFilterBar;
    this.filterConfiguration = new Map();
  }

  setFilterConfiguration(filterConfiguration) {
    if (filterConfiguration) this.filterConfiguration = filterConfiguration;
  }

  setFilterDefaultConfiguration(defaultFilters) {
    if (defaultFilters) {
      this.defaultFilters = defaultFilters;
    }
  }

  calculateFilterState({
    filterConfiguration, defaultFilters, disabledFilters,
  }) {
    this.setFilterDefaultConfiguration(defaultFilters);
    this.setFiltersFromQueryParams(); // if url query parameters match configuration set filters accordingly
    this.setFilterConfiguration(filterConfiguration);
    this.setDefaultFilters(); // if no filters are set from url fall back to defaults
    this.setNonRemovableFilters(); // if non-removable filters are missing, add those as well
    this.forceRequiredToDefaultWhereApplicable(); // if required is set and filter is empty, set to default
    this.cleanupFilterState(disabledFilters); // remove filters not existing in url
    this.urlSearchParams.updateQueryUrl(); // set url search query parameters
    // create new thing here which takes old url values to pass on if applicable!
    return this.filtersState;
  }

  setFiltersFromQueryParams() {
    this.urlSearchParams = new UrlParams();
    Object.entries(this.urlSearchParams.getParams()).forEach(([filter, val]) => {
      this.setFilterStateVal(filter, val);
    });
  }

  getDefaultValue(filter) {
    if (this.defaultFilters?.[filter]) {
      return this.defaultFilters[filter];
    }
    const filterConfig = this.filterConfiguration.get(filter);
    return filterConfig?.defaultValue;
  }

  setDefaultFilters() {
    if (!this.filtersState.size && this.defaultFilters) {
      Object.keys(this.defaultFilters).forEach((filter) => {
        this.setFilterStateVal(filter, this.getDefaultValue(filter));
      });
    }
  }

  setNonRemovableFilters() {
    this.filterConfiguration.forEach((val, filter) => {
      if (!val.canBeHidden && (!val.removable || this.isMobileFilterBar) && (!this.filtersState.has(filter) || !this.urlSearchParams.get(filter))) {
        this.setFilterStateVal(filter, this.getDefaultValue(filter));
      }
    });
  }

  forceRequiredToDefaultWhereApplicable() {
    this.filterConfiguration.forEach((val, filter) => {
      const filterValue = this.filtersState.get(filter);
      const isEmpty
        = filterValue === undefined
          || filterValue === null
          || (typeof filterValue === 'string' && filterValue.length === 0)
          || (Array.isArray(filterValue) && filterValue.length === 0);

      if (val.required && isEmpty) {
        this.setFilterStateVal(filter, this.getDefaultValue(filter));
      }
    });
  }

  setFilterStateVal(key, val) {
    if (key) {
      this.urlSearchParams.set(key, val);
      this.filtersState.set(key, val);
    }
  }

  cleanupFilterState(disabledFilters = []) {
    const disabledSet = new Set(disabledFilters);
    this.filtersState.forEach((val, filter) => {
      const filterNotInQuery = this.urlSearchParams.get(filter) === undefined;
      const filterDisabled = disabledSet.has(filter);
      if (filterNotInQuery || filterDisabled) {
        this.removeFilter(filter);
      }
    });
  }

  removeFilter(key) {
    if (!this.filterConfiguration.has(key) || this.filterConfiguration.get(key)?.removable || this.filterConfiguration.get(key)?.canBeHidden) {
      const relatedGroupFilterKey = this.filterConfiguration.get(key)?.relatedGroupFilter;
      if (relatedGroupFilterKey && this.urlSearchParams.get(relatedGroupFilterKey)) {
        const relatedGroupFilter = this.filterConfiguration.get(relatedGroupFilterKey);
        if (relatedGroupFilter?.hidden) {
          this.urlSearchParams.delete(relatedGroupFilterKey);
        }
      }
      this.urlSearchParams.delete(key);
      this.filtersState.delete(key);
    }
  }

  updateFilterValue(updates) {
    Object.entries(updates).forEach(([filter, value]) => {
      this.setFilterStateVal(filter, value);
    });
    this.urlSearchParams.updateQueryUrl();
  }

  updateFiltersEnabledState(filter) {
    if (!this.filtersState.has(filter)) {
      this.setFilterStateVal(filter, this.getDefaultValue(filter));
    }
    this.filtersState.forEach((value) => {
      if (filter === value) {
        this.removeFilter(filter);
      }
    });
    this.urlSearchParams.updateQueryUrl();
  }

  removeSingleFilter(filter) {
    this.removeFilter(filter);
    this.urlSearchParams.updateQueryUrl();
  }

  getOrderedFilters() {
    const ret = Array.from(this.filtersState.keys()).sort((a, b) => {
      const aOrder = this.filterConfiguration.get(a)?.order || RANDOM_BIG_NUMBER;
      const bOrder = this.filterConfiguration.get(b)?.order || RANDOM_BIG_NUMBER;
      return aOrder - bOrder;
    });
    return ret;
  }
}
