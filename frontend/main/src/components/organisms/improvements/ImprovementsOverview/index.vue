<template>
  <div>
    <v-card class="mt-4">
      <GenericTabsRow
        v-model="activeTab"
        :items="tabs"
        height="56"
        color="black"
        :disabled-rule-func="val => !projectsGroupedByCategory[val.value].length"
        :count-func="val => formatNumber(projectsGroupedByCategory[val.value].length)"
      />
    </v-card>
    <v-card class="my-6 px-3 py-1">
      <improvements-filter-bar
        :view-index="viewIndex"
        @view-changed="viewIndex = $event"
      />
    </v-card>
    <improvements-projects-grid-view
      v-if="viewIndex === 0"
      id="projects-grid-view"
      :projects="filteredProjects"
      :loading="dataLoading"
      :search="projectsSearch"
    />
    <v-card
      v-else
      class="pa-2"
    >
      <improvements-projects-table
        id="projects-table-view"
        :projects="filteredProjects"
        :loading="dataLoading"
        :search="projectsSearch"
        :is-filtered="isTableFiltered"
      />
    </v-card>
  </div>
</template>
<script>
import {
  isAfter,
  isBefore,
  isSameDay,
  startOfDay,
} from 'date-fns';
import { mapState, mapActions } from 'pinia';

import {
  useFilterbarStore,
  useProfileStore,
  useImprovementsProjectStore,
  useUserStore,
} from '@/stores/index';
import GenericTabsRow from '@/components/molecules/GenericTabsRow/index.vue';
import ImprovementsFilterBar from '@/components/organisms/improvements/ImprovementsFilterBar/index.vue';
import ImprovementsProjectsTable from '@/components/organisms/improvements/ImprovementsProjectsTable/index.vue';
import ImprovementsProjectsGridView from '@/components/organisms/improvements/ImprovementsProjectsGridView/index.vue';
import { formatNumber } from '@/helpers/numbers/formatNumber';

export default {
  name: 'ImprovementsOverview',
  components: {
    GenericTabsRow,
    ImprovementsFilterBar,
    ImprovementsProjectsTable,
    ImprovementsProjectsGridView,
  },
  data() {
    return {
      activeTab: 0,
      tabs: [
        { label: this.$t('Mine'), value: 'myProjects' },
        { label: this.$t('All'), value: 'all' },
        { label: this.$t('Ongoing'), value: 'ongoing' },
        { label: this.$t('Finished'), value: 'finished' },
        { label: this.$t('Upcoming'), value: 'upcoming' },
      ],
      dataLoading: false,
      viewIndex: 0,
    };
  },
  computed: {
    ...mapState(useFilterbarStore, ['currentFilterState', 'requestFilterState']),
    ...mapState(useProfileStore, ['currentUser']),
    ...mapState(useImprovementsProjectStore, ['projects']),
    projectsSearch() {
      return this.currentFilterState.search;
    },
    startDateFilter() {
      return this.requestFilterState.dateRange ? this.requestFilterState.dateRange[0] : '';
    },
    endDateFilter() {
      return this.requestFilterState.dateRange ? this.requestFilterState.dateRange[1] : '';
    },
    factoryFilter() {
      return this.requestFilterState.factoryId;
    },
    stationFilter() {
      return this.requestFilterState.stationId;
    },
    personFilter() {
      return this.requestFilterState.userId;
    },
    projectsGroupedByCategory() {
      const now = startOfDay(new Date());
      const startFilterRule = (x) => !this.startDateFilter || isSameDay(new Date(this.startDateFilter), new Date(x.endDate)) || isAfter(new Date(x.endDate), new Date(this.startDateFilter));
      const endFilterRule = (x) => !this.endDateFilter || isSameDay(new Date(this.endDateFilter), new Date(x.startDate)) || isBefore(new Date(x.startDate), new Date(this.endDateFilter));
      const factoryFilterRule = (x) => !this.factoryFilter || !this.factoryFilter.length || this.factoryFilter.indexOf(x.factoryId) !== -1;
      const stationFilterRule = (x) => !this.stationFilter || !this.stationFilter.length || x.stationIds.some((value) => this.stationFilter.indexOf(value) !== -1);
      const personFilterRule = (x) => !this.personFilter || !this.personFilter.length || x.users.some((value) => this.personFilter.indexOf(value.userId) !== -1);
      const defaultGroupsState = {
        myProjects: [], ongoing: [], finished: [], upcoming: [], all: [],
      };
      return this.projects.reduce((groups, project) => {
        // ignore projects that do not pass the filters
        if (!startFilterRule(project)) return groups;
        if (!endFilterRule(project)) return groups;
        if (!factoryFilterRule(project)) return groups;
        if (!stationFilterRule(project)) return groups;
        if (!personFilterRule(project)) return groups;

        // group by periods
        if ((isSameDay(new Date(project.startDate), now) || isBefore(new Date(project.startDate), now)) && !project.finished) {
          groups.ongoing.push(project);
        } else if (project.finished) {
          groups.finished.push(project);
        } else if (isAfter(new Date(project.startDate), now)) {
          groups.upcoming.push(project);
        }
        if (project.users.find((user) => user.userId === this.currentUser.username)) {
          groups.myProjects.push(project);
        }
        groups.all.push(project);
        return groups;
      }, defaultGroupsState);
    },
    filteredProjects() {
      return this.projectsGroupedByCategory?.[this.tabs[this.activeTab]?.value];
    },
    isTableFiltered() {
      return !!(this.startDateFilter || this.endDateFilter || this.stationFilter || this.personFilter);
    },
  },
  async mounted() {
    this.dataLoading = true;
    await this.fetchProjects();
    this.dataLoading = false;
    this.fetchUsers();
    if (sessionStorage.getItem('activeTab')) {
      this.activeTab = Number(sessionStorage.getItem('activeTab'));
    } else {
      this.setActiveTab();
      sessionStorage.setItem('activeTab', this.activeTab);
    }
  },
  methods: {
    ...mapActions(useImprovementsProjectStore, ['fetchProjects']),
    ...mapActions(useUserStore, ['fetchUsers']),
    setActiveTab() {
      if (this.projectsGroupedByCategory.myProjects.length) {
        this.activeTab = 0;
      } else if (this.projectsGroupedByCategory.ongoing.length) {
        this.activeTab = 2;
      } else {
        this.activeTab = 1;
      }
    },
    formatNumber(number) {
      return formatNumber(number);
    },
  },
};
</script>
