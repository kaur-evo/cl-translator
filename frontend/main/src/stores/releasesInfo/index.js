import { defineStore } from 'pinia';

import userApi from '@/api/userApi';

const useReleasesInfoStore = defineStore('releasesInfo', {
  state: () => ({
    lastRelease: {},
  }),
  actions: {
    async fetchReleasesInfo() {
      this.lastRelease = await userApi.getReleasesInfo();
    },
    async putReleasesInfo(lastRelease) {
      const requestBody = {
        id: lastRelease.id,
        opened: !lastRelease.opened,
      };
      this.lastRelease = await userApi.putReleasesInfo(requestBody);
    },
  },
});

export default useReleasesInfoStore;
