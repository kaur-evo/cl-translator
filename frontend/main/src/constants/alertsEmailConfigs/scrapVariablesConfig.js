import i18n from '@/services/i18n';

export const getScrapVariablesConfig = () => [
  { displayName: i18n.global.t('Reason'), variableName: '{ScrapReason}' },
  { displayName: i18n.global.t('quantity'), variableName: '{ScrapQuantity}' },
  { displayName: i18n.global.t('Time'), variableName: '{ScrapTime}' },
];
