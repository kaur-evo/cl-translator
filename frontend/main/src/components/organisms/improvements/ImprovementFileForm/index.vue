<template>
  <v-col class="px-4">
    <v-row
      v-for="(file, index) in selectedFiles"
      :key="index"
      class="file-upload-container pa-2 mb-4"
    >
      <v-col class="flex-shrink-1 flex-grow-0">
        <v-row>
          <improvement-single-file
            :file-data="file"
            :is-edit="isEdit"
            :can-edit="canEdit"
            :project-id="project.id"
            :is-dialog-open="isDialogOpen"
            @delete-preview-file="deletePreviewFile"
          />
        </v-row>
      </v-col>
      <v-col class="pl-2 flex-grow-1 flex-shrink-0 file-upload-fields">
        <evocon-v-input
          v-model="file.title"
          class="mb-4"
          :placeholder="$t('Name')"
        />
        <selection-input
          :model-value="[file.stepId]"
          :placeholder="$t('Action')"
          item-text="inputText"
          :hint="`${$t('Link to an action')} (${$t('Optional').toLowerCase()})`"
          :items="steps"
          is-single-select
          hide-search
          @update:model-value="file.stepId = $event[0]"
        />
      </v-col>
      <v-col
        class="px-3"
        cols="12"
      >
        <div
          v-if="file.size && !uploadQueue[index]"
          class="text-body-small font-weight-medium text-disabled mb-1"
        >
          <span>{{ $t('File size') }}: {{ formatBytes(file.size) }}</span>
        </div>
        <div v-else-if="uploadQueue[index]">
          <span
            v-if="uploadQueue[index] && uploadQueue[index].status === 'finished'"
            class="text-primary"
          >
            {{ $t('Complete') }}
          </span>
          <span
            v-else-if="uploadQueue[index] && uploadQueue[index].status === 'failed'"
            class="text-error"
          >
            {{ $t('Failed') }}
          </span>
          <div
            v-else
            class="text-body-small font-weight-medium text-disabled mb-1"
          >
            {{ $t('Uploading file') }}:
            <span>{{ formatBytes(uploadQueue[index] ? uploadQueue[index].size : 0) }}</span>
            /<span>{{ formatBytes(file.size) }}</span>
          </div>
        </div>
      </v-col>
      <v-col
        v-if="uploadQueue[index]"
        cols="12"
      >
        <v-progress-linear
          class="mb-1 border-eadius-1"
          :model-value="uploadQueue[index] ? uploadQueue[index].percentage : 0"
          bg-color="#e6e6e6"
          color="primary"
        />
      </v-col>
    </v-row>
    <v-sheet
      v-if="!isEdit"
      class="file-upload-sheet"
    >
      <div class="fill-height d-flex justify-center align-center">
        <evocon-v-button
          color="primary"
          variant="text"
          size="x-large"
          text-class="text-none"
          :icon="mdiUpload"
          :text="selectedFiles.length ? $t('Click here to upload another file') : $t('Click here to upload a file')"
          @click="addNewFile"
        />
      </div>
      <label for="file-input">
        <input
          id="file-input"
          ref="files"
          type="file"
          class="file-input"
          multiple
          @change="filesPicked()"
        >
      </label>
    </v-sheet>
    <v-card-actions class="px-0 justify-end">
      <evocon-v-button
        variant="text"
        :text="$t('Cancel')"
        @click="cancelEdit"
      />
      <evocon-v-button
        :loading="isLoading"
        :disabled="!selectedFiles.length"
        color="primary"
        :text="$t('Save')"
        @click="isEdit ? editFile(selectedFiles) : submitFiles(selectedFiles)"
      />
    </v-card-actions>
  </v-col>
</template>
<script>
import { mapState, mapActions } from 'pinia';
import { mdiUpload } from '@mdi/js';
import { format } from 'date-fns';

import { useGenericDialogStore, useImprovementsFileStore } from '@/stores/index';
import truncateText from '@/helpers/text/truncateText';
import formatBytes from '@/helpers/file/formatBytes';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import EvoconVInput from '@/components/atoms/EvoconVInput/index.vue';
import SelectionInput from '@/components/molecules/SelectionInput/index.vue';
import ImprovementSingleFile from '@/components/organisms/improvements/ImprovementSingleFile/index.vue';

