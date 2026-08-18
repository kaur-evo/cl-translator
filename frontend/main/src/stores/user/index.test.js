import { setActivePinia, createPinia } from 'pinia';

import useUserStore from './index';

import userApi from '@/api/userApi';
import useGenericNotificationStore from '@/stores/genericNotification';
import useProfileStore from '@/stores/profile';

vi.mock('@/api/userApi', () => ({
  default: {
    getUserList: vi.fn(),
    getUser: vi.fn(),
    postUser: vi.fn(),
    putUser: vi.fn(),
    deleteUser: vi.fn(),
  },
  __esModule: true,
}));

describe('useUserStore', () => {
  let store;
  let notificationStore;
  let profileStore;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useUserStore();
    notificationStore = useGenericNotificationStore();
    vi.spyOn(notificationStore, 'notifyError');
    vi.spyOn(notificationStore, 'notifyAdded');
    vi.spyOn(notificationStore, 'notifyUpdated');
    vi.spyOn(notificationStore, 'notifyDeleted');
    profileStore = useProfileStore();
    profileStore.currentUser = { username: 'currentUser', name: 'Current User' };
    vi.clearAllMocks();
  });

  test('initial state', () => {
    expect(store.users).toEqual([]);
    expect(store.loading).toEqual([]);
  });

  describe('actions', () => {
    test('setUsers', () => {
      const users = [{ username: 'user1' }, { username: 'user2' }];
      store.setUsers(users);
      expect(store.users).toEqual(users);
    });

    test('setUser with existing user', () => {
      store.users = [{ username: 'user1', name: 'user 1' }, { username: 'user2', name: 'user 2' }];
      store.setUser({ username: 'user1', name: 'new name' });
      expect(store.users).toEqual([{ username: 'user1', name: 'new name' }, { username: 'user2', name: 'user 2' }]);
    });

    test('setUser with new user', () => {
      store.users = [{ username: 'user1', name: 'user 1' }];
      store.setUser({ username: 'user2', name: 'user 2' });
      expect(store.users).toEqual([{ username: 'user1', name: 'user 1' }, { username: 'user2', name: 'user 2' }]);
    });

    test('removeUser that exists', () => {
      store.users = [{ username: 'user1', name: 'user 1' }, { username: 'user2', name: 'user 2' }];
      store.removeUser('user1');
      expect(store.users).toEqual([{ username: 'user2', name: 'user 2' }]);
    });

    test('removeUser that does not exist', () => {
      store.users = [{ username: 'user1', name: 'user 1' }, { username: 'user2', name: 'user 2' }];
      store.removeUser('user3');
      expect(store.users).toEqual([{ username: 'user1', name: 'user 1' }, { username: 'user2', name: 'user 2' }]);
    });

    test('startLoading and finishLoading', () => {
      store.startLoading();
      expect(store.loading).toEqual(['loading']);
      store.startLoading();
      expect(store.loading).toEqual(['loading', 'loading']);
      store.finishLoading();
      expect(store.loading).toEqual(['loading']);
      store.finishLoading();
      expect(store.loading).toEqual([]);
    });

    test('fetchUsers', async () => {
      const users = [{ username: 'test 1' }, { username: 'test 2' }];
      userApi.getUserList.mockResolvedValueOnce(users);
      const params = { role: 'LINEVIEW_USER' };
      await store.fetchUsers(params);
      expect(userApi.getUserList).toHaveBeenCalledWith(params);
      expect(store.users).toEqual(users);
      expect(store.loading).toEqual([]);
    });

    test('fetchUsers with error', async () => {
      userApi.getUserList.mockRejectedValueOnce({ response: { data: { message: 'error' } } });
      await store.fetchUsers({ role: 'LINEVIEW_USER' });
      expect(notificationStore.notifyError).toHaveBeenCalledWith('error');
      expect(store.loading).toEqual([]);
    });

    test('saveUser with new user', async () => {
      const user = { username: 'test@user', name: 'test user' };
      userApi.postUser.mockResolvedValueOnce(user);
      const result = await store.saveUser({ username: 'user@name', name: 'user name', newUser: true });
      expect(userApi.postUser).toHaveBeenCalledTimes(1);
      expect(notificationStore.notifyAdded).toHaveBeenCalledWith('test@user');
      expect(result).toEqual(user);
      expect(store.loading).toEqual([]);
    });

    test('saveUser with existing user', async () => {
      const user = { username: 'test@user', name: 'test user' };
      userApi.putUser.mockResolvedValueOnce(user);
      const result = await store.saveUser({ username: 'user@name', name: 'user name' });
      expect(userApi.putUser).toHaveBeenCalledTimes(1);
      expect(notificationStore.notifyUpdated).toHaveBeenCalledWith('test@user');
      expect(result).toEqual(user);
    });

    test('saveUser when request returns error', async () => {
      userApi.putUser.mockRejectedValueOnce({ response: { data: { message: 'error saving user' } } });
      await store.saveUser({ username: 'user@name', name: 'user name' });
      expect(notificationStore.notifyError).toHaveBeenCalledWith('error saving user');
      expect(store.loading).toEqual([]);
    });

    test('deleteUser', async () => {
      userApi.deleteUser.mockResolvedValueOnce();
      store.users = [{ username: 'user@name', name: 'user name' }];
      await store.deleteUser({ username: 'user@name', name: 'user name' });
      expect(userApi.deleteUser).toHaveBeenCalledWith('user@name');
      expect(notificationStore.notifyDeleted).toHaveBeenCalledWith('user@name');
      expect(store.users).toEqual([]);
    });

    test('deleteUser when request returns error', async () => {
      userApi.deleteUser.mockRejectedValueOnce({ response: { data: { message: 'cannot delete user' } } });
      await store.deleteUser({ username: 'user@name', name: 'user name' });
      expect(notificationStore.notifyError).toHaveBeenCalledWith('cannot delete user');
      expect(store.loading).toEqual([]);
    });
  });

  describe('getters', () => {
    test('users', () => {
      store.users = [{ username: 'user1', name: 'user 1' }, { username: 'user2', name: 'user 2' }];
      expect(store.users).toEqual([{ username: 'user1', name: 'user 1' }, { username: 'user2', name: 'user 2' }]);
    });

    test('usersMap', () => {
      store.users = [{ username: 'user1', name: 'user 1' }, { username: 'user2', name: 'user 2' }];
      expect(store.usersMap).toEqual({ user1: { username: 'user1', name: 'user 1' }, user2: { username: 'user2', name: 'user 2' } });
    });

    test('usersRealMap', () => {
      store.users = [{ username: 'user1', name: 'user 1' }, { username: 'user2', name: 'user 2' }];
      expect(store.usersRealMap).toEqual(new Map([['user1', { username: 'user1', name: 'user 1' }], ['user2', { username: 'user2', name: 'user 2' }]]));
    });

    test('isLoading', () => {
      expect(store.isLoading).toBe(false);
      store.loading.push('loading');
      expect(store.isLoading).toBe(true);
    });
  });
});
