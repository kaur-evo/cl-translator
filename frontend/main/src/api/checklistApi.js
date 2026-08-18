import request from '@/api/request';

const checklistApi = {
  async getCheckTemplate(id) {
    if (!id) {
      throw Error('id is required!');
    }
    const { data } = await request.get(`/checklists/${id}`);
    return data;
  },

  async getChecklistTasks(shiftId) {
    if (!shiftId) {
      throw Error('shiftId is required!');
    }
    const { data } = await request.get(`/process/checklists/tasks/${shiftId}`);
    return data;
  },

  async deleteChecklistPin(taskId) {
    const { data } = await request.delete(`/process/checklists/tasks/${taskId}`);
    return data;
  },

  async saveCheck(checkData) {
    const { data } = await request.put('/process/checklists/submit', checkData);
    return data;
  },
  async getChecklists(params) {
    // params {stationId, onlyManual, onlyActive}
    const { data } = await request.get('/checklists', {
      params,
    });
    return data;
  },

  async deleteChecklistTemplate(checklistId, params) {
    // params {factoryId}
    const { data } = await request.delete(`/checklists/${checklistId}`, {
      params,
    });
    return data;
  },

  async putChecklist(checklist, params) {
    // params {factoryId}
    const { data } = await request.put('/checklists', checklist, {
      params,
    });
    return data;
  },

  async saveManualCheck(templateId, body) {
    const { data } = await request.post(`/checklists/${templateId}`, body);
    return data;
  },

  async getChecklistGroups(params) {
    const { data } = await request.get('/checklistgroups', {
      params,
    });
    return data;
  },

  async postChecklistGroup(group) {
    const { data } = await request.post('/checklistgroups', group);
    return data;
  },

  async putChecklistGroup(group) {
    const { data } = await request.put(`/checklistgroups/${group.id}`, group);
    return data;
  },

  async deleteChecklistGroup(groupId) {
    const { data } = await request.delete(`/checklistgroups/${groupId}`);
    return data;
  },

  async postChecklistFile(formData) {
    const { data } = await request.post('/checklisttask/uploadfiles', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },

  async getChecklistFile(fileData) {
    const { data } = await request.post('/checklisttask/downloadfile', fileData, {
      responseType: 'blob',
    });
    return data;
  },

  async getTaskFiles(taskInfo) {
    const { data } = await request.post('/checklisttask/getfiles', taskInfo);
    return data;
  },
};

export default checklistApi;
