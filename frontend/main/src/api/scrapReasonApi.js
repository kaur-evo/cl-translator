import request from './request';

const scrapApi = {
  async saveScrap(stationId, scrap) {
    try {
      const { data } = await request.post(`/timeline/${stationId}/groupedScrap`, scrap);
      return data;
    } catch (err) {
      return err.response.data;
    }
  },

  async getScrapReasons(params) {
    // stationId, lang, includeDeleted, includePredefined, factoryId, groupId, term, localView,
    const { data } = await request.get('/scrapreason', {
      params,
    });
    return data;
  },
  async postScrapReason(body, params) {
    //   api/scrapreason?factoryId=1
    const { data } = await request.post('/scrapreason', body, {
      params,
    });
    return data;
  },
  async putScrapReason(body, params) {
    if (!body.id) throw new Error('scrap reason put requires id');
    const { data } = await request.put(`/scrapreason/${body.id}`, body, {
      params,
    });
    return data;
  },
  async patchScrapReason(scrapReason) {
    if (!scrapReason.id) throw new Error('scrap reason patch requires id');
    const { data } = await request.patch(`/scrapreason/${scrapReason.id}`, scrapReason);
    return data;
  },
  async deleteScrapReason(id, params) {
    // params {factoryId}
    if (!id) throw new Error('scrap reason delete requires id');
    const { data } = await request.delete(`/scrapreason/${id}`, {
      params,
    });
    return data;
  },

  async getScrapReasonGroups(params) {
    // factoryId, stationId?
    const { data } = await request.get('/scrapreasongroup', { params });
    return data;
  },

  async putScrapReasonGroup(scrapReasonGroup) {
    if (!scrapReasonGroup.id) throw new Error('scrap reason group put requires id');
    const { data } = await request.put(`/scrapreasongroup/${scrapReasonGroup.id}`, scrapReasonGroup);
    return data;
  },
  async postScrapReasonGroup(scrapReasonGroup) {
    if (scrapReasonGroup.id) throw new Error('scrap reason group post must not have id');
    const { data } = await request.post('/scrapreasongroup', scrapReasonGroup);
    return data;
  },
  async patchScrapReasonGroup(scrapReasonGroup) {
    if (!scrapReasonGroup.id) throw new Error('scrap reason group patch requires id');
    const { data } = await request.patch(`/scrapreasongroup/${scrapReasonGroup.id}`, scrapReasonGroup);
    return data;
  },
  async deleteScrapReasonGroup(id, params) {
    // params {factoryId}
    if (!id) throw new Error('scrap reason group delete requires id');
    const { data } = await request.delete(`/scrapreasongroup/${id}`, {
      params,
    });
    return data;
  },
};

export default scrapApi;
