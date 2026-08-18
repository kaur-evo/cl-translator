import FB from './FilterBar';

describe('FilterBar', () => {
  let originalLocation;
  beforeEach(() => {
    originalLocation = window.location;
  });
  afterEach(() => {
    window.location = originalLocation;
  });
  it('should only add filters defined in defaults', () => {
    const defaultFilters = { period: '' };
    const filterConfiguration = new Map();
    filterConfiguration.set('period', {
      defaultValue: 'thisyear',
      removable: true,
    });
    filterConfiguration.set('bookmarkId', {
      defaultValue: 'DOWNTIME',
      removable: true,
    });
    const FilterBar = new FB({ isMobileFilterBar: false });
    expect(FilterBar.calculateFilterState({
      filterConfiguration,
      defaultFilters,
    }))
      .toStrictEqual(new Map([['period', 'thisyear']]));
  });
  it('should add non removable filters even when not among defaults', () => {
    window.location = new URL('https://dev.evocon.com/#/newreports?period=thisyear');

    const defaultFilters = { period: '' };
    const filterConfiguration = new Map();
    filterConfiguration.set('period', {
      removable: false,
      defaultValue: 'thisyear',
    });
    filterConfiguration.set('bookmarkId', {
      removable: false,
      defaultValue: 'DOWNTIME',
    });
    const FilterBar = new FB({ isMobileFilterBar: false });
    expect(FilterBar.calculateFilterState({
      filterConfiguration,
      defaultFilters,
    }))
      .toStrictEqual(new Map([['period', 'thisyear'], ['bookmarkId', 'DOWNTIME']]));
  });
  it('should add filters defined in url query params with correct value', () => {
    window.location = new URL('https://dev.evocon.com/#/newreports?period=thisweek');
    const defaultFilters = {};
    const filterConfiguration = new Map();
    filterConfiguration.set('period', {
      removable: true,
      defaultValue: 'thisyear',
    });
    filterConfiguration.set('bookmarkId', {
      removable: true,
      defaultValue: 'DOWNTIME',
    });
    const FilterBar = new FB({ isMobileFilterBar: false });
    expect(FilterBar.calculateFilterState({
      filterConfiguration,
      defaultFilters,
    })).toStrictEqual(new Map([['period', 'thisweek']]));
  });
  it('should update url query params with non removable filter state', () => {
    window.location = new URL('https://dev.evocon.com/#/newreports?period=thisweek');
    const defaultFilters = {};
    const filterConfiguration = new Map();
    filterConfiguration.set('period', {
      removable: true,
      defaultValue: 'thisyear',
    });
    filterConfiguration.set('bookmarkId', {
      removable: false,
      defaultValue: 'DOWNTIME',
    });
    const FilterBar = new FB({ isMobileFilterBar: false });
    expect(FilterBar.calculateFilterState({
      filterConfiguration,
      defaultFilters,
    })).toStrictEqual(new Map([['period', 'thisweek'], ['bookmarkId', 'DOWNTIME']]));
  });
  it('should remove removable defaults missing in url query params', () => {
    window.location = new URL('https://dev.evocon.com/#/newreports?period=thisweek');
    const defaultFilters = { period: '', bookmarkId: 'DOWNTIME' };
    const filterConfiguration = new Map();
    filterConfiguration.set('period', {
      removable: true,
      defaultValue: 'thisyear',
    });
    filterConfiguration.set('bookmarkId', {
      removable: true,
      defaultValue: 'DOWNTIME',
    });
    const FilterBar = new FB({ isMobileFilterBar: false });
    expect(FilterBar.calculateFilterState(
      {
        filterConfiguration,
        defaultFilters,
      },
    )).toStrictEqual(new Map([['period', 'thisweek']]));
  });
  it('should update url with non non-removable filter state', () => {
    window.location = new URL('https://dev.evocon.com/#/newreports?period=thisweek');
    const defaultFilters = { period: '', bookmarkId: 'DOWNTIME' };
    const filterConfiguration = new Map();
    filterConfiguration.set('period', {
      removable: true,
      defaultValue: 'thisyear',
    });
    filterConfiguration.set('bookmarkId', {
      removable: false,
      defaultValue: 'DOWNTIME',
    });
    const FilterBar = new FB({ isMobileFilterBar: false });
    FilterBar.calculateFilterState({
      filterConfiguration,
      defaultFilters,
    });
    expect(window.location.hash).toBe('#/newreports?period=thisweek&bookmarkId=DOWNTIME');
  });
  it('should remove filter and update url accordingly', () => {
    window.location = new URL('https://dev.evocon.com/#/newreports?period=thisweek&bookmarkId=DOWNTIME');
    const defaultFilters = { period: '', bookmarkId: 'DOWNTIME' };
    const filterConfiguration = new Map();
    filterConfiguration.set('period', {
      removable: true,
      defaultValue: 'thisyear',
    });
    filterConfiguration.set('bookmarkId', {
      removable: true,
      defaultValue: 'DOWNTIME',
    });
    const FilterBar = new FB({ isMobileFilterBar: false });
    const filterState = FilterBar.calculateFilterState({
      filterConfiguration,
      defaultFilters,
    });
    FilterBar.removeSingleFilter('period');
    FilterBar.removeSingleFilter('bookmarkId');

    expect(filterState).toStrictEqual(new Map());
    expect(window.location.hash).toBe('#/newreports');
  });

  it('should update filter state and update url accordingly', () => {
    window.location = new URL('https://dev.evocon.com/#/newreports?period=thisweek&bookmarkId=DOWNTIME');
    const defaultFilters = { period: '', bookmarkId: 'DOWNTIME' };
    const filterConfiguration = new Map();
    filterConfiguration.set('period', {
      removable: true,
      defaultValue: 'thisyear',
    });
    filterConfiguration.set('bookmarkId', {
      removable: true,
      defaultValue: 'DOWNTIME',
    });
    const FilterBar = new FB({ isMobileFilterBar: false });
    const filterState = FilterBar.calculateFilterState({
      filterConfiguration,
      defaultFilters,
    });
    FilterBar.updateFilterValue({ period: 'lastweek', bookmarkId: 'OEE' });

    expect(filterState).toStrictEqual(new Map([['period', 'lastweek'], ['bookmarkId', 'OEE']]));
    expect(window.location.hash).toBe('#/newreports?period=lastweek&bookmarkId=OEE');
  });

  test('that getOrderedFilters returns filters in correct order', () => {
    window.location = new URL('https://dev.evocon.com/#/newreports?period=thisweek&bookmarkId=DOWNTIME');
    const filterConfiguration = new Map([
      ['period', { defaultValue: 'thisyear', removable: false, order: 1 }],
      ['bookmarkId', { defaultValue: 'DOWNTIME', removable: true }],
      ['stationId', { defaultValue: [], removable: false, order: 2 }],
    ]);
    const FilterBar = new FB({ isMobileFilterBar: false });
    FilterBar.calculateFilterState({ filterConfiguration });
    expect(FilterBar.getOrderedFilters()).toStrictEqual(['period', 'stationId', 'bookmarkId']);
  });

  test('should set required filters to default when value is empty', () => {
    window.location = new URL('https://dev.evocon.com/#/newreports?period=');
    const filterConfiguration = new Map([
      ['period', { defaultValue: 'thisyear', removable: false, required: true }],
      ['bookmarkId', { defaultValue: 'DOWNTIME', removable: false }],
    ]);
    const defaultFilters = {};
    const FilterBar = new FB({ isMobileFilterBar: false });
    const filterState = FilterBar.calculateFilterState({
      filterConfiguration,
      defaultFilters,
    });
    expect(filterState).toStrictEqual(new Map([['period', 'thisyear'], ['bookmarkId', 'DOWNTIME']]));
    expect(window.location.hash).toBe('#/newreports?period=thisyear&bookmarkId=DOWNTIME');
  });

  test('should set required filters to default when value is empty array', () => {
    window.location = new URL('https://dev.evocon.com/#/newreports?period[]=[]');
    const filterConfiguration = new Map([
      ['period', { defaultValue: ['thisyear'], removable: false, required: true }],
      ['bookmarkId', { defaultValue: 'DOWNTIME', removable: false }],
    ]);
    const defaultFilters = {};
    const FilterBar = new FB({ isMobileFilterBar: false });
    const filterState = FilterBar.calculateFilterState({
      filterConfiguration,
      defaultFilters,
    });
    expect(filterState).toStrictEqual(new Map([['period', ['thisyear']], ['bookmarkId', 'DOWNTIME']]));
    expect(window.location.hash).toBe('#/newreports?period%5B%5D=%5B%22thisyear%22%5D&bookmarkId=DOWNTIME');
  });

  test('cleanupFilterState removes disabled filters', () => {
    window.location = new URL('https://dev.evocon.com/#/newreports?period=thisweek&bookmarkId=DOWNTIME');
    const filterConfiguration = new Map([
      ['period', { removable: true, defaultValue: 'thisyear' }],
      ['bookmarkId', { removable: true, defaultValue: 'DOWNTIME' }],
    ]);
    const FilterBar = new FB({ isMobileFilterBar: false });
    FilterBar.calculateFilterState({ filterConfiguration, defaultFilters: {} });
    // bookmarkId is in url so won't be cleaned; period is in url too but we pass it as disabled
    FilterBar.cleanupFilterState(['period']);
    expect(FilterBar.filtersState.has('period')).toBe(false);
    expect(FilterBar.filtersState.has('bookmarkId')).toBe(true);
  });

  test('removeFilter handles relatedGroupFilter that is hidden', () => {
    window.location = new URL('https://dev.evocon.com/#/newreports?groupFilter=someGroup&child=childVal');
    const filterConfiguration = new Map([
      ['child', { removable: true, defaultValue: 'childVal', relatedGroupFilter: 'groupFilter' }],
      ['groupFilter', { removable: true, defaultValue: 'someGroup', hidden: true }],
    ]);
    const FilterBar = new FB({ isMobileFilterBar: false });
    FilterBar.calculateFilterState({ filterConfiguration, defaultFilters: {} });
    // Both should be in state from url
    expect(FilterBar.filtersState.has('child')).toBe(true);
    // Removing 'child' should also delete groupFilter from url because it's hidden
    FilterBar.removeFilter('child');
    expect(FilterBar.filtersState.has('child')).toBe(false);
    expect(FilterBar.urlSearchParams.get('groupFilter')).toBeUndefined();
  });

  test('updateFiltersEnabledState removes filter when its value equals the filter key', () => {
    window.location = new URL('https://dev.evocon.com/#/newreports?period=period');
    const filterConfiguration = new Map([
      ['period', { removable: true, defaultValue: 'period' }],
    ]);
    const FilterBar = new FB({ isMobileFilterBar: false });
    FilterBar.calculateFilterState({ filterConfiguration, defaultFilters: {} });
    expect(FilterBar.filtersState.has('period')).toBe(true);
    // Calling updateFiltersEnabledState with 'period' when current value IS 'period' should remove it
    FilterBar.updateFiltersEnabledState('period');
    expect(FilterBar.filtersState.has('period')).toBe(false);
  });

  test('removeFilter does nothing when filter is in configuration and is not removable and not canBeHidden', () => {
    window.location = new URL('https://dev.evocon.com/#/newreports?period=thisweek');
    const filterConfiguration = new Map([
      // removable: false and no canBeHidden — guard condition is false, body not entered
      ['period', { removable: false, defaultValue: 'thisyear' }],
    ]);
    const FilterBar = new FB({ isMobileFilterBar: false });
    FilterBar.calculateFilterState({ filterConfiguration, defaultFilters: {} });
    expect(FilterBar.filtersState.has('period')).toBe(true);
    FilterBar.removeFilter('period');
    // Filter should still be present because guard condition prevented removal
    expect(FilterBar.filtersState.has('period')).toBe(true);
  });

  test('updateFiltersEnabledState sets default value when filter is not in filtersState', () => {
    window.location = new URL('https://dev.evocon.com/#/newreports');
    const filterConfiguration = new Map([
      ['period', { removable: true, defaultValue: 'thisyear' }],
    ]);
    const FilterBar = new FB({ isMobileFilterBar: false });
    FilterBar.calculateFilterState({ filterConfiguration, defaultFilters: {} });
    // period is NOT in filtersState (nothing in URL, no non-removable)
    expect(FilterBar.filtersState.has('period')).toBe(false);
    FilterBar.updateFiltersEnabledState('period');
    expect(FilterBar.filtersState.get('period')).toBe('thisyear');
  });
});
