<template>
  <settings-activity-logs-template
    entity-name="settingsActivityLogs"
    header-selection-key="settings"
    :overview-header="$t('Settings logs')"
    :filter-configuration="filterConfiguration"
    :table-headers="createSettingsLogsTableHeadersConf(selectedEntity)"
    :inner-header="$t('Settings logs')"
    help-url="https://support.evocon.com/Activity-logs-Settings-1d5dae0ba8028038b665fc472087f908"
    @link-click="onLinkClick"
    @modify-entity-param="modifyEntityParam"
  />
</template>
<script setup name="SettingsActivityLogsSettingsOverview">
import { computed, watch } from 'vue';

import { entities, entityUrlParams } from '@/constants/activityLogsConstants';
import { createSettingsFilterConfiguration } from '@/components/organisms/settings/SettingsFilterBar/FilterBarConfigurations/activityLogsFilterBarConf';
import { createSettingsLogsTableHeadersConf } from '@/components/organisms/settings/SettingsEntitiesTable/TableConfigs/activityLogTableHeadersConf';
import SettingsActivityLogsTemplate from '@/components/templates/SettingsActivityLogsTemplate/index.vue';
import useFilterbarStore from '@/stores/filterbar';
import useProfileStore from '@/stores/profile';
import useFeatureStore from '@/stores/feature';
import useUserStore from '@/stores/user';
import useChecklistTemplateStore from '@/stores/checklistTemplate';
import useShiftTemplateStore from '@/stores/shiftTemplate';

const filterbarStore = useFilterbarStore();
const profileStore = useProfileStore();
const featureStore = useFeatureStore();
const userStore = useUserStore();
const checklistTemplateStore = useChecklistTemplateStore();
const shiftTemplateStore = useShiftTemplateStore();

const requestFilterState = computed(() => filterbarStore.requestFilterState);
const selectedEntity = computed(() => requestFilterState.value.entity?.[0]);
const firstDayOfWeek = computed(() => profileStore.firstDayOfWeek);
const checklistsEnabled = computed(() => featureStore.checklistsEnabled);
const securitySettingsEnabled = computed(() => featureStore.securitySettingsEnabled);
const filterConfiguration = computed(
  () => createSettingsFilterConfiguration(firstDayOfWeek.value, checklistsEnabled.value, securitySettingsEnabled.value),
); // moving it here for reactivity due to checklistsEnabled config check

const modifyEntityParam = async (prevEntity, newEntity) => {
  filterbarStore.removeFilter(prevEntity);
  if (newEntity) filterbarStore.updateFilterValue({ [newEntity]: [] });
  await filterbarStore.triggerDataRequest();
};

const onSelectedEntityChange = (entity) => {
  if (entity === entities.CHECKLIST_GROUP) {
    checklistTemplateStore.fetchChecklistGroups();
  } else if (entity === entities.CHECKLIST) {
    checklistTemplateStore.fetchChecklistGroups();
    checklistTemplateStore.fetchChecklists();
  } else if (entity === entities.USER) {
    userStore.fetchUsers();
  } else if (entity === entities.SHIFT) {
    shiftTemplateStore.fetchShiftTemplates();
  }
};

watch(() => selectedEntity.value, onSelectedEntityChange);

const onLinkClick = (item) => {
  if (item.entity.entityType === entities.SECURITY) {
    if (item.entity.reference === 'Allowed IPs') {
      window.open('#/settings/security/allowedips', '_blank');
    } else if (item.entity.reference === 'Security Profiles') {
      window.open('#/settings/security/securityprofiles', '_blank');
    }
  }
  if (item.entity.entityType.includes('GROUP')) window.open(`#/settings/${entityUrlParams[item.entity.entityType]}?isGroupEdit=true&id=${item.entity.id}`, '_blank');
  else {
    const itemId = item.entity.entityType === entities.USER ? item.entity.reference : item.entity.id;
    window.open(`#/settings/${entityUrlParams[item.entity.entityType]}/${itemId}/edit`, '_blank');
  }
};
</script>
