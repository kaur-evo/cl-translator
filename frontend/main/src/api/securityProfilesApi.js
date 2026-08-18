import request from './request';

const securityProfilesApi = {
  async getSecurityProfiles() {
    const { data } = await request.get('/securityprofiles');
    return data;
  },

  async getSecurityProfile(id) {
    const { data } = await request.get(`/securityprofiles/${id}`);
    return data;
  },

  async saveSecurityProfile(body) {
    const { data } = await request.post('/securityprofiles', body);
    return data;
  },

  async updateSecurityProfile(body) {
    const { data } = await request.put(`/securityprofiles/${body.id}`, body);
    return data;
  },

  async deleteSecurityProfile(id) {
    const { data } = await request.delete(`/securityprofiles/${id}`);
    return data;
  },
};

export default securityProfilesApi;
