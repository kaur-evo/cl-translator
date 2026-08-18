import { setActivePinia, createPinia } from 'pinia';

import useCustomReportStore from './index';

import reportsApi from '@/api/reportsApi';
import downloadFile from '@/helpers/file/downloadFile';
import useGenericNotificationStore from '@/stores/genericNotification';
import useGenericDialogStore from '@/stores/genericDialog';
import useFeatureStore from '@/stores/feature';
import useConfigurationStore from '@/stores/configuration';

vi.mock('@/helpers/file/downloadFile', () => ({
  default: vi.fn((val) => val),
  __esModule: true,
}));

vi.mock('@/api/reportsApi', () => ({
  default: {
    getCustomReportsList: vi.fn(),
    getCustomReport: vi.fn(),
    exportCustomReport: vi.fn(),
  },
  __esModule: true,
}));

vi.mock('@/stores/genericNotification', () => ({
  default: vi.fn(),
  __esModule: true,
}));

vi.mock('@/stores/genericDialog', () => ({
  default: vi.fn(),
  __esModule: true,
}));

vi.mock('@/stores/feature', () => ({
  default: vi.fn(),
  __esModule: true,
}));

vi.mock('@/stores/configuration', () => ({
  default: vi.fn(),
  __esModule: true,
}));

vi.mock('@/stores/reportsConfig/configurations/dialogConfig', () => ({
  default: {
    REPORTS_EXPORT_INFO_DIALOG: { component: 'ReportsExportInfoDialog' },
  },
  __esModule: true,
}));

vi.mock('@/services/i18n', () => ({
  default: {
    global: {
      t: (key) => key,
    },
  },
  __esModule: true,
}));

