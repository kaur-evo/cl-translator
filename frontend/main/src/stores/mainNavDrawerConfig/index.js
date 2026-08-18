import { defineStore } from 'pinia';

const OPEN_DELAY = 300;
const CLOSE_DELAY = 600;

const useMainNavDrawerConfigStore = defineStore('mainNavDrawerConfig', {
  state: () => ({
    drawerOpen: false,
    timeout: null,
  }),
  actions: {
    clearPendingTimeout() {
      clearTimeout(this.timeout);
      this.timeout = null;
    },
    setMainNavDrawer(shouldOpen) {
      this.clearPendingTimeout();
      this.drawerOpen = shouldOpen;
    },
    setMainNavDrawerWithDelay(shouldOpen) {
      this.clearPendingTimeout();
      const delay = shouldOpen ? OPEN_DELAY : CLOSE_DELAY;
      this.timeout = setTimeout(() => {
        this.drawerOpen = shouldOpen;
      }, delay);
    },
  },
});

export default useMainNavDrawerConfigStore;
