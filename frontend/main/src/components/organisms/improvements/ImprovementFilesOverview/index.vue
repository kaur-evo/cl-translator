<template>
  <div
    v-if="files.length"
    class="pa-2"
  >
    <v-row class="mb-6 files-section">
      <v-col
        v-for="(array, month) in filesByMonth"
        :key="month"
        cols="12"
      >
        <v-row>
          <span class="text-headline-small text-medium-emphasis">
            {{ getMonthName(month) }}
          </span>
        </v-row>
        <improvement-file-card
          v-for="(file, key) in array"
          :key="key"
          :file="file"
          :project="project"
          :steps="actions"
          :can-edit="canEdit"
        />
      </v-col>
    </v-row>
    <v-card-actions class="pa-0 align-end justify-end">
      <evocon-v-button
        v-if="canEdit"
        type="primary-light"
        :icon="mdiPlus"
        :text="$t('File')"
        @click="openEdit(false)"
      />
    </v-card-actions>
  </div>
  <empty-view
    v-else
    id="improvement-files-empty-view"
    :header="$t('No files added')"
    :description="canEdit ? $t('Add files and pictures to document the improvement journey.') : ''"
    :primary-btn="canEdit ? $t('File') : ''"
    :primary-btn-icon="mdiPlus"
    :img-url="'fishbone'"
    @button-clicked="openEdit(false)"
  />
</template>
<script>
import { mdiPlus } from '@mdi/js';
import { mapState, mapActions } from 'pinia';
import { format } from 'date-fns';

import { useImprovementsFileStore, useImprovementsActionsStore, useGenericDialogStore } from '@/stores/index';
import ImprovementFileCard from '@/components/organisms/improvements/ImprovementFileCard/index.vue';
import EmptyView from '@/components/atoms/EmptyView/index.vue';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import { getImprovementsFileFormConfig } from '@/constants/imporovementsDialogConfigs';
import parseDateStr from '@/helpers/date/parseDateStr';

const vectorIcons = { mdiPlus };

export default {
  name: 'ImprovementFilesOverview',
  components: {
    ImprovementFileCard,
    EmptyView,
    EvoconVButton,
  },
  props: {
    project: {
      type: Object,
      default: () => {},
    },
    canEdit: {
      type: Boolean,
    },
  },
  data() {
    return {
      ...vectorIcons,
    };
  },
  computed: {
    ...mapState(useImprovementsFileStore, ['files', 'filesByMonth']),
    ...mapState(useImprovementsActionsStore, ['actions']),
  },
  methods: {
    ...mapActions(useGenericDialogStore, ['openDialog']),
    getMonthName(date) {
      const parsedDate = parseDateStr(`${date}-01`);
      return format(parsedDate, 'MMMM yyyy');
    },
    openEdit(file, isFileEdit = false) {
      this.openDialog(getImprovementsFileFormConfig({
        canEdit: this.canEdit,
        isEdit: isFileEdit,
        project: this.project,
        steps: this.actions,
        file,
      }));
    },
  },
};
</script>
<style lang="less" scoped>
.files-section {
  max-height: 600px;
  overflow-y: auto;
}
</style>
