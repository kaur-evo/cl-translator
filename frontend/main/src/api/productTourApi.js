import request from './request';

const productTourApi = {
  async getFlowStates() {
    const { data } = await request.get('/producttour');
    return data;
  },

  async updateFlowStates(body) {
    const { data } = await request.post('/producttour', body);
    return data;
  },
};

export default productTourApi;
