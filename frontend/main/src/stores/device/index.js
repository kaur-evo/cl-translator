import { defineStore } from 'pinia';

import useRouteModuleStore from '@/stores/routeModule';

const FULLSCREEN_DIALOGS_THRESHOLD = 1360;
const MOBILE_BREAKPOINT = 600;
const XXL_BREAKPOINT_WIDTH = 1904;
const XXL_BREAKPOINT_HEIGHT = 1500;

const useDeviceStore = defineStore('device', {
  state: () => ({
    screen: {},
    isBrowserTabActive: true,
  }),
  actions: {
    setScreen(screen) {
      this.screen = screen;
    },
    setTabVisibility(value) {
      this.isBrowserTabActive = value;
    },
  },
  getters: {
    screenWidth: (state) => state.screen.width,
    screenHeight: (state) => state.screen.height,
    screenPxTotal: (state) => Number(state.screen.width) * Number(state.screen.height),
    showFullscreenDialogs: (state) => state.screen.width < FULLSCREEN_DIALOGS_THRESHOLD,
    isPortrait: (state) => state.screen.height > state.screen.width,
    isMobileLandscape() {
      return this.screen.height < MOBILE_BREAKPOINT && !this.isPortrait;
    },
    isMobilePortrait() {
      return this.screen.width < MOBILE_BREAKPOINT && this.isPortrait;
    },
    isXXLView: (state) => state.screen.width > XXL_BREAKPOINT_WIDTH && state.screen.height > XXL_BREAKPOINT_HEIGHT,
    isMobileView() {
      const routeModuleStore = useRouteModuleStore();
      const isMobileViewForced = routeModuleStore.query?.view?.match(/mobile\/?/);
      return this.isMobileLandscape || this.isMobilePortrait || !!isMobileViewForced;
    },
  },
});

export default useDeviceStore;
