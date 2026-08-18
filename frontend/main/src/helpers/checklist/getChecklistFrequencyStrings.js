import i18n from '@/services/i18n';
import { getDaysList } from '@/helpers/days/getDays';
import { checklistTypes, periodicSubTypes, getMonthlyTriggerOccurrenceListMap } from '@/constants/checklistsConstants';
import formatSecondsFriendly from '@/helpers/time/formatSecondsFriendly';
import listToKeyMap from '@/helpers/list/listToKeyMap';
import useProfileStore from '@/stores/profile';
import { formatNumber } from '@/helpers/numbers/formatNumber';
import { formatTimeInDay } from '@/helpers/time/formatTime';

const getShiftTypeFrequencyStrings = (frequency) => {
  const parts = [];
  if (frequency.offsetFromStartSeconds !== null) {
    const label = i18n.global.t('After shift start');
    parts.push(frequency.offsetFromStartSeconds === 0 ? label : `${formatSecondsFriendly(frequency.offsetFromStartSeconds, false, false, 'min')} ${label.toLowerCase()}`);
  }
  if (frequency.offsetFromEndSeconds !== null) {
    const label = i18n.global.t('Before shift end');
    parts.push(frequency.offsetFromEndSeconds === 0 ? label : `${formatSecondsFriendly(frequency.offsetFromEndSeconds, false, false, 'min')} ${label.toLowerCase()}`);
  }
  return parts;
};

const getPeriodicTypeFrequencyStrings = (frequency) => {
  const profileStore = useProfileStore();
  const daysMap = listToKeyMap(getDaysList(profileStore.language), 'id');
  const times = frequency.times.map((time) => formatTimeInDay(time));
  if (frequency.subType === periodicSubTypes.DAILY) {
    return [i18n.global.t('Daily'), times.join(', ')];
  }
  if (frequency.subType === periodicSubTypes.WEEKLY) {
    const shortenedDays = frequency.daysOfWeek.map((day) => daysMap[day].shortText);
    return [i18n.global.t('Weekly'), shortenedDays.join(', '), times.join(', ')];
  }
  if (frequency.subType === periodicSubTypes.MONTHLY) {
    if (frequency.dayOfMonth) return [i18n.global.t('Monthly'), `${i18n.global.t('Day')} ${frequency.dayOfMonth}`, times.join(', ')];
    return [i18n.global.t('Monthly'), `${getMonthlyTriggerOccurrenceListMap()[frequency.occurrence].name} ${daysMap[frequency.dayOfWeek].text}`, times.join(', ')];
  }
};

export default (frequency) => {
  if (frequency.type === checklistTypes.MANUAL) return [i18n.global.t('Manual activation')];
  if (frequency.type === checklistTypes.CHANGEOVER) {
    let freqString;
    if (frequency.leadTime > 0) freqString = i18n.global.t('{time} before changeover', { time: formatSecondsFriendly(frequency.leadTime, false, false, 'min') });
    else if (frequency.delayTime === 0) freqString = i18n.global.t('After changeover');
    else freqString = i18n.global.t('{interval} after changeover', { interval: formatSecondsFriendly(frequency.delayTime, false, false, 'min') });
    if (frequency.intervalTime === 0) return [freqString];
    return [freqString, i18n.global.t('interval')];
  }
  if (frequency.type === checklistTypes.QUANTITY) {
    return [i18n.global.t('After {quantity} cycles', { quantity: formatNumber(frequency.targetQty, { decimalPlaces: null }) })];
  }
  if (frequency.type === checklistTypes.STOPREASON) {
    return [i18n.global.t('Stop reason')];
  }
  if (frequency.type === checklistTypes.PERIODIC) {
    return getPeriodicTypeFrequencyStrings(frequency);
  }
  if (frequency.type === checklistTypes.SHIFT) return getShiftTypeFrequencyStrings(frequency);
  return [i18n.global.t('Every {interval}', { interval: formatSecondsFriendly(frequency.intervalTime, false, false, 'min') })];
};
