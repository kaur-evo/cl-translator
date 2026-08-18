<template>
  <dialog-toolbar :title="$t('Batches overview')" />
  <v-card-text class="pa-0">
    <batch-overview-content :tab="dialogData.tab" scrollable />
  </v-card-text>
  <v-card-actions :class="{ 'fullscreen-card-actions': showFullscreenDialogs }">
    <v-spacer />
    <evocon-v-button
      :text="$t('Close')"
      type="secondary"
      @click="closeDialog"
    />
  </v-card-actions>
</template>
<script setup name="BatchOverviewDialog">
import { computed } from 'vue';

import DialogToolbar from '@/components/atoms/DialogToolbar/index.vue';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import BatchOverviewContent from '@/components/organisms/shiftview/BatchOverviewContent/index.vue';
import { useDeviceStore, useGenericDialogStore } from '@/stores/index';

const deviceStore = useDeviceStore();
const genericDialogStore = useGenericDialogStore();
const dialogData = computed(() => genericDialogStore.dialogData);
const showFullscreenDialogs = computed(() => deviceStore.showFullscreenDialogs);
const closeDialog = () => genericDialogStore.closeDialog();
</script>
