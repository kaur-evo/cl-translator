import { setActivePinia, createPinia } from 'pinia';

import useBookmarkStore from '@/stores/bookmark';
import bookmarkApi from '@/api/bookmarkApi';
import filterItemsApi from '@/api/filterItemsApi';
import routesApi from '@/api/routesApi';

const { mocks, storeMock } = vi.hoisted(() => {
  const notifyError = vi.fn();
  const notifySuccess = vi.fn();
  const openConfirmDialog = vi.fn();
  const updateFilterValue = vi.fn().mockResolvedValue();
  const triggerDataRequest = vi.fn().mockResolvedValue();

  const routeModule = { query: { bookmarkId: null } };
  const reportsConfig = { configType: 'OEE' };
  const profile = { currentUser: { username: 'testuser' } };
  const factory = { hasMultipleFactories: false };
  const configuration = { checklistStations: [] };
  const feature = { checklistsEnabled: false, productionSpeedReportEnabled: false };

  return {
    mocks: {
      notifyError, notifySuccess, openConfirmDialog,
      updateFilterValue, triggerDataRequest,
      routeModule, reportsConfig, profile, factory, configuration, feature,
    },
    storeMock: (state) => ({ default: () => state, __esModule: true }),
  };
});

vi.mock('@/stores/genericNotification', () => storeMock({
  notifyError: mocks.notifyError, notifySuccess: mocks.notifySuccess,
}));
vi.mock('@/stores/confirmDialog', () => storeMock({ openConfirmDialog: mocks.openConfirmDialog }));
vi.mock('@/stores/filterbar', () => storeMock({
  updateFilterValue: mocks.updateFilterValue, triggerDataRequest: mocks.triggerDataRequest,
}));
vi.mock('@/stores/reportsConfig', () => storeMock(mocks.reportsConfig));
vi.mock('@/stores/profile', () => storeMock(mocks.profile));
vi.mock('@/stores/routeModule', () => storeMock(mocks.routeModule));
vi.mock('@/stores/factory', () => storeMock(mocks.factory));
vi.mock('@/stores/configuration', () => storeMock(mocks.configuration));
vi.mock('@/stores/feature', () => storeMock(mocks.feature));

vi.mock('@/api/bookmarkApi', () => ({
  default: {
    listBookmarks: vi.fn(),
    postBookmark: vi.fn(),
    putBookmark: vi.fn(),
    deleteBookmark: vi.fn(),
    setBookmarkOrder: vi.fn(),
  },
  __esModule: true,
}));

vi.mock('@/api/filterItemsApi', () => ({
  default: {
    getReportDefaults: vi.fn(),
  },
  __esModule: true,
}));

vi.mock('@/api/routesApi', () => ({
  default: {
    getRoutes: vi.fn(),
  },
  __esModule: true,
}));

vi.mock('@/services/i18n', () => ({
  default: { global: { t: (key, params) => (params ? key.replace('{value}', params.value) : key) } },
  __esModule: true,
}));

vi.mock('@/stores/reportsConfig/configurations/bookmarkPresetDefaultsConfig', () => ({
  default: () => ({
    OEE: { url: '#/reports2?type=OEE', defaults: {} },
  }),
  __esModule: true,
}));

vi.mock('@/stores/reportsConfig/constants/configType', () => ({
  default: { QUANTITY: 'QUANTITY' },
  __esModule: true,
}));

vi.mock('@/stores/reportsConfig/constants/measure', () => ({
  default: { ROW_PRODUCED_QTY: 'producedQty' },
  __esModule: true,
}));

vi.mock('@/helpers/UrlParams', () => {
  const UrlParamsMock = vi.fn().mockImplementation(function urlParamsCtor(params) {
    this._params = typeof params === 'string' ? {} : (params || {});
    this.get = vi.fn((key) => this._params[key]);
    this.set = vi.fn((key, value) => {
      this._params[key] = value;
    });
    this.asHashString = vi.fn(() => '#/reports2?mock=true');
    this.name = this._params.name;
    this.description = this._params.description;
    this.bookmarkId = this._params.bookmarkId;
  });
  return { default: UrlParamsMock, __esModule: true };
});

