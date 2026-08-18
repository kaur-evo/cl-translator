import { createRouter, createWebHashHistory } from 'vue-router';
import {
  mdiTextLong,
  mdiRadioboxMarked,
  mdiViewDashboard,
  mdiCog,
  mdiHelpCircle,
  mdiFlag,
  mdiPower,
  mdiTrendingUp,
  mdiFileChart,
  mdiViewModule,
} from '@mdi/js';
import { defineAsyncComponent } from 'vue';
import { signOut } from 'aws-amplify/auth';

import authGuard from './AuthGuard';

import logOutApi from '@/api/logOutApi';
import { logNavigation } from '@/helpers/eventLog/logNavigation';
import SettingsProductsOverview from '@/components/pages/settings/SettingsProductsOverview/index.vue';
import SettingsQualityOverview from '@/components/pages/settings/SettingsQualityOverview/index.vue';
import SettingsOperatorsOverview from '@/components/pages/settings/SettingsOperatorsOverview/index.vue';
import SettingsStationsOverview from '@/components/pages/settings/SettingsStationsOverview/index.vue';
import SettingsStopReasonsOverview from '@/components/pages/settings/SettingsStopReasonsOverview/index.vue';
import SettingsUsersOverview from '@/components/pages/settings/SettingsUsersOverview/index.vue';
import SettingsSpeedLossOverview from '@/components/pages/settings/SettingsSpeedLossOverview/index.vue';
import SettingsScrapReasonOverview from '@/components/pages/settings/SettingsScrapReasonOverview/index.vue';
import SettingsShiftsOverview from '@/components/pages/settings/SettingsShiftsOverview/index.vue';
import SettingsScrapReasonEdit from '@/components/pages/settings/SettingsScrapReasonEdit/index.vue';
import SettingsStopReasonEdit from '@/components/pages/settings/SettingsStopReasonEdit/index.vue';
import SettingsSpeedLossEdit from '@/components/pages/settings/SettingsSpeedLossEdit/index.vue';
import SettingsOperatorEdit from '@/components/pages/settings/SettingsOperatorsEdit/index.vue';
import SettingsStationsEdit from '@/components/pages/settings/SettingsStationsEdit/index.vue';
import SettingsProductEdit from '@/components/pages/settings/SettingsProductEdit/index.vue';
import SettingsPositionEdit from '@/components/pages/settings/SettingsPositionEdit/index.vue';
import SettingsDataImportOverview from '@/components/pages/settings/SettingsDataImportOverview/index.vue';
import SettingsDataImportTimeout from '@/components/pages/settings/SettingsDataImportTimeout/index.vue';
import SettingsDataImportUpload from '@/components/pages/settings/SettingsDataImportUpload/index.vue';
import SettingsTagsOverview from '@/components/pages/settings/SettingsTagsOverview/index.vue';
import SettingsUserEdit from '@/components/pages/settings/SettingsUserEdit/index.vue';
import SettingsProfileEdit from '@/components/pages/settings/SettingsProfileEdit/index.vue';
import SettingsShiftsEdit from '@/components/pages/settings/SettingsShiftsEdit/index.vue';
import SettingsQualityEdit from '@/components/pages/settings/SettingsQualityEdit/index.vue';
import SettingsPositionsOverview from '@/components/pages/settings/SettingsPositionsOverview/index.vue';
import SettingsAlertsOverview from '@/components/pages/settings/SettingsAlertsOverview/index.vue';
import SettingsAlertsEdit from '@/components/pages/settings/SettingsAlertsEdit/index.vue';
import SettingsChecklistsOverview from '@/components/pages/settings/SettingsChecklistsOverview/index.vue';
import SettingsChecklistEdit from '@/components/pages/settings/SettingsChecklistEdit/index.vue';
import SettingsDevicesOverview from '@/components/pages/settings/SettingsDevicesOverview/index.vue';
import SettingsDeviceEdit from '@/components/pages/settings/SettingsDeviceEdit/index.vue';
import SettingsAPIKeysOverview from '@/components/pages/settings/SettingsAPIKeysOverview/index.vue';
import SettingsActivityLogsSVOverview from '@/components/pages/settings/SettingsActivityLogsSVOverview/index.vue';
import SettingsActivityLogsSettingsOverview from '@/components/pages/settings/SettingsActivityLogsSettingsOverview/index.vue';
import SettingsSecurityOverview from '@/components/pages/settings/SettingsSecurityOverview/index.vue';
import SettingsSecurityProfilesOverview from '@/components/pages/settings/SettingsSecurityProfilesOverview/index.vue';
import SettingsAllowedIPsOverview from '@/components/pages/settings/SettingsAllowedIPsOverview/index.vue';
import SettingsWrapper from '@/components/pages/settings/SettingsWrapper/index.vue';
import ShiftView from '@/components/pages/shiftview/ShiftViewMain/index.vue';
import SplitView from '@/components/pages/SplitView/index.vue';
import ImprovementsMain from '@/components/pages/improvements/ImprovementsMain/index.vue';
import ImprovementEdit from '@/components/pages/improvements/ImprovementEdit/index.vue';
import ImprovementProject from '@/components/pages/improvements/ImprovementProject/index.vue';
import ImprovementTrackingData from '@/components/pages/improvements/ImprovementTrackingData/index.vue';
import ImprovementAnalysisForm from '@/components/pages/improvements/ImprovementAnalysisForm/index.vue';
import DeniedView from '@/components/pages/DeniedView/index.vue';
import ReportsMain from '@/components/pages/reports/ReportsMain/index.vue';
import useFeatureStore from '@/stores/feature';
import useReleasesInfoStore from '@/stores/releasesInfo';
import useGenericDialogStore from '@/stores/genericDialog';
import Dashboard from '@/components/pages/DashboardMain/index.vue';
import FactoriesOverviewMain from '@/components/pages/factoryOverview/FactoriesOverviewMain/index.vue';
import FactoriesOverviewTimelineTab from '@/components/pages/factoryOverview/FactoriesOverviewTimelineTab/index.vue';
import FactoriesOverviewLiveTab from '@/components/pages/factoryOverview/FactoriesOverviewLiveTab/index.vue';
import i18n from '@/services/i18n';
import {
  SHIFT_VIEW, ALL_FACTORIES, DASHBOARD, IMPROVEMENTS, REALTIME, TIMELINE, SETTINGS, SPLIT_VIEW, REPORTS,
} from '@/constants/routeNames';


