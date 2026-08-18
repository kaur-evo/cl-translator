import { setActivePinia, createPinia } from 'pinia';

import useShiftNotificationStore from './index';

const mockShiftviewStationUserRole = vi.fn();
vi.mock('@/stores/profile', () => ({
  default: () => ({
    get shiftviewStationUserRole() {
      return mockShiftviewStationUserRole();
    },
  }),
}));

describe('useShiftNotificationStore', () => {
  let store;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useShiftNotificationStore();
    vi.clearAllMocks();
  });

  test('initial state', () => {
    expect(store.shiftNotificationVisible).toBe(false);
    expect(store.timer).toBeUndefined();
  });

  describe('showShiftNotification', () => {
    test('sets shiftNotificationVisible to true', () => {
      store.showShiftNotification();
      expect(store.shiftNotificationVisible).toBe(true);
    });
  });

  describe('hideShiftNotification', () => {
    test('sets shiftNotificationVisible to false', () => {
      store.shiftNotificationVisible = true;
      store.hideShiftNotification();
      expect(store.shiftNotificationVisible).toBe(false);
    });
  });

  describe('resetShiftNotificationTimer', () => {
    afterEach(() => {
      vi.useRealTimers();
    });

    test('with LINEVIEW_USER role', async () => {
      vi.useFakeTimers();
      vi.spyOn(window, 'setTimeout');
      vi.spyOn(window, 'clearTimeout');
      mockShiftviewStationUserRole.mockReturnValue('LINEVIEW_USER');
      await store.resetShiftNotificationTimer();
      expect(clearTimeout).toHaveBeenCalledTimes(1);
      expect(setTimeout).toHaveBeenCalledTimes(1);
      expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), expect.any(Number));
      vi.advanceTimersByTime(1200000 + 300000 + 60);
      expect(store.shiftNotificationVisible).toBe(true);
    });

    test('with COMPANY_ADMIN role', async () => {
      vi.useFakeTimers();
      vi.spyOn(window, 'setTimeout');
      vi.spyOn(window, 'clearTimeout');
      mockShiftviewStationUserRole.mockReturnValue('COMPANY_ADMIN');
      await store.resetShiftNotificationTimer();
      expect(clearTimeout).toHaveBeenCalledTimes(1);
      expect(setTimeout).toHaveBeenCalledTimes(1);
      expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), expect.any(Number));
      vi.advanceTimersByTime(1800000 + 300000 + 60);
      expect(store.shiftNotificationVisible).toBe(true);
    });
  });

  describe('cancelShiftNotificationTimer', () => {
    test('hides notification and clears timer', () => {
      vi.spyOn(window, 'clearTimeout');
      store.timer = window.setTimeout(vi.fn, 1000);
      store.shiftNotificationVisible = true;
      store.cancelShiftNotificationTimer();
      expect(store.shiftNotificationVisible).toBe(false);
      expect(clearTimeout).toHaveBeenCalledWith(store.timer);
    });
  });
});
