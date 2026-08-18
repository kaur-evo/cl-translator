import { defineStore } from 'pinia';

import improvements5WhysApi from '@/api/improvements5WhysApi';

const useImprovementsAnalysisStore = defineStore('improvementsAnalysis', {
  state: () => ({
    analysis: {},
    project5Whys: [],
  }),
  actions: {
    setAnalysis(analysis) {
      this.analysis = analysis;
      this.project5Whys = analysis['5whys'] || [];
    },
    async fetchAnalysis(projectId) {
      try {
        const currentAnalysis = await improvements5WhysApi.get5Whys(projectId);
        this.setAnalysis(currentAnalysis);
      } catch (error) {
        const { default: useGenericNotificationStore } = await import('@/stores/genericNotification');
        const genericNotificationStore = useGenericNotificationStore();
        genericNotificationStore.notifyError(error.response.data.message);
      }
    },
    async saveAnalysis({ projectId, analysis }) {
      try {
        const analysisResponse = await improvements5WhysApi.save5Whys(projectId, analysis);
        this.setAnalysis(analysisResponse);
      } catch (error) {
        const { default: useGenericNotificationStore } = await import('@/stores/genericNotification');
        const genericNotificationStore = useGenericNotificationStore();
        genericNotificationStore.notifyError(error.response.data.message);
      }
    },
  },
});

export default useImprovementsAnalysisStore;
