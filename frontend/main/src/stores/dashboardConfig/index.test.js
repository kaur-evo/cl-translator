import { setActivePinia, createPinia } from 'pinia';

import useDashboardConfigStore from './index';

import dashboardApi from '@/api/dashboardApi';

vi.mock('@/api/dashboardApi', () => ({
  default: {
    loadDashboardState: vi.fn(),
    saveDashboardState: vi.fn(),
  },
  __esModule: true,
}));

const mockOpenNotification = vi.fn();
const mockCloseDialog = vi.fn();
const mockOpenConfirmDialog = vi.fn();

vi.mock('@/stores/genericNotification', () => ({
  default: () => ({
    openNotification: mockOpenNotification,
  }),
  __esModule: true,
}));

vi.mock('@/stores/genericDialog', () => ({
  default: () => ({
    closeDialog: mockCloseDialog,
  }),
  __esModule: true,
}));

vi.mock('@/stores/confirmDialog', () => ({
  default: () => ({
    openConfirmDialog: mockOpenConfirmDialog,
  }),
  __esModule: true,
}));

vi.mock('@/stores/station', () => ({
  default: () => ({
    stationsMap: {
      11: { id: 11, name: 'Station 1' },
      12: { id: 12, name: 'Station 2' },
      13: { id: 13, name: 'Station 3' },
    },
  }),
  __esModule: true,
}));

vi.mock('@/services/i18n', () => ({
  default: { global: { t: (key) => key } },
  __esModule: true,
}));

