import { defineStore } from 'pinia';

import userPreferencesApi from '@/api/userPreferencesApi';

const useUserPreferencesStore = defineStore('userPreferences', {
  state: () => ({
    viewSettings: {},
    loading: [],
  }),
  getters: {
    isLoading: (state) => !!state.loading.length,
  },
  actions: {
    async fetchUserPreferences() {
      this.loading.push('loading');
      try {
        const viewSettings = await userPreferencesApi.getUserPreferences();
        this.viewSettings = viewSettings;
      } catch (error) {
        const { default: useGenericNotificationStore } = await import('@/stores/genericNotification');
        const genericNotificationStore = useGenericNotificationStore();
        genericNotificationStore.notifyError(error.response.data.message);
      } finally {
        this.loading.pop();
      }
    },
    async saveViewSettings(preferences) {
      this.loading.push('loading');
      try {
        const viewSettings = await userPreferencesApi.saveUserPreferences(preferences);
        this.viewSettings = viewSettings;
      } catch (error) {
        const { default: useGenericNotificationStore } = await import('@/stores/genericNotification');
        const genericNotificationStore = useGenericNotificationStore();
        genericNotificationStore.notifyError(error.response.data.message);
      } finally {
        this.loading.pop();
      }
    },
  },
});

export default useUserPreferencesStore;
