import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import MobileFilterBarDialog from './index.vue';

import { entities } from '@/constants/activityLogsConstants';
import { useBookmarkStore, useDeviceStore, useFilterbarStore, useGenericDialogStore } from '@/stores';

const DEFAULT_DIALOG_DATA = {
  limit: 300,
  filterConfiguration: new Map([
    ['factoryId', { attr: { prependText: 'Factory' } }],
    ['stationId', { attr: { prependText: 'Station' } }],
    ['groupId', { attr: { prependText: 'Group' } }],
  ]),
};

const DEFAULT_FILTER_CONFIG = new Map([
  ['factoryId', {}],
  ['stationId', {}],
  ['groupId', {}],
]);

const mountWithConfig = ({
  visibleFilters = () => ['factoryId', 'stationId', 'groupId'],
  isMobileView = true,
  isUserBookmark = false,
  currentBookmark = {},
  currentFilterState = { factoryId: [], stationId: [], groupId: [] },
  calculatedFilterConfig = DEFAULT_FILTER_CONFIG,
  dialogData = DEFAULT_DIALOG_DATA,
} = {}) => {
  const pinia = createTestingPinia({
    createSpy: vi.fn,
    stubActions: true,
    initialState: {
      filterbar: {
        currentFilterState,
        requestFilterState: {},
        menuOpen: {},
        calculatedFilterConfig,
        currentFilterItemsMap: {},
      },
      genericDialog: { dialogData },
    },
  });

  const filterbarStore = useFilterbarStore(pinia);
  filterbarStore.visibleFilters = visibleFilters;

  const deviceStore = useDeviceStore(pinia);
  deviceStore.isMobileView = isMobileView;

  const bookmarkStore = useBookmarkStore(pinia);
  bookmarkStore.isUserBookmark = isUserBookmark;
  bookmarkStore.currentBookmark = currentBookmark;

  const genericDialogStore = useGenericDialogStore(pinia);

  const wrapper = shallowMount(MobileFilterBarDialog, {
    global: {
      plugins: [pinia],
      stubs: { 'dialog-template': false },
    },
  });
  return { wrapper, pinia, filterbarStore, genericDialogStore };
};

