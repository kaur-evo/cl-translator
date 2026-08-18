import i18n from '@/services/i18n';

export const checklistAlertEmailConfig = {
  getEmailTemplate: () => ({
    subject: '{ChecklistName} on {Station} is {ChecklistResult}',
    message: `Checklist name: {ChecklistName}
    <br> Checklist result: {ChecklistResult}
    <br> Task results: {TaskResults}
    <br> Due time: {DueTime}
    <br> Done: {Done}
    <br> Factory: {Factory}
    <br> Station: {Station}
    <br> Shift: {Shift}
    <br> Active operators: {ActiveOperators}
    <br> Done by: {DoneBy}
    <br> Link: {ShiftURL}`,
  }),
  getVariables: () => ([
    { displayName: i18n.global.t('Factory'), variableName: '{Factory}' },
    { displayName: i18n.global.t('station'), variableName: '{Station}' },
    { displayName: i18n.global.t('Shift'), variableName: '{Shift}' },
    { displayName: i18n.global.t('Active operators'), variableName: '{ActiveOperators}' },
    { displayName: i18n.global.t('Checklist name'), variableName: '{ChecklistName}' },
    { displayName: i18n.global.t('Checklist result'), variableName: '{ChecklistResult}' },
    { displayName: i18n.global.t('Task results'), variableName: '{TaskResults}' },
    { displayName: i18n.global.t('Due time'), variableName: '{DueTime}' },
    { displayName: i18n.global.t('Done'), variableName: '{Done}' },
    { displayName: i18n.global.t('Done by'), variableName: '{DoneBy}' },
    { displayName: i18n.global.t('Shift URL'), variableName: '{ShiftURL}' },
  ].sort((a, b) => a.displayName.localeCompare(b.displayName))),
};
