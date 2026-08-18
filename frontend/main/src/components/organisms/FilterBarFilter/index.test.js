import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { mdiMonitor, mdiCloseCircle } from '@mdi/js';
import { describe, it, expect, beforeEach, test, vi } from 'vitest';

import index from './index.vue';

import { UNCOMMENTED_ID } from '@/constants/identificators';
import { useDeviceStore, useFilterbarStore } from '@/stores';

const DEFAULT_FILTER_CONFIG = new Map([
  ['string', { attr: { itemText: 'name' } }],
]);

const mountWithConfig = ({
  filter = 'string',
  visibleFilters = () => [],
  isMobileView = false,
  calculatedFilterConfig = DEFAULT_FILTER_CONFIG,
  currentFilterState = {},
  requestFilterState = {},
  menuOpen = {},
} = {}) => {
  const pinia = createTestingPinia({
    createSpy: vi.fn,
    stubActions: true,
    initialState: {
      filterbar: {
        currentFilterState,
        requestFilterState,
        menuOpen,
        calculatedFilterConfig,
        currentFilterItemsMap: {},
      },
    },
  });

  const filterbarStore = useFilterbarStore(pinia);
  filterbarStore.visibleFilters = visibleFilters;

  const deviceStore = useDeviceStore(pinia);
  deviceStore.isMobileView = isMobileView;

  const wrapper = shallowMount(index, {
    global: {
      plugins: [pinia],
    },
    props: { filter },
  });
  return { wrapper, pinia, filterbarStore, deviceStore };
};

const defaultConfig = {
  component: 'selection-menu',
  attr: {
    dense: true,
    class: 'ma-1',
    itemText: 'name',
    itemValue: 'id',
    placeholder: 'Factory',
    prependText: 'Factories:',
    prependInnerIcon: mdiMonitor,
    'min-width': 0,
    'max-width': 100,
    hasActions: true,
  },
  label: 'Factories',
  removable: true,
  defaultValue: [],
};

