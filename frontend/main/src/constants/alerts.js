import { mdiEmailAlert, mdiWebhook } from '@mdi/js';

import { stopReasonAlertEmailConfig } from './alertsEmailConfigs/stopReasonAlertEmailConfig';
import { checklistAlertEmailConfig } from './alertsEmailConfigs/checklistAlertEmailConfig';
import { defaultAlertEmailConfig } from './alertsEmailConfigs/defaultAlertEmailConfig';

import useFeatureStore from '@/stores/feature';
import i18n from '@/services/i18n';

export const alertTypes = {
  STOPREASON: 'STOPREASON',
  CHECKLIST: 'CHECKLIST',
  SCRAPREASON: 'SCRAPREASON',
  CHANGEOVER: 'CHANGEOVER',
};

export const alertSubtypes = {
  EXCEEDS: 'EXCEEDS',
  ADDED: 'ADDED',
  REPEATS: 'REPEATS',
  PLANNED_QTY: 'PLANNED_QTY',
  SCRAP_QTY: 'SCRAP_QTY',
};

export const channelTypes = {
  EMAIL: 'EMAIL',
  WEBHOOK: 'WEBHOOK',
};

export const getAlertTypesArray = () => {
  const types = [
    { id: alertTypes.STOPREASON, name: i18n.global.t('Downtime') },
    { id: alertTypes.SCRAPREASON, name: i18n.global.t('Scrap'), newIndicatorShownUntil: '2024-10-27T00:00:00' },
    { id: alertTypes.CHANGEOVER, name: i18n.global.t('Changeover'), newIndicatorShownUntil: '2024-10-27T00:00:00' },
  ];
  if (useFeatureStore().checklistsEnabled) types.push({ id: alertTypes.CHECKLIST, name: i18n.global.t('Checklists') });
  return types;
};

export const getAlertTypeById = (alertTypeId) => getAlertTypesArray().find((alertType) => alertType.id === alertTypeId);

export const getChannelTypesArray = () => [
  { id: channelTypes.EMAIL, name: i18n.global.t('Email'), icon: mdiEmailAlert },
  { id: channelTypes.WEBHOOK, name: i18n.global.t('Webhook'), icon: mdiWebhook },
];

export const getChannelTypeById = (channelTypeId) => getChannelTypesArray().find((channelType) => channelType.id === channelTypeId);

export const getEmailTemplate = (alertType, alertSubtype) => {
  if (alertType === alertTypes.STOPREASON) return stopReasonAlertEmailConfig.getEmailTemplate(alertSubtype);
  if (alertType === alertTypes.CHECKLIST) return checklistAlertEmailConfig.getEmailTemplate();
  return defaultAlertEmailConfig.getEmailTemplate(alertType, alertSubtype);
};

export const getAlertVariables = (alertType, alertSubtype) => {
  if (alertType === alertTypes.STOPREASON) return stopReasonAlertEmailConfig.getVariables(alertSubtype);
  if (alertType === alertTypes.CHECKLIST) return checklistAlertEmailConfig.getVariables();
  return defaultAlertEmailConfig.getVariables(alertType, alertSubtype);
};
