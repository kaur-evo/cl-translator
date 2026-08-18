import { setActivePinia, createPinia } from 'pinia';

import useAPIKeysStore from './index';

import APIKeysApi from '@/api/APIKeysApi';
import useGenericNotificationStore from '@/stores/genericNotification';

vi.mock('@/api/APIKeysApi', () => ({
  default: {
    getAPIKeys: vi.fn(),
    saveAPIKey: vi.fn(),
    changeAPIKeyStatus: vi.fn(),
    deleteAPIKey: vi.fn(),
  },
  __esModule: true,
}));

vi.mock('@/services/i18n', () => ({
  default: { global: { t: (key) => key } },
  __esModule: true,
}));

describe('useAPIKeysStore', () => {
  let store;
  let notificationStore;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useAPIKeysStore();
    notificationStore = useGenericNotificationStore();
    vi.spyOn(notificationStore, 'notifyError');
    vi.spyOn(notificationStore, 'notifyAdded');
    vi.spyOn(notificationStore, 'notifyUpdated');
    vi.spyOn(notificationStore, 'notifyDeleted');
    vi.clearAllMocks();
  });

  test('initial state', () => {
    expect(store.APIKeys).toEqual([]);
    expect(store.loading).toEqual([]);
  });

  describe('actions', () => {
    test('setAPIKeys', () => {
      const APIKeys = [{ keyId: 'AS12D3', enabled: true }, { keyId: 'AS12D4', enabled: false }];
      store.setAPIKeys(APIKeys);
      expect(store.APIKeys).toEqual(APIKeys);
    });

    test('addAPIKey', () => {
      store.APIKeys = [{ keyId: 'AS12D3', enabled: true }];
      store.addAPIKey({ keyId: 'AS12D4', enabled: false });
      expect(store.APIKeys).toHaveLength(2);
    });

    test('updateAPIKeyStatusInState', () => {
      store.APIKeys = [{ keyId: 'AS12D3', enabled: true }, { keyId: 'AS12D4', enabled: false }];
      store.updateAPIKeyStatusInState({ APIKey: store.APIKeys[1], body: { enabled: true } });
      expect(store.APIKeys[1].enabled).toBe(true);
    });

    test('removeAPIKeyFromState', () => {
      store.APIKeys = [{ keyId: 'AS12D3', enabled: true }, { keyId: 'AS12D4', enabled: false }];
      store.removeAPIKeyFromState('AS12D3');
      expect(store.APIKeys).toHaveLength(1);
      expect(store.APIKeys[0].keyId).toBe('AS12D4');
    });

    test('removeAPIKeyFromState with non-existent key', () => {
      store.APIKeys = [{ keyId: 'AS12D3', enabled: true }];
      store.removeAPIKeyFromState('NONEXISTENT');
      expect(store.APIKeys).toHaveLength(1);
    });

    test('fetchAPIKeys', async () => {
      const APIKeys = [{ keyId: 'AS12D3', name: 'test1' }, { keyId: 'AS12D4', name: 'test2' }];
      APIKeysApi.getAPIKeys.mockResolvedValueOnce(APIKeys);
      await store.fetchAPIKeys();
      expect(APIKeysApi.getAPIKeys).toHaveBeenCalledTimes(1);
      expect(store.APIKeys).toEqual(APIKeys);
      expect(store.loading).toEqual([]);
    });

    test('fetchAPIKeys with error', async () => {
      APIKeysApi.getAPIKeys.mockRejectedValueOnce();
      await store.fetchAPIKeys();
      expect(notificationStore.notifyError).toHaveBeenCalledWith('We are sorry! There is a problem with your request');
    });

    test('saveAPIKey', async () => {
      const body = { name: 'new key' };
      APIKeysApi.saveAPIKey.mockResolvedValueOnce(body);
      await store.saveAPIKey(body);
      expect(APIKeysApi.saveAPIKey).toHaveBeenCalledWith(body);
      expect(notificationStore.notifyAdded).toHaveBeenCalledWith('new key');
      expect(store.loading).toEqual([]);
    });

    test('saveAPIKey with error', async () => {
      const error = { response: { data: { message: 'Saving API key failed' } } };
      APIKeysApi.saveAPIKey.mockRejectedValueOnce(error);
      await store.saveAPIKey({ name: 'new key' });
      expect(notificationStore.notifyError).toHaveBeenCalledWith('Saving API key failed');
    });

    test('changeAPIKeyStatus', async () => {
      const APIKey = { keyId: 'AS12D3', name: 'test1' };
      store.APIKeys = [{ ...APIKey, enabled: true }];
      const params = { APIKey, body: { enabled: false } };
      APIKeysApi.changeAPIKeyStatus.mockResolvedValueOnce(params);
      await store.changeAPIKeyStatus(params);
      expect(APIKeysApi.changeAPIKeyStatus).toHaveBeenCalledWith('AS12D3', { enabled: false });
      expect(notificationStore.notifyUpdated).toHaveBeenCalledWith('test1');
    });

    test('changeAPIKeyStatus with error', async () => {
      const error = { response: { data: { message: 'Changing API key status failed' } } };
      APIKeysApi.changeAPIKeyStatus.mockRejectedValueOnce(error);
      await store.changeAPIKeyStatus({ APIKey: { keyId: 'AS12D3', name: 'test1' }, body: { enabled: false } });
      expect(notificationStore.notifyError).toHaveBeenCalledWith('Changing API key status failed');
    });

    test('deleteAPIKey', async () => {
      store.APIKeys = [{ keyId: 'AS12D3' }];
      APIKeysApi.deleteAPIKey.mockResolvedValueOnce({});
      await store.deleteAPIKey('AS12D3');
      expect(APIKeysApi.deleteAPIKey).toHaveBeenCalledWith('AS12D3');
      expect(notificationStore.notifyDeleted).toHaveBeenCalledWith('AS12D3');
      expect(store.APIKeys).toEqual([]);
    });

    test('deleteAPIKey with error', async () => {
      const error = { response: { data: { message: 'Deleting API key failed' } } };
      APIKeysApi.deleteAPIKey.mockRejectedValueOnce(error);
      await store.deleteAPIKey('AS12D3');
      expect(notificationStore.notifyError).toHaveBeenCalledWith('Deleting API key failed');
    });
  });

  describe('getters', () => {
    test('APIKeys', () => {
      store.APIKeys = [{ keyId: 'AS12D3', enabled: true }];
      expect(store.APIKeys).toEqual([{ keyId: 'AS12D3', enabled: true }]);
    });

    test('isLoading', () => {
      expect(store.isLoading).toBe(false);
      store.loading.push('loading');
      expect(store.isLoading).toBe(true);
    });
  });
});
