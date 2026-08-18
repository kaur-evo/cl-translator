import { defineStore } from 'pinia';
import { cloneDeep } from 'lodash';

import dashboardApi from '@/api/dashboardApi';
import { CUSTOM } from '@/constants/predefinedTimePeriodNames';
import i18n from '@/services/i18n';
import useGenericNotificationStore from '@/stores/genericNotification';
import useGenericDialogStore from '@/stores/genericDialog';
import useConfirmDialogStore from '@/stores/confirmDialog';
import useStationStore from '@/stores/station';

const onSamePage = (w, state) => w && String(w.pageId) === String(state.currentPageId);
const notPlaceholder = (w) => w && !String(w.i).startsWith('new');
const hasTab = (w, state) => w && state.pages.find((p) => String(p.id) === String(w.pageId));

const useDashboardConfigStore = defineStore('dashboardConfig', {
  state: () => ({
    widgets: [],
    loading: [],
    pages: [],
    isPagesEdit: false,
    currentPageWidgetsRaw: [],
    currentPageId: -1,
    lastModified: null,
  }),
  actions: {
    setWidgets(widgets) {
      this.widgets = widgets.slice();
    },
    applyPages(pages) {
      if (!pages || !pages.length) {
        this.pages = [{ id: -1, name: i18n.global.t('My Dashboard') }];
      } else {
        this.pages = pages.slice();
      }
    },
    startLoading() {
      this.loading.push('loading');
    },
    finishLoading() {
      this.loading.pop();
    },
    setCurrentPageWidgets(widgets) {
      this.currentPageWidgetsRaw = widgets;
    },
    setCurrentPageId(pageId) {
      this.currentPageId = pageId === undefined ? this.pages[0].id : pageId;
    },
    setLastModified(val) {
      this.lastModified = val;
    },
    setIsPagesEdit(val) {
      this.isPagesEdit = val;
    },
    onPageChange(pageId) {
      this.setCurrentPageId(pageId);
      this.setCurrentPageWidgets(this.currentPageRealWidgets);
    },
    startEditPagesFlow() {
      this.setIsPagesEdit(true);
    },
    cancelEditPagesFlow() {
      this.setIsPagesEdit(false);
      this.onPageChange(this.currentPageId);
    },
    setPages(pages) {
      this.applyPages(pages);
      this.saveDashboardConfig();
    },
    async savePage(page) {
      if (this.isEditPages && page.id) {
        const index = this.pages.findIndex((p) => Number(p.id) === Number(page.id));
        if (index > -1) {
          const pagesClone = [...this.pages];
          pagesClone.splice(index, 1, page);
          await this.setPages(pagesClone);
        } else {
          useGenericNotificationStore().openNotification({ text: i18n.global.t('Action failed'), type: 'error' });
          throw Error('matching page id not found');
        }
      } else if (!this.isEditPages && !page.id) {
        const newPage = { ...page, id: new Date().getTime() };
        await this.setPages([...this.pages, newPage]);
      } else {
        useGenericNotificationStore().openNotification({ text: i18n.global.t('Action failed'), type: 'error' });
        throw Error('saving page while not in edit mode');
      }
    },
    initDeletePageFlow(page) {
      if (!page.id && page.id !== 0) {
        useGenericNotificationStore().openNotification({ text: i18n.global.t('Action failed'), type: 'error' });
        throw Error('Missing page id');
      }
      const dialogConfig = {
        title: i18n.global.t('Confirmation'),
        text: i18n.global.t('Are you sure you want to delete this tab?'),
        action: () => {
          this.deletePage(page);
          useGenericDialogStore().closeDialog();
        },
        confirmText: i18n.global.t('Delete'),
        cancelText: i18n.global.t('Cancel'),
      };
      useConfirmDialogStore().openConfirmDialog(dialogConfig);
    },
    deletePage(page) {
      if (this.isEditPages) {
        const deleteIndex = this.pages.findIndex((p) => Number(p.id) === Number(page.id));
        const currentPageIndex = this.pages.findIndex((p) => Number(p.id) === Number(this.currentPageId));
        if (deleteIndex > -1) {
          const pagesClone = [...this.pages];
          pagesClone.splice(deleteIndex, 1);
          this.setPages(pagesClone);
          this.setWidgets(this.widgets.filter((widget) => widget.pageId !== page.id));
          const lastIndexOfTabsAfterDelete = pagesClone.length - 1;
          let newTabIndex = 0;
          if (deleteIndex < currentPageIndex) {
            if (currentPageIndex < lastIndexOfTabsAfterDelete) newTabIndex = currentPageIndex;
            else newTabIndex = lastIndexOfTabsAfterDelete;
          } else if (lastIndexOfTabsAfterDelete <= deleteIndex) {
            newTabIndex = lastIndexOfTabsAfterDelete;
          } else {
            newTabIndex = deleteIndex;
          }
          this.onPageChange(pagesClone[newTabIndex].id);
        } else {
          useGenericNotificationStore().openNotification({ text: i18n.global.t('Action failed'), type: 'error' });
          throw Error('Matching page id not found');
        }
      }
    },
    async loadDashboardConfig() {
      this.startLoading();
      const { widgets, pages, lastModified } = await dashboardApi.loadDashboardState();
      let mappedWidgets = [];
      if (widgets) {
        mappedWidgets = widgets.map((widget) => {
          if ('pageId' in widget) return widget;
          return { ...widget, pageId: -1 };
        });
      }
      this.setLastModified(lastModified || null);
      this.setWidgets(mappedWidgets);
      this.setCurrentPageWidgets(this.currentPageRealWidgets);
      this.applyPages(pages);
      this.onPageChange();
      this.finishLoading();
    },
    async saveDashboardConfig(params = {}) {
      const { pages = this.pages, showToast = true } = params;
      this.startLoading();
      const widgets = [...this.widgetsNotOnCurrentPage, ...this.currentPageWidgetsRaw];
      await dashboardApi.saveDashboardState({ widgets, pages, lastModified: new Date().getTime() });
      this.setWidgets(widgets);
      this.setCurrentPageWidgets(this.currentPageRealWidgets);
      this.finishLoading();
      if (showToast) {
        useGenericNotificationStore().openNotification({ text: i18n.global.t('Dashboard updated'), type: 'success' });
      }
    },
    async deleteWidget(id) {
      const widgetIndex = this.currentPageWidgetsRaw.findIndex((widget) => Number(widget.i) === Number(id));
      if (widgetIndex > -1) {
        const widgetsClone = [...this.currentPageWidgetsRaw];
        widgetsClone.splice(widgetIndex, 1);
        this.setCurrentPageWidgets(widgetsClone);
        await this.saveDashboardConfig();
      }
    },
    initDeleteWidgetFlow(id) {
      if (!id || id === 0) {
        useGenericNotificationStore().openNotification({ text: i18n.global.t('Action failed'), type: 'error' });
        throw Error('Missing widget id');
      }
      const dialogConfig = {
        title: i18n.global.t('Confirmation'),
        text: i18n.global.t('Are you sure you want to delete this widget?'),
        action: () => {
          this.deleteWidget(id);
        },
        confirmText: i18n.global.t('Delete'),
        cancelText: i18n.global.t('Cancel'),
      };
      useConfirmDialogStore().openConfirmDialog(dialogConfig);
    },
    async saveWidget({ formData, currentWidget }) {
      const { stationsMap } = useStationStore();
      let widgetIndex;
      if (String(currentWidget.i).startsWith('new_')) {
        widgetIndex = this.currentPageWidgetsRaw.length + 1;
      } else {
        widgetIndex = this.currentPageWidgetsRaw.findIndex((widget) => widget.i === currentWidget.i);
      }
      const widget = {
        ...currentWidget, i: new Date().getTime(), type: formData.type,
        config: { ...formData, factoryId: formData.factoryIds, stationId: formData.stationIds.filter((id) => !!stationsMap[id]) },
        pageId: this.currentPageId,
      };
      delete widget.config.factoryIds;
      delete widget.config.stationIds;
      delete widget.config.type;
      if (formData.periodName === CUSTOM) widget.config.range = formData.range;
      const currentPageWidgetsClone = [...this.currentPageWidgetsRaw];
      currentPageWidgetsClone.splice(widgetIndex, 1, widget);
      this.setCurrentPageWidgets([...currentPageWidgetsClone]);
      this.setWidgets([...currentPageWidgetsClone, ...this.widgetsNotOnCurrentPage]);
      await this.saveDashboardConfig();
    },
    async duplicateWidget(formData) {
      const widget = cloneDeep(formData);
      widget.i = new Date().getTime();
      widget.order = this.currentPageWidgetsRaw.length;
      this.setCurrentPageWidgets([...this.currentPageWidgetsRaw, widget]);
      await this.saveDashboardConfig();
    },
    async duplicatePageWithWidgets(pageToDuplicate) {
      const timestamp = new Date().getTime();
      const newPageId = timestamp;
      const newPage = { ...pageToDuplicate, id: newPageId };
      const widgetsClone = this.widgets.filter((widget) => widget.pageId === pageToDuplicate.id);
      const newWidgets = widgetsClone.map((widget, i) => ({ ...widget, i: timestamp + i, pageId: newPageId }));
      this.applyPages([...this.pages, newPage]);
      this.setWidgets([...this.widgets, ...newWidgets]);
      this.setCurrentPageId(newPageId);
      this.setCurrentPageWidgets(newWidgets);
      await this.saveDashboardConfig();
    },
    reorderCurrentPage(widgets) {
      const orderedWidgets = widgets.map((widget, index) => ({ ...widget, order: index + 1 }));
      this.setCurrentPageWidgets(orderedWidgets);
    },
  },
  getters: {
    isLoading: (state) => !!state.loading.length,
    widgetsNotOnCurrentPage: (state) => state.widgets.filter((w) => !onSamePage(w, state) && notPlaceholder(w) && hasTab(w, state)),
    currentPageRealWidgets: (state) => state.widgets.filter((w) => onSamePage(w, state) && notPlaceholder(w)),
    isEditPages: (state) => state.isPagesEdit,
    currentPageWidgets: (state) => {
      const orderedWidgets = [...state.currentPageWidgetsRaw].sort((a, b) => {
        if (a.order) return a.order - b.order;
        return Number(`${a.y}${a.x}`) - Number(`${b.y}${b.x}`);
      });
      return [...orderedWidgets];
    },
  },
});

export default useDashboardConfigStore;