describe('useCustomReportStore', () => {
  let store;
  let mockNotificationStore;
  let mockDialogStore;
  let mockFeatureStore;
  let mockConfigurationStore;

  beforeEach(() => {
    setActivePinia(createPinia());

    mockNotificationStore = {
      notifySuccess: vi.fn(),
      notifyError: vi.fn(),
    };
    useGenericNotificationStore.mockReturnValue(mockNotificationStore);

    mockDialogStore = {
      closeDialog: vi.fn(),
      openDialog: vi.fn(),
    };
    useGenericDialogStore.mockReturnValue(mockDialogStore);

    mockFeatureStore = {
      customReportingEnabled: true,
    };
    useFeatureStore.mockReturnValue(mockFeatureStore);

    mockConfigurationStore = {
      checklistStations: [1],
    };
    useConfigurationStore.mockReturnValue(mockConfigurationStore);

    store = useCustomReportStore();
    vi.clearAllMocks();

    // Re-apply mocks after clearAllMocks
    useGenericNotificationStore.mockReturnValue(mockNotificationStore);
    useGenericDialogStore.mockReturnValue(mockDialogStore);
    useFeatureStore.mockReturnValue(mockFeatureStore);
    useConfigurationStore.mockReturnValue(mockConfigurationStore);
  });

  test('initial state', () => {
    expect(store.customReports).toEqual([]);
    expect(store.defaultReports).toEqual([]);
    expect(store.reportLoadingMap).toEqual({});
    expect(store.customReportController).toBeInstanceOf(AbortController);
  });

  describe('actions', () => {
    test('fetchCustomReports when customReportingEnabled is true', async () => {
      const customReports = [{ id: 1, name: 'Report 1' }, { id: 2, name: 'Report 2' }];
      mockFeatureStore.customReportingEnabled = true;
      reportsApi.getCustomReportsList.mockResolvedValueOnce(customReports);
      await store.fetchCustomReports();
      expect(reportsApi.getCustomReportsList).toHaveBeenCalledTimes(1);
      expect(store.customReports).toEqual(customReports);
    });

    test('fetchCustomReports when customReportingEnabled is false', async () => {
      mockFeatureStore.customReportingEnabled = false;
      await store.fetchCustomReports();
      expect(reportsApi.getCustomReportsList).not.toHaveBeenCalled();
      expect(store.customReports).toEqual([]);
    });

    test('fetchDefaultReports', async () => {
      const defaultReports = [{ id: 3, name: 'Report 3' }, { id: 4, name: 'Report 4' }];
      reportsApi.getCustomReportsList.mockResolvedValueOnce(defaultReports);
      await store.fetchDefaultReports();
      expect(reportsApi.getCustomReportsList).toHaveBeenCalledWith({ isDefault: true });
      expect(store.defaultReports).toEqual(defaultReports);
    });

    test('downloadCustomReport', async () => {
      const reportName = 'Report 1';
      const params = { startDate: '2022-01-01', endDate: '2022-01-31' };
      reportsApi.getCustomReport.mockResolvedValueOnce();
      await store.downloadCustomReport({ reportName, params });
      expect(reportsApi.getCustomReport).toHaveBeenCalledWith(reportName, params);
      expect(mockNotificationStore.notifySuccess).toHaveBeenCalledWith('Download finished');
      expect(store.reportLoadingMap[reportName]).toBe(false);
    });

    test('downloadCustomReport with error', async () => {
      const reportName = 'Report 1';
      const params = { startDate: '2022-01-01', endDate: '2022-01-31' };
      const error = new Error('Export failed');
      reportsApi.getCustomReport.mockRejectedValueOnce(error);
      await store.downloadCustomReport({ reportName, params });
      expect(reportsApi.getCustomReport).toHaveBeenCalledWith(reportName, params);
      expect(mockNotificationStore.notifyError).toHaveBeenCalledWith('Export failed');
      expect(store.reportLoadingMap[reportName]).toBe(false);
    });

    test('exportCustomReport', async () => {
      const reportName = 'Report 1';
      const params = { startDate: '2022-01-01', endDate: '2022-01-31' };
      reportsApi.exportCustomReport.mockResolvedValueOnce({
        data: 'data',
        headers: { 'content-disposition': 'attachment;filename="speedloss.xlsx""' },
      });
      await store.exportCustomReport({ reportName, params });
      expect(reportsApi.exportCustomReport).toHaveBeenCalledWith(reportName, params, {
        signal: store.customReportController.signal,
      });
      expect(mockNotificationStore.notifySuccess).toHaveBeenCalledWith('Download finished');
      expect(downloadFile).toHaveBeenCalledWith('data', 'speedloss.xlsx');
      expect(mockDialogStore.closeDialog).toHaveBeenCalled();
      expect(store.reportLoadingMap[reportName]).toBe(false);
    });

    test('exportCustomReport with error', async () => {
      const reportName = 'Report 1';
      const params = { startDate: '2022-01-01', endDate: '2022-01-31' };
      const error = { response: { status: 409 } };
      reportsApi.exportCustomReport.mockRejectedValueOnce(error);
      await store.exportCustomReport({ reportName, params });
      expect(reportsApi.exportCustomReport).toHaveBeenCalledWith(reportName, params, {
        signal: store.customReportController.signal,
      });
      expect(mockNotificationStore.notifyError).toHaveBeenCalledWith('Export failed');
      expect(store.reportLoadingMap[reportName]).toBe(false);
    });

    test('exportCustomReport if it is canceled', async () => {
      const reportName = 'Report 1';
      const params = { startDate: '2022-01-01', endDate: '2022-01-31' };
      const error = { code: 'ERR_CANCELED' };
      reportsApi.exportCustomReport.mockRejectedValueOnce(error);
      await store.exportCustomReport({ reportName, params });
      expect(reportsApi.exportCustomReport).toHaveBeenCalledWith(reportName, params, {
        signal: store.customReportController.signal,
      });
      expect(mockNotificationStore.notifyError).not.toHaveBeenCalled();
      expect(store.reportLoadingMap[reportName]).toBe(false);
    });

    test('cancelExportCustomReportRequest', () => {
      const abort = vi.fn();
      store.customReportController.abort = abort;
      store.cancelExportCustomReportRequest();
      expect(abort).toHaveBeenCalledTimes(1);
    });
  });

  describe('getters', () => {
    test('anyReportLoading is true if any report is loading', () => {
      store.reportLoadingMap = { 'Report 1': true, 'Report 2': false };
      expect(store.anyReportLoading).toBe(true);
    });

    test('anyReportLoading is false if none of the reports is loading', () => {
      store.reportLoadingMap = { 'Report 1': false, 'Report 2': false };
      expect(store.anyReportLoading).toBe(false);
    });

    test('sortedDefaultReports array is sorted by alias order', () => {
      mockConfigurationStore.checklistStations = [1];
      store.defaultReportsRaw = [
        { alias: 'CHECKLISTS' },
        { alias: 'CYCLE_TIME' },
        { alias: 'DOWNTIME' },
        { alias: 'SCRAP/OEE/QUANTITY/TIME_USAGE' },
        { alias: 'SPEEDLOSS' },
      ];
      expect(store.defaultReports).toEqual([
        { alias: 'DOWNTIME' },
        { alias: 'SPEEDLOSS' },
        { alias: 'SCRAP/OEE/QUANTITY/TIME_USAGE' },
        { alias: 'CYCLE_TIME' },
        { alias: 'CHECKLISTS' },
      ]);
    });

    test('CHECKLISTS is filtered out of sortedDefaultReports if checklistStations is empty array', () => {
      mockConfigurationStore.checklistStations = [];
      store.defaultReportsRaw = [
        { alias: 'CHECKLISTS' },
        { alias: 'CYCLE_TIME' },
        { alias: 'DOWNTIME' },
        { alias: 'SCRAP/OEE/QUANTITY/TIME_USAGE' },
        { alias: 'SPEEDLOSS' },
      ];
      expect(store.defaultReports).toEqual([
        { alias: 'DOWNTIME' },
        { alias: 'SPEEDLOSS' },
        { alias: 'SCRAP/OEE/QUANTITY/TIME_USAGE' },
        { alias: 'CYCLE_TIME' },
      ]);
    });

    test('customReportsLoading', () => {
      store.reportLoadingMap = { 'Report 1': true, 'Report 2': false };
      expect(store.customReportsLoading).toEqual({ 'Report 1': true, 'Report 2': false });
    });
  });
});
