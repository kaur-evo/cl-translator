import { setActivePinia, createPinia } from 'pinia';

import useScrapReasonStore from './index';

import scrapReasonApi from '@/api/scrapReasonApi';
import useProfileStore from '@/stores/profile';
import useStationStore from '@/stores/station';

const { mocks, storeMock } = vi.hoisted(() => {
  const notifyError = vi.fn();
  const notifyUpdated = vi.fn();
  const notifyAdded = vi.fn();
  const notifyDeleted = vi.fn();
  return {
    mocks: { notifyError, notifyUpdated, notifyAdded, notifyDeleted },
    storeMock: (state) => ({ default: () => state, __esModule: true }),
  };
});

vi.mock('@/stores/genericNotification', () => storeMock({
  notifyError: mocks.notifyError,
  notifyUpdated: mocks.notifyUpdated,
  notifyAdded: mocks.notifyAdded,
  notifyDeleted: mocks.notifyDeleted,
}));

vi.mock('@/api/scrapReasonApi', () => ({
  default: {
    getScrapReasons: vi.fn(),
    putScrapReason: vi.fn(),
    postScrapReason: vi.fn(),
    patchScrapReason: vi.fn(),
    deleteScrapReason: vi.fn(),
    getScrapReasonGroups: vi.fn(),
    patchScrapReasonGroup: vi.fn(),
    putScrapReasonGroup: vi.fn(),
    postScrapReasonGroup: vi.fn(),
    deleteScrapReasonGroup: vi.fn(),
  },
  __esModule: true,
}));

vi.mock('@/services/i18n', () => ({
  default: { global: { t: (key) => key } },
  __esModule: true,
}));

