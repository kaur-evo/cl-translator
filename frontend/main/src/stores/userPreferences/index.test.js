import { setActivePinia, createPinia } from 'pinia';

import useUserPreferencesStore from './index';

import userPreferencesApi from '@/api/userPreferencesApi';

vi.mock('@/api/userPreferencesApi', () => ({
  default: {
    getUserPreferences: vi.fn(),
    saveUserPreferences: vi.fn(),
  },
  __esModule: true,
}));

const mockNotifyError = vi.fn();
vi.mock('@/stores/genericNotification', () => ({
  default: () => ({ notifyError: mockNotifyError }),
}));

describe('useUserPreferencesStore', () => {
  let store;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useUserPreferencesStore();
    vi.clearAllMocks();
  });

  test('initial state', () => {
    expect(store.viewSettings).toEqual({});
    expect(store.loading).toEqual([]);
    expect(store.isLoading).toBe(false);
  });

  describe('fetchUserPreferences', () => {
    test('fetches and sets view settings', async () => {
      const viewSettings = { theme: 'dark', layout: 'grid' };
      userPreferencesApi.getUserPreferences.mockResolvedValue(viewSettings);
      await store.fetchUserPreferences();
      expect(userPreferencesApi.getUserPreferences).toHaveBeenCalledTimes(1);
      expect(store.viewSettings).toEqual(viewSettings);
      expect(store.isLoading).toBe(false);
    });

    test('notifies error on failure', async () => {
      const error = { response: { data: { message: 'Fetch failed' } } };
      userPreferencesApi.getUserPreferences.mockRejectedValue(error);
      await store.fetchUserPreferences();
      expect(mockNotifyError).toHaveBeenCalledWith('Fetch failed');
      expect(store.isLoading).toBe(false);
    });
  });

  describe('saveViewSettings', () => {
    test('saves and sets view settings', async () => {
      const preferences = { theme: 'light' };
      const viewSettings = { theme: 'light', layout: 'list' };
      userPreferencesApi.saveUserPreferences.mockResolvedValue(viewSettings);
      await store.saveViewSettings(preferences);
      expect(userPreferencesApi.saveUserPreferences).toHaveBeenCalledWith(preferences);
      expect(store.viewSettings).toEqual(viewSettings);
      expect(store.isLoading).toBe(false);
    });

    test('notifies error on failure', async () => {
      const error = { response: { data: { message: 'Save failed' } } };
      userPreferencesApi.saveUserPreferences.mockRejectedValue(error);
      await store.saveViewSettings({});
      expect(mockNotifyError).toHaveBeenCalledWith('Save failed');
      expect(store.isLoading).toBe(false);
    });
  });
});
