<template>
  <v-card>
    <dialog-toolbar :title="`${$t('Export to email')}: ${$t(reportName)}`" />
    <v-card-text class="py-0">
      <empty-view
        :header="$t('Please check your email')"
        :description-rows="[$t('Your report is being prepared and will be sent with download instructions.'), $t('Larger reports may take longer.')]"
        img-url="export-custom-report"
      />
    </v-card-text>
    <v-card-actions>
      <v-spacer />
      <evocon-v-button
        :text="$t('Close')"
        @click="onCloseClick"
      />
    </v-card-actions>
  </v-card>
</template>

<script setup name="ReportsExportInfoDialog">
import { computed } from 'vue';

import { useGenericDialogStore } from '@/stores';
import EmptyView from '@/components/atoms/EmptyView/index.vue';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import DialogToolbar from '@/components/atoms/DialogToolbar/index.vue';

const genericDialogStore = useGenericDialogStore();

const reportName = computed(() => genericDialogStore.dialogData.reportName);

function onCloseClick() {
  genericDialogStore.closeDialog();
}
</script>
