import request from './request';

const allowedIPsApi = {
  async getAllowedIPs() {
    const { data } = await request.get('/allowedips');
    return data;
  },

  async saveAllowedIPs(body) {
    const { data } = await request.post('/allowedips', body);
    return data;
  },

  async getMyIP() {
    const { data } = await request.get('/client/ip');
    return data;
  },
};

export default allowedIPsApi;
