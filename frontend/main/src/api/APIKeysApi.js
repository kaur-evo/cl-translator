import request from './request';

const APIKeysApi = {
  async getAPIKeys() {
    const { data } = await request.get('/basicauthtokens');
    return data;
  },
  async saveAPIKey(body) {
    const { data } = await request.post('/basicauthtokens', body);
    return data;
  },
  async deleteAPIKey(id) {
    const { data } = await request.delete(`/basicauthtokens/${id}`);
    return data;
  },
  async changeAPIKeyStatus(id, body) {
    const { data } = await request.patch(`/basicauthtokens/${id}`, body);
    return data;
  },
};

export default APIKeysApi;
