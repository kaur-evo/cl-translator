import request from '@/api/request';

const widgetsApi = {
  async getWidgets(stationId) {
    const { data } = await request.get('/widgets', { params: { module: 'lineview', stationId } });
    return data;
  },
  async getMeasures(stationId, measureName, productionOrder, endTime, startTime, includeNoDataDatapoints) {
    const productionOrderId = productionOrder || null;
    let name = '';
    if (measureName instanceof Array) {
      measureName.forEach((measure) => {
        if (measureName.indexOf(measure) === 0) {
          name += `name=${measure}`;
        } else {
          name += `&name=${measure}`;
        }
      });
    } else {
      name = `name=${measureName}`;
    }
    const { data } = await request.get(`/clientmetrics/${stationId}?${name}`, {
      params: {
        productionOrderId,
        endTime,
        startTime,
        includeNoDataDatapoints,
      },
    });
    return data;
  },
  async getMetrics(stationId, dataPoints, endTime, startTime, includeNoDataDatapoints) {
    let name = '';
    dataPoints.forEach((datapoint) => {
      if (dataPoints.indexOf(datapoint) === 0) {
        name += `name=${datapoint}`;
      } else {
        name += `&name=${datapoint}`;
      }
    });
    const { data } = await request.get(`/clientmetrics/${stationId}?${name}`, {
      params: {
        endTime,
        startTime,
        includeNoDataDatapoints,
      },
    });
    return data;
  },
};

export default widgetsApi;
