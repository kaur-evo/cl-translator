import { useI18n } from 'vue-i18n';
import { computed } from 'vue';
import { DateTime } from 'luxon';

import { luxonApplyLocale } from '@/helpers/time/luxonHelpers.js';
import { viewRange } from '@/components/organisms/settings/SettingsShiftTimelineBlock/constants.js';

export const PAST_LIMIT_WEEKS = 1;
export const FUTURE_LIMIT_WEEKS = 2;


export default function useCurrentViewRange(startDate, currentRangeType) {
  const { t } = useI18n();

  function isStartDateInCurrentWeek() {
    return startDate.value.hasSame(luxonApplyLocale(DateTime.now()), 'week', { useLocaleWeeks: true });
  }

  function isStartDateInCurrentDay() {
    return startDate.value.hasSame(luxonApplyLocale(DateTime.now()), 'day', { useLocaleWeeks: true });
  }

  function resetToWeekStart() {
    // eslint-disable-next-line no-param-reassign
    startDate.value = luxonApplyLocale(DateTime.now()).startOf('week', { useLocaleWeeks: true });
  }

  function resetToDayStart() {
    // eslint-disable-next-line no-param-reassign
    startDate.value = luxonApplyLocale(DateTime.now()).startOf('day', { useLocaleWeeks: true });
  }

  function getShiftedStart(unit, direction) {
    const operation = direction === 'next' ? 'plus' : 'minus';
    const timeUnit = unit === 'day' ? { days: 1 } : { weeks: 1 };
    return luxonApplyLocale(startDate.value)[operation](timeUnit).startOf(unit, { useLocaleWeeks: true });
  }

  function setStartDateToShift(unit, direction) {
    // eslint-disable-next-line no-param-reassign
    startDate.value = getShiftedStart(unit, direction);
  }

  function isJumpDisabled(unit, direction) {
    const now = DateTime.now();
    if (direction === 'next') {
      const futureLimit = luxonApplyLocale(now).startOf('week', { useLocaleWeeks: true }).plus({ weeks: FUTURE_LIMIT_WEEKS + 1 });
      const start = getShiftedStart(unit, direction).startOf('week', { useLocaleWeeks: true });
      return futureLimit <= start;
    }
    const pastLimit = luxonApplyLocale(now).startOf('week', { useLocaleWeeks: true }).minus({ weeks: PAST_LIMIT_WEEKS + 1 });
    const start = getShiftedStart(unit, direction).startOf('week', { useLocaleWeeks: true });
    return pastLimit >= start;
  }

  function getDayConfig() {
    return {
      label: t('Day'),
      resetChipLabel: t('today'),
      isActive: isStartDateInCurrentDay(),
      isNextDisabled: isJumpDisabled('day', 'next'),
      isPreviousDisabled: isJumpDisabled('day', 'previous'),
      nextBtnTooltipText: t('Next day'),
      prevBtnTooltipText: t('Previous day'),
      onResetToCurrent: resetToDayStart,
      onNextClick: () => setStartDateToShift('day', 'next'),
      onPreviousClick: () => setStartDateToShift('day', 'previous'),
    };
  }

  function getWeekConfig() {
    return {
      label: t('Week'),
      resetChipLabel: t('thisweek'),
      isActive: isStartDateInCurrentWeek(),
      isNextDisabled: isJumpDisabled('week', 'next'),
      isPreviousDisabled: isJumpDisabled('week', 'previous'),
      nextBtnTooltipText: t('Next week'),
      prevBtnTooltipText: t('Previous week'),
      onResetToCurrent: resetToWeekStart,
      onNextClick: () => setStartDateToShift('week', 'next'),
      onPreviousClick: () => setStartDateToShift('week', 'previous'),
    };
  }

  const viewRangeConfig = computed(() => {
    switch (currentRangeType.value) {
      case viewRange.DAY:
        return getDayConfig();
      case viewRange.WEEK:
        return getWeekConfig();
      default:
        throw new Error(`Invalid view range: ${currentRangeType.value}`);
    }
  });
  return { viewRangeConfig };
}
