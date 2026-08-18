import { setActivePinia, createPinia } from 'pinia';

import useChecklistTemplateStore from './index';

import checklistApi from '@/api/checklistApi';

vi.mock('@/api/checklistApi', () => ({
  default: {
    getChecklists: vi.fn(),
    putChecklist: vi.fn(),
    deleteChecklistTemplate: vi.fn(),
    getChecklistGroups: vi.fn(),
    putChecklistGroup: vi.fn(),
    postChecklistGroup: vi.fn(),
    deleteChecklistGroup: vi.fn(),
  },
  __esModule: true,
}));

const mockNotifyAdded = vi.fn();
const mockNotifyUpdated = vi.fn();
const mockNotifyDeleted = vi.fn();
const mockNotifyError = vi.fn();
vi.mock('@/stores/genericNotification', () => ({
  default: () => ({
    notifyAdded: mockNotifyAdded,
    notifyUpdated: mockNotifyUpdated,
    notifyDeleted: mockNotifyDeleted,
    notifyError: mockNotifyError,
  }),
}));

describe('useChecklistTemplateStore', () => {
  let store;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useChecklistTemplateStore();
    vi.clearAllMocks();
  });

  test('initial state', () => {
    expect(store.checklistTemplates).toEqual([]);
    expect(store.loading).toEqual([]);
    expect(store.shiftviewStationManualTemplates).toEqual([]);
    expect(store.checklistGroups).toEqual([]);
  });

  describe('actions', () => {
    test('fetchChecklists', async () => {
      const checklists = [{ id: 1, name: 'Checklist 1' }, { id: 2, name: 'Checklist 2' }];
      checklistApi.getChecklists.mockResolvedValueOnce(checklists);
      await store.fetchChecklists();
      expect(checklistApi.getChecklists).toHaveBeenCalledTimes(1);
      expect(store.checklistTemplates).toEqual(checklists);
      expect(store.isLoading).toBe(false);
    });

    test('saveChecklist with new checklist', async () => {
      const checklist = { name: 'Checklist 1' };
      checklistApi.putChecklist.mockResolvedValueOnce(checklist);
      await store.saveChecklist(checklist);
      expect(checklistApi.putChecklist).toHaveBeenCalledWith(checklist);
      expect(mockNotifyAdded).toHaveBeenCalledWith(checklist.name);
      expect(store.checklistTemplates).toEqual([checklist]);
    });

    test('saveChecklist with existing checklist', async () => {
      const checklist = { id: 1, name: 'Checklist 1' };
      checklistApi.putChecklist.mockResolvedValueOnce(checklist);
      await store.saveChecklist(checklist);
      expect(mockNotifyUpdated).toHaveBeenCalledWith(checklist.name);
    });

    test('saveChecklist with error', async () => {
      const error = { response: { data: { message: 'Error message' } } };
      checklistApi.putChecklist.mockRejectedValueOnce(error);
      await store.saveChecklist({ name: 'Checklist 1' });
      expect(mockNotifyError).toHaveBeenCalledWith('Error message');
    });

    test('deleteChecklistTemplate with success', async () => {
      store.checklistTemplates = [{ id: 1, name: 'Checklist 1' }];
      checklistApi.deleteChecklistTemplate.mockResolvedValueOnce();
      await store.deleteChecklistTemplate({ id: 1, name: 'Checklist 1' });
      expect(checklistApi.deleteChecklistTemplate).toHaveBeenCalledWith(1);
      expect(mockNotifyDeleted).toHaveBeenCalledWith('Checklist 1');
      expect(store.checklistTemplates).toEqual([]);
    });

    test('deleteChecklistTemplate with error', async () => {
      const error = { response: { data: { message: 'Error message' } } };
      checklistApi.deleteChecklistTemplate.mockRejectedValueOnce(error);
      await store.deleteChecklistTemplate({ id: 1, name: 'Checklist 1' });
      expect(mockNotifyError).toHaveBeenCalledWith('Error message');
    });

    test('fetchManualChecklistTemplates', async () => {
      const templates = [{ id: 1, name: 'Template 1' }];
      checklistApi.getChecklists.mockResolvedValueOnce(templates);
      await store.fetchManualChecklistTemplates();
      expect(store.shiftviewStationManualTemplates).toEqual(templates);
      expect(store.isLoading).toBe(false);
    });

    test('fetchChecklistGroups', async () => {
      const groups = [{ id: 1, name: 'Group 1' }];
      checklistApi.getChecklistGroups.mockResolvedValueOnce(groups);
      await store.fetchChecklistGroups();
      expect(checklistApi.getChecklistGroups).toHaveBeenCalledTimes(1);
      expect(store.checklistGroups).toEqual(groups);
      expect(store.isLoading).toBe(false);
    });

    test('saveChecklistGroup with new group', async () => {
      const group = { name: 'Group 1' };
      checklistApi.postChecklistGroup.mockResolvedValueOnce(group);
      await store.saveChecklistGroup(group);
      expect(checklistApi.postChecklistGroup).toHaveBeenCalledWith(group);
      expect(mockNotifyAdded).toHaveBeenCalledWith(group.name);
      expect(store.checklistGroups).toEqual([group]);
    });

    test('saveChecklistGroup with existing group', async () => {
      const group = { id: 1, name: 'Group 1' };
      checklistApi.putChecklistGroup.mockResolvedValueOnce(group);
      await store.saveChecklistGroup(group);
      expect(checklistApi.putChecklistGroup).toHaveBeenCalledWith(group);
      expect(mockNotifyUpdated).toHaveBeenCalledWith(group.name);
    });

    test('saveChecklistGroup with error', async () => {
      const error = { response: { data: { message: 'Error message' } } };
      checklistApi.postChecklistGroup.mockRejectedValueOnce(error);
      await store.saveChecklistGroup({ name: 'Group 1' });
      expect(mockNotifyError).toHaveBeenCalledWith('Error message');
    });

    test('deleteChecklistGroup with success', async () => {
      store.checklistGroups = [{ id: 1, name: 'Group 1' }];
      checklistApi.deleteChecklistGroup.mockResolvedValueOnce();
      await store.deleteChecklistGroup({ id: 1, name: 'Group 1' });
      expect(checklistApi.deleteChecklistGroup).toHaveBeenCalledWith(1);
      expect(mockNotifyDeleted).toHaveBeenCalledWith('Group 1');
      expect(store.checklistGroups).toEqual([]);
    });

    test('deleteChecklistGroup with error', async () => {
      const error = { response: { data: { message: 'Error message' } } };
      checklistApi.deleteChecklistGroup.mockRejectedValueOnce(error);
      await store.deleteChecklistGroup({ id: 1, name: 'Group 1' });
      expect(mockNotifyError).toHaveBeenCalledWith('Error message');
    });
  });

  describe('getters', () => {
    test('checklistsTemplatesMap', () => {
      store.checklistTemplates = [{ id: 1, name: 'Checklist 1' }, { id: 2, name: 'Checklist 2' }];
      expect(store.checklistsTemplatesMap).toEqual({
        1: { id: 1, name: 'Checklist 1' },
        2: { id: 2, name: 'Checklist 2' },
      });
    });

    test('isLoading', () => {
      expect(store.isLoading).toBe(false);
      store.loading.push('loading');
      expect(store.isLoading).toBe(true);
    });

    test('checklistGroupsMap', () => {
      store.checklistGroups = [{ id: 1, name: 'Group 1' }, { id: 2, name: 'Group 2' }];
      expect(store.checklistGroupsMap).toEqual({
        1: { id: 1, name: 'Group 1' },
        2: { id: 2, name: 'Group 2' },
      });
    });
  });
});