describe('useDashboardConfigStore', () => {
  let store;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useDashboardConfigStore();
    vi.clearAllMocks();
  });

  test('initial state', () => {
    expect(store.widgets).toEqual([]);
    expect(store.loading).toEqual([]);
    expect(store.pages).toEqual([]);
    expect(store.isPagesEdit).toBe(false);
    expect(store.currentPageWidgets).toEqual([]);
    expect(store.currentPageId).toBe(-1);
  });

  describe('mutation-like actions', () => {
    test('setWidgets copies the array', () => {
      const widgets = [{ i: 1 }, { i: 2 }];
      store.setWidgets(widgets);
      expect(store.widgets).toEqual(widgets);
      expect(store.widgets).not.toBe(widgets);
    });

    test('setPages sets default page when empty', () => {
      store.setPages([]);
      expect(store.pages).toEqual([{ id: -1, name: 'My Dashboard' }]);
    });

    test('setPages sets default page when null', () => {
      store.setPages(null);
      expect(store.pages).toEqual([{ id: -1, name: 'My Dashboard' }]);
    });

    test('setPages copies the array when non-empty', () => {
      const pages = [{ id: 1, name: 'Page1' }];
      store.setPages(pages);
      expect(store.pages).toEqual(pages);
      expect(store.pages).not.toBe(pages);
    });

    test('startLoading and finishLoading', () => {
      store.startLoading();
      expect(store.loading).toEqual(['loading']);
      store.startLoading();
      expect(store.loading).toEqual(['loading', 'loading']);
      store.finishLoading();
      expect(store.loading).toEqual(['loading']);
      store.finishLoading();
      expect(store.loading).toEqual([]);
    });

    test('setCurrentPageWidgets', () => {
      const widgets = [{ i: 1 }];
      store.setCurrentPageWidgets(widgets);
      expect(store.currentPageWidgets).toEqual(widgets);
    });

    test('setCurrentPageId with value', () => {
      store.pages = [{ id: 1 }, { id: 2 }];
      store.setCurrentPageId(2);
      expect(store.currentPageId).toBe(2);
    });

    test('setCurrentPageId defaults to first page when undefined', () => {
      store.pages = [{ id: 5 }, { id: 6 }];
      store.setCurrentPageId(undefined);
      expect(store.currentPageId).toBe(5);
    });

    test('setIsPagesEdit', () => {
      store.setIsPagesEdit(true);
      expect(store.isPagesEdit).toBe(true);
      store.setIsPagesEdit(false);
      expect(store.isPagesEdit).toBe(false);
    });

    test('setLastModified', () => {
      store.setLastModified(123456);
      expect(store.lastModified).toBe(123456);
    });
  });

  describe('actions', () => {
    test('startEditPagesFlow sets isPagesEdit to true', () => {
      store.startEditPagesFlow();
      expect(store.isPagesEdit).toBe(true);
    });

    test('cancelEditPagesFlow sets isPagesEdit to false', () => {
      store.isPagesEdit = true;
      store.pages = [{ id: 1 }];
      store.currentPageId = 1;
      store.widgets = [];
      store.cancelEditPagesFlow();
      expect(store.isPagesEdit).toBe(false);
    });

    test('onPageChange sets current page id and widgets', () => {
      store.pages = [{ id: 1 }, { id: 2 }];
      store.widgets = [
        { i: 10, pageId: 2 },
        { i: 11, pageId: 1 },
      ];
      store.onPageChange(2);
      expect(store.currentPageId).toBe(2);
      expect(store.currentPageWidgets).toEqual([{ i: 10, pageId: 2 }]);
    });

    test('savePage updates existing page when in edit mode', async () => {
      store.isPagesEdit = true;
      store.pages = [{ id: 1, name: 'Page1' }, { id: 2, name: 'Page2' }];
      store.widgets = [];
      store.currentPageWidgetsRaw = [];
      dashboardApi.saveDashboardState.mockResolvedValueOnce();
      await store.savePage({ id: 2, name: 'Updated' });
      expect(store.pages).toEqual([{ id: 1, name: 'Page1' }, { id: 2, name: 'Updated' }]);
    });

    test('savePage throws when page id not found in edit mode', async () => {
      store.isPagesEdit = true;
      store.pages = [{ id: 1, name: 'Page1' }];
      await expect(store.savePage({ id: 999, name: 'Missing' })).rejects.toThrow('matching page id not found');
    });

    test('savePage adds new page when not in edit mode', async () => {
      store.isPagesEdit = false;
      store.pages = [{ id: 1, name: 'Page1' }];
      store.widgets = [];
      store.currentPageWidgetsRaw = [];
      dashboardApi.saveDashboardState.mockResolvedValueOnce();
      vi.spyOn(Date.prototype, 'getTime').mockReturnValue(999);
      await store.savePage({ name: 'New Page' });
      expect(store.pages).toEqual([{ id: 1, name: 'Page1' }, { id: 999, name: 'New Page' }]);
      vi.restoreAllMocks();
    });

    test('savePage throws when saving with id but not in edit mode', async () => {
      store.isPagesEdit = false;
      store.pages = [{ id: 1, name: 'Page1' }];
      await expect(store.savePage({ id: 1, name: 'Fail' })).rejects.toThrow('saving page while not in edit mode');
    });

    test('deletePage removes page and adjusts tab index', () => {
      store.isPagesEdit = true;
      store.pages = [{ id: 1, name: 'Page1' }, { id: 2, name: 'Page2' }];
      store.currentPageId = 1;
      store.widgets = [
        { i: 10, pageId: 1 },
        { i: 11, pageId: 2 },
      ];
      store.currentPageWidgetsRaw = [];
      dashboardApi.saveDashboardState.mockResolvedValueOnce();
      store.deletePage({ id: 2 });
      expect(store.pages).toEqual([{ id: 1, name: 'Page1' }]);
      expect(store.widgets).toEqual([{ i: 10, pageId: 1 }]);
    });

    test('deletePage throws when page id not found', () => {
      store.isPagesEdit = true;
      store.pages = [{ id: 1, name: 'Page1' }];
      expect(() => store.deletePage({ id: 999 })).toThrow('Matching page id not found');
    });

    test('initDeletePageFlow throws when missing page id', () => {
      expect(() => store.initDeletePageFlow({})).toThrow('Missing page id');
    });

    test('initDeletePageFlow dispatches confirm dialog', () => {
      store.initDeletePageFlow({ id: 1, name: 'Page1' });
      expect(mockOpenConfirmDialog).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Confirmation',
          text: 'Are you sure you want to delete this tab?',
        }),
      );
    });

    test('loadDashboardConfig loads and maps widgets', async () => {
      const apiResponse = {
        widgets: [
          { i: 1, pageId: -1, type: 'oeedonut' },
          { i: 2, type: 'delayschart' },
        ],
        pages: [{ id: -1, name: 'My Dashboard' }],
        lastModified: 123,
      };
      dashboardApi.loadDashboardState.mockResolvedValueOnce(apiResponse);
      await store.loadDashboardConfig();
      expect(store.widgets).toEqual([
        { i: 1, pageId: -1, type: 'oeedonut' },
        { i: 2, type: 'delayschart', pageId: -1 },
      ]);
      expect(store.lastModified).toBe(123);
      expect(store.loading).toEqual([]);
    });

    test('saveDashboardConfig saves and shows toast by default', async () => {
      store.pages = [{ id: 1, name: 'Page1' }];
      store.currentPageId = 1;
      store.widgets = [];
      store.currentPageWidgetsRaw = [];
      dashboardApi.saveDashboardState.mockResolvedValueOnce();
      await store.saveDashboardConfig();
      expect(dashboardApi.saveDashboardState).toHaveBeenCalledWith({
        widgets: [],
        pages: [{ id: 1, name: 'Page1' }],
        lastModified: expect.any(Number),
      });
      expect(mockOpenNotification).toHaveBeenCalledWith(
        { text: 'Dashboard updated', type: 'success' },
      );
      expect(store.loading).toEqual([]);
    });

    test('saveDashboardConfig with showToast false does not notify', async () => {
      store.pages = [{ id: 1, name: 'Page1' }];
      store.widgets = [];
      store.currentPageWidgetsRaw = [];
      dashboardApi.saveDashboardState.mockResolvedValueOnce();
      await store.saveDashboardConfig({ showToast: false });
      expect(mockOpenNotification).not.toHaveBeenCalled();
    });

    test('deleteWidget removes widget and saves', async () => {
      store.pages = [{ id: 1 }];
      store.currentPageId = 1;
      store.currentPageWidgetsRaw = [{ i: 10, pageId: 1 }, { i: 20, pageId: 1 }];
      store.widgets = [{ i: 10, pageId: 1 }, { i: 20, pageId: 1 }];
      dashboardApi.saveDashboardState.mockResolvedValueOnce();
      await store.deleteWidget(10);
      expect(store.currentPageWidgets).toEqual([{ i: 20, pageId: 1 }]);
    });

    test('deleteWidget does nothing when widget not found', async () => {
      store.currentPageWidgetsRaw = [{ i: 10 }];
      await store.deleteWidget(999);
      expect(dashboardApi.saveDashboardState).not.toHaveBeenCalled();
    });

    test('initDeleteWidgetFlow throws when missing id', () => {
      expect(() => store.initDeleteWidgetFlow(0)).toThrow('Missing widget id');
      expect(() => store.initDeleteWidgetFlow(null)).toThrow('Missing widget id');
    });

    test('initDeleteWidgetFlow dispatches confirm dialog', () => {
      store.initDeleteWidgetFlow(5);
      expect(mockOpenConfirmDialog).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Confirmation',
          text: 'Are you sure you want to delete this widget?',
        }),
      );
    });

    describe('saveWidget', () => {
      let mockGetTime;

      beforeEach(() => {
        mockGetTime = vi.spyOn(Date.prototype, 'getTime').mockReturnValue(1234567890);
        store.currentPageId = 21;
        store.currentPageWidgetsRaw = [{
          i: 234,
          pageId: '21',
          type: 'delayschart',
          config: {
            factoryId: [1, 2, 3],
            stationId: [11, 12],
            widgetName: 'Widget1',
            periodName: 'today',
            viewBy: 'reasons',
            target: null,
          },
        }];
        store.widgets = [
          ...store.currentPageWidgets,
          { i: 123, pageId: '22', type: 'oeedonut' },
        ];
        store.pages = [{ id: 21 }, { id: 22 }];
        dashboardApi.saveDashboardState.mockResolvedValue();
      });

      afterEach(() => {
        mockGetTime.mockRestore();
      });

      test('adding new widget', async () => {
        const formData = {
          type: 'oeedonut',
          target: 10,
          widgetName: 'Test name',
          periodName: 'today',
          factoryIds: [1, 2, 3],
          viewBy: 'reasons',
          stationIds: [11, 12],
        };
        const currentWidget = { config: {}, i: 'new_1234567890' };
        await store.saveWidget({ formData, currentWidget });

        const newWidget = {
          config: {
            factoryId: [1, 2, 3],
            periodName: 'today',
            stationId: [11, 12],
            target: 10,
            viewBy: 'reasons',
            widgetName: 'Test name',
          },
          i: 1234567890,
          pageId: 21,
          type: 'oeedonut',
        };
        expect(store.currentPageWidgets).toContainEqual(newWidget);
      });

      test('updating existing widget', async () => {
        const formData = {
          factoryIds: [1, 2, 3],
          stationIds: [11, 12, 13],
          widgetName: 'Test new name',
          periodName: 'previousshift',
          type: 'oeedonut',
          viewBy: 'reasons',
          target: 10,
        };
        const currentWidget = {
          config: {
            factoryId: [1, 2, 3],
            stationId: [11, 12],
            widgetName: 'Widget1',
            periodName: 'today',
            viewBy: 'reasons',
            target: null,
          },
          i: 234,
          pageId: '21',
          type: 'delayschart',
        };
        await store.saveWidget({ formData, currentWidget });

        const updatedWidget = {
          config: {
            factoryId: [1, 2, 3],
            stationId: [11, 12, 13],
            widgetName: 'Test new name',
            periodName: 'previousshift',
            viewBy: 'reasons',
            target: 10,
          },
          i: 1234567890,
          pageId: 21,
          type: 'oeedonut',
        };
        expect(store.currentPageWidgets).toContainEqual(updatedWidget);
      });
    });

    test('duplicateWidget clones and appends widget', async () => {
      store.pages = [{ id: 1 }];
      store.currentPageId = 1;
      store.currentPageWidgetsRaw = [{ i: 10, pageId: 1, type: 'oeedonut' }];
      store.widgets = [{ i: 10, pageId: 1, type: 'oeedonut' }];
      vi.spyOn(Date.prototype, 'getTime').mockReturnValue(999);
      dashboardApi.saveDashboardState.mockResolvedValueOnce();
      await store.duplicateWidget({ i: 10, pageId: 1, type: 'oeedonut' });
      expect(store.currentPageWidgets).toHaveLength(2);
      expect(store.currentPageWidgets[1].i).toBe(999);
      vi.restoreAllMocks();
    });

    test('duplicatePageWithWidgets creates new page and clones widgets', async () => {
      const fixedTimestamp = 1234567890;
      vi.spyOn(Date.prototype, 'getTime').mockReturnValue(fixedTimestamp);
      store.pages = [{ id: 1, name: 'Page1' }, { id: 2, name: 'Page2' }];
      store.widgets = [
        { i: 101, pageId: 1, type: 'oeedonut' },
        { i: 102, pageId: 2, type: 'delayschart' },
        { i: 103, pageId: 2, type: 'performancechart' },
      ];
      store.currentPageWidgetsRaw = [];
      dashboardApi.saveDashboardState.mockResolvedValueOnce();

      await store.duplicatePageWithWidgets({ id: 2, name: 'Page2' });

      expect(store.pages).toContainEqual({ id: fixedTimestamp, name: 'Page2' });
      expect(store.currentPageId).toBe(fixedTimestamp);
      expect(store.currentPageWidgets).toEqual([
        { i: fixedTimestamp, pageId: fixedTimestamp, type: 'delayschart' },
        { i: fixedTimestamp + 1, pageId: fixedTimestamp, type: 'performancechart' },
      ]);
      vi.restoreAllMocks();
    });

    test('reorderCurrentPage assigns order to widgets', () => {
      const widgets = [{ i: 3, type: 'a' }, { i: 1, type: 'b' }];
      store.reorderCurrentPage(widgets);
      expect(store.currentPageWidgets).toEqual([
        { i: 3, type: 'a', order: 1 },
        { i: 1, type: 'b', order: 2 },
      ]);
    });
  });

  describe('getters', () => {
    test('isLoading', () => {
      expect(store.isLoading).toBe(false);
      store.loading.push('loading');
      expect(store.isLoading).toBe(true);
    });

    test('isEditPages', () => {
      expect(store.isEditPages).toBe(false);
      store.isPagesEdit = true;
      expect(store.isEditPages).toBe(true);
    });

    test('widgetsNotOnCurrentPage filters correctly', () => {
      store.currentPageId = 1;
      store.pages = [{ id: 1 }, { id: 2 }];
      store.widgets = [
        { i: 10, pageId: 1 },
        { i: 11, pageId: 2 },
        { i: 'new_1', pageId: 2 },
        { i: 12, pageId: 3 },
      ];
      expect(store.widgetsNotOnCurrentPage).toEqual([{ i: 11, pageId: 2 }]);
    });

    test('currentPageRealWidgets filters correctly', () => {
      store.currentPageId = 1;
      store.pages = [{ id: 1 }];
      store.widgets = [
        { i: 10, pageId: 1 },
        { i: 'new_1', pageId: 1 },
        { i: 11, pageId: 2 },
      ];
      expect(store.currentPageRealWidgets).toEqual([{ i: 10, pageId: 1 }]);
    });

    test('sortedCurrentPageWidgets sorts by order then position', () => {
      store.currentPageWidgetsRaw = [
        { i: 1, order: 3, x: 0, y: 0 },
        { i: 2, order: 1, x: 1, y: 1 },
        { i: 3, order: 2, x: 0, y: 1 },
      ];
      const sorted = store.currentPageWidgets;
      expect(sorted[0].i).toBe(2);
      expect(sorted[1].i).toBe(3);
      expect(sorted[2].i).toBe(1);
    });

    test('sortedCurrentPageWidgets sorts by position when no order', () => {
      store.currentPageWidgetsRaw = [
        { i: 1, x: 1, y: 1 },
        { i: 2, x: 0, y: 0 },
        { i: 3, x: 0, y: 1 },
      ];
      const sorted = store.currentPageWidgets;
      expect(sorted[0].i).toBe(2);
      expect(sorted[1].i).toBe(3);
      expect(sorted[2].i).toBe(1);
    });
  });
});
