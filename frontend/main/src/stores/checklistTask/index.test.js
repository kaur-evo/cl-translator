import { setActivePinia, createPinia } from 'pinia';

import useChecklistTaskStore from './index';

import checklistApi from '@/api/checklistApi';

vi.mock('@/api/checklistApi', () => ({
  default: {
    getChecklistTasks: vi.fn(),
    saveCheck: vi.fn(),
    saveManualCheck: vi.fn(),
    deleteChecklistPin: vi.fn(),
  },
  __esModule: true,
}));

vi.mock('@/stores/shift', () => ({
  default: () => ({
    currentShift: { id: 1 },
    shift: { id: 2 },
  }),
}));

const mockNotifySaved = vi.fn();
const mockNotifyDeleted = vi.fn();
const mockNotifyError = vi.fn();
vi.mock('@/stores/genericNotification', () => ({
  default: () => ({
    notifySaved: mockNotifySaved,
    notifyDeleted: mockNotifyDeleted,
    notifyError: mockNotifyError,
  }),
}));

describe('useChecklistTaskStore', () => {
  let store;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useChecklistTaskStore();
    vi.clearAllMocks();
  });

  test('initial state', () => {
    expect(store.checklistTasks).toEqual([]);
    expect(store.loading).toEqual([]);
    expect(store.runningShiftChecklists).toEqual([]);
  });

  describe('actions', () => {
    test('fetchChecklistTasks with different shift ids', async () => {
      const checklistTasks = [{ id: 1, name: 'Task 1' }];
      checklistApi.getChecklistTasks.mockResolvedValue(checklistTasks);
      await store.fetchChecklistTasks();
      expect(checklistApi.getChecklistTasks).toHaveBeenCalledWith(1);
      expect(checklistApi.getChecklistTasks).toHaveBeenCalledWith(2);
      expect(store.runningShiftChecklists).toEqual(checklistTasks);
      expect(store.checklistTasks).toEqual(checklistTasks);
      expect(store.isLoading).toBe(false);
    });

    test('saveCheck with success', async () => {
      const data = { name: 'Check 1' };
      checklistApi.saveCheck.mockResolvedValueOnce();
      await store.saveCheck(data);
      expect(checklistApi.saveCheck).toHaveBeenCalledWith(data);
      expect(mockNotifySaved).toHaveBeenCalledWith('Check 1');
      expect(store.isLoading).toBe(false);
    });

    test('saveCheck with error', async () => {
      const error = { response: { data: { message: 'Error message' } } };
      checklistApi.saveCheck.mockRejectedValueOnce(error);
      await store.saveCheck({ name: 'Check 1' });
      expect(mockNotifyError).toHaveBeenCalledWith('Error message');
    });

    test('deleteChecklistTask with success', async () => {
      store.checklistTasks = [{ id: 1, name: 'Task 1' }];
      checklistApi.deleteChecklistPin.mockResolvedValueOnce();
      await store.deleteChecklistTask({ id: 1, name: 'Task 1' });
      expect(checklistApi.deleteChecklistPin).toHaveBeenCalledWith('1');
      expect(mockNotifyDeleted).toHaveBeenCalledWith('Task 1');
      expect(store.checklistTasks).toEqual([]);
    });

    test('deleteChecklistTask with error', async () => {
      const error = { response: { data: { message: 'Error message' } } };
      checklistApi.deleteChecklistPin.mockRejectedValueOnce(error);
      await store.deleteChecklistTask({ id: 1, name: 'Task 1' });
      expect(mockNotifyError).toHaveBeenCalledWith('Error message');
    });

    test('saveManualCheck with success', async () => {
      const data = { checklistId: 1, name: 'Manual check' };
      checklistApi.saveManualCheck.mockResolvedValueOnce();
      await store.saveManualCheck(data);
      expect(checklistApi.saveManualCheck).toHaveBeenCalledWith(1, data);
      expect(mockNotifySaved).toHaveBeenCalledWith('Manual check');
    });

    test('saveManualCheck with error', async () => {
      const error = { response: { data: { message: 'Error message' } } };
      checklistApi.saveManualCheck.mockRejectedValueOnce(error);
      await store.saveManualCheck({ checklistId: 1, name: 'Manual check' });
      expect(mockNotifyError).toHaveBeenCalledWith('Error message');
    });
  });

  describe('getters', () => {
    test('isLoading', () => {
      expect(store.isLoading).toBe(false);
      store.loading.push('loading');
      expect(store.isLoading).toBe(true);
    });
  });
});
