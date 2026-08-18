<template>
  <dialog-template :title="$t('Share dashboard')">
    <template #content>
      <div class="mx-2">
        <v-stepper :model-value="step" class="mb-2">
          <v-stepper-header>
            <v-stepper-item
              color="primary"
              :value="1"
            >
              {{ $t('Tabs') }}
            </v-stepper-item>
            <v-divider />
            <v-stepper-item
              color="primary"
              :value="2"
            >
              {{ $t('Users') }}
            </v-stepper-item>
          </v-stepper-header>
        </v-stepper>
        <template v-if="isFirstPage">
          <selection-list
            v-model="selectedTabIds"
            :items="dashboardTabs"
            :max-height="listHeight"
            :height="'auto'"
            item-value="id"
            item-text="name"
            hide-search
          />
        </template>
        <template v-if="isSecondPage">
          <share-dashboard-dialog-filter
            ref="filterRef"
            :filter="filter"
            @update:filter="onUpdateFilter"
            @update:input-chip-opened="calculateListHeight"
          />
          <div v-if="isUsersRequestLoading" class="d-flex justify-center align-center" :style="{ height: listHeight }">
            <v-progress-circular
              color="primary"
              indeterminate
            />
          </div>
          <selection-list
            v-else-if="filteredUsersList.length > 0"
            v-model="selectedUserIds"
            :items="filteredUsersList"
            :search="filter.search"
            :max-height="listHeight"
            :height="'auto'"
            item-secondary-text="formattedRoles"
            :item-disabled="(user) => isUserDisabled(user)"
            item-value="username"
            item-text="fullName"
            class="disabled-list-item-with-icon"
            hide-search
          >
            <template #primary-title-append="{ item }">
              <icon-with-tooltip
                v-if="isUserDisabled(item)"
                :icon="mdiAlertOutline"
                :tooltip-text="$t('Data cannot be shared due to conflict in user permissions.')"
                additional-classes="ml-2"
                color="secondary"
              />
            </template>
          </selection-list>
          <empty-view
            v-else
            :header="$t('No results')"
            :description="$t('Please try again with other settings.')"
            img-url="no-filter-results"
            img-width="290px"
          />
        </template>
      </div>
    </template>
    <template #actions>
      <evocon-v-button
        v-if="isSecondPage"
        :icon="mdiArrowLeft"
        :text="$t('Back')"
        @click="onBackClick"
      />
      <v-spacer />
      <evocon-v-button
        :text="$t('Cancel')"
        @click="closeDialog"
      />
      <evocon-v-button
        v-if="isFirstPage"
        :text="$t('Continue')"
        type="primary-light"
        :disabled="!selectedTabIds.length"
        @click="onContinueClick"
      />
      <evocon-v-button
        v-else
        :text="$t('Share')"
        color="primary"
        :loading="loading"
        :disabled="!selectedUserIds.length"
        @click="onShareClick"
      />
    </template>
  </dialog-template>
</template>
<script setup name="ShareDashboardDialog">
import {
  ref, reactive, computed, onMounted, watch,
} from 'vue';
import { useDisplay } from 'vuetify';
import { mdiArrowLeft, mdiAlertOutline } from '@mdi/js';

import {
  SYS_ADMIN, LINEVIEW_USER, FACTORY_ADMIN, COMPANY_ADMIN, OFFICE_USER,
} from '@/constants/userRoles';
import { DIALOG_HEIGHT_PTC } from '@/constants/dialog';
import i18n from '@/services/i18n';
import dashboardApi from '@/api/dashboardApi';
import getFormattedUserRoles from '@/helpers/users/getFormattedUserRoles';
import getFAUserStationIds from '@/helpers/users/getFAUserStationIds';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import EmptyView from '@/components/atoms/EmptyView/index.vue';
import IconWithTooltip from '@/components/atoms/IconWithTooltip/index.vue';
import SelectionList from '@/components/molecules/SelectionList/index.vue';
import ShareDashboardDialogFilter from '@/components/organisms/dashboard/ShareDashboardDialogFilter/index.vue';
import DialogTemplate from '@/components/templates/DialogTemplate/index.vue';
import {
  useDeviceStore, useDashboardConfigStore, useFactoryStore, useUserStore,
  useGenericDialogStore, useGenericNotificationStore, useConfirmDialogStore,
} from '@/stores/index';

const deviceStore = useDeviceStore();
const dashboardConfigStore = useDashboardConfigStore();
const factoryStore = useFactoryStore();
const userStore = useUserStore();
const genericDialogStore = useGenericDialogStore();
const genericNotificationStore = useGenericNotificationStore();
const confirmDialogStore = useConfirmDialogStore();
const display = useDisplay();

const filterRef = ref(null);
const listHeight = ref('0px');
const loading = ref(false);
const step = ref(1);
const selectedTabIds = ref([]);
const selectedUserIds = ref([]);
const filter = reactive({
  search: '',
  factoryIds: [],
  stationIds: [],
  roles: [],
});

