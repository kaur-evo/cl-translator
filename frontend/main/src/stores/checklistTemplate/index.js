import { defineStore } from 'pinia';

import listToKeyMap from '@/helpers/list/listToKeyMap';
import checklistApi from '@/api/checklistApi';

const useChecklistTemplateStore = defineStore('checklistTemplate', {
  state: () => ({
    checklistTemplates: [],
    loading: [],
    shiftviewStationManualTemplates: [],
    checklistGroups: [],
  }),
  getters: {
    checklistsTemplatesMap: (state) => listToKeyMap(state.checklistTemplates, 'id'),
    isLoading: (state) => !!state.loading.length,
    checklistGroupsMap: (state) => listToKeyMap(state.checklistGroups, 'id'),
  },
  actions: {
    async fetchChecklists() {
      try {
        this.loading.push('loading');
        const checklists = await checklistApi.getChecklists() || [];
        this.checklistTemplates = checklists;
      } finally {
        this.loading.pop();
      }
    },
    async saveChecklist(data) {
      this.loading.push('loading');
      try {
        const checklist = await checklistApi.putChecklist(data);
        const { default: useGenericNotificationStore } = await import('@/stores/genericNotification');
        const genericNotificationStore = useGenericNotificationStore();
        genericNotificationStore[data.id ? 'notifyUpdated' : 'notifyAdded'](checklist.name);
        const index = this.checklistTemplates.findIndex((c) => c.id === checklist.id);
        if (index > -1) this.checklistTemplates.splice(index, 1, checklist);
        else this.checklistTemplates.push(checklist);
        return checklist;
      } catch (error) {
        const { default: useGenericNotificationStore } = await import('@/stores/genericNotification');
        const genericNotificationStore = useGenericNotificationStore();
        genericNotificationStore.notifyError(error.response.data.message);
        return error;
      } finally {
        this.loading.pop();
      }
    },
    async deleteChecklistTemplate(checklist) {
      this.loading.push('loading');
      try {
        await checklistApi.deleteChecklistTemplate(checklist.id);
        const { default: useGenericNotificationStore } = await import('@/stores/genericNotification');
        const genericNotificationStore = useGenericNotificationStore();
        genericNotificationStore.notifyDeleted(checklist.name);
        const index = this.checklistTemplates.findIndex((el) => el.id === checklist.id);
        if (index > -1) this.checklistTemplates.splice(index, 1);
      } catch (error) {
        const { default: useGenericNotificationStore } = await import('@/stores/genericNotification');
        const genericNotificationStore = useGenericNotificationStore();
        genericNotificationStore.notifyError(error.response.data.message);
      }
      this.loading.pop();
    },
    async fetchManualChecklistTemplates(params = {}) {
      this.loading.push('loading');
      const manualTemplates = await checklistApi.getChecklists({ ...params, onlyManual: true, onlyActive: true }) || [];
      this.shiftviewStationManualTemplates = manualTemplates;
      this.loading.pop();
    },
    async fetchChecklistGroups(params = {}) {
      this.loading.push('loading');
      const groups = await checklistApi.getChecklistGroups(params) || [];
      this.checklistGroups = groups;
      this.loading.pop();
    },
    async saveChecklistGroup(group) {
      try {
        this.loading.push('loading');
        const { default: useGenericNotificationStore } = await import('@/stores/genericNotification');
        const genericNotificationStore = useGenericNotificationStore();
        let savedGroup;
        if (group.id) {
          savedGroup = await checklistApi.putChecklistGroup(group);
          genericNotificationStore.notifyUpdated(group.name);
        } else {
          savedGroup = await checklistApi.postChecklistGroup(group);
          genericNotificationStore.notifyAdded(group.name);
        }
        const index = this.checklistGroups.findIndex((el) => el.id === savedGroup.id);
        if (index > -1) {
          this.checklistGroups[index] = savedGroup;
        } else {
          this.checklistGroups.push(savedGroup);
        }
        return savedGroup;
      } catch (error) {
        const { default: useGenericNotificationStore } = await import('@/stores/genericNotification');
        const genericNotificationStore = useGenericNotificationStore();
        genericNotificationStore.notifyError(error.response.data.message);
        return error;
      } finally {
        this.loading.pop();
      }
    },
    async deleteChecklistGroup(group) {
      try {
        this.loading.push('loading');
        await checklistApi.deleteChecklistGroup(group.id);
        const { default: useGenericNotificationStore } = await import('@/stores/genericNotification');
        const genericNotificationStore = useGenericNotificationStore();
        genericNotificationStore.notifyDeleted(group.name);
        const index = this.checklistGroups.findIndex((el) => el.id === group.id);
        if (index > -1) this.checklistGroups.splice(index, 1);
      } catch (error) {
        const { default: useGenericNotificationStore } = await import('@/stores/genericNotification');
        const genericNotificationStore = useGenericNotificationStore();
        genericNotificationStore.notifyError(error.response.data.message);
      } finally {
        this.loading.pop();
      }
    },
  },
});

export default useChecklistTemplateStore;
