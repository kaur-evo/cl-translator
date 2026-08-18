import { defineStore } from 'pinia';

import featureApi from '@/api/featureApi';
import processConfig from '@/helpers/config-helper';
import useConfigurationStore from '@/stores/configuration';

const useFeatureStore = defineStore('feature', {
  state: () => ({
    activityLogs: false,
    alerts: false,
    apiAccess: false,
    checklists: false,
    customReporting: false,
    tags: false,
    productionOrders: false,
    securitySettings: false,
    productionSpeedReport: false,
    qualityYield: false,
    improvements: false,
    enableIncreaseQtyWithScrap: false,
    semiFinished: false,
    showProductTour: false,
    overdueInvoiceNotificationEnabled: false,
    promise: null,
    loading: false,
  }),
  actions: {
    async fetchFeatures() {
      this.loading = true;
      try {
        const promise = featureApi.getFeatures();
        this.promise = promise;
        const features = await promise;
        const processed = processConfig(features);
        Object.entries(processed).forEach(([key, value]) => {
          if (key in this.$state) {
            this[key] = value;
          }
        });
      } catch (error) {
        console.error('Error fetching features:', error);
      } finally {
        this.loading = false;
      }
    },
  },
  getters: {
    isLoading: (state) => !!state.loading,
    activityLogsEnabled: (state) => !!state.activityLogs,
    alertsEnabled: (state) => !!state.alerts,
    checklistsEnabled: (state) => !!state.checklists,
    customReportingEnabled: (state) => !!state.customReporting,
    apiAccessEnabled: (state) => !!state.apiAccess,
    tagsEnabled: (state) => !!state.tags,
    qualityYieldEnabled: (state) => !!state.qualityYield,
    improvementsEnabled: (state) => !!state.improvements,
    increaseQtyWithScrapEnabled: (state) => !!state.enableIncreaseQtyWithScrap,
    semiFinishedEnabled: (state) => !!state.semiFinished,
    productTourEnabled: (state) => !!state.showProductTour,
    productionOrdersEnabled: (state) => !!state.productionOrders,
    productionSpeedReportEnabled() {
      return useConfigurationStore().productionSpeedReportEnabled && !!this.productionSpeedReport;
    },
    securitySettingsEnabled: (state) => !!state.securitySettings,
  },
});

export default useFeatureStore;
