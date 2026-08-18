<template>
  <navigation-drawer-template
    :menu-items="menuItems"
    :avatar="currentUser.avatar"
    :email="currentUser.email"
    :full-name="currentUser.fullName"
    :can-edit-profile="canEditProfile"
    :can-suggest-feature="canSuggestFeature"
  />
</template>
<script>
import { mapState } from 'pinia';

import NavigationDrawerTemplate from './template.vue';

import { ALL_FACTORIES } from '@/constants/routeNames';
import { routes } from '@/router';
import { getLatestNewIndicatorShownUntil } from '@/helpers/dashboardNewIndicator';
import {
  useDashboardConfigStore, useProfileStore, useDeviceStore, useFeatureStore, useConfigurationStore,
} from '@/stores/index';

export default {
  name: 'NavigationDrawer',
  components: {
    NavigationDrawerTemplate,
  },
  emits: ['update:drawerOpen'],
  computed: {
    ...mapState(useDashboardConfigStore, ['pages']),
    ...mapState(useProfileStore, ['highestRoleAllows', 'currentUser']),
    ...mapState(useDeviceStore, ['isMobileView']),
    ...mapState(useFeatureStore, ['improvementsEnabled']),
    ...mapState(useConfigurationStore, ['checklistStations']),
    menuItems() {
      return routes.reduce((menuGroupMap, route) => {
        if (route.meta && route.meta.menuitem && this.isMenuItemVisible(route)) {
          const routeClone = { ...route, disabled: false, href: this.getHref(route) };
          if (routeClone.name === 'dashboard') {
            const lastShared = getLatestNewIndicatorShownUntil(this.pages);
            routeClone.meta.newIndicatorShownUntil = lastShared || (this.checklistStations?.length > 0 ? '2026-04-01' : null);
          }
          return {
            ...menuGroupMap,
            [`group_${route.meta.menugroup}`]: (menuGroupMap[`group_${route.meta.menugroup}`] || []).concat(routeClone),
          };
        }
        return menuGroupMap;
      }, {});
    },
    isRouteEdit() {
      return this.$route.meta?.tab === 'edit';
    },
    canEditProfile() {
      return this.highestRoleAllows('editProfile');
    },
    canSuggestFeature() {
      return this.highestRoleAllows('suggestFeature');
    },
  },
  watch: {
    isRouteEdit(val) {
      if (val) {
        this.$emit('update:drawerOpen', false);
      }
    },
  },
  methods: {
    getHref(route) {
      if (route.name === ALL_FACTORIES) {
        return `${window.location.origin}/#/factory-view`;
      }
      return `${window.location.origin}/#${route.path}`;
    },
    isMenuItemVisible(route) {
      if (route.name === 'logout') return true;
      if (route.name === 'improvements') return this.improvementsEnabled && this.highestRoleAllows('improvements');
      if (route.name === 'gridview' && this.isMobileView) return false;
      return this.highestRoleAllows(route.name);
    },
  },
};
</script>
