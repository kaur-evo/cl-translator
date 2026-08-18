import request from './request';

const statisticsApi = {
  async getOeeSummary(params) {
    const url = '/statistics/oee';
    const { data } = await request.post(url, params);
    return data;
  },
  async getPeriodDelays(params) {
    const url = '/statistics/perioddelays';
    const { data } = await request.post(url, params, { timeout: 120000 }); // 2 minutes
    return data;
  },
  async getPeriodSpeedLosses(params) {
    const url = '/statistics/periodspeedlosses';
    const { data } = await request.post(url, params);
    return data;
  },
  async getPeriodScrapReasons(params) {
    const url = '/statistics/periodscrapreasons';
    const { data } = await request.post(url, params);
    return data;
  },
  async getReportData(payload = {}, options = {}) {
    const url = '/reportdata';
    const { data } = await request.post(url, payload, { ...options, params: { ...options.params, v2: true }, timeout: 60 * 1000 });
    return data;
  },
  async getReportDataV3(payload = {}, options = {}) {
    const url = '/reports/data';
    const { data } = await request.post(url, payload, { ...options, params: { ...options.params }, timeout: 60 * 1000 });
    return data;
  },
  async getOeeWidgetData(payload) {
    const url = '/reportdata/dashboard';
    const { data } = await request.post(url, payload);
    return data;
  },
  async getTopStopReasons(params) {
    // params: stationIds, top, lang
    const url = '/statistics/topreasons';
    const { data } = await request.post(url, params);
    return data;
  },
  async getTopSpeedlossReasons(params) {
    // params: stationIds, top, lang
    const url = '/statistics/toplosses';
    const { data } = await request.post(url, params);
    return data;
  },
  async getTopScrapReasons(params) {
    // params: stationIds, top, lang
    const url = '/statistics/topscraps';
    const { data } = await request.post(url, params);
    return data;
  },
  async getTrendlineData(payload, params = {}) {
    const { data } = await request.post('/statistics/trendline', payload, params);
    return data;
  },
};
export default statisticsApi;
