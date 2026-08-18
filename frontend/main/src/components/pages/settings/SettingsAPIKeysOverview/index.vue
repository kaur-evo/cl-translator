<template>
  <settings-entities-overview
    entity-name="apiKeys"
    :overview-header="$t('API keys')"
    :filter-configuration="createFilterConfiguration()"
    :table-headers="createTableHeadersConf()"
    :items="tableAPIKeys"
    :primary-btn-text="$t('API key')"
    :primary-btn-action="onAddNewKey"
    status-key="enabled"
    :loading="isLoading"
    @on-dropdown-select="changeAPIKeyStatus"
    @on-delete-row-click="onDeleteKey"
  >
    <template #header-append>
      <icon-with-tooltip
        :icon="mdiInformationOutline"
        :tooltip-text="$t('Learn more')"
        additional-classes="ml-2 mt-2"
        :icon-clicked-fn="onOpenHelp"
      />
    </template>
  </settings-entities-overview>
</template>
<script setup name="APIKeysOverview">
import { defineAsyncComponent, onMounted, computed } from 'vue';
import { mdiInformationOutline } from '@mdi/js';

import i18n from '@/services/i18n';
import { formatTime } from '@/helpers/time/formatTime';
import { formatDate } from '@/helpers/date/formatDate';
import { calculateTimePassed } from '@/helpers/time/calculateTimePassed';
import IconWithTooltip from '@/components/atoms/IconWithTooltip/index.vue';
import { createFilterConfiguration } from '@/components/organisms/settings/SettingsFilterBar/FilterBarConfigurations/APIKeysFilterBarConf';
import { createTableHeadersConf } from '@/components/organisms/settings/SettingsEntitiesTable/TableConfigs/APIKeysTableHeadersConf';
import SettingsEntitiesOverview from '@/components/pages/settings/SettingsEntitiesOverview/index.vue';
import useAPIKeysStore from '@/stores/APIKeys';
import useUserStore from '@/stores/user';
import useGenericDialogStore from '@/stores/genericDialog';
import useConfirmDialogStore from '@/stores/confirmDialog';

const apiKeysStore = useAPIKeysStore();
const userStore = useUserStore();
const genericDialogStore = useGenericDialogStore();
const confirmDialogStore = useConfirmDialogStore();

onMounted(async () => {
  await apiKeysStore.fetchAPIKeys();
  await userStore.fetchUsers();
});

const isLoading = computed(() => apiKeysStore.isLoading);
const tableAPIKeys = computed(() => apiKeysStore.APIKeys.reduce((result, APIKey) => {
  const APIKeyObj = {
    ...APIKey,
    lastUsed: APIKey.lastUsedAt ? i18n.global.t('{variable} ago', { variable: calculateTimePassed(APIKey.lastUsedAt) }) : '-',
    formattedLastUsedAt: APIKey.lastUsedAt ? `${formatDate(APIKey.lastUsedAt, 'long')} ${formatTime(APIKey.lastUsedAt, 'short')}` : '',
    authorName: APIKey.createdBy === 'Evocon' ? APIKey.createdBy : (userStore.allUsersMap[APIKey.createdBy]?.fullName || ''),
    created: i18n.global.t('{variable} ago', { variable: calculateTimePassed(APIKey.createdAt) }),
    formattedCreatedAt: `${formatDate(APIKey.createdAt, 'long')} ${formatTime(APIKey.createdAt, 'short')}`,
  };
  result.push(APIKeyObj);
  return result;
}, []));

function onOpenHelp() {
  window.open('https://support.evocon.com/Using-API-keys-fea9b6e3c6214f6594d2b0e176d30171', '_blank');
}

function onAddNewKey() {
  genericDialogStore.openDialog({
    component: defineAsyncComponent(() => import('@/components/organisms/settings/SettingsAPIKeyDialog/index.vue')),
  });
}

function changeAPIKeyStatus(APIKey) {
  apiKeysStore.changeAPIKeyStatus({ APIKey, body: { enabled: APIKey.enabled } });
}

function onDeleteKey(APIKey) {
  const dialogConfig = {
    title: i18n.global.t('Confirmation'),
    text: i18n.global.t('Are you sure you want to delete {value}?', { value: APIKey.keyId }),
    action: () => {
      apiKeysStore.deleteAPIKey(APIKey.keyId);
    },
    confirmText: i18n.global.t('Delete'),
    cancelText: i18n.global.t('Cancel'),
  };
  confirmDialogStore.openConfirmDialog(dialogConfig);
}
</script>
