import request from './request';

const messageApi = {
  async getMessages(stationId) {
    const { data } = await request.get(`/message/${stationId}`);
    return data;
  },

  async getMessageByThreadId(stationId, threadId) {
    const { data } = await request.get(`/message/${stationId}/${threadId}`);
    return data;
  },

  async getArchivedMessages(stationId) {
    const { data } = await request.get(`/message/${stationId}/archived`);
    return data;
  },

  async sendMessage(stationId, body) {
    const { data } = await request.post(`/message/${stationId}`, body);
    return data;
  },

  async getUnread(stationId) {
    const { data } = await request.get(`/message/unreadcount/${stationId}`);
    return data;
  },

  async toggleMessage(stationId, body) {
    const { data } = await request.put(`/message/${stationId}`, body);
    return data;
  },

  async getStationAddress(stationId) {
    const { data } = await request.get(`/message/${stationId}/address`);
    return data;
  },

  async deleteMessage(stationId, threadId) {
    const { data } = await request.delete(`/message/${stationId}/${threadId}`);
    return data;
  },

};

export default messageApi;
