import request from './request';

const commentApi = {
  async getStationComments(stationId, lang) {
    if (!stationId) {
      throw Error('stationId is required!');
    }
    const { data } = await request.get('/comments', { params: { stationId, lang } });
    return data;
  },
  async getComments(params) {
    // stationId, lang, includeDeleted, includePredefined, factoryId, groupId, term, localView,
    const { data } = await request.get('/comments', {
      timeout: 60000,
      params,
    });
    return data;
  },
  async getCommentGroups(params) {
    // stationId, includePredefined
    const { data } = await request.get('/commentgroups', {
      params,
    });
    return data;
  },

  async getMissingComment(commentIds) {
    if (!commentIds) {
      throw Error('commentId is required!');
    }
    let commentId = '';
    commentIds.forEach((id) => {
      commentId += `&id=${id}`;
    });
    const { data } = await request.get(`/comments?includeDeleted=true${commentId}`);
    return data;
  },

  async saveComment(stationId, shiftId, slice, join = false) {
    try {
      const { data } = await request.post(`/timeline/${stationId}/comments?shiftId=${shiftId}&join=${join}`, slice);
      return data;
    } catch (error) {
      return error.response.data;
    }
  },

  async updateCommentGroupOrder(params) {
    try {
      const { data } = await request.patch(`/commentgroups/${params.id}`, params);
      return data;
    } catch (error) {
      return error.response.data;
    }
  },

  async putCommentGroup(stopReasonGroup) {
    if (!stopReasonGroup.id) throw new Error('stop reason group put requires id');
    const { data } = await request.put(`/commentgroups/${stopReasonGroup.id}`, stopReasonGroup);
    return data;
  },
  async postCommentGroup(stopReasonGroup) {
    if (stopReasonGroup.id) throw new Error('stop reason group post must not have id');
    const { data } = await request.post('/commentgroups', stopReasonGroup);
    return data;
  },
  async patchCommentGroup(stopReasonGroup) {
    if (!stopReasonGroup.id) throw new Error('stop reason group patch requires id');
    const { data } = await request.patch(`/commentgroups/${stopReasonGroup.id}`, stopReasonGroup);
    return data;
  },
  async deleteCommentGroup(groupId) {
    if (!groupId) throw new Error('stop reason group delete requires id');
    const { data } = await request.delete(`/commentgroups/${groupId}`);
    return data;
  },

  async postComment(body, params) {
    const { data } = await request.post('/comments', body, {
      params,
    });
    return data;
  },
  async putComment(body, params) {
    if (!body.id) throw new Error('stop reason put requires id');
    const { data } = await request.put(`/comments/${body.id}`, body, {
      params,
    });
    return data;
  },
  async patchComment(scrapReason) {
    if (!scrapReason.id) throw new Error('stop reason patch requires id');
    const { data } = await request.patch(`/comments/${scrapReason.id}`, scrapReason);
    return data;
  },
  async deleteComment(id, params) {
    // params {factoryId}
    if (!id) throw new Error('stop reason delete requires id');
    const { data } = await request.delete(`/comments/${id}`, {
      params,
    });
    return data;
  },
  async getBarcodes(params) {
    const { data } = await request.get('/barcode/comments', {
      params, responseType: 'blob',

    });
    return data;
  },

};

export default commentApi;
