<template>
  <v-app>
    <billing-notification v-if="viewRequirementsLoaded" />
    <two-factor-authentication-notification v-if="viewRequirementsLoaded" />
    <main-nav-drawer v-if="viewRequirementsLoaded && !$route.meta.hideSideMenu" />
    <v-main
      class="overflow-hidden"
      :style="{ 'padding-left': isMenuHidden || $vuetify.display.smAndDown ? '0px' : '64px' }"
    >
      <router-view v-if="viewRequirementsLoaded" />
      <product-tour v-if="viewRequirementsLoaded" />
    </v-main>
    <global-confirm-dialog />
    <global-generic-dialog />
    <global-bottom-sheet />
    <global-notification />
    <v-overlay
      :model-value="menuOpen"
      :scrim="false"
    />
  </v-app>
</template>
<script>
import { mapActions, mapState } from 'pinia';
import { defineAsyncComponent } from 'vue';

import MFAType from '@/constants/multiFactorAuth';
import GlobalGenericDialog from '@/components/organisms/GlobalGenericDialog/index.vue';
import GlobalBottomSheet from '@/components/organisms/GlobalBottomSheet/index.vue';
import ScreenListener from '@/services/ScreenListener';
import ServiceWorkerService from '@/services/ServiceWorkerService';
import isLocalStorageAvailable from '@/helpers/localStorage/isLocalStorageAvailable';
import GlobalConfirmDialog from '@/components/organisms/GlobalConfirmDialog/index.vue';
import GlobalNotification from '@/components/organisms/GlobalNotification/index.vue';
import MainNavDrawer from '@/components/organisms/MainNavDrawer/index.vue';
import ProductTour from '@/components/organisms/ProductTour/index.vue';
import BillingNotification from '@/components/organisms/BillingNotification/index.vue';
import TwoFactorAuthenticationNotification from '@/components/organisms/TwoFactorAuthenticationNotification/index.vue';
import isInIframe from '@/helpers/iframe/isInIframe';
import CentrifugeService from '@/services/CentrifugeService';
import { showBraveBrowserWarningIfNeeded } from '@/helpers/browser/isBrave';
import {
  useProfileStore,
  useConfigurationStore,
  useFactoryStore,
  useDeviceStore,
  useReleasesInfoStore,
  useStationStore,
  useCommentStore,
  usePerfCommentStore,
  useScrapReasonStore,
  usePositionStore,
  useOperatorStore,
  useDashboardConfigStore,
  useFilterbarStore,
  useGenericDialogStore,
  useRouteModuleStore,
} from '@/stores/index';

