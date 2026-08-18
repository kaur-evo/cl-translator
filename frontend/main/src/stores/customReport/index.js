import { defineStore } from 'pinia';

import i18n from '@/services/i18n';
import downloadFile from '@/helpers/file/downloadFile';
import dialogConfig from '@/stores/reportsConfig/configurations/dialogConfig';
import reportsApi from '@/api/reportsApi';
import useGenericNotificationStore from '@/stores/genericNotification';
import useGenericDialogStore from '@/stores/genericDialog';
import useFeatureStore from '@/stores/feature';
import useConfigurationStore from '@/stores/configuration';
import { ERROR_REQUEST_TIMEOUT } from '@/constants/error';

const DEFAULT_REPORTS_ORDER = {
  DOWNTIME: 0,
  SPEEDLOSS: 1,
  'SCRAP/OEE/QUANTITY/TIME_USAGE': 2,
  CYCLE_TIME: 3,
  CHECKLISTS: 4,
};

const useCustomReportStore = defineStore('customReport', {
  state: () => ({
    customReports: [],
    defaultReportsRaw: [],
    reportLoadingMap: {},
    customReportController: new AbortController(),
  }),
  actions: {
    async fetchCustomReports() {
      const featureStore = useFeatureStore();
      if (!featureStore.customReportingEnabled) return;
      const customReports = await reportsApi.getCustomReportsList() || [];
      this.customReports = customReports;
    },
    async fetchDefaultReports() {
      const defaultReports = await reportsApi.getCustomReportsList({ isDefault: true }) || [];
      this.defaultReportsRaw = defaultReports;
    },
    async downloadCustomReport({ reportName, params }) {
      this.reportLoadingMap[reportName] = true;
      let reportData = null;
      try {
        reportData = await reportsApi.getCustomReport(reportName, params);
        const genericNotificationStore = useGenericNotificationStore();
        genericNotificationStore.notifySuccess(i18n.global.t('Download finished'));
        downloadFile(reportData, `${reportName}.xlsx`);
      } catch {
        const genericNotificationStore = useGenericNotificationStore();
        genericNotificationStore.notifyError(i18n.global.t('Export failed'));
      }
      this.reportLoadingMap[reportName] = false;
    },
    async exportCustomReport({ reportName, params }) {
      this.cancelExportCustomReportRequest();
      this.customReportController = new AbortController();
      this.reportLoadingMap[reportName] = true;
      try {
        const response = await reportsApi.exportCustomReport(reportName, params, {
          signal: this.customReportController.signal,
        });
        const fileName = response.headers['content-disposition'].split('filename=')[1].replace(/"/g, '');
        const genericNotificationStore = useGenericNotificationStore();
        const genericDialogStore = useGenericDialogStore();
        genericNotificationStore.notifySuccess(i18n.global.t('Download finished'));
        downloadFile(response.data, fileName);
        genericDialogStore.closeDialog();
      } catch (error) {
        if (error.code !== 'ERR_CANCELED') {
          const genericDialogStore = useGenericDialogStore();
          const genericNotificationStore = useGenericNotificationStore();
          genericDialogStore.closeDialog();
          if (error.response?.status === ERROR_REQUEST_TIMEOUT) {
            genericDialogStore.openDialog({ ...dialogConfig.REPORTS_EXPORT_INFO_DIALOG, data: { reportName } });
          } else {
            genericNotificationStore.notifyError(i18n.global.t('Export failed'));
          }
        }
      } finally {
        this.reportLoadingMap[reportName] = false;
      }
    },
    cancelExportCustomReportRequest() {
      if (this.customReportController) this.customReportController.abort();
    },
  },
  getters: {
    anyReportLoading: (state) => Object.values(state.reportLoadingMap).some((loading) => !!loading),
    defaultReports: (state) => state.defaultReportsRaw
      .filter((report) => report.alias !== 'CHECKLISTS' || useConfigurationStore().checklistStations.length > 0)
      .sort((a, b) => DEFAULT_REPORTS_ORDER[a.alias] - (DEFAULT_REPORTS_ORDER[b.alias] ?? Infinity)),
    customReportsLoading: (state) => state.reportLoadingMap,
  },
});

export default useCustomReportStore;
