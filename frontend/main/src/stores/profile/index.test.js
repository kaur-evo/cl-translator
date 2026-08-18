import { AxiosError } from 'axios';
import { setActivePinia, createPinia } from 'pinia';
import { flushPromises } from '@vue/test-utils';
import { format, addDays } from 'date-fns';

import useProfileStore from '.';

import roleType, { COMPANY_ADMIN, FACTORY_ADMIN } from '@/constants/userRoles';
import MFAType from '@/constants/multiFactorAuth';
import userApi from '@/api/userApi';
import i18n from '@/services/i18n';
import {
  SHIFT_VIEW, SETTINGS, SPLIT_VIEW, ALL_FACTORIES, DASHBOARD, REPORTS, IMPROVEMENTS,
} from '@/constants/routeNames';
import { dateFormatsMap, defaultNumberFormattingOptions, timeFormatMap } from '@/constants/formattingConstants';

vi.mock('@/api/userApi');

const mockNotificationStore = {
  notifyError: vi.fn(),
  openNotification: vi.fn(),
};

const mockStationStore = {
  lineviewStation: null,
};

const mockShiftStore = {
  shift: {},
  shifts: undefined,
};

const mockFactoryStore = {
  hasMultipleFactories: false,
};

vi.mock('@/stores/genericNotification', () => ({
  default: vi.fn(() => mockNotificationStore),
  __esModule: true,
}));
vi.mock('@/stores/station', () => ({
  default: vi.fn(() => mockStationStore),
  __esModule: true,
}));
vi.mock('@/stores/shift', () => ({
  default: vi.fn(() => mockShiftStore),
  __esModule: true,
}));
vi.mock('@/stores/factory', () => ({
  default: vi.fn(() => mockFactoryStore),
  __esModule: true,
}));
vi.mock('@/services/i18n', () => ({
  default: {
    global: {
      setLocaleMessage: vi.fn(),
      t: vi.fn((s) => s),
    },
    locale: 'de',
  },
  __esModule: true,
}));

vi.stubGlobal(
  'fetch',
  vi.fn().mockImplementation(() => Promise.resolve({
    json: vi.fn().mockResolvedValue({}),
    ok: true,
  })),
);

