import request from './request';

const authConfigApi = {
  async getAuthConfigList() {
    const { data } = await request.get('/authconfig');
    return data;
  },
  async saveAuthMFAConfig(body) {
    const { data } = await request.put('/authconfig/mfa', body);
    return data;
  },
  async getProviderLinks() {
    const { data } = await request.get('/authconfig/providerlink');
    return data;
  },
};

export default authConfigApi;
