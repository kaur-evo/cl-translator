import request from './request';

const improvementsFileApi = {
  async getFiles(projectId) {
    const { data } = await request.get(`/improvements/${projectId}/files`);
    return data;
  },

  async uploadFiles(projectId, formData, config) {
    const { data } = await request.post(`/improvements/${projectId}/files`, formData, config);
    return data;
  },

  async editFile(projectId, body) {
    const { data } = await request.put(`/improvements/${projectId}/file`, body);
    return data;
  },

  async deleteFile(projectId, body) {
    const { data } = await request.delete(`/improvements/${projectId}/file`, { data: body });
    return data;
  },

  async getFile(projectId, body) {
    const { data } = await request.post(`/improvements/${projectId}/getfile`, body, { responseType: 'blob' });
    return data;
  },
};

export default improvementsFileApi;
