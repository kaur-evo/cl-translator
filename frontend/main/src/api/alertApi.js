import request from './request';

const alertApi = {
  async getAlerts(params) {
    // params {factoryId}
    const { data } = await request.get('/alerts', {
      params,
    });
    return data;
  },

  async getAlert(id, params) {
    // params {factoryId}
    const { data } = await request.get(`/alerts/${id}`, {
      params,
    });
    return data;
  },

  async deleteAlert(id, params) {
    // params {factoryId}
    const { data } = await request.delete(`/alerts/${id}`, {
      params,
    });
    return data;
  },

  async putAlert(alert, params) {
    // params {factoryId}
    const { data } = await request.put(`/alerts/${alert.id}`, alert, {
      params,
    });
    return data;
  },

  async postAlert(alert, params) {
    // params {factoryId}
    const { data } = await request.post('/alerts', alert, {
      params,
    });
    return data;
  },
};

export default alertApi;
