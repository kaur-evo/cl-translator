import request from './request';

const devicesApi = {
  async getDevices() {
    const { data } = await request.get('/devices');
    return data;
  },
  async getDeviceById(deviceId) {
    const { data } = await request.get(`/device/${deviceId}`, {
      baseURL: import.meta.env.VITE_VUE_APP_DEVICE_SERVICE_URL,
    });
    return data;
  },
  async saveDeviceDescription(deviceId, description) {
    const { data } = await request.put(`/device/${deviceId}/description`, description, {
      baseURL: import.meta.env.VITE_VUE_APP_DEVICE_SERVICE_URL,
    });
    return data;
  },
};

export default devicesApi;
