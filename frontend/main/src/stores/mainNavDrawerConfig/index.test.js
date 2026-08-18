import { setActivePinia, createPinia } from 'pinia';

import useMainNavDrawerConfigStore from './index';

const OPEN_DELAY = 300;
const CLOSE_DELAY = 600;

describe('useMainNavDrawerConfigStore', () => {
  let store;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useMainNavDrawerConfigStore();
  });

  test('initial state', () => {
    expect(store.drawerOpen).toBe(false);
    expect(store.timeout).toBe(null);
  });

  describe('setMainNavDrawer', () => {
    test('updates drawerOpen synchronously without scheduling a timeout', () => {
      store.setMainNavDrawer(true);
      expect(store.drawerOpen).toBe(true);
      expect(store.timeout).toBe(null);
    });

    test('clears any pending delayed timeout', () => {
      vi.useFakeTimers();
      store.setMainNavDrawerWithDelay(true);
      expect(store.timeout).not.toBeNull();

      store.setMainNavDrawer(false);
      expect(store.drawerOpen).toBe(false);
      expect(store.timeout).toBe(null);

      vi.runAllTimers();
      expect(store.drawerOpen).toBe(false);
      vi.useRealTimers();
    });
  });

  describe('setMainNavDrawerWithDelay', () => {
    test('delays opening by OPEN_DELAY', () => {
      vi.useFakeTimers();
      store.setMainNavDrawerWithDelay(true);
      expect(store.drawerOpen).toBe(false);
      expect(store.timeout).not.toBeNull();

      vi.advanceTimersByTime(OPEN_DELAY - 1);
      expect(store.drawerOpen).toBe(false);

      vi.advanceTimersByTime(1);
      expect(store.drawerOpen).toBe(true);
      vi.useRealTimers();
    });

    test('delays closing by CLOSE_DELAY', () => {
      vi.useFakeTimers();
      store.drawerOpen = true;
      store.setMainNavDrawerWithDelay(false);
      expect(store.drawerOpen).toBe(true);

      vi.advanceTimersByTime(CLOSE_DELAY - 1);
      expect(store.drawerOpen).toBe(true);

      vi.advanceTimersByTime(1);
      expect(store.drawerOpen).toBe(false);
      vi.useRealTimers();
    });
  });
});
