<template>
  <evocon-v-table
    v-model:options="options"
    :headers="createTableHeadersConf()"
    :items="tableProjects"
    :empty-view-header="isFiltered ? $t('No results') : $t('You don\'t have any improvement projects yet')"
    :empty-view-description="isFiltered ? $t('Please try again with other settings.') : $t('Tip: Analyze your downtime report to find out which stop reason could use an improvement.')"
    :empty-view-btn="isFiltered ? '' : $t('Learn more')"
    :primary-empty-view-btn="isFiltered ? '' : $t('Open downtime report')"
    :loading="loading"
    width="auto"
    height="auto"
    are-rows-clickable
    hide-default-footer
    @row-click="selectProject"
    @secondary-empty-view-btn-clicked="navigateToLearnMore"
    @primary-empty-view-btn-clicked="openDowntimeReport"
  />
</template>
<script>
import { mapState } from 'pinia';
import { cloneDeep } from 'lodash';

import { createTableHeadersConf } from './improvementsTableHeadersConf';

import { useStationStore, useCommentStore } from '@/stores/index';
import EvoconVTable from '@/components/molecules/EvoconVTable/index.vue';

export default {
  name: 'ImprovementsProjectsTable',
  components: { EvoconVTable },
  props: {
    projects: {
      type: Array,
      default: () => [],
    },
    isFiltered: {
      type: Boolean,
    },
    loading: {
      type: Boolean,
    },
  },
  data() {
    return {
      options: {
        sortBy: { key: 'startDate', order: 'desc' },
        itemsPerPage: -1,
      },
    };
  },
  computed: {
    ...mapState(useStationStore, ['getOrderedStationNamesArray']),
    ...mapState(useCommentStore, ['commentsRealMap']),
    tableProjects() {
      return this.projects.map((project) => {
        const copy = cloneDeep(project);
        copy.stationNamesArray = this.getOrderedStationNamesArray(copy.stationIds);
        copy.usersArray = copy.users.map((user) => user.fullName).sort((a, b) => a.localeCompare(b));
        copy.commentsNamesArray = copy.commentIds.map((commentId) => this.commentsRealMap.get(commentId)?.name || '').sort((a, b) => a.localeCompare(b));
        return copy;
      });
    },
  },
  methods: {
    createTableHeadersConf,
    openDowntimeReport() {
      window.location.assign(`${window.location.origin}/reports/#/reports/stop/stations/date/thisweek/`);
    },
    navigateToLearnMore() {
      window.open('https://evocon.com/kb/perform-root-cause-analysis/', '_blank');
    },
    selectProject({ item: project }) {
      this.$router.push({ name: 'improvementProject', params: { id: project.id } });
    },
  },
};
</script>
