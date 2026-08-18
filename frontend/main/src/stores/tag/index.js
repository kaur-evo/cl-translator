import { defineStore } from 'pinia';

import tagApi from '@/api/tagApi';
import i18n from '@/services/i18n';
import useGenericNotificationStore from '@/stores/genericNotification';

const useTagStore = defineStore('tag', {
  state: () => ({
    tagsList: [],
    loading: [],
  }),
  actions: {
    startLoading() {
      this.loading.push('loading');
    },
    finishLoading() {
      this.loading.pop();
    },
    setTagDeleted(id) {
      const tag = this.tagsList.find((el) => el.id === id);
      if (tag) tag.deleted = true;
    },
    async fetchTags(params = {}) {
      this.startLoading();
      try {
        this.tagsList = await tagApi.getTags(params) || [];
      } catch (error) {
        this.tagsList = [];
        const notificationStore = useGenericNotificationStore();
        notificationStore.notifyError(error?.response?.data?.message || 'An error occurred');
      } finally {
        this.finishLoading();
      }
    },
    async saveTag(data) {
      this.startLoading();
      const notificationStore = useGenericNotificationStore();
      try {
        if (data.id) {
          await tagApi.putTag(data);
          notificationStore.notifyUpdated(i18n.global.t('Tag'));
        } else {
          await tagApi.postTag(data);
          notificationStore.notifyAdded(i18n.global.t('Tag'));
        }
        this.fetchTags();
      } catch (error) {
        notificationStore.notifyError(error?.response?.data?.message || 'An error occurred');
      } finally {
        this.finishLoading();
      }
    },
    async deleteTag({ id }) {
      this.startLoading();
      const notificationStore = useGenericNotificationStore();
      try {
        await tagApi.deleteTag(id);
        notificationStore.notifyDeleted(i18n.global.t('Tag'));
        this.setTagDeleted(id);
      } catch (error) {
        notificationStore.notifyError(error?.response?.data?.message || 'An error occurred');
      } finally {
        this.finishLoading();
      }
    },
  },
  getters: {
    tags: (state) => state.tagsList.filter((tag) => !tag.deleted),
    isLoading: (state) => !!state.loading.length,
  },
});

export default useTagStore;
