import i18n from '@/services/i18n';

const defaultEmailTemplate = {
  subject: '{Reason} on {Station}',
  message: `Stop reason: {Reason}
  <br> Note: {Note}
  <br> Start time: {StartTime}
  <br> Duration: {Duration}
  <br> Factory: {Factory}
  <br> Station: {Station}
  <br> Machine location: {Location}
  <br> Product: {Product}
  <br> Product code: {ProductCode}
  <br> Shift: {Shift}
  <br> Active operators: {ActiveOperators}
  <br> Link: {ShiftURL} `,
};

const getDefaultVariables = () => ([
  { displayName: i18n.global.t('Factory'), variableName: '{Factory}' },
  { displayName: i18n.global.t('station'), variableName: '{Station}' },
  { displayName: i18n.global.t('Shift'), variableName: '{Shift}' },
  { displayName: i18n.global.t('Product'), variableName: '{Product}' },
  { displayName: i18n.global.t('Product code'), variableName: '{ProductCode}' },
  { displayName: i18n.global.t('Active operators'), variableName: '{ActiveOperators}' },
  { displayName: i18n.global.t('Reason'), variableName: '{Reason}' },
  { displayName: i18n.global.t('Extra note'), variableName: '{Note}' },
  { displayName: i18n.global.t('Start time'), variableName: '{StartTime}' },
  { displayName: i18n.global.t('Duration'), variableName: '{Duration}' },
  { displayName: i18n.global.t('Machine location'), variableName: '{Location}' },
  { displayName: i18n.global.t('Shift URL'), variableName: '{ShiftURL}' },
  { displayName: i18n.global.t('Loss'), variableName: '{Loss}' },
]);

export const stopReasonAlertEmailConfig = {
  getEmailTemplate: (alertSubtype) => {
    if (alertSubtype === 'REPEATS') return { subject: '{Reason} ({Count}) on {Station}', message: defaultEmailTemplate.message };
    return { subject: defaultEmailTemplate.subject, message: defaultEmailTemplate.message };
  },

  getVariables: (alertSubtype) => {
    let variables;
    if (alertSubtype === 'REPEATS') variables = [...getDefaultVariables(), { displayName: i18n.global.t('Count'), variableName: '{Count}' }];
    else variables = getDefaultVariables();
    return variables.sort((a, b) => a.displayName.localeCompare(b.displayName));
  },
};
