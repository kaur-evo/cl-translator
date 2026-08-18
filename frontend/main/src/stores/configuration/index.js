import { defineStore } from 'pinia';

import configurationApi from '@/api/configurationApi';
import authConfigApi from '@/api/authConfiguration';
import processConfig from '@/helpers/config-helper';
import { isRoleSameLevelOrAbove } from '@/helpers/permissions/isRoleSameLevelOrAbove';
import useGenericNotificationStore from '@/stores/genericNotification';
import useFeatureStore from '@/stores/feature';
import useProfileStore from '@/stores/profile';
import useStationStore from '@/stores/station';
import useFactoryStore from '@/stores/factory';

const useConfigurationStore = defineStore('configuration', {
  state: () => ({
    configuration: {},
    authConfig: {},
    loading: [],
    confPromise: null,
  }),
  actions: {
    async fetchConfiguration(params) {
      const confRequest = configurationApi.getConfiguration(params);
      const authConfRequest = authConfigApi.getAuthConfigList();
      this.confPromise = confRequest;
      this.loading.push(confRequest);
      const configurations = await confRequest;
      const authConfigList = await authConfRequest;
      this.loading.pop();
      this.configuration = processConfig(configurations);
      this.authConfig = authConfigList.reduce((acc, config) => {
        acc[config.SK] = config;
        return acc;
      }, {});
      return configurations;
    },
    async saveAuthMFAConfig(formData) {
      try {
        const result = await authConfigApi.saveAuthMFAConfig(formData);
        this.authConfig = { ...this.authConfig, MultiFactorAuthConfig: result };
      } catch (error) {
        const genericNotificationStore = useGenericNotificationStore();
        genericNotificationStore.notifyError(error.response.data.message);
      }
    },
  },
  getters: {
    isLoading: (state) => !!state.loading.length,
    globalAnnouncement: (state) => state.configuration.globalAnnouncement,
    productChangeTabs() {
      const tabs = this.configuration.productChangeTabs ? this.configuration.productChangeTabs.split(',') : [];
      const featureStore = useFeatureStore();
      if (!featureStore.productionOrdersEnabled) {
        return tabs.filter((tab) => tab !== 'orders');
      }
      return tabs;
    },
    showOperatorsReport() {
      const showOperators = this.configuration?.showOperatorsReport;
      if (typeof showOperators === 'boolean') {
        return showOperators;
      }
      if (typeof showOperators === 'string') {
        const profileStore = useProfileStore();
        return isRoleSameLevelOrAbove(profileStore.highestUserRole, showOperators);
      }
      return false;
    },
    includeNoDataDatapoints: (state) => state.configuration.includeNoDataDatapoints !== false,
    disableTrendline: (state) => state.configuration.disableTrendline === true,
    showLocationBeforeGroup: (state) => (state.configuration?.showLocationBeforeGroup && !state.configuration?.showLocationBeforeReason) || false,
    showLocationBeforeReason: (state) => (state.configuration?.showLocationBeforeReason && !state.configuration?.showLocationBeforeGroup) || false,
    checklistStations() {
      const featureStore = useFeatureStore();
      if (featureStore.checklistsEnabled) {
        const stationStore = useStationStore();
        if (!this.configuration.checklistStations || this.configuration.checklistStations.length === 0) {
          return stationStore.stations.map((station) => station.id);
        }
        return this.configuration.checklistStations.filter((stationId) => !!stationStore.stationsRealMap.get(stationId));
      }
      return [];
    },
    adminChecklistStations() {
      const stationStore = useStationStore();
      return this.checklistStations.filter((stationId) => !!stationStore.adminStationsMap[stationId]);
    },
    checklistFactories() {
      const stationStore = useStationStore();
      const factoryStore = useFactoryStore();
      const factoryIds = this.checklistStations.map((stationId) => stationStore.stationsRealMap.get(stationId)?.factoryId);
      const factoryIdsSet = new Set(factoryIds);
      const factories = [...factoryIdsSet].map((factoryId) => factoryStore.factoriesRealMap.get(factoryId));
      return factories;
    },
    productionSpeedReportEnabled: (state) => state.configuration.productionSpeedReportEnabled === true,
    aiNotesInsightsEnabled: (state) => state.configuration.aiNotesInsightsEnabled === true,
  },
});

export default useConfigurationStore;
