import { setActivePinia, createPinia } from 'pinia';

import useSettingsFileUploadStore from './index';

import settingsFileApi from '@/api/settingsFileApi';


vi.mock('@/api/settingsFileApi', () => ({
  default: {
    importFile: vi.fn(),
    exportFile: vi.fn(),
  },
  __esModule: true,
}));

describe('useSettingsFileUploadStore', () => {
  let store;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useSettingsFileUploadStore();
    vi.clearAllMocks();
  });

  test('initial state', () => {
    expect(store.loading).toEqual([]);
    expect(store.import).toEqual({ result: {}, status: 'started' });
    expect(store.failed).toEqual({});
  });

  describe('importFile', () => {
    test('sets import result on success', async () => {
      const importResult = { imported: 5 };
      settingsFileApi.importFile.mockResolvedValueOnce(importResult);
      const file = { currentFile: new File([''], 'test.xlsx') };
      await store.importFile({ file, reportName: 'scrap-reasons' });
      expect(store.import.result).toEqual(importResult);
      expect(store.import.status).toBe('finished');
      expect(store.loading).toEqual([]);
    });

    test('sets failed on error', async () => {
      const error = { response: { status: 422 } };
      settingsFileApi.importFile.mockRejectedValueOnce(error);
      const file = { currentFile: new File([''], 'bad.xlsx') };
      await store.importFile({ file, reportName: 'scrap-reasons' });
      expect(store.failed).toEqual({ file, error });
      expect(store.import.status).toBe('finished');
      expect(store.loading).toEqual([]);
    });
  });

  describe('resetState', () => {
    test('resets all state to initial values', () => {
      store.loading = ['loading'];
      store.import = { result: { imported: 5 }, status: 'finished' };
      store.failed = { file: {}, error: {} };
      store.resetState();
      expect(store.loading).toEqual([]);
      expect(store.import).toEqual({ result: {}, status: 'started' });
      expect(store.failed).toEqual({});
    });
  });

  describe('getters', () => {
    test('isLoading returns true when loading has entries', () => {
      store.loading.push('loading');
      expect(store.isLoading).toBe(true);
    });

    test('importResult returns empty object as default', () => {
      expect(store.importResult).toEqual({});
    });

    test('importResult returns result when set', () => {
      store.import.result = { imported: 3 };
      expect(store.importResult).toEqual({ imported: 3 });
    });

    test('importFinished returns true when status is finished', () => {
      store.import.status = 'finished';
      expect(store.importFinished).toBe(true);
    });

    test('importFinished returns false when status is started', () => {
      expect(store.importFinished).toBe(false);
    });

    test('importFailed returns true when failed is not empty', () => {
      store.failed = { file: {}, error: {} };
      expect(store.importFailed).toBe(true);
    });

    test('importProgress returns 0 by default', () => {
      expect(store.importProgress).toBe(0);
    });

    test('hasFileTypeError returns true for 422 status', () => {
      store.failed = { file: {}, error: { response: { status: 422 } } };
      expect(store.hasFileTypeError).toBe(true);
    });

    test('hasFileTypeError returns false for non-422 error', () => {
      store.failed = { file: {}, error: { response: { status: 500 } } };
      expect(store.hasFileTypeError).toBe(false);
    });
  });
});
