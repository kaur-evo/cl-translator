import { setActivePinia, createPinia } from 'pinia';

import useImprovementsProjectStore from './index';

import improvementsProjectApi from '@/api/improvementsProjectApi';
import improvementsStatsApi from '@/api/improvementsStatsApi';

vi.mock('@/api/improvementsProjectApi', () => ({
  default: {
    getProjects: vi.fn(),
    getProject: vi.fn(),
  },
  __esModule: true,
}));

vi.mock('@/api/improvementsStatsApi', () => ({
  default: {
    getStats: vi.fn(),
    getOverviewStats: vi.fn(),
  },
  __esModule: true,
}));

describe('useImprovementsProjectStore', () => {
  let store;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useImprovementsProjectStore();
    vi.clearAllMocks();
  });

  test('initial state', () => {
    expect(store.projects).toEqual([]);
    expect(store.loading).toEqual([]);
  });

  describe('updateProject', () => {
    test('updates existing project at index', () => {
      store.projects = [{ id: 1, name: 'Project 1' }, { id: 2, name: 'Project 2' }];
      store.updateProject({ project: { id: 2, name: 'Project 2 updated' }, index: 1 });
      expect(store.projects).toEqual([{ id: 1, name: 'Project 1' }, { id: 2, name: 'Project 2 updated' }]);
    });

    test('pushes new project when not found', () => {
      store.projects = [{ id: 1, name: 'Project 1' }];
      store.updateProject({ project: { id: 3, name: 'Project 3' } });
      expect(store.projects).toEqual([{ id: 1, name: 'Project 1' }, { id: 3, name: 'Project 3' }]);
    });
  });

  describe('fetchProjects', () => {
    test('fetches projects and stats', async () => {
      const projects = [{ id: 1, name: 'Project 1' }, { id: 2, name: 'Project 2' }];
      improvementsProjectApi.getProjects.mockResolvedValue(projects);
      improvementsStatsApi.getOverviewStats.mockResolvedValue([]);
      await store.fetchProjects();
      expect(improvementsProjectApi.getProjects).toHaveBeenCalled();
      expect(store.projects).toEqual(projects);
      expect(store.isLoading).toBe(false);
    });
  });

  describe('fetchProject', () => {
    test('fetches project without stats when NO_TRACKING_DATA', async () => {
      const project = { id: 1, name: 'Project 1', eventType: 'NO_TRACKING_DATA' };
      improvementsProjectApi.getProject.mockResolvedValue(project);
      await store.fetchProject({ projectId: 1 });
      expect(improvementsProjectApi.getProject).toHaveBeenCalledWith(1);
      expect(improvementsStatsApi.getStats).not.toHaveBeenCalled();
    });

    test('fetches project with stats when not NO_TRACKING_DATA', async () => {
      const project = { id: 1, name: 'Project 1', eventType: 'eventType' };
      const stats = { projectId: 1, change: 1 };
      improvementsProjectApi.getProject.mockResolvedValue(project);
      improvementsStatsApi.getStats.mockResolvedValue(stats);
      await store.fetchProject({ projectId: 1 });
      expect(improvementsStatsApi.getStats).toHaveBeenCalledWith(1);
    });
  });

  describe('fetchAllProjectStats', () => {
    test('merges stats into projects', async () => {
      const projects = [{ id: 1, name: 'Project 1' }, { id: 2, name: 'Project 2' }];
      const stats = [{
        projectId: 1, change: 1, currentAverage: 1, initialDailyAverage: 1,
      }];
      improvementsStatsApi.getOverviewStats.mockResolvedValue(stats);
      store.projects = [...projects];
      await store.fetchAllProjectStats(projects);
      expect(improvementsStatsApi.getOverviewStats).toHaveBeenCalled();
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
