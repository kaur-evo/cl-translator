import { setActivePinia, createPinia } from 'pinia';
import { AxiosError } from 'axios';

import useImprovementsActionsStore from './index';

import improvementsMeasureApi from '@/api/improvementsMeasureApi';

vi.mock('@/api/improvementsMeasureApi', () => ({
  default: {
    getActions: vi.fn(),
    saveAction: vi.fn(),
    saveActionById: vi.fn(),
  },
  __esModule: true,
}));

const mockNotifyError = vi.fn();
vi.mock('@/stores/genericNotification', () => ({
  default: () => ({ notifyError: mockNotifyError }),
}));

describe('useImprovementsActionsStore', () => {
  let store;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useImprovementsActionsStore();
    vi.clearAllMocks();
  });

  test('initial state', () => {
    expect(store.actions).toEqual([]);
  });

  describe('fetchActions', () => {
    test('fetches and sets actions', async () => {
      const actions = [{ id: 1, description: 'Action1' }, { id: 2, description: 'Action2' }];
      improvementsMeasureApi.getActions.mockResolvedValue(actions);
      await store.fetchActions(123);
      expect(improvementsMeasureApi.getActions).toHaveBeenCalledWith(123);
      expect(store.actions).toEqual(actions);
    });

    test('notifies error on failure', async () => {
      improvementsMeasureApi.getActions.mockRejectedValue(
        new AxiosError('axios error', '409', {}, '', { data: { message: 'Getting actions failed' } }),
      );
      await store.fetchActions(123);
      expect(mockNotifyError).toHaveBeenCalledWith('Getting actions failed');
    });
  });

  describe('saveAction', () => {
    test('saves and pushes action when not replacing', async () => {
      improvementsMeasureApi.saveAction.mockResolvedValue([{ description: 'new action' }]);
      await store.saveAction({ action: { description: 'new action' }, replace: false });
      expect(improvementsMeasureApi.saveAction).toHaveBeenCalledWith({ description: 'new action' });
      expect(store.actions).toEqual([{ description: 'new action' }]);
    });

    test('saves and replaces all actions when replace is true', async () => {
      store.actions = [{ id: 1, description: 'old' }];
      improvementsMeasureApi.saveAction.mockResolvedValue([{ description: 'new action' }]);
      await store.saveAction({ action: { description: 'new action' }, replace: true });
      expect(store.actions).toEqual([{ description: 'new action' }]);
    });

    test('notifies error on failure', async () => {
      improvementsMeasureApi.saveAction.mockRejectedValue(
        new AxiosError('axios error', '409', {}, '', { data: { message: 'Saving actions failed' } }),
      );
      await store.saveAction({ action: { description: 'new action' }, replace: false });
      expect(mockNotifyError).toHaveBeenCalledWith('Saving actions failed');
    });
  });

  describe('saveActionById', () => {
    test('saves and replaces action at index', async () => {
      store.actions = [{ id: 1, description: 'Action1' }, { id: 2, description: 'Action2' }];
      const actionResponse = { id: 1, description: 'Updated' };
      improvementsMeasureApi.saveActionById.mockResolvedValue(actionResponse);
      await store.saveActionById({ action: { id: 1, description: 'Updated' }, index: 0 });
      expect(improvementsMeasureApi.saveActionById).toHaveBeenCalledWith(1, { id: 1, description: 'Updated' });
      expect(store.actions[0]).toEqual(actionResponse);
    });

    test('does not replace when index is out of bounds', async () => {
      store.actions = [{ id: 1, description: 'Action1' }];
      improvementsMeasureApi.saveActionById.mockResolvedValue({ id: 2, description: 'Updated' });
      await store.saveActionById({ action: { id: 2, description: 'Updated' }, index: 3 });
      expect(store.actions).toEqual([{ id: 1, description: 'Action1' }]);
    });

    test('notifies error on failure', async () => {
      improvementsMeasureApi.saveActionById.mockRejectedValue(
        new AxiosError('axios error', '409', {}, '', { data: { message: 'Saving action failed' } }),
      );
      await store.saveActionById({ action: { id: 1 }, index: 0 });
      expect(mockNotifyError).toHaveBeenCalledWith('Saving action failed');
    });
  });
});
