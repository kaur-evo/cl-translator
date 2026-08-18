import urlShortenerApi from '@/api/urlShortenerApi';
import { TIMELINE, REPORTS, SHIFT_VIEW, REALTIME } from '@/constants/routeNames';
import useProfileStore from '@/stores/profile';
import useFeatureStore from '@/stores/feature';

// eslint-disable-next-line sonarjs/cognitive-complexity
export default async (to, from, next) => {
  // Skip auth for dev routes
  if (to.path?.startsWith('/dev/')) return next();

  if (to.query?.s !== undefined) {
    let url;
    try {
      url = await urlShortenerApi.getUrl(to.query.s);
    } catch {
      // pass
    }
    if (url) {
      const path = url.split('#')[1];
      const splitted = path.split('?');
      const params = new URLSearchParams(splitted[1]).entries();
      const query = Array.from(params).reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {});
      return next({ path: splitted[0], query });
    }
  }
  const profileStore = useProfileStore();
  const featureStore = useFeatureStore();
  if (profileStore.userPromise) {
    await profileStore.userPromise;
  } else {
    await profileStore.initUser();
  }
  if (featureStore.promise) {
    await featureStore.promise;
  } else {
    await featureStore.fetchFeatures();
  }
  if (to.name === 'root') {
    const { startPage } = profileStore.currentUser;
    if (startPage === 'reports') {
      return next({ name: REPORTS });
    }
    if (profileStore.highestUserRole === 'LINEVIEW_USER') {
      return next({ name: SHIFT_VIEW });
    }
    if (startPage === 'factory-view-timeline') {
      return next({ name: TIMELINE });
    }
    if (startPage === 'factory-view') {
      return next({ name: REALTIME });
    }
    return next({ path: startPage || 'dashboard' });
  }
  if ((profileStore.highestUserRole === 'LINEVIEW_USER')) {
    if (!profileStore.allowedRoutes.includes(to.name)) {
      return next({ name: SHIFT_VIEW });
    }
  }
  if (to.name === 'profile') {
    if (profileStore.highestRoleAllows('editProfile')) return next();
    return next({ path: '/settings' });
  }
  if (to.path?.includes('/settings/security')) {
    if (featureStore.securitySettingsEnabled && profileStore.highestRoleAllows('securitySettings')) return next();
    return next({ path: '/denied' });
  }
  if ((to.name === 'settings' || to.path?.includes('/settings/')) && !profileStore.highestRoleAllows('settings')) {
    const { startPage } = profileStore.currentUser;
    const path = startPage ? `/${startPage}` : '/dashboard';
    return next({ path });
  }
  if (to.matched[0]?.name === 'improvements') {
    if (featureStore.improvementsEnabled && profileStore.highestRoleAllows('improvements')) {
      return next();
    }
    return next({ name: 'DeniedView' });
  }
  if (to.name === 'svActivityLogsOverview' || to.name === 'settingsActivityLogsOverview') {
    const { currentUser } = profileStore;
    const logsAllowed = currentUser.email?.includes('@evocon.com') && currentUser.username?.includes('@evocon');
    if (logsAllowed) return next();
    if (featureStore.activityLogsEnabled) return next();
    return next({ name: 'DeniedView' });
  }
  return next();
};
