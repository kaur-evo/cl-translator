import { setActivePinia, createPinia } from 'pinia';

import useStationStore from '.';

import stationApi from '@/api/stationApi';
import { FACTORY_ADMIN, OFFICE_USER } from '@/constants/userRoles';
import useProfileStore from '@/stores/profile';
import useFactoryStore from '@/stores/factory';
import useGenericNotificationStore from '@/stores/genericNotification';
import useShiftStore from '@/stores/shift';

vi.mock('@/api/stationApi');

vi.mock('@/stores/profile', () => ({
  default: vi.fn(),
  __esModule: true,
}));

vi.mock('@/stores/factory', () => ({
  default: vi.fn(),
  __esModule: true,
}));

vi.mock('@/stores/genericNotification', () => ({
  default: vi.fn(),
  __esModule: true,
}));

vi.mock('@/stores/shift', () => ({
  default: vi.fn(),
  __esModule: true,
}));

const mockShiftStore = {
  setFirstShiftOfStation: vi.fn(),
};

const stationsResponse = [{ id: 1, name: 'station 1' }, { id: 2, name: 'station 2' }];

const mockNotificationStore = {
  notifyError: vi.fn(),
  notifyAdded: vi.fn(),
  notifyUpdated: vi.fn(),
  notifyDeleted: vi.fn(),
};

