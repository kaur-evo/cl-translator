import { ref } from 'vue';
import { DateTime } from 'luxon';

import useCurrentViewRange from './useCurrentViewRange';

import { viewRange } from '@/components/organisms/settings/SettingsShiftTimelineBlock/constants.js';
import { FUTURE_LIMIT_WEEKS, PAST_LIMIT_WEEKS } from '@/components/organisms/settings/SettingsShiftTimelineBlock/useCurrentViewRange.js';
vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key) => key,
  }),
}));

vi.mock('@/helpers/time/luxonHelpers.js', () => ({
  luxonApplyLocale: (date) => date.setLocale('en-US'),
}));

describe('useCurrentViewRange', () => {
  let startDate;
  let currentRangeType;

  beforeEach(() => {
    startDate = ref(DateTime.now());
    currentRangeType = ref(viewRange.DAY);
  });

  describe('isStartDateInCurrentWeek', () => {
    it('should return true if startDate is in the current week', () => {
      const { viewRangeConfig } = useCurrentViewRange(startDate, currentRangeType);
      expect(viewRangeConfig.value.isActive).toBe(true);
    });

    it('should return false if startDate is not in the current week', () => {
      startDate.value = DateTime.now().minus({ weeks: 2 });
      const { viewRangeConfig } = useCurrentViewRange(startDate, currentRangeType);
      expect(viewRangeConfig.value.isActive).toBe(false);
    });
  });

  describe('isStartDateInCurrentDay', () => {
    it('should return true if startDate is in the current day', () => {
      const { viewRangeConfig } = useCurrentViewRange(startDate, currentRangeType);
      expect(viewRangeConfig.value.isActive).toBe(true);
    });

    it('should return false if startDate is not in the current day', () => {
      startDate.value = DateTime.now().minus({ days: 2 });
      const { viewRangeConfig } = useCurrentViewRange(startDate, currentRangeType);
      expect(viewRangeConfig.value.isActive).toBe(false);
    });
  });

  describe('resetToDayStart', () => {
    it('should reset startDate to the start of the current day', () => {
      currentRangeType.value = viewRange.DAY;
      const { viewRangeConfig } = useCurrentViewRange(startDate, currentRangeType);
      viewRangeConfig.value.onResetToCurrent();
      expect(startDate.value.toISODate()).toBe(DateTime.now().startOf('day').toISODate());
    });
  });

  describe('isJumpDisabled', () => {
    it('should disable jumping to the next week if it exceeds the future limit', () => {
      startDate.value = DateTime.now().setLocale('en-GB').plus({ weeks: 3 });
      const { viewRangeConfig } = useCurrentViewRange(startDate, currentRangeType);
      expect(viewRangeConfig.value.isNextDisabled).toBe(true);
    });

    it('should disable jumping to the previous week if it exceeds the past limit', () => {
      startDate.value = DateTime.now().setLocale('en-GB').minus({ weeks: 2 });
      const { viewRangeConfig } = useCurrentViewRange(startDate, currentRangeType);
      expect(viewRangeConfig.value.isPreviousDisabled).toBe(true);
    });

    it('should allow jumping to the exact future limit', () => {
      startDate.value = DateTime.now().setLocale('en-GB').plus({ weeks: FUTURE_LIMIT_WEEKS });
      const { viewRangeConfig } = useCurrentViewRange(startDate, currentRangeType);
      expect(viewRangeConfig.value.isNextDisabled).toBe(false);
    });

    it('should allow jumping to the exact past limit', () => {
      startDate.value = DateTime.now().setLocale('en-GB').minus({ weeks: PAST_LIMIT_WEEKS });
      const { viewRangeConfig } = useCurrentViewRange(startDate, currentRangeType);
      expect(viewRangeConfig.value.isPreviousDisabled).toBe(false);
    });
  });

  describe('setStartDateToShift', () => {
    it('should shift startDate to the next day', () => {
      currentRangeType.value = viewRange.DAY;
      const { viewRangeConfig } = useCurrentViewRange(startDate, currentRangeType);
      viewRangeConfig.value.onNextClick();
      expect(startDate.value.toISODate()).toBe(DateTime.now().setLocale('en-US').plus({ days: 1 }).startOf('day', { useLocaleWeeks: true }).toISODate());
    });

    it('should shift startDate to the previous week', () => {
      currentRangeType.value = viewRange.WEEK;
      const { viewRangeConfig } = useCurrentViewRange(startDate, currentRangeType);
      viewRangeConfig.value.onPreviousClick();
      expect(startDate.value.toISODate()).toBe(DateTime.now().setLocale('en-US').startOf('week', { useLocaleWeeks: true }).minus({ weeks: 1 }).toISODate());
    });

    it('should shift startDate to the next week', () => {
      currentRangeType.value = viewRange.WEEK;
      const { viewRangeConfig } = useCurrentViewRange(startDate, currentRangeType);
      viewRangeConfig.value.onNextClick();
      expect(startDate.value.toISODate()).toBe(DateTime.now().setLocale('en-US').plus({ weeks: 1 }).startOf('week', { useLocaleWeeks: true }).toISODate());
    });

    it('should shift startDate to the previous day', () => {
      currentRangeType.value = viewRange.DAY;
      const { viewRangeConfig } = useCurrentViewRange(startDate, currentRangeType);
      viewRangeConfig.value.onPreviousClick();
      expect(startDate.value.toISODate()).toBe(DateTime.now().setLocale('en-US').minus({ days: 1 }).startOf('day', { useLocaleWeeks: true }).toISODate());
    });
  });
  describe('resetToWeekStart', () => {
    it('should reset startDate to the start of the current week', () => {
      currentRangeType.value = viewRange.WEEK;
      const { viewRangeConfig } = useCurrentViewRange(startDate, currentRangeType);
      viewRangeConfig.value.onResetToCurrent();
      expect(startDate.value.toISODate()).toBe(DateTime.now().setLocale('en-US').startOf('week', { useLocaleWeeks: true }).toISODate());
    });
  });

  describe('getDayConfig', () => {
    it('should return correct configuration for day view', () => {
      currentRangeType.value = viewRange.DAY;
      const { viewRangeConfig } = useCurrentViewRange(startDate, currentRangeType);
      const config = viewRangeConfig.value;

      expect(config.label).toBe('Day');
      expect(config.resetChipLabel).toBe('today');
      expect(config.isActive).toBe(true);
      expect(config.isNextDisabled).toBe(false);
      expect(config.isPreviousDisabled).toBe(false);
      expect(config.nextBtnTooltipText).toBe('Next day');
      expect(config.prevBtnTooltipText).toBe('Previous day');
    });
  });

  describe('getWeekConfig', () => {
    it('should return correct configuration for week view', () => {
      currentRangeType.value = viewRange.WEEK;
      const { viewRangeConfig } = useCurrentViewRange(startDate, currentRangeType);
      const config = viewRangeConfig.value;

      expect(config.label).toBe('Week');
      expect(config.resetChipLabel).toBe('thisweek');
      expect(config.isActive).toBe(true);
      expect(config.isNextDisabled).toBe(false);
      expect(config.isPreviousDisabled).toBe(false);
      expect(config.nextBtnTooltipText).toBe('Next week');
      expect(config.prevBtnTooltipText).toBe('Previous week');
    });
  });
});
