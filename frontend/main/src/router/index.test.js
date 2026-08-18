import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createRouter, createWebHashHistory } from 'vue-router';
import { setActivePinia, createPinia } from 'pinia';

import { routes } from './index';

import i18n from '@/services/i18n';
import useFeatureStore from '@/stores/feature';
import {
  SHIFT_VIEW,
  ALL_FACTORIES,
  DASHBOARD,
  IMPROVEMENTS,
  REALTIME,
  TIMELINE,
  SETTINGS,
  SPLIT_VIEW,
  REPORTS,
} from '@/constants/routeNames';

vi.mock('@/services/i18n', () => ({
  default: {
    global: {
      t: vi.fn((key) => key),
    },
  },
}));

// Mock all component imports
vi.mock('@/components/pages/settings/SettingsProductsOverview/index.vue', () => ({ default: {} }));
vi.mock('@/components/pages/settings/SettingsQualityOverview/index.vue', () => ({ default: {} }));
vi.mock('@/components/pages/settings/SettingsOperatorsOverview/index.vue', () => ({ default: {} }));
vi.mock('@/components/pages/settings/SettingsStationsOverview/index.vue', () => ({ default: {} }));
vi.mock('@/components/pages/settings/SettingsStopReasonsOverview/index.vue', () => ({ default: {} }));
vi.mock('@/components/pages/settings/SettingsUsersOverview/index.vue', () => ({ default: {} }));
vi.mock('@/components/pages/settings/SettingsSpeedLossOverview/index.vue', () => ({ default: {} }));
vi.mock('@/components/pages/settings/SettingsScrapReasonOverview/index.vue', () => ({ default: {} }));
vi.mock('@/components/pages/settings/SettingsShiftsOverview/index.vue', () => ({ default: {} }));
vi.mock('@/components/pages/settings/SettingsScrapReasonEdit/index.vue', () => ({ default: {} }));
vi.mock('@/components/pages/settings/SettingsStopReasonEdit/index.vue', () => ({ default: {} }));
vi.mock('@/components/pages/settings/SettingsSpeedLossEdit/index.vue', () => ({ default: {} }));
vi.mock('@/components/pages/settings/SettingsOperatorsEdit/index.vue', () => ({ default: {} }));
vi.mock('@/components/pages/settings/SettingsStationsEdit/index.vue', () => ({ default: {} }));
vi.mock('@/components/pages/settings/SettingsProductEdit/index.vue', () => ({ default: {} }));
vi.mock('@/components/pages/settings/SettingsPositionEdit/index.vue', () => ({ default: {} }));
vi.mock('@/components/pages/settings/SettingsDataImportOverview/index.vue', () => ({ default: {} }));
vi.mock('@/components/pages/settings/SettingsDataImportTimeout/index.vue', () => ({ default: {} }));
vi.mock('@/components/pages/settings/SettingsDataImportUpload/index.vue', () => ({ default: {} }));
vi.mock('@/components/pages/settings/SettingsTagsOverview/index.vue', () => ({ default: {} }));
vi.mock('@/components/pages/settings/SettingsUserEdit/index.vue', () => ({ default: {} }));
vi.mock('@/components/pages/settings/SettingsProfileEdit/index.vue', () => ({ default: {} }));
vi.mock('@/components/pages/settings/SettingsShiftsEdit/index.vue', () => ({ default: {} }));
vi.mock('@/components/pages/settings/SettingsQualityEdit/index.vue', () => ({ default: {} }));
vi.mock('@/components/pages/settings/SettingsPositionsOverview/index.vue', () => ({ default: {} }));
vi.mock('@/components/pages/settings/SettingsAlertsOverview/index.vue', () => ({ default: {} }));
vi.mock('@/components/pages/settings/SettingsAlertsEdit/index.vue', () => ({ default: {} }));
vi.mock('@/components/pages/settings/SettingsChecklistsOverview/index.vue', () => ({ default: {} }));
vi.mock('@/components/pages/settings/SettingsChecklistEdit/index.vue', () => ({ default: {} }));
vi.mock('@/components/pages/settings/SettingsDevicesOverview/index.vue', () => ({ default: {} }));
vi.mock('@/components/pages/settings/SettingsDeviceEdit/index.vue', () => ({ default: {} }));
vi.mock('@/components/pages/settings/SettingsAPIKeysOverview/index.vue', () => ({ default: {} }));
vi.mock('@/components/pages/settings/SettingsActivityLogsSVOverview/index.vue', () => ({ default: {} }));
vi.mock('@/components/pages/settings/SettingsActivityLogsSettingsOverview/index.vue', () => ({ default: {} }));
vi.mock('@/components/pages/settings/SettingsWrapper/index.vue', () => ({ default: {} }));
vi.mock('@/components/pages/shiftview/ShiftViewMain/index.vue', () => ({ default: {} }));
vi.mock('@/components/pages/SplitView/index.vue', () => ({ default: {} }));
vi.mock('@/components/pages/improvements/ImprovementsMain/index.vue', () => ({ default: {} }));
vi.mock('@/components/pages/improvements/ImprovementEdit/index.vue', () => ({ default: {} }));
vi.mock('@/components/pages/improvements/ImprovementProject/index.vue', () => ({ default: {} }));
vi.mock('@/components/pages/improvements/ImprovementTrackingData/index.vue', () => ({ default: {} }));
vi.mock('@/components/pages/improvements/ImprovementAnalysisForm/index.vue', () => ({ default: {} }));
vi.mock('@/components/pages/DeniedView/index.vue', () => ({ default: {} }));
vi.mock('@/components/pages/reports/ReportsMain/index.vue', () => ({ default: {} }));
vi.mock('@/components/pages/DashboardMain/index.vue', () => ({ default: {} }));
vi.mock('@/components/pages/factoryOverview/FactoriesOverviewMain/index.vue', () => ({ default: {} }));
vi.mock('@/components/pages/factoryOverview/FactoriesOverviewTimelineTab/index.vue', () => ({ default: {} }));
vi.mock('@/components/pages/factoryOverview/FactoriesOverviewLiveTab/index.vue', () => ({ default: {} }));

