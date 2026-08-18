<template>
  <settings-security-wrapper
    v-if="$route.name === 'allowedIPsOverview'"
    :sections="[{ title: $t('Allowed IPs'), items: clonedAllowedIPs }]"
    :is-loading="loading"
  >
    <template #items=" { items }">
      <tiny-cards-list
        v-if="items.length"
        :items="items"
        :card-buttons="cardListButtons"
        title-text-key="ipAddress"
        :subtitle-key-value-pairs="getSubtitleKeyValuePairs"
        class="mx-4"
      >
        <template #title-append="{ item }">
          <v-icon
            v-if="item.ipAddress === currentUserIP"
            :icon="mdiWifi"
            color="success"
            size="x-small"
            class="ml-2"
          />
        </template>
      </tiny-cards-list>
      <empty-view
        v-else
        :description="$t('No IPs added, all connections are allowed.')"
        :secondary-btn="$t('IP address')"
        :secondary-btn-icon="mdiPlus"
        secondary-btn-color="primary"
        :secondary-btn-type="savedAllowedIPs.length ? 'primary-light' : 'primary'"
        img-url="allowed-ips"
        @secondary-btn-clicked="onEdit"
      />
      <evocon-v-button
        v-if="items.length"
        :text="$t('IP address')"
        type="primary-light"
        :icon="mdiPlus"
        class="ml-4 mt-2"
        @click="onEdit"
      />
      <v-card-actions>
        <v-spacer />
        <evocon-v-button
          :text="$t('Cancel')"
          type="secondary"
          @click="onCancelClick"
        />
        <evocon-v-button
          v-if="items.length || savedAllowedIPs.length"
          :text="$t('Save')"
          color="primary"
          :loading="loading"
          :disabled="!haveIPsChanged"
          @click="onSave"
        />
      </v-card-actions>
    </template>
  </settings-security-wrapper>
  <router-view v-else />
</template>
<script setup name="SettingsAllowedIPsOverview">
import { defineAsyncComponent, ref, computed, onMounted } from 'vue';
import { mdiPlus, mdiPencil, mdiDelete, mdiWifi, mdiAlert } from '@mdi/js';
import { useRouter, onBeforeRouteLeave } from 'vue-router';
import { isEqual, cloneDeep } from 'lodash';

import i18n from '@/services/i18n';
import allowedIPsApi from '@/api/allowedIPsApi';
import EmptyView from '@/components/atoms/EmptyView/index.vue';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import TinyCardsList from '@/components/molecules/TinyCardsList/index.vue';
import SettingsSecurityWrapper from '@/components/templates/SettingsSecurityWrapper/index.vue';
import useProfileStore from '@/stores/profile';
import useGenericDialogStore from '@/stores/genericDialog';
import useGenericNotificationStore from '@/stores/genericNotification';
import useConfirmDialogStore from '@/stores/confirmDialog';

const profileStore = useProfileStore();
const genericDialogStore = useGenericDialogStore();
const genericNotificationStore = useGenericNotificationStore();
const confirmDialogStore = useConfirmDialogStore();
const router = useRouter();

const clonedAllowedIPs = ref([]);
const currentUserIP = ref('');
const savedAllowedIPs = ref([]);
const loading = ref(false);

const visibleUserRoles = computed(() => profileStore.visibleUserRoles);
const leaveWithoutChangesConfirmed = ref(false);

const haveIPsChanged = computed(() => !isEqual(savedAllowedIPs.value, clonedAllowedIPs.value));

const cardListButtons = computed(() => [
  {
    icon: mdiPencil,
    text: i18n.global.t('Edit'),
    tooltip: i18n.global.t('Edit'),
    action: onEdit,
  },
  {
    icon: mdiDelete,
    text: i18n.global.t('Delete'),
    tooltip: i18n.global.t('Delete'),
    action: onDelete,
  },
]);

const getSubtitleKeyValuePairs = (item) => {
  const rolesValue = item.roles.length === visibleUserRoles.value.length
    ? i18n.global.t('All')
    : item.roles.map((role) => i18n.global.t(role)).join(', ');

  return [
    { key: i18n.global.t('Roles'), value: rolesValue },
    { key: i18n.global.t('Description'), value: item.description },
  ];
};

const onEdit = (props) => {
  genericDialogStore.openDialog({
    component: defineAsyncComponent(() => import('@/components/organisms/settings/SettingsAllowedIPDialog/index.vue')),
    data: {
      item: props?.item || {},
      IPWhitelist: clonedAllowedIPs.value,
      action: (data) => {
        if (props?.item) clonedAllowedIPs.value.splice(props.index, 1, data);
        else clonedAllowedIPs.value.push(data);
      },
    },
    allowFullscreen: true,
  });
};

const onDelete = ({ index }) => {
  clonedAllowedIPs.value.splice(index, 1);
};

const goBack = () => {
  router.push({ name: 'securityOverview' });
};

const promptSavingChanges = (navigateToPath) => {
  const confirmDialogConfig = {
    title: i18n.global.t('Confirmation'),
    text: i18n.global.t('You are about to exit without saving changes. Do you want to save changes?'),
    action: onSave,
    closeAction: () => {
      leaveWithoutChangesConfirmed.value = true;
      router.push({ path: navigateToPath });
    },
    confirmText: i18n.global.t('Save'),
    cancelText: i18n.global.t('Don\'t save'),
    color: 'primary',
  };
  confirmDialogStore.openConfirmDialog(confirmDialogConfig);
};

const onCancelClick = () => {
  if (haveIPsChanged.value && !leaveWithoutChangesConfirmed.value) {
    promptSavingChanges('/settings/security');
  } else {
    goBack();
  }
};

const fetchAllowedIPs = async () => {
  try {
    loading.value = true;
    savedAllowedIPs.value = await allowedIPsApi.getAllowedIPs();
  } catch {
    genericNotificationStore.notifyError(i18n.global.t('We are sorry! There is a problem with your request'));
  } finally {
    loading.value = false;
  }
};

const saveAllowedIPs = async (body) => {
  try {
    loading.value = true;
    savedAllowedIPs.value = await allowedIPsApi.saveAllowedIPs(body);
    genericNotificationStore.notifySuccess(i18n.global.t('Allowed IPs updated'));
  } catch {
    genericNotificationStore.notifyError(i18n.global.t('We are sorry! There is a problem with your request'));
  } finally {
    loading.value = false;
  }
};

const onSave = async () => {
  const confirmDialogConfig = {
    title: i18n.global.t('Confirmation'),
    text: i18n.global.t('Do you want Evocon to only be accessible from the specified IPs? Changes will take effect immediately.'),
    action: async () => {
      await saveAllowedIPs(clonedAllowedIPs.value);
      leaveWithoutChangesConfirmed.value = true;
      goBack();
    },
    color: 'secondary',
    primaryIcon: mdiAlert,
    confirmText: `${i18n.global.t('Yes')}, ${i18n.global.t('Save').toLowerCase()}`,
    cancelText: i18n.global.t('Cancel'),
  };
  await confirmDialogStore.openConfirmDialog(confirmDialogConfig);
};

onBeforeRouteLeave((to, from, next) => {
  if (haveIPsChanged.value && !leaveWithoutChangesConfirmed.value) {
    promptSavingChanges(to.fullPath);
  } else {
    next();
  }
});

onMounted(async () => {
  await fetchAllowedIPs();
  clonedAllowedIPs.value = cloneDeep(savedAllowedIPs.value);
  currentUserIP.value = await allowedIPsApi.getMyIP();
  profileStore.fetchVisibleRoles();
});
</script>
