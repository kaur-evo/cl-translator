import { defineStore } from 'pinia';

import checklistApi from '@/api/checklistApi';
import useShiftStore from '@/stores/shift';

const useChecklistTaskStore = defineStore('checklistTask', {
  state: () => ({
    checklistTasks: [],
    loading: [],
    runningShiftChecklists: [],
  }),
  getters: {
    isLoading: (state) => !!state.loading.length,
  },
  actions: {
    async fetchChecklistTasks() {
      this.loading.push('loading');
      try {
        const currentShiftId = useShiftStore().currentShift.id;
        const shiftId = useShiftStore().shift.id;
        if (currentShiftId !== shiftId) {
          const runningShiftChecklists = await checklistApi.getChecklistTasks(currentShiftId);
          this.runningShiftChecklists = runningShiftChecklists;
        }
        const checklistTasks = await checklistApi.getChecklistTasks(shiftId);
        this.checklistTasks = checklistTasks;
      } finally {
        this.loading.pop();
      }
    },
    async saveCheck(data) {
      this.loading.push('loading');
      try {
        await checklistApi.saveCheck(data);
        const { default: useGenericNotificationStore } = await import('@/stores/genericNotification');
        const genericNotificationStore = useGenericNotificationStore();
        genericNotificationStore.notifySaved(data.name);
      } catch (error) {
        const { default: useGenericNotificationStore } = await import('@/stores/genericNotification');
        const genericNotificationStore = useGenericNotificationStore();
        genericNotificationStore.notifyError(error.response.data.message || error);
      } finally {
        this.loading.pop();
      }
    },
    async deleteChecklistTask(checklist) {
      this.loading.push('loading');
      try {
        await checklistApi.deleteChecklistPin(encodeURIComponent(checklist.id));
        const { default: useGenericNotificationStore } = await import('@/stores/genericNotification');
        const genericNotificationStore = useGenericNotificationStore();
        genericNotificationStore.notifyDeleted(checklist.name);
        const index = this.checklistTasks.findIndex((el) => el.id === checklist.id);
        if (index > -1) this.checklistTasks.splice(index, 1);
      } catch (error) {
        const { default: useGenericNotificationStore } = await import('@/stores/genericNotification');
        const genericNotificationStore = useGenericNotificationStore();
        genericNotificationStore.notifyError(error.response.data.message);
      } finally {
        this.loading.pop();
      }
    },
    async saveManualCheck(data) {
      this.loading.push('loading');
      try {
        const res = await checklistApi.saveManualCheck(data.checklistId, data);
        const { default: useGenericNotificationStore } = await import('@/stores/genericNotification');
        const genericNotificationStore = useGenericNotificationStore();
        genericNotificationStore.notifySaved(data.name);
        return res;
      } catch (error) {
        const { default: useGenericNotificationStore } = await import('@/stores/genericNotification');
        const genericNotificationStore = useGenericNotificationStore();
        genericNotificationStore.notifyError(error.response.data.message || error);
        return error;
      } finally {
        this.loading.pop();
      }
    },
  },
});

export default useChecklistTaskStore;
