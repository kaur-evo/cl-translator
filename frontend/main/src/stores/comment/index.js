import { defineStore } from 'pinia';

import commentApi from '@/api/commentApi';
import mergeFilteredRequestState from '@/helpers/list/mergeFilteredRequestState';
import listToKeyMap from '@/helpers/list/listToKeyMap';
import i18n from '@/services/i18n';
import { UNCOMMENTED_ID } from '@/constants/identificators';
import filterAndMap from '@/helpers/list/filterAndMap';
import getGroupsWithAdminPermissions from '@/helpers/permissions/getGroupsWithAdminPermissions';
import useGenericNotificationStore from '@/stores/genericNotification';
import useProfileStore from '@/stores/profile';
import useStationStore from '@/stores/station';

const isNotPredefined = (item) => item.id > 0;
const isNotDeleted = (item) => !item.deleted;

const useCommentStore = defineStore('comment', {
  state: () => ({
    commentsList: [],
    commentGroupsList: [],
    loading: [],
    commentsPromise: null,
  }),
  actions: {
    startLoading() {
      this.loading.push('loading');
    },
    finishLoading() {
      this.loading.pop();
    },
    setComments(comments) {
      this.commentsList = comments;
    },
    setCommentGroups(commentGroups) {
      this.commentGroupsList = commentGroups;
    },
    markCommentDeleted(id) {
      const comment = this.commentsList.find((el) => el.id === id);
      if (comment) comment.deleted = true;
    },
    markCommentGroupDeleted(id) {
      const group = this.commentGroupsList.find((el) => el.id === id);
      if (group) group.deleted = true;
      this.commentsList.forEach((comment, index) => {
        if (comment.groupId === id) this.commentsList[index].deleted = true;
      });
    },
    setCommentsPromise(promise) {
      this.commentsPromise = promise;
    },
    async fetchComments(params = {}) {
      this.startLoading();
      const commentsPromise = commentApi.getComments(params);
      this.setCommentsPromise(commentsPromise);
      const comments = await commentsPromise || [];
      this.setComments(mergeFilteredRequestState(this.commentsRealMap, comments, 'ordering', false));
      this.finishLoading();
    },
    fetchAllComments(params) {
      this.fetchComments({ ...params, includeDeleted: true, includePredefined: true });
    },
    async saveComment(data) {
      this.startLoading();
      let stopReason = null;
      try {
        if (data.id) {
          stopReason = await commentApi.putComment(data);
          useGenericNotificationStore().notifyUpdated(stopReason.primaryName);
        } else {
          stopReason = await commentApi.postComment(data);
          useGenericNotificationStore().notifyAdded(stopReason.primaryName);
        }
        this.fetchComments({ id: stopReason.id });
        return stopReason;
      } catch (error) {
        useGenericNotificationStore().notifyError(error.response.data.message);
        return error;
      } finally {
        this.finishLoading();
      }
    },
    async updateCommentOrder(comment) {
      this.startLoading();
      await commentApi.patchComment(comment);
      this.fetchComments({ groupId: comment.groupId });
      this.finishLoading();
    },
    async deleteComment(comment) {
      this.startLoading();
      try {
        await commentApi.deleteComment(comment.id);
        useGenericNotificationStore().notifyDeleted(comment.primaryName);
        this.markCommentDeleted(comment.id);
      } catch (error) {
        useGenericNotificationStore().notifyError(error.response.data.message);
      } finally {
        this.finishLoading();
      }
    },
    async fetchCommentGroups(params) {
      this.startLoading();
      const commentGroups = await commentApi.getCommentGroups(params) || [];
      this.setCommentGroups(mergeFilteredRequestState(this.commentGroupsRealMap, commentGroups, 'ordering', false));
      this.finishLoading();
    },
    async updateCommentGroupOrder(params) {
      this.startLoading();
      await commentApi.updateCommentGroupOrder(params);
      this.fetchCommentGroups();
      this.finishLoading();
    },
    async saveCommentGroup(stopReasonGroup) {
      this.startLoading();
      try {
        let group;
        if (stopReasonGroup.id) {
          group = await commentApi.putCommentGroup(stopReasonGroup);
          useGenericNotificationStore().notifyUpdated(group.primaryName);
        } else {
          group = await commentApi.postCommentGroup(stopReasonGroup);
          useGenericNotificationStore().notifyAdded(group.primaryName);
        }
        this.fetchCommentGroups();
        return group;
      } catch (error) {
        if (error) useGenericNotificationStore().notifyError(error.response.data.message);
        return error;
      } finally {
        this.finishLoading();
      }
    },
    async deleteCommentGroup(group) {
      this.startLoading();
      try {
        await commentApi.deleteCommentGroup(group.id);
        useGenericNotificationStore().notifyDeleted(group.primaryName);
        this.markCommentGroupDeleted(group.id);
      } catch (error) {
        useGenericNotificationStore().notifyError(error.response.data.message);
      }
      this.finishLoading();
    },
  },
  getters: {
    comments: (state) => state.commentsList.filter(isNotDeleted),
    allComments: (state) => state.commentsList,
    commentGroups: (state) => state.commentGroupsList.filter((group) => isNotPredefined(group) && isNotDeleted(group)),
    commentGroupsWithAdminPermissions() {
      const roles = useProfileStore().currentRoles;
      return getGroupsWithAdminPermissions(this.commentGroups, roles);
    },
    commentGroupsWithAdminPermissionsMap() {
      return listToKeyMap(this.commentGroupsWithAdminPermissions, 'id');
    },
    commentGroupsInclDeleted: (state) => state.commentGroupsList.filter(isNotPredefined),
    commentGroupsIncludePredefined: (state) => state.commentGroupsList.filter(isNotDeleted),
    commentsMap: (state) => listToKeyMap(state.commentsList, 'id'),
    commentsMapExcludeDeleted() {
      return listToKeyMap(this.comments, 'id');
    },
    allCommentsMap() {
      return { ...this.commentsMap, [UNCOMMENTED_ID]: this.uncommented };
    },
    commentsRealMap: (state) => new Map(state.commentsList.map((comment) => [comment.id, comment])),
    commentGroupsMap() {
      return listToKeyMap(this.commentGroupsInclDeleted, 'id');
    },
    commentGroupsRealMap: (state) => new Map(filterAndMap(
      state.commentGroupsList,
      [isNotDeleted, isNotPredefined],
      (group) => ([group.id, group]),
    )),
    commentGroupsWithOrdering: (state) => filterAndMap(
      state.commentGroupsList,
      [isNotDeleted, isNotPredefined],
      (group) => ({ ...group, ordering: group.name }),
    ),
    commentGroupsWithOrderingInclDeleted: (state) => filterAndMap(
      state.commentGroupsList,
      [isNotPredefined],
      (group) => ({ ...group, ordering: group.name }),
    ),
    menuCommentGroupsInclDeleted() {
      return [
        this.uncommentedGroup,
        ...this.commentGroupsWithOrderingInclDeleted,
      ];
    },
    menuComments() {
      return [this.uncommented, ...this.allComments];
    },
    isLoading: (state) => !!state.loading.length,
    commentsExcludePredefined() {
      return this.comments.filter((comment) => comment.groupId > 0);
    },
    shiftviewStationComments() {
      const { lineviewStation } = useStationStore();
      return this.$state.commentsList.filter(
        (comment) => {
          const group = comment.groupId ? this.commentGroupsRealMap.get(comment.groupId) : { factoryIds: [] };
          if (!group) return false;
          const stationFactory = lineviewStation.factoryId;
          return comment.stationIds.includes(lineviewStation.id) && (group.factoryIds.includes(stationFactory) || !group.local) && !comment.deleted;
        },
      );
    },
    shiftviewStationCommentGroups() {
      const groupsFromComments = new Set();
      this.shiftviewStationComments.forEach((comment) => {
        if (comment.groupId !== -1) groupsFromComments.add(comment.groupId);
      });
      return this.commentGroups.filter((group) => groupsFromComments.has(group.id));
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

export default useCommentStore;
