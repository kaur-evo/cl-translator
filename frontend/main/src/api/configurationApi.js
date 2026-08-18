import request from './request';

const configurationApi = {
  async getConfiguration(params) {
    // stationId,
    const { data } = await request.get('/configuration', { params });
    return data;
  },
};
export default configurationApi;
