<template>
  <secondary-nav-drawer-wrapper
    :collapsed="isCollapsed"
    :has-info-icon="hasInfoIcon"
    :selected-item="selectedModule"
    @update:collapsed="onInput"
    @info-btn-clicked="$emit('info-btn-clicked')"
  >
    <template #nav-drawer-content>
      <secondary-nav-drawer
        :groups="modules"
        label-key="name"
        icon-key="icon"
        active-key="id"
        :collapsed="isCollapsed"
        :active-value="openModule"
        :active-sub-item-value="subModule"
        :opened-drawer-items="openedDrawerItems"
        @update:collapsed="onInput"
        @update:opened-drawer-items="onOpenedDrawerItemsUpdate"
      />
    </template>
  </secondary-nav-drawer-wrapper>
</template>

<script>
import { mapState, mapActions } from 'pinia';

import useProfileStore from '@/stores/profile';
import useSettingsSideMenuStore from '@/stores/settingsSideMenu';
import SecondaryNavDrawerWrapper from '@/components/templates/SecondaryNavDrawerWrapper/index.vue';
import SecondaryNavDrawer from '@/components/molecules/SecondaryNavDrawer/index.vue';
import SettingIntroTexts from '@/components/pages/settings/SettingsMain/settingsTexts';

export default {
  name: 'SettingsSideMenu',
  components: {
    SecondaryNavDrawerWrapper,
    SecondaryNavDrawer,
  },
  emits: ['info-btn-clicked'],
  data() {
    return {
      openedDrawerItems: [],
    };
  },
  computed: {
    ...mapState(useProfileStore, ['currentUser', 'highestRoleAllows']),
    ...mapState(useSettingsSideMenuStore, ['isCollapsed']),
    modules() {
      const allModules = SettingIntroTexts(this.currentUser, this.highestRoleAllows('settings'), this.highestRoleAllows('securitySettings')) || [[]];
      return allModules.reduce((result, subArray) => {
        const filteredSubArray = subArray.filter((module) => module.visible);
        result.push({ items: filteredSubArray });
        return result;
      }, []);
    },
    openModule() {
      return this.$route.path.split('/')[2];
    },
    subModule() {
      return this.$route.path.split('/')[3];
    },
    selectedModule() {
      return this.modules.flatMap((module) => module.items).find((item) => item.id === this.openModule)?.name;
    },
    hasInfoIcon() {
      return ['positions', 'shifts', 'alerts', 'apikeys'].includes(this.openModule);
    },
    isBreakpointLgAndUp() {
      return this.$vuetify.display.lgAndUp;
    },
  },
  mounted() {
    if (this.openModule === 'activitylogs' && this.isBreakpointLgAndUp) this.setIsCollapsed(false);
    else {
      const storageValue = window.localStorage.getItem('isSettingsSideMenuCollapsed');
      this.setIsCollapsed(storageValue === 'true');
      if (this.$vuetify.display.mdAndDown) this.setIsCollapsed(true);
    }
    this.setDefaultOpenedDrawerItems();
  },
  methods: {
    ...mapActions(useSettingsSideMenuStore, ['setIsCollapsed']),
    onInput(value) {
      window.localStorage.setItem('isSettingsSideMenuCollapsed', value);
      this.setIsCollapsed(value);
      if (!value) this.setDefaultOpenedDrawerItems();
    },
    setDefaultOpenedDrawerItems() {
      this.openedDrawerItems = this.modules.flatMap((module) => {
        const itemsWithSubItems = module.items.filter((item) => item.subItems?.length > 0);
        return itemsWithSubItems.map((item) => item.id);
      });
    },
    onOpenedDrawerItemsUpdate(id) {
      if (this.openedDrawerItems.includes(id)) {
        this.openedDrawerItems = this.openedDrawerItems.filter((item) => item !== id);
      } else {
        this.openedDrawerItems.push(id);
      }
    },
  },
};
</script>
