import { setActivePinia, createPinia } from 'pinia';

import useShiftTemplateStore, { UNSAVED_KEY } from '.';

import shiftApi from '@/api/shiftApi';
import useGenericNotificationStore from '@/stores/genericNotification';
import useStationStore from '@/stores/station';
import useConfirmDialogStore from '@/stores/confirmDialog';

vi.mock('@/api/shiftApi');

vi.mock('@/services/i18n', () => ({
  default: { global: { t: (key, params) => (params ? key.replace('{value}', params.value) : key) } },
  __esModule: true,
}));

vi.mock('@/stores/genericNotification', () => ({
  default: vi.fn(),
  __esModule: true,
}));

vi.mock('@/stores/station', () => ({
  default: vi.fn(),
  __esModule: true,
}));

vi.mock('@/stores/confirmDialog', () => ({
  default: vi.fn(() => ({ openConfirmDialog: vi.fn() })),
  __esModule: true,
}));

describe('useShiftTemplateStore', () => {
  let store;
  const mockNotifyError = vi.fn();
  const mockNotifySuccess = vi.fn();
  const mockNotifyDeleted = vi.fn();
  const mockNotifyAdded = vi.fn();
  const mockNotifyUpdated = vi.fn();
  const mockOpenNotification = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    setActivePinia(createPinia());
    useGenericNotificationStore.mockReturnValue({
      notifyError: mockNotifyError,
      notifySuccess: mockNotifySuccess,
      notifyDeleted: mockNotifyDeleted,
      notifyAdded: mockNotifyAdded,
      notifyUpdated: mockNotifyUpdated,
      openNotification: mockOpenNotification,
    });
    useStationStore.mockReturnValue({
      stationsMap: { 1: { id: 1, timeZone: 'UTC' } },
      adminStationsMap: {},
    });
    store = useShiftTemplateStore();
  });

  describe('initial state', () => {
    test('has correct default values', () => {
      expect(store.shiftTemplates).toEqual([]);
      expect(store.loading).toEqual([]);
      expect(store.noShiftDeviations).toEqual({});
      expect(store.timeDeviations).toEqual({});
      expect(store.shiftTimelines).toEqual({});
      expect(store.shiftTimelinesLoading).toEqual({});
    });
  });

  describe('actions', () => {
    test('fetchShiftTemplates', async () => {
      const templates = [{ id: 1, name: 'Template 1' }];
      shiftApi.getShiftTemplates.mockResolvedValue(templates);
      await store.fetchShiftTemplates();
      expect(store.shiftTemplates).toEqual(templates);
      expect(store.loading).toEqual([]);
    });

    test('fetchShiftTemplates handles error', async () => {
      shiftApi.getShiftTemplates.mockRejectedValue({ response: { data: { message: 'Error' } } });
      await store.fetchShiftTemplates();
      expect(mockNotifyError).toHaveBeenCalledWith('Error');
      expect(store.loading).toEqual([]);
    });

    test('deleteShiftTemplate', async () => {
      store.shiftTemplates = [{ id: 1, name: 'Template 1' }];
      shiftApi.deleteShiftTemplate.mockResolvedValue();
      await store.deleteShiftTemplate({ id: 1, name: 'Template 1' });
      expect(shiftApi.deleteShiftTemplate).toHaveBeenCalledWith(1);
      expect(mockNotifyDeleted).toHaveBeenCalledWith('Template 1');
      expect(store.shiftTemplates).toEqual([]);
    });

    test('deleteShiftTemplate handles error', async () => {
      shiftApi.deleteShiftTemplate.mockRejectedValue({ response: { data: { message: 'Delete failed' } } });
      await store.deleteShiftTemplate({ id: 1, name: 'Template 1' });
      expect(mockNotifyError).toHaveBeenCalledWith('Delete failed');
    });

    test('fetchShiftTemplateNoShiftDeviations', async () => {
      const deviations = [{ id: 1 }];
      shiftApi.getShiftTemplateDeviationsByType.mockResolvedValue(deviations);
      const result = await store.fetchShiftTemplateNoShiftDeviations(5);
      expect(store.noShiftDeviations[5]).toEqual(deviations);
      expect(result).toEqual(deviations);
    });

    test('fetchShiftTemplateTimeDeviations', async () => {
      const deviations = [{ id: 1 }];
      shiftApi.getShiftTemplateDeviationsByType.mockResolvedValue(deviations);
      const result = await store.fetchShiftTemplateTimeDeviations(5);
      expect(store.timeDeviations[5]).toEqual(deviations);
      expect(result).toEqual(deviations);
    });

    test('saveShiftTemplateNoShiftDeviation creates new deviation', async () => {
      const deviation = { description: 'Holiday', shiftTemplateId: 1 };
      const savedDeviation = { ...deviation, id: 10 };
      shiftApi.postShiftTemplateDeviation.mockResolvedValue(savedDeviation);
      shiftApi.getShiftTemplateDeviationsByType.mockResolvedValue([savedDeviation]);
      const result = await store.saveShiftTemplateNoShiftDeviation(deviation);
      expect(result).toEqual(savedDeviation);
      expect(mockNotifyAdded).toHaveBeenCalledWith('Holiday');
    });

    test('saveShiftTemplateNoShiftDeviation updates existing deviation', async () => {
      const deviation = { id: 10, description: 'Holiday updated', shiftTemplateId: 1 };
      shiftApi.putShiftTemplateDeviation.mockResolvedValue(deviation);
      shiftApi.getShiftTemplateDeviationsByType.mockResolvedValue([deviation]);
      const result = await store.saveShiftTemplateNoShiftDeviation(deviation);
      expect(result).toEqual(deviation);
      expect(mockNotifyUpdated).toHaveBeenCalledWith('Holiday updated');
    });

    test('saveShiftTemplateNoShiftDeviation throws when no description', async () => {
      const result = await store.saveShiftTemplateNoShiftDeviation({ shiftTemplateId: 1 });
      expect(result).toBeInstanceOf(Error);
    });

    test('deleteShiftTemplateNoShiftDeviation', async () => {
      store.noShiftDeviations = { 1: [{ id: 10, shiftTemplateId: 1, description: 'Test' }] };
      shiftApi.deleteShiftTemplateDeviation.mockResolvedValue();
      await store.deleteShiftTemplateNoShiftDeviation({ id: 10, shiftTemplateId: 1, description: 'Test' });
      expect(mockNotifyDeleted).toHaveBeenCalledWith('Test');
    });

    test('saveShiftTemplateTimeDeviation', async () => {
      const data = { shiftTemplateId: 1, startTime: '08:00' };
      const result = { id: 5, ...data };
      shiftApi.postShiftTemplateDeviation.mockResolvedValue(result);
      await store.saveShiftTemplateTimeDeviation(data);
      expect(store.timeDeviations[1]).toEqual([result]);
      expect(mockNotifySuccess).toHaveBeenCalled();
    });

    test('deleteShiftTemplateTimeDeviation', async () => {
      store.timeDeviations = { 1: [{ id: 5, shiftTemplateId: 1 }] };
      shiftApi.deleteShiftTemplateDeviation.mockResolvedValue();
      await store.deleteShiftTemplateTimeDeviation({ id: 5, shiftTemplateId: 1 });
      expect(store.timeDeviations[1]).toEqual([]);
      expect(mockNotifyDeleted).toHaveBeenCalled();
    });

    test('handleDeviationError with SHIFT_TIMELINE_MODIFICATION_BLOCKED', () => {
      store.handleDeviationError({
        response: { data: { message: 'SHIFT_TIMELINE_MODIFICATION_BLOCKED' } },
      });
      expect(mockOpenNotification).toHaveBeenCalledWith(expect.objectContaining({
        type: 'error',
      }));
    });

    test('handleDeviationError with generic error', () => {
      store.handleDeviationError({
        response: { data: { message: 'Some error' } },
      });
      expect(mockNotifyError).toHaveBeenCalledWith('Some error');
    });

    test('storeShiftTemplateNoShiftDeviation', async () => {
      await store.storeShiftTemplateNoShiftDeviation({
        description: 'Test',
        shiftTemplateId: UNSAVED_KEY,
      });
      expect(store.noShiftDeviations[UNSAVED_KEY]).toHaveLength(1);
      expect(store.noShiftDeviations[UNSAVED_KEY][0][UNSAVED_KEY]).toBe(true);
    });

    test('storeShiftTemplateNoShiftDeviation throws when no description', async () => {
      await expect(store.storeShiftTemplateNoShiftDeviation({ shiftTemplateId: 1 })).rejects.toThrow('Name is required');
    });

    describe('saveShiftTemplate', () => {
      test('updates an existing template (has id)', async () => {
        const data = { id: 1, name: 'T1', enabled: true };
        shiftApi.putShiftTemplate.mockResolvedValue(data);
        const result = await store.saveShiftTemplate({ data });
        expect(shiftApi.putShiftTemplate).toHaveBeenCalledWith(data);
        expect(mockNotifySuccess).toHaveBeenCalled();
        expect(result).toEqual(data);
      });

      test('updates template with enabled=false uses correct notification text', async () => {
        const data = { id: 1, name: 'T1', enabled: false };
        shiftApi.putShiftTemplate.mockResolvedValue(data);
        await store.saveShiftTemplate({ data });
        expect(mockNotifySuccess).toHaveBeenCalledWith(expect.stringContaining('T1'));
      });

      test('creates a new template (no id) and processes unsaved deviations', async () => {
        const newTemplate = { id: 99, name: 'New', enabled: true };
        shiftApi.postShiftTemplate.mockResolvedValue(newTemplate);
        shiftApi.postShiftTemplateDeviation.mockResolvedValue({ id: 10, shiftTemplateId: 99, description: 'Dev', type: 'NO_SHIFT_DAY' });
        shiftApi.getShiftTemplateDeviationsByType.mockResolvedValue([]);
        store.noShiftDeviations = {
          [UNSAVED_KEY]: [{ id: 1, description: 'Dev', shiftTemplateId: UNSAVED_KEY, [UNSAVED_KEY]: true }],
        };
        const callback = vi.fn();
        const result = await store.saveShiftTemplate({ data: { name: 'New', enabled: true }, callback });
        expect(shiftApi.postShiftTemplate).toHaveBeenCalled();
        expect(callback).toHaveBeenCalledWith(newTemplate);
        expect(result).toEqual(newTemplate);
      });

      test('handles overlap error by opening confirm dialog', async () => {
        const mockOpenConfirmDialog = vi.fn();
        useConfirmDialogStore.mockReturnValue({ openConfirmDialog: mockOpenConfirmDialog });
        const overlapError = {
          response: {
            data: {
              overlaps: [{ stationId: 1, shiftName: 'Morning' }],
            },
          },
        };
        shiftApi.putShiftTemplate.mockRejectedValue(overlapError);
        const result = await store.saveShiftTemplate({ data: { id: 1, name: 'T1' } });
        expect(mockOpenConfirmDialog).toHaveBeenCalledWith(expect.objectContaining({ title: expect.any(String) }));
        expect(result).toEqual(overlapError);
      });

      test('confirm dialog action re-calls saveShiftTemplate with enabled=false', async () => {
        const mockOpenConfirmDialog = vi.fn();
        useConfirmDialogStore.mockReturnValue({ openConfirmDialog: mockOpenConfirmDialog });
        const overlapError = {
          response: { data: { overlaps: [{ stationId: 1, shiftName: 'Morning' }] } },
        };
        // First call raises overlap error; second call (from action callback) succeeds
        const savedTemplate = { id: 1, name: 'T1', enabled: false };
        shiftApi.putShiftTemplate
          .mockRejectedValueOnce(overlapError)
          .mockResolvedValueOnce(savedTemplate);
        await store.saveShiftTemplate({ data: { id: 1, name: 'T1' } });
        // Invoke the action callback passed to openConfirmDialog
        const { action } = mockOpenConfirmDialog.mock.calls[0][0];
        await action();
        expect(shiftApi.putShiftTemplate).toHaveBeenCalledTimes(2);
        expect(shiftApi.putShiftTemplate).toHaveBeenLastCalledWith(expect.objectContaining({ enabled: false }));
      });

      test('handles overlap error with long text uses wide dialog', async () => {
        const mockOpenConfirmDialog = vi.fn();
        useConfirmDialogStore.mockReturnValue({ openConfirmDialog: mockOpenConfirmDialog });
        const longOverlapText = Array(50).fill({ stationId: 1, shiftName: 'Morning Shift Long Name' });
        const overlapError = {
          response: {
            data: {
              overlaps: longOverlapText,
            },
          },
        };
        useStationStore.mockReturnValue({
          stationsMap: { 1: { id: 1, name: 'Station One', timeZone: 'UTC' } },
          adminStationsMap: {},
        });
        shiftApi.putShiftTemplate.mockRejectedValue(overlapError);
        await store.saveShiftTemplate({ data: { id: 1, name: 'T1' } });
        expect(mockOpenConfirmDialog).toHaveBeenCalledWith(expect.objectContaining({ width: 700 }));
      });

      test('handles generic error (no overlaps)', async () => {
        const error = { response: { data: { message: 'Save failed' } } };
        shiftApi.putShiftTemplate.mockRejectedValue(error);
        const result = await store.saveShiftTemplate({ data: { id: 1, name: 'T1' } });
        expect(mockNotifyError).toHaveBeenCalledWith('Save failed');
        expect(result).toEqual(error);
      });

      test('_editShiftTemplate adds template when not in list', async () => {
        const data = { id: 5, name: 'New T', enabled: true };
        shiftApi.putShiftTemplate.mockResolvedValue(data);
        await store.saveShiftTemplate({ data: { id: 5, name: 'New T' } });
        expect(store.shiftTemplates).toContainEqual(data);
      });

      test('_editShiftTemplate updates template when already in list', async () => {
        store.shiftTemplates = [{ id: 1, name: 'Old', enabled: false }];
        const updated = { id: 1, name: 'Updated', enabled: true };
        shiftApi.putShiftTemplate.mockResolvedValue(updated);
        await store.saveShiftTemplate({ data: { id: 1, name: 'Updated' } });
        expect(store.shiftTemplates[0]).toEqual(updated);
        expect(store.shiftTemplates).toHaveLength(1);
      });
    });

    describe('toggleShiftActivity', () => {
      test('happy path - enabled', async () => {
        const data = { id: 1, name: 'T1', enabled: true };
        shiftApi.putShiftTemplate.mockResolvedValue(data);
        const result = await store.toggleShiftActivity(data);
        expect(result).toEqual(data);
        expect(mockNotifySuccess).toHaveBeenCalledWith(expect.stringContaining('T1'));
      });

      test('happy path - disabled', async () => {
        const data = { id: 1, name: 'T1', enabled: false };
        shiftApi.putShiftTemplate.mockResolvedValue(data);
        const result = await store.toggleShiftActivity(data);
        expect(result).toEqual(data);
        expect(mockNotifySuccess).toHaveBeenCalled();
      });

      test('handles overlap error by opening warning notification', async () => {
        const overlapError = {
          response: {
            data: {
              overlaps: [{ stationId: 1, shiftName: 'Morning' }],
            },
          },
        };
        shiftApi.putShiftTemplate.mockRejectedValue(overlapError);
        const result = await store.toggleShiftActivity({ id: 1 });
        expect(mockOpenNotification).toHaveBeenCalledWith(expect.objectContaining({ type: 'warning' }));
        expect(result).toEqual(overlapError);
      });

      test('handles generic error (no overlaps)', async () => {
        const error = { response: { data: { message: 'Toggle failed' } } };
        shiftApi.putShiftTemplate.mockRejectedValue(error);
        const result = await store.toggleShiftActivity({ id: 1 });
        expect(mockNotifyError).toHaveBeenCalledWith('Toggle failed');
        expect(result).toEqual(error);
      });
    });

    test('fetchShiftTemplateNoShiftDeviations handles error', async () => {
      shiftApi.getShiftTemplateDeviationsByType.mockRejectedValue({ response: { data: { message: 'Fetch error' } } });
      const result = await store.fetchShiftTemplateNoShiftDeviations(5);
      expect(mockNotifyError).toHaveBeenCalledWith('Fetch error');
      expect(result).toBeNull();
    });

    test('fetchShiftTemplateTimeDeviations handles error', async () => {
      shiftApi.getShiftTemplateDeviationsByType.mockRejectedValue({ response: { data: { message: 'Time fetch error' } } });
      const result = await store.fetchShiftTemplateTimeDeviations(5);
      expect(mockNotifyError).toHaveBeenCalledWith('Time fetch error');
      expect(result).toBeNull();
    });

    test('saveShiftTemplateNoShiftDeviation hides notifications when hideNotifications=true on update', async () => {
      const deviation = { id: 10, description: 'Holiday', shiftTemplateId: 1, hideNotifications: true };
      shiftApi.putShiftTemplateDeviation.mockResolvedValue({ ...deviation, id: 10, shiftTemplateId: 1 });
      shiftApi.getShiftTemplateDeviationsByType.mockResolvedValue([deviation]);
      await store.saveShiftTemplateNoShiftDeviation(deviation);
      expect(mockNotifyUpdated).not.toHaveBeenCalled();
    });

    test('saveShiftTemplateNoShiftDeviation hides notifications when hideNotifications=true on create', async () => {
      const deviation = { description: 'Holiday', shiftTemplateId: 1, hideNotifications: true };
      const savedDeviation = { ...deviation, id: 11, shiftTemplateId: 1 };
      shiftApi.postShiftTemplateDeviation.mockResolvedValue(savedDeviation);
      shiftApi.getShiftTemplateDeviationsByType.mockResolvedValue([savedDeviation]);
      await store.saveShiftTemplateNoShiftDeviation(deviation);
      expect(mockNotifyAdded).not.toHaveBeenCalled();
    });

    test('deleteShiftTemplateNoShiftDeviation skips API call when deviation has UNSAVED_KEY', async () => {
      store.noShiftDeviations = {
        [UNSAVED_KEY]: [{ id: 99, shiftTemplateId: UNSAVED_KEY, description: 'Unsaved', [UNSAVED_KEY]: true }],
      };
      await store.deleteShiftTemplateNoShiftDeviation({
        id: 99,
        shiftTemplateId: UNSAVED_KEY,
        description: 'Unsaved',
        [UNSAVED_KEY]: true,
      });
      expect(shiftApi.deleteShiftTemplateDeviation).not.toHaveBeenCalled();
      expect(mockNotifyDeleted).toHaveBeenCalledWith('Unsaved');
    });

    test('deleteShiftTemplateNoShiftDeviation handles error', async () => {
      shiftApi.deleteShiftTemplateDeviation.mockRejectedValue({
        response: { data: { message: 'SHIFT_TIMELINE_MODIFICATION_BLOCKED' } },
      });
      await store.deleteShiftTemplateNoShiftDeviation({ id: 1, shiftTemplateId: 1, description: 'Dev' });
      expect(mockOpenNotification).toHaveBeenCalledWith(expect.objectContaining({ type: 'error' }));
    });

    test('saveShiftTemplateTimeDeviation updates existing deviation in list', async () => {
      const existing = { id: 5, shiftTemplateId: 1 };
      store.timeDeviations = { 1: [existing] };
      const updated = { id: 5, shiftTemplateId: 1, startTime: '09:00' };
      shiftApi.postShiftTemplateDeviation.mockResolvedValue(updated);
      await store.saveShiftTemplateTimeDeviation({ shiftTemplateId: 1, startTime: '09:00', id: 5 });
      expect(store.timeDeviations[1][0]).toEqual(updated);
      expect(store.timeDeviations[1]).toHaveLength(1);
    });

    test('saveShiftTemplateTimeDeviation handles error', async () => {
      const error = { response: { data: { message: 'Time deviation error' } } };
      shiftApi.postShiftTemplateDeviation.mockRejectedValue(error);
      const result = await store.saveShiftTemplateTimeDeviation({ shiftTemplateId: 1 });
      expect(mockNotifyError).toHaveBeenCalledWith('Time deviation error');
      expect(result).toEqual(error);
    });

    test('deleteShiftTemplateTimeDeviation when deviation id not found in list does nothing', async () => {
      store.timeDeviations = { 1: [{ id: 99, shiftTemplateId: 1 }] };
      shiftApi.deleteShiftTemplateDeviation.mockResolvedValue();
      await store.deleteShiftTemplateTimeDeviation({ id: 55, shiftTemplateId: 1 });
      expect(store.timeDeviations[1]).toEqual([{ id: 99, shiftTemplateId: 1 }]);
      expect(mockNotifyDeleted).toHaveBeenCalled();
    });

    test('deleteShiftTemplateTimeDeviation handles error', async () => {
      const error = { response: { data: { message: 'Delete time deviation error' } } };
      shiftApi.deleteShiftTemplateDeviation.mockRejectedValue(error);
      const result = await store.deleteShiftTemplateTimeDeviation({ id: 5, shiftTemplateId: 1 });
      expect(mockNotifyError).toHaveBeenCalledWith('Delete time deviation error');
      expect(result).toEqual(error);
    });

    describe('fetchShiftTemplateTimeline', () => {
      const dateRange = [new Date('2024-01-01'), new Date('2024-01-31')];

      test('happy path fetches and maps timeline data', async () => {
        const rawData = [{ id: 1 }];
        shiftApi.getShiftTimeline.mockResolvedValue(rawData);
        await store.fetchShiftTemplateTimeline({ dateRange, stationId: 1 });
        expect(shiftApi.getShiftTimeline).toHaveBeenCalledWith(1, expect.objectContaining({ startDate: '2024-01-01', endDate: '2024-01-31' }));
        expect(store.shiftTimelines[1]).toBeDefined();
        expect(store.shiftTimelinesLoading[1]).toBe(false);
      });

      test('uses UTC fallback when station has no timeZone', async () => {
        useStationStore.mockReturnValue({
          stationsMap: { 2: { id: 2 } },
          adminStationsMap: {},
        });
        shiftApi.getShiftTimeline.mockResolvedValue([]);
        await store.fetchShiftTemplateTimeline({ dateRange, stationId: 2 });
        expect(shiftApi.getShiftTimeline).toHaveBeenCalledWith(2, expect.any(Object));
        expect(store.shiftTimelinesLoading[2]).toBe(false);
      });

      test('throws and calls handleDeviationError when station not found', async () => {
        useStationStore.mockReturnValue({
          stationsMap: {},
          adminStationsMap: {},
        });
        await store.fetchShiftTemplateTimeline({ dateRange, stationId: 99 });
        expect(mockNotifyError).toHaveBeenCalled();
        expect(store.shiftTimelinesLoading[99]).toBe(false);
      });

      test('handles API error and resets loading', async () => {
        shiftApi.getShiftTimeline.mockRejectedValue({ response: { data: { message: 'Timeline error' } } });
        await store.fetchShiftTemplateTimeline({ dateRange, stationId: 1 });
        expect(mockNotifyError).toHaveBeenCalled();
        expect(store.shiftTimelinesLoading[1]).toBe(false);
      });
    });

    test('_setNoShiftDeviation updates deviation when id already exists', () => {
      const original = { id: 5, shiftTemplateId: 1, description: 'Old' };
      const updated = { id: 5, shiftTemplateId: 1, description: 'Updated' };
      store.noShiftDeviations = { 1: [original] };
      store._setNoShiftDeviation(1, updated);
      expect(store.noShiftDeviations[1]).toHaveLength(1);
      expect(store.noShiftDeviations[1][0].description).toBe('Updated');
    });
  });

  describe('getters', () => {
    test('isLoading', () => {
      expect(store.isLoading).toBe(false);
      store.loading.push('loading');
      expect(store.isLoading).toBe(true);
    });

    test('shiftTemplatesMap', () => {
      store.shiftTemplates = [{ id: 1, name: 'T1' }, { id: 2, name: 'T2' }];
      expect(store.shiftTemplatesMap).toEqual({
        1: { id: 1, name: 'T1' },
        2: { id: 2, name: 'T2' },
      });
    });

    test('currentNoShiftDeviations', () => {
      expect(store.currentNoShiftDeviations(1)).toEqual([]);
      store.noShiftDeviations = { 1: [{ id: 10 }] };
      expect(store.currentNoShiftDeviations(1)).toEqual([{ id: 10 }]);
    });

    test('unsavedNoShiftDeviations', () => {
      expect(store.unsavedNoShiftDeviations).toEqual([]);
      store.noShiftDeviations = {
        [UNSAVED_KEY]: [
          { id: 1, [UNSAVED_KEY]: true },
          { id: 2, [UNSAVED_KEY]: false },
        ],
      };
      expect(store.unsavedNoShiftDeviations).toHaveLength(1);
    });

    test('currentTimeDeviations', () => {
      expect(store.currentTimeDeviations(1)).toEqual([]);
      store.timeDeviations = { 1: [{ id: 10 }] };
      expect(store.currentTimeDeviations(1)).toEqual([{ id: 10 }]);
    });

    test('stationShiftTimeline', () => {
      expect(store.stationShiftTimeline(1)).toEqual([]);
      store.shiftTimelines = { 1: [{ id: 10 }] };
      expect(store.stationShiftTimeline(1)).toEqual([{ id: 10 }]);
    });

    test('stationShiftTimelineLoading', () => {
      expect(store.stationShiftTimelineLoading(1)).toBe(false);
      store.shiftTimelinesLoading = { 1: true };
      expect(store.stationShiftTimelineLoading(1)).toBe(true);
    });

    test('shiftTemplatesWithAdminPermissions filters by admin station permissions', () => {
      useStationStore.mockReturnValue({
        stationsMap: { 1: { id: 1, timeZone: 'UTC' } },
        adminStationsMap: { 1: { id: 1 } },
      });
      store = useShiftTemplateStore();
      store.shiftTemplates = [
        { id: 1, name: 'Global', stationIds: [] },
        { id: 2, name: 'Admin station', stationIds: [1] },
        { id: 3, name: 'No access', stationIds: [99] },
      ];
      const result = store.shiftTemplatesWithAdminPermissions;
      expect(result).toHaveLength(2);
      expect(result.map((t) => t.id)).toEqual([1, 2]);
    });
  });
});
