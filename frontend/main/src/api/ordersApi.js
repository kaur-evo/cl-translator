import request from './request';

const ordersApi = {
  async getOrders(stationId) {
    const { data } = await request.get('/jobs', { params: { stationId } });
    return data;
  },
};

export default ordersApi;
