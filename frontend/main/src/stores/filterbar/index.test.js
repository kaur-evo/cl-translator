import { setActivePinia, createPinia } from 'pinia';

import useFilterbarStore, { isVisible, resolvePiniaGetter, resolvePiniaAction } from '@/stores/filterbar';
import chartType from '@/stores/reportsConfig/constants/chartType';
import FilterBarMock from '@/stores/filterbar/FilterBar';
import useFactoryStore from '@/stores/factory';
import useReportsConfigStore from '@/stores/reportsConfig';

vi.mock('@/stores/filterbar/FilterBar', () => {
  const FilterBar = vi.fn();
  FilterBar.prototype.setFilterConfiguration = vi.fn();
  FilterBar.prototype.removeSingleFilter = vi.fn();
  FilterBar.prototype.calculateFilterState = vi.fn(() => new Map());
  FilterBar.prototype.getOrderedFilters = vi.fn(() => []);
  FilterBar.prototype.updateFilterValue = vi.fn();
  FilterBar.prototype.filterConfiguration = new Map();
  return { default: FilterBar };
});

vi.mock('@/stores/device', () => ({
  default: vi.fn(() => ({ isMobileView: false })),
}));

vi.mock('@/stores/comment', () => ({ default: vi.fn(() => ({})) }));
vi.mock('@/stores/perfComment', () => ({ default: vi.fn(() => ({})) }));
vi.mock('@/stores/scrapReason', () => ({ default: vi.fn(() => ({})) }));
vi.mock('@/stores/product', () => ({ default: vi.fn(() => ({})) }));
vi.mock('@/stores/factory', () => ({ default: vi.fn(() => ({ factories: [] })) }));
vi.mock('@/stores/station', () => ({ default: vi.fn(() => ({})) }));
vi.mock('@/stores/checklistTemplate', () => ({ default: vi.fn(() => ({})) }));
vi.mock('@/stores/user', () => ({ default: vi.fn(() => ({})) }));
vi.mock('@/stores/position', () => ({ default: vi.fn(() => ({})) }));
vi.mock('@/stores/operator', () => ({ default: vi.fn(() => ({})) }));
vi.mock('@/stores/reportsConfig', () => ({ default: vi.fn(() => ({})) }));
vi.mock('@/stores/shiftTemplate', () => ({ default: vi.fn(() => ({})) }));

describe('useFilterbarStore', () => {
  describe('resolvePiniaGetter', () => {
    beforeEach(() => {
      setActivePinia(createPinia());
      vi.clearAllMocks();
    });

    test('returns the seeded getter value for a known module', () => {
      useFactoryStore.mockReturnValue({ factories: [{ id: 1 }, { id: 2 }] });
      expect(resolvePiniaGetter('factory/factories')).toEqual([{ id: 1 }, { id: 2 }]);
    });

    test('returns undefined for an unknown module', () => {
      expect(resolvePiniaGetter('unknownModule/foo')).toBeUndefined();
    });

    test('returns undefined for an undefined path', () => {
      expect(resolvePiniaGetter(undefined)).toBeUndefined();
    });

    test('returns undefined when the getter is not defined on the store', () => {
      useFactoryStore.mockReturnValue({});
      expect(resolvePiniaGetter('factory/unknownGetter')).toBeUndefined();
    });
  });

  describe('resolvePiniaAction', () => {
    beforeEach(() => {
      setActivePinia(createPinia());
      vi.clearAllMocks();
    });

    test('invokes the action on the resolved store with the payload', () => {
      const setDateRange = vi.fn().mockResolvedValue('ok');
      useReportsConfigStore.mockReturnValue({ setDateRange });
      const result = resolvePiniaAction('reportsConfig/setDateRange', { start: 1, end: 2 });
      expect(setDateRange).toHaveBeenCalledWith({ start: 1, end: 2 });
      return expect(result).resolves.toBe('ok');
    });

    test('returns Promise.resolve(undefined) for an undefined path (silent no-op)', async () => {
      await expect(resolvePiniaAction(undefined)).resolves.toBeUndefined();
    });

    test('returns Promise.resolve(undefined) for an unknown module', async () => {
      await expect(resolvePiniaAction('unknownModule/foo')).resolves.toBeUndefined();
    });

    test('returns Promise.resolve(undefined) when the action does not exist on the store', async () => {
      useReportsConfigStore.mockReturnValue({});
      await expect(resolvePiniaAction('reportsConfig/unknownAction')).resolves.toBeUndefined();
    });
  });

  describe('isVisible', () => {
    test('if filter is visible when its not defined in configuration', () => {
      const state = { calculatedFilterConfig: new Map() };
      const filter = 'commentId';
      expect(isVisible({ state }, filter)).toBe(false);
    });
  });

  describe('actions', () => {
    let filterbarStore;
    let defaultFilters;
    let disabledFilters;

    beforeEach(() => {
      setActivePinia(createPinia());
      filterbarStore = useFilterbarStore();
      filterbarStore.requestFilterState = { persistentFilter: 'newValue', notPersistentFilter: [1] };

      const filterConfiguration = new Map([
        ['persistentFilter', { defaultValue: [] }],
        ['notPersistentFilter', { defaultValue: [] }],
      ]);
      defaultFilters = [];
      disabledFilters = [];
      const isMobileFilterBar = false;
      const persistentFilters = ['persistentFilter'];
      filterbarStore.initialize({
        filterConfiguration, defaultFilters, disabledFilters, isMobileFilterBar, persistentFilters,
      });
      vi.clearAllMocks();
    });

    test('removeFromCurrentFilterState removes the filter from currentFilterState', () => {
      filterbarStore.currentFilterState = { filter1: 'value1', filter2: 'value2' };
      filterbarStore.removeFromCurrentFilterState('filter1');
      expect(filterbarStore.currentFilterState).toEqual({ filter2: 'value2' });
    });

    test('removeFilter', () => {
      filterbarStore.currentFilterState = { filter1: 'value1', filter2: 'value2' };
      filterbarStore.removeFilter('filter1');
      expect(FilterBarMock.prototype.removeSingleFilter).toHaveBeenCalledWith('filter1');
      expect(filterbarStore.currentFilterState).toEqual({ filter2: 'value2' });
    });
  });

  describe('getters', () => {
    let filterbarStore;

    beforeEach(() => {
      setActivePinia(createPinia());
      filterbarStore = useFilterbarStore();
    });

    test('getUrlWithPassableFilterValues when config type is OEE and reportingOeeChartType exists in localStorage', () => {
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: vi.fn(() => JSON.stringify([chartType.GROUPED_COLUMN])),
        },
        writable: true,
      });
      const url = '?bookmarkId=OEE&name=OEE&type=OEE&granularity=date&chartType%5B%5D=%5B%22lineChart%22,%22dotPlot%22%5D';
      expect(filterbarStore.getUrlWithPassableFilterValues(url, []))
        .toEqual('?bookmarkId=OEE&name=OEE&type=OEE&granularity=date&chartType%5B%5D=%5B%22groupedColumn%22%5D');
    });

    test('getUrlWithPassableFilterValues when config type is OEE and reportingOeeChartType does not exist in localStorage', () => {
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: vi.fn(() => undefined),
        },
        writable: true,
      });
      const url = '?bookmarkId=OEE&name=OEE&type=OEE&granularity=date&chartType%5B%5D=%5B%22lineChart%22,%22dotPlot%22%5D';
      expect(filterbarStore.getUrlWithPassableFilterValues(url, [])).toEqual(url);
    });
  });
});
