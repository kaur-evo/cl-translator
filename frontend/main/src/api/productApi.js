import request from './request';

const productApi = {
  async getProducts(params) {
    // stationId, limit, term, id
    const { data } = await request.get('/products', {
      params,
    });
    return data;
  },

  async getProduct(id, params) {
    const { data } = await request.get(`/products/${id}`, {
      params,
    });
    return data;
  },

  async getOrders(params) {
    const { data } = await request.get('/jobs', {
      params,
    });
    return data;
  },

  async changeProduct(stationId, body) {
    try {
      const { data } = await request.post(`/batches/${stationId}`, body);
      return data;
    } catch (error) {
      return error.response.data;
    }
  },

  async deleteChangeover(stationId, eventTime) {
    try {
      const { data } = await request.delete(`/batches/${stationId}/${eventTime}`);
      return data;
    } catch (error) {
      return error.response.data;
    }
  },

  async getProductGroups(params) {
    const { data } = await request.get('/productgroups', {
      params,
    });
    return data;
  },

  async putProductGroup(group, params) {
    if (!group.id) throw new Error('product group put requires id');
    const { data } = await request.put(`/productgroups/${group.id}`, group, {
      params,
    });
    return data;
  },

  async postProductGroup(group, params) {
    if (group.id) throw new Error('product group post must not have id');
    const { data } = await request.post('/productgroups', group, {
      params,
    });
    return data;
  },

  async patchProductGroup(group, params) {
    if (!group.id) throw new Error('product group patch requires id');
    const { data } = await request.patch(`/productgroups/${group.id}`, group, {
      params,
    });
    return data;
  },

  async deleteProductGroup(groupId, params) {
    if (!groupId) throw new Error('product group delete requires id');
    const { data } = await request.delete(`/productgroups/${groupId}`, {
      params,
    });
    return data;
  },

  async patchProduct(item, params) {
    if (!item.id) throw new Error('product patch requires id');
    const { data } = await request.patch(`/products/${item.id}`, item, {
      params,
    });
    return data;
  },

  async putProduct(item, params) {
    if (!item.id) throw new Error('product put requires id');
    const { data } = await request.put(`/products/${item.id}`, item, {
      params,
    });
    return data;
  },

  async postProduct(item, params) {
    const { data } = await request.post('/products', item, {
      params,
    });
    return data;
  },

  async deleteProduct(id, params) {
    const { data } = await request.delete(`/products/${id}`, {
      params,
    });
    return data;
  },

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

  async getFilteredProducts(body) {
    const { data } = await request.post('/filter/products', body);
    return data;
  },

  async getUnitIds(params) {
    const { data } = await request.get('/products/unitids', {
      params,
    });
    return data;
  },
};

export default productApi;
