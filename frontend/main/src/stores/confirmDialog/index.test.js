import { setActivePinia, createPinia } from 'pinia';

import useConfirmDialogStore from './index';

describe('useConfirmDialogStore', () => {
  let store;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useConfirmDialogStore();
  });

  test('initial state', () => {
    expect(store.isOpen).toBe(false);
    expect(store.confirmed).toBe(false);
    expect(store.loading).toBe(false);
    expect(store.color).toBe('error');
    expect(store.secondaryButtonType).toBe('secondary');
  });

  describe('openConfirmDialog', () => {
    test('sets options and opens dialog', () => {
      store.openConfirmDialog({
        title: 'Confirmation',
        text: 'Are you sure?',
        color: 'primary',
      });
      expect(store.isOpen).toBe(true);
      expect(store.title).toBe('Confirmation');
      expect(store.text).toBe('Are you sure?');
      expect(store.color).toBe('primary');
      expect(store.confirmed).toBe(false);
    });

    test('returns a Promise', () => {
      const result = store.openConfirmDialog({ title: 'Test' });
      expect(result).toBeInstanceOf(Promise);
      // Prevent unhandled rejection by rejecting the dialog
      store.isOpen = false;
      return result.catch(() => {});
    });
  });

  describe('confirmDialogAction', () => {
    test('calls action and sets confirmed true with response on success', async () => {
      const response = { success: true };
      store.action = vi.fn().mockResolvedValue(response);
      store.isOpen = true;
      await store.confirmDialogAction();
      expect(store.action).toHaveBeenCalledTimes(1);
      expect(store.confirmed).toBe(true);
      expect(store.response).toEqual(response);
      expect(store.isOpen).toBe(false);
      expect(store.loading).toBe(false);
    });

    test('sets confirmed false on action error', async () => {
      const error = new Error('failed');
      store.action = vi.fn().mockRejectedValue(error);
      store.isOpen = true;
      await store.confirmDialogAction();
      expect(store.confirmed).toBe(false);
      expect(store.response).toBe(error);
      expect(store.loading).toBe(false);
    });

    test('does nothing when action is null', async () => {
      store.action = null;
      await store.confirmDialogAction();
      expect(store.confirmed).toBe(false);
    });
  });

  describe('closeConfirmDialog', () => {
    test('closes the dialog', async () => {
      store.isOpen = true;
      await store.closeConfirmDialog();
      expect(store.isOpen).toBe(false);
    });

    test('calls closeAction before closing', async () => {
      const closeAction = vi.fn().mockResolvedValue(undefined);
      store.closeAction = closeAction;
      store.isOpen = true;
      await store.closeConfirmDialog();
      expect(closeAction).toHaveBeenCalledTimes(1);
      expect(store.isOpen).toBe(false);
    });
  });
});
