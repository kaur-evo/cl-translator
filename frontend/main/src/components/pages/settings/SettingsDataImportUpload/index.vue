<template>
  <form-page-template
    v-if="$route.name.endsWith('_dataImportUpload')"
    id="data-import-upload"
    :primary-segment-title="$t('Data import')"
  >
    <template #primary-segment>
      <v-row>
        <v-col
          cols="12"
          class="py-4 px-1"
        >
          <v-stepper :model-value="step">
            <v-stepper-header>
              <v-stepper-item
                color="primary"
                value="1"
              >
                {{ $t('Add file') }}
              </v-stepper-item>
              <v-divider v-if="!isLoading" />
              <v-progress-linear
                v-if="isLoading"
                height="1"
                color="primary"
                indeterminate
              />
              <v-stepper-item
                :color="importLastStepColor"
                value="2"
              >
                {{ $t('Finish') }}
              </v-stepper-item>
            </v-stepper-header>
          </v-stepper>
          <div v-if="!importFinished">
            <v-sheet elevation="0" class="mt-4 file-upload-sheet d-flex justify-center align-center">
              <v-btn
                color="primary"
                variant="text"
                size="x-large"
                @click="addNewFile"
              >
                <v-icon start>
                  {{ isFileChosen ? mdiFile : mdiUpload }}
                </v-icon>
                <span class="text-none text-body-large">
                  {{ isFileChosen ? fileToImport.fileName : `${$t('Click here to upload a file')} (.xlsx)` }}
                </span>
              </v-btn>
              <input
                ref="files"
                type="file"
                aria-label="file-input"
                accept=".xlsx"
                hidden
                @change="pickFile($event.target.files)"
              >
            </v-sheet>
          </div>

          <div class="mb-n4">
            <generic-message-card
              v-for="message in uploadMessages"
              :key="message.message"
              :icon="message.icon"
              :icon-color="message.iconColor"
              :message="message.message"
              :description="message.description"
            >
              <template
                v-if="message.actionButton"
                #action-button
              >
                <evocon-v-button
                  :icon="mdiDownload"
                  :text="message.actionButton"
                  type="primary-light"
                  class="ml-4"
                  @click="message.action"
                />
              </template>
            </generic-message-card>
          </div>
        </v-col>
      </v-row>
    </template>

    <template #actions>
      <evocon-v-checkbox
        v-if="!importFinished"
        id="data-import-checklist"
        v-model="overwriteConfirmed"
        :label="$t('Confirm overwriting data')"
        :sub-label="$t('Uploaded data will overwrite current settings.')"
      />
      <template v-if="importFinished">
        <evocon-v-button
          v-if="importFailed || failedRowsLength > 0"
          :icon="mdiChevronLeft"
          :text="$t('Retry')"
          :type="'secondary'"
          @click="resetView"
        />
        <v-spacer />
        <evocon-v-button
          :text="$t('Close')"
          :type="'secondary'"
          @click="routeBack(3)"
        />
      </template>

      <template v-else>
        <v-spacer />
        <evocon-v-button
          :text="$t('Cancel')"
          :type="'secondary'"
          @click="cancelAction"
        />
        <evocon-v-button
          :disabled="!isFileChosen || !overwriteConfirmed"
          :loading="isLoading"
          :color="'primary'"
          :text="$t('Add')"
          @click="submitFile"
        />
      </template>
    </template>
  </form-page-template>
  <router-view v-else />
</template>

<script>
import {
  mdiUpload,
  mdiFile,
  mdiAlertCircleOutline,
  mdiChevronLeft,
  mdiDownload,
} from '@mdi/js';
import { mapState, mapActions } from 'pinia';

import settingsFileApi from '@/api/settingsFileApi';
import downloadFile from '@/helpers/file/downloadFile';
import FormPageTemplate from '@/components/templates/FormPageTemplate/index.vue';
import GenericMessageCard from '@/components/molecules/GenericMessageCard/index.vue';
import EvoconVCheckbox from '@/components/atoms/EvoconVCheckbox/index.vue';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import useSettingsFileUploadStore from '@/stores/settingsFileUpload';
import useConfirmDialogStore from '@/stores/confirmDialog';
import useGenericNotificationStore from '@/stores/genericNotification';


