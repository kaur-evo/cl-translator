import request from './request';

const operatorApi = {

  async getOperators(params) {
    const { data } = await request.get('/operators', {
      params,
    });
    return data;
  },

  async postOperator(body, params) {
    const { data } = await request.post('/operators', body, {
      params,
    });
    return data;
  },

  async putOperator(body, params) {
    if (!body.id) throw new Error('operator put requires id');
    const { data } = await request.put(`/operators/${body.id}`, body, {
      params,
    });
    return data;
  },

  async deleteOperator(id, params) {
    if (!id) throw new Error('operator delete requires id');
    const { data } = await request.delete(`/operators/${id}`, {
      params,
    });
    return data;
  },

  async setTeams(stationId, requestBody) {
    if (!stationId) {
      throw Error('stationId is required!');
    }
    const { data } = await request.post(`/teams/${stationId}`, requestBody);
    return data;
  },

  async deleteTeams(stationId, eventTime) {
    try {
      const { data } = await request.delete(`/teams/${stationId}/${eventTime}`);
      return data;
    } catch (error) {
      return error.response.data;
    }
  },

  async generatePasscode(id) {
    const { data } = await request.post(`/operators/passcode/${id}`);
    return data;
  },

  async regeneratePasscode(id) {
    const { data } = await request.patch(`/operators/passcode/${id}`);
    return data;
  },

  async deletePasscode(id) {
    const { data } = await request.delete(`/operators/passcode/${id}`);
    return data;
  },

  async validatePasscode(body) {
    const { data } = await request.post('/operators/passcode/validate', body);
    return data;
  },
};

export default operatorApi;
