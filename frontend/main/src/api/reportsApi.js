import request from './request';

const reportsApi = {
  async getDowntimeExport(params) {
    // ?stationId=53&startTime=2021-10-01&endTime=2021-10-31
    const { data } = await request.get('/reports/DowntimeExport', {
      timeout: 120000,
      params,
      responseType: 'blob',
    });
    return data;
  },
  async getCustomReportsList(params) {
    const { data } = await request.get('/reports', {
      params,
    });
    return data;
  },
  async getCustomReport(name, params) {
    const { data } = await request.get(`/reports/${name}`, {
      timeout: 60000,
      params,
      responseType: 'blob',
    });
    return data;
  },
  async exportCustomReport(name, params, options) {
    const data = await request.get(`/reports/async/${name}`, {
      params,
      ...options,
      responseType: 'blob',
    });
    return data;
  },
};

export default reportsApi;
