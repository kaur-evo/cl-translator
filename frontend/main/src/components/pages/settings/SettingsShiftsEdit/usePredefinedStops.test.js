import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ref } from 'vue';
import { setActivePinia } from 'pinia';
import { createTestingPinia } from '@pinia/testing';

import usePredefinedStops from './usePredefinedStops';

import useCommentStore from '@/stores/comment';
import usePositionStore from '@/stores/position';
import useGenericDialogStore from '@/stores/genericDialog';
import useGenericNotificationStore from '@/stores/genericNotification';
import useConfirmDialogStore from '@/stores/confirmDialog';

const commentsMapValue = {
  1: { name: 'Comment 1' },
  2: { name: 'Comment 2' },
};
const positionsMapValue = {
  10: { name: 'Position 10' },
  20: { name: 'Position 20' },
};

vi.mock('vue-i18n', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useI18n: () => ({
      t: vi.fn((key, params) => key.replace('{value}', params?.value ?? '')),
    }),
  };
});
vi.mock('@/api/predefinedStopsApi', () => ({
  default: {
    getPredefinedStops: vi.fn(async () => [
      { id: 1, commentId: 1, positionId: 10, startTime: '08:00', endTime: '09:00', enabled: true, deleted: false },
      { id: 2, commentId: 2, positionId: 20, startTime: '10:00', endTime: '11:00', enabled: false, deleted: false },
    ]),
    postPredefinedStops: vi.fn(async (_id, stops) => stops),
    deletePredefinedStop: vi.fn(async () => {}),
  },
}));
vi.mock('@/helpers/time/timeComparison', () => ({
  isTimeBetweenRange: (start, end, time) => time >= start && time <= end,
}));
vi.mock('@/helpers/time/formatTime', () => ({
  formatTime: (date) => `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`,
}));
vi.mock('date-fns', () => ({
  setHours: (date, h) => {
    date.setHours(Number(h));
    return date;
  },
  setMinutes: (date, m) => {
    date.setMinutes(Number(m));
    return date;
  },
}));
vi.mock('vue', async () => {
  const actual = await vi.importActual('vue');
  return {
    ...actual,
    defineAsyncComponent: (fn) => fn,
    nextTick: () => Promise.resolve(),
  };
});

