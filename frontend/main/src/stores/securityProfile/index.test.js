import { setActivePinia, createPinia } from 'pinia';

import useSecurityProfileStore from './index';

import securityProfilesApi from '@/api/securityProfilesApi';
import useGenericNotificationStore from '@/stores/genericNotification';

vi.mock('@/api/securityProfilesApi', () => ({
  default: {
    getSecurityProfiles: vi.fn(),
    saveSecurityProfile: vi.fn(),
    updateSecurityProfile: vi.fn(),
    deleteSecurityProfile: vi.fn(),
  },
  __esModule: true,
}));

vi.mock('@/services/i18n', () => ({
  default: {
    global: {
      t: (key, params) => {
        if (params?.value !== undefined) return key.replace('{value}', params.value).replace('{profile}', params.profile || '');
        return key;
      },
    },
  },
  __esModule: true,
}));

describe('useSecurityProfileStore', () => {
  let store;
  let notificationStore;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useSecurityProfileStore();
    notificationStore = useGenericNotificationStore();
    vi.spyOn(notificationStore, 'notifyError');
    vi.spyOn(notificationStore, 'notifyUpdated');
    vi.spyOn(notificationStore, 'notifyDeleted');
    vi.spyOn(notificationStore, 'notifySuccess');
    vi.clearAllMocks();
  });

  test('initial state', () => {
    expect(store.securityProfiles).toEqual([]);
    expect(store.loading).toEqual([]);
  });

  describe('actions', () => {
    test('setSecurityProfiles', () => {
      const profiles = [{ id: 1, name: 'Profile 1' }, { id: 2, name: 'Profile 2' }];
      store.setSecurityProfiles(profiles);
      expect(store.securityProfiles).toEqual(profiles);
    });

    test('saveSecurityProfileToState when profile exists', () => {
      store.securityProfiles = [{ id: 1, name: 'Profile 1' }, { id: 2, name: 'Profile 2' }];
      store.saveSecurityProfileToState({ id: 1, name: 'Profile 1 Updated' });
      expect(store.securityProfiles[0].name).toBe('Profile 1 Updated');
    });

    test('saveSecurityProfileToState when profile does not exist', () => {
      store.securityProfiles = [{ id: 1, name: 'Profile 1' }];
      store.saveSecurityProfileToState({ id: 2, name: 'Profile 2' });
      expect(store.securityProfiles).toHaveLength(2);
    });

    test('deleteSecurityProfileFromState when profile exists', () => {
      store.securityProfiles = [{ id: 1, name: 'Profile 1' }, { id: 2, name: 'Profile 2' }];
      store.deleteSecurityProfileFromState(1);
      expect(store.securityProfiles).toEqual([{ id: 2, name: 'Profile 2' }]);
    });

    test('deleteSecurityProfileFromState when profile does not exist', () => {
      store.securityProfiles = [{ id: 1, name: 'Profile 1' }, { id: 2, name: 'Profile 2' }];
      store.deleteSecurityProfileFromState(3);
      expect(store.securityProfiles).toHaveLength(2);
    });

    test('fetchSecurityProfiles with success', async () => {
      const profiles = [{ id: 1, name: 'Profile 1' }, { id: 2, name: 'Profile 2' }];
      securityProfilesApi.getSecurityProfiles.mockResolvedValueOnce(profiles);
      await store.fetchSecurityProfiles();
      expect(securityProfilesApi.getSecurityProfiles).toHaveBeenCalledTimes(1);
      expect(store.securityProfiles).toEqual(profiles);
      expect(store.loading).toEqual([]);
    });

    test('fetchSecurityProfiles with error', async () => {
      securityProfilesApi.getSecurityProfiles.mockRejectedValueOnce();
      await store.fetchSecurityProfiles();
      expect(notificationStore.notifyError).toHaveBeenCalledWith('We are sorry! There is a problem with your request');
    });

    test('saveSecurityProfile with update', async () => {
      const profile = { id: 1, name: 'Profile 1 Updated' };
      securityProfilesApi.updateSecurityProfile.mockResolvedValueOnce(profile);
      await store.saveSecurityProfile(profile);
      expect(securityProfilesApi.updateSecurityProfile).toHaveBeenCalledWith(profile);
      expect(notificationStore.notifyUpdated).toHaveBeenCalledWith('Profile 1 Updated');
    });

    test('saveSecurityProfile with create', async () => {
      const profile = { name: 'Profile 2' };
      securityProfilesApi.saveSecurityProfile.mockResolvedValueOnce(profile);
      await store.saveSecurityProfile(profile);
      expect(securityProfilesApi.saveSecurityProfile).toHaveBeenCalledWith(profile);
      expect(notificationStore.notifySuccess).toHaveBeenCalledWith('Profile 2 added, attach in user settings');
    });

    test('saveSecurityProfile with error', async () => {
      securityProfilesApi.saveSecurityProfile.mockRejectedValueOnce();
      await store.saveSecurityProfile({ name: 'Profile 3' });
      expect(notificationStore.notifyError).toHaveBeenCalledWith('We are sorry! There is a problem with your request');
    });

    test('deleteSecurityProfile with success', async () => {
      store.securityProfiles = [{ id: 1, name: 'Profile 1' }];
      securityProfilesApi.deleteSecurityProfile.mockResolvedValueOnce();
      await store.deleteSecurityProfile({ id: 1, name: 'Profile 1' });
      expect(securityProfilesApi.deleteSecurityProfile).toHaveBeenCalledWith(1);
      expect(notificationStore.notifyDeleted).toHaveBeenCalledWith('Profile 1');
      expect(store.securityProfiles).toEqual([]);
    });

    test('deleteSecurityProfile with SECURITY_PROFILE_IN_USE error', async () => {
      const error = { response: { data: { error: 'SECURITY_PROFILE_IN_USE', userCount: 5 } } };
      securityProfilesApi.deleteSecurityProfile.mockRejectedValueOnce(error);
      await store.deleteSecurityProfile({ id: 1, name: 'Profile 1' });
      expect(notificationStore.notifyError).toHaveBeenCalledWith('Cannot delete, 5 users attached to Profile 1');
    });

    test('deleteSecurityProfile with generic error', async () => {
      securityProfilesApi.deleteSecurityProfile.mockRejectedValueOnce();
      await store.deleteSecurityProfile({ id: 1, name: 'Profile 1' });
      expect(notificationStore.notifyError).toHaveBeenCalledWith('We are sorry! There is a problem with your request');
    });
  });

  describe('getters', () => {
    test('securityProfiles', () => {
      store.securityProfiles = [{ id: 1, name: 'Profile 1' }, { id: 2, name: 'Profile 2' }];
      expect(store.securityProfiles).toEqual([{ id: 1, name: 'Profile 1' }, { id: 2, name: 'Profile 2' }]);
    });

    test('securityProfilesMap', () => {
      store.securityProfiles = [{ id: 1, name: 'Profile 1' }, { id: 2, name: 'Profile 2' }];
      expect(store.securityProfilesMap).toEqual({
        1: { id: 1, name: 'Profile 1' },
        2: { id: 2, name: 'Profile 2' },
      });
    });

    test('isLoading', () => {
      expect(store.isLoading).toBe(false);
      store.loading.push('loading');
      expect(store.isLoading).toBe(true);
    });

    test('securityProfilesWithSubtitle', () => {
      store.securityProfiles = [
        { id: 1, name: 'P1', singleSignOnRequired: false, twoFactorAuthenticationRequired: false, absoluteTimeoutMinutes: null },
        { id: 2, name: 'P2', singleSignOnRequired: true, twoFactorAuthenticationRequired: false, absoluteTimeoutMinutes: null },
        { id: 3, name: 'P3', singleSignOnRequired: false, twoFactorAuthenticationRequired: true, absoluteTimeoutMinutes: null },
        { id: 4, name: 'P4', singleSignOnRequired: false, twoFactorAuthenticationRequired: false, absoluteTimeoutMinutes: 2880 },
      ];
      const result = store.securityProfilesWithSubtitle;
      expect(result).toHaveLength(4);
      expect(result[0].subtitle).toBe('');
      expect(result[1].subtitle).toBe('SSO');
      expect(result[2].subtitle).toBe('2FA');
      expect(result[3].subtitle).toContain('Log out');
    });
  });
});
