<template>
  <dialog-template :title="$t('View settings')">
    <template #content>
      <selection-input
        v-model="visibleColumns"
        :items="activeTableHeaders"
        hide-search
        item-text="text"
        :prepend-inner-icon="mdiViewColumn"
        :prepend-text="`${$t('Columns')}:`"
        :item-disabled="(item) => item.id === activeTableHeaders[0].id"
      />
      <selection-input
        v-if="showDurationFormatSelection"
        :items="getDurationFormatsArray()"
        :model-value="[selectedDurationFormat]"
        hide-search
        is-single-select
        item-text="text"
        :prepend-inner-icon="mdiDecimal"
        :prepend-text="`${$t('Time format')}:`"
        menu-input-class="mt-4"
        required
        @update:model-value="selectedDurationFormat = $event[0]"
      />
    </template>
    <template #actions>
      <v-spacer />
      <evocon-v-button
        :text="$t('Close')"
        size="small"
        @click="onCloseDialog"
      />
      <evocon-v-button
        :text="$t('Apply')"
        color="primary"
        class="ml-2"
        size="small"
        @click="onApply"
      />
    </template>
  </dialog-template>
</template>
<script setup name="ReportsViewSettings">
import {
  ref, computed, onMounted, watch,
} from 'vue';
import { mdiViewColumn, mdiDecimal } from '@mdi/js';

import { useDeviceStore, useFilterbarStore, useGenericDialogStore, useProfileStore, useReportsConfigStore } from '@/stores';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import SelectionInput from '@/components/molecules/SelectionInput/index.vue';
import DialogTemplate from '@/components/templates/DialogTemplate/index.vue';
import { getDurationFormatsArray } from '@/constants/durationFormat';
import ConfigType from '@/stores/reportsConfig/constants/configType';
import getTableHeadersConfig from '@/stores/reportsConfig/configurations/tableHeadersConfig';

const deviceStore = useDeviceStore();
const filterbarStore = useFilterbarStore();
const genericDialogStore = useGenericDialogStore();
const profileStore = useProfileStore();
const reportsConfigStore = useReportsConfigStore();

const visibleColumns = ref([]);
const selectedDurationFormat = ref(null);

const isMobileView = computed(() => deviceStore.isMobileView);

const activeTableHeaders = computed(() => {
  const headers = reportsConfigStore.activeHeaders(getTableHeadersConfig({
    granularity: reportsConfigStore.granularity,
    groupBy: reportsConfigStore.groupBy,
    configType: reportsConfigStore.configType,
    language: profileStore.language,
    durFormatType: null,
  }));
  return headers.filter((header) => !header.isHidden);
});

const visibleHeaders = computed(() => {
  const requestValues = filterbarStore.requestFilterState.visibleColumns;
  return activeTableHeaders.value.reduce((acc, header, index) => {
    if (index === 0 || requestValues.includes(header.id)) {
      acc.push(header.id);
    }
    return acc;
  }, []);
});

const showDurationFormatSelection = computed(() => ![ConfigType.QUANTITY, ConfigType.OEE].includes(reportsConfigStore.configType));

const reportsDurationFormat = computed(() => profileStore.reportsDurationFormat);

const onCloseDialog = () => {
  genericDialogStore.closeDialog();
};

const onApply = () => {
  filterbarStore.updateFilterValue({ visibleColumns: visibleColumns.value });
  filterbarStore.triggerDataRequest();
  profileStore.updateCurrentUser({ reportingTimeFormat: selectedDurationFormat.value });
  onCloseDialog();
};

watch(isMobileView, (newVal, prevVal) => {
  if (prevVal) onCloseDialog();
});

onMounted(() => {
  visibleColumns.value = visibleHeaders.value;
  selectedDurationFormat.value = reportsDurationFormat.value;
});
</script>
