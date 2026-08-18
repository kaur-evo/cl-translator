import { defineStore } from 'pinia';

import settingsFileApi from '@/api/settingsFileApi';

const fileTypeErrorCode = 422;

const useSettingsFileUploadStore = defineStore('settingsFileUpload', {
  state: () => ({
    loading: [],
    import: {
      result: {},
      status: 'started',
    },
    failed: {},
  }),
  actions: {
    async importFile({ file, reportName }) {
      this.loading.push('loading');
      const formData = new FormData();
      formData.append('file', file.currentFile);
      try {
        this.import.result = await settingsFileApi.importFile(reportName, formData);
      } catch (error) {
        this.failed = { file, error };
      } finally {
        this.import.status = 'finished';
        this.loading.pop();
      }
    },
    async exportFile({ reportId, reportName, includeDeleted }) {
      this.loading.push('loading');
      try {
        const response = await settingsFileApi.exportFile(reportId, includeDeleted);
        const url = window.URL.createObjectURL(new Blob([response]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${reportName}.xlsx`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      } finally {
        this.loading.pop();
      }
    },
    resetState() {
      this.loading = [];
      this.import = {
        result: {},
        status: 'started',
      };
      this.failed = {};
    },
  },
  getters: {
    isLoading: (state) => state.loading.length > 0,
    importResult: (state) => state.import.result || {},
    importFinished: (state) => !!(state.import && state.import.status === 'finished'),
    importFailed: (state) => Object.keys(state.failed).length > 0,
    importProgress: (state) => state.import.percentage || 0,
    hasFileTypeError() {
      return this.importFailed && this.failed?.error?.response?.status === fileTypeErrorCode;
    },
  },
});

export default useSettingsFileUploadStore;