describe('useProfileStore', () => {
  let profileStore;

  beforeEach(() => {
    vi.clearAllMocks();
    setActivePinia(createPinia());
    profileStore = useProfileStore();
    mockStationStore.lineviewStation = null;
    mockShiftStore.shift = {};
    mockShiftStore.shifts = undefined;
    mockFactoryStore.hasMultipleFactories = false;
  });

  test('initial state', () => {
    expect(profileStore.currentUser).toEqual({});
    expect(profileStore.language).toBe('en');
    expect(profileStore.highestUserRole).toBeNull();
    expect(profileStore.userPromise).toBeUndefined();
    expect(profileStore.visibleUserRoles).toEqual([]);
    expect(profileStore.MFAPreference).toBeNull();
  });

  describe('actions', () => {
    test('initUser with FACTORY_ADMIN', async () => {
      const user = {
        uuid: '123', username: 'test@user', roles: { 1: roleType.FACTORY_ADMIN, 4: roleType.FACTORY_ADMIN, 5: roleType.FACTORY_ADMIN }, language: 'et', lineviewLanguages: [],
      };
      userApi.getCurrentUser = vi.fn().mockResolvedValue(user);

      await profileStore.initUser();
      await flushPromises();
      expect(userApi.getCurrentUser).toHaveBeenCalled();
      expect(profileStore.currentUser).toEqual(user);
      expect(profileStore.highestUserRole).toBe(roleType.FACTORY_ADMIN);
      expect(profileStore.language).toBe('et');
    });

    test('initUser with LINEVIEW_USER', async () => {
      const user = {
        uuid: '123', username: 'test@user', roles: { 1: roleType.LINEVIEW_USER }, lineviewLanguages: ['en', 'de'],
      };
      userApi.getCurrentUser = vi.fn().mockResolvedValue(user);

      await profileStore.initUser();
      await flushPromises();
      expect(profileStore.currentUser).toEqual(user);
      expect(profileStore.highestUserRole).toBe(roleType.LINEVIEW_USER);
      expect(profileStore.language).toBe('en');
    });

    test('initUser when userPromise already defined', async () => {
      profileStore.userPromise = 'promise';
      const spy = vi.spyOn(userApi, 'getCurrentUser');

      await profileStore.initUser();
      expect(spy).not.toHaveBeenCalled();
    });

    test('changeLanguage', async () => {
      const language = 'de';
      await profileStore.changeLanguage({ lang: language });
      await flushPromises();

      expect(profileStore.language).toBe(language);
      expect(i18n.global.setLocaleMessage).toHaveBeenCalledTimes(1);
    });

    test('setLanguage', () => {
      const language = 'de';
      profileStore.setLanguage(language);
      expect(profileStore.language).toBe(language);
      expect(i18n.locale).toEqual(language);
    });

    test('saveCurrentUser when language is changed to not just lineview language', async () => {
      const user = {
        uuid: '123', username: 'test@user', roles: { 1: roleType.LINEVIEW_USER }, language: 'de',
      };
      userApi.putUser = vi.fn().mockResolvedValue(user);
      const changeLanguageSpy = vi.spyOn(profileStore, 'changeLanguage');

      await profileStore.saveCurrentUser(user);
      expect(userApi.putUser).toHaveBeenCalledWith(user);
      expect(changeLanguageSpy).toHaveBeenCalledWith({ lang: user.language });
      expect(profileStore.currentUser).toEqual(user);
      expect(mockNotificationStore.openNotification).toHaveBeenCalledWith({ text: i18n.global.t('Profile updated'), type: 'success' });
    });

    test('saveCurrentUser when language is not changed', async () => {
      profileStore.language = 'en';
      const user = {
        uuid: '123', username: 'test@user', roles: { 1: roleType.COMPANY_ADMIN }, language: 'en',
      };
      userApi.putUser = vi.fn().mockResolvedValue(user);
      const changeLanguageSpy = vi.spyOn(profileStore, 'changeLanguage');

      await profileStore.saveCurrentUser(user);
      expect(userApi.putUser).toHaveBeenCalledWith(user);
      expect(changeLanguageSpy).not.toHaveBeenCalled();
      expect(profileStore.currentUser).toEqual(user);
      expect(mockNotificationStore.openNotification).toHaveBeenCalledWith({ text: i18n.global.t('Profile updated'), type: 'success' });
    });

    test('saveCurrentUser with error', async () => {
      const user = {
        uuid: '123', username: 'test@user', roles: { 1: roleType.COMPANY_ADMIN }, language: 'en',
      };
      userApi.putUser = vi.fn().mockRejectedValue(new AxiosError('axios error', '409', {}, '', { data: { message: 'error from request' } }));

      await profileStore.saveCurrentUser(user);
      expect(userApi.putUser).toHaveBeenCalledWith(user);
      expect(mockNotificationStore.notifyError).toHaveBeenCalledWith('error from request');
    });

    test('if updateCurrentUser calls expected methods', async () => {
      profileStore.currentUser = { username: 'nameOfUser' };
      const body = { reportingTimeFormat: 'READABLE' };
      userApi.patchUser = vi.fn().mockResolvedValue(body);

      await profileStore.updateCurrentUser(body);
      expect(userApi.patchUser).toHaveBeenCalledWith('nameOfUser', body);
      expect(profileStore.currentUser).toEqual(body);
    });

    test('updateCurrentUser with error', async () => {
      profileStore.currentUser = { username: 'nameOfUser' };
      const body = { reportingTimeFormat: 'READABLE' };
      userApi.patchUser = vi.fn().mockRejectedValue(new AxiosError('axios error', '409', {}, '', { data: { message: 'error from request' } }));

      await profileStore.updateCurrentUser(body);
      expect(userApi.patchUser).toHaveBeenCalledWith('nameOfUser', body);
      expect(mockNotificationStore.notifyError).toHaveBeenCalledWith('error from request');
    });

    test('setMFAPreference', () => {
      profileStore.setMFAPreference(MFAType.TOTP);
      expect(profileStore.MFAPreference).toBe(MFAType.TOTP);
    });
  });

  describe('getters', () => {
    test('shiftviewStationUserRole returns role for lineview station', () => {
      profileStore.currentUser = { roles: { 1: roleType.FACTORY_ADMIN, 2: roleType.OFFICE_USER } };
      mockStationStore.lineviewStation = { factoryId: 2 };
      expect(profileStore.shiftviewStationUserRole).toBe(roleType.OFFICE_USER);
    });

    test('shiftviewStationUserRole returns null when no lineview station', () => {
      profileStore.currentUser = { roles: { 1: roleType.FACTORY_ADMIN, 2: roleType.OFFICE_USER } };
      mockStationStore.lineviewStation = null;
      expect(profileStore.shiftviewStationUserRole).toBeNull();
    });

    test('shiftviewStationRoleAllows', () => {
      profileStore.currentUser = { roles: { 1: roleType.FACTORY_ADMIN, 2: roleType.OFFICE_USER } };
      mockStationStore.lineviewStation = { factoryId: 2 };

      expect(profileStore.shiftviewStationRoleAllows(SHIFT_VIEW)).toBeTruthy();
      expect(profileStore.shiftviewStationRoleAllows(SETTINGS)).toBeFalsy();
    });

    test('highestRoleAllows', () => {
      profileStore.highestUserRole = roleType.FACTORY_ADMIN;
      expect(profileStore.highestRoleAllows(SHIFT_VIEW)).toBeTruthy();
      expect(profileStore.highestRoleAllows(SETTINGS)).toBeTruthy();

      profileStore.highestUserRole = roleType.LINEVIEW_USER;
      expect(profileStore.highestRoleAllows(SETTINGS)).toBeFalsy();
      expect(profileStore.highestRoleAllows(SHIFT_VIEW)).toBeTruthy();
    });

    test('allowedRoutes', () => {
      profileStore.highestUserRole = roleType.LINEVIEW_USER;
      expect(profileStore.allowedRoutes).toEqual([SHIFT_VIEW, SPLIT_VIEW]);

      profileStore.highestUserRole = roleType.OFFICE_USER;
      expect(profileStore.allowedRoutes).toEqual(
        [ALL_FACTORIES, REPORTS, DASHBOARD, IMPROVEMENTS, SHIFT_VIEW, SPLIT_VIEW],
      );

      profileStore.highestUserRole = roleType.COMPANY_ADMIN;
      expect(profileStore.allowedRoutes).toEqual(
        [ALL_FACTORIES, SETTINGS, REPORTS, DASHBOARD, IMPROVEMENTS, SHIFT_VIEW, SPLIT_VIEW],
      );
    });

    test('currentUser', () => {
      profileStore.currentUser = {
        uuid: '123', username: 'test@user', roles: { 1: roleType.COMPANY_ADMIN }, language: 'en',
      };
      expect(profileStore.currentUser).toEqual({
        uuid: '123', username: 'test@user', roles: { 1: roleType.COMPANY_ADMIN }, language: 'en',
      });
    });

    test('currentRoles', () => {
      profileStore.currentUser = {
        uuid: '123', username: 'test@user', roles: { 1: roleType.COMPANY_ADMIN }, language: 'en',
      };
      expect(profileStore.currentRoles).toEqual({ 1: roleType.COMPANY_ADMIN });

      profileStore.currentUser = {
        uuid: '123', username: 'test@user', roles: { 1: roleType.FACTORY_ADMIN, 2: roleType.OFFICE_USER }, language: 'en',
      };
      expect(profileStore.currentRoles).toEqual({ 1: roleType.FACTORY_ADMIN, 2: roleType.OFFICE_USER });
    });

    test('language', () => {
      profileStore.language = 'en';
      expect(profileStore.language).toBe('en');
      profileStore.language = 'et';
      expect(profileStore.language).toBe('et');
    });

    test('isReadOnly', () => {
      mockShiftStore.shift = { endTime: format(addDays(new Date(), 3), "yyyy-MM-dd'T'HH:mm:ss") };
      mockShiftStore.shifts = undefined;
      mockStationStore.lineviewStation = { id: 1, factoryId: 1 };

      profileStore.currentUser = { roles: { 1: roleType.COMPANY_ADMIN }, allowedStations: { 0: true } };
      expect(profileStore.isReadOnly).toBeFalsy();

      profileStore.currentUser = { roles: { 1: roleType.FACTORY_ADMIN }, allowedStations: { 0: true } };
      expect(profileStore.isReadOnly).toBeFalsy();

      profileStore.currentUser = { roles: { 1: roleType.OFFICE_USER }, allowedStations: { 1: true } };
      expect(profileStore.isReadOnly).toBeFalsy();

      profileStore.currentUser = { roles: { 1: roleType.OFFICE_USER }, allowedStations: { 1: false } };
      expect(profileStore.isReadOnly).toBeTruthy();

      profileStore.currentUser = { roles: { 1: roleType.LINEVIEW_USER }, allowedStations: { 1: true } };
      expect(profileStore.isReadOnly).toBeFalsy();

      profileStore.currentUser = { roles: { 1: roleType.LINEVIEW_USER }, allowedStations: { 1: false } };
      expect(profileStore.isReadOnly).toBeTruthy();
    });

    test('numberFormattingOptions', () => {
      profileStore.currentUser = {
        decimalSeparator: ',', groupSeparator: '.', decimalPlaces: 3, pctDecimalPlaces: 2,
      };
      expect(profileStore.numberFormattingOptions).toEqual({
        decimalSeparator: ',', groupSeparator: '.', decimalPlaces: 3, pctDecimalPlaces: 2, language: 'en',
      });

      profileStore.currentUser = {};
      expect(profileStore.numberFormattingOptions).toEqual({ ...defaultNumberFormattingOptions, language: 'en' });
    });

    test('dateFormat', () => {
      profileStore.currentUser = { dateFormat: 'DD.MM.YYYY' };
      expect(profileStore.dateFormat).toEqual(dateFormatsMap['DD.MM.YYYY']);

      profileStore.currentUser = { dateFormat: 'DD/MM/YYYY' };
      expect(profileStore.dateFormat).toEqual(dateFormatsMap['DD/MM/YYYY']);

      profileStore.currentUser = {};
      expect(profileStore.dateFormat).toEqual(dateFormatsMap['DD.MM.YYYY']);
    });

    test('firstDayOfWeek', () => {
      profileStore.currentUser = { firstDayOfWeek: '1' };
      expect(profileStore.firstDayOfWeek).toBe('1');

      profileStore.currentUser = { firstDayOfWeek: '0' };
      expect(profileStore.firstDayOfWeek).toBe('0');

      profileStore.currentUser = {};
      expect(profileStore.firstDayOfWeek).toBe(1);
    });

    test('timeFormat', () => {
      profileStore.currentUser = { timeFormat: 12 };
      expect(profileStore.timeFormat).toEqual(timeFormatMap[12]);

      profileStore.currentUser = { timeFormat: 24 };
      expect(profileStore.timeFormat).toEqual(timeFormatMap[24]);

      profileStore.currentUser = {};
      expect(profileStore.timeFormat).toEqual(timeFormatMap[24]);
    });

    test('userHasGlobalGroupsIcon with FACTORY_ADMIN and multiple factories', () => {
      profileStore.currentUser = { roles: { 1: FACTORY_ADMIN } };
      mockFactoryStore.hasMultipleFactories = true;
      expect(profileStore.userHasGlobalGroupsIcon).toBe(true);
    });

    test('userHasGlobalGroupsIcon with FACTORY_ADMIN and single factory', () => {
      profileStore.currentUser = { roles: { 1: FACTORY_ADMIN } };
      mockFactoryStore.hasMultipleFactories = false;
      expect(profileStore.userHasGlobalGroupsIcon).toBe(true);
    });

    test('userHasGlobalGroupsIcon with COMPANY_ADMIN and multiple factories', () => {
      profileStore.currentUser = { roles: { 0: COMPANY_ADMIN } };
      mockFactoryStore.hasMultipleFactories = true;
      expect(profileStore.userHasGlobalGroupsIcon).toBe(true);
    });

    test('userHasGlobalGroupsIcon with COMPANY_ADMIN and single factory', () => {
      profileStore.currentUser = { roles: { 0: COMPANY_ADMIN } };
      mockFactoryStore.hasMultipleFactories = false;
      expect(profileStore.userHasGlobalGroupsIcon).toBe(false);
    });

    test('allowedStationIds', () => {
      profileStore.currentUser = { allowedStations: { 1: true, 2: false, 3: true } };
      expect(profileStore.allowedStationIds).toEqual([1, 2, 3]);

      profileStore.currentUser = { allowedStations: {} };
      expect(profileStore.allowedStationIds).toEqual([]);
    });

    test('MFAPreference', () => {
      profileStore.MFAPreference = MFAType.TOTP;
      expect(profileStore.MFAPreference).toBe(MFAType.TOTP);

      profileStore.MFAPreference = MFAType.NOMFA;
      expect(profileStore.MFAPreference).toBe(MFAType.NOMFA);

      profileStore.MFAPreference = null;
      expect(profileStore.MFAPreference).toBeNull();
    });
  });
});
