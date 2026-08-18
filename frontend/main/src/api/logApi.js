import request from './request';

const logApi = {
  async postConsoleError(error) {
    try {
      const { data } = await request.post('/log/private/frontend', error);
      return data;
    } catch {
      return null;
    }
  },

  async logEvent(body) {
    try {
      const { data } = await request.post('/log/private/fe-event', body);
      return data;
    } catch {
      return null;
    }
  },

  async logCentrifugeEvent(body) {
    try {
      const { data } = await request.post('/log/private/centrifuge-event', body);
      return data;
    } catch {
      return null;
    }
  },
};

export default logApi;
