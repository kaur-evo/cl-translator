import request from './request';

const dashboardApi = {
  async loadDashboardState() {
    const { data } = await request.get('/dashboard');
    return data;
  },
  async saveDashboardState(body) {
    if (!body || !('widgets' in body) || !('pages' in body)) throw Error('NO INPUT DATA');
    const { data } = await request.put('/dashboard', body);
    return data;
  },

  async shareDashboardTabs(body) {
    const { data } = await request.post('/dashboard', body);
    return data;
  },
};

export default dashboardApi;