const createDataImportRoute = (prefix) => ({
  alias: 'dataImport',
  path: 'dataImport',
  name: `${prefix}_dataImport`,
  component: SettingsDataImportOverview,
  meta: {
    menuitem: false,
    parent: { name: SETTINGS, title: () => i18n.global.t('Settings') },
    title: () => i18n.global.t('Data import'),
    useRoutePathAsReturnPath: true,
    isSideMenuVisible: false,
  },
  children: [
    {
      path: 'upload',
      name: `${prefix}_dataImportUpload`,
      component: SettingsDataImportUpload,
      meta: {
        menuitem: false,
        parent: { name: SETTINGS, title: () => i18n.global.t('Settings') },
        title: () => i18n.global.t('Data import'),
        isSideMenuVisible: false,
      },
    },
    {
      path: 'timeout',
      name: `${prefix}_dataImportTimeout`,
      component: SettingsDataImportTimeout,
      meta: {
        menuitem: false,
        parent: { name: SETTINGS, title: () => i18n.global.t('Settings') },
        title: () => i18n.global.t('Data import'),
        isSideMenuVisible: false,
      },
    },
  ],
});

export const routes = [
  {
    path: '/dev/chat',
    name: 'dev-chat',
    component: defineAsyncComponent(() => import('@/components/pages/DevChatPage/index.vue')),
    meta: {
      menuitem: false,
      hideToolbar: true,
    },
  },
  {
    path: '/',
    name: 'root',
    meta: {
      menuitem: false,
    },
  },
  {
    name: SHIFT_VIEW,
    path: '/shiftview/:stationId?/:shiftId?',
    alias: '/shiftview*',
    component: ShiftView,
    meta: {
      isLoaded: true,
      title: () => i18n.global.t('Shift view'),
      moduleClass: 'page-shift-view',
      menuitem: true,
      menugroup: 'middle',
      outside: true,
      icon: mdiTextLong,
      dark: true,
      hideToolbar: true,
    },
    beforeEnter(to, from, next) {
      const paramTypes = ['view', 'orientation', 'type'];
      const inToQuery = paramTypes.some((k) => k in to.query);
      const inFromQuery = paramTypes.some((k) => k in from.query);
      if (!inToQuery && !!inFromQuery) {
        const paramPassObj = {};
        paramTypes.forEach((p) => {
          if (from.query[p]) {
            paramPassObj[p] = from.query[p];
          }
        });
        return next({ ...to, query: { ...paramPassObj } });
      }
      return next();
    },
  },
  {
    name: ALL_FACTORIES,
    path: '/factory-view',
    component: FactoriesOverviewMain,
    meta: {
      title: () => i18n.global.t('Factory view'),
      menuitem: true,
      menugroup: 'middle',
      icon: mdiRadioboxMarked,
      dark: true,
      hideToolbar: true,
    },
    children: [
      {
        path: 'realtime',
        name: REALTIME,
        component: FactoriesOverviewLiveTab,
        meta: {
          title: () => i18n.global.t('Factory view'),
          hideToolbar: true,
        },
      },
      {
        path: 'timeline',
        name: TIMELINE,
        component: FactoriesOverviewTimelineTab,
        meta: {
          title: () => i18n.global.t('Factory view'),
          hideToolbar: true,
        },
      },
    ],
  },
  {
    name: DASHBOARD,
    path: '/dashboard/:tabId?',
    component: Dashboard,
    meta: {
      title: () => i18n.global.t('Dashboard'),
      menuitem: true,
      menugroup: 'middle',
      icon: mdiViewDashboard,
      dark: true,
      hideToolbar: true,
    },
  },
  {
    name: SPLIT_VIEW,
    path: '/split',
    component: SplitView,
    meta: {
      title: () => i18n.global.t('Grid View'),
      menuitem: false,
      dark: true,
      hideToolbar: true,
      hideSideMenu: true,
    },
  },
  {
    name: REPORTS,
    path: '/reports2',
    alias: '/reports2*',
    component: ReportsMain,
    meta: {
      title: () => i18n.global.t('Reports'),
      menuitem: true,
      menugroup: 'middle',
      icon: mdiFileChart,
      dark: false,
    },
  },
  {
    name: IMPROVEMENTS,
    path: '/improvements',
    component: ImprovementsMain,
    meta: {
      title: () => i18n.global.t('Improvements'),
      menuitem: true,
      menugroup: 'middle',
      icon: mdiTrendingUp,
      dark: false,
    },
    children: [
      {
        path: 'new-project',
        name: 'newImprovementProject',
        component: ImprovementEdit,
        meta: {
          menuitem: false,
          parent: { name: IMPROVEMENTS, title: () => i18n.global.t('Improvements') },
          title: () => i18n.global.t('Improvements'),
        },
      },
      {
        path: 'project/:id?',
        name: 'improvementProject',
        component: ImprovementProject,
        meta: {
          menuitem: false,
          parent: { name: IMPROVEMENTS, title: () => i18n.global.t('Improvements') },
          title: () => i18n.global.t('Improvements'),
        },
        children: [
          {
            path: '/improvements/project-edit/:id?',
            name: 'improvementEdit',
            component: ImprovementEdit,
            meta: {
              menuitem: false,
              parent: { name: IMPROVEMENTS, title: () => i18n.global.t('Improvements') },
              title: () => i18n.global.t('Improvements'),
            },
          },
          {
            path: '/improvements/project/tracking-data/:id?',
            name: 'improvementTrackingData',
            component: ImprovementTrackingData,
            meta: {
              menuitem: false,
              parent: { name: IMPROVEMENTS, title: () => i18n.global.t('Improvements') },
              title: () => i18n.global.t('Improvements'),
            },
          },
          {
            path: '/improvements/project/analysis/:id/:analysisIdx?',
            name: 'improvementAnalysisForm',
            component: ImprovementAnalysisForm,
            meta: {
              menuitem: false,
              parent: { name: IMPROVEMENTS, title: () => i18n.global.t('Improvements') },
              title: () => i18n.global.t('Improvements'),
            },
          },
        ],
      },
    ],
  },
  {
    path: '/denied',
    name: 'DeniedView',
    component: DeniedView,
    meta: {
      menuitem: false,
      dark: true,
      title: () => i18n.global.t('Access denied'),
    },
  },
  {
    name: SETTINGS,
    path: '/settings',
    component: SettingsWrapper,
    meta: {
      title: () => i18n.global.t('Settings'),
      menuitem: true,
      menugroup: 'bottom',
      icon: mdiCog,
      dark: false,
    },
    children: [
      {
        path: 'comments',
        component: SettingsStopReasonsOverview,
        name: 'commentOverview',
        meta: {
          menuitem: false,
          parent: { name: SETTINGS, title: () => i18n.global.t('Settings') },
          title: () => i18n.global.t('Stop reasons'),
          isSideMenuVisible: true,
        },
        children: [
          {
            path: ':id?/edit',
            name: 'commentEdit',
            component: SettingsStopReasonEdit,
            meta: {
              menuitem: false,
              parent: { name: SETTINGS, title: () => i18n.global.t('Settings') },
              title: () => i18n.global.t('Stop reasons'),
              isSideMenuVisible: false,
            },
          },
          createDataImportRoute('comments'),
        ],
      },
      {
        path: 'speedlossreasons',
        name: 'perfCommentOverview',
        component: SettingsSpeedLossOverview,
        meta: {
          menuitem: false,
          parent: { name: SETTINGS, title: () => i18n.global.t('Settings') },
          title: () => i18n.global.t('Speed loss reasons'),
          isSideMenuVisible: true,
        },
        children: [
          {
            path: ':id?/edit',
            name: 'perfCommentEdit',
            component: SettingsSpeedLossEdit,
            meta: {
              menuitem: false,
              parent: { name: SETTINGS, title: () => i18n.global.t('Settings') },
              title: () => i18n.global.t('Speed loss reasons'),
              isSideMenuVisible: false,
            },
          },
        ],
      },
      {
        alias: 'scrapreasons',
        path: 'scrapreasons/',
        name: 'scrapReasonOverview',
        component: SettingsScrapReasonOverview,
        meta: {
          menuitem: false,
          parent: { name: SETTINGS, title: () => i18n.global.t('Settings') },
          title: () => i18n.global.t('Scrap reasons'),
          isSideMenuVisible: true,
        },
        children: [
          {
            path: ':id?/edit',
            name: 'scrapReasonEdit',
            component: SettingsScrapReasonEdit,
            meta: {
              menuitem: false,
              parent: { name: SETTINGS, title: () => i18n.global.t('Settings') },
              title: () => i18n.global.t('Scrap reasons'),
              isSideMenuVisible: false,
            },
          },
        ],
      },
      {
        path: 'users',
        name: 'userOverview',
        component: SettingsUsersOverview,
        meta: {
          menuitem: false,
          parent: { name: SETTINGS, title: () => i18n.global.t('Settings') },
          title: () => i18n.global.t('Users'),
          isSideMenuVisible: true,
        },
        children: [
          {
            path: ':id?/edit',
            name: 'userEdit',
            component: SettingsUserEdit,
            meta: {
              menuitem: false,
              parent: { name: SETTINGS, title: () => i18n.global.t('Settings') },
              title: () => i18n.global.t('Users'),
              isSideMenuVisible: false,
            },
          },
        ],
      },
      {
        path: 'operators',
        name: 'operatorOverview',
        component: SettingsOperatorsOverview,
        meta: {
          menuitem: false,
          parent: { name: SETTINGS, title: () => i18n.global.t('Settings') },
          title: () => i18n.global.t('Operators'),
          isSideMenuVisible: true,
        },
        children: [
          {
            path: ':id?/edit',
            name: 'operatorEdit',
            component: SettingsOperatorEdit,
            meta: {
              menuitem: false,
              parent: { name: SETTINGS, title: () => i18n.global.t('Settings') },
              title: () => i18n.global.t('Operators'),
              isSideMenuVisible: false,
            },
          },
        ],
      },
      {
        path: 'products',
        name: 'productOverview',
        component: SettingsProductsOverview,
        meta: {
          menuitem: false,
          parent: { name: SETTINGS, title: () => i18n.global.t('Settings') },
          title: () => i18n.global.t('products'),
          isSideMenuVisible: true,
        },
        children: [
          {
            path: ':id?/edit',
            name: 'productEdit',
            component: SettingsProductEdit,
            meta: {
              menuitem: false,
              parent: { name: SETTINGS, title: () => i18n.global.t('Settings') },
              title: () => i18n.global.t('products'),
              isSideMenuVisible: false,
            },
          },
          createDataImportRoute('products'),
        ],
      },
      {
        path: 'stations',
        name: 'stationOverview',
        component: SettingsStationsOverview,
        meta: {
          menuitem: false,
          parent: { name: SETTINGS, title: () => i18n.global.t('Settings') },
          title: () => i18n.global.t('Stations'),
          isSideMenuVisible: true,
        },
        children: [
          {
            path: ':id/edit',
            name: 'stationEdit',
            component: SettingsStationsEdit,
            meta: {
              menuitem: false,
              parent: { name: SETTINGS, title: () => i18n.global.t('Settings') },
              title: () => i18n.global.t('Stations'),
              isSideMenuVisible: false,
            },
          },
        ],
      },
      {
        path: 'shifts',
        name: 'shiftTemplateOverview',
        component: SettingsShiftsOverview,
        meta: {
          menuitem: false,
          parent: { name: SETTINGS, title: () => i18n.global.t('Settings') },
          title: () => i18n.global.t('Shifts'),
          isSideMenuVisible: true,
        },
        children: [
          {
            path: ':id?/edit',
            name: 'shiftTemplateEdit',
            component: SettingsShiftsEdit,
            meta: {
              menuitem: false,
              parent: { name: SETTINGS, title: () => i18n.global.t('Settings') },
              title: () => i18n.global.t('Shifts'),
              isSideMenuVisible: false,
            },
          },
        ],
      },
      {
        path: 'quality',
        name: 'qualityOverview',
        component: SettingsQualityOverview,
        beforeEnter(to, from, next) {
          if (useFeatureStore().qualityYieldEnabled) next();
          else next({ name: 'DeniedView' });
        },
        meta: {
          menuitem: false,
          parent: { name: SETTINGS, title: () => i18n.global.t('Settings') },
          title: () => i18n.global.t('quality'),
          isSideMenuVisible: true,
        },
        children: [
          {
            path: 'edit',
            name: 'qualityEdit',
            component: SettingsQualityEdit,
            meta: {
              menuitem: false,
              parent: { name: SETTINGS, title: () => i18n.global.t('Settings') },
              title: () => i18n.global.t('quality'),
              isSideMenuVisible: false,
            },
          },
        ],
      },
      {
        path: 'tags',
        name: 'tagsOverview',
        component: SettingsTagsOverview,
        beforeEnter(to, from, next) {
          if (useFeatureStore().tagsEnabled) next();
          else next({ name: 'DeniedView' });
        },
        meta: {
          menuitem: false,
          parent: { name: SETTINGS, title: () => i18n.global.t('Settings') },
          title: () => i18n.global.t('Tags'),
          isSideMenuVisible: true,
        },
      },
      {
        path: 'positions',
        name: 'positionOverview',
        component: SettingsPositionsOverview,
        meta: {
          menuitem: false,
          parent: { name: SETTINGS, title: () => i18n.global.t('Settings') },
          title: () => i18n.global.t('Machine locations'),
          isSideMenuVisible: true,
        },
        children: [
          {
            path: ':id?/edit',
            name: 'positionEdit',
            component: SettingsPositionEdit,
            meta: {
              menuitem: false,
              parent: { name: SETTINGS, title: () => i18n.global.t('Settings') },
              title: () => i18n.global.t('Machine locations'),
              isSideMenuVisible: false,
            },
          },
        ],
      },
      {
        path: 'profile',
        name: 'profile',
        component: SettingsProfileEdit,
        meta: {
          menuitem: false,
          parent: { name: SETTINGS, title: () => i18n.global.t('Settings') },
          title: () => i18n.global.t('Profile'),
          isSideMenuVisible: true,
        },
      },
      {
        path: 'alerts',
        name: 'alertOverview',
        component: SettingsAlertsOverview,
        beforeEnter(to, from, next) {
          if (useFeatureStore().alertsEnabled) next();
          else next({ name: 'DeniedView' });
        },
        meta: {
          menuitem: false,
          parent: { name: SETTINGS, title: () => i18n.global.t('Settings') },
          title: () => i18n.global.t('Alerts'),
          isSideMenuVisible: true,
        },
        children: [
          {
            path: ':id?/edit',
            name: 'alertEdit',
            component: SettingsAlertsEdit,
            meta: {
              menuitem: false,
              parent: { name: SETTINGS, title: () => i18n.global.t('Settings') },
              title: () => i18n.global.t('Alerts'),
              isSideMenuVisible: false,
            },
          },
        ],
      },
      {
        path: 'checklists',
        name: 'checklistTemplateOverview',
        component: SettingsChecklistsOverview,
        beforeEnter(to, from, next) {
          if (useFeatureStore().checklistsEnabled) next();
          else next({ name: 'DeniedView' });
        },
        meta: {
          menuitem: false,
          parent: { name: SETTINGS, title: () => i18n.global.t('Settings') },
          title: () => i18n.global.t('Checklists'),
          isSideMenuVisible: true,
        },
        children: [
          {
            path: ':id?/edit',
            name: 'checklistTemplateEdit',
            component: SettingsChecklistEdit,
            meta: {
              menuitem: false,
              parent: { name: SETTINGS, title: () => i18n.global.t('Settings') },
              title: () => i18n.global.t('Checklists'),
              isSideMenuVisible: false,
            },
          },
        ],
      },
      {
        path: 'devices',
        name: 'deviceOverview',
        component: SettingsDevicesOverview,
        meta: {
          menuitem: false,
          parent: { name: SETTINGS, title: () => i18n.global.t('Settings') },
          title: () => i18n.global.t('Devices'),
          isSideMenuVisible: true,
        },
        children: [
          {
            path: ':id?/edit',
            name: 'deviceEdit',
            component: SettingsDeviceEdit,
            meta: {
              menuitem: false,
              parent: { name: SETTINGS, title: () => i18n.global.t('Settings') },
              title: () => i18n.global.t('Devices'),
              isSideMenuVisible: false,
            },
          },
        ],
      },
      {
        path: 'apikeys',
        name: 'apiKeysOverview',
        component: SettingsAPIKeysOverview,
        beforeEnter(to, from, next) {
          if (useFeatureStore().apiAccessEnabled) next();
          else next({ name: 'DeniedView' });
        },
        meta: {
          menuitem: false,
          parent: { name: SETTINGS, title: () => i18n.global.t('Settings') },
          title: () => i18n.global.t('API keys'),
          isSideMenuVisible: true,
        },
      },
      {
        path: 'activitylogs',
        redirect: { name: 'svActivityLogsOverview' },
      },
      {
        path: 'activitylogs/shiftview',
        name: 'svActivityLogsOverview',
        component: SettingsActivityLogsSVOverview,
        meta: {
          menuitem: false,
          parent: { name: SETTINGS, title: () => i18n.global.t('Settings') },
          title: () => i18n.global.t('Activity logs'),
          isSideMenuVisible: true,
        },
      },
      {
        path: 'activitylogs/settings',
        name: 'settingsActivityLogsOverview',
        component: SettingsActivityLogsSettingsOverview,
        meta: {
          menuitem: false,
          parent: { name: SETTINGS, title: () => i18n.global.t('Settings') },
          title: () => i18n.global.t('Activity logs'),
          isSideMenuVisible: true,
        },
      },
      {
        path: 'security',
        name: 'securityOverview',
        component: SettingsSecurityOverview,
        meta: {
          menuitem: false,
          parent: { name: SETTINGS, title: () => i18n.global.t('Settings') },
          title: () => i18n.global.t('Security'),
          isSideMenuVisible: true,
        },
        children: [
          {
            path: 'securityprofiles',
            name: 'securityProfilesOverview',
            component: SettingsSecurityProfilesOverview,
            meta: {
              menuitem: false,
              parent: { name: SETTINGS, title: () => i18n.global.t('Settings') },
              title: () => i18n.global.t('Security'),
              isSideMenuVisible: true,
            },
          },
          {
            path: 'allowedips',
            name: 'allowedIPsOverview',
            component: SettingsAllowedIPsOverview,
            meta: {
              menuitem: false,
              parent: { name: SETTINGS, title: () => i18n.global.t('Settings') },
              title: () => i18n.global.t('Security'),
              isSideMenuVisible: true,
            },
          },
        ],
      },
    ],
  },
  {
    path: '/gridview',
    name: 'gridview',
    meta: {
      title: () => i18n.global.t('Grid View'),
      menuitem: true,
      menugroup: 'bottom',
      icon: mdiViewModule,
    },
  },
  {
    name: 'help',
    path: '/help',
    meta: {
      title: () => i18n.global.t('Help'),
      menuitem: true,
      menugroup: 'bottom',
      icon: mdiHelpCircle,
    },
  },
  {
    name: 'releasesUpdate',
    path: '/whatsnew',
    meta: {
      title: () => i18n.global.t('What\'s new'),
      menuitem: true,
      menugroup: 'bottom',
      icon: mdiFlag,
    },
  },
  {
    name: 'logout',
    path: '/logout',
    meta: {
      title: () => i18n.global.t('Log out'),
      menuitem: true,
      menugroup: 'bottom',
      icon: mdiPower,
    },
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  base: '/',
  routes,
});

