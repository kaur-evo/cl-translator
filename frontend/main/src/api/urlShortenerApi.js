import request from './request';

const urlShortenerApi = {
  async getUrl(key) {
    const { data } = await request.get('/url', {
      params: { key },
    });
    return data;
  },

  async saveUrl(url) {
    const { data } = await request.post('/url', { url });
    return data;
  },
};

export default urlShortenerApi;