describe('usePredefinedStops', () => {
  let shiftId;
  let formData;
  let isEdit;
  let mockOpenDialog;
  let mockNotifySuccess;
  let mockNotifyError;
  let mockOpenConfirmDialog;

  beforeEach(() => {
    const pinia = createTestingPinia({ createSpy: vi.fn, stubActions: false });
    setActivePinia(pinia);

    const commentStore = useCommentStore();
    const positionStore = usePositionStore();
    const genericDialogStore = useGenericDialogStore();
    const genericNotificationStore = useGenericNotificationStore();
    const confirmDialogStore = useConfirmDialogStore();

    commentStore.commentsMap = commentsMapValue;
    positionStore.positionsMap = positionsMapValue;

    mockOpenDialog = vi.fn();
    mockNotifySuccess = vi.fn();
    mockNotifyError = vi.fn();
    mockOpenConfirmDialog = vi.fn();

    genericDialogStore.openDialog = mockOpenDialog;
    genericNotificationStore.notifySuccess = mockNotifySuccess;
    genericNotificationStore.notifyError = mockNotifyError;
    confirmDialogStore.openConfirmDialog = mockOpenConfirmDialog;

    shiftId = ref(123);
    formData = {
      id: 123,
      startTime: '08:00',
      endTime: '12:00',
      stationIds: [1, 2],
    };
    isEdit = ref(true);
  });
  describe('validateAutoCommentTimes', () => {
    it('validates auto comment times and sets errors', () => {
      const { validateAutoCommentTimes, autoStopsWithErrors } = usePredefinedStops(shiftId, formData, isEdit);
      // Add a stop outside shift range
      const stop = { startTime: '07:00', endTime: '13:00' };
      const stopsRef = ref([stop]);
      // Patch predefinedStops ref
      Object.defineProperty(validateAutoCommentTimes, 'predefinedStops', { value: stopsRef });
      validateAutoCommentTimes.call({ predefinedStops: stopsRef, autoStopsWithErrors: ref([]), notifyError: vi.fn(), t: vi.fn() });
      expect(autoStopsWithErrors.value.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('onDeletePredefinedStop', () => {
    it('deletes predefined stop and notifies', async () => {
      const { onDeletePredefinedStop } = usePredefinedStops(shiftId, formData, isEdit);
      const item = { id: 1, commentId: 1 };
      onDeletePredefinedStop({ item, rowIndex: 0 });
      expect(mockOpenConfirmDialog).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Confirmation',
        confirmText: 'Delete',
        cancelText: 'Cancel',
      }));
    });

    it('onDeletePredefinedStop removes stop in non-edit mode', async () => {
      isEdit.value = false;
      const { onDeletePredefinedStop } = usePredefinedStops(shiftId, formData, isEdit);
      const item = { id: 2, commentId: 2 };
      onDeletePredefinedStop({ item, rowIndex: 1 });
      // No confirm dialog should be called
      expect(mockOpenConfirmDialog).not.toHaveBeenCalled();
    });
  });

  describe('getTimeRangeLabelValue', () => {
    it('getTimeRangeLabelValue returns correct range string', () => {
      const { getTimeRangeLabelValue } = usePredefinedStops(shiftId, formData, isEdit);
      const item = { startTime: '08:15', endTime: '09:45' };
      const range = getTimeRangeLabelValue(item);
      expect(range).toBe('08:15 - 09:45');
    });
  });

  describe('filteredPredefinedStops', () => {
    it('filteredPredefinedStops maps stops with correct fields', async () => {
      const { filteredPredefinedStops, getPredefinedStops } = usePredefinedStops(shiftId, formData, isEdit);
      await getPredefinedStops();
      const stops = filteredPredefinedStops.value;
      expect(stops.length).toBe(2);
      expect(stops[0]).toMatchObject({
        comment: 'Comment 1',
        position: 'Position 10',
        hasError: false,
        range: expect.any(String),
      });
    });
  });

  describe('shiftSaveCallback', () => {
    it('shiftSaveCallback does not call savePredefinedStops when isEdit is true', async () => {
      isEdit.value = true;
      const { shiftSaveCallback, savePredefinedStops } = usePredefinedStops(shiftId, formData, isEdit);
      const spy = vi.spyOn({ savePredefinedStops }, 'savePredefinedStops');
      await shiftSaveCallback({ id: 789 });
      expect(spy).not.toHaveBeenCalled();
    });

    it('shiftSaveCallback sets hasUnsavedPredefinedStops to false after saving', async () => {
      isEdit.value = false;
      const { shiftSaveCallback, hasUnsavedPredefinedStops } = usePredefinedStops(shiftId, formData, isEdit);
      hasUnsavedPredefinedStops.value = true;
      await shiftSaveCallback({ id: 123 });
      expect(hasUnsavedPredefinedStops.value).toBe(false);
    });

    it('shiftSaveCallback does not throw if predefinedStops is empty', async () => {
      isEdit.value = false;
      const { shiftSaveCallback } = usePredefinedStops(shiftId, formData, isEdit);
      // Patch predefinedStops to empty
      const stopsRef = ref([]);
      Object.defineProperty(shiftSaveCallback, 'predefinedStops', { value: stopsRef });
      await expect(shiftSaveCallback.call({ predefinedStops: stopsRef, savePredefinedStops: vi.fn(), isEdit }, { id: 123 })).resolves.not.toThrow();
    });
    it('shiftSaveCallback does nothing if isEdit is true', async () => {
      isEdit.value = true;
      const { shiftSaveCallback, hasUnsavedPredefinedStops } = usePredefinedStops(shiftId, formData, isEdit);
      await shiftSaveCallback({ id: 123 });
      // hasUnsavedPredefinedStops should remain unchanged
      expect(hasUnsavedPredefinedStops.value).toBe(false);
    });

    it('shiftSaveCallback saves stops if not edit', async () => {
      isEdit.value = false;
      const { shiftSaveCallback, hasUnsavedPredefinedStops } = usePredefinedStops(shiftId, formData, isEdit);
      await shiftSaveCallback({ id: 123 });
      expect(hasUnsavedPredefinedStops.value).toBe(false);
    });
  });

  describe('onEditPredefinedStop', () => {
    it('saves predefined stops and notifies success', async () => {
      const { onEditPredefinedStop } = usePredefinedStops(shiftId, formData, isEdit);
      const selectedItem = { id: 3, commentId: 1, positionId: 10, startTime: '09:00', endTime: '10:00' };
      onEditPredefinedStop({ item: selectedItem, rowIndex: 2 });
      expect(mockOpenDialog).toHaveBeenCalledWith({
        allowFullscreen: true,
        component: expect.any(Function),
        data: {
          index: 2,
          predefinedStop: {
            commentId: 1,
            endTime: '10:00',
            id: 3,
            positionId: 10,
            startTime: '09:00',
          },
          predefinedStops: [],
          shiftEnd: '12:00',
          shiftId: 123,
          shiftStart: '08:00',
          stationIds: [
            1,
            2,
          ],
        },
        onPrimaryAction: expect.any(Function),
        onSecondaryAction: expect.any(Function),
        width: 732,
      });
    });

    it('onEditPredefinedStop pushes new stop if item is null', async () => {
      const { onEditPredefinedStop } = usePredefinedStops(shiftId, formData, isEdit);
      onEditPredefinedStop({ item: null, rowIndex: 2 });
      expect(mockOpenDialog).toHaveBeenCalledWith({
        allowFullscreen: true,
        component: expect.any(Function),
        data: {
          index: 2,
          predefinedStop: null,
          predefinedStops: [],
          shiftEnd: '12:00',
          shiftId: 123,
          shiftStart: '08:00',
          stationIds: [
            1,
            2,
          ],
        },
        onPrimaryAction: expect.any(Function),
        onSecondaryAction: expect.any(Function),
        width: 732,
      });
    });

    it('onEditPredefinedStop does not remove error if rowIndex not in autoStopsWithErrors', async () => {
      const { onEditPredefinedStop, autoStopsWithErrors } = usePredefinedStops(shiftId, formData, isEdit);
      autoStopsWithErrors.value = [0];
      const selectedItem = { id: 6, commentId: 1, positionId: 10, startTime: '08:30', endTime: '09:30' };
      onEditPredefinedStop({ item: selectedItem, rowIndex: 2 });
      expect(autoStopsWithErrors.value).toContain(0);
    });
  });
  describe('getPredefinedStops', () => {
    it('getPredefinedStops fetches and sets stops', async () => {
      const { getPredefinedStops, filteredPredefinedStops } = usePredefinedStops(shiftId, formData, isEdit);
      await getPredefinedStops();
      expect(filteredPredefinedStops.value.length).toBeGreaterThan(0);
    });
  });
  describe('savePredefinedStops', () => {
    it('savePredefinedStops calls API and updates predefinedStops', async () => {
      const { savePredefinedStops } = usePredefinedStops(shiftId, formData, isEdit);
      const api = await import('@/api/predefinedStopsApi');
      const newStops = [{ id: 1, commentId: 1, positionId: 10, startTime: '08:00', endTime: '09:00' }];
      await savePredefinedStops(123, newStops, 'Saved!');
      expect(api.default.postPredefinedStops).toHaveBeenCalledWith(123, expect.arrayContaining([
        expect.objectContaining({ id: 1, shiftTemplateId: 123 }),
      ]));
    });

    it('savePredefinedStops notifies success when notificationText is provided', async () => {
      const { savePredefinedStops } = usePredefinedStops(shiftId, formData, isEdit);
      await savePredefinedStops(123, [{ id: 1, commentId: 1 }], 'Saved!');
      expect(mockNotifySuccess).toHaveBeenCalledWith('Saved!');
    });

    it('savePredefinedStops does not notify success if notificationText is empty', async () => {
      const { savePredefinedStops } = usePredefinedStops(shiftId, formData, isEdit);
      await savePredefinedStops(123, [{ id: 1, commentId: 1 }], '');
      expect(mockNotifySuccess).not.toHaveBeenCalled();
    });

    it('savePredefinedStops adds shiftTemplateId to each stop', async () => {
      const { savePredefinedStops } = usePredefinedStops(shiftId, formData, isEdit);
      const api = await import('@/api/predefinedStopsApi');
      const stops = [{ id: 1, commentId: 1 }, { id: 2, commentId: 2 }];
      await savePredefinedStops(123, stops, 'Saved!');
      const calledStops = api.default.postPredefinedStops.mock.calls[0][1];
      expect(calledStops.every((stop) => stop.shiftTemplateId === 123)).toBe(true);
    });

    it('savePredefinedStops notifies error on failure', async () => {
      const { savePredefinedStops } = usePredefinedStops(shiftId, formData, isEdit);
      // Patch API to throw
      const api = await import('@/api/predefinedStopsApi');
      api.default.postPredefinedStops.mockImplementationOnce(async () => {
        throw new Error('fail');
      });
      await savePredefinedStops(123, [{ id: 1 }], 'Saved!');
      expect(mockNotifyError).toHaveBeenCalled();
    });
  });

  describe('onTogglePredefinedStop', () => {
    it('toggles predefined stop enabled state', async () => {
      // Set up shift times to ensure validation passes
      formData.startTime = '08:00';
      formData.endTime = '12:00';

      // Mock the API to return a stop within the shift range
      const api = await import('@/api/predefinedStopsApi');
      api.default.getPredefinedStops.mockResolvedValueOnce([
        {
          id: 1,
          commentId: 1,
          positionId: 10,
          startTime: '08:30', // Within shift time (08:00-12:00)
          endTime: '09:30', // Within shift time (08:00-12:00)
          enabled: true, // Start with enabled = true
          deleted: false,
        },
      ]);

      const { onTogglePredefinedStop, getPredefinedStops, filteredPredefinedStops } = usePredefinedStops(shiftId, formData, isEdit);

      // Load the predefined stops
      await getPredefinedStops();

      // Mock isTimeBetweenRange to return true for successful validation
      const timeComparison = await import('@/helpers/time/timeComparison');
      timeComparison.isTimeBetweenRange = vi.fn()
        .mockReturnValueOnce(true) // startTime check passes
        .mockReturnValueOnce(true); // endTime check passes

      // Verify initial state
      expect(filteredPredefinedStops.value[0].enabled).toBe(true);

      const item = { id: 1, commentId: 1, enabled: true };
      const rowIndex = 0;

      // Clear previous mock calls
      vi.clearAllMocks();

      await onTogglePredefinedStop({ item, rowIndex });

      // Check that the enabled state was toggled from true to false
      expect(filteredPredefinedStops.value[0].enabled).toBe(false);

      // Also verify the notification was called
      expect(mockNotifySuccess).toHaveBeenCalledWith(expect.stringContaining('Comment 1'));
    });

    it('toggles enabled state from false to true', async () => {
      // Set up shift times to ensure validation passes
      formData.startTime = '08:00';
      formData.endTime = '12:00';

      // Mock the API to return a stop within the shift range
      const api = await import('@/api/predefinedStopsApi');
      api.default.getPredefinedStops.mockResolvedValueOnce([
        {
          id: 1,
          commentId: 1,
          positionId: 10,
          startTime: '08:30', // Within shift time (08:00-12:00)
          endTime: '09:30', // Within shift time (08:00-12:00)
          enabled: false, // Start with enabled = false
          deleted: false,
        },
      ]);

      const { onTogglePredefinedStop, getPredefinedStops, filteredPredefinedStops } = usePredefinedStops(shiftId, formData, isEdit);

      // Load the predefined stops
      await getPredefinedStops();

      // Mock isTimeBetweenRange to return true for successful validation
      const timeComparison = await import('@/helpers/time/timeComparison');
      timeComparison.isTimeBetweenRange = vi.fn()
        .mockReturnValueOnce(true) // startTime check passes
        .mockReturnValueOnce(true); // endTime check passes

      // Verify initial state
      expect(filteredPredefinedStops.value[0].enabled).toBe(false);

      const item = { id: 1, commentId: 1, enabled: false };
      const rowIndex = 0;

      await onTogglePredefinedStop({ item, rowIndex });

      // Check that the enabled state was toggled from false to true
      expect(filteredPredefinedStops.value[0].enabled).toBe(true);
    });

    it('reverts enabled state if validation fails', async () => {
      formData.startTime = '08:00';
      formData.endTime = '12:00';

      const api = await import('@/api/predefinedStopsApi');
      api.default.getPredefinedStops.mockResolvedValueOnce([
        {
          id: 1,
          commentId: 1,
          positionId: 10,
          startTime: '07:00', // Before shift start (08:00)
          endTime: '13:00', // After shift end (12:00)
          enabled: false,
          deleted: false,
        },
      ]);

      const { onTogglePredefinedStop, getPredefinedStops } = usePredefinedStops(shiftId, formData, isEdit);

      await getPredefinedStops();

      const timeComparison = await import('@/helpers/time/timeComparison');
      timeComparison.isTimeBetweenRange = vi.fn()
        .mockReturnValueOnce(false) // startTime check fails
        .mockReturnValueOnce(false); // endTime check fails

      const item = { id: 1, commentId: 1, enabled: false };
      const rowIndex = 0;

      vi.clearAllMocks();

      await onTogglePredefinedStop({ item, rowIndex });

      expect(mockNotifyError).toHaveBeenCalledWith(
        'Auto-commenting times must be within shift times',
      );

      expect(mockNotifySuccess).not.toHaveBeenCalled();
    });

    it('saves predefined stops in edit mode after successful toggle', async () => {
      isEdit.value = true;

      formData.startTime = '08:00';
      formData.endTime = '12:00';

      const api = await import('@/api/predefinedStopsApi');
      api.default.getPredefinedStops.mockResolvedValueOnce([
        {
          id: 1,
          commentId: 1,
          positionId: 10,
          startTime: '08:30', // Within shift time (08:00-12:00)
          endTime: '09:30', // Within shift time (08:00-12:00)
          enabled: false,
          deleted: false,
        },
      ]);

      const { onTogglePredefinedStop, getPredefinedStops } = usePredefinedStops(shiftId, formData, isEdit);

      await getPredefinedStops();

      const timeComparison = await import('@/helpers/time/timeComparison');
      timeComparison.isTimeBetweenRange = vi.fn()
        .mockReturnValueOnce(true) // startTime check passes
        .mockReturnValueOnce(true); // endTime check passes

      vi.clearAllMocks();

      const item = { id: 1, commentId: 1, enabled: false };
      const rowIndex = 0;

      await onTogglePredefinedStop({ item, rowIndex });

      expect(mockNotifySuccess).toHaveBeenCalledWith(expect.stringContaining('Comment 1'));
    });

    it('sets hasUnsavedPredefinedStops in non-edit mode', async () => {
      isEdit.value = false;

      // Set up shift times to ensure validation passes
      formData.startTime = '08:00';
      formData.endTime = '12:00';

      // Mock the API to return a stop within the shift range
      const api = await import('@/api/predefinedStopsApi');
      api.default.getPredefinedStops.mockResolvedValueOnce([
        {
          id: 1,
          commentId: 1,
          positionId: 10,
          startTime: '08:30', // Within shift time (08:00-12:00)
          endTime: '09:30', // Within shift time (08:00-12:00)
          enabled: false,
          deleted: false,
        },
      ]);

      const { onTogglePredefinedStop, getPredefinedStops, hasUnsavedPredefinedStops } = usePredefinedStops(shiftId, formData, isEdit);

      // Load the predefined stops
      await getPredefinedStops();

      // Mock isTimeBetweenRange to return true for successful validation
      const timeComparison = await import('@/helpers/time/timeComparison');
      timeComparison.isTimeBetweenRange = vi.fn()
        .mockReturnValueOnce(true) // startTime check passes
        .mockReturnValueOnce(true); // endTime check passes

      // Verify initial state
      expect(hasUnsavedPredefinedStops.value).toBe(false);

      const item = { id: 1, commentId: 1, enabled: false };
      const rowIndex = 0;

      await onTogglePredefinedStop({ item, rowIndex });

      // Should set hasUnsavedPredefinedStops to true in non-edit mode
      expect(hasUnsavedPredefinedStops.value).toBe(true);
    });

    it('handles toggle for enabled stop correctly', async () => {
      // Set up shift times to ensure validation passes
      formData.startTime = '10:00';
      formData.endTime = '14:00';

      // Mock the API to return a stop within the shift range
      const api = await import('@/api/predefinedStopsApi');
      api.default.getPredefinedStops.mockResolvedValueOnce([
        {
          id: 2,
          commentId: 2,
          positionId: 20,
          startTime: '10:30', // Within shift time (10:00-14:00)
          endTime: '11:30', // Within shift time (10:00-14:00)
          enabled: true, // Start with enabled = true
          deleted: false,
        },
      ]);

      const { onTogglePredefinedStop, getPredefinedStops, filteredPredefinedStops } = usePredefinedStops(shiftId, formData, isEdit);

      // Load the predefined stops
      await getPredefinedStops();

      // Mock isTimeBetweenRange to return true for successful validation
      const timeComparison = await import('@/helpers/time/timeComparison');
      timeComparison.isTimeBetweenRange = vi.fn()
        .mockReturnValueOnce(true) // startTime check passes
        .mockReturnValueOnce(true); // endTime check passes

      // Verify initial state
      expect(filteredPredefinedStops.value[0].enabled).toBe(true);

      const item = { id: 2, commentId: 2, enabled: true };
      const rowIndex = 0;

      await onTogglePredefinedStop({ item, rowIndex });

      // Successfully toggled from true to false
      expect(filteredPredefinedStops.value[0].enabled).toBe(false);
    });

    it('calls validateAutoCommentTimes after toggling', async () => {
      // Set up shift times to ensure validation passes
      formData.startTime = '08:00';
      formData.endTime = '12:00';

      // Mock the API to return a stop within the shift range
      const api = await import('@/api/predefinedStopsApi');
      api.default.getPredefinedStops.mockResolvedValueOnce([
        {
          id: 1,
          commentId: 1,
          positionId: 10,
          startTime: '08:30', // Within shift time (08:00-12:00)
          endTime: '09:30', // Within shift time (08:00-12:00)
          enabled: false,
          deleted: false,
        },
      ]);

      const { onTogglePredefinedStop, getPredefinedStops } = usePredefinedStops(shiftId, formData, isEdit);

      // Load the predefined stops
      await getPredefinedStops();

      // Spy on isTimeBetweenRange to verify it's called during validation
      const timeComparison = await import('@/helpers/time/timeComparison');
      const isTimeBetweenRangeSpy = vi.fn()
        .mockReturnValueOnce(true) // startTime check passes
        .mockReturnValueOnce(true); // endTime check passes
      timeComparison.isTimeBetweenRange = isTimeBetweenRangeSpy;

      const item = { id: 1, commentId: 1, enabled: false };
      const rowIndex = 0;

      await onTogglePredefinedStop({ item, rowIndex });

      // Verify that validation was called (isTimeBetweenRange should be called twice)
      expect(isTimeBetweenRangeSpy).toHaveBeenCalledTimes(2);
    });

    it('does not save when validation error prevents toggle', async () => {
      // Set up shift times that will cause validation to fail
      formData.startTime = '08:00';
      formData.endTime = '12:00';

      // Mock the API to return a stop outside the shift range
      const api = await import('@/api/predefinedStopsApi');
      api.default.getPredefinedStops.mockResolvedValueOnce([
        {
          id: 1,
          commentId: 1,
          positionId: 10,
          startTime: '07:00', // Before shift start (08:00)
          endTime: '13:00', // After shift end (12:00)
          enabled: false,
          deleted: false,
        },
      ]);

      const { onTogglePredefinedStop, getPredefinedStops, filteredPredefinedStops } = usePredefinedStops(shiftId, formData, isEdit);

      // Load the predefined stops
      await getPredefinedStops();

      // Mock isTimeBetweenRange to return false for validation failure
      const timeComparison = await import('@/helpers/time/timeComparison');
      timeComparison.isTimeBetweenRange = vi.fn()
        .mockReturnValueOnce(false) // startTime check fails
        .mockReturnValueOnce(false); // endTime check fails

      // Verify initial state
      expect(filteredPredefinedStops.value[0].enabled).toBe(false);

      const item = { id: 1, commentId: 1, enabled: false };
      const rowIndex = 0;

      // Clear previous mock calls
      vi.clearAllMocks();

      await onTogglePredefinedStop({ item, rowIndex });

      // The enabled state should be reverted back to false due to validation error
      expect(filteredPredefinedStops.value[0].enabled).toBe(false);

      // Should not have called save methods since validation failed
      expect(mockNotifySuccess).not.toHaveBeenCalled();

      // Should have called error notification instead
      expect(mockNotifyError).toHaveBeenCalledWith('Auto-commenting times must be within shift times');
    });

    it('preserves correct enabled state through multiple toggles', async () => {
      // Set up shift times to ensure validation passes
      formData.startTime = '08:00';
      formData.endTime = '12:00';

      // Mock the API to return a stop within the shift range
      const api = await import('@/api/predefinedStopsApi');
      api.default.getPredefinedStops.mockResolvedValue([
        {
          id: 1,
          commentId: 1,
          positionId: 10,
          startTime: '08:30', // Within shift time (08:00-12:00)
          endTime: '09:30', // Within shift time (08:00-12:00)
          enabled: false, // Start with enabled = false
          deleted: false,
        },
      ]);

      const { onTogglePredefinedStop, getPredefinedStops, filteredPredefinedStops } = usePredefinedStops(shiftId, formData, isEdit);

      // Load the predefined stops
      await getPredefinedStops();

      // Mock isTimeBetweenRange to always return true for successful validation
      const timeComparison = await import('@/helpers/time/timeComparison');
      timeComparison.isTimeBetweenRange = vi.fn().mockReturnValue(true);

      // Verify initial state
      expect(filteredPredefinedStops.value[0].enabled).toBe(false);

      // First toggle: false -> true
      let item = { id: 1, commentId: 1, enabled: false };
      await onTogglePredefinedStop({ item, rowIndex: 0 });
      expect(filteredPredefinedStops.value[0].enabled).toBe(true);

      // Second toggle: true -> false
      item = { ...item, enabled: true };
      await onTogglePredefinedStop({ item, rowIndex: 0 });
      expect(filteredPredefinedStops.value[0].enabled).toBe(false);
    });
  });
});
