import request from './request';

const realtimeApi = {
  async getRealTimeToken(body) {
    const { data } = await request.post('/realtime/token?centrifugoVersion=V5', body);
    return data;
  },
};

export default realtimeApi;
