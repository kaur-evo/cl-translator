import { setActivePinia, createPinia } from 'pinia';

import useReleasesInfoStore from './index';

import userApi from '@/api/userApi';


vi.mock('@/api/userApi');

describe('useReleasesInfoStore', () => {
  let store;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useReleasesInfoStore();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  test('initial state', () => {
    expect(store.lastRelease).toEqual({});
  });

  describe('fetchReleasesInfo', () => {
    test('fetches and sets lastRelease', async () => {
      const lastRelease = { id: 1, name: 'Release 1' };
      userApi.getReleasesInfo.mockResolvedValue(lastRelease);
      await store.fetchReleasesInfo();
      expect(userApi.getReleasesInfo).toHaveBeenCalledTimes(1);
      expect(store.lastRelease).toEqual(lastRelease);
    });
  });

  describe('putReleasesInfo', () => {
    test('updates release opened state and sets lastRelease', async () => {
      const lastRelease = { id: 1, name: 'Release 1', opened: false };
      const updated = { id: 1, name: 'Release 1', opened: true };
      userApi.putReleasesInfo.mockResolvedValue(updated);
      await store.putReleasesInfo(lastRelease);
      expect(userApi.putReleasesInfo).toHaveBeenCalledWith({ id: 1, opened: true });
      expect(store.lastRelease).toEqual(updated);
    });
  });
});
