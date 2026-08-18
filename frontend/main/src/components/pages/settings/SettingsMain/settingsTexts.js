import {
  mdiRouterNetwork, mdiCheckDecagram, mdiTagText, mdiPlaylistCheck, mdiBellRing, mdiCalendarClock, mdiCircleMultipleOutline, mdiDownloadNetworkOutline,
  mdiMonitor, mdiMinusCircleOutline, mdiSpeedometerSlow, mdiHelpCircleOutline, mdiAccountHardHat, mdiAccount, mdiAccountGroup, mdiKey, mdiFileSearchOutline, mdiSecurity,
} from '@mdi/js';

import i18n from '@/services/i18n';
import { useFeatureStore, useConfigurationStore } from '@/stores/index';

export default function SettingIntroTexts(user, settingsAllowed, securitySettingsAllowed) {
  const featureStore = useFeatureStore();
  const configurationStore = useConfigurationStore();
  return [
    [
      {
        id: 'profile',
        header: i18n.global.t('Hi, {value}!', { value: user.fullName.split(' ')[0] }),
        name: i18n.global.t('Profile'),
        description: i18n.global.t('Manage your basic information — name, profile picture, email, and language'),
        icon: mdiAccount,
        visible: true,
        url: '/#/settings/profile',
      },
      {
        id: 'users',
        name: i18n.global.t('Users'),
        description: i18n.global.t('Control who has access to Evocon in your company and what rights they should have'),
        icon: mdiAccountGroup,
        visible: settingsAllowed,
        url: '/#/settings/users',
      },
      {
        id: 'operators',
        name: i18n.global.t('Operators'),
        description: i18n.global.t('Manage the names of your operators and the stations where they are working'),
        icon: mdiAccountHardHat,
        visible: settingsAllowed,
        url: '/#/settings/operators',
      },
    ], [
      {
        id: 'comments',
        name: i18n.global.t('Stop reasons'),
        description: i18n.global.t('Manage reasons that operators use to comment production downtime'),
        icon: mdiHelpCircleOutline,
        visible: settingsAllowed,
        url: '/#/settings/comments',
      },
      {
        id: 'speedlossreasons',
        name: i18n.global.t('Speed loss reasons'),
        description: i18n.global.t('Manage reasons that operators use to comment speed loss'),
        icon: mdiSpeedometerSlow,
        visible: settingsAllowed,
        url: '/#/settings/speedlossreasons',
      },
      {
        id: 'scrapreasons',
        name: i18n.global.t('Scrap reasons'),
        description: i18n.global.t('Manage reasons that operators use to comment quality loss'),
        icon: mdiMinusCircleOutline,
        visible: settingsAllowed,
        url: '/#/settings/scrapreasons',
      },
    ], [
      {
        id: 'stations',
        name: i18n.global.t('Stations'),
        description: i18n.global.t('Adjust station settings, like OEE targets, notification emails & empty shift reason'),
        icon: mdiMonitor,
        visible: settingsAllowed,
        url: '/#/settings/stations',
      },
      {
        id: 'positions',
        name: i18n.global.t('Machine locations'),
        description: i18n.global.t('Link reasons to specific machine locations to track exactly where issues occur'),
        icon: mdiDownloadNetworkOutline,
        visible: settingsAllowed,
        url: '/#/settings/positions',
      },
      {
        id: 'products',
        name: i18n.global.t('products'),
        description: i18n.global.t('View and manage all the products and their settings that are produced in your company'),
        icon: mdiCircleMultipleOutline,
        visible: settingsAllowed,
        url: '/#/settings/products',
      },
      {
        id: 'shifts',
        name: i18n.global.t('Shifts'),
        description: i18n.global.t('Define the work schedule of each station in your factory'),
        icon: mdiCalendarClock,
        visible: settingsAllowed,
        url: '/#/settings/shifts',
      },
    ], [
      {
        id: 'alerts',
        name: i18n.global.t('Alerts'),
        description: i18n.global.t('Use alerts to get notified about different production events'),
        icon: mdiBellRing,
        visible: settingsAllowed && featureStore.alertsEnabled,
        url: '/#/settings/alerts',
      },
      {
        id: 'checklists',
        name: i18n.global.t('Checklists'),
        description: i18n.global.t('Set up checklists to help operators in performing their daily tasks on time'),
        newIndicatorShownUntil: '2026-04-30T00:00:00',
        isSmallNewIndicator: true,
        icon: mdiPlaylistCheck,
        visible: settingsAllowed && configurationStore.adminChecklistStations?.length > 0,
        url: '/#/settings/checklists',
      },
      {
        id: 'devices',
        name: i18n.global.t('Devices'),
        description: i18n.global.t('Get an overview of the status of your Evocon devices and inputs'),
        icon: mdiRouterNetwork,
        visible: settingsAllowed,
        url: '/#/settings/devices',
      },
      {
        id: 'tags',
        name: i18n.global.t('Tags'),
        description: i18n.global.t('Use tags to connect stop reasons to your company’s analytics'),
        icon: mdiTagText,
        visible: settingsAllowed && featureStore.tagsEnabled,
        url: '/#/settings/tags',
      },
      {
        id: 'quality',
        name: i18n.global.t('quality'),
        description: i18n.global.t('Enter and manage the data on quality to get accurate OEE statistics'),
        icon: mdiCheckDecagram,
        visible: settingsAllowed && featureStore.qualityYieldEnabled,
        url: '/#/settings/quality',
      },
      {
        id: 'security',
        name: i18n.global.t('Security'),
        description: i18n.global.t('Manage SSO, 2FA, IP restrictions and other company wide preferences'),
        visible: settingsAllowed && securitySettingsAllowed && featureStore.securitySettingsEnabled,
        icon: mdiSecurity,
        url: '/#/settings/security',
      },
      {
        id: 'apikeys',
        name: i18n.global.t('API keys'),
        description: i18n.global.t('Generate unique API keys for services that need to interact with Evocon'),
        icon: mdiKey,
        visible: settingsAllowed && featureStore.apiAccessEnabled,
        url: '/#/settings/apikeys',
      },
      {
        id: 'activitylogs',
        name: i18n.global.t('Activity logs'),
        description: i18n.global.t('Get a complete overview of who did what and when in Evocon'),
        icon: mdiFileSearchOutline,
        defaultComponent: { name: 'svActivityLogsOverview' },
        subItems: [
          { name: i18n.global.t('Shift View logs'), id: 'shiftview', url: '/#/settings/activitylogs/shiftview' },
          { name: i18n.global.t('Settings logs'), id: 'settings', url: '/#/settings/activitylogs/settings' },
        ],
        visible: settingsAllowed && featureStore.activityLogsEnabled,
      },
    ],
  ];
}
