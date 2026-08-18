import { defineStore } from 'pinia';

import { NO_TRACKING_DATA } from '@/constants/improvementsEventTypes';
import improvementsProjectApi from '@/api/improvementsProjectApi';
import improvementsStatsApi from '@/api/improvementsStatsApi';

const useImprovementsProjectStore = defineStore('improvementsProject', {
  state: () => ({
    projects: [],
    loading: [],
  }),
  getters: {
    isLoading: (state) => !!state.loading.length,
  },
  actions: {
    updateProject({ project, index }) {
      let i = index;
      if (!index) {
        i = this.projects.findIndex((p) => p.id === project.id);
      }
      if (i > -1) {
        this.projects.splice(i, 1, project);
      } else {
        this.projects.push(project);
      }
    },
    async fetchProjects() {
      this.loading.push('loading');
      try {
        const projects = await improvementsProjectApi.getProjects() || [];
        this.projects = projects;
        this.fetchAllProjectStats(projects);
      } finally {
        this.loading.pop();
      }
    },
    async fetchProject({ projectId }) {
      const currentProject = await improvementsProjectApi.getProject(projectId);
      if (currentProject.eventType !== NO_TRACKING_DATA) {
        const stats = await improvementsStatsApi.getStats(projectId);
        currentProject.stats = stats;
      }
      this.updateProject({ project: currentProject });
    },
    async fetchAllProjectStats(projects) {
      const stats = await improvementsStatsApi.getOverviewStats();
      for (let i = 0; i < projects.length; i += 1) {
        const currentStats = stats.find((s) => s.projectId === projects[i].id);
        if (currentStats) {
          this.updateProject({
            index: i,
            project: {
              ...projects[i],
              ...currentStats,
            },
          });
        } else if (projects[i].eventType !== NO_TRACKING_DATA) {
          this.updateProject({
            index: i,
            project: {
              ...projects[i],
              change: 1,
              currentAverage: 0,
              initialDailyAverage: 0,
            },
          });
        }
      }
    },
  },
});

export default useImprovementsProjectStore;