describe('Router Configuration', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  describe('routes array', () => {
    it('should export routes array', () => {
      expect(routes).toBeDefined();
      expect(Array.isArray(routes)).toBe(true);
    });

    it('should have root route configured', () => {
      const rootRoute = routes.find((r) => r.name === 'root');
      expect(rootRoute).toBeDefined();
      expect(rootRoute.path).toBe('/');
      expect(rootRoute.meta.menuitem).toBe(false);
    });

    it('should have shift view route with correct configuration', () => {
      const shiftViewRoute = routes.find((r) => r.name === SHIFT_VIEW);
      expect(shiftViewRoute).toBeDefined();
      expect(shiftViewRoute.path).toBe('/shiftview/:stationId?/:shiftId?');
      expect(shiftViewRoute.meta.menuitem).toBe(true);
      expect(shiftViewRoute.meta.menugroup).toBe('middle');
      expect(shiftViewRoute.meta.dark).toBe(true);
      expect(shiftViewRoute.meta.hideToolbar).toBe(true);
      expect(typeof shiftViewRoute.meta.title).toBe('function');
    });

    it('should have factory view route with children', () => {
      const factoryRoute = routes.find((r) => r.name === ALL_FACTORIES);
      expect(factoryRoute).toBeDefined();
      expect(factoryRoute.path).toBe('/factory-view');
      expect(factoryRoute.children).toBeDefined();
      expect(factoryRoute.children.length).toBe(2);

      const realtimeChild = factoryRoute.children.find((c) => c.name === REALTIME);
      expect(realtimeChild).toBeDefined();
      expect(realtimeChild.path).toBe('realtime');

      const timelineChild = factoryRoute.children.find((c) => c.name === TIMELINE);
      expect(timelineChild).toBeDefined();
      expect(timelineChild.path).toBe('timeline');
    });

    it('should have dashboard route with optional tabId param', () => {
      const dashboardRoute = routes.find((r) => r.name === DASHBOARD);
      expect(dashboardRoute).toBeDefined();
      expect(dashboardRoute.path).toBe('/dashboard/:tabId?');
      expect(dashboardRoute.meta.menuitem).toBe(true);
      expect(dashboardRoute.meta.dark).toBe(true);
    });

    it('should have split view route', () => {
      const splitRoute = routes.find((r) => r.name === SPLIT_VIEW);
      expect(splitRoute).toBeDefined();
      expect(splitRoute.path).toBe('/split');
      expect(splitRoute.meta.hideSideMenu).toBe(true);
    });

    it('should have reports route', () => {
      const reportsRoute = routes.find((r) => r.name === REPORTS);
      expect(reportsRoute).toBeDefined();
      expect(reportsRoute.path).toBe('/reports2');
      expect(reportsRoute.alias).toBe('/reports2*');
      expect(reportsRoute.meta.dark).toBe(false);
    });

    it('should have improvements route with nested children', () => {
      const improvementsRoute = routes.find((r) => r.name === IMPROVEMENTS);
      expect(improvementsRoute).toBeDefined();
      expect(improvementsRoute.path).toBe('/improvements');
      expect(improvementsRoute.children).toBeDefined();
      expect(improvementsRoute.children.length).toBeGreaterThan(0);

      const newProjectRoute = improvementsRoute.children.find(
        (c) => c.name === 'newImprovementProject',
      );
      expect(newProjectRoute).toBeDefined();
      expect(newProjectRoute.path).toBe('new-project');

      const projectRoute = improvementsRoute.children.find(
        (c) => c.name === 'improvementProject',
      );
      expect(projectRoute).toBeDefined();
      expect(projectRoute.children).toBeDefined();
    });

    it('should have denied view route', () => {
      const deniedRoute = routes.find((r) => r.name === 'DeniedView');
      expect(deniedRoute).toBeDefined();
      expect(deniedRoute.path).toBe('/denied');
      expect(deniedRoute.meta.dark).toBe(true);
    });

    it('should have settings route with extensive nested routes', () => {
      const settingsRoute = routes.find((r) => r.name === SETTINGS);
      expect(settingsRoute).toBeDefined();
      expect(settingsRoute.path).toBe('/settings');
      expect(settingsRoute.meta.menugroup).toBe('bottom');
      expect(settingsRoute.children).toBeDefined();
      expect(settingsRoute.children.length).toBeGreaterThan(10);
    });

    it('should have settings comments route with data import child', () => {
      const settingsRoute = routes.find((r) => r.name === SETTINGS);
      const commentsRoute = settingsRoute.children.find((c) => c.name === 'commentOverview');
      expect(commentsRoute).toBeDefined();
      expect(commentsRoute.path).toBe('comments');

      const dataImportChild = commentsRoute.children.find(
        (c) => c.name === 'comments_dataImport',
      );
      expect(dataImportChild).toBeDefined();
      expect(dataImportChild.path).toBe('dataImport');
    });

    it('should have settings products route with data import child', () => {
      const settingsRoute = routes.find((r) => r.name === SETTINGS);
      const productsRoute = settingsRoute.children.find((c) => c.name === 'productOverview');
      expect(productsRoute).toBeDefined();

      const dataImportChild = productsRoute.children.find(
        (c) => c.name === 'products_dataImport',
      );
      expect(dataImportChild).toBeDefined();
    });

    it('should have quality route with beforeEnter guard', () => {
      const settingsRoute = routes.find((r) => r.name === SETTINGS);
      const qualityRoute = settingsRoute.children.find((c) => c.name === 'qualityOverview');
      expect(qualityRoute).toBeDefined();
      expect(qualityRoute.path).toBe('quality');
      expect(typeof qualityRoute.beforeEnter).toBe('function');
    });

    it('should have tags route with beforeEnter guard', () => {
      const settingsRoute = routes.find((r) => r.name === SETTINGS);
      const tagsRoute = settingsRoute.children.find((c) => c.name === 'tagsOverview');
      expect(tagsRoute).toBeDefined();
      expect(tagsRoute.path).toBe('tags');
      expect(typeof tagsRoute.beforeEnter).toBe('function');
    });

    it('should have alerts route with beforeEnter guard', () => {
      const settingsRoute = routes.find((r) => r.name === SETTINGS);
      const alertsRoute = settingsRoute.children.find((c) => c.name === 'alertOverview');
      expect(alertsRoute).toBeDefined();
      expect(typeof alertsRoute.beforeEnter).toBe('function');
    });

    it('should have checklists route with beforeEnter guard', () => {
      const settingsRoute = routes.find((r) => r.name === SETTINGS);
      const checklistsRoute = settingsRoute.children.find(
        (c) => c.name === 'checklistTemplateOverview',
      );
      expect(checklistsRoute).toBeDefined();
      expect(typeof checklistsRoute.beforeEnter).toBe('function');
    });

    it('should have api keys route with beforeEnter guard', () => {
      const settingsRoute = routes.find((r) => r.name === SETTINGS);
      const apiKeysRoute = settingsRoute.children.find((c) => c.name === 'apiKeysOverview');
      expect(apiKeysRoute).toBeDefined();
      expect(typeof apiKeysRoute.beforeEnter).toBe('function');
    });

    it('should have activity logs routes', () => {
      const settingsRoute = routes.find((r) => r.name === SETTINGS);
      const svLogsRoute = settingsRoute.children.find((c) => c.name === 'svActivityLogsOverview');
      expect(svLogsRoute).toBeDefined();
      expect(svLogsRoute.path).toBe('activitylogs/shiftview');

      const settingsLogsRoute = settingsRoute.children.find(
        (c) => c.name === 'settingsActivityLogsOverview',
      );
      expect(settingsLogsRoute).toBeDefined();
      expect(settingsLogsRoute.path).toBe('activitylogs/settings');
    });

    it('should have gridview route', () => {
      const gridviewRoute = routes.find((r) => r.name === 'gridview');
      expect(gridviewRoute).toBeDefined();
      expect(gridviewRoute.path).toBe('/gridview');
      expect(gridviewRoute.meta.menugroup).toBe('bottom');
    });

    it('should have help route', () => {
      const helpRoute = routes.find((r) => r.name === 'help');
      expect(helpRoute).toBeDefined();
      expect(helpRoute.path).toBe('/help');
      expect(helpRoute.meta.menugroup).toBe('bottom');
    });

    it('should have releases update route', () => {
      const releasesRoute = routes.find((r) => r.name === 'releasesUpdate');
      expect(releasesRoute).toBeDefined();
      expect(releasesRoute.path).toBe('/whatsnew');
    });

    it('should have logout route', () => {
      const logoutRoute = routes.find((r) => r.name === 'logout');
      expect(logoutRoute).toBeDefined();
      expect(logoutRoute.path).toBe('/logout');
      expect(logoutRoute.meta.menugroup).toBe('bottom');
    });
  });

  describe('Route beforeEnter guards', () => {
    it('should pass query params through shiftview beforeEnter when not present in to', () => {
      const shiftViewRoute = routes.find((r) => r.name === SHIFT_VIEW);
      const next = vi.fn();
      const to = { query: {} };
      const from = { query: { view: 'test', orientation: 'horizontal', type: 'something' } };

      shiftViewRoute.beforeEnter(to, from, next);

      expect(next).toHaveBeenCalledWith({
        ...to,
        query: { view: 'test', orientation: 'horizontal', type: 'something' },
      });
    });

    it('should not pass query params when already in to', () => {
      const shiftViewRoute = routes.find((r) => r.name === SHIFT_VIEW);
      const next = vi.fn();
      const to = { query: { view: 'existing' } };
      const from = { query: { view: 'test' } };

      shiftViewRoute.beforeEnter(to, from, next);

      expect(next).toHaveBeenCalledWith();
    });

    it('should allow access to quality when feature is enabled', () => {
      const settingsRoute = routes.find((r) => r.name === SETTINGS);
      const qualityRoute = settingsRoute.children.find((c) => c.name === 'qualityOverview');
      const next = vi.fn();

      useFeatureStore().qualityYield = true;

      qualityRoute.beforeEnter({}, {}, next);

      expect(next).toHaveBeenCalledWith();
    });

    it('should deny access to quality when feature is disabled', () => {
      const settingsRoute = routes.find((r) => r.name === SETTINGS);
      const qualityRoute = settingsRoute.children.find((c) => c.name === 'qualityOverview');
      const next = vi.fn();

      useFeatureStore().qualityYield = false;

      qualityRoute.beforeEnter({}, {}, next);

      expect(next).toHaveBeenCalledWith({ name: 'DeniedView' });
    });

    it('should allow access to tags when feature is enabled', () => {
      const settingsRoute = routes.find((r) => r.name === SETTINGS);
      const tagsRoute = settingsRoute.children.find((c) => c.name === 'tagsOverview');
      const next = vi.fn();

      useFeatureStore().tags = true;

      tagsRoute.beforeEnter({}, {}, next);

      expect(next).toHaveBeenCalledWith();
    });

    it('should deny access to tags when feature is disabled', () => {
      const settingsRoute = routes.find((r) => r.name === SETTINGS);
      const tagsRoute = settingsRoute.children.find((c) => c.name === 'tagsOverview');
      const next = vi.fn();

      useFeatureStore().tags = false;

      tagsRoute.beforeEnter({}, {}, next);

      expect(next).toHaveBeenCalledWith({ name: 'DeniedView' });
    });

    it('should allow access to alerts when feature is enabled', () => {
      const settingsRoute = routes.find((r) => r.name === SETTINGS);
      const alertsRoute = settingsRoute.children.find((c) => c.name === 'alertOverview');
      const next = vi.fn();

      useFeatureStore().alerts = true;

      alertsRoute.beforeEnter({}, {}, next);

      expect(next).toHaveBeenCalledWith();
    });

    it('should deny access to alerts when feature is disabled', () => {
      const settingsRoute = routes.find((r) => r.name === SETTINGS);
      const alertsRoute = settingsRoute.children.find((c) => c.name === 'alertOverview');
      const next = vi.fn();

      useFeatureStore().alerts = false;

      alertsRoute.beforeEnter({}, {}, next);

      expect(next).toHaveBeenCalledWith({ name: 'DeniedView' });
    });

    it('should allow access to checklists when feature is enabled', () => {
      const settingsRoute = routes.find((r) => r.name === SETTINGS);
      const checklistsRoute = settingsRoute.children.find(
        (c) => c.name === 'checklistTemplateOverview',
      );
      const next = vi.fn();

      useFeatureStore().checklists = true;

      checklistsRoute.beforeEnter({}, {}, next);

      expect(next).toHaveBeenCalledWith();
    });

    it('should deny access to checklists when feature is disabled', () => {
      const settingsRoute = routes.find((r) => r.name === SETTINGS);
      const checklistsRoute = settingsRoute.children.find(
        (c) => c.name === 'checklistTemplateOverview',
      );
      const next = vi.fn();

      useFeatureStore().checklists = false;

      checklistsRoute.beforeEnter({}, {}, next);

      expect(next).toHaveBeenCalledWith({ name: 'DeniedView' });
    });

    it('should allow access to API keys when feature is enabled', () => {
      const settingsRoute = routes.find((r) => r.name === SETTINGS);
      const apiKeysRoute = settingsRoute.children.find((c) => c.name === 'apiKeysOverview');
      const next = vi.fn();

      useFeatureStore().apiAccess = true;

      apiKeysRoute.beforeEnter({}, {}, next);

      expect(next).toHaveBeenCalledWith();
    });

    it('should deny access to API keys when feature is disabled', () => {
      const settingsRoute = routes.find((r) => r.name === SETTINGS);
      const apiKeysRoute = settingsRoute.children.find((c) => c.name === 'apiKeysOverview');
      const next = vi.fn();

      useFeatureStore().apiAccess = false;

      apiKeysRoute.beforeEnter({}, {}, next);

      expect(next).toHaveBeenCalledWith({ name: 'DeniedView' });
    });
  });

  describe('Router instance configuration', () => {
    it('should create router with hash history', () => {
      const router = createRouter({
        history: createWebHashHistory(),
        routes,
      });

      expect(router).toBeDefined();
      expect(router.options.routes).toBe(routes);
    });

    it('should have all main routes registered', () => {
      const router = createRouter({
        history: createWebHashHistory(),
        routes,
      });

      const routeNames = router.getRoutes().map((r) => r.name);
      expect(routeNames).toContain(SHIFT_VIEW);
      expect(routeNames).toContain(DASHBOARD);
      expect(routeNames).toContain(SETTINGS);
      expect(routeNames).toContain(IMPROVEMENTS);
    });
  });

  describe('createDataImportRoute helper', () => {
    it('should create data import routes for comments', () => {
      const settingsRoute = routes.find((r) => r.name === SETTINGS);
      const commentsRoute = settingsRoute.children.find((c) => c.name === 'commentOverview');
      const dataImportRoute = commentsRoute.children.find(
        (c) => c.name === 'comments_dataImport',
      );

      expect(dataImportRoute).toBeDefined();
      expect(dataImportRoute.path).toBe('dataImport');
      expect(dataImportRoute.alias).toBe('dataImport');
      expect(dataImportRoute.meta.menuitem).toBe(false);
      expect(dataImportRoute.meta.isSideMenuVisible).toBe(false);
      expect(dataImportRoute.meta.useRoutePathAsReturnPath).toBe(true);
    });

    it('should create nested upload route for data import', () => {
      const settingsRoute = routes.find((r) => r.name === SETTINGS);
      const commentsRoute = settingsRoute.children.find((c) => c.name === 'commentOverview');
      const dataImportRoute = commentsRoute.children.find(
        (c) => c.name === 'comments_dataImport',
      );
      const uploadRoute = dataImportRoute.children.find(
        (c) => c.name === 'comments_dataImportUpload',
      );

      expect(uploadRoute).toBeDefined();
      expect(uploadRoute.path).toBe('upload');
    });

    it('should create nested timeout route for data import', () => {
      const settingsRoute = routes.find((r) => r.name === SETTINGS);
      const commentsRoute = settingsRoute.children.find((c) => c.name === 'commentOverview');
      const dataImportRoute = commentsRoute.children.find(
        (c) => c.name === 'comments_dataImport',
      );
      const timeoutRoute = dataImportRoute.children.find(
        (c) => c.name === 'comments_dataImportTimeout',
      );

      expect(timeoutRoute).toBeDefined();
      expect(timeoutRoute.path).toBe('timeout');
    });

    it('should create data import routes with different prefix', () => {
      const settingsRoute = routes.find((r) => r.name === SETTINGS);
      const productsRoute = settingsRoute.children.find((c) => c.name === 'productOverview');
      const dataImportRoute = productsRoute.children.find(
        (c) => c.name === 'products_dataImport',
      );

      expect(dataImportRoute).toBeDefined();
      expect(dataImportRoute.children.find((c) => c.name === 'products_dataImportUpload')).toBeDefined();
      expect(dataImportRoute.children.find((c) => c.name === 'products_dataImportTimeout')).toBeDefined();
    });
  });

  describe('Route meta configurations', () => {
    it('should have title functions that return translations', () => {
      const dashboardRoute = routes.find((r) => r.name === DASHBOARD);
      i18n.global.t.mockReturnValue('Dashboard');

      const title = dashboardRoute.meta.title();

      expect(i18n.global.t).toHaveBeenCalledWith('Dashboard');
      expect(title).toBe('Dashboard');
    });

    it('should have parent meta with name and title for nested routes', () => {
      const settingsRoute = routes.find((r) => r.name === SETTINGS);
      const usersRoute = settingsRoute.children.find((c) => c.name === 'userOverview');

      expect(usersRoute.meta.parent).toBeDefined();
      expect(usersRoute.meta.parent.name).toBe(SETTINGS);
      expect(typeof usersRoute.meta.parent.title).toBe('function');
    });

    it('should configure dark mode for appropriate routes', () => {
      const shiftViewRoute = routes.find((r) => r.name === SHIFT_VIEW);
      const reportsRoute = routes.find((r) => r.name === REPORTS);
      const settingsRoute = routes.find((r) => r.name === SETTINGS);

      expect(shiftViewRoute.meta.dark).toBe(true);
      expect(reportsRoute.meta.dark).toBe(false);
      expect(settingsRoute.meta.dark).toBe(false);
    });

    it('should configure toolbar visibility', () => {
      const shiftViewRoute = routes.find((r) => r.name === SHIFT_VIEW);
      const reportsRoute = routes.find((r) => r.name === REPORTS);

      expect(shiftViewRoute.meta.hideToolbar).toBe(true);
      expect(reportsRoute.meta.hideToolbar).toBeUndefined();
    });

    it('should configure side menu visibility', () => {
      const splitRoute = routes.find((r) => r.name === SPLIT_VIEW);
      const dashboardRoute = routes.find((r) => r.name === DASHBOARD);

      expect(splitRoute.meta.hideSideMenu).toBe(true);
      expect(dashboardRoute.meta.hideSideMenu).toBeUndefined();
    });

    it('should configure isSideMenuVisible for settings children', () => {
      const settingsRoute = routes.find((r) => r.name === SETTINGS);
      const usersRoute = settingsRoute.children.find((c) => c.name === 'userOverview');
      const userEditRoute = usersRoute.children.find((c) => c.name === 'userEdit');

      expect(usersRoute.meta.isSideMenuVisible).toBe(true);
      expect(userEditRoute.meta.isSideMenuVisible).toBe(false);
    });
  });

  describe('Route aliases', () => {
    it('should have alias for shiftview route', () => {
      const shiftViewRoute = routes.find((r) => r.name === SHIFT_VIEW);
      expect(shiftViewRoute.alias).toBe('/shiftview*');
    });

    it('should have alias for reports route', () => {
      const reportsRoute = routes.find((r) => r.name === REPORTS);
      expect(reportsRoute.alias).toBe('/reports2*');
    });

    it('should have alias for scrap reasons', () => {
      const settingsRoute = routes.find((r) => r.name === SETTINGS);
      const scrapRoute = settingsRoute.children.find((c) => c.name === 'scrapReasonOverview');
      expect(scrapRoute.alias).toBe('scrapreasons');
    });
  });

  describe('Route redirects', () => {
    it('should redirect activity logs to shiftview logs', () => {
      const settingsRoute = routes.find((r) => r.name === SETTINGS);
      const activityLogsRedirect = settingsRoute.children.find(
        (c) => c.path === 'activitylogs' && c.redirect,
      );

      expect(activityLogsRedirect).toBeDefined();
      expect(activityLogsRedirect.redirect).toEqual({ name: 'svActivityLogsOverview' });
    });
  });

  describe('Route parameters', () => {
    it('should have optional station and shift parameters for shift view', () => {
      const shiftViewRoute = routes.find((r) => r.name === SHIFT_VIEW);
      expect(shiftViewRoute.path).toContain(':stationId?');
      expect(shiftViewRoute.path).toContain(':shiftId?');
    });

    it('should have optional tab parameter for dashboard', () => {
      const dashboardRoute = routes.find((r) => r.name === DASHBOARD);
      expect(dashboardRoute.path).toContain(':tabId?');
    });

    it('should have optional id parameter for edit routes', () => {
      const settingsRoute = routes.find((r) => r.name === SETTINGS);
      const usersRoute = settingsRoute.children.find((c) => c.name === 'userOverview');
      const userEditRoute = usersRoute.children.find((c) => c.name === 'userEdit');

      expect(userEditRoute.path).toContain(':id?');
    });

    it('should have required id parameter for station edit', () => {
      const settingsRoute = routes.find((r) => r.name === SETTINGS);
      const stationsRoute = settingsRoute.children.find((c) => c.name === 'stationOverview');
      const stationEditRoute = stationsRoute.children.find((c) => c.name === 'stationEdit');

      expect(stationEditRoute.path).toContain(':id');
      expect(stationEditRoute.path).not.toContain(':id?');
    });
  });

  describe('Menu configuration', () => {
    it('should have middle menugroup items', () => {
      const middleMenuItems = routes.filter((r) => r.meta?.menugroup === 'middle');
      expect(middleMenuItems.length).toBeGreaterThan(0);
      expect(middleMenuItems.map((r) => r.name)).toContain(SHIFT_VIEW);
      expect(middleMenuItems.map((r) => r.name)).toContain(DASHBOARD);
    });

    it('should have bottom menugroup items', () => {
      const bottomMenuItems = routes.filter((r) => r.meta?.menugroup === 'bottom');
      expect(bottomMenuItems.length).toBeGreaterThan(0);
      expect(bottomMenuItems.map((r) => r.name)).toContain(SETTINGS);
      expect(bottomMenuItems.map((r) => r.name)).toContain('logout');
    });

    it('should have icons for menu items', () => {
      const shiftViewRoute = routes.find((r) => r.name === SHIFT_VIEW);
      const dashboardRoute = routes.find((r) => r.name === DASHBOARD);
      const settingsRoute = routes.find((r) => r.name === SETTINGS);

      expect(shiftViewRoute.meta.icon).toBeDefined();
      expect(dashboardRoute.meta.icon).toBeDefined();
      expect(settingsRoute.meta.icon).toBeDefined();
    });

    it('should mark certain routes as non-menu items', () => {
      const rootRoute = routes.find((r) => r.name === 'root');
      const deniedRoute = routes.find((r) => r.name === 'DeniedView');
      const splitRoute = routes.find((r) => r.name === SPLIT_VIEW);

      expect(rootRoute.meta.menuitem).toBe(false);
      expect(deniedRoute.meta.menuitem).toBe(false);
      expect(splitRoute.meta.menuitem).toBe(false);
    });
  });
});
