import request from './request';

const improvementsProjectApi = {
  async getProjects() {
    const { data } = await request.get('/improvements', {
      params: { pageSize: 0, lastId: 0 },
    });
    return data.map((project) => ({
      ...project,
      initialDailyAverage: 'loading',
      currentAverage: 'loading',
      totalSavedTime: 'loading',
      change: 'loading',
    }));
  },

  async getProject(projectId) {
    const { data } = await request.get(`/improvements/overview/${projectId}`);
    return data;
  },

  async createProject(project) {
    const { data } = await request.post('/improvements', project);
    return data;
  },

  async saveProject(project) {
    const { data } = await request.put(`/improvements/${project.id}`, project);
    return data;
  },

  async deleteProject(projectId) {
    const { data } = await request.delete(`/improvements/${projectId}`);
    return data;
  },

  async toggleProjectStatus(projectId, body) {
    const { data } = await request.patch(`/improvements/${projectId}`, body);
    return data;
  },
};

export default improvementsProjectApi;
