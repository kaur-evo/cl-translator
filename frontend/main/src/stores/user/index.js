import { defineStore } from 'pinia';

import listToKeyMap from '@/helpers/list/listToKeyMap';
import userApi from '@/api/userApi';
import useGenericNotificationStore from '@/stores/genericNotification';
import useProfileStore from '@/stores/profile';

const useUserStore = defineStore('user', {
  state: () => ({
    users: [],
    loading: [],
  }),
  actions: {
    startLoading() {
      this.loading.push('loading');
    },
    finishLoading() {
      this.loading.pop();
    },
    setUsers(users) {
      this.users = users;
    },
    setUser(user) {
      const index = this.users.findIndex((u) => u.username === user.username);
      if (index > -1) {
        this.users[index] = user;
      } else {
        this.users.push(user);
      }
    },
    removeUser(userName) {
      const index = this.users.findIndex((u) => u.username === userName);
      if (index > -1) this.users.splice(index, 1);
    },
    async fetchUsers(params) {
      this.startLoading();
      try {
        const users = await userApi.getUserList(params);
        this.setUsers(users);
      } catch (error) {
        useGenericNotificationStore().notifyError(error.response.data.message);
      } finally {
        this.finishLoading();
      }
    },
    async saveUser(data) {
      this.startLoading();
      let user;
      try {
        if (data.newUser) {
          user = await userApi.postUser(data);
          useGenericNotificationStore().notifyAdded(user.username);
        } else {
          user = await userApi.putUser(data);
          useGenericNotificationStore().notifyUpdated(user.username);
        }
        this.setUser(user);
        return user;
      } catch (error) {
        useGenericNotificationStore().notifyError(error.response.data.message);
        return error;
      } finally {
        this.finishLoading();
      }
    },
    async deleteUser(user) {
      this.startLoading();
      try {
        await userApi.deleteUser(user.username);
        useGenericNotificationStore().notifyDeleted(user.username);
        this.removeUser(user.username);
      } catch (error) {
        useGenericNotificationStore().notifyError(error.response.data.message);
      } finally {
        this.finishLoading();
      }
    },
  },
  getters: {
    allUsers: (state) => [...state.users, useProfileStore().currentUser],
    allUsersMap() {
      return listToKeyMap(this.allUsers, 'username');
    },
    usersMap: (state) => listToKeyMap(state.users, 'username'),
    usersRealMap: (state) => new Map(state.users.map((user) => [user.username, user])),
    isLoading: (state) => !!state.loading.length,
  },
});

export default useUserStore;
