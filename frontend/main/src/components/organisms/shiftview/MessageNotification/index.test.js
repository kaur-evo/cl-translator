import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import MessageNotification from './index.vue';

import shiftviewDialogs from '@/constants/dialogConfigs';
import { useGenericDialogStore } from '@/stores/index';

const createPinia = () => createTestingPinia({
  createSpy: vi.fn,
  initialState: {
    station: { lineviewStation: { id: 1, notificationEmails: ['test@test.com'] } },
  },
});

const defaultProps = {
  description: 'description',
};

describe('MessageNotification', () => {
  it('renders', () => {
    const wrapper = shallowMount(MessageNotification, {
      propsData: { ...defaultProps },
      global: { plugins: [createPinia()] },
    });
    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly', () => {
    const wrapper = shallowMount(MessageNotification, {
      propsData: { ...defaultProps },
      global: { plugins: [createPinia()] },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  test('that onOpenDialog calls openDialog store action and emits hide-notification', async () => {
    const pinia = createPinia();
    const genericDialogStore = useGenericDialogStore(pinia);

    const wrapper = shallowMount(MessageNotification, {
      propsData: { ...defaultProps },
      global: { plugins: [pinia] },
    });

    await wrapper.vm.onOpenDialog();

    expect(genericDialogStore.openDialog).toHaveBeenCalledWith(shiftviewDialogs.MESSAGES);
    expect(wrapper.emitted('hide-notification')).toBeTruthy();
  });

  describe('resetNotificationTimer', () => {
    it('sets notificationTimer', () => {
      const wrapper = shallowMount(MessageNotification, {
        propsData: { ...defaultProps },
        global: { plugins: [createPinia()] },
      });

      wrapper.vm.resetNotificationTimer();

      expect(wrapper.vm.notificationTimer).not.toBeNull();
    });

    test('that clearTimeout is not called when resetNotificationTimer is triggered only once', () => {
      const wrapper = shallowMount(MessageNotification, {
        propsData: { ...defaultProps },
        global: { plugins: [createPinia()] },
      });

      const clearTimeoutSpy = vi.spyOn(window, 'clearTimeout');

      wrapper.vm.resetNotificationTimer();

      expect(clearTimeoutSpy).toHaveBeenCalledTimes(0);

      clearTimeoutSpy.mockRestore();
    });

    test('that clearTimeout is called when resetNotificationTimer is triggered twice', () => {
      const wrapper = shallowMount(MessageNotification, {
        propsData: { ...defaultProps },
        global: { plugins: [createPinia()] },
      });

      const clearTimeoutSpy = vi.spyOn(window, 'clearTimeout');

      // First call
      wrapper.vm.resetNotificationTimer();

      // Second call
      wrapper.vm.resetNotificationTimer();

      expect(clearTimeoutSpy).toHaveBeenCalledTimes(1);

      clearTimeoutSpy.mockRestore();
    });

    test('that new timer is set every time resetNotificationTimer is triggered', () => {
      const wrapper = shallowMount(MessageNotification, {
        propsData: { ...defaultProps },
        global: { plugins: [createPinia()] },
      });

      const setTimeoutSpy = vi.spyOn(window, 'setTimeout');

      // Call the function multiple times
      wrapper.vm.resetNotificationTimer();
      const firstTimer = wrapper.vm.notificationTimer;
      wrapper.vm.resetNotificationTimer();
      const secondTimer = wrapper.vm.notificationTimer;

      expect(setTimeoutSpy).toHaveBeenCalledTimes(2);

      // Ensure that the first and second timers are different
      expect(firstTimer).not.toBe(secondTimer);

      setTimeoutSpy.mockRestore();
    });

    test('that hide-notification is not emitted when resetNotificationTimer was called 3 minutes ago', () => {
      vi.useFakeTimers();

      const wrapper = shallowMount(MessageNotification, {
        propsData: { ...defaultProps },
        global: { plugins: [createPinia()] },
      });

      wrapper.vm.resetNotificationTimer();

      // Fast-forward time by 3 minutes (180000ms)
      vi.advanceTimersByTime(180000);

      expect(wrapper.emitted('hide-notification')).toBeUndefined();

      vi.useRealTimers();
    });

    test('that hide-notification is emitted when resetNotificationTimer was called 5 minutes ago', () => {
      vi.useFakeTimers();

      const wrapper = shallowMount(MessageNotification, {
        propsData: { ...defaultProps },
        global: { plugins: [createPinia()] },
      });

      wrapper.vm.resetNotificationTimer();

      // Fast-forward time by 5 minutes (300000ms)
      vi.advanceTimersByTime(300000);

      expect(wrapper.emitted('hide-notification')).toBeTruthy();

      vi.useRealTimers();
    });

    test('that when resetNotificationTimer is called twice in less than 5 minutes, then hide-notification is emitted once', () => {
      vi.useFakeTimers();

      const wrapper = shallowMount(MessageNotification, {
        propsData: { ...defaultProps },
        global: { plugins: [createPinia()] },
      });

      wrapper.vm.resetNotificationTimer();

      // Fast-forward time by 4 minutes (240000ms)
      vi.advanceTimersByTime(240000);

      wrapper.vm.resetNotificationTimer();

      // Fast-forward time by 5 minutes (300000ms)
      vi.advanceTimersByTime(300000);

      expect(wrapper.emitted('hide-notification')).toBeTruthy();
      expect(wrapper.emitted('hide-notification')).toHaveLength(1);

      vi.useRealTimers();
    });

    test('that when resetNotificationTimer is called twice in more than 5 minutes, then hide-notification is emitted twice', () => {
      vi.useFakeTimers();

      const wrapper = shallowMount(MessageNotification, {
        propsData: { ...defaultProps },
        global: { plugins: [createPinia()] },
      });

      wrapper.vm.resetNotificationTimer();

      // Fast-forward time by 6 minutes (360000ms)
      vi.advanceTimersByTime(360000);

      wrapper.vm.resetNotificationTimer();

      // Fast-forward time by 5 minutes (300000ms)
      vi.advanceTimersByTime(300000);

      expect(wrapper.emitted('hide-notification')).toBeTruthy();
      expect(wrapper.emitted('hide-notification')).toHaveLength(2);

      vi.useRealTimers();
    });
  });
});
