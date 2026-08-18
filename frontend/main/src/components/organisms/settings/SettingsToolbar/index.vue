<template>
  <main-app-toolbar :has-back-button="hasBackButton">
    <template v-if="(isOverviewOpen || props.moduleName === 'profile') && isMobileView" #toolbar-selection>
      <settings-side-menu @info-btn-clicked="onOpenHelp" />
    </template>
    <template #toolbar-action>
      <div
        v-if="isExportSettingsVisible"
        class="export-settings"
        :class="{ 'export-settings--small': isBreakpointSmAndDown }"
      >
        <evocon-v-tooltip-wrap :text="$t('Export data')">
          <!-- eslint-disable-next-line vue/no-template-shadow -->
          <template #activator="{ props }">
            <evocon-v-button
              v-bind="props"
              :icon="mdiDownload"
              :loading="customReportsLoading.Settings_Export"
              :color="customReportsLoading.Settings_Export ? 'primary' : 'white'"
              @click="onExportSettings"
            />
          </template>
        </evocon-v-tooltip-wrap>
      </div>
      <evocon-v-button
        v-else-if="isMobileView && $route.name === 'deviceOverview'"
        size="small"
        :text="$t('Contact support')"
        variant="tonal"
        @click="openSupportDialog"
      />
      <menu-with-button-activator
        v-else-if="isMobileView && toolbarMenuItems[moduleName]?.length > 1 && isOverviewOpen"
        :items="toolbarMenuItems[moduleName]"
        :button-icon="mdiPlus"
        button-icon-color="white"
        button-type="secondary"
        list-width="auto"
        min-width="40px"
        max-width="351px"
        theme="light"
        class="mr-1"
        size="default"
        @item-clicked="onMenuButtonClick"
      />
      <evocon-v-button
        v-else-if="isMobileView && toolbarMenuItems[moduleName]?.length === 1 && isOverviewOpen"
        :icon="mdiPlus"
        size="default"
        icon-color="white"
        @click="onMenuButtonClick(toolbarMenuItems[moduleName][0])"
      />
    </template>
  </main-app-toolbar>
</template>
<script setup name="SettingsMobileToolbar">
import { useDisplay } from 'vuetify';
import { useRoute, useRouter } from 'vue-router';
import { computed, defineAsyncComponent } from 'vue';
import { mdiDownload, mdiPlus } from '@mdi/js';

import i18n from '@/services/i18n';
import openSupportDialog from '@/helpers/support/openSupportDialog';
import useDeviceStore from '@/stores/device';
import useProfileStore from '@/stores/profile';
import useCustomReportStore from '@/stores/customReport';
import useGenericDialogStore from '@/stores/genericDialog';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import EvoconVTooltipWrap from '@/components/atoms/EvoconVTooltipWrap/index.vue';
import SettingsSideMenu from '@/components/organisms/settings/SettingsSideMenu/index.vue';
import MenuWithButtonActivator from '@/components/molecules/MenuWithButtonActivator/index.vue';
import MainAppToolbar from '@/components/organisms/MainAppToolbar/index.vue';

const deviceStore = useDeviceStore();
const profileStore = useProfileStore();
const customReportStore = useCustomReportStore();
const genericDialogStore = useGenericDialogStore();
const route = useRoute();
const router = useRouter();

const props = defineProps({
  moduleName: { type: String, default: '' },
  isSettingsMainView: { type: Boolean },
  isOverviewOpen: { type: Boolean },
});


const isMobileView = computed(() => deviceStore.isMobileView);
const highestRoleAllows = computed(() => profileStore.highestRoleAllows);
const customReportsLoading = computed(() => customReportStore.customReportsLoading);

const isBreakpointSmAndDown = computed(() => useDisplay().smAndDown.value);
const isExportSettingsVisible = computed(() => props.isSettingsMainView && highestRoleAllows.value('exportSettings') && !isMobileView.value);

const hasBackButton = computed(() => !isMobileView.value && highestRoleAllows.value('settings'));

const addNewTag = () => {
  genericDialogStore.openDialog({
    component: defineAsyncComponent(() => import('@/components/organisms/settings/SettingsTagEditForm/index.vue')),
    allowFullscreen: true,
  });
};

const addNewAPIKey = () => {
  genericDialogStore.openDialog({
    component: defineAsyncComponent(() => import('@/components/organisms/settings/SettingsAPIKeyDialog/index.vue')),
    allowFullscreen: true,
  });
};

const onMenuButtonClick = (item) => {
  if (props.moduleName === 'tags') addNewTag();
  else if (props.moduleName === 'apiKeys') addNewAPIKey();
  else if (item.id === 'group') router.push({ query: { ...route.query, isGroupEdit: 'true' } });
  else router.push({ name: `${props.moduleName}Edit`, query: { ...route.query } });
};

const toolbarMenuItems = computed(() => ({
  user: [{ id: 'entity', name: i18n.global.t('User') }],
  operator: [{ id: 'entity', name: i18n.global.t('operator') }],
  comment: [{ id: 'group', name: i18n.global.t('Group') }, { id: 'entity', name: i18n.global.t('Reason') }],
  perfComment: [{ id: 'group', name: i18n.global.t('Group') }, { id: 'entity', name: i18n.global.t('Reason') }],
  scrapReason: [{ id: 'group', name: i18n.global.t('Group') }, { id: 'entity', name: i18n.global.t('Reason') }],
  station: [{ id: 'group', name: i18n.global.t('Group') }],
  position: [{ id: 'entity', name: i18n.global.t('Machine location') }],
  product: [{ id: 'group', name: i18n.global.t('Group') }, { id: 'entity', name: i18n.global.t('Product') }],
  shiftTemplate: [{ id: 'entity', name: i18n.global.t('Shift') }],
  alert: [{ id: 'entity', name: i18n.global.t('Alert') }],
  checklistTemplate: [{ id: 'group', name: i18n.global.t('Group') }, { id: 'entity', name: i18n.global.t('Checklist') }],
  tags: [{ id: 'entity', name: i18n.global.t('Tag') }],
  apiKeys: [{ id: 'entity', name: i18n.global.t('API key') }],
}));

const onExportSettings = () => customReportStore.downloadCustomReport({ reportName: 'Settings_Export' });

const onOpenHelp = () => {
  if (props.moduleName === 'position') window.open('https://support.evocon.com/Using-locations-for-production-stop-reasons-6cce1437ebed42c0b133c45e0a031005', '_blank');
  else if (props.moduleName === 'shiftTemplate') window.open('https://support.evocon.com/Managing-work-shifts-a0109b9479f94f4888605419fa3170ce', '_blank');
  else if (props.moduleName === 'alert') window.open('https://support.evocon.com/Managing-alerts-2d9209b4286642ffa42e92845944017e', '_blank');
  else if (props.moduleName === 'apiKeys') window.open('https://support.evocon.com/Using-API-keys-fea9b6e3c6214f6594d2b0e176d30171', '_blank');
};
</script>
<style lang="scss" scoped>
.export-settings {
  margin-right: 80px !important; // 64px side menu + 16px
  &--small {
    margin-right: 16px !important;
  }
}
</style>
