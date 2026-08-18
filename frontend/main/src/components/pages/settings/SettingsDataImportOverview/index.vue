<template>
  <form-page-template
    v-if="$route.name.endsWith('_dataImport')"
    id="data-import-overview"
    :primary-segment-title="$t('Data export and import')"
  >
    <template #primary-segment>
      <v-row>
        <v-col
          cols="12"
          class="px-1"
        >
          <settings-data-import-card
            :title="$t('Download existing data')"
            :order-number="'1'"
            :description="$t('To get started, download your existing data. If there is no data yet, use the downloaded file as a template.')"
          >
            <template #action-details>
              <evocon-v-checkbox
                id="data-import-include-deleted-checkbox"
                v-model="includeDeleted"
                :label="$t('Include deleted data')"
                class="flex-shrink-1 flex-grow-0"
              />
              <icon-with-tooltip
                :icon="mdiInformationOutline"
                :tooltip-text="$t('Include previously deleted items in the spreadsheet.')"
                additional-classes="ml-2"
              />
            </template>
            <template #action-button>
              <evocon-v-button
                :disabled="!reportName"
                :loading="isLoading"
                :icon="mdiDownload"
                :text="$t('Download')"
                :color="'primary'"
                @click="downloadFile"
              />
            </template>
          </settings-data-import-card>
          <settings-data-import-card
            :title="$t('Edit existing data')"
            :order-number="'2'"
            :description="
              $t('Paste/type your new data into the relevant fields in the Excel spreadsheet. For the best compatibility, please use Microsoft Excel for editing and follow the formatting guidelines.')
            "
          >
            <template #action-button>
              <evocon-v-button
                :icon="mdiSchool"
                color="quaternary-dark"
                :text="$t('Guide')"
                :href="guideLink"
                :target="'_blank'"
              />
            </template>
          </settings-data-import-card>
          <settings-data-import-card
            :title="$t('Import updated file back')"
            :order-number="'3'"
            :description="$t('After making necessary changes, upload the .xlsx file back to Evocon. Contact support if you need to restore to the previous version.')"
          >
            <template #action-button>
              <evocon-v-button
                :icon="mdiUpload"
                :text="$t('Upload')"
                :color="'primary'"
                @click="routeToDataImportUpload"
              />
            </template>
          </settings-data-import-card>
        </v-col>
      </v-row>
    </template>
  </form-page-template>
  <router-view v-else />
</template>

<script>
import {
  mdiDownload,
  mdiUpload,
  mdiInformationOutline,
  mdiSchool,
} from '@mdi/js';
import { mapState, mapActions } from 'pinia';

import EvoconVCheckbox from '@/components/atoms/EvoconVCheckbox/index.vue';
import IconWithTooltip from '@/components/atoms/IconWithTooltip/index.vue';
import FormPageTemplate from '@/components/templates/FormPageTemplate/index.vue';
import SettingsDataImportCard from '@/components/organisms/settings/SettingsDataImportCard/index.vue';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import useSettingsFileUploadStore from '@/stores/settingsFileUpload';
import useGenericNotificationStore from '@/stores/genericNotification';

const vectorIcons = {
  mdiDownload,
  mdiUpload,
  mdiInformationOutline,
  mdiSchool,
};
export default {
  name: 'SettingsDataImportOverview',
  components: {
    FormPageTemplate,
    SettingsDataImportCard,
    EvoconVCheckbox,
    EvoconVButton,
    IconWithTooltip,
  },
  data() {
    return {
      ...vectorIcons,
      includeDeleted: false,
    };
  },
  computed: {
    ...mapState(useSettingsFileUploadStore, ['isLoading']),
    reportName() {
      return this.$route.query.reportName || '';
    },
    guideLink() {
      if (this.reportName === 'StopReasonExport') return 'https://support.evocon.com/Stop-reasons-export-import-177dae0ba80280d0a94ec2a55f3aeaa4';
      return 'https://support.evocon.com/Product-data-export-import-136dae0ba8028033bd83f843d31f0c6c';
    },
  },
  methods: {
    ...mapActions(useSettingsFileUploadStore, ['exportFile']),
    ...mapActions(useGenericNotificationStore, ['notifyError']),
    async downloadFile() {
      const params = { reportName: this.reportName, includeDeleted: this.includeDeleted, reportId: this.$route.path.split('/')[2] };
      try {
        await this.exportFile(params);
      } catch ({ code }) {
        if (code === 'ECONNABORTED') { // timeout
          await this.$router.push({ path: `${this.$route.path}/timeout`, query: { reportName: this.reportName }, params: { ...this.$route.params } });
        } else {
          this.notifyError(this.$t('Error occurred while trying to export {reportName}', { reportName: this.reportName }));
        }
      }
    },
    routeToDataImportUpload() {
      this.$router.push({ path: `${this.$route.path}/upload`, query: { reportName: this.reportName } });
    },
  },
};
</script>
