import request from './request';

const improvementsMeasureApi = {
  async getActions(projectId) {
    const { data } = await request.get(`/improvements/steps/${projectId}`);
    return data;
  },

  async getSolutions(projectId) {
    const { data } = await request.get(`/improvements/correctivemeasures/${projectId}`);
    return data;
  },

  async saveActionById(actionId, actionBody) {
    const { data } = await request.put(`/improvements/steps/${actionId}`, actionBody);
    return data;
  },

  async saveSolutionById(solutionId, solutionBody) {
    const { data } = await request.put(`/improvements/correctivemeasures/${solutionId}`, solutionBody);
    return data;
  },

  async saveAction(action) {
    const { data } = await request.post('improvements/steps', action);
    return data;
  },
  async saveSolution(solution) {
    const { data } = await request.post('/improvements/correctivemeasures', solution);
    return data;
  },

  async reorderAction(actionId, actionBody) {
    const { data } = await request.patch(`/improvements/steps/${actionId}`, actionBody);
    return data;
  },

  async reorderSolution(solutionId, solutionBody) {
    const { data } = await request.patch(`/improvements/correctivemeasures/${solutionId}`, solutionBody);
    return data;
  },

  async deleteAction(actionId) {
    const { data } = await request.delete(`/improvements/steps/${actionId}`);
    return data;
  },

  async deleteSolution(solutionId) {
    const { data } = await request.delete(`/improvements/correctivemeasures/${solutionId}`);
    return data;
  },

  async deleteAllMeasures(projectId) {
    const { data } = await request.delete(`/improvements/steps/project/${projectId}`);
    return data;
  },
};

export default improvementsMeasureApi;
