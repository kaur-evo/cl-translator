<template>
  <v-row class="mt-4">
    <v-col
      cols="12"
      sm="4"
      lg="3"
      xl="2"
    >
      <div class="text-label-small text-high-emphasis">
        {{ file.createdByName || file.username }}
      </div>
      <div class="mt-1 text-label-small text-medium-emphasis">
        {{ getUserRoles(file.roles) }}
      </div>
      <div class="mt-2 text-label-small text-medium-emphasis">
        {{ fileDateTimeLabel }}
      </div>
      <div class="mt-1">
        <improvement-step-number
          v-if="file.stepId && stepsMap[file.stepId]"
          :step="stepsMap[file.stepId]"
          :has-tooltip="true"
          :step-number="stepsMap[file.stepId].ordering"
        />
      </div>
    </v-col>
    <v-col
      class="px-5"
      cols="12"
      sm="8"
      lg="9"
      xl="10"
    >
      <v-row>
        <v-col
          v-for="data in file.data"
          :key="data.path"
          class="flex-shrink-1 flex-grow-0 ma-2"
        >
          <improvement-single-file
            :file-data="data"
            :can-edit="canEdit"
            :is-overview="true"
            :project-id="project.id"
            @open-preview="openPreview"
            @open-edit="openEdit"
            @delete-file="deleteFile"
          />
          <span class="file-title">
            {{ data.title === 'null' ? getNameFromUrl(data.path) : data.title }}
          </span>
        </v-col>
      </v-row>
    </v-col>
  </v-row>
</template>
<script>
import { mapActions } from 'pinia';

import { useImprovementsFileStore, useGenericDialogStore } from '@/stores/index';
import { formatDate } from '@/helpers/date/formatDate';
import ImprovementStepNumber from '@/components/organisms/improvements/ImprovementStepNumber/index.vue';
import ImprovementSingleFile from '@/components/organisms/improvements/ImprovementSingleFile/index.vue';
import { formatTime } from '@/helpers/time/formatTime';
import { getImprovementsFileFormConfig, getImprovementsImagePreviewConfig } from '@/constants/imporovementsDialogConfigs';

const roleDefinitions = {
  COMPANY_ADMIN: {
    name: 'company administrator',
  },
  FACTORY_ADMIN: {
    name: 'factory administrator',
  },
  OFFICE_USER: {
    name: 'office user',
  },
};

export default {
  name: 'ImprovementFileCard',
  components: {
    ImprovementStepNumber,
    ImprovementSingleFile,
  },
  props: {
    file: {
      type: Object,
      default: () => {},
    },
    canEdit: {
      type: Boolean,
    },
    steps: {
      type: Array,
      default: () => [],
    },
    project: {
      type: Object,
      default: () => {},
    },
  },
  computed: {
    fileDateTimeLabel() {
      return `${formatTime(this.file.timestamp)} · ${formatDate(this.file.timestamp, 'long')}`;
    },
    stepsMap() {
      return this.steps.reduce((acc, step) => {
        acc[step.id] = step;
        return acc;
      }, {});
    },
  },
  methods: {
    ...mapActions(useImprovementsFileStore, ['initDeleteFileFlow']),
    ...mapActions(useGenericDialogStore, ['openDialog']),
    getUserRoles(roles) {
      const roleNames = roles.map((e) => roleDefinitions[e]?.name || '');
      return roleNames.join(', ');
    },
    getNameFromUrl(fileUrl) {
      const modifiedUrl = fileUrl.split('/');
      return modifiedUrl[modifiedUrl.length - 1];
    },

    openEdit(file) {
      this.openDialog(getImprovementsFileFormConfig({
        canEdit: this.canEdit,
        isEdit: true,
        project: this.project,
        steps: this.steps,
        file,
      }));
    },
    openPreview(img) {
      this.openDialog(getImprovementsImagePreviewConfig({ img }));
    },
    deleteFile(file) {
      this.initDeleteFileFlow({ projectId: this.project.id, file });
    },
  },
};
</script>
