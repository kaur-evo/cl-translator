import { setActivePinia, createPinia } from 'pinia';

import usePerfCommentStore from './index';

import performanceCommentApi from '@/api/performanceCommentApi';
import performanceCommentGroupApi from '@/api/performanceCommentGroupApi';
import useProfileStore from '@/stores/profile';
import useStationStore from '@/stores/station';

const { mocks, storeMock } = vi.hoisted(() => {
  const notifyError = vi.fn();
  const notifyUpdated = vi.fn();
  const notifyAdded = vi.fn();
  const notifyDeleted = vi.fn();
  return {
    mocks: {
      notifyError,
      notifyUpdated,
      notifyAdded,
      notifyDeleted,
    },
    storeMock: (state) => ({ default: () => state, __esModule: true }),
  };
});

vi.mock('@/stores/genericNotification', () => storeMock({
  notifyError: mocks.notifyError,
  notifyUpdated: mocks.notifyUpdated,
  notifyAdded: mocks.notifyAdded,
  notifyDeleted: mocks.notifyDeleted,
}));

vi.mock('@/api/performanceCommentApi', () => ({
  default: {
    getPerformanceComments: vi.fn(),
    putPerformanceComment: vi.fn(),
    postPerformanceComment: vi.fn(),
    patchPerformanceComment: vi.fn(),
    deletePerformanceComment: vi.fn(),
  },
  __esModule: true,
}));

vi.mock('@/api/performanceCommentGroupApi', () => ({
  default: {
    getPerformanceCommentGroups: vi.fn(),
    patchPerformanceCommentGroup: vi.fn(),
    putPerformanceCommentGroup: vi.fn(),
    postPerformanceCommentGroup: vi.fn(),
    deletePerformanceCommentGroup: vi.fn(),
  },
  __esModule: true,
}));

vi.mock('@/services/i18n', () => ({
  default: { global: { t: (key) => key } },
  __esModule: true,
}));

