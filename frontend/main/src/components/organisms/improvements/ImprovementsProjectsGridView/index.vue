<template>
  <v-card
    v-if="!filteredProjectsBySearch.length && !loading"
    class="py-12"
  >
    <empty-view
      id="grid-layout-empty-view"
      :header="$t('No results')"
      :description="$t('Please try again with other settings.')"
    />
  </v-card>
  <div
    v-else-if="!loading"
    class="grid-view"
  >
    <improvements-project-card
      v-for="project in filteredProjectsBySearch"
      :key="project.id"
      :project="project"
      :actions="project.steps"
      :team="project.users"
      :is-finished="project.finished"
      :is-overdue="isProjectOverdue(project)"
      :date-value-header="getDateValueHeader(project)"
      :date-value="getDateValue(project)"
    />
  </div>
</template>
<script>
import {
  isAfter,
  isBefore,
  isSameDay,
  startOfDay,
} from 'date-fns';

import EmptyView from '@/components/atoms/EmptyView/index.vue';
import { formatDate } from '@/helpers/date/formatDate';
import ImprovementsProjectCard from '@/components/organisms/improvements/ImprovementsProjectCard/index.vue';

export default {
  name: 'ImprovementsProjectsGridView',
  components: {
    EmptyView,
    ImprovementsProjectCard,
  },
  props: {
    projects: { type: Array, default: () => [] },
    search: { type: String, default: () => '' },
    loading: { type: Boolean },
  },
  computed: {
    filteredProjectsBySearch() {
      return this.projects.filter((project) => this.matchesSearch(project.name));
    },
  },
  methods: {
    matchesSearch(val) {
      return String(val).toLowerCase().includes(String(this.search).toLowerCase());
    },
    isProjectOverdue(project) {
      const projectEndDate = new Date(project.endDate);
      const startOfCurrentDate = startOfDay(new Date());
      return !project.finished && (isSameDay(projectEndDate, startOfCurrentDate) || isBefore(projectEndDate, startOfCurrentDate));
    },
    getDateValueHeader(project) {
      if (isAfter(new Date(project.startDate), startOfDay(new Date()))) {
        return this.$t('Starts');
      }
      return this.$t('End');
    },
    getDateValue(project) {
      let date = project.endDate;
      if (isAfter(new Date(project.startDate), startOfDay(new Date()))) {
        date = project.startDate;
      }
      return formatDate(date, 'long');
    },
  },
};
</script>
<style lang="scss" scoped>
.grid-view {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(328px, 1fr));
  grid-gap: 24px;
}
</style>
