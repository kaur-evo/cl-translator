import request from './request';

const performanceCommentGroupApi = {
  async getPerformanceCommentGroups(params) {
    const { data } = await request.get('/performancecommentgroup', { params });
    return data;
  },

  async postPerformanceCommentGroup(body, params) {
    const { data } = await request.post('/performancecommentgroup', body, {
      params,
    });
    return data;
  },

  async putPerformanceCommentGroup(body, params) {
    if (!body.id) throw new Error('speed loss reason group put requires id');
    const { data } = await request.put(`/performancecommentgroup/${body.id}`, body, {
      params,
    });
    return data;
  },

  async patchPerformanceCommentGroup(scrapReason) {
    if (!scrapReason.id) throw new Error('speed loss reason group patch requires id');
    const { data } = await request.patch(`/performancecommentgroup/${scrapReason.id}`, scrapReason);
    return data;
  },

  async deletePerformanceCommentGroup(id, params) {
    // params {factoryId}
    if (!id) throw new Error('speed loss reason group delete requires id');
    const { data } = await request.delete(`/performancecommentgroup/${id}`, {
      params,
    });
    return data;
  },
};

export default performanceCommentGroupApi;
