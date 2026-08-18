import { defineStore } from 'pinia';

import performanceCommentApi from '@/api/performanceCommentApi';
import performanceCommentGroupApi from '@/api/performanceCommentGroupApi';
import mergeFilteredRequestState from '@/helpers/list/mergeFilteredRequestState';
import listToKeyMap from '@/helpers/list/listToKeyMap';
import i18n from '@/services/i18n';
import { UNCOMMENTED_ID } from '@/constants/identificators';
import getGroupsWithAdminPermissions from '@/helpers/permissions/getGroupsWithAdminPermissions';
import useGenericNotificationStore from '@/stores/genericNotification';
import useProfileStore from '@/stores/profile';
import useStationStore from '@/stores/station';

const usePerfCommentStore = defineStore('perfComment', {
  state: () => ({
    perfCommentsList: [],
    perfCommentGroupsList: [],
    loading: [],
  }),
  actions: {
    startLoading() {
      this.loading.push('loading');
    },
    finishLoading() {
      this.loading.pop();
    },
    setPerfComments(perfComments) {
      this.perfCommentsList = perfComments;
    },
    setPerfCommentGroups(perfCommentGroups) {
      this.perfCommentGroupsList = perfCommentGroups;
    },
    markPerfCommentDeleted(id) {
      const comment = this.perfCommentsList.find((el) => el.id === id);
      if (comment) comment.deleted = true;
    },
    markPerfCommentGroupDeleted(id) {
      const group = this.perfCommentGroupsList.find((el) => el.id === id);
      if (group) group.deleted = true;
      this.perfCommentsList.forEach((comment, index) => {
        if (comment.groupId === id) this.perfCommentsList[index].deleted = true;
      });
    },
    async fetchPerfComments(params = {}) {
      this.startLoading();
      const perfComments = await performanceCommentApi.getPerformanceComments(params) || [];
      this.finishLoading();
      this.setPerfComments(mergeFilteredRequestState(this.perfCommentsRealMap, perfComments, 'ordering', false));
    },
    fetchAllPerfComments(params) {
      this.fetchPerfComments({ ...params, includePredefined: true, includeDeleted: true });
    },
    async updatePerfCommentOrder(data) {
      this.startLoading();
      await performanceCommentApi.patchPerformanceComment(data);
      this.fetchPerfComments({ groupId: data.groupId });
      this.finishLoading();
    },
    async savePerfComment(data) {
      this.startLoading();
      let perfComment = null;
      try {
        if (data.id) {
          perfComment = await performanceCommentApi.putPerformanceComment(data);
          useGenericNotificationStore().notifyUpdated(perfComment.primaryName);
        } else {
          perfComment = await performanceCommentApi.postPerformanceComment(data);
          useGenericNotificationStore().notifyAdded(perfComment.primaryName);
        }
        this.fetchPerfComments({ id: perfComment.id });
      } catch (error) {
        useGenericNotificationStore().notifyError(error.response.data.message);
        return error;
      } finally {
        this.finishLoading();
      }
      return perfComment;
    },
    async deletePerfComment(perfComment) {
      this.startLoading();
      await performanceCommentApi.deletePerformanceComment(perfComment.id);
      useGenericNotificationStore().notifyDeleted(perfComment.primaryName);
      this.markPerfCommentDeleted(perfComment.id);
      this.finishLoading();
    },
    async fetchPerfCommentGroups(params) {
      this.startLoading();
      const perfCommentGroups = await performanceCommentGroupApi.getPerformanceCommentGroups({ ...params, includeDeleted: true }) || [];
      this.setPerfCommentGroups(mergeFilteredRequestState(this.perfCommentGroupsRealMap, perfCommentGroups, 'ordering', false));
      this.finishLoading();
    },
    async updatePerfCommentGroupOrder(params) {
      this.startLoading();
      await performanceCommentGroupApi.patchPerformanceCommentGroup(params);
      this.fetchPerfCommentGroups();
      this.finishLoading();
    },
    async savePerfCommentGroup(perfCommentGroup) {
      this.startLoading();
      try {
        let group;
        if (perfCommentGroup.id) {
          group = await performanceCommentGroupApi.putPerformanceCommentGroup(perfCommentGroup);
          useGenericNotificationStore().notifyUpdated(group.primaryName);
        } else {
          group = await performanceCommentGroupApi.postPerformanceCommentGroup(perfCommentGroup);
          useGenericNotificationStore().notifyAdded(group.primaryName);
        }
        this.fetchPerfCommentGroups();
        return group;
      } catch (error) {
        if (error) useGenericNotificationStore().notifyError(error.response.data.message);
        return error;
      } finally {
        this.finishLoading();
      }
    },
    async deletePerfCommentGroup(perfCommentGroup) {
      this.startLoading();
      try {
        await performanceCommentGroupApi.deletePerformanceCommentGroup(perfCommentGroup.id);
        useGenericNotificationStore().notifyDeleted(perfCommentGroup.primaryName);
        this.markPerfCommentGroupDeleted(perfCommentGroup.id);
      } catch (error) {
        useGenericNotificationStore().notifyError(error.response.data.message);
      }
      this.finishLoading();
    },
  },
  getters: {
    perfComments: (state) => state.perfCommentsList.filter((perfComment) => !perfComment.deleted),
    allPerfComments: (state) => state.perfCommentsList,
    perfCommentsMap: (state) => listToKeyMap(state.perfCommentsList, 'id'),
    allPerfCommentsMap() {
      return { ...this.perfCommentsMap, [UNCOMMENTED_ID]: this.uncommented };
    },
    perfCommentsRealMap: (state) => new Map(state.perfCommentsList.map((perfComment) => [perfComment.id, perfComment])),
    perfCommentGroups: (state) => state.perfCommentGroupsList.filter((group) => !group.deleted),
    perfCommentGroupsWithAdminPermissions() {
      const roles = useProfileStore().currentRoles;
      return getGroupsWithAdminPermissions(this.perfCommentGroups, roles);
    },
    perfCommentGroupsWithAdminPermissionsMap() {
      return listToKeyMap(this.perfCommentGroupsWithAdminPermissions, 'id');
    },
    perfCommentGroupsMap: (state) => listToKeyMap(state.perfCommentGroupsList, 'id'),
    perfCommentGroupsRealMap: (state) => new Map(state.perfCommentGroupsList.map((group) => [group.id, group])),
    perfCommentGroupsWithOrdering() {
      return this.perfCommentGroups.map(
        (perfComment) => ({ ...perfComment, ordering: perfComment.name }),
      );
    },
    menuPerfComments() {
      return [this.uncommented, ...this.perfComments];
    },
    menuPerfCommentGroups() {
      return [this.uncommentedGroup, ...this.perfCommentGroupsWithOrdering];
    },
    isLoading: (state) => !!state.loading.length,
    shiftviewStationPerfComments() {
      const { lineviewStation } = useStationStore();
      return this.$state.perfCommentsList.filter(
        (comment) => {
          const group = comment.groupId ? this.perfCommentGroupsRealMap.get(comment.groupId) : { factoryIds: [] };
          if (!group) return false;
          const stationFactory = lineviewStation.factoryId;
          return comment.stationIds.includes(lineviewStation.id) && (group.factoryIds.includes(stationFactory) || !group.local) && !comment.deleted;
        },
      );
    },
    shiftviewStationPerfCommentGroups() {
      const reasonGroups = new Set();
      this.shiftviewStationPerfComments.forEach((comment) => {
        if (comment.groupId) reasonGroups.add(comment.groupId);
      });
      return this.perfCommentGroups.filter((group) => reasonGroups.has(group.id));
    },
    uncommentedGroup: () => ({
      factoryIds: [],
      id: -1,
      name: i18n.global.t('Uncommented'),
      ordering: -1,
    }),
    uncommented: () => ({
      factoryIds: [],
      groupId: -1,
      id: UNCOMMENTED_ID,
      name: i18n.global.t('Uncommented'),
      ordering: -1,
      primaryName: i18n.global.t('Uncommented'),
      stationIds: [],
    }),
  },
});

export default usePerfCommentStore;
