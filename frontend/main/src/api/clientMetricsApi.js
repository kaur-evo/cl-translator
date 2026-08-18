import request from '@/api/request';

const clientMetricsApi = {
  async postClientMetrics(body) {
    const { data } = await request.post('/clientmetrics', body);
    return data;
  },
};

export default clientMetricsApi;
