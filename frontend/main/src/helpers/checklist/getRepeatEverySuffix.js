import i18n from '@/services/i18n';
import { periodicSubTypes } from '@/constants/checklistsConstants';

export const getRepeatEverySuffix = (frequency) => {
  let suffix = '';
  if (frequency.subType === periodicSubTypes.WEEKLY) {
    suffix = frequency.repeatEvery === 1 ? i18n.global.t('Week') : i18n.global.t('Weeks');
  } else if (frequency.subType === periodicSubTypes.MONTHLY) {
    suffix = frequency.repeatEvery === 1 ? i18n.global.t('Month') : i18n.global.t('Months');
  }
  return suffix.toLowerCase();
};