describe('MobileFilterBarDialog', () => {
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

  test('that onCancel calls cancelFilterChange and closeDialog store actions', () => {
    const { wrapper, filterbarStore, genericDialogStore } = mountWithConfig();
    wrapper.vm.onCancel();
    expect(filterbarStore.cancelFilterChange).toHaveBeenCalled();
    expect(genericDialogStore.closeDialog).toHaveBeenCalled();
  });

  test('that onSave calls triggerDataRequest and closeDialog store actions', () => {
    const { wrapper, filterbarStore, genericDialogStore } = mountWithConfig();
    wrapper.vm.onSave();
    expect(filterbarStore.triggerDataRequest).toHaveBeenCalled();
    expect(genericDialogStore.closeDialog).toHaveBeenCalled();
  });

  test('that visibleFilters filters out period and search', () => {
    const { wrapper } = mountWithConfig({
      visibleFilters: () => ['factoryId', 'stationId', 'groupId', 'period', 'search'],
    });

    expect(wrapper.vm.visibleFilters).toEqual(['factoryId', 'stationId', 'groupId']);
  });

  test('that filteredFilters returns correct filters', () => {
    const { wrapper } = mountWithConfig({
      visibleFilters: () => ['stationId', 'entity', entities.STOP_REASON, entities.STOP_GROUP],
      calculatedFilterConfig: new Map([
        ['stationId', { attr: { prependText: 'Station' } }],
        ['entity', { attr: { prependText: 'Entity' } }],
        [entities.STOP_REASON, { attr: { prependText: 'Stop Reason' }, visibleFilterValues: { entity: entities.STOP_REASON } }],
        [entities.STOP_GROUP, { attr: { prependText: 'Stop Group' }, visibleFilterValues: { entity: entities.STOP_GROUP } }],
      ]),
      currentFilterState: {
        stationId: [1],
        entity: [entities.STOP_REASON],
        stopreason: [],
        stopgroup: [],
      },
    });
    expect(wrapper.vm.filteredFilters).toEqual(['stationId', 'entity', entities.STOP_REASON]);
  });

  describe('isResetEnabled', () => {
    it('returns false if isUserBookmark is true and current filter state matches current bookmark', () => {
      const { wrapper } = mountWithConfig({
        isUserBookmark: true,
        visibleFilters: () => ['factoryId', 'stationId'],
        currentFilterState: { factoryId: [3], stationId: [53] },
        currentBookmark: { url: 'http://test.com?factoryId%5B%5D=%5B3%5D&stationId%5B%5D=%5B53%5D' },
      });

      expect(wrapper.vm.isResetEnabled).toBe(false);
    });

    it('returns false if isUserBookmark is true and current filter state does not current bookmark, but difference is not in visible filters', () => {
      const { wrapper } = mountWithConfig({
        isUserBookmark: true,
        visibleFilters: () => ['stationId'],
        currentFilterState: { factoryId: [2], stationId: [53] },
        currentBookmark: { url: 'http://test.com?factoryId%5B%5D=%5B3%5D&stationId%5B%5D=%5B53%5D' },
      });

      expect(wrapper.vm.isResetEnabled).toBe(false);
    });

    it('returns true if isUserBookmark is true and current filter state does not match current bookmark', () => {
      const { wrapper } = mountWithConfig({
        isUserBookmark: true,
        currentFilterState: { factoryId: [2], stationId: [53] },
        currentBookmark: { url: 'http://test.com?factoryId%5B%5D=%5B3%5D&stationId%5B%5D=%5B53%5D' },
      });

      expect(wrapper.vm.isResetEnabled).toBe(true);
    });

    it('returns false if isUserBookmark is false and no filters have been applied', () => {
      const { wrapper } = mountWithConfig({
        isUserBookmark: false,
        visibleFilters: () => ['factoryId', 'stationId'],
        currentFilterState: { factoryId: [], stationId: [] },
      });

      expect(wrapper.vm.isResetEnabled).toBe(false);
    });

    it('returns false if isUserBookmark is false, filter has been applied, but it is not visible', () => {
      const { wrapper } = mountWithConfig({
        isUserBookmark: false,
        visibleFilters: () => ['factoryId', 'stationId'],
        currentFilterState: { factoryId: [], stationId: [], groupId: [2] },
      });

      expect(wrapper.vm.isResetEnabled).toBe(false);
    });

    it('returns true if isUserBookmark is false, filter is applied and it is visible', () => {
      const { wrapper } = mountWithConfig({
        isUserBookmark: false,
        visibleFilters: () => ['factoryId', 'stationId'],
        currentFilterState: { factoryId: [1, 2], stationId: [] },
      });

      expect(wrapper.vm.isResetEnabled).toBe(true);
    });

    it('returns true if current filter state does not match defaultValue', () => {
      const { wrapper } = mountWithConfig({
        isUserBookmark: false,
        visibleFilters: () => ['factoryId', 'stationId'],
        currentFilterState: { factoryId: [1], stationId: [] },
        calculatedFilterConfig: new Map([
          ['factoryId', { defaultValue: [] }],
          ['stationId', { defaultValue: [] }],
        ]),
      });

      expect(wrapper.vm.isResetEnabled).toBe(true);
    });

    it('returns false if current filter state matches defaultValue', () => {
      const { wrapper } = mountWithConfig({
        isUserBookmark: false,
        visibleFilters: () => ['factoryId', 'stationId'],
        currentFilterState: { factoryId: [], stationId: [] },
        calculatedFilterConfig: new Map([
          ['factoryId', { defaultValue: [] }],
          ['stationId', { defaultValue: [] }],
        ]),
      });

      expect(wrapper.vm.isResetEnabled).toBe(false);
    });

    it('returns true if current filter state partially matches defaultValue', () => {
      const { wrapper } = mountWithConfig({
        isUserBookmark: false,
        visibleFilters: () => ['factoryId', 'stationId'],
        currentFilterState: { factoryId: [1], stationId: [] },
        calculatedFilterConfig: new Map([
          ['factoryId', { defaultValue: [2] }],
          ['stationId', { defaultValue: [] }],
        ]),
      });

      expect(wrapper.vm.isResetEnabled).toBe(true);
    });

    it('returns false if no visible filters have defaultValue mismatch', () => {
      const { wrapper } = mountWithConfig({
        isUserBookmark: false,
        visibleFilters: () => ['factoryId'],
        currentFilterState: { factoryId: [], stationId: [1] },
        calculatedFilterConfig: new Map([
          ['factoryId', { defaultValue: [] }],
          ['stationId', { defaultValue: [1] }],
        ]),
      });

      expect(wrapper.vm.isResetEnabled).toBe(false);
    });
  });

  describe('onReset', () => {
    it('calls updateFilterValue with bookmark values if isUserBookmark is true', () => {
      const { wrapper, filterbarStore } = mountWithConfig({
        isUserBookmark: true,
        visibleFilters: () => ['factoryId', 'stationId'],
        currentBookmark: { url: 'http://test.com?factoryId%5B%5D=%5B3%5D&stationId%5B%5D=%5B53%5D' },
      });

      wrapper.vm.onReset();

      expect(filterbarStore.updateFilterValue).toHaveBeenCalledTimes(2);
      expect(filterbarStore.updateFilterValue).toHaveBeenCalledWith({ factoryId: [3] });
      expect(filterbarStore.updateFilterValue).toHaveBeenCalledWith({ stationId: [53] });
    });

    it('calls updateFilterValue with empty values if isUserBookmark is false', () => {
      const { wrapper, filterbarStore } = mountWithConfig({
        isUserBookmark: false,
        visibleFilters: () => ['factoryId', 'stationId'],
      });

      wrapper.vm.onReset();

      expect(filterbarStore.updateFilterValue).toHaveBeenCalledTimes(2);
      expect(filterbarStore.updateFilterValue).toHaveBeenCalledWith({ factoryId: [] });
      expect(filterbarStore.updateFilterValue).toHaveBeenCalledWith({ stationId: [] });
    });

    it('calls updateFilterValue with defaultValue if isUserBookmark is false and defaultValue is defined', () => {
      const { wrapper, filterbarStore } = mountWithConfig({
        isUserBookmark: false,
        visibleFilters: () => ['factoryId', 'stationId'],
        calculatedFilterConfig: new Map([
          ['factoryId', { defaultValue: [1] }],
          ['stationId', { defaultValue: [2] }],
        ]),
      });

      wrapper.vm.onReset();

      expect(filterbarStore.updateFilterValue).toHaveBeenCalledTimes(2);
      expect(filterbarStore.updateFilterValue).toHaveBeenCalledWith({ factoryId: [1] });
      expect(filterbarStore.updateFilterValue).toHaveBeenCalledWith({ stationId: [2] });
    });

    it('calls updateFilterValue with empty array if isUserBookmark is false and defaultValue is undefined', () => {
      const { wrapper, filterbarStore } = mountWithConfig({
        isUserBookmark: false,
        visibleFilters: () => ['factoryId', 'stationId'],
        calculatedFilterConfig: new Map([
          ['factoryId', {}],
          ['stationId', {}],
        ]),
      });

      wrapper.vm.onReset();

      expect(filterbarStore.updateFilterValue).toHaveBeenCalledTimes(2);
      expect(filterbarStore.updateFilterValue).toHaveBeenCalledWith({ factoryId: [] });
      expect(filterbarStore.updateFilterValue).toHaveBeenCalledWith({ stationId: [] });
    });

    it('calls updateFilterValue with defaultValue for some filters and empty array for others', () => {
      const { wrapper, filterbarStore } = mountWithConfig({
        isUserBookmark: false,
        visibleFilters: () => ['factoryId', 'stationId'],
        calculatedFilterConfig: new Map([
          ['factoryId', { defaultValue: [1] }],
          ['stationId', {}],
        ]),
      });

      wrapper.vm.onReset();

      expect(filterbarStore.updateFilterValue).toHaveBeenCalledTimes(2);
      expect(filterbarStore.updateFilterValue).toHaveBeenCalledWith({ factoryId: [1] });
      expect(filterbarStore.updateFilterValue).toHaveBeenCalledWith({ stationId: [] });
    });
  });
});
