import request from './request';

const logOutApi = {
  async logOut() {
    const { data } = await request.post('/session/logout');
    return data;
  },
};

export default logOutApi;