const isFirstPage = computed(() => step.value === 1);
const isSecondPage = computed(() => step.value === 2);
const isHandheldDevice = computed(() => display.smAndDown.value);
const showFullscreenDialogs = computed(() => deviceStore.showFullscreenDialogs);
const dashboardTabs = computed(() => dashboardConfigStore.pages);
const factoriesMap = computed(() => factoryStore.factoriesMap);
const isUsersRequestLoading = computed(() => userStore.isLoading);
const selectedTabWidgets = computed(() => dashboardConfigStore.widgets.filter((widget) => selectedTabIds.value.includes(widget.pageId)));
const selectedTabStationIds = computed(() => [...new Set(selectedTabWidgets.value.reduce((acc, widget) => acc.concat(widget.config.stationId), []))]);
const selectedTabFactoryIds = computed(() => [...new Set(selectedTabWidgets.value.reduce((acc, widget) => acc.concat(widget.config.factoryId), []))]);

const visibleUsers = computed(() => userStore.users.filter((user) => !Object.values(user.roles).includes(SYS_ADMIN) && !Object.values(user.roles).includes(LINEVIEW_USER)));
const formattedVisibleUsers = computed(() => visibleUsers.value.map((user) => ({ ...user, formattedRoles: getFormattedUserRoles(user.roles) })));

const filteredUsersList = computed(() => {
  const searchRule = (user) => !filter.search.length || user.fullName.toLowerCase().includes(filter.search.toLowerCase());
  const factoryFilterRule = (user) => !filter.factoryIds.length || user.allowedFactories[0] === 0 || user.allowedFactories?.some((factoryId) => filter.factoryIds.includes(factoryId));
  const stationFilterRule = (user) => !filter.stationIds.length || user.allowedStations[0] || Object.keys(user.allowedStations).some((id) => filter.stationIds.includes(Number(id)));
  const roleFilterRule = (user) => !filter.roles.length || Object.values(user.roles).some((role) => filter.roles.includes(role));
  return formattedVisibleUsers.value.filter((user) => searchRule(user) && factoryFilterRule(user) && stationFilterRule(user) && roleFilterRule(user));
});

const calculateListHeight = () => {
  const dialogHeightConstant = showFullscreenDialogs.value ? 1 : DIALOG_HEIGHT_PTC;
  const dialogHeight = display.height.value * dialogHeightConstant;
  const headerHeight = 64;
  const stepperHeight = 60;
  const filterBarHeight = isSecondPage.value ? filterRef.value?.$el?.getBoundingClientRect()?.height : 0;
  // eslint-disable-next-line no-magic-numbers
  const actionsHeight = isHandheldDevice.value ? 52 : 60;
  const listPaddings = 16;
  listHeight.value = `${dialogHeight - headerHeight - stepperHeight - filterBarHeight - actionsHeight - listPaddings}px`;
};

const onUpdateFilter = (newState) => {
  Object.assign(filter, newState);
  calculateListHeight();
};

const closeDialog = () => {
  genericDialogStore.closeDialog();
};

const onBackClick = () => {
  step.value = 1;
  selectedUserIds.value = [];
  calculateListHeight();
};

const onContinueClick = () => {
  step.value = 2;
  calculateListHeight();
};

const onShareDashboardTabs = async () => {
  const requestBody = {
    dashboard: {
      pages: dashboardTabs.value.filter((tab) => selectedTabIds.value.includes(tab.id)),
      widgets: selectedTabWidgets.value,
    },
    receivers: selectedUserIds.value,
  };
  loading.value = true;
  try {
    await dashboardApi.shareDashboardTabs(requestBody);
    genericNotificationStore.notifySuccess(i18n.global.t('Shared successfully'));
    closeDialog();
  } catch {
    genericNotificationStore.notifyError(i18n.global.t('We are sorry! There is a problem with your request'));
  } finally {
    loading.value = false;
  }
};

const onShareClick = () => {
  const dialogConfig = {
    title: i18n.global.t('Confirmation'),
    text: i18n.global.t('You are about to share your dashboard. This action cannot be undone. Do you want to proceed?'),
    action: async () => {
      await onShareDashboardTabs();
    },
    color: 'primary',
    confirmText: i18n.global.t('Share'),
    cancelText: i18n.global.t('Cancel'),
  };
  confirmDialogStore.openConfirmDialog(dialogConfig);
};

const isUserDisabled = (user) => {
  const allowedStationIds = [];
  const userRoles = [...new Set(Object.values(user.roles))];
  const isCompanyAdmin = userRoles.includes(COMPANY_ADMIN);
  if (userRoles.includes(FACTORY_ADMIN)) {
    const FAUserStationIds = getFAUserStationIds(user.roles, factoriesMap.value);
    allowedStationIds.push(...FAUserStationIds);
  }
  if (userRoles.includes(OFFICE_USER)) {
    allowedStationIds.push(...Object.keys(user.allowedStations).map((id) => Number(id)));
  }
  const hasRestrictedStations = selectedTabStationIds.value.some((stationId) => !allowedStationIds.includes(stationId));
  const hasRestrictedFactories = !selectedTabStationIds.value.length && user.allowedFactories?.[0] !== 0 && selectedTabFactoryIds.value.some((factoryId) => !user.allowedFactories.includes(factoryId));
  return !isCompanyAdmin && (hasRestrictedStations || hasRestrictedFactories);
};

watch(() => isHandheldDevice.value, () => {
  calculateListHeight();
});

watch(() => showFullscreenDialogs.value, () => {
  calculateListHeight();
});

onMounted(async () => {
  calculateListHeight();
  if (!visibleUsers.value.length) await userStore.fetchUsers();
});
</script>
