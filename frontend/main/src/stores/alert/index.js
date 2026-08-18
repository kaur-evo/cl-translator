import { defineStore } from 'pinia';

import alertApi from '@/api/alertApi';
import listToKeyMap from '@/helpers/list/listToKeyMap';
import i18n from '@/services/i18n';
import useGenericNotificationStore from '@/stores/genericNotification';

const useAlertStore = defineStore('alert', {
  state: () => ({
    alerts: [],
    loading: [],
  }),
  actions: {
    startLoading() {
      this.loading.push('loading');
    },
    finishLoading() {
      this.loading.pop();
    },
    setAlerts(alerts) {
      this.alerts = alerts;
    },
    removeAlertFromState(id) {
      const index = this.alerts.findIndex((el) => el.id === id);
      if (index > -1) this.alerts.splice(index, 1);
    },
    saveAlertToState(alert) {
      const index = this.alerts.findIndex((el) => el.id === alert.id);
      if (index > -1) this.alerts.splice(index, 1, alert);
      else this.alerts.push(alert);
    },
    async fetchAlerts(params = {}, force = false) {
      if (this.alerts.length > 0 && !force) return;
      this.startLoading();
      try {
        const alerts = await alertApi.getAlerts(params) || [];
        this.setAlerts(alerts);
      } catch {
        useGenericNotificationStore().notifyError(i18n.global.t('We are sorry! There is a problem with your request'));
      } finally {
        this.finishLoading();
      }
    },
    async saveAlert(data) {
      try {
        let alert = null;
        if (data.id) {
          alert = await alertApi.putAlert(data);
        } else {
          alert = await alertApi.postAlert(data);
        }
        if (data.requirements?.type === 'SCRAPREASON' && data.active) {
          useGenericNotificationStore().notifySuccess(i18n.global.t('{value} saved and will become active after the next changeover', { value: data.name }));
        } else if (data.id) {
          useGenericNotificationStore().notifyUpdated(data.name);
        } else {
          useGenericNotificationStore().notifyAdded(data.name);
        }
        this.saveAlertToState(alert);
        return alert;
      } catch (error) {
        useGenericNotificationStore().notifyError(i18n.global.t('We are sorry! There is a problem with your request'));
        return error;
      }
    },
    async deleteAlert(alert) {
      try {
        await alertApi.deleteAlert(alert.id);
        useGenericNotificationStore().notifyDeleted(alert.name);
        this.removeAlertFromState(alert.id);
      } catch {
        useGenericNotificationStore().notifyError(i18n.global.t('We are sorry! There is a problem with your request'));
      }
    },
  },
  getters: {
    alertsMap() {
      return listToKeyMap(this.alerts, 'id');
    },
    isLoading: (state) => state.loading.length > 0,
  },
});

export default useAlertStore;
