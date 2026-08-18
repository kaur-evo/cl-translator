import { flushPromises, shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import ChecklistPeriodicTrigger from './index.vue';

import { getDaysList } from '@/helpers/days/getDays';
import { checklistTypes, periodicSubTypes, monthlyTriggerModes, getMonthlyTriggerOccurrenceList } from '@/constants/checklistsConstants';

const dailyTriggerDefaultProps = {
  requirements: {
    type: checklistTypes.PERIODIC,
    subType: periodicSubTypes.DAILY,
    times: ['08:00', '14:00'],
  },
};

const weeklyTriggerDefaultProps = {
  requirements: {
    type: checklistTypes.PERIODIC,
    subType: periodicSubTypes.WEEKLY,
    repeatEvery: 1,
    daysOfWeek: [],
    times: ['08:00', '14:00'],
  },
};

const monthlyTriggerDefaultProps = {
  requirements: {
    type: checklistTypes.PERIODIC,
    subType: periodicSubTypes.MONTHLY,
    currentMonthlyTriggerMode: null,
    repeatEvery: 1,
    dayOfMonth: null,
    dayOfWeek: null,
    occurrence: null,
    times: ['08:00', '14:00'],
  },
};

describe('ChecklistPeriodicTrigger', () => {
  test('that DAILY trigger renders correctly', () => {
    const wrapper = shallowMount(ChecklistPeriodicTrigger, {
      global: { plugins: [createTestingPinia({ createSpy: vi.fn, stubActions: false })] },
      props: { ...dailyTriggerDefaultProps },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  test('that WEEKLY trigger renders correctly', () => {
    const wrapper = shallowMount(ChecklistPeriodicTrigger, {
      global: { plugins: [createTestingPinia({ createSpy: vi.fn, stubActions: false })] },
      props: { ...weeklyTriggerDefaultProps },
    });

    expect(wrapper.element).toMatchSnapshot();
    expect(wrapper.vm.isWeeklyTrigger).toBe(true);
  });

  test('that MONTHLY trigger renders correctly', () => {
    const wrapper = shallowMount(ChecklistPeriodicTrigger, {
      global: { plugins: [createTestingPinia({ createSpy: vi.fn, stubActions: false })] },
      props: { ...monthlyTriggerDefaultProps },
    });

    expect(wrapper.element).toMatchSnapshot();
    expect(wrapper.vm.isMonthlyTrigger).toBe(true);
  });

  describe('isOnCalendarDayTriggerSelected', () => {
    it('returns false if currentMonthlyTriggerMode is ON_WEEKDAY', () => {
      const wrapper = shallowMount(ChecklistPeriodicTrigger, {
        global: { plugins: [createTestingPinia({ createSpy: vi.fn, stubActions: false })] },
        props: {
          ...monthlyTriggerDefaultProps,
          requirements: { ...monthlyTriggerDefaultProps.requirements, currentMonthlyTriggerMode: monthlyTriggerModes.ON_WEEKDAY },
        },
      });

      expect(wrapper.vm.isOnCalendarDayTriggerSelected).toBe(false);
    });

    it('returns true if currentMonthlyTriggerMode is ON_CALENDAR_DAY', () => {
      const wrapper = shallowMount(ChecklistPeriodicTrigger, {
        global: { plugins: [createTestingPinia({ createSpy: vi.fn, stubActions: false })] },
        props: {
          ...monthlyTriggerDefaultProps,
          requirements: { ...monthlyTriggerDefaultProps.requirements, currentMonthlyTriggerMode: monthlyTriggerModes.ON_CALENDAR_DAY },
        },
      });

      expect(wrapper.vm.isOnCalendarDayTriggerSelected).toBe(true);
    });
  });

  describe('hasRepeatEveryError', () => {
    it('returns false for the DAILY trigger', () => {
      const wrapper = shallowMount(ChecklistPeriodicTrigger, {
        global: { plugins: [createTestingPinia({ createSpy: vi.fn, stubActions: false })] },
        props: { ...dailyTriggerDefaultProps },
      });

      expect(wrapper.vm.hasRepeatEveryError).toBe(false);
    });

    it('returns false if repeatEvery is between 1 and 50 for the WEEKLY trigger', () => {
      const wrapper = shallowMount(ChecklistPeriodicTrigger, {
        global: { plugins: [createTestingPinia({ createSpy: vi.fn, stubActions: false })] },
        props: {
          ...weeklyTriggerDefaultProps,
          requirements: { ...weeklyTriggerDefaultProps.requirements, repeatEvery: 25 },
        },
      });

      expect(wrapper.vm.hasRepeatEveryError).toBe(false);
    });

    it('returns true if repeatEvery is 0 for the WEEKLY trigger', () => {
      const wrapper = shallowMount(ChecklistPeriodicTrigger, {
        global: { plugins: [createTestingPinia({ createSpy: vi.fn, stubActions: false })] },
        props: {
          ...weeklyTriggerDefaultProps,
          requirements: { ...weeklyTriggerDefaultProps.requirements, repeatEvery: 0 },
        },
      });

      expect(wrapper.vm.hasRepeatEveryError).toBe(true);
    });

    it('returns true if repeatEvery is 51 for the WEEKLY trigger', () => {
      const wrapper = shallowMount(ChecklistPeriodicTrigger, {
        global: { plugins: [createTestingPinia({ createSpy: vi.fn, stubActions: false })] },
        props: {
          ...weeklyTriggerDefaultProps,
          requirements: { ...weeklyTriggerDefaultProps.requirements, repeatEvery: 51 },
        },
      });

      expect(wrapper.vm.hasRepeatEveryError).toBe(true);
    });

    it('returns false if repeatEvery is between 1 and 12 for the MONTHLY trigger', () => {
      const wrapper = shallowMount(ChecklistPeriodicTrigger, {
        global: { plugins: [createTestingPinia({ createSpy: vi.fn, stubActions: false })] },
        props: {
          ...monthlyTriggerDefaultProps,
          requirements: { ...monthlyTriggerDefaultProps.requirements, repeatEvery: 6 },
        },
      });

      expect(wrapper.vm.hasRepeatEveryError).toBe(false);
    });

    it('returns true if repeatEvery is 0 for the MONTHLY trigger', () => {
      const wrapper = shallowMount(ChecklistPeriodicTrigger, {
        global: { plugins: [createTestingPinia({ createSpy: vi.fn, stubActions: false })] },
        props: {
          ...monthlyTriggerDefaultProps,
          requirements: { ...monthlyTriggerDefaultProps.requirements, repeatEvery: 0 },
        },
      });

      expect(wrapper.vm.hasRepeatEveryError).toBe(true);
    });

    it('returns true if repeatEvery is 13 for the MONTHLY trigger', () => {
      const wrapper = shallowMount(ChecklistPeriodicTrigger, {
        global: { plugins: [createTestingPinia({ createSpy: vi.fn, stubActions: false })] },
        props: {
          ...monthlyTriggerDefaultProps,
          requirements: { ...monthlyTriggerDefaultProps.requirements, repeatEvery: 13 },
        },
      });

      expect(wrapper.vm.hasRepeatEveryError).toBe(true);
    });
  });

  describe('hasDayOfMonthError', () => {
    it('returns false if ON_WEEKDAY mode is selected', () => {
      const wrapper = shallowMount(ChecklistPeriodicTrigger, {
        global: { plugins: [createTestingPinia({ createSpy: vi.fn, stubActions: false })] },
        props: {
          ...monthlyTriggerDefaultProps,
          requirements: { ...monthlyTriggerDefaultProps.requirements, currentMonthlyTriggerMode: monthlyTriggerModes.ON_WEEKDAY },
        },
      });

      expect(wrapper.vm.hasDayOfMonthError).toBe(false);
    });

    it('returns false if dayOfMonth is null', () => {
      const wrapper = shallowMount(ChecklistPeriodicTrigger, {
        global: { plugins: [createTestingPinia({ createSpy: vi.fn, stubActions: false })] },
        props: {
          ...monthlyTriggerDefaultProps,
          requirements: {
            ...monthlyTriggerDefaultProps.requirements,
            currentMonthlyTriggerMode: monthlyTriggerModes.ON_CALENDAR_DAY,
            dayOfMonth: null,
          },
        },
      });

      expect(wrapper.vm.hasDayOfMonthError).toBe(false);
    });

    it('returns false if dayOfMonth is between 1 and 31', () => {
      const wrapper = shallowMount(ChecklistPeriodicTrigger, {
        global: { plugins: [createTestingPinia({ createSpy: vi.fn, stubActions: false })] },
        props: {
          ...monthlyTriggerDefaultProps,
          requirements: {
            ...monthlyTriggerDefaultProps.requirements,
            currentMonthlyTriggerMode: monthlyTriggerModes.ON_CALENDAR_DAY,
            dayOfMonth: 15,
          },
        },
      });

      expect(wrapper.vm.hasDayOfMonthError).toBe(false);
    });

    it('returns true if dayOfMonth is 0', () => {
      const wrapper = shallowMount(ChecklistPeriodicTrigger, {
        global: { plugins: [createTestingPinia({ createSpy: vi.fn, stubActions: false })] },
        props: {
          ...monthlyTriggerDefaultProps,
          requirements: {
            ...monthlyTriggerDefaultProps.requirements,
            currentMonthlyTriggerMode: monthlyTriggerModes.ON_CALENDAR_DAY,
            dayOfMonth: 0,
          },
        },
      });

      expect(wrapper.vm.hasDayOfMonthError).toBe(true);
    });

    it('returns true if dayOfMonth is 32', () => {
      const wrapper = shallowMount(ChecklistPeriodicTrigger, {
        global: { plugins: [createTestingPinia({ createSpy: vi.fn, stubActions: false })] },
        props: {
          ...monthlyTriggerDefaultProps,
          requirements: {
            ...monthlyTriggerDefaultProps.requirements,
            currentMonthlyTriggerMode: monthlyTriggerModes.ON_CALENDAR_DAY,
            dayOfMonth: 32,
          },
        },
      });

      expect(wrapper.vm.hasDayOfMonthError).toBe(true);
    });
  });

  test('that repeatEveryErrorText returns correct text', () => {
    const wrapper = shallowMount(ChecklistPeriodicTrigger, {
      global: { plugins: [createTestingPinia({ createSpy: vi.fn, stubActions: false })] },
      props: { ...weeklyTriggerDefaultProps },
    });

    expect(wrapper.vm.repeatEveryErrorText).toBe('Value must be between {min} and {max}');
  });

  describe('onSelectSubType', () => {
    it('emits update:requirements with monthly defaults and subType if subType is MONTHLY', () => {
      const language = 'en';
      const firstDayOfWeek = 1;
      const wrapper = shallowMount(ChecklistPeriodicTrigger, {
        global: {
          plugins: [createTestingPinia({
            createSpy: vi.fn,
            stubActions: false,
            initialState: { profile: { language, currentUser: { firstDayOfWeek } } },
          })],
        },
        props: { requirements: { type: checklistTypes.PERIODIC, times: [''] } },
      });

      wrapper.vm.onSelectSubType(periodicSubTypes.MONTHLY);

      expect(wrapper.emitted('update:requirements')[0][0]).toEqual({
        type: checklistTypes.PERIODIC,
        times: [''],
        repeatEvery: 1,
        dayOfMonth: null,
        dayOfWeek: getDaysList(language, firstDayOfWeek)[0].id,
        occurrence: getMonthlyTriggerOccurrenceList()[0].id,
      });
      expect(wrapper.emitted('update:requirements')[1][0]).toEqual({ subType: periodicSubTypes.MONTHLY });
    });

    it('emits update:requirements with subType and repeatEvery as 1 if subType is WEEKLY', () => {
      const wrapper = shallowMount(ChecklistPeriodicTrigger, {
        global: { plugins: [createTestingPinia({ createSpy: vi.fn, stubActions: false })] },
        props: { requirements: { type: checklistTypes.PERIODIC, times: [''] } },
      });

      wrapper.vm.onSelectSubType(periodicSubTypes.WEEKLY);

      expect(wrapper.emitted('update:requirements')[0][0]).toEqual({ subType: periodicSubTypes.WEEKLY, repeatEvery: 1 });
    });

    it('emits update:requirements with subType if subType is DAILY', () => {
      const wrapper = shallowMount(ChecklistPeriodicTrigger, {
        global: { plugins: [createTestingPinia({ createSpy: vi.fn, stubActions: false })] },
        props: { requirements: { type: checklistTypes.PERIODIC, times: [''] } },
      });

      wrapper.vm.onSelectSubType(periodicSubTypes.DAILY);

      expect(wrapper.emitted('update:requirements')[0][0]).toEqual({ subType: periodicSubTypes.DAILY });
    });
  });

  describe('hasTimeError', () => {
    it('returns true for duplicated times', () => {
      const wrapper = shallowMount(ChecklistPeriodicTrigger, {
        global: { plugins: [createTestingPinia({ createSpy: vi.fn, stubActions: false })] },
        props: { ...dailyTriggerDefaultProps, requirements: { ...dailyTriggerDefaultProps.requirements, times: ['12:00', '12:00', '13:00'] } },
      });

      expect(wrapper.vm.hasTimeError(0)).toBe(true);
      expect(wrapper.vm.hasTimeError(1)).toBe(true);
      expect(wrapper.vm.hasTimeError(2)).toBe(false);
    });

    it('returns true for empty time if hasTimeValidationError is true', () => {
      const wrapper = shallowMount(ChecklistPeriodicTrigger, {
        global: { plugins: [createTestingPinia({ createSpy: vi.fn, stubActions: false })] },
        props: { ...dailyTriggerDefaultProps, requirements: { ...dailyTriggerDefaultProps.requirements, times: ['', '13:00'] } },
      });

      wrapper.vm.hasTimeValidationError = true;
      expect(wrapper.vm.hasTimeError(0)).toBe(true);
      expect(wrapper.vm.hasTimeError(1)).toBe(false);
    });

    it('returns false for valid unique times', () => {
      const wrapper = shallowMount(ChecklistPeriodicTrigger, {
        global: { plugins: [createTestingPinia({ createSpy: vi.fn, stubActions: false })] },
        props: { ...dailyTriggerDefaultProps, requirements: { ...dailyTriggerDefaultProps.requirements, times: ['08:00', '12:00', '13:00'] } },
      });

      expect(wrapper.vm.hasTimeError(0)).toBe(false);
      expect(wrapper.vm.hasTimeError(1)).toBe(false);
      expect(wrapper.vm.hasTimeError(2)).toBe(false);
    });
  });

  test('that reOrderTimes emits correct times array', async () => {
    const wrapper = shallowMount(ChecklistPeriodicTrigger, {
      global: { plugins: [createTestingPinia({ createSpy: vi.fn, stubActions: false })] },
      props: { ...dailyTriggerDefaultProps, requirements: { ...dailyTriggerDefaultProps.requirements, times: ['18:00', '08:00', '12:00'] } },
    });

    await wrapper.vm.reOrderTimes();
    const emittedLength = wrapper.emitted('update:requirements').length;
    expect(wrapper.emitted()['update:requirements'][emittedLength - 1][0].times).toEqual(['08:00', '12:00', '18:00']);
  });

  test('that onTimeInput emits correct times array', () => {
    const wrapper = shallowMount(ChecklistPeriodicTrigger, {
      global: { plugins: [createTestingPinia({ createSpy: vi.fn, stubActions: false })] },
      props: { ...dailyTriggerDefaultProps, requirements: { ...dailyTriggerDefaultProps.requirements, times: ['08:00', '12:00'] } },
    });

    wrapper.vm.onTimeInput('20:00', 0);
    const emittedLength = wrapper.emitted('update:requirements').length;
    expect(wrapper.emitted()['update:requirements'][emittedLength - 1][0].times).toEqual(['20:00', '12:00']);
  });

  test('that onRemoveTime emits correct times array', () => {
    const wrapper = shallowMount(ChecklistPeriodicTrigger, {
      global: { plugins: [createTestingPinia({ createSpy: vi.fn, stubActions: false })] },
      props: { ...dailyTriggerDefaultProps, requirements: { ...dailyTriggerDefaultProps.requirements, times: ['08:00', '12:00', '13:00'] } },
    });

    wrapper.vm.onRemoveTime(1);
    const emittedLength = wrapper.emitted('update:requirements').length;
    expect(wrapper.emitted()['update:requirements'][emittedLength - 1][0].times).toEqual(['08:00', '13:00']);
  });

  test('that onAddTime emits correct times array', () => {
    const wrapper = shallowMount(ChecklistPeriodicTrigger, {
      global: { plugins: [createTestingPinia({ createSpy: vi.fn, stubActions: false })] },
      props: { ...dailyTriggerDefaultProps, requirements: { ...dailyTriggerDefaultProps.requirements, times: ['08:00', '12:00'] } },
    });

    wrapper.vm.onAddTime();
    const emittedLength = wrapper.emitted('update:requirements').length;
    expect(wrapper.emitted()['update:requirements'][emittedLength - 1][0].times).toEqual(['08:00', '12:00', '']);
  });

  describe('isTriggerComplete', () => {
    it('returns false if some time input is empty', async () => {
      const wrapper = shallowMount(ChecklistPeriodicTrigger, {
        global: { plugins: [createTestingPinia({ createSpy: vi.fn, stubActions: false })] },
        props: {
          ...dailyTriggerDefaultProps,
          requirements: { ...dailyTriggerDefaultProps.requirements, times: ['08:00', ''] },
        },
      });

      expect(wrapper.vm.isTriggerComplete).toBe(false);

      await wrapper.setProps({
        ...weeklyTriggerDefaultProps,
        requirements: { ...weeklyTriggerDefaultProps.requirements, times: ['08:00', ''] },
      });

      expect(wrapper.vm.isTriggerComplete).toBe(false);

      await wrapper.setProps({
        ...monthlyTriggerDefaultProps,
        requirements: { ...monthlyTriggerDefaultProps.requirements, times: ['08:00', ''] },
      });

      expect(wrapper.vm.isTriggerComplete).toBe(false);
    });

    it('returns true if all time inputs are filled for the DAILY trigger', () => {
      const wrapper = shallowMount(ChecklistPeriodicTrigger, {
        global: { plugins: [createTestingPinia({ createSpy: vi.fn, stubActions: false })] },
        props: { ...dailyTriggerDefaultProps },
      });

      expect(wrapper.vm.isTriggerComplete).toBe(true);
    });

    it('returns true if all time inputs are filled and repeatEvery is set for the WEEKLY trigger', () => {
      const wrapper = shallowMount(ChecklistPeriodicTrigger, {
        global: { plugins: [createTestingPinia({ createSpy: vi.fn, stubActions: false })] },
        props: { ...weeklyTriggerDefaultProps },
      });

      expect(wrapper.vm.isTriggerComplete).toBe(true);
    });

    it('returns false if repeatEvery is null for the WEEKLY trigger', () => {
      const wrapper = shallowMount(ChecklistPeriodicTrigger, {
        global: { plugins: [createTestingPinia({ createSpy: vi.fn, stubActions: false })] },
        props: { ...weeklyTriggerDefaultProps, requirements: { ...weeklyTriggerDefaultProps.requirements, repeatEvery: null } },
      });

      expect(wrapper.vm.isTriggerComplete).toBe(false);
    });

    it('returns true if all time inputs are filled and repeatEvery is set for the ON_WEEKDAY MONTHLY trigger', () => {
      const wrapper = shallowMount(ChecklistPeriodicTrigger, {
        global: { plugins: [createTestingPinia({ createSpy: vi.fn, stubActions: false })] },
        props: {
          ...monthlyTriggerDefaultProps,
          requirements: {
            ...monthlyTriggerDefaultProps.requirements,
            currentMonthlyTriggerMode: monthlyTriggerModes.ON_WEEKDAY,
          },
        },
      });

      expect(wrapper.vm.isTriggerComplete).toBe(true);
    });

    it('returns false if repeatEvery is null for the ON_WEEKDAY MONTHLY trigger', () => {
      const wrapper = shallowMount(ChecklistPeriodicTrigger, {
        global: { plugins: [createTestingPinia({ createSpy: vi.fn, stubActions: false })] },
        props: {
          ...monthlyTriggerDefaultProps,
          requirements: {
            ...monthlyTriggerDefaultProps.requirements,
            currentMonthlyTriggerMode: monthlyTriggerModes.ON_WEEKDAY,
            repeatEvery: null,
          },
        },
      });

      expect(wrapper.vm.isTriggerComplete).toBe(false);
    });

    it('returns true if all time inputs are filled, repeatEvery and dayOfMonth are set for the ON_CALENDAR_DAY MONTHLY trigger', () => {
      const wrapper = shallowMount(ChecklistPeriodicTrigger, {
        global: { plugins: [createTestingPinia({ createSpy: vi.fn, stubActions: false })] },
        props: {
          ...monthlyTriggerDefaultProps,
          requirements: {
            ...monthlyTriggerDefaultProps.requirements,
            currentMonthlyTriggerMode: monthlyTriggerModes.ON_CALENDAR_DAY,
            dayOfMonth: 15,
          },
        },
      });

      expect(wrapper.vm.isTriggerComplete).toBe(true);
    });

    it('returns false if repeatEvery is null for the ON_CALENDAR_DAY MONTHLY trigger', () => {
      const wrapper = shallowMount(ChecklistPeriodicTrigger, {
        global: { plugins: [createTestingPinia({ createSpy: vi.fn, stubActions: false })] },
        props: {
          ...monthlyTriggerDefaultProps,
          requirements: {
            ...monthlyTriggerDefaultProps.requirements,
            currentMonthlyTriggerMode: monthlyTriggerModes.ON_CALENDAR_DAY,
            dayOfMonth: 15,
            repeatEvery: null,
          },
        },
      });

      expect(wrapper.vm.isTriggerComplete).toBe(false);
    });

    it('returns false if dayOfMonth is null for the ON_CALENDAR_DAY MONTHLY trigger', () => {
      const wrapper = shallowMount(ChecklistPeriodicTrigger, {
        global: { plugins: [createTestingPinia({ createSpy: vi.fn, stubActions: false })] },
        props: {
          ...monthlyTriggerDefaultProps,
          requirements: {
            ...monthlyTriggerDefaultProps.requirements,
            currentMonthlyTriggerMode: monthlyTriggerModes.ON_CALENDAR_DAY,
            dayOfMonth: null,
          },
        },
      });

      expect(wrapper.vm.isTriggerComplete).toBe(false);
    });
  });

  describe('hasTriggerError', () => {
    it('returns true if some time inputs are duplicated', async () => {
      const wrapper = shallowMount(ChecklistPeriodicTrigger, {
        global: { plugins: [createTestingPinia({ createSpy: vi.fn, stubActions: false })] },
        props: { ...dailyTriggerDefaultProps, requirements: { ...dailyTriggerDefaultProps.requirements, times: ['08:00', '08:00'] } },
      });

      expect(wrapper.vm.hasTriggerError).toBe(true);

      await wrapper.setProps({
        ...weeklyTriggerDefaultProps,
        requirements: { ...weeklyTriggerDefaultProps.requirements, times: ['08:00', '08:00'] },
      });

      expect(wrapper.vm.hasTriggerError).toBe(true);

      await wrapper.setProps({
        ...monthlyTriggerDefaultProps,
        requirements: { ...monthlyTriggerDefaultProps.requirements, times: ['08:00', '08:00'] },
      });

      expect(wrapper.vm.hasTriggerError).toBe(true);
    });

    it('returns false if time inputs are valid for the DAILY trigger', () => {
      const wrapper = shallowMount(ChecklistPeriodicTrigger, {
        global: { plugins: [createTestingPinia({ createSpy: vi.fn, stubActions: false })] },
        props: { ...dailyTriggerDefaultProps },
      });

      expect(wrapper.vm.hasTriggerError).toBe(false);
    });

    it('returns true if repeatEvery is null for the WEEKLY trigger', () => {
      const wrapper = shallowMount(ChecklistPeriodicTrigger, {
        global: { plugins: [createTestingPinia({ createSpy: vi.fn, stubActions: false })] },
        props: { ...weeklyTriggerDefaultProps, requirements: { ...weeklyTriggerDefaultProps.requirements, repeatEvery: null } },
      });

      expect(wrapper.vm.hasTriggerError).toBe(true);
    });

    it('returns false if time inputs are valid and repeatEvery is set for the WEEKLY trigger', () => {
      const wrapper = shallowMount(ChecklistPeriodicTrigger, {
        global: { plugins: [createTestingPinia({ createSpy: vi.fn, stubActions: false })] },
        props: { ...weeklyTriggerDefaultProps },
      });

      expect(wrapper.vm.hasTriggerError).toBe(false);
    });

    it('returns true if repeatEvery is null for the ON_WEEKDAY MONTHLY trigger', () => {
      const wrapper = shallowMount(ChecklistPeriodicTrigger, {
        global: { plugins: [createTestingPinia({ createSpy: vi.fn, stubActions: false })] },
        props: {
          ...monthlyTriggerDefaultProps,
          requirements: {
            ...monthlyTriggerDefaultProps.requirements,
            currentMonthlyTriggerMode: monthlyTriggerModes.ON_WEEKDAY,
            repeatEvery: null,
          },
        },
      });

      expect(wrapper.vm.hasTriggerError).toBe(true);
    });

    it('returns false if time inputs are valid and repeatEvery is set for the ON_WEEKDAY MONTHLY trigger', () => {
      const wrapper = shallowMount(ChecklistPeriodicTrigger, {
        global: { plugins: [createTestingPinia({ createSpy: vi.fn, stubActions: false })] },
        props: {
          ...monthlyTriggerDefaultProps,
          requirements: {
            ...monthlyTriggerDefaultProps.requirements,
            currentMonthlyTriggerMode: monthlyTriggerModes.ON_WEEKDAY,
          },
        },
      });

      expect(wrapper.vm.hasTriggerError).toBe(false);
    });

    it('returns true if repeatEvery is null for the ON_CALENDAR_DAY MONTHLY trigger', () => {
      const wrapper = shallowMount(ChecklistPeriodicTrigger, {
        global: { plugins: [createTestingPinia({ createSpy: vi.fn, stubActions: false })] },
        props: {
          ...monthlyTriggerDefaultProps,
          requirements: {
            ...monthlyTriggerDefaultProps.requirements,
            currentMonthlyTriggerMode: monthlyTriggerModes.ON_CALENDAR_DAY,
            dayOfMonth: 15,
            repeatEvery: null,
          },
        },
      });

      expect(wrapper.vm.hasTriggerError).toBe(true);
    });

    it('returns true if dayOfMonth is 32 for the ON_CALENDAR_DAY MONTHLY trigger', () => {
      const wrapper = shallowMount(ChecklistPeriodicTrigger, {
        global: { plugins: [createTestingPinia({ createSpy: vi.fn, stubActions: false })] },
        props: {
          ...monthlyTriggerDefaultProps,
          requirements: {
            ...monthlyTriggerDefaultProps.requirements,
            currentMonthlyTriggerMode: monthlyTriggerModes.ON_CALENDAR_DAY,
            dayOfMonth: null,
            repeatEvery: 32,
          },
        },
      });

      expect(wrapper.vm.hasTriggerError).toBe(true);
    });

    it('returns false if time inputs are valid, repeatEvery and dayOfMonth are set for the ON_CALENDAR_DAY MONTHLY trigger', () => {
      const wrapper = shallowMount(ChecklistPeriodicTrigger, {
        global: { plugins: [createTestingPinia({ createSpy: vi.fn, stubActions: false })] },
        props: {
          ...monthlyTriggerDefaultProps,
          requirements: {
            ...monthlyTriggerDefaultProps.requirements,
            currentMonthlyTriggerMode: monthlyTriggerModes.ON_CALENDAR_DAY,
            dayOfMonth: 15,
          },
        },
      });

      expect(wrapper.vm.hasTriggerError).toBe(false);
    });
  });

  describe('validate', () => {
    it('sets hasTimeValidationError to true for incomplete DAILY trigger', () => {
      const wrapper = shallowMount(ChecklistPeriodicTrigger, {
        global: { plugins: [createTestingPinia({ createSpy: vi.fn, stubActions: false })] },
        props: { ...dailyTriggerDefaultProps, requirements: { ...dailyTriggerDefaultProps.requirements, times: ['08:00', ''] } },
      });

      expect(wrapper.vm.hasTimeValidationError).toBe(false);
      wrapper.vm.validate();
      expect(wrapper.vm.hasTimeValidationError).toBe(true);
    });

    it('sets hasTimeValidationError to true for incomplete WEEKLY trigger', () => {
      const wrapper = shallowMount(ChecklistPeriodicTrigger, {
        global: { plugins: [createTestingPinia({ createSpy: vi.fn, stubActions: false })] },
        props: { ...weeklyTriggerDefaultProps, requirements: { ...weeklyTriggerDefaultProps.requirements, times: ['08:00', ''] } },
      });

      expect(wrapper.vm.hasTimeValidationError).toBe(false);
      wrapper.vm.validate();
      expect(wrapper.vm.hasTimeValidationError).toBe(true);
    });

    it('sets hasTimeValidationError to true for incomplete ON_WEEKDAY MONTHLY trigger', () => {
      const wrapper = shallowMount(ChecklistPeriodicTrigger, {
        global: { plugins: [createTestingPinia({ createSpy: vi.fn, stubActions: false })] },
        props: {
          ...monthlyTriggerDefaultProps,
          requirements: { ...monthlyTriggerDefaultProps.requirements, currentMonthlyTriggerMode: monthlyTriggerModes.ON_WEEKDAY, times: ['08:00', ''] },
        },
      });

      expect(wrapper.vm.hasTimeValidationError).toBe(false);
      wrapper.vm.validate();
      expect(wrapper.vm.hasTimeValidationError).toBe(true);
    });

    it('emits dayOfMonth with 0 and sets hasTimeValidationError to true for incomplete ON_CALENDAR_DAY MONTHLY trigger', () => {
      const wrapper = shallowMount(ChecklistPeriodicTrigger, {
        global: { plugins: [createTestingPinia({ createSpy: vi.fn, stubActions: false })] },
        props: {
          ...monthlyTriggerDefaultProps,
          requirements: { ...monthlyTriggerDefaultProps.requirements, currentMonthlyTriggerMode: monthlyTriggerModes.ON_CALENDAR_DAY, times: ['08:00', ''], dayOfMonth: null },
        },
      });

      expect(wrapper.vm.hasTimeValidationError).toBe(false);
      wrapper.vm.validate();
      expect(wrapper.emitted('update:requirements')[0][0]).toEqual({ dayOfMonth: 0 });
      expect(wrapper.vm.hasTimeValidationError).toBe(true);
    });
  });

  test('that timeInputFocused watcher emits reordered times if input is becoming unfocused', async () => {
    const wrapper = shallowMount(ChecklistPeriodicTrigger, {
      global: { plugins: [createTestingPinia({ createSpy: vi.fn, stubActions: false })] },
      props: { ...dailyTriggerDefaultProps, requirements: { ...dailyTriggerDefaultProps.requirements, times: ['18:00', '08:00', '12:00'] } },
    });

    wrapper.vm.timeInputFocused = true;
    await flushPromises();
    expect(wrapper.emitted('update:requirements')).toBeUndefined();
    wrapper.vm.timeInputFocused = false;
    await flushPromises();
    const emittedLength = wrapper.emitted('update:requirements').length;
    expect(wrapper.emitted()['update:requirements'][emittedLength - 1][0].times).toEqual(['08:00', '12:00', '18:00']);
  });

  test('that update:requirements with default monthly trigger values is called on mounted', async () => {
    const language = 'en';
    const firstDayOfWeek = 1;
    const wrapper = shallowMount(ChecklistPeriodicTrigger, {
      global: {
        plugins: [createTestingPinia({
          createSpy: vi.fn,
          stubActions: false,
          initialState: { profile: { language, currentUser: { firstDayOfWeek } } },
        })],
      },
      props: { ...monthlyTriggerDefaultProps },
    });

    await flushPromises();
    expect(wrapper.emitted('update:requirements')[0][0]).toEqual({
      type: checklistTypes.PERIODIC,
      subType: periodicSubTypes.MONTHLY,
      repeatEvery: 1,
      dayOfMonth: null,
      dayOfWeek: getDaysList(language, firstDayOfWeek)[0].id,
      occurrence: getMonthlyTriggerOccurrenceList()[0].id,
      times: ['08:00', '14:00'],
    });
  });
});