router.beforeEach(async (to, from, next) => {
  if (to.name === 'logout') {
    await logOutApi.logOut();
    await signOut();
    const url = `${window.location.origin}/login/`;
    return window.location.assign(url);
  }
  if (to.name === 'help') {
    next(false);
    return window.open('https://support.evocon.com/Help-Support-1fce89bd3f624aba977dbbda5ef0224a');
  }
  if (to.name === 'releasesUpdate') {
    next(false);
    const releasesInfoStore = useReleasesInfoStore();
    const { lastRelease } = releasesInfoStore;
    if (!lastRelease.opened) {
      await releasesInfoStore.putReleasesInfo(lastRelease);
    }
    return window.open(lastRelease.url);
  }
  if (to.name === 'gridview') {
    next(false);
    const genericDialogStore = useGenericDialogStore();
    await genericDialogStore.openDialog({
      component: defineAsyncComponent(() => import('@/components/organisms/GridViewDialog/index.vue')),
      width: 968,
    });
  }
  if (to.name !== 'root') {
    const title = to.meta?.title?.() || to.meta.parent?.title?.();
    document.title = `Evocon - ${title}`;
  }
  const result = await authGuard(to, from, next);
  if (localStorage.getItem('redirectUrl')) {
    const path = localStorage.getItem('redirectUrl');
    localStorage.setItem('redirectUrl', '');
    return window.location.assign(path);
  }
  return result;
});
router.afterEach((to, from) => {
  if (to.path?.startsWith('/dev/')) return;
  logNavigation(to, from);
  if (window.swService) {
    window.swService.updateServiceWorkerIfAvailable();
  }
});
export default router;
