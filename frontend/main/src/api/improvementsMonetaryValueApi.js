import request from './request';

const improvementsMonetaryValueApi = {
  async setMonetaryValue(projectId, formData) {
    const { data } = await request.patch(`/improvements/${projectId}/money`, formData);
    return data;
  },
};

export default improvementsMonetaryValueApi;
