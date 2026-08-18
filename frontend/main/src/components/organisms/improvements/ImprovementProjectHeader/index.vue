<template>
  <v-row class="mb-7 mx-3 justify-space-between align-start">
    <div class="mr-8">
      <span class="text-headline-large text-high-emphasis mr-5">
        {{ project.name }}
      </span>
      <span class="text-medium-emphasis text-body-medium text-no-wrap">
        {{ `${formatDate(project.startDate)} - ${formatDate(project.endDate)}` }}
      </span>
    </div>
    <div
      v-if="canEdit"
      class="mt-2 project-action-btns"
    >
      <copy-to-clipboard-button />
      <evocon-v-button
        class="mx-1"
        :icon="mdiDelete"
        color="grey-darken-4"
        @click="deleteProject()"
      />
      <evocon-v-button
        class="mx-1"
        :icon="mdiPencil"
        color="grey-darken-4"
        @click="editProject()"
      />
      <evocon-v-button
        v-if="project.finished"
        class="mx-3"
        color="primary"
        :prepend-icon="mdiPencil"
        :text="$t('Edit')"
        @click="editSummary()"
      />
      <evocon-v-button
        class="ml-3"
        :color="project.finished ? 'secondary' : 'primary'"
        :prepend-icon="project.finished ? mdiCheckCircleOutline : mdiCheckCircle"
        :text="project.finished ? $t('Reopen') : $t('Finish')"
        @click="project.finished ? reopenProject() : editSummary()"
      />
    </div>
  </v-row>
</template>
<script>
import { mapActions } from 'pinia';
import {
  mdiDelete,
  mdiPencil,
  mdiCheckCircle,
  mdiCheckCircleOutline,
} from '@mdi/js';
import { defineAsyncComponent } from 'vue';

import { useGenericDialogStore, useGenericNotificationStore, useConfirmDialogStore, useImprovementsProjectStore } from '@/stores/index';
import { formatDate } from '@/helpers/date/formatDate';
import improvementsProjectApi from '@/api/improvementsProjectApi';
import CopyToClipboardButton from '@/components/atoms/CopyToClipboardButton/index.vue';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';


const vectorIcons = {
  mdiDelete,
  mdiPencil,
  mdiCheckCircle,
  mdiCheckCircleOutline,
};

export default {
  name: 'ImprovementProjectHeader',
  components: {
    CopyToClipboardButton,
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
  methods: {
    ...mapActions(useGenericDialogStore, ['openDialog']),
    ...mapActions(useGenericNotificationStore, ['openNotification', 'notifySaved', 'notifyDeleted']),
    ...mapActions(useConfirmDialogStore, ['openConfirmDialog']),
    ...mapActions(useImprovementsProjectStore, ['fetchProject']),
    formatDate(date) {
      return formatDate(date, 'long');
    },
    editProject() {
      this.$router.push({ name: 'improvementEdit', params: { id: this.project.id } });
    },
    editSummary() {
      this.openDialog({
        title: this.$t('Improvement summary'),
        allowFullscreen: false,
        width: 606,
        component: defineAsyncComponent(() => import('../ImprovementProjectFinishForm/index.vue')),
        data: {
          project: this.project,
          successCB: (summary) => this.finishImprovement(summary),
        },
      });
    },
    reopenProject() {
      this.openConfirmDialog({
        title: this.$t('Confirmation'),
        text: this.$t('Are you sure you want to reopen the improvement?'),
        action: async () => {
          await improvementsProjectApi.toggleProjectStatus(this.project.id, { finished: false });
          await this.fetchProject({ projectId: this.project.id });
          this.notifySaved(this.project.name);
        },
        color: 'primary',
        confirmText: this.$t('Reopen'),
        cancelText: this.$t('Cancel'),
      });
    },
    async finishImprovement(summary) {
      await improvementsProjectApi.toggleProjectStatus(this.project.id, summary);
      await this.fetchProject({ projectId: this.project.id });
      if (this.project.finished) {
        this.notifySaved(this.project.name);
      } else {
        this.openNotification({
          text: `${this.project.name} ${this.$t('Finished').toLowerCase()}`,
          type: 'success',
        });
      }
    },
    async deleteProject() {
      this.openConfirmDialog({
        title: this.$t('Confirmation'),
        text: this.$t('Are you sure you want to delete this improvement?'),
        action: async () => {
          try {
            await improvementsProjectApi.deleteProject(this.project.id);
            this.notifyDeleted(this.project.name);
            this.$router.push({ name: 'improvements' });
          } catch {
            this.norifyError(this.$t('We are sorry! There is a problem with your request'));
          }
        },
        confirmText: this.$t('Delete'),
        cancelText: this.$t('Cancel'),
      });
    },
  },
};
</script>
<style lang="less" scoped>
.project-action-btns {
  margin-left: auto;
}
</style>
