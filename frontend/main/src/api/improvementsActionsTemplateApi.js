import request from './request';

const improvementsActionsTemplateApi = {
  async saveActionTemplate(formData) {
    const { data } = await request.post('/improvements/steps/template', formData);
    return data;
  },

  async listActionTemplates() {
    const { data } = await request.get('/improvements/steps/template');
    return data;
  },

  async deleteActionTemplate(templateId) {
    const { data } = await request.delete(`/improvements/steps/template/${templateId}`);
    return data;
  },
};

export default improvementsActionsTemplateApi;
