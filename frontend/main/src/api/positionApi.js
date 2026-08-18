import request from './request';

const commentApi = {
  async getPositions(params) {
    // stationId, lang
    const { data } = await request.get('/position', {
      params,
    });
    return data;
  },

  async deletePosition(id, params) {
    // params {factoryId}
    if (!id) throw new Error('position delete requires id');
    const { data } = await request.delete(`/position/${id}`, {
      params,
    });
    return data;
  },

  async putPosition(item, params) {
    // params {factoryId}
    if (!item.id) throw new Error('position put requires id');
    const { data } = await request.put(`/position/${item.id}`, item, {
      params,
    });
    return data;
  },

  async postPosition(item, params) {
    // params {factoryId}
    const { data } = await request.post('/position', item, {
      params,
    });
    return data;
  },

  async patchPosition(item, params) {
    // params {factoryId}
    const { data } = await request.patch(`/position/${item.id}`, item, {
      params,
    });
    return data;
  },
};

export default commentApi;
