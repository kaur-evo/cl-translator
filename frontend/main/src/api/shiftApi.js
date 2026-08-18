import request from './request';

const shiftApi = {
  async getCurrentShift(stationId) {
    try {
      const { data } = await request.get(`/stations/${stationId}/currentshift?tz=utc`);
      return data;
    } catch (error) {
      return error.response;
    }
  },

  async startShift(shiftData) {
    try {
      const { data } = await request.post('/shifts', shiftData);
      return data;
    } catch (error) {
      return error.response.data;
    }
  },

  async putShift(shiftData) {
    try {
      const { data } = await request.put('/shifts', shiftData);
      return data;
    } catch (error) {
      return error.response.data;
    }
  },

  async getShifts(params) {
    const { data } = await request.get('/shifts', {
      params,
    });
    return data;
  },

  async getShift(shiftId) {
    const { data } = await request.get(`/shifts/${shiftId}`);
    return data;
  },

  async deleteShift(shiftId) {
    const { data } = await request.delete(`/shifts/${shiftId}`);
    return data;
  },

  async getShiftTemplates(params) {
    const { data } = await request.get('/shifttemplates', {
      params,
    });
    return data;
  },

  async postShiftTemplate(template) {
    const { data } = await request.post('/shifttemplates', template);
    return data;
  },

  async putShiftTemplate(template) {
    const { data } = await request.put(`/shifttemplates/${template.id}`, template);
    return data;
  },

  async deleteShiftTemplate(templateId) {
    const { data } = await request.delete(`/shifttemplates/${templateId}`);
    return data;
  },

  async getFirstShift(stationId) {
    const { data } = await request.get(`/stations/${stationId}/firstshift`);
    return data;
  },
  async getShiftTemplateDeviationsByType(id, type) {
    if (!id) throw new Error('Shift template ID is required to fetch deviations');
    if (!type) throw new Error('Deviation type is required to fetch deviations');
    const { data } = await request.get(`/shifttemplates/${id}/deviations/${encodeURIComponent(type)}`);
    return data;
  },

  async postShiftTemplateDeviation(deviation) {
    if (!deviation.shiftTemplateId) throw new Error('Shift template ID is required for creation');
    const { data } = await request.post(`/shifttemplates/${deviation.shiftTemplateId}/deviations`, deviation);
    return data;
  },

  async putShiftTemplateDeviation(deviation) {
    if (!deviation.id) throw new Error('Deviation ID is required for update');
    if (!deviation.shiftTemplateId) throw new Error('Shift template ID is required for update');
    const { data } = await request.put(`/shifttemplates/${deviation.shiftTemplateId}/deviations/${deviation.id}`, deviation);
    return data;
  },

  async deleteShiftTemplateDeviation(deviation) {
    if (!deviation.id) throw new Error('Deviation ID is required for deletion');
    if (!deviation.shiftTemplateId) throw new Error('Shift template ID is required for deletion');
    const { data } = await request.delete(`/shifttemplates/${deviation.shiftTemplateId}/deviations/${deviation.id}`);
    return data;
  },

  async getShiftTimeline(stationId, params) {
    if (!stationId) throw new Error('Station ID is required to fetch shift timeline');
    if (!params?.startDate || !params?.endDate) {
      throw new Error('Start and end dates are required to fetch shift timeline');
    }
    const { data } = await request.get(`/shifts/${stationId}/combined`, {
      params,
    });
    return data;
  },

};

export default shiftApi;
