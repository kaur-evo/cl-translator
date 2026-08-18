import { defineStore } from 'pinia';

import scrapReasonApi from '@/api/scrapReasonApi';
import mergeFilteredRequestState from '@/helpers/list/mergeFilteredRequestState';
import listToKeyMap from '@/helpers/list/listToKeyMap';
import i18n from '@/services/i18n';
import getGroupsWithAdminPermissions from '@/helpers/permissions/getGroupsWithAdminPermissions';
import useGenericNotificationStore from '@/stores/genericNotification';
import useProfileStore from '@/stores/profile';
import useStationStore from '@/stores/station';

const useScrapReasonStore = defineStore('scrapReason', {
  state: () => ({
    scrapReasonsList: [],
    scrapReasonGroupsList: [],
    loading: [],
  }),
  actions: {
    startLoading() {
      this.loading.push('loading');
    },
    finishLoading() {
      this.loading.pop();
    },
    setScrapReasons(scrapReasons) {
      this.scrapReasonsList = scrapReasons;
    },
    setScrapReasonGroups(scrapReasonGroups) {
      this.scrapReasonGroupsList = scrapReasonGroups;
    },
    markScrapReasonDeleted(id) {
      const reason = this.scrapReasonsList.find((el) => el.id === id);
      if (reason) reason.deleted = true;
    },
    markScrapReasonGroupDeleted(id) {
      const group = this.scrapReasonGroupsList.find((el) => el.id === id);
      if (group) group.deleted = true;
      this.scrapReasonsList.forEach((reason, index) => {
        if (reason.groupId === id) this.scrapReasonsList[index].deleted = true;
      });
    },
    async fetchScrapReasons(params = {}) {
      this.startLoading();
      const scrapReasons = await scrapReasonApi.getScrapReasons(params) || [];
      this.finishLoading();
      this.setScrapReasons(mergeFilteredRequestState(this.scrapReasonsRealMap, scrapReasons, 'ordering', false));
    },
    fetchAllScrapReasons(params) {
      this.fetchScrapReasons({ ...params, includePredefined: true, includeDeleted: true });
    },
    async saveScrapReason(data) {
      this.startLoading();
      let scrapReason = null;
      try {
        if (data.id) {
          scrapReason = await scrapReasonApi.putScrapReason(data);
          useGenericNotificationStore().notifyUpdated(scrapReason.primaryName);
        } else {
          scrapReason = await scrapReasonApi.postScrapReason(data);
          useGenericNotificationStore().notifyAdded(scrapReason.primaryName);
        }
        this.fetchScrapReasons({ id: scrapReason.id });
        return scrapReason;
      } catch (error) {
        useGenericNotificationStore().notifyError(error.response.data.message);
        return error;
      } finally {
        this.finishLoading();
      }
    },
    async updateScrapReasonOrder(scrapReason) {
      this.startLoading();
      await scrapReasonApi.patchScrapReason(scrapReason);
      this.fetchScrapReasons({ groupId: scrapReason.groupId });
      this.finishLoading();
    },
    async deleteScrapReason(scrapReason) {
      this.startLoading();
      await scrapReasonApi.deleteScrapReason(scrapReason.id);
      useGenericNotificationStore().notifyDeleted(scrapReason.primaryName);
      this.markScrapReasonDeleted(scrapReason.id);
      this.finishLoading();
    },
    async fetchScrapReasonGroups(params) {
      this.startLoading();
      const scrapReasonGroups = await scrapReasonApi.getScrapReasonGroups({ ...params, includeDeleted: true }) || [];
      this.setScrapReasonGroups(mergeFilteredRequestState(this.scrapReasonGroupsRealMap, scrapReasonGroups, 'ordering', false));
      this.finishLoading();
    },
    async updateScrapReasonGroupOrder(scrapReason) {
      this.startLoading();
      await scrapReasonApi.patchScrapReasonGroup(scrapReason);
      this.fetchScrapReasonGroups();
      this.finishLoading();
    },
    async saveScrapReasonGroup(data) {
      this.startLoading();
      let scrapReasonGroup;
      try {
        if (data.id) {
          scrapReasonGroup = await scrapReasonApi.putScrapReasonGroup(data);
          useGenericNotificationStore().notifyUpdated(scrapReasonGroup.primaryName);
        } else {
          scrapReasonGroup = await scrapReasonApi.postScrapReasonGroup(data);
          useGenericNotificationStore().notifyAdded(scrapReasonGroup.primaryName);
        }
        this.fetchScrapReasonGroups();
        return scrapReasonGroup;
      } catch (error) {
        if (error) useGenericNotificationStore().notifyError(error.response.data.message);
        return error;
      } finally {
        this.finishLoading();
      }
    },
    async deleteScrapReasonGroup(group) {
      this.startLoading();
      try {
        await scrapReasonApi.deleteScrapReasonGroup(group.id);
        useGenericNotificationStore().notifyDeleted(group.primaryName);
        this.markScrapReasonGroupDeleted(group.id);
      } catch (error) {
        useGenericNotificationStore().notifyError(error.response.data.message);
      }
      this.finishLoading();
    },
  },
  getters: {
    scrapReasons: (state) => state.scrapReasonsList.filter((scrapReason) => !scrapReason.deleted),
    allScrapReasons: (state) => state.scrapReasonsList,
    scrapReasonsMap: (state) => listToKeyMap(state.scrapReasonsList, 'id'),
    scrapReasonsRealMap: (state) => new Map(state.scrapReasonsList.map((scrapReason) => [scrapReason.id, scrapReason])),
    scrapReasonGroupsMap: (state) => listToKeyMap(state.scrapReasonGroupsList, 'id'),
    scrapReasonGroupsRealMap: (state) => new Map(state.scrapReasonGroupsList.map((group) => [group.id, group])),
    scrapReasonGroups: (state) => state.scrapReasonGroupsList.filter((group) => !group.deleted),
    scrapReasonGroupsWithAdminPermissions() {
      const roles = useProfileStore().currentRoles;
      return getGroupsWithAdminPermissions(this.scrapReasonGroups, roles);
    },
    scrapReasonGroupsWithAdminPermissionsMap() {
      return listToKeyMap(this.scrapReasonGroupsWithAdminPermissions, 'id');
    },
    scrapReasonGroupsWithOrdering() {
      return this.scrapReasonGroups.map(
        (scrapReason) => ({ ...scrapReason, ordering: scrapReason.name }),
      );
    },
    scrapReasonGroupsInclUncommented() {
      return [this.uncommentedGroup, ...this.scrapReasonGroupsWithOrdering];
    },
    isLoading: (state) => !!state.loading.length,
    shiftviewStationScrapReasons() {
      const { lineviewStation } = useStationStore();
      return this.scrapReasons.filter((scrapReason) => {
        const group = this.scrapReasonGroupsRealMap.get(scrapReason.groupId);
        if (!group) return false;
        return scrapReason.stationIds.includes(lineviewStation.id) && (!group.local || group.factoryIds.includes(lineviewStation.factoryId));
      });
    },
    uncommentedGroup: () => ({
      factoryIds: [],
      id: -1,
      name: i18n.global.t('Uncommented'),
      ordering: -1,
    }),
  },
});

export default useScrapReasonStore;
