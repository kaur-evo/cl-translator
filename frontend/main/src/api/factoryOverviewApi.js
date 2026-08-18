import request from './request';

const factoryOverviewApi = {
  async getTimelineViewState() {
    const { data } = await request.get('/timelineview');
    return data;
  },
  async putTimelineViewState(body) {
    if (!body || !('ordering' in body) || !('interval' in body)) throw Error('NO INPUT DATA');
    const { data } = await request.put('/timelineview', body);
    return data;
  },
};
export default factoryOverviewApi;
