import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import FilterBar from './index.vue';

import { useBookmarkStore, useDeviceStore, useFilterbarStore, useGenericDialogStore } from '@/stores';

const route = {
  $route: {
    query: vi.fn(),
  },
};

const propsDefault = {
  filterConfiguration: new Map(),
  defaultFilters: {},
};

const mountWithConfig = ({
  visibleFilters = () => ['search', 'factoryId', 'stationId'],
  notAppliedFilters = [{ label: 'Status' }, { label: 'Type' }],
  isMobileView = false,
  currentBookmark = undefined,
  isCurrentBookmarkModified = () => false,
  requestFilterState = {},
  calculatedFilterConfig = new Map(),
  props = {},
} = {}) => {
  const pinia = createTestingPinia({
    createSpy: vi.fn,
    stubActions: true,
    initialState: {
      filterbar: {
        currentFilters: [],
        requestFilterState,
        currentFilterState: {},
        menuOpen: {},
        calculatedFilterConfig,
        currentFilterItemsMap: {},
      },
    },
  });

  const filterbarStore = useFilterbarStore(pinia);
  filterbarStore.visibleFilters = visibleFilters;
  filterbarStore.notAppliedFilters = notAppliedFilters;

  const deviceStore = useDeviceStore(pinia);
  deviceStore.isMobileView = isMobileView;

  const bookmarkStore = useBookmarkStore(pinia);
  bookmarkStore.currentBookmark = currentBookmark;
  bookmarkStore.isCurrentBookmarkModified = isCurrentBookmarkModified;

  const genericDialogStore = useGenericDialogStore(pinia);

  const wrapper = shallowMount(FilterBar, {
    global: {
      plugins: [pinia],
      mocks: { ...route },
    },
    props: { ...propsDefault, ...props },
  });
  return { wrapper, pinia, filterbarStore, genericDialogStore };
};

