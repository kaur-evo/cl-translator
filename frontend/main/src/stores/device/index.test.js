import { setActivePinia, createPinia } from 'pinia';

import useDeviceStore from './index';

import useRouteModuleStore from '@/stores/routeModule';

describe('useDeviceStore', () => {
  let store;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useDeviceStore();
    store.screen = { width: 1360, height: 768 };
  });

  test('initial state', () => {
    const freshStore = useDeviceStore();
    expect(freshStore.isBrowserTabActive).toBe(true);
  });

  describe('setScreen', () => {
    test('updates screen state', () => {
      store.setScreen({ width: 1920, height: 1080 });
      expect(store.screen).toEqual({ width: 1920, height: 1080 });
    });
  });

  describe('setTabVisibility', () => {
    test('updates isBrowserTabActive', () => {
      store.setTabVisibility(false);
      expect(store.isBrowserTabActive).toBe(false);
    });
  });

  describe('getters', () => {
    test('screenPxTotal returns width * height', () => {
      expect(store.screenPxTotal).toBe(1044480);
    });

    test('showFullscreenDialogs returns true when width < 1360', () => {
      store.screen = { width: 1359, height: 768 };
      expect(store.showFullscreenDialogs).toBe(true);
    });

    test('showFullscreenDialogs returns false when width >= 1360', () => {
      expect(store.showFullscreenDialogs).toBe(false);
    });

    test('isPortrait returns true when height > width', () => {
      store.screen = { width: 768, height: 1024 };
      expect(store.isPortrait).toBe(true);
    });

    test('isMobileLandscape returns true when height < 600 and not portrait', () => {
      store.screen = { width: 800, height: 400 };
      expect(store.isMobileLandscape).toBe(true);
    });

    test('isMobilePortrait returns true when width < 600 and portrait', () => {
      store.screen = { width: 400, height: 800 };
      expect(store.isMobilePortrait).toBe(true);
    });

    test('isXXLView returns true when width > 1904 and height > 1500', () => {
      store.screen = { width: 1920, height: 1600 };
      expect(store.isXXLView).toBe(true);
    });

    test('isXXLView returns false for standard resolution', () => {
      expect(store.isXXLView).toBe(false);
    });

    test('screenWidth returns screen width', () => {
      expect(store.screenWidth).toBe(1360);
    });

    test('screenHeight returns screen height', () => {
      expect(store.screenHeight).toBe(768);
    });

    test('isMobileView returns false for desktop screen without forced mobile', () => {
      store.screen = { width: 1360, height: 768 };
      expect(store.isMobileView).toBe(false);
    });

    test('isMobileView returns true when route query forces mobile view', () => {
      store.screen = { width: 1360, height: 768 };
      const routeStore = useRouteModuleStore();
      routeStore.setQuery({ view: 'mobile' });
      expect(store.isMobileView).toBe(true);
    });

    test('isMobileView returns true for portrait mobile screen', () => {
      store.screen = { width: 400, height: 800 };
      expect(store.isMobileView).toBe(true);
    });
  });
});
