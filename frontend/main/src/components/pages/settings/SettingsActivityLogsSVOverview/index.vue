<template>
  <settings-activity-logs-template
    entity-name="svActivityLogs"
    header-selection-key="shiftview"
    :overview-header="$t('Shift View logs')"
    :filter-configuration="createSVFilterConfiguration(firstDayOfWeek, defaultStationId, checklistsEnabled)"
    :table-headers="createSVTableHeadersConf()"
    :inner-header="$t('Shift View logs')"
    help-url="https://support.evocon.com/Activity-logs-Shift-View-218dae0ba802807ba432f846544f8246"
    @link-click="onLinkClick"
  />
</template>
<script setup name="SettingsActivityLogsSVOverview">
import { computed } from 'vue';

import { createSVFilterConfiguration } from '@/components/organisms/settings/SettingsFilterBar/FilterBarConfigurations/activityLogsFilterBarConf';
import { createSVTableHeadersConf } from '@/components/organisms/settings/SettingsEntitiesTable/TableConfigs/activityLogTableHeadersConf';
import SettingsActivityLogsTemplate from '@/components/templates/SettingsActivityLogsTemplate/index.vue';
import useProfileStore from '@/stores/profile';
import useStationStore from '@/stores/station';
import useFeatureStore from '@/stores/feature';

const profileStore = useProfileStore();
const stationStore = useStationStore();
const featureStore = useFeatureStore();

const firstDayOfWeek = computed(() => profileStore.firstDayOfWeek);
const defaultStationId = computed(() => stationStore.getDefaultStation()?.id);
const checklistsEnabled = computed(() => featureStore.checklistsEnabled);

const onLinkClick = (item) => {
  window.open(`#/shiftview/${item.station.id}/${item.shift.id}`, '_blank');
};
</script>
