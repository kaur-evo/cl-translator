import { defineStore } from 'pinia';

import i18n from '@/services/i18n';
import APIKeysApi from '@/api/APIKeysApi';
import useGenericNotificationStore from '@/stores/genericNotification';

const useAPIKeysStore = defineStore('APIKeys', {
  state: () => ({
    APIKeys: [],
    loading: [],
  }),
  actions: {
    startLoading() {
      this.loading.push('loading');
    },
    finishLoading() {
      this.loading.pop();
    },
    setAPIKeys(APIKeys) {
      this.APIKeys = APIKeys;
    },
    addAPIKey(APIKey) {
      this.APIKeys.push(APIKey);
    },
    updateAPIKeyStatusInState(params) {
      const index = this.APIKeys.findIndex((el) => el.keyId === params.APIKey.keyId);
      this.APIKeys[index].enabled = params.body.enabled;
    },
    removeAPIKeyFromState(id) {
      const index = this.APIKeys.findIndex((el) => el.keyId === id);
      if (index > -1) this.APIKeys.splice(index, 1);
    },
    async fetchAPIKeys() {
      this.startLoading();
      try {
        const APIKeys = await APIKeysApi.getAPIKeys() || [];
        this.setAPIKeys(APIKeys);
      } catch {
        useGenericNotificationStore().notifyError(i18n.global.t('We are sorry! There is a problem with your request'));
      } finally {
        this.finishLoading();
      }
    },
    async saveAPIKey(body) {
      this.startLoading();
      try {
        const APIKeyResponse = await APIKeysApi.saveAPIKey(body);
        useGenericNotificationStore().notifyAdded(APIKeyResponse.name);
        this.addAPIKey(APIKeyResponse);
        return APIKeyResponse;
      } catch (error) {
        useGenericNotificationStore().notifyError(error.response.data.message);
        return error;
      } finally {
        this.finishLoading();
      }
    },
    async changeAPIKeyStatus({ APIKey, body }) {
      this.startLoading();
      try {
        await APIKeysApi.changeAPIKeyStatus(APIKey.keyId, body);
        this.updateAPIKeyStatusInState({ APIKey, body });
        useGenericNotificationStore().notifyUpdated(APIKey.name);
      } catch (error) {
        useGenericNotificationStore().notifyError(error.response.data.message);
      } finally {
        this.finishLoading();
      }
    },
    async deleteAPIKey(keyId) {
      this.startLoading();
      try {
        await APIKeysApi.deleteAPIKey(keyId);
        this.removeAPIKeyFromState(keyId);
        useGenericNotificationStore().notifyDeleted(keyId);
      } catch (error) {
        useGenericNotificationStore().notifyError(error.response.data.message);
      } finally {
        this.finishLoading();
      }
    },
  },
  getters: {
    isLoading: (state) => !!state.loading.length,
  },
});

export default useAPIKeysStore;
