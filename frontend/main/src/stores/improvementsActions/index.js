import { defineStore } from 'pinia';

import improvementsMeasureApi from '@/api/improvementsMeasureApi';

const useImprovementsActionsStore = defineStore('improvementsActions', {
  state: () => ({
    actions: [],
  }),
  actions: {
    async fetchActions(projectId) {
      try {
        const actionResponse = await improvementsMeasureApi.getActions(projectId);
        this.actions = actionResponse;
      } catch (error) {
        const { default: useGenericNotificationStore } = await import('@/stores/genericNotification');
        const genericNotificationStore = useGenericNotificationStore();
        genericNotificationStore.notifyError(error.response.data.message);
      }
    },
    async saveAction({ action, replace }) {
      try {
        const actionResponse = await improvementsMeasureApi.saveAction(action);
        if (replace) this.actions = actionResponse;
        else this.actions.push(actionResponse[0]);
      } catch (error) {
        const { default: useGenericNotificationStore } = await import('@/stores/genericNotification');
        const genericNotificationStore = useGenericNotificationStore();
        genericNotificationStore.notifyError(error.response.data.message);
      }
    },
    async saveActionById({ action, index }) {
      try {
        const actionResponse = await improvementsMeasureApi.saveActionById(action.id, action);
        if (index > -1 && this.actions[index]) {
          this.actions[index] = actionResponse;
        }
      } catch (error) {
        const { default: useGenericNotificationStore } = await import('@/stores/genericNotification');
        const genericNotificationStore = useGenericNotificationStore();
        genericNotificationStore.notifyError(error.response.data.message);
      }
    },
  },
});

export default useImprovementsActionsStore;
