import request from './request';

const userPreferencesApi = {
  async getUserPreferences() {
    const { data } = await request.get('/userpreferences');
    return data;
  },
  async saveUserPreferences(preferences) {
    const { data } = await request.put('/userpreferences', preferences);
    return data;
  },
};

export default userPreferencesApi;
