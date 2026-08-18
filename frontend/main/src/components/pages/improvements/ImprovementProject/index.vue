<template>
  <div
    v-if="$route.name === 'improvementProject'"
    class="py-16 fill-height bg-quaternary-dark"
  >
    <v-container
      :fluid="$vuetify.display.lgAndDown"
      :class="$vuetify.display.lgAndUp && $vuetify.display.name !== 'xl' ? 'desktop-size' : ''"
    >
      <div v-if="project && dataLoaded">
        <improvement-project-header
          :project="project"
          :can-edit="canEditProject"
        />
        <v-card class="ma-3">
          <improvement-project-info :project="project" />
        </v-card>
        <improvement-project-info-cards
          v-if="isTrackingDataAdded"
          :project="project"
          :can-edit="canEditProject"
          :stats="project.stats"
        />
        <improvement-project-chart-section
          :project="project"
          :is-tracking-data-added="isTrackingDataAdded"
          :stats="project.stats"
        />
        <v-row>
          <improvement-measures-section
            :project="project"
            :can-edit="canEditProject"
          />
          <improvement-notes-and-files-section
            :project="project"
            :can-edit="canEditProject"
          />
        </v-row>
      </div>
    </v-container>
  </div>
  <router-view v-else />
</template>
<script>
import { mapState, mapActions } from 'pinia';

import {
  useProfileStore,
  useImprovementsProjectStore,
  useImprovementsNoteStore,
  useImprovementsFileStore,
  useImprovementsAnalysisStore,
  useImprovementsActionsStore,
  useImprovementsSolutionsStore,
} from '@/stores/index';
import { NO_TRACKING_DATA } from '@/constants/improvementsEventTypes';
import { COMPANY_ADMIN } from '@/constants/userRoles';
import ImprovementProjectHeader from '@/components/organisms/improvements/ImprovementProjectHeader/index.vue';
import ImprovementProjectInfo from '@/components/organisms/improvements/ImprovementProjectInfo/index.vue';
import ImprovementProjectInfoCards from '@/components/organisms/improvements/ImprovementProjectInfoCards/index.vue';
import ImprovementProjectChartSection from '@/components/organisms/improvements/ImprovementProjectChartSection/index.vue';
import ImprovementMeasuresSection from '@/components/organisms/improvements/ImprovementMeasuresSection/index.vue';
import ImprovementNotesAndFilesSection from '@/components/organisms/improvements/ImprovementNotesAndFilesSection/index.vue';

export default {
  name: 'ImprovementProject',
  components: {
    ImprovementProjectHeader,
    ImprovementProjectInfo,
    ImprovementProjectInfoCards,
    ImprovementProjectChartSection,
    ImprovementMeasuresSection,
    ImprovementNotesAndFilesSection,
  },
  data() {
    return {
      dataLoaded: false,
    };
  },
  computed: {
    ...mapState(useProfileStore, ['currentUser', 'highestUserRole']),
    ...mapState(useImprovementsProjectStore, ['projects']),
    canEditProject() {
      return this.project.users.some((user) => user.userId === this.currentUser.username) || this.highestUserRole === COMPANY_ADMIN;
    },
    isTrackingDataAdded() {
      return this.project.eventType !== NO_TRACKING_DATA;
    },
    project() {
      if (!this.projects) return {};
      return this.projects.find((project) => project.id === Number(this.$route.params.id)) || {};
    },
  },
  async mounted() {
    await this.fetchProject({ projectId: this.$route.params.id });
    await this.fetchNotes(this.project.id);
    await this.fetchFiles(this.project.id);
    await this.fetchAnalysis(this.project.id);
    await this.fetchActions(this.project.id);
    await this.fetchSolutions(this.project.id);
    this.dataLoaded = true;
  },
  methods: {
    ...mapActions(useImprovementsNoteStore, ['fetchNotes']),
    ...mapActions(useImprovementsFileStore, ['fetchFiles']),
    ...mapActions(useImprovementsAnalysisStore, ['fetchAnalysis']),
    ...mapActions(useImprovementsActionsStore, ['fetchActions']),
    ...mapActions(useImprovementsSolutionsStore, ['fetchSolutions']),
    ...mapActions(useImprovementsProjectStore, ['fetchProject']),
  },
};
</script>
<style lang="less" scoped>
.desktop-size {
  padding: 0 148px;
}
</style>
