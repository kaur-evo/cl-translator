import request from './request';

const userApi = {

  async getCurrentUser() {
    const { data } = await request.get('/identity/users/current');
    return data;
  },

  async getUserList(params) {
    const { data } = await request.get('/identity/users', {
      params,
    });
    return data;
  },
  async getUser(username, params) {
    const { data } = await request.get(`/identity/users/${username}`, { params });
    return data;
  },
  async postUser(body, params) {
    // params {factoryId}
    const { data } = await request.post('/identity/users', body, {
      params,
    });
    return data;
  },
  async putUser(body, params) {
    // params {factoryId}
    if (!body.username) throw new Error('user put requires username');
    const { data } = await request.put(`/identity/users/${body.username}`, body, {
      params,
    });
    return data;
  },
  async patchUser(username, body) {
    // body {reportingTimeFormat}
    if (!username) throw new Error('user patch requires username');
    const { data } = await request.patch(`/identity/users/${username}`, body);
    return data;
  },
  async deleteUser(username, params) {
    // params {factoryId}
    if (!username) throw new Error('user delete requires username');
    const { data } = await request.delete(`/identity/users/${username}`, {
      params,
    });
    return data;
  },

  async getReleasesInfo() {
    const { data } = await request.get('/whatsnew');
    return data;
  },
  async putReleasesInfo(body) {
    const { data } = await request.put('/whatsnew', body);
    return data;
  },

  async getVisibleRoles() {
    const { data } = await request.get('/identity/roles');
    return data;
  },
};

export default userApi;
