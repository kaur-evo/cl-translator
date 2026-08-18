import request from './request';

const settingsFileApi = {
  async importFile(reportName, formData) {
    const { data } = await request.post(`/settings/${reportName}`, formData);
    return data;
  },
  async getFile(fileUrl) {
    const { data } = await request.get(fileUrl, { responseType: 'blob' });
    return data;
  },
  async exportFile(module, includeDeleted = false) {
    const { data } = await request.get(`/settings/${module}/export?includeDeleted=${includeDeleted}`, {
      timeout: 120000, // 2 minutes
      responseType: 'blob',
    });
    return data;
  },
};

export default settingsFileApi;
