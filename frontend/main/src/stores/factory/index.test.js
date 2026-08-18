import { setActivePinia, createPinia } from 'pinia';

import useFactoryStore from '.';

import { COMPANY_ADMIN, FACTORY_ADMIN, OFFICE_USER } from '@/constants/userRoles';
import stationApi from '@/api/stationApi';
import useProfileStore from '@/stores/profile';
import useStationStore from '@/stores/station';

vi.mock('@/api/stationApi');

vi.mock('@/stores/profile', () => ({
  default: vi.fn(),
  __esModule: true,
}));

vi.mock('@/stores/station', () => ({
  default: vi.fn(),
  __esModule: true,
}));

describe('useFactoryStore', () => {
  let store;

  beforeEach(() => {
    vi.clearAllMocks();
    setActivePinia(createPinia());
    store = useFactoryStore();
  });

  describe('initial state', () => {
    test('has correct default values', () => {
      expect(store.factories).toEqual([]);
      expect(store.loading).toEqual([]);
      expect(store.factoryPromise).toBeNull();
    });
  });

  describe('actions', () => {
    test('fetchFactories', async () => {
      stationApi.getFactories.mockResolvedValue([{ id: 1, name: 'Factory 1' }]);
      await store.fetchFactories();
      expect(store.factories).toEqual([{ id: 1, name: 'Factory 1' }]);
      expect(store.loading).toEqual([]);
      expect(store.factoryPromise).toBeInstanceOf(Promise);
    });

    test('fetchFactories handles null response', async () => {
      stationApi.getFactories.mockResolvedValue(null);
      await store.fetchFactories();
      expect(store.factories).toEqual([]);
    });
  });

  describe('getters', () => {
    test('hasMultipleFactories', () => {
      expect(store.hasMultipleFactories).toBe(false);
      store.factories = [{ id: 1 }, { id: 2 }];
      expect(store.hasMultipleFactories).toBe(true);
    });

    test('factoriesMap', () => {
      store.factories = [{ id: 1, name: 'F1' }, { id: 2, name: 'F2' }];
      expect(store.factoriesMap).toEqual({ 1: { id: 1, name: 'F1' }, 2: { id: 2, name: 'F2' } });
    });

    test('factoriesRealMap', () => {
      store.factories = [{ id: 1, name: 'F1' }];
      expect(store.factoriesRealMap).toEqual(new Map([[1, { id: 1, name: 'F1' }]]));
    });

    test('isLoading', () => {
      expect(store.isLoading).toBe(false);
      store.loading.push('loading');
      expect(store.isLoading).toBe(true);
    });

    test('factoriesWithWriteAccess - company admin', () => {
      store.factories = [{ id: 1 }, { id: 2 }, { id: 3 }];
      useProfileStore.mockReturnValue({ currentUser: { roles: { 0: COMPANY_ADMIN } } });
      expect(store.factoriesWithWriteAccess).toEqual(store.factories);
    });

    test('factoriesWithWriteAccess - factory admin', () => {
      store.factories = [{ id: 1 }, { id: 2 }, { id: 3 }];
      useProfileStore.mockReturnValue({ currentUser: { roles: { 1: FACTORY_ADMIN, 2: FACTORY_ADMIN } } });
      expect(store.factoriesWithWriteAccess).toEqual([{ id: 1 }, { id: 2 }]);
    });

    test('factoriesWithWriteAccess - factory admin + office', () => {
      store.factories = [{ id: 1 }, { id: 2 }, { id: 3 }];
      useProfileStore.mockReturnValue({ currentUser: { roles: { 1: FACTORY_ADMIN, 2: OFFICE_USER } } });
      expect(store.factoriesWithWriteAccess).toEqual([{ id: 1 }]);
    });

    test('getFactoryIdsByStationIds', () => {
      useProfileStore.mockReturnValue({
        currentUser: { roles: { 1: FACTORY_ADMIN, 2: OFFICE_USER } },
      });
      useStationStore.mockReturnValue({
        stationsRealMap: new Map([
          [1, { id: 1, factoryId: 1, name: 'packaging line' }],
          [2, { id: 2, factoryId: 2, name: 'labelling line' }],
          [3, { id: 3, factoryId: 1, name: 'bottling line' }],
          [4, { id: 4, factoryId: 3, name: 'another line' }],
          [5, { id: 5, factoryId: 2, name: 'last line' }],
        ]),
      });

      expect(store.getFactoryIdsByStationIds([])).toEqual([]);
      expect(store.getFactoryIdsByStationIds([1])).toEqual([1]);
      expect(store.getFactoryIdsByStationIds([1, 2])).toEqual([1, 2]);
      expect(store.getFactoryIdsByStationIds([1, 3])).toEqual([1]);
      expect(store.getFactoryIdsByStationIds([1, 4])).toEqual([1, 3]);
      expect(store.getFactoryIdsByStationIds([1, 6])).toEqual([1]);
      expect(store.getFactoryIdsByStationIds([5])).toEqual([2]);

      expect(store.getFactoryIdsByStationIds([], false)).toEqual([]);
      expect(store.getFactoryIdsByStationIds([1], false)).toEqual([1]);
      expect(store.getFactoryIdsByStationIds([1, 2], false)).toEqual([1]);
      expect(store.getFactoryIdsByStationIds([1, 3], false)).toEqual([1]);
      expect(store.getFactoryIdsByStationIds([1, 4], false)).toEqual([1]);
      expect(store.getFactoryIdsByStationIds([1, 6], false)).toEqual([1]);
      expect(store.getFactoryIdsByStationIds([5], false)).toEqual([]);
    });

    test('getOrderedFactoryNamesArrayByStationIds', () => {
      store.factories = [
        { id: 1, name: 'factory 1' },
        { id: 2, name: 'another factory' },
        { id: 4, name: 'factory 3' },
      ];
      useProfileStore.mockReturnValue({
        currentUser: { roles: { 0: COMPANY_ADMIN } },
      });
      useStationStore.mockReturnValue({
        stationsRealMap: new Map([
          [1, { id: 1, factoryId: 1 }],
          [2, { id: 2, factoryId: 2 }],
          [3, { id: 3, factoryId: 3 }],
        ]),
      });
      expect(store.getOrderedFactoryNamesArrayByStationIds([1, 2])).toEqual(['another factory', 'factory 1']);
    });
  });
});
