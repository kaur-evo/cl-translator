import request from './request';

const routesApi = {
  async getRoutes(params) {
    if (!params.productId) throw new Error('routes get requires product id');
    const { data } = await request.get('/routes', {
      params,
    });
    return data;
  },

  async putRoute(route, params) {
    const { data } = await request.put(`/routes/${route.id}`, route, {
      params,
    });
    return data;
  },

  async postRoute(route, params) {
    const { data } = await request.post('/routes', route, {
      params,
    });
    return data;
  },

  async deleteRoute(id, params) {
    const { data } = await request.delete(`/routes/${id}`, {
      params,
    });
    return data;
  },
};
export default routesApi;
