import { mdiSecurity, mdiAccountCircle, mdiAccountSupervisorCircle, mdiEarth } from '@mdi/js';

import i18n from '@/services/i18n';
import openSupportDialog from '@/helpers/support/openSupportDialog';

export const getSecuritySettingsSections = () => [
  {
    titleKey: 'users',
    title: i18n.global.t('Users'),
    items: [
      {
        key: 'securityProfiles',
        primaryText: i18n.global.t('Security profiles'),
        secondaryText: i18n.global.t('Set login & security rules for users'),
        icon: mdiSecurity,
        url: '/#/settings/security/securityprofiles',
      },
      {
        key: 'sso',
        primaryText: 'SSO',
        secondaryText: i18n.global.t('Setup single-sign on'),
        icon: mdiAccountCircle,
        dialogConfig: {
          title: i18n.global.t('Single sign-on (SSO)'),
          text: i18n.global.t('To manage SSO setup, please contact our support.'),
          confirmText: i18n.global.t('Contact support'),
          cancelText: i18n.global.t('Cancel'),
          color: 'primary',
          action: openSupportDialog,
        },
      },
      {
        key: 'scim',
        primaryText: 'SCIM',
        secondaryText: i18n.global.t('Setup user provisioning'),
        icon: mdiAccountSupervisorCircle,
        dialogConfig: {
          title: 'SCIM',
          text: i18n.global.t('To manage SCIM, please contact our support.'),
          confirmText: i18n.global.t('Contact support'),
          cancelText: i18n.global.t('Cancel'),
          color: 'primary',
          action: openSupportDialog,
        },
      },
    ],
  },
  {
    titleKey: 'network',
    title: i18n.global.t('Network'),
    items: [
      {
        key: 'allowedIps',
        primaryText: i18n.global.t('Allowed IPs'),
        secondaryText: i18n.global.t('Define connections that can use Evocon'),
        icon: mdiEarth,
        url: '/#/settings/security/allowedips',
      },
    ],
  },
];
