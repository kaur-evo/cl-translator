import request from './request';

const improvements5WhysApi = {
  async get5Whys(projectId) {
    const { data } = await request.get(`/improvements/anlysis/${projectId}`);
    return data;
  },
  async save5Whys(projectId, analysis) {
    const { data } = await request.put(`/improvements/anlysis/${projectId}`, analysis);
    return data;
  },
};

export default improvements5WhysApi;
