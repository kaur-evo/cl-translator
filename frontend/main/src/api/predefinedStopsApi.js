import request from './request';

const predefinedStopsApi = {
  async getPredefinedStops(templateId) {
    const { data } = await request.get(`/shifttemplates/${templateId}/stop`);
    return data;
  },

  async postPredefinedStops(templateId, body) {
    const { data } = await request.post(`/shifttemplates/${templateId}/stop`, body);
    return data;
  },

  async deletePredefinedStop(stopId) {
    const { data } = await request.delete(`/shifttemplates/stop/${stopId}`);
    return data;
  },

};

export default predefinedStopsApi;
