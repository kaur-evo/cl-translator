<template>
  <settings-toolbar
    :module-name="moduleName"
    :is-settings-main-view="isSettingsMainView"
    :is-overview-open="isOverviewOpen && !isGroupEdit"
  />
  <settings-main v-if="isSettingsMainView" />
  <div
    v-else
    class="d-flex px-4 fill-height bg-quaternary-dark"
    :class="{ 'py-4': isMobileView, 'py-8': !isMobileView }"
  >
    <settings-side-menu v-if="isSideMenuVisible" class="mr-4" />
    <div class="d-flex justify-center full-width">
      <router-view />
    </div>
  </div>
</template>

<script>
import { mapState } from 'pinia';

import useProfileStore from '@/stores/profile';
import useDeviceStore from '@/stores/device';
import SettingsMain from '@/components/pages/settings/SettingsMain/index.vue';
import SettingsToolbar from '@/components/organisms/settings/SettingsToolbar/index.vue';
import SettingsSideMenu from '@/components/organisms/settings/SettingsSideMenu/index.vue';


export default {
  name: 'SettingsWrapper',
  components: { SettingsMain, SettingsToolbar, SettingsSideMenu },
  computed: {
    ...mapState(useProfileStore, ['highestRoleAllows']),
    ...mapState(useDeviceStore, ['isMobileView']),
    isSettingsMainView() {
      return this.$route.name === 'settings';
    },
    isGroupEdit() {
      return this.$route.query.isGroupEdit;
    },
    isOverviewOpen() {
      return this.$route.name.includes('Overview');
    },
    moduleName() {
      return this.$route.name.replace('Overview', '');
    },
    isSideMenuVisible() {
      const isGroupEdit = this.$route.query?.isGroupEdit === 'true';
      const viewHasMenu = this.$route.meta?.isSideMenuVisible;
      const menuAllowed = this.highestRoleAllows('settings');
      return viewHasMenu && menuAllowed && !isGroupEdit && !this.isMobileView;
    },
  },
};
</script>
