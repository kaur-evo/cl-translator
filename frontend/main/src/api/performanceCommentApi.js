import request from './request';

const performanceCommentApi = {
  async getPerformanceComments(params) {
    // stationId, lang, includeDeleted, includePredefined, factoryId, groupId, term, localView,
    const { data } = await request.get('/performancecomment', {
      params,
    });
    return data;
  },
  async postPerformanceComment(body, params) {
    const { data } = await request.post('/performancecomment', body, {
      params,
    });
    return data;
  },
  async putPerformanceComment(body, params) {
    if (!body.id) throw new Error('speed loss reason put requires id');
    const { data } = await request.put(`/performancecomment/${body.id}`, body, {
      params,
    });
    return data;
  },
  async patchPerformanceComment(body) {
    if (!body.id) throw new Error('speed loss reason patch requires id');
    const { data } = await request.patch(`/performancecomment/${body.id}`, body);
    return data;
  },
  async deletePerformanceComment(id, params) {
    // params {factoryId}
    if (!id) throw new Error('speed loss reason delete requires id');
    const { data } = await request.delete(`/performancecomment/${id}`, {
      params,
    });
    return data;
  },

  async getPerformanceCommentGroups(stationId) {
    if (!stationId) {
      throw Error('stationId is required!');
    }
    const { data } = await request.get('/performancecommentgroup', { params: { stationId } });
    return data;
  },

  async savePerformanceComment(stationId, slice) {
    try {
      const { data } = await request.post(`/timeline/${stationId}/performanceloss`, slice);
      return data;
    } catch (error) {
      return error.response.data;
    }
  },

  async deleteTimelinePerformanceComment(stationId, eventTime) {
    const { data } = await request.delete(`/timeline/${stationId}/performanceloss/${eventTime}`);
    return data;
  },

  async getMissingPerformanceComment(commentIds) {
    if (!commentIds) {
      throw Error('commentId is required!');
    }
    let commentId = '';
    commentIds.forEach((id) => {
      commentId += `&id=${id}`;
    });
    const { data } = await request.get(`/performancecomment?includeDeleted=true${commentId}`);
    return data;
  },
};

export default performanceCommentApi;
