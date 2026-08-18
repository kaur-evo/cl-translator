import request from './request';

const improvementsStatsApi = {
  async getOverviewStats(params) {
    const { data } = await request.get('improvements/overview/stats', {
      params,
      timeout: 60000,
    });
    return data;
  },

  async getStats(projectId) {
    const { data } = await request.get(`/improvements/${projectId}/stats`);
    return data;
  },

  async getCommentStats(filter) {
    const { data } = await request.post('/improvements/stats/stopduration', filter);
    return data;
  },
};

export default improvementsStatsApi;