describe('FilterBarFilter', () => {
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

  it('renders correctly with factories multiselect', () => {
    const { wrapper } = mountWithConfig({
      filter: 'factoryId',
      calculatedFilterConfig: new Map([['factoryId', { ...defaultConfig }]]),
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  test('if isEntityItemUnspecified true for item with correct attributes', () => {
    const { wrapper } = mountWithConfig({
      filter: 'commentId',
      calculatedFilterConfig: new Map([['commentId', { ...defaultConfig }]]),
    });
    const item = { id: UNCOMMENTED_ID };
    const isUncommented = wrapper.vm.isEntityItemUnspecified(item);
    expect(isUncommented).toBe(true);
  });

  test('if isAllowedEntityItem returns true for Uncommented item', () => {
    const { wrapper } = mountWithConfig({
      filter: 'commentId',
      calculatedFilterConfig: new Map([
        ['commentId', {
          ...defaultConfig,
          filterBy: [['stationId', 'stationIds']],
        }],
      ]),
    });
    expect(wrapper.vm.isAllowedEntityItem({ id: UNCOMMENTED_ID })).toBe(true);
  });

  test('if isAllowedEntityItem returns true when there is no filterBy configuration', () => {
    const { wrapper } = mountWithConfig({
      filter: 'commentId',
      calculatedFilterConfig: new Map([
        ['commentId', {
          ...defaultConfig,
          filterBy: [],
        }],
      ]),
    });
    expect(wrapper.vm.isAllowedEntityItem({ id: 1 })).toBe(true);
  });

  describe('allowedEntityItem filterBy matching scenarios', () => {
    const truthyCases = [
      { stateVal: undefined, itemVal: [1] },
      { stateVal: undefined, itemVal: [2, 3] },
      { stateVal: undefined, itemVal: 1 },
      { stateVal: undefined, itemVal: 2 },
      { stateVal: [1], itemVal: [1] },
      { stateVal: 1, itemVal: [1] },
      { stateVal: [1], itemVal: 1 },
      { stateVal: 1, itemVal: 1 },
      { stateVal: [2, 4], itemVal: [2, 3] },
      { stateVal: 2, itemVal: [2, 3] },
      { stateVal: [2, 3], itemVal: 2 },
      { stateVal: 2, itemVal: 2 },
    ];
    truthyCases.forEach(({ stateVal, itemVal }) => {
      test(`returns true with state value ${JSON.stringify(stateVal)} and item value ${JSON.stringify(itemVal)}`, () => {
        const { wrapper } = mountWithConfig({
          filter: 'commentId',
          currentFilterState: { stationId: stateVal },
          requestFilterState: { stationId: stateVal },
          calculatedFilterConfig: new Map([
            ['commentId', {
              ...defaultConfig,
              filterBy: [['stationId', 'stationIds']],
            }],
          ]),
        });
        expect(wrapper.vm.isAllowedEntityItem({ id: 1, stationIds: itemVal })).toBe(true);
      });
    });
    const falsyCases = [
      { stateVal: [1, 3], itemVal: [2, 4] },
      { stateVal: 3, itemVal: [2, 4] },
      { stateVal: [1, 3], itemVal: 2 },
      { stateVal: 3, itemVal: 2 },
      { stateVal: [2, 4], itemVal: [3, 5] },
      { stateVal: 1, itemVal: [2] },
      { stateVal: [1, 3], itemVal: 2 },
      { stateVal: 1, itemVal: 2 },
    ];
    falsyCases.forEach(({ stateVal, itemVal }) => {
      test(`returns false with state value ${JSON.stringify(stateVal)} and item value ${JSON.stringify(itemVal)}`, () => {
        const { wrapper } = mountWithConfig({
          filter: 'commentId',
          currentFilterState: { stationId: stateVal },
          requestFilterState: { stationId: stateVal },
          calculatedFilterConfig: new Map([
            ['commentId', {
              ...defaultConfig,
              filterBy: [['stationId', 'stationIds']],
            }],
          ]),
        });
        expect(wrapper.vm.isAllowedEntityItem({ id: 1, stationIds: itemVal })).toBe(false);
      });
    });
  });

  test('that "onFilterInput" method calls "updateFilterValue" action, when input update prop is true', () => {
    const { wrapper, filterbarStore } = mountWithConfig({
      filter: 'testconf',
      calculatedFilterConfig: new Map([
        ['testconf', {
          ...defaultConfig,
          name: 'testconf',
          updateOnInput: true,
        }],
      ]),
    });

    wrapper.vm.onFilterInput('test', wrapper.vm.calculatedFilterConfig.get('testconf').name);
    expect(filterbarStore.updateFilterValue).toHaveBeenCalledTimes(1);
    expect(filterbarStore.updateFilterValue).toHaveBeenCalledWith({ testconf: 'test' });
  });

  test('that "onFilterInput" method calls "triggerDataRequest" action, when updateRequestStateOnInput prop is true', () => {
    const { wrapper, filterbarStore } = mountWithConfig({
      filter: 'testconf',
      calculatedFilterConfig: new Map([
        ['testconf', {
          ...defaultConfig,
          name: 'testconf',
          updateOnInput: true,
          updateRequestStateOnInput: true,
        }],
      ]),
    });

    wrapper.vm.onFilterInput('test', wrapper.vm.calculatedFilterConfig.get('testconf').name);
    expect(filterbarStore.updateFilterValue).toHaveBeenCalledTimes(1);
    expect(filterbarStore.updateFilterValue).toHaveBeenCalledWith({ testconf: 'test' });
    expect(filterbarStore.triggerDataRequest).toHaveBeenCalledTimes(1);
  });

  test('that "onFilterInput" method does not call "updateFilterValue" action, when input update prop is false', () => {
    const { wrapper, filterbarStore } = mountWithConfig({
      filter: 'testconf',
      calculatedFilterConfig: new Map([['testconf', {
        ...defaultConfig,
        name: 'testconf',
        updateOnInput: false,
      }]]),
    });

    wrapper.vm.onFilterInput('test', wrapper.vm.calculatedFilterConfig.get('testconf').name);
    expect(filterbarStore.updateFilterValue).toHaveBeenCalledTimes(0);
  });

  test('that "onFilterInput" method does not call "triggerDataRequest" action, when updateRequestStateOnInput prop is false', () => {
    const { wrapper, filterbarStore } = mountWithConfig({
      filter: 'testconf',
      calculatedFilterConfig: new Map([['testconf', {
        ...defaultConfig,
        name: 'testconf',
        updateOnInput: true,
        updateRequestStateOnInput: false,
      }]]),
    });

    wrapper.vm.onFilterInput('test', wrapper.vm.calculatedFilterConfig.get('testconf').name);
    expect(filterbarStore.updateFilterValue).toHaveBeenCalledTimes(1);
    expect(filterbarStore.updateFilterValue).toHaveBeenCalledWith({ testconf: 'test' });
    expect(filterbarStore.triggerDataRequest).toHaveBeenCalledTimes(0);
  });

  describe('inputItemsObj computed', () => {
    test('returns correct input items object', () => {
      const { wrapper } = mountWithConfig({
        filter: 'testconf',
        calculatedFilterConfig: new Map([['testconf', {
          ...defaultConfig,
          name: 'testconf',
          items: [{ id: 1, name: 'Item 1' }, { id: 2, name: 'Item 2' }],
        }]]),
      });
      wrapper.vm.selectedItems = [{ id: 3, name: 'Item 3' }];

      const { inputItemsObj } = wrapper.vm;
      expect(inputItemsObj).toEqual({
        1: { id: 1, name: 'Item 1' },
        2: { id: 2, name: 'Item 2' },
        3: { id: 3, name: 'Item 3' },
      });
    });

    test('returns empty object when no items are present', () => {
      const { wrapper } = mountWithConfig({
        filter: 'testconf',
        calculatedFilterConfig: new Map([['testconf', {
          ...defaultConfig,
          name: 'testconf',
          items: [],
          selectedItems: [],
        }]]),
      });

      const { inputItemsObj } = wrapper.vm;
      expect(inputItemsObj).toEqual({});
    });
  });

  describe('isOpen watcher', () => {
    it('calls cancelFilterChange if it changes from true to false and isMobileView is false', () => {
      const { wrapper, filterbarStore } = mountWithConfig({
        filter: 'stationId',
        isMobileView: false,
        menuOpen: 'stationId',
        calculatedFilterConfig: new Map([['stationId', { ...defaultConfig }]]),
      });

      wrapper.vm.$options.watch.isOpen.call(wrapper.vm, false, true);
      expect(filterbarStore.cancelFilterChange).toHaveBeenCalledTimes(1);
    });

    it('does not call cancelFilterChange if it changes from true to false and isMobileView is true', () => {
      const { wrapper, filterbarStore } = mountWithConfig({
        filter: 'stationId',
        isMobileView: true,
        menuOpen: 'stationId',
        calculatedFilterConfig: new Map([['stationId', { ...defaultConfig }]]),
      });

      wrapper.vm.$options.watch.isOpen.call(wrapper.vm, false, true);
      expect(filterbarStore.cancelFilterChange).toHaveBeenCalledTimes(0);
    });

    it('calls updateFilterValue if it changes from false to true', () => {
      const { wrapper, filterbarStore } = mountWithConfig({
        filter: 'stationId',
        menuOpen: 'stationId',
        calculatedFilterConfig: new Map([['stationId', { ...defaultConfig }]]),
      });

      wrapper.vm.$options.watch.isOpen.call(wrapper.vm, true, false);
      expect(filterbarStore.updateFilterValue).toHaveBeenCalledTimes(1);
      expect(filterbarStore.updateFilterValue).toHaveBeenCalledWith({ stationId: [] });
    });
  });

  describe('filteredValue watcher', () => {
    it('does not call updateFilterValue if filter is not visible', () => {
      const { wrapper, filterbarStore } = mountWithConfig({
        filter: 'hiddenFilter',
        visibleFilters: () => ['visibleFilter'],
        calculatedFilterConfig: new Map([['hiddenFilter', { ...defaultConfig }]]),
      });

      wrapper.vm.$options.watch.filteredValue.call(wrapper.vm, ['test'], []);
      expect(filterbarStore.updateFilterValue).toHaveBeenCalledTimes(0);
    });

    it('does not call updateFilterValue if filter is visible, but newVal and oldVal are equal', () => {
      const { wrapper, filterbarStore } = mountWithConfig({
        filter: 'visibleFilter',
        visibleFilters: () => ['visibleFilter'],
        calculatedFilterConfig: new Map([['visibleFilter', { ...defaultConfig }]]),
      });

      wrapper.vm.$options.watch.filteredValue.call(wrapper.vm, ['test'], ['test']);
      expect(filterbarStore.updateFilterValue).toHaveBeenCalledTimes(0);
    });

    describe('backend-filtered stale items recovery', () => {
      const backendFilterConfig = {
        ...defaultConfig,
        backendFilteringConfig: { entity: 'checklists', filterBy: [] },
      };

      it('refetches instead of committing truncated value when request state has unknown IDs', () => {
        const { wrapper, filterbarStore } = mountWithConfig({
          filter: 'checklistId',
          visibleFilters: () => ['checklistId'],
          calculatedFilterConfig: new Map([['checklistId', backendFilterConfig]]),
          requestFilterState: { checklistId: [4, 5, 6] },
          currentFilterState: { checklistId: [4, 5, 6] },
        });
        const refetchSpy = vi.spyOn(wrapper.vm, 'getItemsBackendFiltered').mockResolvedValue();
        wrapper.vm.lastFetchedSelectionIds = [1, 2, 3];

        wrapper.vm.$options.watch.filteredValue.call(wrapper.vm, [], [1, 2, 3]);

        expect(refetchSpy).toHaveBeenCalledTimes(1);
        expect(filterbarStore.updateFilterValue).toHaveBeenCalledTimes(0);
      });

      it('does not refetch while a backend fetch is already in flight', () => {
        const { wrapper } = mountWithConfig({
          filter: 'checklistId',
          visibleFilters: () => ['checklistId'],
          calculatedFilterConfig: new Map([['checklistId', backendFilterConfig]]),
          requestFilterState: { checklistId: [4, 5, 6] },
          currentFilterState: { checklistId: [4, 5, 6] },
        });
        const refetchSpy = vi.spyOn(wrapper.vm, 'getItemsBackendFiltered').mockResolvedValue();
        wrapper.vm.backendLoading = true;

        wrapper.vm.$options.watch.filteredValue.call(wrapper.vm, [], [1, 2, 3]);

        expect(refetchSpy).toHaveBeenCalledTimes(0);
      });

      it('does not refetch again when the unknown IDs match the last fetched selection', () => {
        const { wrapper } = mountWithConfig({
          filter: 'checklistId',
          visibleFilters: () => ['checklistId'],
          calculatedFilterConfig: new Map([['checklistId', backendFilterConfig]]),
          requestFilterState: { checklistId: [999] },
          currentFilterState: { checklistId: [999] },
        });
        const refetchSpy = vi.spyOn(wrapper.vm, 'getItemsBackendFiltered').mockResolvedValue();
        wrapper.vm.lastFetchedSelectionIds = [999];

        wrapper.vm.$options.watch.filteredValue.call(wrapper.vm, [], [1]);

        expect(refetchSpy).toHaveBeenCalledTimes(0);
      });
    });
  });

  describe('onUpdateMenuOpen', () => {
    it('calls setFilterMenuState if val is false and isMobileView is true', () => {
      const { wrapper, filterbarStore } = mountWithConfig({
        filter: 'stationId',
        isMobileView: true,
        calculatedFilterConfig: new Map([['stationId', { ...defaultConfig }]]),
      });

      wrapper.vm.onUpdateMenuOpen(false, 'stationId');
      expect(filterbarStore.setFilterMenuState).toHaveBeenCalledTimes(1);
      expect(filterbarStore.setFilterMenuState).toHaveBeenCalledWith({ isOpen: false, filter: 'stationId' });
    });

    it('calls setFilterMenuState if val is true and isMobileView is true', () => {
      const { wrapper, filterbarStore } = mountWithConfig({
        filter: 'stationId',
        isMobileView: true,
        calculatedFilterConfig: new Map([['stationId', { ...defaultConfig }]]),
      });

      wrapper.vm.onUpdateMenuOpen(true, 'stationId');
      expect(filterbarStore.setFilterMenuState).toHaveBeenCalledTimes(1);
      expect(filterbarStore.setFilterMenuState).toHaveBeenCalledWith({ isOpen: true, filter: 'stationId' });
    });

    it('calls setFilterMenuState if val is true and isMobileView is false', () => {
      const { wrapper, filterbarStore } = mountWithConfig({
        filter: 'stationId',
        isMobileView: false,
        calculatedFilterConfig: new Map([['stationId', { ...defaultConfig }]]),
      });

      wrapper.vm.onUpdateMenuOpen(true, 'stationId');
      expect(filterbarStore.setFilterMenuState).toHaveBeenCalledTimes(1);
      expect(filterbarStore.setFilterMenuState).toHaveBeenCalledWith({ isOpen: true, filter: 'stationId' });
    });

    it('calls cancelFilterChange if val is false and isMobileView is false', () => {
      const { wrapper, filterbarStore } = mountWithConfig({
        filter: 'stationId',
        isMobileView: false,
        calculatedFilterConfig: new Map([['stationId', { ...defaultConfig }]]),
      });

      wrapper.vm.onUpdateMenuOpen(false, 'stationId');
      expect(filterbarStore.cancelFilterChange).toHaveBeenCalledTimes(1);
      expect(filterbarStore.cancelFilterChange).toHaveBeenCalledWith('stationId');
    });
  });

  describe('appendIcon', () => {
    it('returns empty string if value is equal to defaultValue and isOpen is true', () => {
      const { wrapper } = mountWithConfig({
        filter: 'stationId',
        currentFilterState: { stationId: [] },
        menuOpen: 'stationId',
        calculatedFilterConfig: new Map([['stationId', {
          ...defaultConfig,
          defaultValue: [],
        }]]),
      });

      expect(wrapper.vm.value).toEqual([]);
      expect(wrapper.vm.configuration.defaultValue).toEqual([]);
      expect(wrapper.vm.isOpen).toBe(true);
      expect(wrapper.vm.appendIcon).toBe('');
    });

    it('returns empty string if value is not equal to defaultValue and isOpen is true', () => {
      const { wrapper } = mountWithConfig({
        filter: 'stationId',
        currentFilterState: { stationId: [1] },
        menuOpen: 'stationId',
        calculatedFilterConfig: new Map([['stationId', {
          ...defaultConfig,
          defaultValue: [],
        }]]),
      });

      expect(wrapper.vm.value).toEqual([1]);
      expect(wrapper.vm.configuration.defaultValue).toEqual([]);
      expect(wrapper.vm.isOpen).toBe(true);
      expect(wrapper.vm.appendIcon).toBe('');
    });

    it('returns empty string if value is equal to defaultValue and isOpen is false', () => {
      const { wrapper } = mountWithConfig({
        filter: 'stationId',
        currentFilterState: { stationId: [] },
        menuOpen: 'factoryId',
        calculatedFilterConfig: new Map([['stationId', {
          ...defaultConfig,
          defaultValue: [],
        }]]),
      });

      expect(wrapper.vm.value).toEqual([]);
      expect(wrapper.vm.configuration.defaultValue).toEqual([]);
      expect(wrapper.vm.isOpen).toBe(false);
      expect(wrapper.vm.appendIcon).toBe('');
    });

    it('returns empty string if value is not equal to defaultValue, isOpen is false and isSingleSelect is true', () => {
      const { wrapper } = mountWithConfig({
        filter: 'stationId',
        currentFilterState: { stationId: [1] },
        menuOpen: 'factoryId',
        calculatedFilterConfig: new Map([['stationId', {
          ...defaultConfig,
          defaultValue: [],
          attr: {
            ...defaultConfig.attr,
            isSingleSelect: true,
          },
        }]]),
      });

      expect(wrapper.vm.value).toEqual([1]);
      expect(wrapper.vm.configuration.defaultValue).toEqual([]);
      expect(wrapper.vm.isOpen).toBe(false);
      expect(wrapper.vm.appendIcon).toBe('');
    });

    it('returns mdiCloseCircle if value is not equal to defaultValue, isOpen is false and isSingleSelect is false', () => {
      const { wrapper } = mountWithConfig({
        filter: 'stationId',
        currentFilterState: { stationId: [1] },
        menuOpen: 'factoryId',
        calculatedFilterConfig: new Map([['stationId', {
          ...defaultConfig,
          defaultValue: [],
          attr: {
            ...defaultConfig.attr,
            isSingleSelect: false,
          },
        }]]),
      });

      expect(wrapper.vm.value).toEqual([1]);
      expect(wrapper.vm.configuration.defaultValue).toEqual([]);
      expect(wrapper.vm.isOpen).toBe(false);
      expect(wrapper.vm.appendIcon).toBe(mdiCloseCircle);
    });
  });

  describe('onFilterChange', () => {
    it('does not call updateFilterValue if it is search filter', () => {
      const { wrapper, filterbarStore } = mountWithConfig({
        filter: 'search',
        calculatedFilterConfig: new Map([['search', { ...defaultConfig }]]),
      });

      wrapper.vm.onFilterChange('testValue');
      expect(filterbarStore.updateFilterValue).not.toHaveBeenCalled();
    });

    it('calls updateFilterValue with correct parameters if it is not search filter', () => {
      const { wrapper, filterbarStore } = mountWithConfig({
        filter: 'stationId',
        calculatedFilterConfig: new Map([['stationId', { ...defaultConfig }]]),
      });

      wrapper.vm.onFilterChange(11);
      expect(filterbarStore.updateFilterValue).toHaveBeenCalledWith({ stationId: 11 });
    });

    it('calls applyFilterState if it is not mobile view and isSingleSelect is true', () => {
      const { wrapper, filterbarStore } = mountWithConfig({
        filter: 'stationId',
        isMobileView: false,
        calculatedFilterConfig: new Map([
          ['stationId', { ...defaultConfig, attr: { isSingleSelect: true } }],
        ]),
      });

      wrapper.vm.onFilterChange(11);
      expect(filterbarStore.applyFilterState).toHaveBeenCalled();
    });

    it('does not call applyFilterState if it is mobile view and isSingleSelect is true', () => {
      const { wrapper, filterbarStore } = mountWithConfig({
        filter: 'stationId',
        isMobileView: true,
        calculatedFilterConfig: new Map([
          ['stationId', { ...defaultConfig, attr: { isSingleSelect: true } }],
        ]),
      });

      wrapper.vm.onFilterChange(11);
      expect(filterbarStore.applyFilterState).not.toHaveBeenCalled();
    });

    it('does not call applyFilterState if it is not mobile view and isSingleSelect is false', () => {
      const { wrapper, filterbarStore } = mountWithConfig({
        filter: 'stationId',
        isMobileView: false,
        calculatedFilterConfig: new Map([
          ['stationId', { ...defaultConfig, attr: { isSingleSelect: false } }],
        ]),
      });

      wrapper.vm.onFilterChange(11);
      expect(filterbarStore.applyFilterState).not.toHaveBeenCalled();
    });
  });

  describe('onEmptyFilter', () => {
    it('calls updateFilterValue with empty array and triggerDataRequest if it is not mobile view', () => {
      const { wrapper, filterbarStore } = mountWithConfig({
        filter: 'stationId',
        isMobileView: false,
        calculatedFilterConfig: new Map([['stationId', { ...defaultConfig }]]),
      });

      wrapper.vm.onEmptyFilter();
      expect(filterbarStore.updateFilterValue).toHaveBeenCalledTimes(1);
      expect(filterbarStore.updateFilterValue).toHaveBeenCalledWith({ stationId: [] });
      expect(filterbarStore.triggerDataRequest).toHaveBeenCalledTimes(1);
    });

    it('calls updateFilterValue with empty array and does not call triggerDataRequest if it is mobile view', () => {
      const { wrapper, filterbarStore } = mountWithConfig({
        filter: 'stationId',
        isMobileView: true,
        calculatedFilterConfig: new Map([['stationId', { ...defaultConfig }]]),
      });

      wrapper.vm.onEmptyFilter();
      expect(filterbarStore.updateFilterValue).toHaveBeenCalledTimes(1);
      expect(filterbarStore.updateFilterValue).toHaveBeenCalledWith({ stationId: [] });
      expect(filterbarStore.triggerDataRequest).toHaveBeenCalledTimes(0);
    });
  });

  describe('onValueChangeBeforeApply callback', () => {
    it('executes onValueChangeBeforeApply before applyFilterState for single-select', async () => {
      const executionOrder = [];
      const { wrapper, filterbarStore } = mountWithConfig({
        filter: 'testFilter',
        calculatedFilterConfig: new Map([
          ['testFilter', {
            ...defaultConfig,
            attr: { ...defaultConfig.attr, isSingleSelect: true },
            onValueChangeBeforeApply: () => executionOrder.push('beforeApply'),
          }],
        ]),
      });
      filterbarStore.applyFilterState.mockImplementation(() => executionOrder.push('apply'));

      wrapper.vm.onFilterChange('testValue');

      expect(executionOrder).toEqual(['beforeApply', 'apply']);
    });

    it('passes correct arguments to onValueChangeBeforeApply', () => {
      const callback = vi.fn();
      const { wrapper } = mountWithConfig({
        filter: 'testFilter',
        calculatedFilterConfig: new Map([
          ['testFilter', {
            ...defaultConfig,
            attr: { ...defaultConfig.attr, isSingleSelect: true },
            onValueChangeBeforeApply: callback,
            items: [{ id: 123, name: 'Test Item' }],
          }],
        ]),
      });

      wrapper.vm.onFilterChange(123);

      expect(callback).toHaveBeenCalledWith({
        value: 123,
        item: { id: 123, name: 'Test Item' },
      });
    });

    it('handles missing onValueChangeBeforeApply gracefully', () => {
      const { wrapper } = mountWithConfig({
        filter: 'testFilter',
        calculatedFilterConfig: new Map([
          ['testFilter', {
            ...defaultConfig,
            attr: { ...defaultConfig.attr, isSingleSelect: true },
          }],
        ]),
      });

      expect(() => wrapper.vm.onFilterChange('testValue')).not.toThrow();
    });

    it('continues with applyFilterState when callback throws error', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const executionOrder = [];
      const { wrapper, filterbarStore } = mountWithConfig({
        filter: 'testFilter',
        calculatedFilterConfig: new Map([
          ['testFilter', {
            ...defaultConfig,
            attr: { ...defaultConfig.attr, isSingleSelect: true },
            onValueChangeBeforeApply: () => {
              throw new Error('Test error');
            },
          }],
        ]),
      });
      filterbarStore.applyFilterState.mockImplementation(() => executionOrder.push('apply'));

      wrapper.vm.onFilterChange('testValue');

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('onValueChangeBeforeApply failed'),
        expect.any(Error),
      );
      expect(executionOrder).toContain('apply');
      consoleErrorSpy.mockRestore();
    });

    it('does not call onValueChangeBeforeApply for multi-select filters', () => {
      const callback = vi.fn();
      const { wrapper } = mountWithConfig({
        filter: 'testFilter',
        calculatedFilterConfig: new Map([
          ['testFilter', {
            ...defaultConfig,
            attr: { ...defaultConfig.attr, isSingleSelect: false },
            onValueChangeBeforeApply: callback,
          }],
        ]),
      });

      wrapper.vm.onFilterChange('testValue');

      expect(callback).not.toHaveBeenCalled();
    });

    it('clears dependent required single-select filters when dependency changes', () => {
      const { wrapper, filterbarStore } = mountWithConfig({
        filter: 'stationId',
        calculatedFilterConfig: new Map([
          ['stationId', {
            ...defaultConfig,
            attr: { ...defaultConfig.attr, isSingleSelect: true },
          }],
          ['productId', {
            ...defaultConfig,
            attr: { ...defaultConfig.attr, isSingleSelect: true, required: true },
            backendFilteringConfig: {
              entity: 'products',
              filterBy: [
                ['stationId', 'stationId'],
              ],
            },
          }],
        ]),
      });

      wrapper.vm.onFilterChange(1);

      expect(filterbarStore.updateFilterValue).toHaveBeenCalledWith({ productId: [] });
    });

    it('does not clear dependent filters that are not required', () => {
      const { wrapper, filterbarStore } = mountWithConfig({
        filter: 'stationId',
        calculatedFilterConfig: new Map([
          ['stationId', {
            ...defaultConfig,
            attr: { ...defaultConfig.attr, isSingleSelect: true },
          }],
          ['productId', {
            ...defaultConfig,
            attr: { ...defaultConfig.attr, isSingleSelect: true, required: false },
            backendFilteringConfig: {
              entity: 'products',
              filterBy: [
                ['stationId', 'stationId'],
              ],
            },
          }],
        ]),
      });

      wrapper.vm.onFilterChange(1);

      // Should only be called once for the stationId change, not for clearing productId
      expect(filterbarStore.updateFilterValue).toHaveBeenCalledTimes(1);
      expect(filterbarStore.updateFilterValue).toHaveBeenCalledWith({ stationId: 1 });
    });

    it('does not clear dependent filters that are not single-select', () => {
      const { wrapper, filterbarStore } = mountWithConfig({
        filter: 'stationId',
        calculatedFilterConfig: new Map([
          ['stationId', {
            ...defaultConfig,
            attr: { ...defaultConfig.attr, isSingleSelect: true },
          }],
          ['productId', {
            ...defaultConfig,
            attr: { ...defaultConfig.attr, isSingleSelect: false, required: true },
            backendFilteringConfig: {
              entity: 'products',
              filterBy: [
                ['stationId', 'stationId'],
              ],
            },
          }],
        ]),
      });

      wrapper.vm.onFilterChange(1);

      // Should only be called once for the stationId change, not for clearing productId
      expect(filterbarStore.updateFilterValue).toHaveBeenCalledTimes(1);
      expect(filterbarStore.updateFilterValue).toHaveBeenCalledWith({ stationId: 1 });
    });

    it('does not clear filters that do not depend on changed filter', () => {
      const { wrapper, filterbarStore } = mountWithConfig({
        filter: 'stationId',
        calculatedFilterConfig: new Map([
          ['stationId', {
            ...defaultConfig,
            attr: { ...defaultConfig.attr, isSingleSelect: true },
          }],
          ['productId', {
            ...defaultConfig,
            attr: { ...defaultConfig.attr, isSingleSelect: true, required: true },
            backendFilteringConfig: {
              entity: 'products',
              filterBy: [
                ['factoryId', 'factoryId'], // depends on factoryId, not stationId
              ],
            },
          }],
        ]),
      });

      wrapper.vm.onFilterChange(1);

      // Should only be called once for the stationId change, not for clearing productId
      expect(filterbarStore.updateFilterValue).toHaveBeenCalledTimes(1);
      expect(filterbarStore.updateFilterValue).toHaveBeenCalledWith({ stationId: 1 });
    });
  });
});
