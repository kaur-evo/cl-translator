import { defineStore } from 'pinia';
import { fetchMFAPreference } from 'aws-amplify/auth';

import {
  roleAllows, getFactoryRole, getHighestRole, getAllowedRoutes,
} from '@/services/permissionsFactory';
import listToKeyMap from '@/helpers/list/listToKeyMap';
import userApi from '@/api/userApi';
import i18n from '@/services/i18n';
import useGenericNotificationStore from '@/stores/genericNotification';
import useStationStore from '@/stores/station';
import useShiftStore from '@/stores/shift';
import useFactoryStore from '@/stores/factory';
import {
  timeFormats, timeFormatMap, dateFormatsMap, defaultNumberFormattingOptions,
} from '@/constants/formattingConstants';
import { durationFormats } from '@/constants/durationFormat';
import { FACTORY_ADMIN, OFFICE_USER, LINEVIEW_USER } from '@/constants/userRoles';
import userHasTimeRestriction from '@/helpers/timeRestriction';

const useProfileStore = defineStore('profile', {
  state: () => ({
    currentUser: {},
    language: 'en',
    highestUserRole: null,
    userPromise: undefined,
    visibleUserRoles: [],
    MFAPreference: null,
  }),
  actions: {
    async initUser() {
      if (!this.userPromise) {
        // eslint-disable-next-line no-async-promise-executor
        const userPromise = new Promise(async (resolve) => {
          const user = await userApi.getCurrentUser();

          this.currentUser = user;
          this.highestUserRole = getHighestRole(user.roles);
          if (user.lineviewLanguages.length) {
            const language = localStorage.getItem(`lineviewLanguage${user.uuid}`);
            const userHasSetLanguage = language && user.lineviewLanguages.indexOf(language) >= 0;
            if (!userHasSetLanguage) localStorage.setItem(`lineviewLanguage${user.uuid}`, user.lineviewLanguages[0]);
            this.setLanguage(userHasSetLanguage ? language : user.lineviewLanguages[0]);
          } else {
            localStorage.setItem(`lineviewLanguage${user.uuid}`, user.language);
            this.setLanguage(user.language);
          }
          if (localStorage.getItem('currentUser') !== user.uuid) {
            localStorage.setItem('currentUser', user.uuid);
          }
          // necessary for teleporting
          if (localStorage.getItem('tenantId') !== user.tenantId) {
            localStorage.setItem('tenantId', user.tenantId);
          }

          try {
            const preference = await fetchMFAPreference();
            this.MFAPreference = preference.preferred;
          } catch {
            this.MFAPreference = null;
          }

          resolve(user);
        });
        this.userPromise = userPromise;
      }
      return this.userPromise;
    },
    async changeLanguage(params) {
      let translations;
      try {
        const response = await fetch(`/locales/${params.lang}.json`);
        if (!response.ok) {
          throw new Error(`Failed to fetch translations: ${response.status} ${response.statusText}`);
        }
        translations = await response.json();
      } catch (error) {
        useGenericNotificationStore().notifyError(error.message || error);
        return;
      }
      i18n.global.locale = params.lang;
      const sanitizedTranslations = Object.entries(translations).reduce((acc, [key, value]) => {
        // eslint-disable-next-line sonarjs/slow-regex
        acc[key] = value.replace(/{{(.*?)}}/g, (match) => match.substring(1, match.length - 1));
        return acc;
      }, {});
      i18n.global.setLocaleMessage(params.lang, sanitizedTranslations);
      if (params.setLanguage !== false) this.setLanguage(params.lang);
    },
    setLanguage(language) {
      this.language = language;
      i18n.global.locale = language;
    },
    async saveCurrentUser(user) {
      try {
        const response = await userApi.putUser(user);
        if (this.language !== user.language) {
          this.changeLanguage({ lang: user.language });
        }
        this.currentUser = response;
        useGenericNotificationStore().openNotification({
          text: i18n.global.t('Profile updated'),
          type: 'success',
        });
        return response;
      } catch (error) {
        useGenericNotificationStore().notifyError(error.response.data.message || error);
        return error;
      }
    },
    async updateCurrentUser(body) {
      try {
        const response = await userApi.patchUser(this.currentUser.username, body);
        this.currentUser = response;
        return response;
      } catch (error) {
        useGenericNotificationStore().notifyError(error.response.data.message || error);
        return error;
      }
    },
    async fetchVisibleRoles() {
      if (this.visibleUserRoles.length === 0) {
        const roles = await userApi.getVisibleRoles();
        this.visibleUserRoles = roles;
      }
    },
    setMFAPreference(preference) {
      this.MFAPreference = preference;
    },
  },
  getters: {
    shiftviewStationUserRole() {
      const { lineviewStation } = useStationStore();
      if (!lineviewStation) return null;
      if (!this.currentUser.roles) return null;
      return getFactoryRole(this.currentUser.roles, lineviewStation.factoryId);
    },
    shiftviewStationRoleAllows() {
      return (action) => roleAllows(action, this.shiftviewStationUserRole);
    },
    highestRoleAllows: (state) => (view) => roleAllows(view, state.highestUserRole),
    allowedRoutes: (state) => getAllowedRoutes(state.highestUserRole),
    currentRoles: (state) => (state.currentUser ? state.currentUser.roles : {}),
    isReadOnly() {
      if (![OFFICE_USER, LINEVIEW_USER].includes(this.shiftviewStationUserRole)) return false;
      const timeRestriction = userHasTimeRestriction(this.currentUser, useShiftStore().shift, useShiftStore().shifts, this.shiftviewStationUserRole);
      return timeRestriction || (!this.currentUser.allowedStations[useStationStore().lineviewStation.id] && !this.currentUser.allowedStations['0']);
    },
    numberFormattingOptions: (state) => {
      const {
        groupSeparator, decimalSeparator, decimalPlaces, pctDecimalPlaces,
      } = state.currentUser;
      return {
        groupSeparator: groupSeparator || defaultNumberFormattingOptions.groupSeparator,
        decimalSeparator: decimalSeparator || defaultNumberFormattingOptions.decimalSeparator,
        decimalPlaces: !decimalPlaces && decimalPlaces !== 0 ? defaultNumberFormattingOptions.decimalPlaces : decimalPlaces,
        pctDecimalPlaces: !pctDecimalPlaces && pctDecimalPlaces !== 0 ? defaultNumberFormattingOptions.pctDecimalPlaces : pctDecimalPlaces,
        language: state.language,
      };
    },
    dateFormat: (state) => {
      const userFormat = state.currentUser.dateFormat || 'DD.MM.YYYY';
      return dateFormatsMap[userFormat];
    },
    firstDayOfWeek: (state) => state.currentUser.firstDayOfWeek ?? 1,
    timeFormat: (state) => {
      const userFormat = state.currentUser.timeFormat || timeFormats['24H'];
      return timeFormatMap[userFormat];
    },
    reportsDurationFormat: (state) => state.currentUser?.reportingTimeFormat ?? durationFormats.READABLE,
    visibleUserRolesFormatted: (state) => state.visibleUserRoles.map((role) => ({ id: role, name: i18n.global.t(role) })),
    visibleUserRolesMap() {
      return listToKeyMap(this.visibleUserRolesFormatted, 'id');
    },
    userHasGlobalGroupsIcon() {
      return Object.values(this.currentRoles).includes(FACTORY_ADMIN) || useFactoryStore().hasMultipleFactories;
    },
    allowedStations: (state) => state.currentUser.allowedStations,
    allowedStationIds: (state) => Object.keys(state.currentUser.allowedStations || {}).map((id) => parseInt(id, 10)),
  },
});

export default useProfileStore;
