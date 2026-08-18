import request from './request';

const timelineApi = {

  /**
   * Finds currently active or last active shift
   * @param {number} stationId - stationId for which to get the current shift.
   * @return {Promise} Promise object representing given station current shift
   */
  async getCurrent(stationId) {
    if (!stationId) {
      throw Error('StationId is required for fetching a timeline');
    }
    try {
      const { data } = await request.get(`/timeline/${stationId}/currentshift?tz=utc&runningGreenFilter=false`);
      return data;
    } catch (error) {
      return error.response;
    }
  },

  /**
   * Selects timeline by id
   * @param {number} shiftId - shiftId of the shift.
   * @return {Promise} Promise resolving to the shift
   */
  async selectById(shiftId) {
    if (!shiftId) {
      throw Error('shiftId is required for fetching shift');
    }
    const { data } = await request.get(`/timeline/${shiftId}?tz=utc&runningGreenFilter=false`);
    return data;
  },

  /**
   * Selects next shift timeline if possible
   * @param {number} shiftId - shiftId from which to get the next shift.
   * @return {Promise} Promise resolving to next shift from given
   */
  async selectNext(shiftId) {
    if (!shiftId) {
      throw Error('shiftId is required for fetching next shift');
    }
    const { data } = await request.get(`/timeline/${shiftId}/next?tz=utc&runningGreenFilter=false`);
    return data;
  },

  /**
   * Selects previous shift if possible
   * @param {number} shiftId - shiftId from which to get the previous shift.
   * @return {Promise} Promise resolving to given station previous shift
   */
  async selectPrevious(shiftId) {
    if (!shiftId) {
      throw Error('shiftId is required for fetching previous shift');
    }
    const { data } = await request.get(`/timeline/${shiftId}/prev?tz=utc&runningGreenFilter=false`);
    return data;
  },

  async deleteProductionSignals(stationId, eventTimesList) {
    const { data } = await request.delete(`/timeline/${stationId}/signals`, { data: { eventTimesISO: eventTimesList } });
    return data;
  },

  async addProductionSignal(stationId, body) {
    const { data } = await request.post(`/timeline/${stationId}/signal`, body);
    return data;
  },
};

export default timelineApi;
