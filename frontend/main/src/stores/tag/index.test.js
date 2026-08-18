import { setActivePinia, createPinia } from 'pinia';

import useTagStore from './index';

import tagApi from '@/api/tagApi';
import useGenericNotificationStore from '@/stores/genericNotification';

vi.mock('@/api/tagApi', () => ({
  default: {
    getTags: vi.fn(),
    postTag: vi.fn(),
    putTag: vi.fn(),
    deleteTag: vi.fn(),
  },
  __esModule: true,
}));

vi.mock('@/stores/genericNotification', () => ({
  default: vi.fn(),
  __esModule: true,
}));

vi.mock('@/services/i18n', () => ({
  default: { global: { t: (key) => key } },
  __esModule: true,
}));

describe('useTagStore', () => {
  let store;
  const mockNotificationStore = {
    notifyError: vi.fn(),
    notifyUpdated: vi.fn(),
    notifyAdded: vi.fn(),
    notifyDeleted: vi.fn(),
  };

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useTagStore();
    useGenericNotificationStore.mockReturnValue(mockNotificationStore);
    vi.clearAllMocks();
  });

  test('initial state', () => {
    expect(store.tagsList).toEqual([]);
    expect(store.loading).toEqual([]);
  });

  describe('startLoading / finishLoading', () => {
    test('startLoading pushes to loading array', () => {
      store.startLoading();
      expect(store.loading).toEqual(['loading']);
    });

    test('finishLoading pops from loading array', () => {
      store.startLoading();
      store.finishLoading();
      expect(store.loading).toEqual([]);
    });
  });

  describe('setTagDeleted', () => {
    test('sets deleted flag on matching tag', () => {
      store.tagsList = [{ id: 1, name: 'Tag1' }, { id: 2, name: 'Tag2' }];
      store.setTagDeleted(1);
      expect(store.tagsList[0].deleted).toBe(true);
      expect(store.tagsList[1].deleted).toBeUndefined();
    });

    test('does nothing when tag not found', () => {
      store.tagsList = [{ id: 1, name: 'Tag1' }];
      store.setTagDeleted(999);
      expect(store.tagsList[0].deleted).toBeUndefined();
    });
  });

  describe('fetchTags', () => {
    test('fetches tags and sets tagsList', async () => {
      const tags = [{ id: 1, name: 'Tag1' }];
      tagApi.getTags.mockResolvedValueOnce(tags);

      await store.fetchTags({ entity: 'station' });

      expect(tagApi.getTags).toHaveBeenCalledWith({ entity: 'station' });
      expect(store.tagsList).toEqual(tags);
      expect(store.loading).toEqual([]);
    });

    test('uses empty params by default', async () => {
      tagApi.getTags.mockResolvedValueOnce([]);

      await store.fetchTags();

      expect(tagApi.getTags).toHaveBeenCalledWith({});
    });

    test('sets tagsList to empty array when API returns falsy', async () => {
      tagApi.getTags.mockResolvedValueOnce(null);

      await store.fetchTags();

      expect(store.tagsList).toEqual([]);
    });

    test('sets tagsList to empty array and notifies on error', async () => {
      const error = { response: { data: { message: 'Server error' } } };
      tagApi.getTags.mockRejectedValueOnce(error);

      await store.fetchTags();

      expect(store.tagsList).toEqual([]);
      expect(mockNotificationStore.notifyError).toHaveBeenCalledWith('Server error');
      expect(store.loading).toEqual([]);
    });

    test('uses fallback error message when response has no message', async () => {
      tagApi.getTags.mockRejectedValueOnce(new Error('Network error'));

      await store.fetchTags();

      expect(mockNotificationStore.notifyError).toHaveBeenCalledWith('An error occurred');
    });
  });

  describe('saveTag', () => {
    test('creates new tag when data has no id', async () => {
      const data = { name: 'New Tag' };
      tagApi.postTag.mockResolvedValueOnce({});
      tagApi.getTags.mockResolvedValueOnce([]);

      await store.saveTag(data);

      expect(tagApi.postTag).toHaveBeenCalledWith(data);
      expect(tagApi.putTag).not.toHaveBeenCalled();
      expect(mockNotificationStore.notifyAdded).toHaveBeenCalledWith('Tag');
      expect(store.loading).toEqual([]);
    });

    test('updates existing tag when data has id', async () => {
      const data = { id: 1, name: 'Updated Tag' };
      tagApi.putTag.mockResolvedValueOnce({});
      tagApi.getTags.mockResolvedValueOnce([]);

      await store.saveTag(data);

      expect(tagApi.putTag).toHaveBeenCalledWith(data);
      expect(tagApi.postTag).not.toHaveBeenCalled();
      expect(mockNotificationStore.notifyUpdated).toHaveBeenCalledWith('Tag');
    });

    test('refetches tags after successful save', async () => {
      tagApi.postTag.mockResolvedValueOnce({});
      tagApi.getTags.mockResolvedValueOnce([{ id: 1, name: 'New' }]);

      await store.saveTag({ name: 'New' });

      expect(tagApi.getTags).toHaveBeenCalled();
    });

    test('notifies error on failure', async () => {
      const error = { response: { data: { message: 'Duplicate tag' } } };
      tagApi.postTag.mockRejectedValueOnce(error);

      await store.saveTag({ name: 'Dup' });

      expect(mockNotificationStore.notifyError).toHaveBeenCalledWith('Duplicate tag');
      expect(tagApi.getTags).not.toHaveBeenCalled();
      expect(store.loading).toEqual([]);
    });

    test('uses fallback error message on save failure', async () => {
      tagApi.putTag.mockRejectedValueOnce(new Error('fail'));

      await store.saveTag({ id: 1, name: 'Tag' });

      expect(mockNotificationStore.notifyError).toHaveBeenCalledWith('An error occurred');
    });
  });

  describe('deleteTag', () => {
    test('deletes tag and marks it as deleted', async () => {
      store.tagsList = [{ id: 1, name: 'Tag1' }, { id: 2, name: 'Tag2' }];
      tagApi.deleteTag.mockResolvedValueOnce({});

      await store.deleteTag({ id: 1 });

      expect(tagApi.deleteTag).toHaveBeenCalledWith(1);
      expect(mockNotificationStore.notifyDeleted).toHaveBeenCalledWith('Tag');
      expect(store.tagsList[0].deleted).toBe(true);
      expect(store.loading).toEqual([]);
    });

    test('notifies error on failure', async () => {
      const error = { response: { data: { message: 'Cannot delete' } } };
      tagApi.deleteTag.mockRejectedValueOnce(error);

      await store.deleteTag({ id: 1 });

      expect(mockNotificationStore.notifyError).toHaveBeenCalledWith('Cannot delete');
      expect(store.loading).toEqual([]);
    });

    test('uses fallback error message on delete failure', async () => {
      tagApi.deleteTag.mockRejectedValueOnce(new Error('fail'));

      await store.deleteTag({ id: 1 });

      expect(mockNotificationStore.notifyError).toHaveBeenCalledWith('An error occurred');
    });
  });

  describe('getters', () => {
    describe('tags', () => {
      test('returns only non-deleted tags', () => {
        store.tagsList = [
          { id: 1, name: 'Active', deleted: false },
          { id: 2, name: 'Deleted', deleted: true },
          { id: 3, name: 'Also Active' },
        ];

        expect(store.tags).toEqual([
          { id: 1, name: 'Active', deleted: false },
          { id: 3, name: 'Also Active' },
        ]);
      });

      test('returns empty array when all tags are deleted', () => {
        store.tagsList = [{ id: 1, deleted: true }];
        expect(store.tags).toEqual([]);
      });
    });

    describe('isLoading', () => {
      test('returns false when loading is empty', () => {
        expect(store.isLoading).toBe(false);
      });

      test('returns true when loading has entries', () => {
        store.loading.push('loading');
        expect(store.isLoading).toBe(true);
      });
    });
  });
});
