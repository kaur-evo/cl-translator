import { setActivePinia, createPinia } from 'pinia';
import { AxiosError } from 'axios';

import useImprovementsSolutionsStore from './index';

import improvementsMeasureApi from '@/api/improvementsMeasureApi';

vi.mock('@/api/improvementsMeasureApi', () => ({
  default: {
    getSolutions: vi.fn(),
    saveSolution: vi.fn(),
    saveSolutionById: vi.fn(),
  },
  __esModule: true,
}));

const mockNotifyError = vi.fn();
vi.mock('@/stores/genericNotification', () => ({
  default: () => ({ notifyError: mockNotifyError }),
}));

describe('useImprovementsSolutionsStore', () => {
  let store;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useImprovementsSolutionsStore();
    vi.clearAllMocks();
  });

  test('initial state', () => {
    expect(store.solutions).toEqual([]);
  });

  describe('fetchSolutions', () => {
    test('fetches and sets solutions', async () => {
      const solutions = [{ id: 1, description: 'Solution1' }, { id: 2, description: 'Solution2' }];
      improvementsMeasureApi.getSolutions.mockResolvedValue(solutions);
      await store.fetchSolutions(123);
      expect(improvementsMeasureApi.getSolutions).toHaveBeenCalledWith(123);
      expect(store.solutions).toEqual(solutions);
    });

    test('notifies error on failure', async () => {
      improvementsMeasureApi.getSolutions.mockRejectedValue(
        new AxiosError('axios error', '409', {}, '', { data: { message: 'Getting solutions failed' } }),
      );
      await store.fetchSolutions(123);
      expect(mockNotifyError).toHaveBeenCalledWith('Getting solutions failed');
    });
  });

  describe('saveSolution', () => {
    test('saves and pushes solution', async () => {
      const solutionResponse = { description: 'new solution' };
      improvementsMeasureApi.saveSolution.mockResolvedValue(solutionResponse);
      await store.saveSolution({ solution: { description: 'new solution' } });
      expect(improvementsMeasureApi.saveSolution).toHaveBeenCalledWith({ description: 'new solution' });
      expect(store.solutions).toEqual([solutionResponse]);
    });

    test('notifies error on failure', async () => {
      improvementsMeasureApi.saveSolution.mockRejectedValue(
        new AxiosError('axios error', '409', {}, '', { data: { message: 'Saving solutions failed' } }),
      );
      await store.saveSolution({ solution: { description: 'new solution' } });
      expect(mockNotifyError).toHaveBeenCalledWith('Saving solutions failed');
    });
  });

  describe('saveSolutionById', () => {
    test('saves and replaces solution at index', async () => {
      store.solutions = [{ id: 1, description: 'Solution1' }, { id: 2, description: 'Solution2' }];
      const solutionResponse = { id: 1, description: 'Updated' };
      improvementsMeasureApi.saveSolutionById.mockResolvedValue(solutionResponse);
      await store.saveSolutionById({ solution: { id: 1, description: 'Updated' }, index: 0 });
      expect(improvementsMeasureApi.saveSolutionById).toHaveBeenCalledWith(1, { id: 1, description: 'Updated' });
      expect(store.solutions[0]).toEqual(solutionResponse);
    });

    test('does not replace when index is out of bounds', async () => {
      store.solutions = [{ id: 1, description: 'Solution1' }];
      const solutionResponse = { id: 2, description: 'Updated' };
      improvementsMeasureApi.saveSolutionById.mockResolvedValue(solutionResponse);
      await store.saveSolutionById({ solution: { id: 2, description: 'Updated' }, index: 3 });
      expect(store.solutions).toEqual([{ id: 1, description: 'Solution1' }]);
    });

    test('notifies error on failure', async () => {
      improvementsMeasureApi.saveSolutionById.mockRejectedValue(
        new AxiosError('axios error', '409', {}, '', { data: { message: 'Saving solution failed' } }),
      );
      await store.saveSolutionById({ solution: { id: 1 }, index: 0 });
      expect(mockNotifyError).toHaveBeenCalledWith('Saving solution failed');
    });
  });
});
