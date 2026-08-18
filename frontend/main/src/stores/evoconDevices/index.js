import { defineStore } from 'pinia';

import devicesApi from '@/api/devicesApi';

const useEvoconDevicesStore = defineStore('evoconDevices', {
  state: () => ({
    devices: {},
    loading: [],
  }),
  getters: {
    isLoading: (state) => !!state.loading.length,
  },
  actions: {
    async fetchDevices() {
      this.loading.push('loading');
      try {
        const devices = await devicesApi.getDevices() || {};
        this.devices = devices;
      } finally {
        this.loading.pop();
      }
    },
    async saveDevice({ deviceId, description }) {
      this.loading.push('loading');
      try {
        const deviceResponse = await devicesApi.saveDeviceDescription(deviceId, description);
        this.devices[deviceId].description = deviceResponse.description;
        const { default: useGenericNotificationStore } = await import('@/stores/genericNotification');
        const genericNotificationStore = useGenericNotificationStore();
        genericNotificationStore.notifyUpdated(deviceResponse.serialNumber);
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

export default useEvoconDevicesStore;
