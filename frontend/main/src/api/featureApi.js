import request from './request';

const featureApi = {
  async getFeatures() {
    const { data } = await request.get('/features');
    return data;
  },
};
export default featureApi;
