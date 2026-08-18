import { setActivePinia, createPinia } from 'pinia';

import AuthGuard from './AuthGuard';

import urlShortenerApi from '@/api/urlShortenerApi';
import { REPORTS, SHIFT_VIEW, REALTIME, TIMELINE } from '@/constants/routeNames';
import useProfileStore from '@/stores/profile';
import useFeatureStore from '@/stores/feature';

vi.mock('@/api/urlShortenerApi');

const next = vi.fn();

describe('AuthGuard', () => {
  let profileStore;
  let featureStore;

  beforeEach(() => {
    setActivePinia(createPinia());
    profileStore = useProfileStore();
    featureStore = useFeatureStore();

    // Default state
    profileStore.userPromise = undefined;
    profileStore.currentUser = { startPage: '' };
    profileStore.highestUserRole = null;
    featureStore.promise = null;

    // Mock async actions to avoid real API calls
    vi.spyOn(profileStore, 'initUser').mockResolvedValue();
    vi.spyOn(featureStore, 'fetchFeatures').mockResolvedValue();

    vi.clearAllMocks();
  });

  it('should redirect to the expanded URL if query.s is provided', async () => {
    const to = { query: { s: 'shortUrl' } };
    const from = {};
    const expandedUrl = '/dashboard#path?param=value';

    urlShortenerApi.getUrl = vi.fn().mockResolvedValue(expandedUrl);

    await AuthGuard(to, from, next);

    expect(urlShortenerApi.getUrl).toHaveBeenCalledWith('shortUrl');
    expect(next).toHaveBeenCalledWith({
      path: 'path',
      query: { param: 'value' },
    });
  });

  it('should initialize user and features if promises are not set', async () => {
    const to = { name: 'root' };
    const from = {};

    await AuthGuard(to, from, next);

    expect(profileStore.initUser).toHaveBeenCalled();
    expect(featureStore.fetchFeatures).toHaveBeenCalled();
  });

  it('should redirect to the startPage if route name is root', async () => {
    const to = { name: 'root' };
    const from = {};

    profileStore.currentUser = { startPage: 'reports' };

    await AuthGuard(to, from, next);

    expect(next).toHaveBeenLastCalledWith({ name: REPORTS });
  });

  it('should redirect to TIMELINE if startPage is factory-view-timeline', async () => {
    const to = { name: 'root' };
    const from = {};

    profileStore.currentUser = { startPage: 'factory-view-timeline' };

    await AuthGuard(to, from, next);

    expect(next).toHaveBeenLastCalledWith({ name: TIMELINE });
  });

  it('should redirect to REALTIME if startPage is factory-view', async () => {
    const to = { name: 'root' };
    const from = {};

    profileStore.currentUser = { startPage: 'factory-view' };

    await AuthGuard(to, from, next);

    expect(next).toHaveBeenLastCalledWith({ name: REALTIME });
  });

  it('should redirect LINEVIEW_USER to SHIFT_VIEW if accessing unauthorized routes', async () => {
    const to = { name: 'unauthorizedRoute' };
    const from = {};

    profileStore.highestUserRole = 'LINEVIEW_USER';

    await AuthGuard(to, from, next);

    expect(next).toHaveBeenLastCalledWith({ name: SHIFT_VIEW });
  });

  it('should redirect to startPage if OFFICE_USER is accessing unauthorized settings modules', async () => {
    const to = { path: '/settings/specificModule' };
    const from = {};

    vi.spyOn(profileStore, 'highestRoleAllows', 'get').mockReturnValue(() => false);
    profileStore.currentUser = { startPage: 'reports' };

    await AuthGuard(to, from, next);

    expect(next).toHaveBeenLastCalledWith({ path: '/reports' });
  });

  it('should redirect to /dashboard if OFFICE_USER is accessing unauthorized settings modules and startPage is not defined', async () => {
    const to = { path: '/settings/specificModule' };
    const from = {};

    vi.spyOn(profileStore, 'highestRoleAllows', 'get').mockReturnValue(() => false);
    profileStore.currentUser = { startPage: '' };

    await AuthGuard(to, from, next);

    expect(next).toHaveBeenLastCalledWith({ path: '/dashboard' });
  });

  it('should redirect to startPage if OFFICE_USER is accessing settings main view', async () => {
    const to = { name: 'settings', path: '/settings' };
    const from = {};

    vi.spyOn(profileStore, 'highestRoleAllows', 'get').mockReturnValue(() => false);
    profileStore.currentUser = { startPage: 'reports' };

    await AuthGuard(to, from, next);

    expect(next).toHaveBeenLastCalledWith({ path: '/reports' });
  });

  it('should redirect to /dashboard if OFFICE_USER is accessing settings main view and startPage is not defined', async () => {
    const to = { name: 'settings', path: '/settings' };
    const from = {};

    vi.spyOn(profileStore, 'highestRoleAllows', 'get').mockReturnValue(() => false);
    profileStore.currentUser = { startPage: '' };

    await AuthGuard(to, from, next);

    expect(next).toHaveBeenLastCalledWith({ path: '/dashboard' });
  });

  it('should redirect to /settings if SYS_ADMIN is accessing profile', async () => {
    const to = { path: '/settings/profile', name: 'profile', matched: [] };
    const from = {};

    vi.spyOn(profileStore, 'highestRoleAllows', 'get').mockReturnValue(() => false);

    await AuthGuard(to, from, next);

    expect(next).toHaveBeenLastCalledWith({ path: '/settings' });
  });

  it('should return next if office user accessing profile', async () => {
    const to = { path: '/settings/profile', name: 'profile', matched: [] };
    const from = {};

    vi.spyOn(profileStore, 'highestRoleAllows', 'get').mockReturnValue(() => true);

    await AuthGuard(to, from, next);

    expect(next).toHaveBeenLastCalledWith();
  });

  it('should redirect to /denied if security settings feature is disabled', async () => {
    const to = { path: '/settings/security', matched: [] };
    const from = {};

    featureStore.securitySettings = false;
    vi.spyOn(profileStore, 'highestRoleAllows', 'get').mockReturnValue(() => true);

    await AuthGuard(to, from, next);

    expect(next).toHaveBeenLastCalledWith({ path: '/denied' });
  });

  it('should redirect to /denied if security settings feature is enabled but user does not have permission', async () => {
    const to = { path: '/settings/security', matched: [] };
    const from = {};

    featureStore.securitySettings = true;
    vi.spyOn(profileStore, 'highestRoleAllows', 'get').mockReturnValue(() => false);

    await AuthGuard(to, from, next);

    expect(next).toHaveBeenLastCalledWith({ path: '/denied' });
  });

  it('should return next if security settings feature is enabled and user has permission', async () => {
    const to = { path: '/settings/security', matched: [] };
    const from = {};

    featureStore.securitySettings = true;
    vi.spyOn(profileStore, 'highestRoleAllows', 'get').mockReturnValue(() => true);

    await AuthGuard(to, from, next);

    expect(next).toHaveBeenLastCalledWith();
  });

  it('should return next if user with evocon email and username is going to activiy logs even if conf is off', async () => {
    const to = { path: '/settings/activitylogs', name: 'activityLogsOverview', matched: [] };
    const from = {};

    profileStore.currentUser = { username: 'test@evocon.com', email: 'test@evocon.com' };
    vi.spyOn(profileStore, 'highestRoleAllows', 'get').mockReturnValue(() => true);
    featureStore.activityLogs = false;

    await AuthGuard(to, from, next);

    expect(next).toHaveBeenLastCalledWith();
  });

  it('should redirect to denied if user with evocon email and different username is going to sv activity logs and conf is off', async () => {
    const to = { path: '/settings/activitylogs/shiftview', name: 'svActivityLogsOverview', matched: [] };
    const from = {};

    featureStore.activityLogs = false;
    profileStore.currentUser = { username: 'test@smthelse', email: 'test@evocon.com' };
    vi.spyOn(profileStore, 'highestRoleAllows', 'get').mockReturnValue(() => true);

    await AuthGuard(to, from, next);

    expect(next).toHaveBeenLastCalledWith({ name: 'DeniedView' });
  });

  it('should redirect to denied if user with random email and evocon username is going to sv activity logs and conf is off', async () => {
    const to = { path: '/settings/activitylogs', name: 'svActivityLogsOverview', matched: [] };
    const from = {};

    featureStore.activityLogs = false;
    profileStore.currentUser = { username: 'test@evocon', email: 'test@random.com' };
    vi.spyOn(profileStore, 'highestRoleAllows', 'get').mockReturnValue(() => true);

    await AuthGuard(to, from, next);

    expect(next).toHaveBeenLastCalledWith({ name: 'DeniedView' });
  });

  it('should redirect to denied if company admin is accessing sv activity logs, but conf is off', async () => {
    const to = { path: '/settings/activitylogs', name: 'svActivityLogsOverview', matched: [] };
    const from = {};

    featureStore.activityLogs = false;
    profileStore.currentUser = { roles: { 0: 'COMPANY_ADMIN' } };
    vi.spyOn(profileStore, 'highestRoleAllows', 'get').mockReturnValue(() => true);

    await AuthGuard(to, from, next);

    expect(next).toHaveBeenLastCalledWith({ name: 'DeniedView' });
  });

  it('should redirect to denied if user with evocon email and different username is going to settings activity logs and conf is off', async () => {
    const to = { path: '/settings/activitylogs/settings', name: 'settingsActivityLogsOverview', matched: [] };
    const from = {};

    featureStore.activityLogs = false;
    profileStore.currentUser = { username: 'test@smthelse', email: 'test@evocon.com' };
    vi.spyOn(profileStore, 'highestRoleAllows', 'get').mockReturnValue(() => true);

    await AuthGuard(to, from, next);

    expect(next).toHaveBeenLastCalledWith({ name: 'DeniedView' });
  });

  it('should redirect to denied if user with random email and evocon username is going to settings activity logs and conf is off', async () => {
    const to = { path: '/settings/activitylogs/settings', name: 'settingsActivityLogsOverview', matched: [] };
    const from = {};

    featureStore.activityLogs = false;
    profileStore.currentUser = { username: 'test@evocon', email: 'test@random.com' };
    vi.spyOn(profileStore, 'highestRoleAllows', 'get').mockReturnValue(() => true);

    await AuthGuard(to, from, next);

    expect(next).toHaveBeenLastCalledWith({ name: 'DeniedView' });
  });

  it('should redirect to denied if company admin is accessing settings activity logs, but conf is off', async () => {
    const to = { path: '/settings/activitylogs/settings', name: 'settingsActivityLogsOverview', matched: [] };
    const from = {};

    featureStore.activityLogs = false;
    profileStore.currentUser = { roles: { 0: 'COMPANY_ADMIN' } };
    vi.spyOn(profileStore, 'highestRoleAllows', 'get').mockReturnValue(() => true);

    await AuthGuard(to, from, next);

    expect(next).toHaveBeenLastCalledWith({ name: 'DeniedView' });
  });

  it('should return next if company admin is accessing activity logs and conf is on', async () => {
    const to = { path: '/settings/activitylogs', name: 'activityLogsOverview', matched: [] };
    const from = {};

    featureStore.activityLogs = true;
    profileStore.currentUser = { roles: { 0: 'COMPANY_ADMIN' } };
    vi.spyOn(profileStore, 'highestRoleAllows', 'get').mockReturnValue(() => true);

    await AuthGuard(to, from, next);

    expect(next).toHaveBeenLastCalledWith();
  });

  it('should redirect to denied if improvements feature is disabled', async () => {
    const to = { matched: [{ name: 'improvements' }] };
    const from = {};

    featureStore.improvements = false;
    vi.spyOn(profileStore, 'highestRoleAllows', 'get').mockReturnValue(() => true);

    await AuthGuard(to, from, next);

    expect(next).toHaveBeenLastCalledWith({ name: 'DeniedView' });
  });

  it('should redirect to denied if improvements feature is enabled, but highestRoleAllows is false', async () => {
    const to = { matched: [{ name: 'improvements' }] };
    const from = {};

    featureStore.improvements = true;
    vi.spyOn(profileStore, 'highestRoleAllows', 'get').mockReturnValue(() => false);

    await AuthGuard(to, from, next);

    expect(next).toHaveBeenLastCalledWith({ name: 'DeniedView' });
  });

  it('should call next if improvements feature is enabled and highestRoleAllows is true', async () => {
    const to = { matched: [{ name: 'improvements' }] };
    const from = {};

    featureStore.improvements = true;
    vi.spyOn(profileStore, 'highestRoleAllows', 'get').mockReturnValue(() => true);

    await AuthGuard(to, from, next);

    expect(next).toHaveBeenLastCalledWith();
  });
});
