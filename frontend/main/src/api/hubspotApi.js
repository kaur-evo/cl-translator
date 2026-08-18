import request from './request';

const hubspotApi = {
  async forwardToSupport(body, params) {
    const { data } = await request.post('/forwardtosupport', body, {
      params,
    });
    return data;
  },
};

export default hubspotApi;