const vectorIcons = { mdiUpload };

export default {
  name: 'ImprovementFileForm',
  components: {
    EvoconVButton,
    EvoconVInput,
    SelectionInput,
    ImprovementSingleFile,
  },
  data() {
    return {
      ...vectorIcons,
      selectedFiles: [],
      fileGroupTimestamp: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss"),
    };
  },
  computed: {
    ...mapState(useGenericDialogStore, ['dialogData']),
    ...mapState(useImprovementsFileStore, ['uploadQueue', 'isLoading']),
    isEdit() {
      return this.dialogData.isEdit || false;
    },
    canEdit() {
      return this.dialogData.canEdit || false;
    },
    isDialogOpen() {
      return this.dialogData.isDialogOpen || false;
    },
    project() {
      return this.dialogData.project || {};
    },
    steps() {
      if (this.dialogData.steps) {
        return this.dialogData.steps.map((step) => ({
          ...step,
          // eslint-disable-next-line no-magic-numbers
          inputText: `${step.ordering + 1}. ${this.truncateText(step.description, 45)}`,
        }));
      }
      return [];
    },
  },
  mounted() {
    if (this.dialogData.item) {
      const inputFile = {
        title: this.dialogData.item.title || this.getNameFromUrl(this.dialogData.item.path),
        timestamp: this.dialogData.item.timestamp,
        fileName: this.dialogData.item.fileName,
        path: this.dialogData.item.path,
        type: this.dialogData.item.contentType,
        stepId: Number(this.dialogData.item.stepId),
      };
      this.selectedFiles.push(inputFile);
    }
  },
  methods: {
    ...mapActions(useGenericDialogStore, ['closeDialog']),
    ...mapActions(useImprovementsFileStore, ['addFilesToUploadQueue', 'resetFilesUploadQueue', 'modifyFile', 'initDeleteFileFlow']),
    truncateText,
    formatBytes,
    cancelEdit() {
      this.selectedFiles = [];
      this.resetFilesUploadQueue();
      this.closeDialog();
    },
    getNameFromUrl(fileUrl) {
      const modifiedUrl = fileUrl.split('/');
      return modifiedUrl[modifiedUrl.length - 1];
    },
    addNewFile() {
      this.$refs.files.click();
    },
    filesPicked() {
      const fileList = this.$refs.files.files;
      Array.from(fileList).forEach((file) => {
        const reader = new FileReader();
        const modifiedFile = {
          currentFile: file,
          type: file.type,
          fileName: file.name,
          title: null,
          size: file.size,
        };
        reader.addEventListener('load', (e) => {
          modifiedFile.url = e.target.result;
        });
        reader.readAsDataURL(file);
        reader.onloadend = () => {
          this.selectedFiles.push(modifiedFile);
        };
      });
    },
    async submitFiles(files) {
      await this.addFilesToUploadQueue({
        files,
        groupTimestamp: this.fileGroupTimestamp,
        projectId: this.project.id,
        selectedCB: (val) => {
          this.selectedFiles = val;
        },
      });
      if (!this.selectedFiles.length) {
        this.closeDialog();
      }
    },
    async editFile(files) {
      await this.modifyFile({ file: files[0], projectId: this.project.id, stepId: files[0].stepId });
      this.closeDialog();
    },
    deletePreviewFile(previewFile) {
      if (this.isEdit) {
        this.initDeleteFileFlow({ projectId: this.project.id, file: previewFile });
      } else {
        const selectedFile = this.selectedFiles.find((file) => file.url === previewFile);
        const index = this.selectedFiles.indexOf(selectedFile);
        this.selectedFiles.splice(index, 1);
      }
    },
  },
};
</script>
<style lang="less" scoped>
.file-upload-container {
  background: rgb(var(--v-theme-quaternary-dark));
  border-radius: 4px;
}

.file-upload-sheet {
  height: 136px;
  width: 100%;
  background-color: var(--color-12-primary);
  .file-input {
    display: none;
  }
}
</style>
