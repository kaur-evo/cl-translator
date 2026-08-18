import request from './request';

const translationApi = {
  async getTranslations(params) {
    const { data } = await request.get('/i18n/translations', {
      params,
    });
    return data;
  },

  async getLanguageTexts(entity, id) {
    const { data } = await request.get(`/languagetexts/${entity}/${id}`);
    return data;
  },
  async putLanguageTexts(languageTexts) {
    const { data } = await request.put('/languagetexts', languageTexts);
    return data;
  },
  async deleteLanguageText(id) {
    const { data } = await request.delete(`/languagetexts/${id}`);
    return data;
  },
};

export default translationApi;
