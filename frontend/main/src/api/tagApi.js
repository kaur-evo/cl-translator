import request from './request';

const tagApi = {
  async getTags(params) {
    // params:: entity
    const { data } = await request.get('/tags', {
      params,
    });
    return data;
  },
  async postTag(body) {
    // {alias, name, entities}
    const { data } = await request.post('/tags', body);
    return data;
  },
  async putTag(body) {
    // {id, alias, name, entities}
    if (!body.id) throw new Error('Tag put requires id');
    const { data } = await request.put(`/tags/${body.id}`, body);
    return data;
  },
  async deleteTag(id) {
    if (!id) throw new Error('Tag delete requires id');
    const { data } = await request.delete(`/tags/${id}`);
    return data;
  },
};
export default tagApi;
