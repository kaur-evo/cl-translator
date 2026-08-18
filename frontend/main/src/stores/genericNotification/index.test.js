import { setActivePinia, createPinia } from 'pinia';

import useGenericNotificationStore from './index';

vi.mock('@/stores/genericDialog', () => ({
  default: () => ({
    persistent: false,
    setDialogPersistence: vi.fn(),
  }),
}));

describe('useGenericNotificationStore', () => {
  let store;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useGenericNotificationStore();
  });

  test('initial state', () => {
    expect(store.isOpen).toBe(false);
    expect(store.text).toBeNull();
    expect(store.secondaryText).toBeNull();
    expect(store.timeout).toBe(-1);
    expect(store.type).toBe('');
    expect(store.onClose).toBeNull();
  });

  describe('actions', () => {
    test('openNotification sets options and opens', () => {
      const payload = {
        text: 'Notification text',
        timeout: 5000,
        type: 'success',
      };

      store.openNotification(payload);

      expect(store.isOpen).toBe(true);
      expect(store.text).toBe(payload.text);
      expect(store.type).toBe(payload.type);
      expect(store.timeout).toBe(payload.timeout);
    });

    test('closeNotification closes and calls onClose', async () => {
      const onCloseFn = vi.fn();
      store.isOpen = true;
      store.onClose = onCloseFn;

      await store.closeNotification();

      expect(store.isOpen).toBe(false);
      expect(onCloseFn).toHaveBeenCalledTimes(1);
    });

    test('notifySaved opens with success type', () => {
      store.notifySaved('{value} saved');
      expect(store.isOpen).toBe(true);
      expect(store.type).toBe('success');
    });

    test('notifyAdded opens with success type', () => {
      store.notifyAdded('{value} added');
      expect(store.isOpen).toBe(true);
      expect(store.type).toBe('success');
    });

    test('notifyUpdated opens with success type', () => {
      store.notifyUpdated('{value} updated');
      expect(store.isOpen).toBe(true);
      expect(store.type).toBe('success');
    });

    test('notifyDeleted opens with success type', () => {
      store.notifyDeleted('{value} deleted');
      expect(store.isOpen).toBe(true);
      expect(store.type).toBe('success');
    });

    test('notifyError opens with error type', () => {
      store.notifyError('An error occurred');
      expect(store.isOpen).toBe(true);
      expect(store.type).toBe('error');
    });

    test('notifyWarning opens with warning type and default timeout', () => {
      store.notifyWarning({ text: 'Warning message' });
      expect(store.isOpen).toBe(true);
      expect(store.type).toBe('warning');
      expect(store.timeout).toBe(5000);
    });

    test('notifyWarning with custom timeout', () => {
      store.notifyWarning({ text: 'Warning message', timeout: 3000 });
      expect(store.isOpen).toBe(true);
      expect(store.type).toBe('warning');
      expect(store.timeout).toBe(3000);
    });

    test('notifySuccess opens with success type', () => {
      store.notifySuccess('Success message');
      expect(store.isOpen).toBe(true);
      expect(store.type).toBe('success');
    });

    test('notifyInformation opens with default type', () => {
      store.notifyInformation('Information message');
      expect(store.isOpen).toBe(true);
      expect(store.type).toBe('');
    });
  });

  describe('getters', () => {
    test('isNotificationOpen', () => {
      expect(store.isNotificationOpen).toBe(false);
      store.isOpen = true;
      expect(store.isNotificationOpen).toBe(true);
    });

    test('notificationType', () => {
      store.type = 'success';
      expect(store.notificationType).toBe('success');
      store.type = 'error';
      expect(store.notificationType).toBe('error');
    });
  });
});
