import { setActivePinia, createPinia } from 'pinia';

import useImprovementsFileStore from './index';

import groupFiles from '@/helpers/file/groupFiles';
import improvementsFileApi from '@/api/improvementsFileApi';

vi.mock('@/helpers/file/groupFiles', () => ({
  default: vi.fn(),
}));

vi.mock('@/api/improvementsFileApi', () => ({
  default: {
    getFiles: vi.fn(),
    editFile: vi.fn(),
    uploadFiles: vi.fn(),
    deleteFile: vi.fn(),
  },
  __esModule: true,
}));

const mockCloseDialog = vi.fn();
vi.mock('@/stores/genericDialog', () => ({
  default: () => ({ closeDialog: mockCloseDialog }),
}));

const mockOpenConfirmDialog = vi.fn();
vi.mock('@/stores/confirmDialog', () => ({
  default: () => ({ openConfirmDialog: mockOpenConfirmDialog }),
}));

describe('useImprovementsFileStore', () => {
  let store;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useImprovementsFileStore();
    vi.clearAllMocks();
  });

  test('initial state', () => {
    expect(store.files).toEqual([]);
    expect(store.loading).toEqual([]);
    expect(store.uploadQueue).toEqual({});
    expect(store.failedFiles).toEqual([]);
    expect(store.failedQueue).toEqual({});
  });

  describe('actions', () => {
    test('fetchFiles', async () => {
      const files = [{ id: 1, name: 'File 1' }, { id: 2, name: 'File 2' }];
      improvementsFileApi.getFiles.mockResolvedValue(files);
      await store.fetchFiles(1);
      expect(improvementsFileApi.getFiles).toHaveBeenCalledWith(1);
      expect(store.files).toEqual(files);
      expect(store.isLoading).toBe(false);
    });

    test('modifyFile', async () => {
      const file = { id: 1, name: 'File 1' };
      const fileMeta = { title: file.title, filename: decodeURI(file.fileName), timestamp: file.timestamp };
      improvementsFileApi.editFile.mockResolvedValue();
      improvementsFileApi.getFiles.mockResolvedValue([]);
      await store.modifyFile({ file, projectId: 1 });
      expect(improvementsFileApi.editFile).toHaveBeenCalledWith(1, fileMeta);
      expect(store.isLoading).toBe(false);
    });

    test('createFile', async () => {
      const formData = new FormData();
      const config = { onUploadProgress: vi.fn() };
      improvementsFileApi.uploadFiles.mockResolvedValue();
      await store.createFile({ projectId: 1, formData, config });
      expect(improvementsFileApi.uploadFiles).toHaveBeenCalledWith(1, formData, config);
      expect(store.isLoading).toBe(false);
    });

    test('deleteFile', async () => {
      store.files = [
        {
          id: 1, fileName: 'File 1', timestamp: '2021-01-01T01:00:00', path: 'path',
        },
        {
          id: 2, fileName: 'File 2', timestamp: '2021-02-01T01:00:00', path: 'path1',
        },
      ];
      const file = store.files[0];
      improvementsFileApi.deleteFile.mockResolvedValue();
      await store.deleteFile({ projectId: 1, file });
      expect(improvementsFileApi.deleteFile).toHaveBeenCalledWith(1, { filename: file.fileName, timestamp: file.timestamp });
      expect(store.files).toEqual([{
        id: 2, fileName: 'File 2', timestamp: '2021-02-01T01:00:00', path: 'path1',
      }]);
      expect(store.isLoading).toBe(false);
    });

    test('resetFilesUploadQueue', () => {
      store.uploadQueue = { 0: { size: 0, percentage: 0, status: 'started' } };
      store.failedFiles = [[{ title: 'File 1' }]];
      store.failedQueue = { 0: { size: 0, percentage: 0, status: 'started' } };
      store.resetFilesUploadQueue();
      expect(store.uploadQueue).toEqual({});
      expect(store.failedFiles).toEqual([]);
      expect(store.failedQueue).toEqual({});
    });
  });

  describe('getters', () => {
    test('filesMap', () => {
      store.files = [
        { id: 1, title: 'File 1', stepId: 1 },
        { id: 2, title: 'File 2', stepId: 2 },
        { id: 3, title: 'File 3', stepId: 1 },
      ];
      expect(store.filesMap).toEqual({
        1: { id: 1, title: 'File 1', stepId: 1 },
        2: { id: 2, title: 'File 2', stepId: 2 },
        3: { id: 3, title: 'File 3', stepId: 1 },
      });
    });

    test('filesByMonth', () => {
      store.files = [
        { id: 1, title: 'File 1', timestamp: '2021-01-01T01:00:00' },
      ];
      const result = { '2021-01': [{ id: 1, title: 'File 1', timestamp: '2021-01-01T00:00:00Z' }] };
      groupFiles.mockReturnValue(result);
      expect(store.filesByMonth).toEqual(result);
    });

    test('isLoading', () => {
      expect(store.isLoading).toBe(false);
      store.loading.push('loading');
      expect(store.isLoading).toBe(true);
    });
  });
});