describe('FilterBar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders', () => {
    const { wrapper } = mountWithConfig();

    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly', () => {
    const { wrapper } = mountWithConfig();

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly in mobile view', () => {
    const { wrapper } = mountWithConfig({ isMobileView: true });

    expect(wrapper.element).toMatchSnapshot();
  });

  describe('iconColor', () => {
    it('returns "primary" if at least one filter is applied', () => {
      const { wrapper } = mountWithConfig({
        visibleFilters: () => ['stationId', 'factoryId'],
        requestFilterState: { stationId: [1, 2], factoryId: [] },
      });

      expect(wrapper.vm.iconColor).toBe('primary');
    });

    it('returns "" if no filter is applied', () => {
      const { wrapper } = mountWithConfig({
        visibleFilters: () => ['stationId', 'factoryId'],
        requestFilterState: { stationId: [], factoryId: [] },
      });

      expect(wrapper.vm.iconColor).toBe('');
    });

    it('returns "" if filter is applied, but it is not visible in dialog', () => {
      const { wrapper } = mountWithConfig({
        visibleFilters: () => ['stationId', 'factoryId'],
        requestFilterState: { stationId: [], factoryId: [], period: 'thisweek' },
      });

      expect(wrapper.vm.iconColor).toBe('');
    });
  });

  describe('hasFilterBtn', () => {
    it('returns false if no filters are configured', () => {
      const { wrapper } = mountWithConfig();

      expect(wrapper.vm.hasFilterBtn).toBeFalsy();
    });

    it('returns false if there are no removable filters in config', () => {
      const { wrapper } = mountWithConfig({
        calculatedFilterConfig: new Map([
          ['status', { type: 'select', removable: false }],
          ['type', { type: 'select', removable: false }],
        ]),
      });

      expect(wrapper.vm.hasFilterBtn).toBeFalsy();
    });

    it('returns true if there is at least one removable filter in config', () => {
      const { wrapper } = mountWithConfig({
        calculatedFilterConfig: new Map([
          ['status', { type: 'select', removable: true }],
          ['type', { type: 'select', removable: false }],
        ]),
      });

      expect(wrapper.vm.hasFilterBtn).toBeTruthy();
    });
  });

  describe('hasFilterApplied', () => {
    it('returns true if at least one filter is removable', () => {
      const { wrapper } = mountWithConfig({
        visibleFilters: () => ['stationId', 'factoryId'],
        requestFilterState: { stationId: [], factoryId: [] },
        calculatedFilterConfig: new Map([
          ['stationId', { type: 'select', defaultValue: [], removable: true }],
          ['factoryId', { type: 'select', defaultValue: [], removable: false }],
        ]),
      });

      expect(wrapper.vm.hasFilterApplied).toBeTruthy();
    });

    it('returns true if at least one filter is applied', () => {
      const { wrapper } = mountWithConfig({
        visibleFilters: () => ['stationId', 'factoryId'],
        requestFilterState: { stationId: [1, 2], factoryId: [] },
      });

      expect(wrapper.vm.hasFilterApplied).toBeTruthy();
    });

    it('returns true if no filters have been applied', () => {
      const { wrapper } = mountWithConfig({
        visibleFilters: () => ['stationId', 'factoryId'],
        requestFilterState: { stationId: [], factoryId: [] },
      });

      expect(wrapper.vm.hasFilterApplied).toBeFalsy();
    });

    it('returns true if filter has default value and it is not equal to filter value', () => {
      const { wrapper } = mountWithConfig({
        visibleFilters: () => ['stationId', 'factoryId'],
        requestFilterState: { stationId: [1, 2], factoryId: [] },
        calculatedFilterConfig: new Map([
          ['stationId', { type: 'select', defaultValue: [1] }],
          ['factoryId', { type: 'select', defaultValue: [] }],
        ]),
      });

      expect(wrapper.vm.hasFilterApplied).toBeTruthy();
    });

    it('returns false if filter has default value and it is equal to filter value', () => {
      const { wrapper } = mountWithConfig({
        visibleFilters: () => ['stationId', 'factoryId'],
        requestFilterState: { stationId: [1], factoryId: [] },
        calculatedFilterConfig: new Map([
          ['stationId', { type: 'select', defaultValue: [1] }],
          ['factoryId', { type: 'select', defaultValue: [] }],
        ]),
      });

      expect(wrapper.vm.hasFilterApplied).toBeFalsy();
    });
  });

  describe('isResetBtnDisabled', () => {
    it('returns true if currentBookmark exists and isCurrentBookmarkModified is false', () => {
      const { wrapper } = mountWithConfig({
        currentBookmark: { url: 'testurl' },
        isCurrentBookmarkModified: () => false,
      });

      expect(wrapper.vm.isResetBtnDisabled).toBeTruthy();
    });

    it('returns false if currentBookmark exists and isCurrentBookmarkModified is true', () => {
      const { wrapper } = mountWithConfig({
        currentBookmark: { url: 'testurl' },
        isCurrentBookmarkModified: () => true,
      });

      expect(wrapper.vm.isResetBtnDisabled).toBeFalsy();
    });

    it('returns false if currentBookmark does not exist and filters are applied', () => {
      const { wrapper } = mountWithConfig({
        currentBookmark: undefined,
        visibleFilters: () => ['stationId', 'factoryId'],
        requestFilterState: { stationId: [1, 2], factoryId: [] },
      });

      expect(wrapper.vm.isResetBtnDisabled).toBeFalsy();
    });

    it('returns true if currentBookmark does not exist and filters are not applied', () => {
      const { wrapper } = mountWithConfig({
        currentBookmark: undefined,
        visibleFilters: () => ['stationId', 'factoryId'],
        requestFilterState: { stationId: [], factoryId: [] },
      });

      expect(wrapper.vm.isResetBtnDisabled).toBeTruthy();
    });
  });

  test('that openFiltersDialog calls openDialog with correct params', () => {
    const { wrapper, genericDialogStore } = mountWithConfig({
      props: { filterItemLimit: 300, filterConfiguration: new Map([['Status', { type: 'select' }]]) },
    });

    wrapper.vm.openFiltersDialog();

    expect(genericDialogStore.openDialog).toHaveBeenCalledWith({
      component: expect.any(Object),
      data: {
        filterConfiguration: new Map([['Status', { type: 'select' }]]),
        limit: 300,
      },
    });
  });

  test('onResetClick if currentBookmark exists', () => {
    const { wrapper } = mountWithConfig({
      currentBookmark: { url: 'testurl' },
    });

    wrapper.vm.onResetClick();

    expect(window.location.hash).toBe('#testurl');
    expect(wrapper.emitted('on-reset-clicked').length).toBe(1);
  });

  test('onResetClick if currentBookmark does not exist', () => {
    const { wrapper, filterbarStore } = mountWithConfig({
      currentBookmark: undefined,
      visibleFilters: () => ['stationId', 'search'],
      requestFilterState: { stationId: [1, 2], search: 'asdasd' },
      calculatedFilterConfig: new Map([
        ['search', { type: 'text', defaultValue: '' }],
        ['stationId', { type: 'select', defaultValue: [] }],
      ]),
      props: {
        filterConfiguration: new Map([['stationId', { defaultValue: [] }], ['search', { defaultValue: '' }]]),
      },
    });

    wrapper.vm.onResetClick();

    expect(filterbarStore.updateFilterValue).toHaveBeenCalledTimes(2);
    expect(filterbarStore.updateFilterValue).toHaveBeenCalledWith({ stationId: [] });
    expect(filterbarStore.updateFilterValue).toHaveBeenCalledWith({ search: '' });
    expect(filterbarStore.triggerDataRequest).toHaveBeenCalledTimes(1);
    expect(wrapper.emitted('on-reset-clicked').length).toBe(1);
  });

  test('onResetClick if currentBookmark does not exist and filters are removable', () => {
    const { wrapper, filterbarStore } = mountWithConfig({
      currentBookmark: undefined,
      visibleFilters: () => ['stationId', 'factoryId'],
      requestFilterState: { stationId: [1, 2], factoryId: [] },
      calculatedFilterConfig: new Map([
        ['stationId', { type: 'select', defaultValue: [], removable: true }],
        ['factoryId', { type: 'select', defaultValue: [], removable: true }],
      ]),
      props: {
        filterConfiguration: new Map([['stationId', { defaultValue: [] }], ['factoryId', { defaultValue: [] }]]),
      },
    });

    wrapper.vm.onResetClick();

    expect(filterbarStore.removeFilter).toHaveBeenCalledTimes(2);
    expect(filterbarStore.removeFilter).toHaveBeenCalledWith('stationId');
    expect(filterbarStore.removeFilter).toHaveBeenCalledWith('factoryId');
    expect(filterbarStore.triggerDataRequest).toHaveBeenCalledTimes(1);
    expect(wrapper.emitted('on-reset-clicked').length).toBe(1);
  });

  test('that empty removable filters are removed when isMobileView changes from true to false', async () => {
    const { wrapper, filterbarStore } = mountWithConfig({
      isMobileView: true,
      visibleFilters: () => ['stationId', 'factoryId', 'operatorId', 'positionId'],
      requestFilterState: {
        stationId: [1], factoryId: [], operatorId: [7], positionId: [],
      },
      calculatedFilterConfig: new Map([
        ['stationId', { type: 'select', defaultValue: [], removable: false }],
        ['factoryId', { type: 'select', defaultValue: [], removable: false }],
        ['operatorId', { type: 'select', defaultValue: [], removable: true }],
        ['positionId', { type: 'select', defaultValue: [], removable: true }],
      ]),
    });

    await wrapper.vm.$options.watch.isMobileView.call(wrapper.vm, false, true);

    expect(filterbarStore.removeFilter).toHaveBeenCalledTimes(1);
    expect(filterbarStore.removeFilter).toHaveBeenCalledWith('positionId');
  });
});
