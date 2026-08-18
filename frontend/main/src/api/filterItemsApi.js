import request from './request';

const filterItemsApi = {
  async getFilterItems(entityName, body, params) {
    // query params {factoryId, stationId, term, limit, startDate, endDate}
    const { data } = await request.post(`/filter/${entityName}`, body, { params });
    return data;
  },
  async getEntitiesCount(params) {
    const { data } = await request.get('/filter/count', {
      params,
    });
    return data;
  },
  async getReportDefaults(params) {
    const { data } = await request.get('/filter/defaults', {
      params,
    });
    return data;
  },
};
export default filterItemsApi;
