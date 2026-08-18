import { setActivePinia, createPinia } from 'pinia';

import useYieldStore from './index';

import yieldApi from '@/api/yieldApi';
import useGenericNotificationStore from '@/stores/genericNotification';

vi.mock('@/api/yieldApi', () => ({
  default: {
    getYields: vi.fn(),
    postYields: vi.fn(),
  },
  __esModule: true,
}));

vi.mock('@/services/i18n', () => ({
  default: { global: { t: (key) => key } },
  __esModule: true,
}));

describe('useYieldStore', () => {
  let store;
  let notificationStore;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useYieldStore();
    notificationStore = useGenericNotificationStore();
    vi.spyOn(notificationStore, 'notifyError');
    vi.clearAllMocks();
  });

  test('initial state', () => {
    expect(store.yields).toEqual([]);
    expect(store.loading).toEqual([]);
  });

  describe('actions', () => {
    test('setYields', () => {
      const yields = [{ id: 123, yield: 50 }, { id: 124, yield: 60 }];
      store.setYields(yields);
      expect(store.yields).toEqual(yields);
    });

    test('fetchYields', async () => {
      const yields = [{ id: 123, yield: 50 }, { id: 124, yield: 60 }];
      yieldApi.getYields.mockResolvedValue(yields);
      await store.fetchYields();
      expect(yieldApi.getYields).toHaveBeenCalledTimes(1);
      expect(store.yields).toEqual(yields);
      expect(store.loading).toEqual([]);
    });

    test('fetchYields with error', async () => {
      yieldApi.getYields.mockRejectedValueOnce();
      await store.fetchYields();
      expect(notificationStore.notifyError).toHaveBeenCalledWith('We are sorry! There is a problem with your request');
      expect(store.loading).toEqual([]);
    });

    test('saveYields', async () => {
      const body = { startDate: '2020-01-01', endDate: '2020-01-31', yields: [{ yield: 50 }] };
      yieldApi.postYields.mockResolvedValue(body);
      yieldApi.getYields.mockResolvedValue([]);
      await store.saveYields(body);
      expect(yieldApi.postYields).toHaveBeenCalledWith(body);
      expect(store.loading).toEqual([]);
    });

    test('saveYields with error', async () => {
      const error = { response: { data: { message: 'Saving yield failed' } } };
      yieldApi.postYields.mockRejectedValueOnce(error);
      await store.saveYields({ yields: [] });
      expect(notificationStore.notifyError).toHaveBeenCalledWith('Saving yield failed');
    });
  });

  describe('getters', () => {
    test('yields', () => {
      store.yields = [{ id: 123, yield: 50 }, { id: 124, yield: 60 }];
      expect(store.yields).toEqual([{ id: 123, yield: 50 }, { id: 124, yield: 60 }]);
    });

    test('isLoading', () => {
      expect(store.isLoading).toBe(false);
      store.loading.push('loading');
      expect(store.isLoading).toBe(true);
    });
  });
});
