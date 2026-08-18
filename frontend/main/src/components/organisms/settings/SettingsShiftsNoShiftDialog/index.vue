<template>
  <dialog-template
    :title="t('No shift')"
  >
    <template #content>
      <evocon-v-table
        v-model:options="options"
        :headers="getNoshiftsTableHeaders(false, selectedFactoryAllowedStationIds)"
        :items="currentNoShiftDeviations"
        :loading="noShiftDeviationsLoading"
        width="auto"
        height="auto"
        are-rows-clickable
        hide-default-footer
      />
    </template>
    <template #actions>
      <v-spacer />
      <evocon-v-button
        id="cancel-button"
        :text="t('Close')"
        type="secondary"
        @click="closeDialog"
      />
    </template>
  </dialog-template>
</template>
<script setup>
import { useI18n } from 'vue-i18n';
import { reactive, computed, onMounted } from 'vue';

import useGenericDialogStore from '@/stores/genericDialog';
import useStationStore from '@/stores/station';
import useDeviceStore from '@/stores/device';
import DialogTemplate from '@/components/templates/DialogTemplate/index.vue';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import EvoconVTable from '@/components/molecules/EvoconVTable/index.vue';
import getNoshiftsTableHeaders from '@/components/pages/settings/SettingsShiftsEdit/noshiftTableHeadersConf.js';
import useNoShiftDeviations from '@/components/pages/settings/SettingsShiftsEdit/useNoShiftDeviations';

const genericDialogStore = useGenericDialogStore();
const stationStore = useStationStore();
const deviceStore = useDeviceStore();
const { t } = useI18n();
const dialogData = computed(() => genericDialogStore.dialogData);
const templateId = computed(() => dialogData.value?.id || null);
const { loadNoShiftDeviations, noShiftDeviationsLoading, currentNoShiftDeviations } = useNoShiftDeviations(templateId, { value: true });

onMounted(() => {
  loadNoShiftDeviations();
});

const selectedFactoryAllowedStationIds = computed(() => stationStore.getSelectedFactoryAllowedStations(dialogData.value.factoryIds, dialogData.value.stationIds, 'id'));
const options = reactive({
  sortBy: { key: 'startDay', order: 'desc' },
  itemsPerPage: -1,
});

const isMobileView = computed(() => deviceStore.isMobileView);

const closeDialog = () => genericDialogStore.closeDialog();

</script>
