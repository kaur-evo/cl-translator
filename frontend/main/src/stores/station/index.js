import { defineStore } from 'pinia';

import stationApi from '@/api/stationApi';
import listToKeyMap from '@/helpers/list/listToKeyMap';
import getGroupsWithAdminPermissions from '@/helpers/permissions/getGroupsWithAdminPermissions';
import useGenericNotificationStore from '@/stores/genericNotification';
import useProfileStore from '@/stores/profile';
import useFactoryStore from '@/stores/factory';
import useShiftStore from '@/stores/shift';

const useStationStore = defineStore('station', {
  state: () => ({
    stations: [],
    loading: [],
    stationGroups: [],
    lineviewStation: {},
  }),
  actions: {
    async fetchStations(force = false) {
      if (this.stations.length === 0 || force) {
        this.loading.push('loading');
        try {
          const stations = await stationApi.getStationList();
          this.stations = stations;
        } catch (error) {
          const genericNotificationStore = useGenericNotificationStore();
          genericNotificationStore.notifyError(error.response.data.message);
        } finally {
          this.loading.pop();
        }
      }
    },
    async saveStationGroup(data) {
      try {
        this.loading.push('loading');
        const genericNotificationStore = useGenericNotificationStore();
        let stationGroup;
        if (data.id) {
          stationGroup = await stationApi.putStationGroup(data);
          genericNotificationStore.notifyUpdated(stationGroup.name);
        } else {
          stationGroup = await stationApi.postStationGroup(data);
          genericNotificationStore.notifyAdded(stationGroup.name);
        }
        const index = this.stationGroups.findIndex((el) => el.id === stationGroup.id);
        if (index > -1) {
          this.stationGroups[index] = stationGroup;
        } else {
          this.stationGroups.push(stationGroup);
        }
        return stationGroup;
      } catch (error) {
        const genericNotificationStore = useGenericNotificationStore();
        genericNotificationStore.notifyError(error.response.data.message);
        return error;
      } finally {
        this.loading.pop();
      }
    },
    async fetchStationGroups() {
      this.loading.push('loading');
      try {
        const groups = await stationApi.getStationGroupList();
        this.stationGroups = groups;
      } catch (error) {
        const genericNotificationStore = useGenericNotificationStore();
        genericNotificationStore.notifyError(error.response.data.message);
      } finally {
        this.loading.pop();
      }
    },
    async deleteStationGroup(group) {
      try {
        this.loading.push('loading');
        await stationApi.deleteStationGroup(group.id);
        const genericNotificationStore = useGenericNotificationStore();
        genericNotificationStore.notifyDeleted(group.name);
        const index = this.stationGroups.findIndex((el) => el.id === group.id);
        if (index > -1) {
          this.stationGroups.splice(index, 1);
        }
      } catch (error) {
        const genericNotificationStore = useGenericNotificationStore();
        genericNotificationStore.notifyError(error.response.data.message);
      } finally {
        this.loading.pop();
      }
    },
    async saveStation(data) {
      this.loading.push('loading');
      try {
        const station = await stationApi.putStation(data);
        const index = this.stations.findIndex((el) => el.id === station.id);
        if (index > -1) {
          this.stations[index] = station;
        } else {
          this.stations.push(station);
        }
        const genericNotificationStore = useGenericNotificationStore();
        genericNotificationStore.notifyUpdated(station.name);
        return station;
      } catch (error) {
        const genericNotificationStore = useGenericNotificationStore();
        genericNotificationStore.notifyError(error.response.data.message);
        return error;
      } finally {
        this.loading.pop();
      }
    },
    setLineviewStation(station) {
      this.lineviewStation = station;
      const shiftStore = useShiftStore();
      shiftStore.setFirstShiftOfStation(station);
    },
  },
  getters: {
    stationsWithAdminPermissions() {
      const profileStore = useProfileStore();
      const roles = profileStore.currentRoles;
      if (0 in roles) return this.stations;
      return this.stations.filter((station) => roles[station.factoryId]?.toLowerCase().includes('admin'));
    },
    stationsMap: (state) => listToKeyMap(state.stations, 'id'),
    adminStationsMap() {
      return listToKeyMap(this.stationsWithAdminPermissions, 'id');
    },
    isLoading: (state) => !!state.loading.length,
    stationsRealMap: (state) => new Map(state.stations.map((station) => [station.id, station])),
    getDefaultStation() {
      return (id = 0) => {
        const profileStore = useProfileStore();
        let result;
        if (id === 0) {
          const { defaultStationId } = profileStore.currentUser;
          if (defaultStationId === 0) {
            return this.stationsRealMap.values().next().value;
          }
          result = this.stationsRealMap.get(defaultStationId);
        } else {
          result = this.stationsRealMap.get(id);
        }

        if (result === undefined) {
          return this.stationsRealMap.values().next().value;
        }
        return result;
      };
    },
    stationGroupsWithAdminPermissions() {
      const profileStore = useProfileStore();
      const roles = profileStore.currentRoles;
      return getGroupsWithAdminPermissions(this.stationGroups, roles);
    },
    stationGroupsWithAdminPermissionsMap() {
      return listToKeyMap(this.stationGroupsWithAdminPermissions, 'id');
    },
    stationGroupsMap: (state) => listToKeyMap(state.stationGroups, 'id'),
    stationGroupsRealMap: (state) => new Map(state.stationGroups.map((group) => [group.id, group])),
    getOrderedStationNamesArray() {
      return (ids, includeNonAdmin = true) => {
        const profileStore = useProfileStore();
        const { roles } = profileStore.currentUser;
        const namesSet = ids.reduce((res, id) => {
          const station = this.stationsRealMap.get(id);
          if (!station) return res;
          const stationAllowed = includeNonAdmin || 0 in roles || roles[station.factoryId]?.toLowerCase().includes('admin');
          if (station && stationAllowed) res.add(station.name);
          return res;
        }, new Set());
        return [...namesSet].sort((a, b) => a.localeCompare(b));
      };
    },
    getStationDifference() {
      return (initialGroup, currentGroup, stationIds) => {
        if (!currentGroup?.local) return [];
        const factoryStore = useFactoryStore();
        const initialFactories = initialGroup?.local ? initialGroup.factoryIds : factoryStore.factories.map((f) => f.id);
        const removedFactories = initialFactories.filter((id) => !currentGroup.factoryIds.includes(id));
        const result = [];
        removedFactories.forEach((id) => {
          const factoryStations = factoryStore.factoriesMap[id].stations;
          factoryStations.forEach((station) => {
            if (stationIds.includes(station.id)) result.push(station.id);
          });
        });
        return result;
      };
    },
    getZoneIdByStationIds() {
      return (stationIds) => {
        if (!stationIds || stationIds.length === 0) return 'UTC';
        const stationId = stationIds[0];
        return this.stationsMap[stationId] ? this.stationsMap[stationId].zoneId : 'UTC';
      };
    },
    getSelectedFactoryAllowedStations() {
      return (factoryIds = [], stationIds = [], key = null) => {
        if (!factoryIds.length) return [];
        return this.stationsWithAdminPermissions.reduce((acc, station) => {
          const allStationsSelected = () => stationIds.length === 0;
          const isFactorySelected = () => factoryIds.includes(station.factoryId);
          const isStationSelected = () => stationIds.includes(station.id);
          const matchesStation = () => allStationsSelected() || isStationSelected();
          if (isFactorySelected() && matchesStation()) {
            acc.push(key ? station[key] : station);
          }
          return acc;
        }, []);
      };
    },
  },
});

export default useStationStore;
