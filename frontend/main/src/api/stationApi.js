import request from './request';

const stationApi = {
  async getStationList() {
    const { data } = await request.get('/stations');
    return data;
  },

  async getFactories() {
    const { data } = await request.get('/factories');
    return data;
  },

  async getStationGroupList() {
    const { data } = await request.get('/stationgroups');
    return data;
  },

  async getLimits(stationId, params) {
    const { data } = await request.get(`/stations/${stationId}/limits`, { params });
    return data;
  },

  async getRollingStationTimeline(params, options) {
    // interval, stationIds
    const { data } = await request.post('/timeline/rolling', params, options);
    return data;
  },
  async getFactoryViewStationTimeline(params) {
    // stationIds
    const { data } = await request.post('/factoryview', params);
    return data;
  },
  async getFactoryViewStationsOrder() {
    const { data } = await request.get('/factoryview/order');
    return data;
  },
  async postFactoryViewStationsOrder(body) {
    const { data } = await request.post('/factoryview/order', body);
    return data;
  },
  async postStationGroup(body) {
    const { data } = await request.post('/stationgroups', body);
    return data;
  },
  async putStationGroup(body) {
    const { data } = await request.put(`/stationgroups/${body.id}`, body);
    return data;
  },
  async deleteStationGroup(id, params) {
    const { data } = await request.delete(`/stationgroups/${id}`, {
      params,
    });
    return data;
  },

  async putStation(body, params) {
    if (!body.id) throw new Error('station put requires id');
    const { data } = await request.put(`/stations/${body.id}`, body, {
      params,
    });
    return data;
  },
};

export default stationApi;
