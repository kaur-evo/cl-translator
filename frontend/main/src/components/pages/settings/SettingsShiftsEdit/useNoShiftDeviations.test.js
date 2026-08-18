
import { ref } from 'vue';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia } from 'pinia';
import { createTestingPinia } from '@pinia/testing';

import useNoShiftDeviations from './useNoShiftDeviations';

import useConfirmDialogStore from '@/stores/confirmDialog';
import useGenericDialogStore from '@/stores/genericDialog';
import useGenericNotificationStore from '@/stores/genericNotification';
import useShiftTemplateStore, { UNSAVED_KEY } from '@/stores/shiftTemplate';

vi.mock('vue-i18n', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useI18n: () => ({
      t: (str, ctx) => {
        if (ctx && ctx.value) return str.replace('{value}', ctx.value);
        return str;
      },
    }),
  };
});

describe('useNoShiftDeviations', () => {
  let confirmDialogStore;
  let genericDialogStore;
  let genericNotificationStore;
  let shiftTemplateStore;

  beforeEach(() => {
    const pinia = createTestingPinia({ createSpy: vi.fn, stubActions: false });
    setActivePinia(pinia);

    confirmDialogStore = useConfirmDialogStore();
    genericDialogStore = useGenericDialogStore();
    genericNotificationStore = useGenericNotificationStore();
    shiftTemplateStore = useShiftTemplateStore();

    confirmDialogStore.openConfirmDialog = vi.fn();
    genericDialogStore.openDialog = vi.fn();
    genericNotificationStore.notifyDeleted = vi.fn();
    shiftTemplateStore.currentNoShiftDeviations = vi.fn((id) => [`dev-${id}`]);
    shiftTemplateStore.fetchShiftTemplateNoShiftDeviations = vi.fn(() => Promise.resolve());
    shiftTemplateStore.saveShiftTemplateNoShiftDeviation = vi.fn(() => Promise.resolve());
    shiftTemplateStore.storeShiftTemplateNoShiftDeviation = vi.fn(() => Promise.resolve());
    shiftTemplateStore.deleteShiftTemplateNoShiftDeviation = vi.fn(() => Promise.resolve());
  });

  it('loadNoShiftDeviations dispatches fetch even when isEdit=false (current implementation behavior)', async () => {
    const shiftTemplateId = ref('ABC');
    const isEdit = ref(false);
    const { loadNoShiftDeviations } = useNoShiftDeviations(shiftTemplateId, isEdit);
    await loadNoShiftDeviations();
    expect(shiftTemplateStore.fetchShiftTemplateNoShiftDeviations).toHaveBeenCalledWith(UNSAVED_KEY);
  });

  it('loadNoShiftDeviations dispatches fetch with real id when isEdit=true', async () => {
    const shiftTemplateId = ref('REAL-ID');
    const isEdit = ref(true);
    const { loadNoShiftDeviations } = useNoShiftDeviations(shiftTemplateId, isEdit);
    await loadNoShiftDeviations();
    expect(shiftTemplateStore.fetchShiftTemplateNoShiftDeviations).toHaveBeenCalledWith('REAL-ID');
  });

  it('openEditNoShiftDialog (edit mode) saves deviation and runs callback', async () => {
    const shiftTemplateId = ref('X');
    const isEdit = ref(true);
    const { openEditNoShiftDialog } = useNoShiftDeviations(shiftTemplateId, isEdit);
    const cb = vi.fn();
    const inputDeviation = { id: 1, description: 'A' };
    await openEditNoShiftDialog(inputDeviation, cb);
    expect(genericDialogStore.openDialog).toHaveBeenCalled();
    const dialogConfig = genericDialogStore.openDialog.mock.calls[0][0];
    expect(dialogConfig.data).toEqual(inputDeviation);
    expect(typeof dialogConfig.component).toBe('object');
    const deviationNew = { id: 1, description: 'B' };
    await dialogConfig.onPrimaryAction(deviationNew);
    expect(shiftTemplateStore.saveShiftTemplateNoShiftDeviation).toHaveBeenCalledWith(
      { ...deviationNew },
    );
    expect(cb).toHaveBeenCalled();
  });

  it('openEditNoShiftDialog (create mode) stores deviation (UNSAVED)', async () => {
    const shiftTemplateId = ref('X');
    const isEdit = ref(false);
    const { openEditNoShiftDialog } = useNoShiftDeviations(shiftTemplateId, isEdit);
    const inputDeviation = { id: null, description: 'New' };
    await openEditNoShiftDialog(inputDeviation);
    const dialogConfig = genericDialogStore.openDialog.mock.calls[0][0];
    await dialogConfig.onPrimaryAction({ id: null, description: 'New2' });
    expect(shiftTemplateStore.storeShiftTemplateNoShiftDeviation).toHaveBeenCalledWith(
      { id: null, description: 'New2' },
    );
  });

  it('openDeleteNoShiftConfirmation dispatches confirm dialog and its action deletes', async () => {
    const shiftTemplateId = ref('X');
    const isEdit = ref(true);
    const { openDeleteNoShiftConfirmation } = useNoShiftDeviations(shiftTemplateId, isEdit);
    const deviation = { id: 9, description: 'Old Dev' };
    await openDeleteNoShiftConfirmation(deviation);
    expect(confirmDialogStore.openConfirmDialog).toHaveBeenCalled();
    const config = confirmDialogStore.openConfirmDialog.mock.calls[0][0];
    expect(config.title).toBe('Confirmation');
    expect(config.text).toBe('Are you sure you want to delete Old Dev?');
    expect(typeof config.action).toBe('function');
    await config.action();
    expect(shiftTemplateStore.deleteShiftTemplateNoShiftDeviation).toHaveBeenCalledWith(deviation);
  });

  describe('openQuickApplyNoShiftDialog', () => {
    it('dispatches confirm dialog and its action saves deviation and notifies', async () => {
      const shiftTemplateId = ref('X');
      const isEdit = ref(true);
      const { openQuickApplyNoShiftDialog } = useNoShiftDeviations(shiftTemplateId, isEdit);

      const payload = { id: 1, startTime: '2023-01-01T00:00:00Z', endTime: '2023-01-01T23:59:59Z' };
      const callback = vi.fn();
      const zoneId = 'UTC';
      const shiftName = 'Test Shift';

      await openQuickApplyNoShiftDialog({ payload, callback, zoneId, shiftName });

      expect(confirmDialogStore.openConfirmDialog).toHaveBeenCalled();
      const config = confirmDialogStore.openConfirmDialog.mock.calls[0][0];
      expect(config.title).toBe('Confirmation');
      expect(config.text).toBe('Are you sure you want to delete Test Shift?');
      expect(typeof config.action).toBe('function');

      await config.action();

      const expectedDeviation = {
        ...payload,
        startTime: expect.any(String),
        endTime: expect.any(String),
        hideNotifications: true,
      };

      expect(shiftTemplateStore.saveShiftTemplateNoShiftDeviation).toHaveBeenCalledWith(
        expectedDeviation,
      );
      expect(genericNotificationStore.notifyDeleted).toHaveBeenCalledWith(shiftName);
      expect(callback).toHaveBeenCalled();
    });

    it('does not call callback if not provided', async () => {
      const shiftTemplateId = ref('X');
      const isEdit = ref(true);
      const { openQuickApplyNoShiftDialog } = useNoShiftDeviations(shiftTemplateId, isEdit);

      const payload = { id: 1, startTime: '2023-01-01T00:00:00Z', endTime: '2023-01-01T23:59:59Z' };
      const zoneId = 'UTC';
      const shiftName = 'Test Shift';

      await openQuickApplyNoShiftDialog({ payload, zoneId, shiftName });

      const config = confirmDialogStore.openConfirmDialog.mock.calls[0][0];
      await config.action();

      expect(genericNotificationStore.notifyDeleted).toHaveBeenCalledWith(shiftName);
    });
  });
});