export default {
  name: 'App',
  components: {
    MainNavDrawer,
    ProductTour,
    GlobalConfirmDialog,
    GlobalGenericDialog,
    GlobalBottomSheet,
    GlobalNotification,
    BillingNotification,
    TwoFactorAuthenticationNotification,
  },
  data() {
    return {
      viewRequirementsLoaded: false,
    };
  },
  computed: {
    ...mapState(useFilterbarStore, ['menuOpen']), // prevents accidental outside clicks
    ...mapState(useProfileStore, ['currentUser', 'language', 'currentRoles', 'MFAPreference', 'userPromise']),
    ...mapState(useConfigurationStore, ['confPromise', 'globalAnnouncement']),
    ...mapState(useDeviceStore, ['isMobileView']),
    ...mapState(useFactoryStore, ['factoryPromise']),
    moduleClass() {
      return this.$route?.meta?.moduleClass ?? '';
    },
    isMenuHidden() {
      return this.$route.meta.hideSideMenu || this.$route.name === 'shiftview';
    },
    bodyClasses() {
      const classesList = [
        this.moduleClass,
      ];
      if (this.isMobileView) classesList.push('mobile');
      return classesList.join(' ');
    },
  },
  watch: {
    async $route(to, from) {
      if (to.path?.startsWith('/dev/')) return;
      this.openGlobalAnnouncementIfNeeded();
      if (to.path !== '/') this.$vuetify.theme.global.name = to.matched[0]?.meta.dark ? 'dark' : 'light';
      if (from.matched[0] && from.matched[0].name === to.matched[0]?.name) return;
      await this.userPromise;
      if (['improvements'].includes(to.matched[0]?.name)) {
        this.changeLanguage({ lang: 'en', setLanguage: false });
        this.$vuetify.locale.current = 'en';
      } else {
        this.changeLanguage({ lang: this.language });
        this.$vuetify.locale.current = this.language === 'zh' ? 'zhHans' : this.language;
      }
      this.$vuetify.date.locale = this.language === 'zh' ? 'zhHans' : this.language;
    },
    // eslint-disable-next-line func-names
    '$route.query': function (newVal) {
      this.setQuery({ ...newVal });
    },
    bodyClasses() {
      document.body.className = this.bodyClasses;
    },
  },
  mounted() {
    if (window.location.hash?.startsWith('#/dev/')) return;
    const screenListener = new ScreenListener(window);
    screenListener.registerWindowListener();
    useReleasesInfoStore().fetchReleasesInfo();
    document.addEventListener('visibilitychange', () => {
      useDeviceStore().setTabVisibility(!document.hidden);
    });
    window.swService = new ServiceWorkerService();
    window.swService.subscribeToServiceWorker();
    showBraveBrowserWarningIfNeeded();
  },
  beforeUnmount() {
    if (window.swService) window.swService.unsubscribeServiceWorker();
  },
  async created() {
    this.initApplication();
    window.onbeforeprint = () => {
      this.$vuetify.theme.name = 'light';
    };
    window.onafterprint = () => {
      this.$vuetify.theme.name = this.$route.matched[0].meta.dark ? 'dark' : 'light';
    };
  },
  methods: {
    ...mapActions(useProfileStore, ['changeLanguage', 'initUser']),
    ...mapActions(useConfigurationStore, ['fetchConfiguration']),
    ...mapActions(useFactoryStore, ['fetchFactories']),
    ...mapActions(useGenericDialogStore, ['openDialog']),
    ...mapActions(useRouteModuleStore, ['setQuery']),
    async initApplication() {
      // Skip full app bootstrap for dev routes
      if (window.location.hash?.startsWith('#/dev/')) {
        this.viewRequirementsLoaded = true;
        return;
      }

      if (import.meta.env.VITE_VUE_APP_SYSTEM_NAME !== 'SERVE') {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', `${import.meta.env.VITE_VUE_APP_BASE_URL}status.json`, true);
        xhr.responseType = 'json';
        xhr.onload = () => {
          const { response } = xhr;
          this.checkSystemStatus(response);
        };
        xhr.send();
      }

      if (!this.userPromise) await this.initUser();
      if (!this.confPromise) await this.fetchConfiguration();
      if (!this.factoryPromise) await this.fetchFactories();

      const user = await this.userPromise;
      await this.factoryPromise; // await for factories to be loaded - needed for query filters

      this.viewRequirementsLoaded = true;

      window.centrifugeService = new CentrifugeService(user?.tenantId);
      window.centrifugeService.subscribe('refreshUpdate', '', this.refresh);
      window.centrifugeService.subscribe('systemStatus', '', this.checkSystemStatus);

      const stationStore = useStationStore();
      stationStore.fetchStations();
      stationStore.fetchStationGroups();
      useOperatorStore().fetchOperators();
      useCommentStore().fetchAllComments({ lang: this.language });
      useCommentStore().fetchCommentGroups({ lang: this.language, includePredefined: true, includeDeleted: true });
      usePerfCommentStore().fetchAllPerfComments({ lang: this.language });
      usePerfCommentStore().fetchPerfCommentGroups({ lang: this.language });
      useScrapReasonStore().fetchAllScrapReasons({ lang: this.language });
      useScrapReasonStore().fetchScrapReasonGroups({ lang: this.language });
      usePositionStore().fetchPositions({ lang: this.language });
      useDashboardConfigStore().loadDashboardConfig();

      this.openMFASetupIfNeeded();
    },
    async refresh(data) {
      const { navigator, location } = window;
      if (data.destroyServiceWorker && 'serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        registrations.forEach((registration) => {
          registration.unregister();
        });
      }
      let shouldRefresh = true;
      if ('username' in data && !data.username.includes(this.currentUser.username)) shouldRefresh = false;
      if (shouldRefresh) location.reload();
    },
    checkSystemStatus(data) {
      if (data && data.system_status === 0) {
        window.location.href = '/evocon-down/index.html';
      }
    },
    openGlobalAnnouncementIfNeeded() {
      if (!this.globalAnnouncement) return;
      const isRoleAllowed = (role) => this.globalAnnouncement.allowedRoles && this.globalAnnouncement.allowedRoles.includes(role);
      const isMessageVisible = () => this.globalAnnouncement.visible;
      const isAllowed = () => Object.values(this.currentRoles).some(isRoleAllowed);
      const isMessageNew = () => this.globalAnnouncement.timestamp && localStorage.getItem('globalAnnouncementTimestamp') !== this.globalAnnouncement.timestamp;
      if (isLocalStorageAvailable() && !isInIframe() && isMessageVisible() && isAllowed() && isMessageNew()) {
        setTimeout(() => {
          this.openGlobalAnnouncement();
        }, 1000);
      }
    },
    openGlobalAnnouncement() {
      const dialogConfig = {
        title: '',
        component: defineAsyncComponent(() => import('./components/organisms/GlobalAnnouncementDialog/index.vue')),
      };
      this.openDialog(dialogConfig);
    },
    openMFASetupIfNeeded() {
      if (this.MFAPreference === null) return;
      const isMFARequired = this.currentUser?.twoFactorAuthenticationRequired;
      const isMFAEnabled = !!this.MFAPreference && this.MFAPreference !== MFAType.NOMFA;
      if (isMFARequired && !isMFAEnabled) {
        const dialogConfig = {
          title: '',
          component: defineAsyncComponent(() => import('./components/organisms/settings/SettingsSetupTOTPDialog/index.vue')),
          persistent: true,
        };
        this.openDialog(dialogConfig);
      }
    },
  },
};

</script>
