import { defineStore } from 'pinia';
import { isEqual } from 'lodash';

import generateReportPresets from '@/stores/reportsConfig/configurations/bookmarkPresetDefaultsConfig';
import ConfigType from '@/stores/reportsConfig/constants/configType';
import measure from '@/stores/reportsConfig/constants/measure';
import listToKeyMap from '@/helpers/list/listToKeyMap';
import i18n from '@/services/i18n';
import UrlParams from '@/helpers/UrlParams';
import bookmarkApi from '@/api/bookmarkApi';
import filterItemsApi from '@/api/filterItemsApi';
import routesApi from '@/api/routesApi';
import useGenericNotificationStore from '@/stores/genericNotification';
import useConfirmDialogStore from '@/stores/confirmDialog';
import useFilterbarStore from '@/stores/filterbar';
import useReportsConfigStore from '@/stores/reportsConfig';
import useProfileStore from '@/stores/profile';
import useRouteModuleStore from '@/stores/routeModule';
import useFactoryStore from '@/stores/factory';
import useConfigurationStore from '@/stores/configuration';
import useFeatureStore from '@/stores/feature';

const useBookmarkStore = defineStore('bookmark', {
  state: () => ({
    bookmarksRaw: [],
    bookmarkDefaults: {},
    loading: [],
  }),
  actions: {
    startLoading() {
      this.loading.push('loading');
    },
    finishLoading() {
      this.loading.pop();
    },
    setBookmarks(bookmarks) {
      this.bookmarksRaw = bookmarks;
    },
    editBookmarkInState(item) {
      const index = this.bookmarksRaw.findIndex((bookmark) => bookmark.id && bookmark.id === item.id);
      if (index > -1) {
        this.bookmarksRaw.splice(index, 1, item);
      } else {
        this.bookmarksRaw.push(item);
      }
    },
    deleteBookmarkFromState(id) {
      const index = this.bookmarksRaw.findIndex((el) => el.id === id);
      if (index > -1) {
        this.bookmarksRaw.splice(index, 1);
      }
    },
    setBookmarkDefaults(defaults) {
      this.bookmarkDefaults = defaults;
    },
    async fetchBookmarks() {
      this.startLoading();
      try {
        const bookmarks = await bookmarkApi.listBookmarks() || [];
        this.setBookmarks(bookmarks);
      } catch (error) {
        useGenericNotificationStore().notifyError(error.response.data.message);
      }
      this.finishLoading();
    },
    async fetchBookmarkDefaults() {
      this.startLoading();
      try {
        const reportDefaults = await filterItemsApi.getReportDefaults() ?? {};
        const { productionSpeedDefaults } = reportDefaults;
        if (productionSpeedDefaults && productionSpeedDefaults.stationId && productionSpeedDefaults.productId) {
          const routes = await routesApi.getRoutes({
            stationId: productionSpeedDefaults.stationId,
            productId: productionSpeedDefaults.productId,
          });
          if (routes.length === 1) {
            [productionSpeedDefaults.route] = routes;
          }
        }
        this.setBookmarkDefaults(reportDefaults);
      } catch (error) {
        useGenericNotificationStore().notifyError(error.response.data.message);
      }
      this.finishLoading();
    },
    async modifyBookmarkWithExceptions({ data, exceptionKeysList }) {
      try {
        if (this.currentBookmark?.timestampId) {
          const dataCopy = { ...data };
          const oldUrlParams = new UrlParams(this.currentBookmark.url);
          const newUrlParams = new UrlParams();
          exceptionKeysList.forEach((key) => {
            if (oldUrlParams.get(key) !== undefined) {
              newUrlParams.set(key, oldUrlParams.get(key));
            }
            if (this.currentBookmark[key] !== undefined) {
              dataCopy[key] = this.currentBookmark[key];
            }
          });
          const payload = {
            ...this.currentBookmark, ...dataCopy, url: newUrlParams.asHashString(),
          };
          const bookmark = await bookmarkApi.putBookmark(payload);
          window.location.hash = bookmark.url;
          useGenericNotificationStore().notifySuccess(i18n.global.t('Report updated'));
          this.editBookmarkInState(bookmark);
        } else {
          this.saveCurrentUrlAsNew();
        }
      } catch (error) {
        useGenericNotificationStore().notifyError(error.response.data.message);
      }
    },
    updateBookmarkIgnoringLabels(data) {
      this.modifyBookmarkWithExceptions({ data, exceptionKeysList: ['name', 'description'] });
    },
    async saveCurrentUrlAsNew(overwrite) {
      const { name, description, bookmarkId } = new UrlParams();
      this.saveNewBookmark({ name, description, timestampId: bookmarkId, ...overwrite });
    },
    async saveNewBookmark(data) {
      const generatePayload = (timestampId) => {
        const dataCopy = {
          type: useReportsConfigStore().configType,
          deletable: true,
          allowedUsers: [useProfileStore().currentUser.username],
          ...data,
          timestampId,
          url: new UrlParams(
            { bookmarkId: timestampId, name: data.name, description: data.description, type: useReportsConfigStore().configType },
            { merge: true },
          ).asHashString(),
        };
        return dataCopy;
      };
      this.startLoading();
      let bookmark = null;
      try {
        const payload = generatePayload(data.timestampId || new Date().getTime());
        bookmark = await bookmarkApi.postBookmark(payload);
        window.location.hash = bookmark.url;
        useGenericNotificationStore().notifySuccess(i18n.global.t('Report added'));
        this.editBookmarkInState(bookmark);
        return bookmark;
      } catch (error) {
        useGenericNotificationStore().notifyError(error.response.data.message);
        return error;
      } finally {
        this.finishLoading();
      }
    },
    async deleteBookmark({ id }) {
      this.startLoading();
      try {
        const { type } = this.currentBookmark;
        await bookmarkApi.deleteBookmark(id);
        window.location.hash = this.bookmarkPresetsMap[type].url;
        this.deleteBookmarkFromState(id);
        useGenericNotificationStore().notifySuccess(i18n.global.t('Report deleted'));
      } catch (error) {
        useGenericNotificationStore().notifyError(error.response.data.message);
      }
      this.finishLoading();
    },
    async duplicateBookmark() {
      const { name, description } = this.currentBookmark;
      let index = 0;
      let newName;
      do {
        index += 1;
        newName = `${name} ${index}`;
      } while (this.bookmarksByNameMap[newName] !== undefined);
      this.saveNewBookmark({ name: newName, description });
    },
    initDeleteBookmarkFlow() {
      const bookmark = this.currentBookmark;
      const config = {
        name: i18n.global.t('Confirmation'),
        text: i18n.global.t('Are you sure you want to delete {value}?', { value: `"${bookmark.name}"` }),
        action: () => {
          this.deleteBookmark({ id: bookmark.id });
        },
        confirmText: i18n.global.t('Delete'),
        cancelText: i18n.global.t('Cancel'),
      };
      useConfirmDialogStore().openConfirmDialog(config);
    },
    async setNewBookmarkOrdering({ bookmarkId, order }) {
      this.startLoading();
      await bookmarkApi.setBookmarkOrder(bookmarkId, { ordering: order });
      await this.fetchBookmarks();
      this.finishLoading();
    },
    async editBookmark(bookmark) {
      try {
        this.startLoading();
        await useFilterbarStore().updateFilterValue({ name: bookmark.name, description: bookmark.description });
        await useFilterbarStore().triggerDataRequest();
        const previousData = this.bookmarksRaw.find((b) => b.id === bookmark.id);
        const payload = { ...previousData, ...bookmark, url: window.location.hash };
        const newBookmark = await bookmarkApi.putBookmark(payload);
        this.editBookmarkInState(newBookmark);
        useGenericNotificationStore().notifySuccess(i18n.global.t('Report updated'));
      } catch (error) {
        useGenericNotificationStore().notifyError(error.response.data.message);
      } finally {
        this.finishLoading();
      }
    },
  },
  getters: {
    currentBookmark() {
      const routeModuleStore = useRouteModuleStore();
      if (routeModuleStore && routeModuleStore.query) {
        return this.bookmarksMap[routeModuleStore.query.bookmarkId];
      }
      return null;
    },
    isCurrentBookmarkModified() {
      return (href) => {
        if (!this.currentBookmark) return true;
        const currentParams = this.currentBookmark?.url.split('?')[1];
        const compareParams = href.split('?')[1];
        const currentParamsObj = new UrlParams(currentParams);
        const compareParamsObj = new UrlParams(compareParams);
        return !isEqual(currentParamsObj, compareParamsObj);
      };
    },
    bookmarkPresetsMap: (state) => {
      const featureStore = useFeatureStore();
      return generateReportPresets({
        state,
        hasMultipleFactories: useFactoryStore().hasMultipleFactories,
        checklistStations: useConfigurationStore().checklistStations,
        checklistsEnabled: featureStore.checklistsEnabled,
        productionSpeedReportEnabled: featureStore.productionSpeedReportEnabled,
      });
    },
    isUserBookmark() {
      return !!this.enrichedBookmarks.find((b) => b.id === this.currentBookmark?.id);
    },
    enrichedBookmarks() {
      return this.bookmarksRaw.map((b) => {
        const urlParams = new UrlParams(b.url, { hashBase: '#/reports2' });
        const preset = this.bookmarkPresetsMap[b.type];
        if (preset && preset.defaults) {
          Object.entries(preset.defaults).forEach(([key, value]) => {
            if (!urlParams.get(key)) {
              urlParams.set(key, value);
            }
          });
        }
        if (b.type === ConfigType.QUANTITY) {
          const visibleColumns = urlParams.get('visibleColumns') || [];
          const idx = visibleColumns.indexOf('totalqty');
          if (idx > -1) visibleColumns.splice(idx, 1, measure.ROW_PRODUCED_QTY);
        }
        const urlWithMigratedDefaults = urlParams.asHashString();
        return { ...b, url: urlWithMigratedDefaults };
      });
    },
    orderedBookmarks() {
      return [...this.enrichedBookmarks].sort((a, b) => a.ordering - b.ordering);
    },
    bookmarksMap() {
      return { ...listToKeyMap(this.enrichedBookmarks, 'timestampId'), ...this.bookmarkPresetsMap };
    },
    bookmarksByNameMap() {
      return { ...listToKeyMap(this.enrichedBookmarks, 'name') };
    },
    bookmarks() {
      return this.enrichedBookmarks;
    },
    isLoading: (state) => !!state.loading.length,
  },
});

export default useBookmarkStore;
