<template>
  <generic-dialog
    :model-value="emailConfirmationOpen"
    :width="EMAIL_CONFIRMATION_DIALOG_WIDTH"
    @update:model-value="onClose"
  >
    <v-card-text class="py-0">
      <empty-view
        :header="$t('Generating AI summary. We\'ll send it to your e-mail shortly.')"
        img-url="export-custom-report"
        img-width="340px"
      />
    </v-card-text>
    <v-card-actions>
      <v-spacer />
      <evocon-v-button
        :text="$t('Close')"
        @click="onClose"
      />
    </v-card-actions>
  </generic-dialog>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';

import GenericDialog from '@/components/molecules/GenericDialog/index.vue';
import EmptyView from '@/components/atoms/EmptyView/index.vue';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import { EMAIL_CONFIRMATION_DIALOG_WIDTH } from '@/constants/aiInsights';
import { useAiInsightsStore } from '@/stores/index';

const aiInsightsStore = useAiInsightsStore();
const { emailConfirmationOpen } = storeToRefs(aiInsightsStore);

const onClose = () => {
  aiInsightsStore.closeEmailConfirmation();
};
</script>
