import { defineStore } from 'pinia';

import i18n from '@/services/i18n';
import yieldApi from '@/api/yieldApi';
import useGenericNotificationStore from '@/stores/genericNotification';

const useYieldStore = defineStore('yield', {
  state: () => ({
    yields: [],
    loading: [],
  }),
  actions: {
    startLoading() {
      this.loading.push('loading');
    },
    finishLoading() {
      this.loading.pop();
    },
    setYields(yields) {
      this.yields = yields;
    },
    async fetchYields() {
      this.startLoading();
      try {
        const yields = await yieldApi.getYields() || [];
        this.setYields(yields);
      } catch {
        useGenericNotificationStore().notifyError(i18n.global.t('We are sorry! There is a problem with your request'));
      } finally {
        this.finishLoading();
      }
    },
    async saveYields(body) {
      this.startLoading();
      try {
        const yields = await yieldApi.postYields(body);
        this.fetchYields();
        return yields;
      } catch (error) {
        useGenericNotificationStore().notifyError(error.response.data.message);
        return error;
      } finally {
        this.finishLoading();
      }
    },
  },
  getters: {
    isLoading: (state) => !!state.loading.length,
  },
});

export default useYieldStore;
