import { defineStore } from 'pinia';

import improvementsFileApi from '@/api/improvementsFileApi';
import i18n from '@/services/i18n';
import groupFiles from '@/helpers/file/groupFiles';

const useImprovementsFileStore = defineStore('improvementsFile', {
  state: () => ({
    files: [],
    loading: [],
    uploadQueue: {},
    failedFiles: [],
    failedQueue: {},
  }),
  getters: {
    filesMap: (state) => state.files.reduce((map, note) => ({ ...map, [note.id]: note }), {}),
    filesByMonth: (state) => groupFiles(state.files),
    isLoading: (state) => !!state.loading.length,
  },
  actions: {
    async fetchFiles(projectId) {
      this.loading.push('loading');
      try {
        const files = await improvementsFileApi.getFiles(projectId) || [];
        this.files = files;
      } finally {
        this.loading.pop();
      }
    },
    async modifyFile({ file, projectId }) {
      this.loading.push('loading');
      const fileMeta = { title: file.title, filename: decodeURI(file.fileName), timestamp: file.timestamp };
      if (file.stepId) fileMeta.stepId = file.stepId;
      try {
        await improvementsFileApi.editFile(projectId, fileMeta);
        await this.fetchFiles(projectId);
      } finally {
        this.loading.pop();
      }
    },
    async createFile({ projectId, formData, config }) {
      this.loading.push('loading');
      try {
        await improvementsFileApi.uploadFiles(projectId, formData, config);
      } finally {
        this.loading.pop();
      }
    },
    async addFileListToUploadQueue({
      fileList, index = 0, groupTimestamp, projectId,
    }) {
      const formData = new FormData();
      fileList.forEach((file) => {
        formData.append(file.title, file.currentFile);
      });
      formData.append('timestamp', groupTimestamp);
      if (fileList[0].stepId) formData.append('stepid', fileList[0].stepId);
      const config = {
        onUploadProgress: (progressEvent) => {
          const percentage = Math.round(
            (progressEvent.loaded / progressEvent.total) * 100,
          );
          this.uploadQueue[index].percentage = percentage;
          this.uploadQueue[index].size = progressEvent.loaded;
          this.uploadQueue[index].status = 'started';
        },
      };
      this.uploadQueue = {
        ...this.uploadQueue,
        [index]: {
          size: 0,
          percentage: 0,
          status: 'started',
        },
      };
      try {
        await this.createFile({ projectId, formData, config });
        this.uploadQueue[index].status = 'finished';
      } catch {
        this.uploadQueue[index].status = 'failed';
        this.failedFiles.push(fileList);
        this.failedQueue = {
          ...this.failedQueue,
          [this.failedFiles.length - 1]: this.uploadQueue[index],
        };
      }
    },
    async addFilesToUploadQueue({
      files, groupTimestamp, projectId, selectedCB,
    }) {
      this.loading.push('loading');
      this.uploadQueue = {};
      if (!files.length) return;
      const promiseList = [];
      const fileBatches = files.reduce((acc, file) => {
        const step = file.stepId || 'noStep';
        if (!acc[step]) acc[step] = [];
        acc[step].push(file);
        return acc;
      }, {});
      Object.values(fileBatches).forEach((fileList, index) => {
        promiseList.push(
          this.addFileListToUploadQueue({
            fileList, index, groupTimestamp, projectId,
          }),
        );
      });
      try {
        await Promise.all(promiseList);
        if (this.failedFiles.length) {
          if (selectedCB) selectedCB(this.failedFiles);
          this.uploadQueue = this.failedQueue;
          this.failedFiles = [];
          this.failedQueue = {};
        } else {
          if (selectedCB) selectedCB([]);
          this.uploadQueue = {};
          await this.fetchFiles(projectId);
        }
      } finally {
        this.loading.pop();
      }
    },
    async deleteFile({ projectId, file }) {
      this.loading.push('loading');
      try {
        const fileBody = { filename: decodeURI(file.fileName), timestamp: file.timestamp };
        await improvementsFileApi.deleteFile(projectId, fileBody);
        const index = this.files.findIndex((currentFile) => String(currentFile.path) === String(file.path));
        if (index > -1) {
          this.files.splice(index, 1);
        }
      } finally {
        this.loading.pop();
      }
    },
    async initDeleteFileFlow({ projectId, file }) {
      const { default: useConfirmDialogStore } = await import('@/stores/confirmDialog');
      const confirmDialogStore = useConfirmDialogStore();
      const { default: useGenericDialogStore } = await import('@/stores/genericDialog');
      const genericDialogStore = useGenericDialogStore();
      const dialogConfig = {
        title: i18n.global.t('Confirmation'),
        text: i18n.global.t('Are you sure you want to delete this?'),
        action: async () => {
          await this.deleteFile({ projectId, file });
          genericDialogStore.closeDialog();
        },
        confirmText: i18n.global.t('Delete'),
        cancelText: i18n.global.t('Cancel'),
      };
      confirmDialogStore.openConfirmDialog(dialogConfig);
    },
    resetFilesUploadQueue() {
      this.uploadQueue = {};
      this.failedFiles = [];
      this.failedQueue = {};
    },
  },
});

export default useImprovementsFileStore;
