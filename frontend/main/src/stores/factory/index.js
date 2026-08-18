import { toRaw } from 'vue';
import { defineStore } from 'pinia';

import stationApi from '@/api/stationApi';
import { FACTORY_ADMIN } from '@/constants/userRoles';
import orderByName from '@/helpers/orderByName';
import useProfileStore from '@/stores/profile';
import useStationStore from '@/stores/station';

const useFactoryStore = defineStore('factory', {
  state: () => ({
    factories: [],
    loading: [],
    factoryPromise: null,
  }),
  actions: {
    async fetchFactories() {
      this.loading.push('loading');
      const factoryPromise = stationApi.getFactories();
      this.factoryPromise = factoryPromise;
      const factories = await factoryPromise || [];
      this.loading.pop();
      this.factories = factories;
    },
  },
  getters: {
    hasMultipleFactories: (state) => state.factories.length > 1,
    factoriesMap: (state) => state.factories.reduce((map, item) => ({ ...map, [item.id]: item }), {}),
    factoriesRealMap: (state) => new Map(state.factories.map((factory) => [factory.id, factory])),
    isLoading: (state) => state.loading.length > 0,
    orderedFactories: (state) => orderByName(state.factories).map((factory) => ({ ...factory, stations: orderByName(factory.stations).map((station) => toRaw(station)) })),
    factoriesWithTextOrdering: (state) => state.factories.map((factory) => ({
      ...factory, ordering: factory.name,
    })),
    factoriesWithWriteAccess() {
      const profileStore = useProfileStore();
      const { roles } = profileStore.currentUser;
      if (0 in roles) return this.factories;
      return this.factories.filter((factory) => roles[factory.id] === FACTORY_ADMIN);
    },
    hasMultipleAdminFactories() {
      return this.factoriesWithWriteAccess.length > 1;
    },
    orderedWriteAccessFactories() {
      return orderByName(this.factoriesWithWriteAccess).map((factory) => ({ ...factory, stations: orderByName(factory.stations) }));
    },
    getFactoryIdsByStationIds() {
      return (stationIds, includeNonAdmin = true) => {
        if (!stationIds) return [];
        const profileStore = useProfileStore();
        const stationStore = useStationStore();
        const { roles } = profileStore.currentUser;
        const idsSet = stationIds.reduce((result, stationId) => {
          const factoryId = stationStore.stationsRealMap.get(stationId)?.factoryId;
          if (!factoryId) return result;
          if (includeNonAdmin || 0 in roles || roles[factoryId] === FACTORY_ADMIN) result.add(factoryId);
          return result;
        }, new Set());
        return [...idsSet];
      };
    },
    getOrderedFactoryNamesArrayByStationIds() {
      return (stationIds, includeNonAdmin = true) => {
        if (!stationIds) return [];
        const factoryIds = this.getFactoryIdsByStationIds(stationIds, includeNonAdmin);
        const factoryNames = factoryIds.reduce((res, id) => {
          const factory = this.factoriesRealMap.get(id);
          if (factory) res.push(factory.name);
          return res;
        }, []);
        return [...factoryNames].sort((a, b) => a.localeCompare(b));
      };
    },
  },
});

export default useFactoryStore;
