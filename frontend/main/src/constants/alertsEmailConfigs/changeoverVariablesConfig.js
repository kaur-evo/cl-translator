import i18n from '@/services/i18n';

export const getChangeoverVariablesConfig = (subType) => {
  const variables = [
    { displayName: i18n.global.t('Order'), variableName: '{OrderNumber}' },
    { displayName: i18n.global.t('LOT/Batch'), variableName: '{Lot/Batch}' },
    { displayName: i18n.global.t('Target quantity'), variableName: '{TargetQuantity}' },
  ];
  if (subType === 'PLANNED_QTY') {
    variables.push({ displayName: i18n.global.t('Time'), variableName: '{TargetReachedTime}' });
  } else {
    variables.push({ displayName: i18n.global.t('Time'), variableName: '{BatchStartTime}' });
  }
  return variables;
};
