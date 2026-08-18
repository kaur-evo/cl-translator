import { defineStore } from 'pinia';

import improvementsMeasureApi from '@/api/improvementsMeasureApi';

const useImprovementsSolutionsStore = defineStore('improvementsSolutions', {
  state: () => ({
    solutions: [],
  }),
  actions: {
    async fetchSolutions(projectId) {
      try {
        const solutionResponse = await improvementsMeasureApi.getSolutions(projectId);
        this.solutions = solutionResponse;
      } catch (error) {
        const { default: useGenericNotificationStore } = await import('@/stores/genericNotification');
        const genericNotificationStore = useGenericNotificationStore();
        genericNotificationStore.notifyError(error.response.data.message);
      }
    },
    async saveSolution({ solution }) {
      try {
        const solutionResponse = await improvementsMeasureApi.saveSolution(solution);
        this.solutions.push(solutionResponse);
      } catch (error) {
        const { default: useGenericNotificationStore } = await import('@/stores/genericNotification');
        const genericNotificationStore = useGenericNotificationStore();
        genericNotificationStore.notifyError(error.response.data.message);
      }
    },
    async saveSolutionById({ solution, index }) {
      try {
        const solutionResponse = await improvementsMeasureApi.saveSolutionById(solution.id, solution);
        if (index > -1 && this.solutions[index]) {
          this.solutions[index] = solutionResponse;
        }
      } catch (error) {
        const { default: useGenericNotificationStore } = await import('@/stores/genericNotification');
        const genericNotificationStore = useGenericNotificationStore();
        genericNotificationStore.notifyError(error.response.data.message);
      }
    },
  },
});

export default useImprovementsSolutionsStore;