describe('useScrapReasonStore', () => {
  let store;

  beforeEach(() => {
    vi.clearAllMocks();
    setActivePinia(createPinia());
    store = useScrapReasonStore();
    const profileStore = useProfileStore();
    const stationStore = useStationStore();
    // currentRoles is a computed getter derived from currentUser.roles — set the source state
    profileStore.currentUser = { roles: { 0: 'admin' } };
    stationStore.lineviewStation = { id: 1, factoryId: 1 };
  });

  // ─── State-mutating actions ───────────────────────────────────────────────

  test('startLoading pushes to loading array', () => {
    expect(store.loading).toHaveLength(0);
    store.startLoading();
    expect(store.loading).toHaveLength(1);
  });

  test('finishLoading pops from loading array', () => {
    store.loading = ['loading'];
    store.finishLoading();
    expect(store.loading).toHaveLength(0);
  });

  test('setScrapReasons replaces scrapReasonsList', () => {
    const reasons = [{ id: 1 }, { id: 2 }];
    store.setScrapReasons(reasons);
    expect(store.scrapReasonsList).toEqual(reasons);
  });

  test('setScrapReasonGroups replaces scrapReasonGroupsList', () => {
    const groups = [{ id: 10 }, { id: 20 }];
    store.setScrapReasonGroups(groups);
    expect(store.scrapReasonGroupsList).toEqual(groups);
  });

  test('markScrapReasonDeleted sets reason to deleted', () => {
    store.scrapReasonsList = [{ id: 1, deleted: false }, { id: 2, deleted: false }, { id: 3, deleted: false }];
    store.markScrapReasonDeleted(3);
    expect(store.scrapReasonsList.find((r) => r.id === 3).deleted).toBe(true);
  });

  test('markScrapReasonGroupDeleted sets group and its reasons to deleted', () => {
    store.scrapReasonsList = [{ id: 1, deleted: false, groupId: 11 }, { id: 2, deleted: false, groupId: 12 }];
    store.scrapReasonGroupsList = [{ id: 11, deleted: false }, { id: 12, deleted: false }];
    store.markScrapReasonGroupDeleted(11);
    expect(store.scrapReasonGroupsList.find((g) => g.id === 11).deleted).toBe(true);
    expect(store.scrapReasonsList.find((r) => r.groupId === 11).deleted).toBe(true);
  });

  // ─── fetchScrapReasons ────────────────────────────────────────────────────

  test('fetchScrapReasons calls API and updates scrapReasonsList', async () => {
    const reasons = [{ id: 1, ordering: 1 }];
    scrapReasonApi.getScrapReasons.mockResolvedValue(reasons);
    await store.fetchScrapReasons({ stationId: 1 });
    expect(scrapReasonApi.getScrapReasons).toHaveBeenCalledWith({ stationId: 1 });
    expect(store.scrapReasonsList).toEqual(reasons);
  });

  test('fetchScrapReasons falls back to empty array when API returns falsy', async () => {
    scrapReasonApi.getScrapReasons.mockResolvedValue(null);
    await store.fetchScrapReasons();
    expect(store.scrapReasonsList).toEqual([]);
  });

  // ─── fetchAllScrapReasons ─────────────────────────────────────────────────

  test('fetchAllScrapReasons delegates to fetchScrapReasons with extra params', async () => {
    scrapReasonApi.getScrapReasons.mockResolvedValue([]);
    await store.fetchAllScrapReasons({ stationId: 2 });
    expect(scrapReasonApi.getScrapReasons).toHaveBeenCalledWith(
      expect.objectContaining({ stationId: 2, includePredefined: true, includeDeleted: true }),
    );
  });

  // ─── saveScrapReason (PUT / update) ──────────────────────────────────────

  test('saveScrapReason with id calls putScrapReason and notifies updated', async () => {
    const updated = { id: 5, primaryName: 'Broken' };
    scrapReasonApi.putScrapReason.mockResolvedValue(updated);
    scrapReasonApi.getScrapReasons.mockResolvedValue([updated]);

    const result = await store.saveScrapReason({ id: 5, primaryName: 'Broken' });

    expect(scrapReasonApi.putScrapReason).toHaveBeenCalledWith({ id: 5, primaryName: 'Broken' });
    expect(mocks.notifyUpdated).toHaveBeenCalledWith('Broken');
    expect(result).toEqual(updated);
  });

  // ─── saveScrapReason (POST / create) ─────────────────────────────────────

  test('saveScrapReason without id calls postScrapReason and notifies added', async () => {
    const created = { id: 99, primaryName: 'New Reason' };
    scrapReasonApi.postScrapReason.mockResolvedValue(created);
    scrapReasonApi.getScrapReasons.mockResolvedValue([created]);

    const result = await store.saveScrapReason({ primaryName: 'New Reason' });

    expect(scrapReasonApi.postScrapReason).toHaveBeenCalledWith({ primaryName: 'New Reason' });
    expect(mocks.notifyAdded).toHaveBeenCalledWith('New Reason');
    expect(result).toEqual(created);
  });

  // ─── saveScrapReason (error) ──────────────────────────────────────────────

  test('saveScrapReason notifies error and returns error on API failure', async () => {
    const apiError = { response: { data: { message: 'Save failed' } } };
    scrapReasonApi.postScrapReason.mockRejectedValue(apiError);

    const result = await store.saveScrapReason({ primaryName: 'Bad' });

    expect(mocks.notifyError).toHaveBeenCalledWith('Save failed');
    expect(result).toEqual(apiError);
  });

  // ─── updateScrapReasonOrder ───────────────────────────────────────────────

  test('updateScrapReasonOrder patches and refreshes reasons by groupId', async () => {
    scrapReasonApi.patchScrapReason.mockResolvedValue({});
    scrapReasonApi.getScrapReasons.mockResolvedValue([]);

    await store.updateScrapReasonOrder({ id: 3, groupId: 7 });

    expect(scrapReasonApi.patchScrapReason).toHaveBeenCalledWith({ id: 3, groupId: 7 });
    expect(scrapReasonApi.getScrapReasons).toHaveBeenCalledWith(expect.objectContaining({ groupId: 7 }));
  });

  // ─── deleteScrapReason ────────────────────────────────────────────────────

  test('deleteScrapReason calls API, notifies deleted and marks reason deleted', async () => {
    store.scrapReasonsList = [{ id: 4, deleted: false, primaryName: 'Jam' }];
    scrapReasonApi.deleteScrapReason.mockResolvedValue({});

    await store.deleteScrapReason({ id: 4, primaryName: 'Jam' });

    expect(scrapReasonApi.deleteScrapReason).toHaveBeenCalledWith(4);
    expect(mocks.notifyDeleted).toHaveBeenCalledWith('Jam');
    expect(store.scrapReasonsList.find((r) => r.id === 4).deleted).toBe(true);
  });

  // ─── fetchScrapReasonGroups ───────────────────────────────────────────────

  test('fetchScrapReasonGroups calls API and updates scrapReasonGroupsList', async () => {
    const groups = [{ id: 10, ordering: 1 }];
    scrapReasonApi.getScrapReasonGroups.mockResolvedValue(groups);

    await store.fetchScrapReasonGroups({ factoryId: 2 });

    expect(scrapReasonApi.getScrapReasonGroups).toHaveBeenCalledWith(
      expect.objectContaining({ factoryId: 2, includeDeleted: true }),
    );
    expect(store.scrapReasonGroupsList).toEqual(groups);
  });

  test('fetchScrapReasonGroups falls back to empty array when API returns falsy', async () => {
    scrapReasonApi.getScrapReasonGroups.mockResolvedValue(null);
    await store.fetchScrapReasonGroups();
    expect(store.scrapReasonGroupsList).toEqual([]);
  });

  // ─── updateScrapReasonGroupOrder ──────────────────────────────────────────

  test('updateScrapReasonGroupOrder patches and refreshes groups', async () => {
    scrapReasonApi.patchScrapReasonGroup.mockResolvedValue({});
    scrapReasonApi.getScrapReasonGroups.mockResolvedValue([]);

    await store.updateScrapReasonGroupOrder({ id: 10 });

    expect(scrapReasonApi.patchScrapReasonGroup).toHaveBeenCalledWith({ id: 10 });
    expect(scrapReasonApi.getScrapReasonGroups).toHaveBeenCalled();
  });

  // ─── saveScrapReasonGroup (PUT / update) ─────────────────────────────────

  test('saveScrapReasonGroup with id calls putScrapReasonGroup and notifies updated', async () => {
    const updated = { id: 20, primaryName: 'Group A' };
    scrapReasonApi.putScrapReasonGroup.mockResolvedValue(updated);
    scrapReasonApi.getScrapReasonGroups.mockResolvedValue([updated]);

    const result = await store.saveScrapReasonGroup({ id: 20, primaryName: 'Group A' });

    expect(scrapReasonApi.putScrapReasonGroup).toHaveBeenCalledWith({ id: 20, primaryName: 'Group A' });
    expect(mocks.notifyUpdated).toHaveBeenCalledWith('Group A');
    expect(result).toEqual(updated);
  });

  // ─── saveScrapReasonGroup (POST / create) ────────────────────────────────

  test('saveScrapReasonGroup without id calls postScrapReasonGroup and notifies added', async () => {
    const created = { id: 55, primaryName: 'New Group' };
    scrapReasonApi.postScrapReasonGroup.mockResolvedValue(created);
    scrapReasonApi.getScrapReasonGroups.mockResolvedValue([created]);

    const result = await store.saveScrapReasonGroup({ primaryName: 'New Group' });

    expect(scrapReasonApi.postScrapReasonGroup).toHaveBeenCalledWith({ primaryName: 'New Group' });
    expect(mocks.notifyAdded).toHaveBeenCalledWith('New Group');
    expect(result).toEqual(created);
  });

  // ─── saveScrapReasonGroup (error) ────────────────────────────────────────

  test('saveScrapReasonGroup notifies error and returns error on API failure', async () => {
    const apiError = { response: { data: { message: 'Group save failed' } } };
    scrapReasonApi.postScrapReasonGroup.mockRejectedValue(apiError);

    const result = await store.saveScrapReasonGroup({ primaryName: 'Bad Group' });

    expect(mocks.notifyError).toHaveBeenCalledWith('Group save failed');
    expect(result).toEqual(apiError);
  });

  // ─── deleteScrapReasonGroup (happy path) ─────────────────────────────────

  test('deleteScrapReasonGroup calls API, notifies deleted and marks group deleted', async () => {
    store.scrapReasonGroupsList = [{ id: 30, deleted: false }];
    store.scrapReasonsList = [{ id: 1, groupId: 30, deleted: false }];
    scrapReasonApi.deleteScrapReasonGroup.mockResolvedValue({});

    await store.deleteScrapReasonGroup({ id: 30, primaryName: 'Old Group' });

    expect(scrapReasonApi.deleteScrapReasonGroup).toHaveBeenCalledWith(30);
    expect(mocks.notifyDeleted).toHaveBeenCalledWith('Old Group');
    expect(store.scrapReasonGroupsList.find((g) => g.id === 30).deleted).toBe(true);
    expect(store.scrapReasonsList.find((r) => r.groupId === 30).deleted).toBe(true);
  });

  // ─── deleteScrapReasonGroup (error) ──────────────────────────────────────

  test('deleteScrapReasonGroup notifies error when API fails', async () => {
    const apiError = { response: { data: { message: 'Delete failed' } } };
    scrapReasonApi.deleteScrapReasonGroup.mockRejectedValue(apiError);

    await store.deleteScrapReasonGroup({ id: 99, primaryName: 'Ghost Group' });

    expect(mocks.notifyError).toHaveBeenCalledWith('Delete failed');
  });

  // ─── Getters ──────────────────────────────────────────────────────────────

  test('scrapReasons excludes deleted entries', () => {
    store.scrapReasonsList = [
      { id: 1, deleted: false },
      { id: 2, deleted: true },
      { id: 3, deleted: false },
    ];
    expect(store.scrapReasons.map((r) => r.id)).toEqual([1, 3]);
  });

  test('allScrapReasons returns entire list including deleted', () => {
    store.scrapReasonsList = [{ id: 1, deleted: false }, { id: 2, deleted: true }];
    expect(store.allScrapReasons).toHaveLength(2);
  });

  test('scrapReasonsMap returns object keyed by id', () => {
    store.scrapReasonsList = [{ id: 1, name: 'A' }, { id: 2, name: 'B' }];
    expect(store.scrapReasonsMap[1]).toEqual({ id: 1, name: 'A' });
    expect(store.scrapReasonsMap[2]).toEqual({ id: 2, name: 'B' });
  });

  test('scrapReasonsRealMap returns a Map keyed by id', () => {
    store.scrapReasonsList = [{ id: 1, name: 'A' }, { id: 2, name: 'B' }];
    expect(store.scrapReasonsRealMap).toBeInstanceOf(Map);
    expect(store.scrapReasonsRealMap.get(1)).toEqual({ id: 1, name: 'A' });
  });

  test('scrapReasonGroupsMap returns object keyed by id', () => {
    store.scrapReasonGroupsList = [{ id: 10, name: 'G1' }, { id: 20, name: 'G2' }];
    expect(store.scrapReasonGroupsMap[10]).toEqual({ id: 10, name: 'G1' });
  });

  test('scrapReasonGroupsRealMap returns a Map keyed by id', () => {
    store.scrapReasonGroupsList = [{ id: 10, name: 'G1' }];
    expect(store.scrapReasonGroupsRealMap).toBeInstanceOf(Map);
    expect(store.scrapReasonGroupsRealMap.get(10)).toEqual({ id: 10, name: 'G1' });
  });

  test('scrapReasonGroups excludes deleted groups', () => {
    store.scrapReasonGroupsList = [{ id: 11, deleted: false }, { id: 12, deleted: true }, { id: 13, deleted: false }];
    expect(store.scrapReasonGroups).toEqual([{ id: 11, deleted: false }, { id: 13, deleted: false }]);
  });

  test('scrapReasonGroupsWithAdminPermissions returns groups with admin roles', () => {
    store.scrapReasonGroupsList = [
      { id: 10, deleted: false, local: false, factoryIds: [] },
      { id: 20, deleted: false, local: true, factoryIds: [5] },
    ];
    // getGroupsWithAdminPermissions: if 0 in roles → returns all groups
    expect(store.scrapReasonGroupsWithAdminPermissions).toHaveLength(2);
  });

  test('scrapReasonGroupsWithAdminPermissionsMap returns object keyed by id', () => {
    store.scrapReasonGroupsList = [
      { id: 10, deleted: false, local: false, factoryIds: [] },
    ];
    const map = store.scrapReasonGroupsWithAdminPermissionsMap;
    expect(map[10]).toBeDefined();
  });

  test('scrapReasonGroupsWithOrdering adds ordering field from name', () => {
    store.scrapReasonGroupsList = [{ id: 10, deleted: false, name: 'GroupAlpha', factoryIds: [] }];
    const result = store.scrapReasonGroupsWithOrdering;
    expect(result[0].ordering).toBe('GroupAlpha');
  });

  test('scrapReasonGroupsInclUncommented prepends uncommentedGroup', () => {
    store.scrapReasonGroupsList = [{ id: 10, deleted: false, name: 'G1', factoryIds: [] }];
    const result = store.scrapReasonGroupsInclUncommented;
    expect(result[0].id).toBe(-1);
    expect(result[0].name).toBe('Uncommented');
    expect(result).toHaveLength(2);
  });

  test('isLoading is true when loading array is non-empty', () => {
    store.loading = ['loading'];
    expect(store.isLoading).toBe(true);
  });

  test('isLoading is false when loading array is empty', () => {
    store.loading = [];
    expect(store.isLoading).toBe(false);
  });

  test('shiftviewStationScrapReasons filters by station and factory', () => {
    store.scrapReasonsList = [
      { id: 1, stationIds: [1, 2], groupId: 1, deleted: false },
      { id: 2, stationIds: [1, 2], groupId: 2, deleted: false },
      { id: 3, stationIds: [3, 4], groupId: 1, deleted: false },
    ];
    store.scrapReasonGroupsList = [
      { id: 1, factoryIds: [], local: false },
      { id: 2, factoryIds: [1], local: true },
    ];
    expect(store.shiftviewStationScrapReasons.map((r) => r.id)).toEqual([1, 2]);
  });

  test('shiftviewStationScrapReasons excludes reasons whose group is missing', () => {
    store.scrapReasonsList = [
      { id: 5, stationIds: [1], groupId: 999, deleted: false },
    ];
    store.scrapReasonGroupsList = [];
    expect(store.shiftviewStationScrapReasons).toEqual([]);
  });

  test('uncommentedGroup returns object with id -1 and i18n name', () => {
    expect(store.uncommentedGroup.id).toBe(-1);
    expect(store.uncommentedGroup.name).toBe('Uncommented');
    expect(store.uncommentedGroup.ordering).toBe(-1);
    expect(store.uncommentedGroup.factoryIds).toEqual([]);
  });
});
