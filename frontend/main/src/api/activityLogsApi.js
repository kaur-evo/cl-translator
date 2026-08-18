import request from './request';

const activityLogsApi = {
  async getSVActivityLogs(payload, options) {
    const { data } = await request.post('/useractivitylogs/shiftview', payload, options);
    return data;
  },

  async getSettingsActivityLogs(payload, options) {
    const { data } = await request.post('/useractivitylogs/settings', payload, options);
    return data;
  },
};
export default activityLogsApi;
