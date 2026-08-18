import { getScrapVariablesConfig } from './scrapVariablesConfig';
import { getChangeoverVariablesConfig } from './changeoverVariablesConfig';

import i18n from '@/services/i18n';

const defaultEmailTemplate = {
  subject: '',
  message: `Station: {Station}
  <br> Shift: {Shift}
  <br> Active operators: {ActiveOperators}
  <br> Link: {ShiftURL}`,
};

const getDefaultVariables = () => ([
  { displayName: i18n.global.t('Factory'), variableName: '{Factory}' },
  { displayName: i18n.global.t('station'), variableName: '{Station}' },
  { displayName: i18n.global.t('Shift'), variableName: '{Shift}' },
  { displayName: i18n.global.t('Product'), variableName: '{Product}' },
  { displayName: i18n.global.t('Product code'), variableName: '{ProductCode}' },
  { displayName: i18n.global.t('Active operators'), variableName: '{ActiveOperators}' },
  { displayName: i18n.global.t('Extra note'), variableName: '{Note}' },
  { displayName: i18n.global.t('Shift URL'), variableName: '{ShiftURL}' },
]);

export const defaultAlertEmailConfig = {
  getEmailTemplate: (alertType, alertSubtype) => {
    if (alertType === 'SCRAPREASON') {
      return { subject: '{ScrapReason} ({ScrapQuantity}) on {Station}', message: defaultEmailTemplate.message };
    }
    if (alertType === 'CHANGEOVER') {
      if (alertSubtype === 'ADDED') return { subject: 'Changeover added - {Product} on {Station}', message: defaultEmailTemplate.message };
      return { subject: 'Target reached - {Product} on {Station}', message: defaultEmailTemplate.message };
    }
    return { subject: defaultEmailTemplate.subject, message: defaultEmailTemplate.message };
  },

  getVariables: (alertType, subType) => {
    let variables;
    if (alertType === 'SCRAPREASON') {
      variables = [...getDefaultVariables(), ...getScrapVariablesConfig()];
    } else if (alertType === 'CHANGEOVER') {
      variables = [...getDefaultVariables(), ...getChangeoverVariablesConfig(subType)];
    } else {
      variables = getDefaultVariables();
    }
    return variables.sort((a, b) => a.displayName.localeCompare(b.displayName));
  },
};
