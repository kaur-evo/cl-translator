import request from './request';

const yieldApi = {
  async getYields(params) {
    const { data } = await request.get('/yield', {
      params,
    });
    return data;
  },

  async postYields(body, params) {
    const { data } = await request.post('/yield', body, {
      params,
    });
    return data;
  },
};

export default yieldApi;
