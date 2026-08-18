import { setActivePinia, createPinia } from 'pinia';

import useGenericDialogStore from './index';

describe('useGenericDialogStore', () => {
  let store;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useGenericDialogStore();
  });

  test('initial state', () => {
    expect(store.isOpen).toBe(false);
    expect(store.title).toBe('');
    expect(store.text).toBe('');
    expect(store.width).toBe(700);
    expect(store.color).toBe('primary');
    expect(store.persistent).toBe(false);
    expect(store.allowFullscreen).toBe(true);
    expect(store.saveOnEnter).toBe(true);
  });

  describe('actions', () => {
    test('openDialog sets options and opens', () => {
      store.openDialog({
        title: 'Test Title',
        text: 'Test Text',
        width: 800,
        color: 'error',
      });

      expect(store.isOpen).toBe(true);
      expect(store.title).toBe('Test Title');
      expect(store.text).toBe('Test Text');
      expect(store.width).toBe(800);
      expect(store.color).toBe('error');
    });

    test('openDialog remembers previous state when already open', () => {
      store.openDialog({ title: 'First Dialog' });
      store.openDialog({ title: 'Second Dialog' });

      expect(store.title).toBe('Second Dialog');
      expect(store.previousState.title).toBe('First Dialog');
    });

    test('openPreviousDialog restores previous state', () => {
      store.openDialog({ title: 'First Dialog', data: { key: 'value' } });
      store.openDialog({ title: 'Second Dialog' });

      store.openPreviousDialog();

      expect(store.title).toBe('First Dialog');
      expect(store.dialogData).toEqual({ key: 'value' });
    });

    test('primaryAction calls callback and closes', () => {
      const onPrimaryAction = vi.fn();
      store.openDialog({ onPrimaryAction });

      store.primaryAction('payload');

      expect(onPrimaryAction).toHaveBeenCalledWith('payload');
      expect(store.isOpen).toBe(false);
    });

    test('secondaryAction calls callback and closes', () => {
      const onSecondaryAction = vi.fn();
      store.openDialog({ onSecondaryAction });

      store.secondaryAction('payload');

      expect(onSecondaryAction).toHaveBeenCalledWith('payload');
      expect(store.isOpen).toBe(false);
    });

    test('closeDialog closes and forgets previous', () => {
      store.openDialog({ title: 'Test' });
      store.closeDialog();

      expect(store.isOpen).toBe(false);
      expect(store.previousState).toEqual({});
    });

    test('setDialogPersistence sets persistent to true immediately', () => {
      store.setDialogPersistence(true);
      expect(store.persistent).toBe(true);
    });

    test('setDialogPersistence sets persistent to false with delay', () => {
      vi.useFakeTimers();
      store.persistent = true;
      store.setDialogPersistence(false);

      expect(store.persistent).toBe(true);
      vi.advanceTimersByTime(300);
      expect(store.persistent).toBe(false);
      vi.useRealTimers();
    });

    test('onClickOutsideAction calls callback and closes', () => {
      const onClickOutside = vi.fn();
      store.openDialog({ onClickOutside });

      store.onClickOutsideAction();

      expect(onClickOutside).toHaveBeenCalledTimes(1);
      expect(store.isOpen).toBe(false);
    });

    test('updateDialogData merges data', () => {
      store.openDialog({ data: { key1: 'value1' } });
      store.updateDialogData({ key2: 'value2' });

      expect(store.dialogData).toEqual({ key1: 'value1', key2: 'value2' });
    });

    test('setOptions handles saveOnEnter default and explicit', () => {
      store.setOptions({});
      expect(store.saveOnEnter).toBe(true);

      store.setOptions({ saveOnEnter: false });
      expect(store.saveOnEnter).toBe(false);
    });

    test('setAllowFullscreen updates value', () => {
      store.setAllowFullscreen(false);
      expect(store.allowFullscreen).toBe(false);
    });
  });

  describe('getters', () => {
    test('isDialogOpened', () => {
      expect(store.isDialogOpened).toBe(false);
      store.isOpen = true;
      expect(store.isDialogOpened).toBe(true);
    });

    test('openedDialogComponent', () => {
      expect(store.openedDialogComponent).toBeNull();
      store.component = 'TestComponent';
      expect(store.openedDialogComponent).toBe('TestComponent');
    });
  });
});
