import { setActivePinia, createPinia } from 'pinia';

import useCommentStore from './index';

import useGenericNotificationStore from '@/stores/genericNotification';
import useProfileStore from '@/stores/profile';
import useStationStore from '@/stores/station';
import commentApi from '@/api/commentApi';

vi.mock('@/api/commentApi', () => ({
  default: {
    getComments: vi.fn(),
    putComment: vi.fn(),
    postComment: vi.fn(),
    patchComment: vi.fn(),
    deleteComment: vi.fn(),
    getCommentGroups: vi.fn(),
    updateCommentGroupOrder: vi.fn(),
    putCommentGroup: vi.fn(),
    postCommentGroup: vi.fn(),
    deleteCommentGroup: vi.fn(),
  },
  __esModule: true,
}));

vi.mock('@/services/i18n', () => ({
  default: { global: { t: (key) => key } },
  __esModule: true,
}));

describe('useCommentStore', () => {
  let store;
  let notificationStore;

  beforeEach(() => {
    setActivePinia(createPinia());

    const profileStore = useProfileStore();
    profileStore.$patch({ currentUser: { roles: ['admin'] } });

    const stationStore = useStationStore();
    stationStore.$patch({ lineviewStation: { id: 1, factoryId: 1 } });

    notificationStore = useGenericNotificationStore();
    vi.spyOn(notificationStore, 'notifyAdded');
    vi.spyOn(notificationStore, 'notifyUpdated');
    vi.spyOn(notificationStore, 'notifyDeleted');
    vi.spyOn(notificationStore, 'notifyError');

    store = useCommentStore();
    vi.clearAllMocks();
  });

  test('initial state', () => {
    expect(store.commentsList).toEqual([]);
    expect(store.commentGroupsList).toEqual([]);
    expect(store.loading).toEqual([]);
    expect(store.commentsPromise).toBeNull();
  });

  describe('actions', () => {
    test('setComments', () => {
      const comments = [{ id: 1, name: 'Comment 1' }, { id: 2, name: 'Comment 2' }];
      store.setComments(comments);
      expect(store.commentsList).toEqual(comments);
    });

    test('setCommentGroups', () => {
      const commentGroups = [{ id: 1, name: 'Comment group 1' }, { id: 2, name: 'Comment group 2' }];
      store.setCommentGroups(commentGroups);
      expect(store.commentGroupsList).toEqual(commentGroups);
    });

    test('markCommentDeleted when comment exists', () => {
      store.commentsList = [{ id: 1, name: 'Comment 1' }, { id: 2, name: 'Comment 2' }];
      store.markCommentDeleted(2);
      expect(store.commentsList[1].deleted).toBe(true);
    });

    test('markCommentDeleted when comment does not exist', () => {
      store.commentsList = [{ id: 1, name: 'Comment 1' }, { id: 2, name: 'Comment 2' }];
      store.markCommentDeleted(3);
      expect(store.commentsList).toEqual([{ id: 1, name: 'Comment 1' }, { id: 2, name: 'Comment 2' }]);
    });

    test('markCommentGroupDeleted when group exists', () => {
      store.commentsList = [{ id: 1, name: 'Comment 1', groupId: 1 }, { id: 2, name: 'Comment 2', groupId: 2 }];
      store.commentGroupsList = [{ id: 1, name: 'Comment group 1' }, { id: 2, name: 'Comment group 2' }];
      store.markCommentGroupDeleted(1);
      expect(store.commentGroupsList[0].deleted).toBe(true);
      expect(store.commentsList[0].deleted).toBe(true);
      expect(store.commentsList[1].deleted).toBeUndefined();
    });

    test('fetchComments', async () => {
      const comments = [{ id: 1, name: 'Comment 1' }, { id: 2, name: 'Comment 2' }];
      commentApi.getComments.mockResolvedValue(comments);
      await store.fetchComments();
      expect(commentApi.getComments).toHaveBeenCalledTimes(1);
      expect(store.commentsList).toEqual(comments);
      expect(store.loading).toEqual([]);
    });

    test('saveComment when comment is new', async () => {
      const stopReason = { id: 1, primaryName: 'Comment 1' };
      commentApi.postComment.mockResolvedValue(stopReason);
      commentApi.getComments.mockResolvedValue([]);
      await store.saveComment({ primaryName: 'Comment 1' });
      expect(commentApi.postComment).toHaveBeenCalledTimes(1);
      expect(notificationStore.notifyAdded).toHaveBeenCalledWith('Comment 1');
    });

    test('saveComment when comment is updated', async () => {
      const data = { id: 1, primaryName: 'Comment 1' };
      commentApi.putComment.mockResolvedValue(data);
      commentApi.getComments.mockResolvedValue([]);
      await store.saveComment(data);
      expect(commentApi.putComment).toHaveBeenCalledTimes(1);
      expect(notificationStore.notifyUpdated).toHaveBeenCalledWith('Comment 1');
    });

    test('saveComment with error', async () => {
      const error = { response: { data: { message: 'Error message' } } };
      commentApi.postComment.mockRejectedValueOnce(error);
      await store.saveComment({ primaryName: 'Comment 1' });
      expect(notificationStore.notifyError).toHaveBeenCalledWith('Error message');
    });

    test('deleteComment with success', async () => {
      store.commentsList = [{ id: 1, primaryName: 'Comment 1' }];
      commentApi.deleteComment.mockResolvedValue();
      await store.deleteComment({ id: 1, primaryName: 'Comment 1' });
      expect(commentApi.deleteComment).toHaveBeenCalledWith(1);
      expect(notificationStore.notifyDeleted).toHaveBeenCalledWith('Comment 1');
    });

    test('deleteComment with error', async () => {
      const error = { response: { data: { message: 'Error message' } } };
      commentApi.deleteComment.mockRejectedValueOnce(error);
      await store.deleteComment({ id: 1, primaryName: 'Comment 1' });
      expect(notificationStore.notifyError).toHaveBeenCalledWith('Error message');
    });

    test('fetchCommentGroups', async () => {
      const commentGroups = [{ id: 1, name: 'Comment group 1' }, { id: 2, name: 'Comment group 2' }];
      commentApi.getCommentGroups.mockResolvedValue(commentGroups);
      await store.fetchCommentGroups();
      expect(commentApi.getCommentGroups).toHaveBeenCalledTimes(1);
    });

    test('saveCommentGroup when group is new', async () => {
      const group = { id: 1, primaryName: 'Comment group 1' };
      commentApi.postCommentGroup.mockResolvedValue(group);
      commentApi.getCommentGroups.mockResolvedValue([]);
      await store.saveCommentGroup({ primaryName: 'Comment group 1' });
      expect(commentApi.postCommentGroup).toHaveBeenCalledTimes(1);
      expect(notificationStore.notifyAdded).toHaveBeenCalledWith('Comment group 1');
    });

    test('saveCommentGroup when group is updated', async () => {
      const data = { id: 1, primaryName: 'Comment group 1' };
      commentApi.putCommentGroup.mockResolvedValue(data);
      commentApi.getCommentGroups.mockResolvedValue([]);
      await store.saveCommentGroup(data);
      expect(commentApi.putCommentGroup).toHaveBeenCalledTimes(1);
      expect(notificationStore.notifyUpdated).toHaveBeenCalledWith('Comment group 1');
    });

    test('saveCommentGroup with error', async () => {
      const error = { response: { data: { message: 'Error message' } } };
      commentApi.postCommentGroup.mockRejectedValueOnce(error);
      await store.saveCommentGroup({ primaryName: 'Comment group 1' });
      expect(notificationStore.notifyError).toHaveBeenCalledWith('Error message');
    });

    test('deleteCommentGroup with success', async () => {
      store.commentGroupsList = [{ id: 1, primaryName: 'Comment group 1' }];
      commentApi.deleteCommentGroup.mockResolvedValue();
      await store.deleteCommentGroup({ id: 1, primaryName: 'Comment group 1' });
      expect(commentApi.deleteCommentGroup).toHaveBeenCalledWith(1);
      expect(notificationStore.notifyDeleted).toHaveBeenCalledWith('Comment group 1');
    });

    test('deleteCommentGroup with error', async () => {
      const error = { response: { data: { message: 'Error message' } } };
      commentApi.deleteCommentGroup.mockRejectedValueOnce(error);
      await store.deleteCommentGroup({ id: 1, primaryName: 'Comment group 1' });
      expect(notificationStore.notifyError).toHaveBeenCalledWith('Error message');
    });
  });

  describe('getters', () => {
    test('comments excludes deleted', () => {
      store.commentsList = [{ id: 1, name: 'Comment 1' }, { id: 2, name: 'Comment 2', deleted: true }];
      expect(store.comments).toEqual([{ id: 1, name: 'Comment 1' }]);
    });

    test('allComments returns all', () => {
      store.commentsList = [{ id: 1, name: 'Comment 1' }, { id: 2, name: 'Comment 2' }];
      expect(store.allComments).toEqual(store.commentsList);
    });

    test('commentGroups excludes deleted and predefined', () => {
      store.commentGroupsList = [{ id: 1, name: 'Group 1' }, { id: 2, name: 'Group 2', deleted: true }, { id: 0, name: 'Predefined' }];
      expect(store.commentGroups).toEqual([{ id: 1, name: 'Group 1' }]);
    });

    test('commentGroupsInclDeleted excludes predefined', () => {
      store.commentGroupsList = [{ id: -1, name: 'Predefined' }, { id: 1, name: 'Group 1' }];
      expect(store.commentGroupsInclDeleted).toEqual([{ id: 1, name: 'Group 1' }]);
    });

    test('commentGroupsIncludePredefined excludes deleted', () => {
      store.commentGroupsList = [{ id: 1, name: 'Group 1', deleted: true }, { id: 2, name: 'Group 2' }];
      expect(store.commentGroupsIncludePredefined).toEqual([{ id: 2, name: 'Group 2' }]);
    });

    test('commentsMap', () => {
      store.commentsList = [{ id: 1, name: 'Comment 1' }, { id: 2, name: 'Comment 2' }];
      expect(store.commentsMap).toEqual({ 1: { id: 1, name: 'Comment 1' }, 2: { id: 2, name: 'Comment 2' } });
    });

    test('commentsRealMap', () => {
      store.commentsList = [{ id: 1, name: 'Comment 1' }, { id: 2, name: 'Comment 2' }];
      expect(store.commentsRealMap).toEqual(new Map([[1, { id: 1, name: 'Comment 1' }], [2, { id: 2, name: 'Comment 2' }]]));
    });

    test('isLoading', () => {
      expect(store.isLoading).toBe(false);
      store.loading.push('loading');
      expect(store.isLoading).toBe(true);
    });

    test('uncommentedGroup', () => {
      expect(store.uncommentedGroup).toEqual({
        factoryIds: [],
        id: -1,
        name: 'Uncommented',
        ordering: -1,
      });
    });

    test('uncommented', () => {
      expect(store.uncommented).toEqual({
        factoryIds: [],
        groupId: -1,
        id: 0,
        name: 'Uncommented',
        ordering: -1,
        primaryName: 'Uncommented',
        stationIds: [],
      });
    });
  });
});
