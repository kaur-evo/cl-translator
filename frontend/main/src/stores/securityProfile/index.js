import { defineStore } from 'pinia';

import securityProfilesApi from '@/api/securityProfilesApi';
import listToKeyMap from '@/helpers/list/listToKeyMap';
import i18n from '@/services/i18n';
import { convertMinutesToDays } from '@/helpers/time/convertMinutesAndDays';
import useGenericNotificationStore from '@/stores/genericNotification';

const useSecurityProfileStore = defineStore('securityProfile', {
  state: () => ({
    securityProfiles: [],
    loading: [],
  }),
  actions: {
    startLoading() {
      this.loading.push('loading');
    },
    finishLoading() {
      this.loading.pop();
    },
    setSecurityProfiles(securityProfiles) {
      this.securityProfiles = securityProfiles;
    },
    saveSecurityProfileToState(securityProfile) {
      const index = this.securityProfiles.findIndex((el) => el.id === securityProfile.id);
      if (index > -1) this.securityProfiles.splice(index, 1, securityProfile);
      else this.securityProfiles.push(securityProfile);
    },
    deleteSecurityProfileFromState(id) {
      const index = this.securityProfiles.findIndex((el) => el.id === id);
      if (index > -1) this.securityProfiles.splice(index, 1);
    },
    async fetchSecurityProfiles() {
      try {
        this.startLoading();
        const securityProfiles = await securityProfilesApi.getSecurityProfiles() || [];
        this.setSecurityProfiles(securityProfiles);
      } catch {
        useGenericNotificationStore().notifyError(i18n.global.t('We are sorry! There is a problem with your request'));
      } finally {
        this.finishLoading();
      }
    },
    async saveSecurityProfile(securityProfile) {
      try {
        let response = null;
        this.startLoading();
        if (securityProfile.id) {
          response = await securityProfilesApi.updateSecurityProfile(securityProfile);
          useGenericNotificationStore().notifyUpdated(securityProfile.name);
        } else {
          response = await securityProfilesApi.saveSecurityProfile(securityProfile);
          useGenericNotificationStore().notifySuccess(i18n.global.t('{value} added, attach in user settings', { value: securityProfile.name }));
        }
        this.saveSecurityProfileToState(response);
      } catch {
        useGenericNotificationStore().notifyError(i18n.global.t('We are sorry! There is a problem with your request'));
      } finally {
        this.finishLoading();
      }
    },
    async deleteSecurityProfile(securityProfile) {
      try {
        this.startLoading();
        await securityProfilesApi.deleteSecurityProfile(securityProfile.id);
        useGenericNotificationStore().notifyDeleted(securityProfile.name);
        this.deleteSecurityProfileFromState(securityProfile.id);
      } catch (error) {
        if (error?.response?.data?.error === 'SECURITY_PROFILE_IN_USE') {
          useGenericNotificationStore().notifyError(i18n.global.t('Cannot delete, {value} users attached to {profile}', { value: error.response.data.userCount, profile: securityProfile.name }));
        } else useGenericNotificationStore().notifyError(i18n.global.t('We are sorry! There is a problem with your request'));
      } finally {
        this.finishLoading();
      }
    },
  },
  getters: {
    securityProfilesMap: (state) => listToKeyMap(state.securityProfiles, 'id'),
    securityProfilesWithSubtitle: (state) => state.securityProfiles.map((profile) => {
      const requirements = [];
      if (profile.singleSignOnRequired) {
        requirements.push('SSO');
      }
      if (profile.twoFactorAuthenticationRequired) {
        requirements.push('2FA');
      }
      if (profile.absoluteTimeoutMinutes && profile.absoluteTimeoutMinutes > 0) {
        const days = convertMinutesToDays(profile.absoluteTimeoutMinutes);
        requirements.push(`${i18n.global.t('Log out')}: ${days} ${days === 1 ? i18n.global.t('Day').toLowerCase() : i18n.global.t('daysGenitive')}`);
      }
      return {
        ...profile,
        subtitle: requirements.join(', '),
      };
    }),
    isLoading: (state) => !!state.loading.length,
  },
});

export default useSecurityProfileStore;
