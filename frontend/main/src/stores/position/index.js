import { defineStore } from 'pinia';

import positionApi from '@/api/positionApi';
import listToKeyMap from '@/helpers/list/listToKeyMap';
import filterByStationAdminPermissions from '@/helpers/permissions/filterByStationAdminPermissions';
import useGenericNotificationStore from '@/stores/genericNotification';
import useStationStore from '@/stores/station';

const addOrdering = (position) => ({
  ...position,
  ordering: position.stationOrder.reduce((acc, val) => {
    acc[val.stationId] = val.ordering;
    return acc;
  }, {}),
});

const usePositionStore = defineStore('position', {
  state: () => ({
    positions: [],
    loading: [],
  }),
  actions: {
    startLoading() {
      this.loading.push('loading');
    },
    finishLoading() {
      this.loading.pop();
    },
    setPositions(positions) {
      this.positions = positions.map(addOrdering);
    },
    setPosition(position) {
      const positionWithOrdering = addOrdering(position);
      const index = this.positions.findIndex((p) => p.id === position.id);
      if (index > -1) this.positions[index] = positionWithOrdering;
      else this.positions.push(positionWithOrdering);
    },
    removePosition(positionId) {
      const index = this.positions.findIndex((p) => p.id === positionId);
      if (index > -1) this.positions.splice(index, 1);
    },
    async fetchPositions(params = {}) {
      this.startLoading();
      const positions = await positionApi.getPositions(params) || [];
      this.finishLoading();
      this.setPositions(positions);
    },
    async savePosition(data) {
      this.startLoading();
      try {
        let position;
        if (data.id) {
          position = await positionApi.putPosition(data);
          useGenericNotificationStore().notifyUpdated(position.primaryName);
        } else {
          position = await positionApi.postPosition(data);
          useGenericNotificationStore().notifyAdded(position.primaryName);
        }
        this.setPosition(position);
        return position;
      } catch (error) {
        useGenericNotificationStore().notifyError(error.response.data.message);
        return error;
      } finally {
        this.finishLoading();
      }
    },
    async deletePosition(position) {
      this.startLoading();
      try {
        await positionApi.deletePosition(position.id);
        useGenericNotificationStore().notifyDeleted(position.primaryName);
        this.removePosition(position.id);
      } catch (error) {
        useGenericNotificationStore().notifyError(error.response.data.message);
      }
      this.finishLoading();
    },
    async reOrderPosition(data) {
      try {
        await positionApi.patchPosition(data);
        this.fetchPositions();
      } catch (error) {
        useGenericNotificationStore().notifyError(error.response.data.message);
      }
    },
  },
  getters: {
    positionsWithAdminPermissions: (state) => {
      const { adminStationsMap } = useStationStore();
      return filterByStationAdminPermissions(state.positions, adminStationsMap);
    },
    getPositionsByStationIds: (state) => (ids) => state.positions.filter((pos) => pos.stationIds.some((id) => ids.includes(id))),
    shiftviewStationPositions() {
      const shiftviewStationId = useStationStore().lineviewStation.id;
      const positions = this.getPositionsByStationIds([shiftviewStationId]);
      return positions.sort((a, b) => a.ordering[shiftviewStationId] - b.ordering[shiftviewStationId]);
    },
    positionsMap: (state) => listToKeyMap(state.positions, 'id'),
    positionsRealMap: (state) => new Map(state.positions.map((pos) => [pos.id, pos])),
    isLoading: (state) => !!state.loading.length,
  },
});

export default usePositionStore;
