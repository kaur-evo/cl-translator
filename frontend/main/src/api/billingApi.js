import request from '@/api/request';

const billingApi = {
  async getBillingStatus() {
    const { data } = await request.get('/billing/status');
    return data;
  },
};

export default billingApi;