const vectorIcons = {
  mdiUpload,
  mdiFile,
  mdiAlertCircleOutline,
  mdiChevronLeft,
  mdiDownload,
};
export default {
  name: 'SettingsDataImportUpload',
  components: {
    FormPageTemplate,
    EvoconVCheckbox,
    GenericMessageCard,
    EvoconVButton,
  },
  data() {
    return {
      ...vectorIcons,
      step: '1',
      fileToImport: null,
      overwriteConfirmed: false,
    };
  },
  computed: {
    ...mapState(useSettingsFileUploadStore, ['isLoading', 'importResult', 'importFailed', 'importFinished', 'hasFileTypeError']),
    isFileChosen() {
      return !!this.fileToImport;
    },
    failedRowsLength() {
      return this.importResult.failed || 0;
    },
    updatedRowsLength() {
      return (this.importResult.updated || 0) + (this.importResult.created || 0) + (this.importResult.deleted || 0);
    },
    reportName() {
      return this.$route.query.reportName || '';
    },
    uploadMessages() {
      const messages = [];
      if (!this.importFailed && this.failedRowsLength > 0) {
        messages.push({
          icon: mdiAlertCircleOutline,
          iconColor: 'secondary',
          message: this.$t('{value} items not updated', { value: this.failedRowsLength }),
          description: this.$t('Download the file and review errors. Once fixed, try again. To restore back to previous version, contact our support.'),
          actionButton: this.$t('Download'),
          action: () => this.downloadErrorsFile(),
        });
      }
      if (!this.importFailed && (this.updatedRowsLength > 0)) {
        messages.push({
          message: `${this.updatedRowsLength} ${this.$t('items successfully updated')}`,
        });
      }
      if (this.importFinished && !this.importFailed && this.updatedRowsLength === 0 && this.failedRowsLength === 0) {
        messages.push({
          message: this.$t('Import successful - no changes made'),
        });
      }
      if (this.importFailed && this.hasFileTypeError) {
        messages.push({
          icon: mdiAlertCircleOutline,
          iconColor: 'error',
          message: this.$t('Import failed'),
          description: `${this.$t('The imported file does not meet our format requirements.')} ${this.$t('Please fix it and try again.')}`,
        });
      } else if (this.importFailed) {
        messages.push({
          icon: mdiAlertCircleOutline,
          iconColor: 'error',
          message: this.$t('Import failed'),
          description: this.$t('Once fixed, try again.'),
        });
      }
      return messages;
    },
    importLastStepColor() {
      if (this.importFailed) {
        return 'error';
      }
      return this.failedRowsLength > 0 ? 'secondary' : 'primary';
    },
  },
  watch: {
    importFinished(val) {
      if (val) {
        this.step = '2';
        if (this.importFailed) {
          this.notifyError(this.$t('Import failed'));
        } else if (this.failedRowsLength === 0) {
          this.notifySuccess(this.$t('Import finished'));
        }
      } else {
        this.step = '1';
      }
    },
  },
  beforeUnmount() {
    this.resetView();
  },
  methods: {
    ...mapActions(useSettingsFileUploadStore, ['importFile', 'resetState']),
    ...mapActions(useConfirmDialogStore, ['openConfirmDialog']),
    ...mapActions(useGenericNotificationStore, ['notifySuccess', 'notifyWarning', 'notifyError']),
    addNewFile() {
      this.$refs.files.click();
    },
    pickFile(fileList) {
      Object.values(fileList).forEach((file) => {
        const error = this.getFileValidationError(file);
        if (error) {
          this.notifyError(error);
          return;
        }

        const reader = new FileReader();
        const modifiedFile = {
          currentFile: file,
          type: file.type,
          fileName: file.name,
          title: file.title,
          size: file.size,
        };
        reader.addEventListener('load', (e) => {
          modifiedFile.url = e.target.result;
        });
        reader.readAsDataURL(file);
        this.fileToImport = modifiedFile;
      });
    },
    async downloadErrorsFile() {
      const fileName = this.reportName.replace('Export', 'Errors');
      const data = await settingsFileApi.getFile(this.importResult.failureFilePath);
      downloadFile(data, `${fileName}.xlsx`);
    },
    getFileValidationError(file) {
      if (!file) {
        return '';
      }
      const { size, name } = file;
      const extension = name.split('.').pop();

      // eslint-disable-next-line no-magic-numbers
      if (size > 10_485_760) {
        return this.$t('File size too big! Limit 10MB');
      }
      if (extension !== 'xlsx') {
        return this.$t('File format wrong! Only .xlsx files supported.');
      }
      return '';
    },
    async cancelAction() {
      if (this.isLoading) {
        const confirmDialogConfig = {
          title: this.$t('Confirmation'),
          text: this.$t('Leaving the page will not cancel the import. Are you sure that you want to leave the page?'),
          action: () => {
            this.notifyWarning({ text: this.$t('Import will continue in the background') });
            this.routeBack();
          },
          confirmText: this.$t('Yes'),
          cancelText: this.$t('Cancel'),
        };
        await this.openConfirmDialog(confirmDialogConfig);
      } else {
        await this.routeBack();
      }
    },
    async routeBack(depth = 2) {
      this.resetView();
      const { path } = this.$route.matched[this.$route.matched.length - depth];
      this.$router.push({ path, query: this.$route.query });
    },
    async submitFile() {
      if (!this.isFileChosen || !this.overwriteConfirmed) return;
      const reportName = this.reportName.replace('Export', '');
      await this.importFile({
        file: this.fileToImport,
        reportName,
      });
    },
    resetView() {
      this.resetState();
      this.fileToImport = null;
      this.overwriteConfirmed = false;
    },
  },
};
</script>

<style lang="less" scoped>
.file-upload-sheet {
  height: 136px;
  width: 100%;
  background-color: var(--color-12-primary);
}
</style>