describe('useBookmarkStore', () => {
  let bookmarkStore;

  beforeEach(() => {
    setActivePinia(createPinia());
    bookmarkStore = useBookmarkStore();
    vi.clearAllMocks();
    mocks.routeModule.query = { bookmarkId: null };
  });

  test('initial state', () => {
    expect(bookmarkStore.bookmarksRaw).toEqual([]);
    expect(bookmarkStore.bookmarkDefaults).toEqual({});
    expect(bookmarkStore.loading).toEqual([]);
  });

  describe('actions', () => {
    test('startLoading', () => {
      bookmarkStore.startLoading();
      expect(bookmarkStore.loading).toEqual(['loading']);
    });

    test('finishLoading', () => {
      bookmarkStore.loading = ['loading'];
      bookmarkStore.finishLoading();
      expect(bookmarkStore.loading).toEqual([]);
    });

    test('setBookmarks', () => {
      const bookmarks = [{ id: 1, name: 'b1' }, { id: 2, name: 'b2' }];
      bookmarkStore.setBookmarks(bookmarks);
      expect(bookmarkStore.bookmarksRaw).toEqual(bookmarks);
    });

    test('editBookmarkInState updates existing bookmark', () => {
      bookmarkStore.bookmarksRaw = [{ id: 1, name: 'b1' }, { id: 2, name: 'b2' }];
      bookmarkStore.editBookmarkInState({ id: 1, name: 'b1 updated' });
      expect(bookmarkStore.bookmarksRaw).toEqual([{ id: 1, name: 'b1 updated' }, { id: 2, name: 'b2' }]);
    });

    test('editBookmarkInState adds new bookmark', () => {
      bookmarkStore.bookmarksRaw = [{ id: 1, name: 'b1' }];
      bookmarkStore.editBookmarkInState({ id: 3, name: 'b3' });
      expect(bookmarkStore.bookmarksRaw).toEqual([{ id: 1, name: 'b1' }, { id: 3, name: 'b3' }]);
    });

    test('deleteBookmarkFromState removes existing bookmark', () => {
      bookmarkStore.bookmarksRaw = [{ id: 1, name: 'b1' }, { id: 2, name: 'b2' }];
      bookmarkStore.deleteBookmarkFromState(1);
      expect(bookmarkStore.bookmarksRaw).toEqual([{ id: 2, name: 'b2' }]);
    });

    test('deleteBookmarkFromState does nothing when bookmark not found', () => {
      bookmarkStore.bookmarksRaw = [{ id: 1, name: 'b1' }];
      bookmarkStore.deleteBookmarkFromState(99);
      expect(bookmarkStore.bookmarksRaw).toEqual([{ id: 1, name: 'b1' }]);
    });

    test('setBookmarkDefaults', () => {
      const defaults = { key: 'value' };
      bookmarkStore.setBookmarkDefaults(defaults);
      expect(bookmarkStore.bookmarkDefaults).toEqual(defaults);
    });

    test('fetchBookmarks with success', async () => {
      const bookmarks = [{ id: 1, name: 'b1' }, { id: 2, name: 'b2' }];
      bookmarkApi.listBookmarks.mockResolvedValueOnce(bookmarks);
      await bookmarkStore.fetchBookmarks();
      expect(bookmarkApi.listBookmarks).toHaveBeenCalledTimes(1);
      expect(bookmarkStore.bookmarksRaw).toEqual(bookmarks);
      expect(bookmarkStore.loading).toEqual([]);
    });

    test('fetchBookmarks with error', async () => {
      bookmarkApi.listBookmarks.mockRejectedValueOnce({ response: { data: { message: 'fetch error' } } });
      await bookmarkStore.fetchBookmarks();
      expect(mocks.notifyError).toHaveBeenCalledWith('fetch error');
      expect(bookmarkStore.loading).toEqual([]);
    });

    test('fetchBookmarkDefaults with success', async () => {
      const defaults = { productionSpeedDefaults: {} };
      filterItemsApi.getReportDefaults.mockResolvedValueOnce(defaults);
      await bookmarkStore.fetchBookmarkDefaults();
      expect(filterItemsApi.getReportDefaults).toHaveBeenCalledTimes(1);
      expect(bookmarkStore.bookmarkDefaults).toEqual(defaults);
      expect(bookmarkStore.loading).toEqual([]);
    });

    test('fetchBookmarkDefaults fetches routes when stationId and productId present', async () => {
      const defaults = {
        productionSpeedDefaults: { stationId: 1, productId: 2 },
      };
      const routes = [{ id: 'route1' }];
      filterItemsApi.getReportDefaults.mockResolvedValueOnce(defaults);
      routesApi.getRoutes.mockResolvedValueOnce(routes);
      await bookmarkStore.fetchBookmarkDefaults();
      expect(routesApi.getRoutes).toHaveBeenCalledWith({ stationId: 1, productId: 2 });
      expect(bookmarkStore.bookmarkDefaults.productionSpeedDefaults.route).toEqual({ id: 'route1' });
    });

    test('fetchBookmarkDefaults with error', async () => {
      filterItemsApi.getReportDefaults.mockRejectedValueOnce({ response: { data: { message: 'defaults error' } } });
      await bookmarkStore.fetchBookmarkDefaults();
      expect(mocks.notifyError).toHaveBeenCalledWith('defaults error');
    });

    test('saveNewBookmark with success', async () => {
      const bookmark = { id: 1, name: 'new', url: '#/reports2?test=1' };
      bookmarkApi.postBookmark.mockResolvedValueOnce(bookmark);
      const result = await bookmarkStore.saveNewBookmark({ name: 'new', description: 'desc', timestampId: 123 });
      expect(bookmarkApi.postBookmark).toHaveBeenCalledTimes(1);
      expect(mocks.notifySuccess).toHaveBeenCalledWith('Report added');
      expect(result).toEqual(bookmark);
      expect(bookmarkStore.loading).toEqual([]);
    });

    test('saveNewBookmark with error', async () => {
      const error = { response: { data: { message: 'save error' } } };
      bookmarkApi.postBookmark.mockRejectedValueOnce(error);
      const result = await bookmarkStore.saveNewBookmark({ name: 'new', description: 'desc' });
      expect(mocks.notifyError).toHaveBeenCalledWith('save error');
      expect(result).toEqual(error);
      expect(bookmarkStore.loading).toEqual([]);
    });

    test('deleteBookmark with success', async () => {
      mocks.routeModule.query.bookmarkId = 't1';
      bookmarkStore.bookmarksRaw = [{ id: 1, name: 'b1', timestampId: 't1', type: 'OEE' }];
      bookmarkApi.deleteBookmark.mockResolvedValueOnce();
      await bookmarkStore.deleteBookmark({ id: 1 });
      expect(bookmarkApi.deleteBookmark).toHaveBeenCalledWith(1);
      expect(mocks.notifySuccess).toHaveBeenCalledWith('Report deleted');
      expect(bookmarkStore.bookmarksRaw).toEqual([]);
      expect(bookmarkStore.loading).toEqual([]);
    });

    test('deleteBookmark with error', async () => {
      mocks.routeModule.query.bookmarkId = 't1';
      bookmarkStore.bookmarksRaw = [{ id: 1, name: 'b1', timestampId: 't1', type: 'OEE' }];
      bookmarkApi.deleteBookmark.mockRejectedValueOnce({ response: { data: { message: 'delete error' } } });
      await bookmarkStore.deleteBookmark({ id: 1 });
      expect(mocks.notifyError).toHaveBeenCalledWith('delete error');
    });

    test('setNewBookmarkOrdering', async () => {
      bookmarkApi.setBookmarkOrder.mockResolvedValueOnce();
      bookmarkApi.listBookmarks.mockResolvedValueOnce([]);
      await bookmarkStore.setNewBookmarkOrdering({ bookmarkId: 1, order: 5 });
      expect(bookmarkApi.setBookmarkOrder).toHaveBeenCalledWith(1, { ordering: 5 });
      expect(bookmarkApi.listBookmarks).toHaveBeenCalledTimes(1);
    });

    test('editBookmark with success', async () => {
      bookmarkStore.bookmarksRaw = [{ id: 1, name: 'old', url: '#old' }];
      const updatedBookmark = { id: 1, name: 'updated', url: '#new' };
      bookmarkApi.putBookmark.mockResolvedValueOnce(updatedBookmark);
      await bookmarkStore.editBookmark({ id: 1, name: 'updated' });
      expect(mocks.updateFilterValue).toHaveBeenCalledWith(
        { name: 'updated', description: undefined },
      );
      expect(mocks.triggerDataRequest).toHaveBeenCalled();
      expect(bookmarkApi.putBookmark).toHaveBeenCalledTimes(1);
      expect(mocks.notifySuccess).toHaveBeenCalledWith('Report updated');
      expect(bookmarkStore.loading).toEqual([]);
    });

    test('editBookmark with error', async () => {
      mocks.updateFilterValue.mockRejectedValueOnce({ response: { data: { message: 'edit error' } } });
      await bookmarkStore.editBookmark({ id: 1, name: 'updated' });
      expect(mocks.notifyError).toHaveBeenCalledWith('edit error');
      expect(bookmarkStore.loading).toEqual([]);
    });

    test('initDeleteBookmarkFlow dispatches confirmDialog', () => {
      mocks.routeModule.query.bookmarkId = 't1';
      bookmarkStore.bookmarksRaw = [{ id: 1, name: 'b1', timestampId: 't1', type: 'OEE' }];
      bookmarkStore.initDeleteBookmarkFlow();
      expect(mocks.openConfirmDialog).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Confirmation',
          text: 'Are you sure you want to delete "b1"?',
          confirmText: 'Delete',
          cancelText: 'Cancel',
        }),
      );
    });
  });

  describe('getters', () => {
    test('isLoading returns false when loading is empty', () => {
      expect(bookmarkStore.isLoading).toBe(false);
    });

    test('isLoading returns true when loading has items', () => {
      bookmarkStore.loading.push('loading');
      expect(bookmarkStore.isLoading).toBe(true);
    });

    test('currentBookmark returns undefined when no matching bookmarkId in route', () => {
      mocks.routeModule.query = { bookmarkId: 'nonexistent' };
      expect(bookmarkStore.currentBookmark).toBeUndefined();
    });

    test('currentBookmark returns null when routeModule has no query', () => {
      mocks.routeModule.query = null;
      expect(bookmarkStore.currentBookmark).toBeNull();
      mocks.routeModule.query = { bookmarkId: null };
    });

    test('currentBookmark returns bookmark matching route bookmarkId', () => {
      mocks.routeModule.query = { bookmarkId: 't1' };
      bookmarkStore.bookmarksRaw = [{ id: 1, name: 'b1', timestampId: 't1', type: 'OEE' }];
      expect(bookmarkStore.currentBookmark).toBeDefined();
    });

    test('enrichedBookmarks returns mapped bookmarks', () => {
      bookmarkStore.bookmarksRaw = [{ id: 1, name: 'b1', type: 'OEE', url: '#/reports2?test=1' }];
      expect(bookmarkStore.enrichedBookmarks).toHaveLength(1);
      expect(bookmarkStore.enrichedBookmarks[0].id).toBe(1);
    });

    test('orderedBookmarks returns sorted bookmarks', () => {
      bookmarkStore.bookmarksRaw = [
        { id: 1, name: 'b1', type: 'OEE', url: '#/reports2?test=1', ordering: 2 },
        { id: 2, name: 'b2', type: 'OEE', url: '#/reports2?test=2', ordering: 1 },
      ];
      const ordered = bookmarkStore.orderedBookmarks;
      expect(ordered[0].id).toBe(2);
      expect(ordered[1].id).toBe(1);
    });

    test('bookmarksMap includes bookmarks and presets', () => {
      bookmarkStore.bookmarksRaw = [{ id: 1, name: 'b1', timestampId: 't1', type: 'OEE', url: '#/reports2?test=1' }];
      expect(bookmarkStore.bookmarksMap).toHaveProperty('OEE');
    });

    test('bookmarksByNameMap maps by name', () => {
      bookmarkStore.bookmarksRaw = [{ id: 1, name: 'b1', type: 'OEE', url: '#/reports2?test=1' }];
      expect(bookmarkStore.bookmarksByNameMap).toHaveProperty('b1');
    });

    test('isUserBookmark returns false when no current bookmark', () => {
      mocks.routeModule.query = { bookmarkId: null };
      expect(bookmarkStore.isUserBookmark).toBe(false);
    });
  });
});
