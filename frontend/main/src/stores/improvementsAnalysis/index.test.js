import { setActivePinia, createPinia } from 'pinia';
import { AxiosError } from 'axios';

import useImprovementsAnalysisStore from './index';

import improvements5WhysApi from '@/api/improvements5WhysApi';

vi.mock('@/api/improvements5WhysApi', () => ({
  default: {
    get5Whys: vi.fn(),
    save5Whys: vi.fn(),
  },
  __esModule: true,
}));

const mockNotifyError = vi.fn();
vi.mock('@/stores/genericNotification', () => ({
  default: () => ({ notifyError: mockNotifyError }),
}));

describe('useImprovementsAnalysisStore', () => {
  let store;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useImprovementsAnalysisStore();
    vi.clearAllMocks();
  });

  test('initial state', () => {
    expect(store.analysis).toEqual({});
    expect(store.project5Whys).toEqual([]);
  });

  describe('setAnalysis', () => {
    test('sets analysis and project5Whys', () => {
      const analysis = { '5whys': [{ problem: 'Test', whys: [{ question: 'Why?', answer: 'Because' }] }] };
      store.setAnalysis(analysis);
      expect(store.analysis).toEqual(analysis);
      expect(store.project5Whys).toEqual(analysis['5whys']);
    });

    test('sets empty array when 5whys missing', () => {
      store.setAnalysis({});
      expect(store.analysis).toEqual({});
      expect(store.project5Whys).toEqual([]);
    });
  });

  describe('fetchAnalysis', () => {
    test('fetches and sets analysis', async () => {
      const analysis = { '5whys': [{ problem: 'Test', whys: [{ question: 'Why?', answer: 'Because' }] }] };
      improvements5WhysApi.get5Whys.mockResolvedValue(analysis);
      await store.fetchAnalysis(123);
      expect(improvements5WhysApi.get5Whys).toHaveBeenCalledWith(123);
      expect(store.analysis).toEqual(analysis);
      expect(store.project5Whys).toEqual(analysis['5whys']);
    });

    test('notifies error on failure', async () => {
      improvements5WhysApi.get5Whys.mockRejectedValue(
        new AxiosError('axios error', '409', {}, '', { data: { message: 'Getting analysis failed' } }),
      );
      await store.fetchAnalysis(123);
      expect(mockNotifyError).toHaveBeenCalledWith('Getting analysis failed');
    });
  });

  describe('saveAnalysis', () => {
    test('saves and sets analysis', async () => {
      const analysis = { '5whys': [{ problem: 'Test', whys: [{ question: 'Why?', answer: 'Because' }] }] };
      improvements5WhysApi.save5Whys.mockResolvedValue(analysis);
      await store.saveAnalysis({ projectId: 123, analysis });
      expect(improvements5WhysApi.save5Whys).toHaveBeenCalledWith(123, analysis);
      expect(store.analysis).toEqual(analysis);
    });

    test('notifies error on failure', async () => {
      improvements5WhysApi.save5Whys.mockRejectedValue(
        new AxiosError('axios error', '409', {}, '', { data: { message: 'Saving analysis failed' } }),
      );
      await store.saveAnalysis({ projectId: 123, analysis: {} });
      expect(mockNotifyError).toHaveBeenCalledWith('Saving analysis failed');
    });
  });
});