describe('usePerfCommentStore', () => {
  let store;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = usePerfCommentStore();
    const profileStore = useProfileStore();
    const stationStore = useStationStore();
    profileStore.currentUser = { roles: { 0: 'COMPANY_ADMIN' } };
    stationStore.lineviewStation = { id: 1, factoryId: 1 };
    vi.clearAllMocks();
  });

  describe('state mutators', () => {
    test('startLoading pushes to loading array', () => {
      expect(store.loading).toHaveLength(0);
      store.startLoading();
      expect(store.loading).toHaveLength(1);
    });

    test('finishLoading pops from loading array', () => {
      store.startLoading();
      store.finishLoading();
      expect(store.loading).toHaveLength(0);
    });

    test('setPerfComments replaces perfCommentsList', () => {
      const comments = [{ id: 1, name: 'a' }, { id: 2, name: 'b' }];
      store.setPerfComments(comments);
      expect(store.perfCommentsList).toEqual(comments);
    });

    test('setPerfCommentGroups replaces perfCommentGroupsList', () => {
      const groups = [{ id: 10, name: 'g1' }];
      store.setPerfCommentGroups(groups);
      expect(store.perfCommentGroupsList).toEqual(groups);
    });
  });

  describe('actions', () => {
    test('markPerfCommentDeleted sets comment to deleted', () => {
      store.perfCommentsList = [{ id: 1, deleted: false, groupId: 1 }, { id: 2, deleted: true, groupId: 2 }, { id: 3, deleted: false, groupId: 1 }];
      store.markPerfCommentDeleted(3);
      expect(store.perfCommentsList.find((c) => c.id === 3).deleted).toBe(true);
    });

    test('markPerfCommentGroupDeleted sets group and its comments to deleted', () => {
      store.perfCommentsList = [{ id: 1, deleted: false, groupId: 11 }, { id: 2, deleted: false, groupId: 12 }];
      store.perfCommentGroupsList = [{ id: 11, deleted: false }, { id: 12, deleted: false }];
      store.markPerfCommentGroupDeleted(11);
      expect(store.perfCommentGroupsList.find((g) => g.id === 11).deleted).toBe(true);
      expect(store.perfCommentsList.find((c) => c.groupId === 11).deleted).toBe(true);
    });

    test('fetchPerfComments fetches and merges comments', async () => {
      const fetchedComments = [{ id: 1, name: 'c1', ordering: 0 }];
      performanceCommentApi.getPerformanceComments.mockResolvedValue(fetchedComments);
      await store.fetchPerfComments({ groupId: 1 });
      expect(performanceCommentApi.getPerformanceComments).toHaveBeenCalledWith({ groupId: 1 });
      expect(store.perfCommentsList).toEqual(fetchedComments);
    });

    test('fetchPerfComments handles null response as empty list', async () => {
      performanceCommentApi.getPerformanceComments.mockResolvedValue(null);
      await store.fetchPerfComments();
      expect(store.perfCommentsList).toEqual([]);
    });

    test('fetchAllPerfComments calls fetchPerfComments with includePredefined and includeDeleted flags', async () => {
      performanceCommentApi.getPerformanceComments.mockResolvedValue([]);
      await store.fetchAllPerfComments({ groupId: 5 });
      expect(performanceCommentApi.getPerformanceComments).toHaveBeenCalledWith({
        groupId: 5,
        includePredefined: true,
        includeDeleted: true,
      });
    });

    test('updatePerfCommentOrder patches comment order and fetches for that group', async () => {
      performanceCommentApi.patchPerformanceComment.mockResolvedValue({});
      performanceCommentApi.getPerformanceComments.mockResolvedValue([]);
      await store.updatePerfCommentOrder({ id: 1, groupId: 3 });
      expect(performanceCommentApi.patchPerformanceComment).toHaveBeenCalledWith({ id: 1, groupId: 3 });
      expect(performanceCommentApi.getPerformanceComments).toHaveBeenCalledWith({ groupId: 3 });
    });

    describe('savePerfComment', () => {
      test('creates a new comment with POST and notifies added', async () => {
        const newComment = { primaryName: 'New', id: 10 };
        performanceCommentApi.postPerformanceComment.mockResolvedValue(newComment);
        performanceCommentApi.getPerformanceComments.mockResolvedValue([newComment]);

        const result = await store.savePerfComment({ name: 'New' });

        expect(performanceCommentApi.postPerformanceComment).toHaveBeenCalledWith({ name: 'New' });
        expect(mocks.notifyAdded).toHaveBeenCalledWith('New');
        expect(result).toEqual(newComment);
      });

      test('updates an existing comment with PUT and notifies updated', async () => {
        const updatedComment = { id: 5, primaryName: 'Updated' };
        performanceCommentApi.putPerformanceComment.mockResolvedValue(updatedComment);
        performanceCommentApi.getPerformanceComments.mockResolvedValue([updatedComment]);

        const result = await store.savePerfComment({ id: 5, name: 'Updated' });

        expect(performanceCommentApi.putPerformanceComment).toHaveBeenCalledWith({ id: 5, name: 'Updated' });
        expect(mocks.notifyUpdated).toHaveBeenCalledWith('Updated');
        expect(result).toEqual(updatedComment);
      });

      test('notifies error and returns error on API failure', async () => {
        const error = { response: { data: { message: 'Save failed' } } };
        performanceCommentApi.postPerformanceComment.mockRejectedValue(error);

        const result = await store.savePerfComment({ name: 'Bad' });

        expect(mocks.notifyError).toHaveBeenCalledWith('Save failed');
        expect(result).toEqual(error);
        expect(store.isLoading).toBe(false);
      });
    });

    test('deletePerfComment deletes and marks comment deleted', async () => {
      store.perfCommentsList = [{ id: 7, deleted: false, groupId: 1 }];
      performanceCommentApi.deletePerformanceComment.mockResolvedValue({});

      await store.deletePerfComment({ id: 7, primaryName: 'Comm' });

      expect(performanceCommentApi.deletePerformanceComment).toHaveBeenCalledWith(7);
      expect(mocks.notifyDeleted).toHaveBeenCalledWith('Comm');
      expect(store.perfCommentsList.find((c) => c.id === 7).deleted).toBe(true);
    });

    test('fetchPerfCommentGroups fetches and merges groups', async () => {
      const fetchedGroups = [{ id: 10, name: 'g1', ordering: 0 }];
      performanceCommentGroupApi.getPerformanceCommentGroups.mockResolvedValue(fetchedGroups);

      await store.fetchPerfCommentGroups({ factoryId: 2 });

      expect(performanceCommentGroupApi.getPerformanceCommentGroups).toHaveBeenCalledWith({
        factoryId: 2,
        includeDeleted: true,
      });
      expect(store.perfCommentGroupsList).toEqual(fetchedGroups);
    });

    test('fetchPerfCommentGroups handles null response as empty list', async () => {
      performanceCommentGroupApi.getPerformanceCommentGroups.mockResolvedValue(null);
      await store.fetchPerfCommentGroups();
      expect(store.perfCommentGroupsList).toEqual([]);
    });

    test('updatePerfCommentGroupOrder patches group order and refetches groups', async () => {
      performanceCommentGroupApi.patchPerformanceCommentGroup.mockResolvedValue({});
      performanceCommentGroupApi.getPerformanceCommentGroups.mockResolvedValue([]);

      await store.updatePerfCommentGroupOrder({ id: 2 });

      expect(performanceCommentGroupApi.patchPerformanceCommentGroup).toHaveBeenCalledWith({ id: 2 });
      expect(performanceCommentGroupApi.getPerformanceCommentGroups).toHaveBeenCalled();
    });

    describe('savePerfCommentGroup', () => {
      test('creates a new group with POST and notifies added', async () => {
        const newGroup = { id: 20, primaryName: 'GroupA' };
        performanceCommentGroupApi.postPerformanceCommentGroup.mockResolvedValue(newGroup);
        performanceCommentGroupApi.getPerformanceCommentGroups.mockResolvedValue([newGroup]);

        const result = await store.savePerfCommentGroup({ name: 'GroupA' });

        expect(performanceCommentGroupApi.postPerformanceCommentGroup).toHaveBeenCalledWith({ name: 'GroupA' });
        expect(mocks.notifyAdded).toHaveBeenCalledWith('GroupA');
        expect(result).toEqual(newGroup);
      });

      test('updates an existing group with PUT and notifies updated', async () => {
        const updatedGroup = { id: 20, primaryName: 'GroupB' };
        performanceCommentGroupApi.putPerformanceCommentGroup.mockResolvedValue(updatedGroup);
        performanceCommentGroupApi.getPerformanceCommentGroups.mockResolvedValue([updatedGroup]);

        const result = await store.savePerfCommentGroup({ id: 20, name: 'GroupB' });

        expect(performanceCommentGroupApi.putPerformanceCommentGroup).toHaveBeenCalledWith({ id: 20, name: 'GroupB' });
        expect(mocks.notifyUpdated).toHaveBeenCalledWith('GroupB');
        expect(result).toEqual(updatedGroup);
      });

      test('notifies error and returns error on API failure', async () => {
        const error = { response: { data: { message: 'Group save failed' } } };
        performanceCommentGroupApi.postPerformanceCommentGroup.mockRejectedValue(error);

        const result = await store.savePerfCommentGroup({ name: 'Bad Group' });

        expect(mocks.notifyError).toHaveBeenCalledWith('Group save failed');
        expect(result).toEqual(error);
        expect(store.isLoading).toBe(false);
      });
    });

    describe('deletePerfCommentGroup', () => {
      test('deletes and marks group and its comments deleted', async () => {
        store.perfCommentsList = [{ id: 1, deleted: false, groupId: 30 }];
        store.perfCommentGroupsList = [{ id: 30, deleted: false }];
        performanceCommentGroupApi.deletePerformanceCommentGroup.mockResolvedValue({});

        await store.deletePerfCommentGroup({ id: 30, primaryName: 'GrpX' });

        expect(performanceCommentGroupApi.deletePerformanceCommentGroup).toHaveBeenCalledWith(30);
        expect(mocks.notifyDeleted).toHaveBeenCalledWith('GrpX');
        expect(store.perfCommentGroupsList.find((g) => g.id === 30).deleted).toBe(true);
        expect(store.perfCommentsList.find((c) => c.groupId === 30).deleted).toBe(true);
      });

      test('notifies error on API failure', async () => {
        const error = { response: { data: { message: 'Delete group failed' } } };
        performanceCommentGroupApi.deletePerformanceCommentGroup.mockRejectedValue(error);

        await store.deletePerfCommentGroup({ id: 99, primaryName: 'GrpY' });

        expect(mocks.notifyError).toHaveBeenCalledWith('Delete group failed');
        expect(store.isLoading).toBe(false);
      });
    });
  });

  describe('getters', () => {
    test('perfCommentGroups excludes deleted groups', () => {
      store.perfCommentGroupsList = [{ id: 11, deleted: false }, { id: 12, deleted: true }, { id: 13, deleted: false }];
      expect(store.perfCommentGroups).toEqual([{ id: 11, deleted: false }, { id: 13, deleted: false }]);
    });

    test('perfComments excludes deleted comments', () => {
      store.perfCommentsList = [
        { id: 1, deleted: false },
        { id: 2, deleted: true },
        { id: 3, deleted: false },
      ];
      expect(store.perfComments.map((c) => c.id)).toEqual([1, 3]);
    });

    test('allPerfComments returns full list including deleted', () => {
      store.perfCommentsList = [{ id: 1, deleted: false }, { id: 2, deleted: true }];
      expect(store.allPerfComments).toHaveLength(2);
    });

    test('perfCommentsMap keys comments by id', () => {
      store.perfCommentsList = [{ id: 1, name: 'a' }, { id: 2, name: 'b' }];
      expect(store.perfCommentsMap[1]).toEqual({ id: 1, name: 'a' });
      expect(store.perfCommentsMap[2]).toEqual({ id: 2, name: 'b' });
    });

    test('allPerfCommentsMap includes uncommented entry keyed by UNCOMMENTED_ID', () => {
      store.perfCommentsList = [{ id: 1, name: 'a', deleted: false }];
      const map = store.allPerfCommentsMap;
      expect(map[1]).toEqual({ id: 1, name: 'a', deleted: false });
      // UNCOMMENTED_ID = 0
      expect(map[0]).toBeDefined();
      expect(map[0].id).toBe(0);
    });

    test('perfCommentsRealMap is a Map keyed by comment id', () => {
      store.perfCommentsList = [{ id: 5, name: 'x' }];
      expect(store.perfCommentsRealMap.get(5)).toEqual({ id: 5, name: 'x' });
    });

    test('perfCommentGroupsWithAdminPermissions returns groups filtered by profile roles', () => {
      // currentRoles is a getter derived from currentUser.roles; set state directly
      const profileStore = useProfileStore();
      profileStore.currentUser = { roles: { 0: 'COMPANY_ADMIN' } };
      store.perfCommentGroupsList = [
        { id: 11, deleted: false, factoryIds: [1], local: true },
        { id: 12, deleted: false, factoryIds: [2], local: false },
      ];
      expect(store.perfCommentGroupsWithAdminPermissions).toHaveLength(2);
    });

    test('perfCommentGroupsWithAdminPermissionsMap keys groups by id', () => {
      // currentRoles is a getter derived from currentUser.roles; set state directly
      const profileStore = useProfileStore();
      profileStore.currentUser = { roles: { 0: 'COMPANY_ADMIN' } };
      store.perfCommentGroupsList = [
        { id: 11, deleted: false, factoryIds: [1], local: false },
      ];
      const map = store.perfCommentGroupsWithAdminPermissionsMap;
      expect(map[11]).toBeDefined();
    });

    test('perfCommentGroupsMap keys all groups by id', () => {
      store.perfCommentGroupsList = [{ id: 11, deleted: false }, { id: 12, deleted: true }];
      expect(store.perfCommentGroupsMap[11]).toBeDefined();
      expect(store.perfCommentGroupsMap[12]).toBeDefined();
    });

    test('perfCommentGroupsRealMap is a Map keyed by group id', () => {
      store.perfCommentGroupsList = [{ id: 11, deleted: false }];
      expect(store.perfCommentGroupsRealMap.get(11)).toEqual({ id: 11, deleted: false });
    });

    test('perfCommentGroupsWithOrdering adds ordering field from group name', () => {
      store.perfCommentGroupsList = [{ id: 11, deleted: false, name: 'Alpha' }];
      const result = store.perfCommentGroupsWithOrdering;
      expect(result[0].ordering).toBe('Alpha');
    });

    test('menuPerfComments prepends uncommented entry to perfComments', () => {
      store.perfCommentsList = [{ id: 1, deleted: false, name: 'C1' }];
      const menu = store.menuPerfComments;
      expect(menu[0].id).toBe(0); // UNCOMMENTED_ID
      expect(menu[1].id).toBe(1);
    });

    test('menuPerfCommentGroups prepends uncommentedGroup to groups with ordering', () => {
      store.perfCommentGroupsList = [{ id: 11, deleted: false, name: 'G1' }];
      const menu = store.menuPerfCommentGroups;
      expect(menu[0].id).toBe(-1); // uncommentedGroup id
      expect(menu[1].id).toBe(11);
    });

    test('uncommentedGroup has id -1 and translated name', () => {
      const group = store.uncommentedGroup;
      expect(group.id).toBe(-1);
      expect(group.name).toBe('Uncommented');
      expect(group.ordering).toBe(-1);
    });

    test('uncommented has UNCOMMENTED_ID and translated name', () => {
      const uc = store.uncommented;
      expect(uc.id).toBe(0); // UNCOMMENTED_ID
      expect(uc.name).toBe('Uncommented');
      expect(uc.primaryName).toBe('Uncommented');
      expect(uc.groupId).toBe(-1);
    });

    test('shiftviewStationPerfCommentGroups returns groups from shiftview comments', () => {
      store.perfCommentsList = [
        {
          id: 1, stationIds: [1], deleted: false, groupId: 11,
        },
        {
          id: 2, stationIds: [1], deleted: false, groupId: 12,
        },
        {
          id: 4, stationIds: [1], deleted: false, groupId: 11,
        },
      ];
      store.perfCommentGroupsList = [
        { id: 11, deleted: false, factoryIds: [1], local: true },
        { id: 12, deleted: false, factoryIds: [1], local: true },
        { id: 13, deleted: false, factoryIds: [], local: false },
      ];
      expect(store.shiftviewStationPerfCommentGroups.map((g) => g.id)).toEqual([11, 12]);
    });

    test('shiftviewStationPerfComments excludes comments for other stations', () => {
      store.perfCommentsList = [
        {
          id: 1, stationIds: [2], deleted: false, groupId: 11,
        },
        {
          id: 2, stationIds: [1], deleted: false, groupId: 11,
        },
      ];
      store.perfCommentGroupsList = [{ id: 11, deleted: false, factoryIds: [1], local: true }];
      expect(store.shiftviewStationPerfComments.map((c) => c.id)).toEqual([2]);
    });

    test('shiftviewStationPerfComments excludes comments whose group is not found', () => {
      store.perfCommentsList = [
        {
          id: 1, stationIds: [1], deleted: false, groupId: 999,
        },
      ];
      store.perfCommentGroupsList = [];
      expect(store.shiftviewStationPerfComments).toHaveLength(0);
    });

    test('shiftviewStationPerfComments includes non-local group comments from any factory', () => {
      store.perfCommentsList = [
        {
          id: 1, stationIds: [1], deleted: false, groupId: 11,
        },
      ];
      store.perfCommentGroupsList = [{ id: 11, deleted: false, factoryIds: [], local: false }];
      expect(store.shiftviewStationPerfComments.map((c) => c.id)).toEqual([1]);
    });

    test('isLoading', () => {
      expect(store.isLoading).toBe(false);
      store.loading.push('loading');
      expect(store.isLoading).toBe(true);
    });
  });
});
