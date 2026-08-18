import { defineAsyncComponent } from 'vue';

export default {
  REPORTS_NOTES_DIALOG: {
    component: defineAsyncComponent(() => import('../../../components/organisms/reports/ReportsNotesDialog/index.vue')),
    width: 1100,
  },
  REPORTS_DOWNLOAD_DIALOG: {
    component: defineAsyncComponent(() => import('../../../components/organisms/reports/ReportsDownloadDialog/index.vue')),
  },
  REPORTS_VIEW_OPTIONS: {
    component: defineAsyncComponent(() => import('../../../components/organisms/reports/ReportsViewOptionsForm/index.vue')),
  },
  REPORTS_SAVE_BOOKMARK: {
    component: defineAsyncComponent(() => import('../../../components/organisms/reports/ReportsBookmarkForm/index.vue')),
    width: 606,
  },
  REPORTS_EXPORT_INFO_DIALOG: {
    component: defineAsyncComponent(() => import('../../../components/organisms/reports/ReportsExportInfoDialog/index.vue')),
  },
  REPORTS_VIEW_SETTINGS: {
    component: defineAsyncComponent(() => import('../../../components/organisms/reports/ReportsViewSettings/index.vue')),
    allowFullscreen: true,
  },
};