describe('useStationStore', () => {
  let store;

  beforeEach(() => {
    vi.clearAllMocks();
    setActivePinia(createPinia());
    store = useStationStore();
    stationApi.getStationList = vi.fn().mockResolvedValue(stationsResponse);
    useGenericNotificationStore.mockReturnValue(mockNotificationStore);
    useShiftStore.mockReturnValue(mockShiftStore);
  });

  test('initial state', () => {
    expect(store.stations).toEqual([]);
    expect(store.loading).toEqual([]);
    expect(store.stationGroups).toEqual([]);
    expect(store.lineviewStation).toEqual({});
  });

  describe('actions', () => {
    test('fetchStations when store value is empty', async () => {
      await store.fetchStations(false);
      expect(stationApi.getStationList).toHaveBeenCalledTimes(1);
      expect(store.stations).toEqual(stationsResponse);
      expect(store.loading).toEqual([]);
    });

    test('fetchStations when value is set to store, but update is forced', async () => {
      store.stations = [{ id: 1, name: 'station 1' }];
      await store.fetchStations(true);
      expect(stationApi.getStationList).toHaveBeenCalledTimes(1);
      expect(store.stations).toEqual(stationsResponse);
    });

    test('fetchStations when value is set to store and update is not forced', async () => {
      store.stations = [{ id: 1, name: 'station 1' }];
      await store.fetchStations();
      expect(stationApi.getStationList).toHaveBeenCalledTimes(0);
    });

    test('fetchStations when request returns error', async () => {
      const error = { response: { data: { message: 'error from request' } } };
      stationApi.getStationList = vi.fn().mockRejectedValue(error);
      await store.fetchStations();
      expect(store.loading).toEqual([]);
      expect(stationApi.getStationList).toHaveBeenCalledTimes(1);
    });

    test('saveStationGroup when group is new', async () => {
      const data = { name: 'group 1' };
      stationApi.postStationGroup = vi.fn().mockResolvedValue({ id: 1, name: 'group 1' });
      const result = await store.saveStationGroup(data);
      expect(stationApi.postStationGroup).toHaveBeenCalledWith(data);
      expect(result).toEqual({ id: 1, name: 'group 1' });
      expect(store.stationGroups).toEqual([{ id: 1, name: 'group 1' }]);
      expect(store.loading).toEqual([]);
    });

    test('saveStationGroup when group already exists', async () => {
      store.stationGroups = [{ id: 1, name: 'group 1' }];
      const data = { id: 1, name: 'group 1 updated' };
      stationApi.putStationGroup = vi.fn().mockResolvedValue({ id: 1, name: 'group 1 updated' });
      const result = await store.saveStationGroup(data);
      expect(stationApi.putStationGroup).toHaveBeenCalledWith(data);
      expect(result).toEqual({ id: 1, name: 'group 1 updated' });
      expect(store.loading).toEqual([]);
    });

    test('saveStationGroup when request returns error', async () => {
      const error = { response: { data: { message: 'error from request' } } };
      const data = { id: 1, name: 'group 1' };
      stationApi.putStationGroup = vi.fn().mockRejectedValue(error);
      await store.saveStationGroup(data);
      expect(store.loading).toEqual([]);
    });

    test('fetchStationGroups', async () => {
      const groups = [{ id: 1, name: 'group 1' }];
      stationApi.getStationGroupList = vi.fn().mockResolvedValue(groups);
      await store.fetchStationGroups();
      expect(store.stationGroups).toEqual(groups);
      expect(store.loading).toEqual([]);
    });

    test('fetchStationGroups with error', async () => {
      const error = { response: { data: { message: 'error from request' } } };
      stationApi.getStationGroupList = vi.fn().mockRejectedValue(error);
      await store.fetchStationGroups();
      expect(store.loading).toEqual([]);
    });

    test('deleteStationGroup', async () => {
      store.stationGroups = [{ id: 1, name: 'group 1' }, { id: 2, name: 'group 2' }];
      stationApi.deleteStationGroup = vi.fn().mockResolvedValue();
      await store.deleteStationGroup({ id: 1, name: 'group 1' });
      expect(stationApi.deleteStationGroup).toHaveBeenCalledWith(1);
      expect(store.stationGroups).toEqual([{ id: 2, name: 'group 2' }]);
      expect(store.loading).toEqual([]);
    });

    test('deleteStationGroup with error', async () => {
      const error = { response: { data: { message: 'error from request' } } };
      stationApi.deleteStationGroup = vi.fn().mockRejectedValue(error);
      await store.deleteStationGroup({ id: 1, name: 'group 1' });
      expect(store.loading).toEqual([]);
    });

    test('saveStation', async () => {
      const stationResponse = { id: 1, name: 'station 1 updated' };
      stationApi.putStation = vi.fn().mockResolvedValue(stationResponse);
      store.stations = [{ id: 1, name: 'station 1' }];
      const result = await store.saveStation({ id: 1, name: 'station 1 updated' });
      expect(stationApi.putStation).toHaveBeenCalledWith({ id: 1, name: 'station 1 updated' });
      expect(result).toEqual(stationResponse);
      expect(store.loading).toEqual([]);
    });

    test('saveStation with error', async () => {
      const error = { response: { data: { message: 'error from request' } } };
      stationApi.putStation = vi.fn().mockRejectedValue(error);
      await store.saveStation({ id: 1, name: 'station 1 updated' });
      expect(store.loading).toEqual([]);
    });

    test('setLineviewStation', () => {
      const station = { id: 1, name: 'station 1' };
      store.setLineviewStation(station);
      expect(store.lineviewStation).toEqual(station);
      expect(mockShiftStore.setFirstShiftOfStation).toHaveBeenCalledWith(station);
    });
  });

  describe('getters', () => {
    test('stationsMap', () => {
      store.stations = [{ id: 1, name: 'station 1' }, { id: 2, name: 'station 2' }];
      expect(store.stationsMap).toEqual({ 1: { id: 1, name: 'station 1' }, 2: { id: 2, name: 'station 2' } });
    });

    test('isLoading', () => {
      expect(store.isLoading).toBe(false);
      store.loading.push('loading');
      expect(store.isLoading).toBe(true);
    });

    test('stationsRealMap', () => {
      store.stations = [{ id: 1, name: 'station 1' }, { id: 2, name: 'station 2' }];
      expect(store.stationsRealMap).toEqual(new Map([[1, { id: 1, name: 'station 1' }], [2, { id: 2, name: 'station 2' }]]));
    });

    test('stationGroupsRealMap', () => {
      store.stationGroups = [{ id: 1, name: 'group 1' }, { id: 2, name: 'group 2' }];
      expect(store.stationGroupsRealMap).toEqual(new Map([[1, { id: 1, name: 'group 1' }], [2, { id: 2, name: 'group 2' }]]));
    });

    test('stationsWithAdminPermissions - company admin', () => {
      store.stations = [{ id: 1, factoryId: 1 }, { id: 2, factoryId: 2 }];
      useProfileStore.mockReturnValue({
        currentRoles: { 0: 'COMPANY_ADMIN' },
        currentUser: { roles: { 0: 'COMPANY_ADMIN' } },
      });
      expect(store.stationsWithAdminPermissions).toEqual(store.stations);
    });

    test('stationsWithAdminPermissions - factory admin', () => {
      store.stations = [{ id: 1, factoryId: 1 }, { id: 2, factoryId: 2 }];
      useProfileStore.mockReturnValue({
        currentRoles: { 1: FACTORY_ADMIN, 2: OFFICE_USER },
        currentUser: { roles: { 1: FACTORY_ADMIN, 2: OFFICE_USER } },
      });
      expect(store.stationsWithAdminPermissions).toEqual([{ id: 1, factoryId: 1 }]);
    });

    test('getDefaultStation - no id, no default', () => {
      store.stations = [{ id: 1, name: 'station 1' }, { id: 2, name: 'station 2' }];
      useProfileStore.mockReturnValue({
        currentUser: { defaultStationId: 0 },
      });
      expect(store.getDefaultStation()).toEqual({ id: 1, name: 'station 1' });
    });

    test('getDefaultStation - no id, with default', () => {
      store.stations = [{ id: 1, name: 'station 1' }, { id: 2, name: 'station 2' }];
      useProfileStore.mockReturnValue({
        currentUser: { defaultStationId: 2 },
      });
      expect(store.getDefaultStation()).toEqual({ id: 2, name: 'station 2' });
    });

    test('getDefaultStation - no id, default not found', () => {
      store.stations = [{ id: 1, name: 'station 1' }, { id: 2, name: 'station 2' }];
      useProfileStore.mockReturnValue({
        currentUser: { defaultStationId: 3 },
      });
      expect(store.getDefaultStation()).toEqual({ id: 1, name: 'station 1' });
    });

    test('getDefaultStation - with id', () => {
      store.stations = [{ id: 1, name: 'station 1' }, { id: 2, name: 'station 2' }];
      useProfileStore.mockReturnValue({
        currentUser: { defaultStationId: 0 },
      });
      expect(store.getDefaultStation(2)).toEqual({ id: 2, name: 'station 2' });
    });

    test('getDefaultStation - with id not found', () => {
      store.stations = [{ id: 1, name: 'station 1' }, { id: 2, name: 'station 2' }];
      useProfileStore.mockReturnValue({
        currentUser: { defaultStationId: 0 },
      });
      expect(store.getDefaultStation(3)).toEqual({ id: 1, name: 'station 1' });
    });

    test('getOrderedStationNamesArray', () => {
      store.stations = [
        { id: 1, name: 'testing station', factoryId: 1 },
        { id: 2, name: 'station for testing', factoryId: 2 },
      ];
      useProfileStore.mockReturnValue({
        currentUser: { roles: { 1: FACTORY_ADMIN, 2: OFFICE_USER } },
      });
      expect(store.getOrderedStationNamesArray([2, 1])).toEqual(['station for testing', 'testing station']);
      expect(store.getOrderedStationNamesArray([1, 2])).toEqual(['station for testing', 'testing station']);
      expect(store.getOrderedStationNamesArray([])).toEqual([]);

      expect(store.getOrderedStationNamesArray([2, 1], false)).toEqual(['testing station']);
      expect(store.getOrderedStationNamesArray([1, 2], false)).toEqual(['testing station']);
    });

    test('getStationDifference', () => {
      useFactoryStore.mockReturnValue({
        factories: [
          { id: 1, name: 'factory 1', stations: [{ id: 1 }, { id: 2 }] },
          { id: 2, name: 'factory 2', stations: [{ id: 3 }] },
          { id: 3, name: 'factory 3', stations: [{ id: 4 }, { id: 5 }] },
        ],
        factoriesMap: {
          1: { id: 1, name: 'factory 1', stations: [{ id: 1 }, { id: 2 }] },
          2: { id: 2, name: 'factory 2', stations: [{ id: 3 }] },
          3: { id: 3, name: 'factory 3', stations: [{ id: 4 }, { id: 5 }] },
        },
      });

      // initial and current groups are global
      expect(store.getStationDifference({ local: false }, { local: false }, [1, 2, 3])).toEqual([]);
      // initial group is global
      expect(store.getStationDifference({ local: false }, { local: true, factoryIds: [1] }, [1, 2, 4])).toEqual([4]);
      // current group is global
      expect(store.getStationDifference({ local: true, factoryIds: [1] }, { local: false }, [1, 2, 4])).toEqual([]);
      // nothing to remove
      expect(store.getStationDifference({ local: true, factoryIds: [1, 2] }, { local: true, factoryIds: [1, 2] }, [1, 2, 3])).toEqual([]);
      // stations to remove
      expect(store.getStationDifference({ local: true, factoryIds: [1, 2] }, { local: true, factoryIds: [1] }, [1, 2, 3])).toEqual([3]);
      expect(store.getStationDifference({ local: true, factoryIds: [1, 2, 3] }, { local: true, factoryIds: [1] }, [1, 3, 4, 5])).toEqual([3, 4, 5]);
    });

    test('getZoneIdByStationIds', () => {
      store.stations = [
        { id: 1, zoneId: 'Europe/Berlin' },
        { id: 2, zoneId: 'America/New_York' },
      ];
      expect(store.getZoneIdByStationIds([])).toBe('UTC');
      expect(store.getZoneIdByStationIds()).toBe('UTC');
      expect(store.getZoneIdByStationIds([1, 2])).toBe('Europe/Berlin');
      expect(store.getZoneIdByStationIds([2, 1])).toBe('America/New_York');
      expect(store.getZoneIdByStationIds([3])).toBe('UTC');
    });

    test('stationGroupsWithAdminPermissionsMap', () => {
      store.stationGroups = [{ id: 1, name: 'group 1' }, { id: 2, name: 'group 2' }];
      useProfileStore.mockReturnValue({
        currentRoles: { 0: 'COMPANY_ADMIN' },
      });
      expect(store.stationGroupsWithAdminPermissionsMap).toBeDefined();
    });
  });
});
