import { defineStore } from 'pinia';

const useRouteModuleStore = defineStore('routeModule', {
  state: () => ({
    query: {},
  }),
  actions: {
    setQuery(query) {
      this.query = query;
    },
  },
});

export default useRouteModuleStore;
