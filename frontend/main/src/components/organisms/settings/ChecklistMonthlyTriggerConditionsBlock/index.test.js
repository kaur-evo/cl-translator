import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import ChecklistMonthlyTriggerConditionsBlock from './index.vue';

import { checklistTypes, periodicSubTypes, monthlyTriggerModes, monthlyTriggerOccurrences } from '@/constants/checklistsConstants';
import useDeviceStore from '@/stores/device';

const createPinia = (overrides = {}, { isMobile = false } = {}) => {
  const pinia = createTestingPinia({
    createSpy: vi.fn,
    stubActions: false,
    initialState: {
      profile: { currentUser: { firstDayOfWeek: 1 }, language: 'en' },
      ...overrides,
    },
  });
  const deviceStore = useDeviceStore(pinia);
  deviceStore.isMobileView = isMobile;
  return pinia;
};

describe('ChecklistMonthlyTriggerConditionsBlock', () => {
  describe('ON_WEEKDAY mode', () => {
    const defaultProps = {
      requirements: {
        type: checklistTypes.PERIODIC,
        subType: periodicSubTypes.MONTHLY,
        currentMonthlyTriggerMode: monthlyTriggerModes.ON_WEEKDAY,
        repeatEvery: 2,
        occurrence: monthlyTriggerOccurrences.FIRST,
        dayOfWeek: 'MONDAY',
        dayOfMonth: null,
        times: ['12:00', '18:00'],
      },
    };

    it('renders correctly', () => {
      const wrapper = shallowMount(ChecklistMonthlyTriggerConditionsBlock, {
        global: { plugins: [createPinia()] },
        props: { ...defaultProps },
      });

      expect(wrapper.element).toMatchSnapshot();
    });

    test('that isOnWeekdayTriggerSelected returns true', () => {
      const wrapper = shallowMount(ChecklistMonthlyTriggerConditionsBlock, {
        global: { plugins: [createPinia()] },
        props: { ...defaultProps },
      });

      expect(wrapper.vm.isOnWeekdayTriggerSelected).toBe(true);
    });

    test('that isOnCalendarDayTriggerSelected returns false', () => {
      const wrapper = shallowMount(ChecklistMonthlyTriggerConditionsBlock, {
        global: { plugins: [createPinia()] },
        props: { ...defaultProps },
      });

      expect(wrapper.vm.isOnCalendarDayTriggerSelected).toBe(false);
    });

    test('that showDayOfMonthWarning returns false', () => {
      const wrapper = shallowMount(ChecklistMonthlyTriggerConditionsBlock, {
        global: { plugins: [createPinia()] },
        props: { ...defaultProps },
      });

      expect(wrapper.vm.showDayOfMonthWarning).toBe(false);
    });
  });

  describe('ON_CALENDAR_DAY mode', () => {
    const defaultProps = {
      requirements: {
        type: checklistTypes.PERIODIC,
        subType: periodicSubTypes.MONTHLY,
        currentMonthlyTriggerMode: monthlyTriggerModes.ON_CALENDAR_DAY,
        repeatEvery: 2,
        occurrence: null,
        dayOfWeek: null,
        dayOfMonth: 15,
        times: ['12:00', '18:00'],
      },
    };

    it('renders correctly', () => {
      const wrapper = shallowMount(ChecklistMonthlyTriggerConditionsBlock, {
        global: { plugins: [createPinia()] },
        props: { ...defaultProps },
      });

      expect(wrapper.element).toMatchSnapshot();
    });

    it('renders correctly if  hasDayOfMonthError is true', () => {
      const wrapper = shallowMount(ChecklistMonthlyTriggerConditionsBlock, {
        global: { plugins: [createPinia()] },
        props: {
          ...defaultProps,
          requirements: {
            ...defaultProps.requirements,
            dayOfMonth: null,
          },
          hasDayOfMonthError: true,
        },
      });

      expect(wrapper.element).toMatchSnapshot();
    });

    it('renders correctly in mobile if dayOfMonth is 29', () => {
      const wrapper = shallowMount(ChecklistMonthlyTriggerConditionsBlock, {
        global: { plugins: [createPinia({}, { isMobile: true })] },
        props: {
          ...defaultProps,
          requirements: {
            ...defaultProps.requirements,
            dayOfMonth: 29,
          },
        },
      });

      expect(wrapper.element).toMatchSnapshot();
    });

    test('that isOnWeekdayTriggerSelected returns false', () => {
      const wrapper = shallowMount(ChecklistMonthlyTriggerConditionsBlock, {
        global: { plugins: [createPinia()] },
        props: { ...defaultProps },
      });

      expect(wrapper.vm.isOnWeekdayTriggerSelected).toBe(false);
    });

    test('that isOnCalendarDayTriggerSelected returns true', () => {
      const wrapper = shallowMount(ChecklistMonthlyTriggerConditionsBlock, {
        global: { plugins: [createPinia()] },
        props: { ...defaultProps },
      });

      expect(wrapper.vm.isOnCalendarDayTriggerSelected).toBe(true);
    });

    describe('showDayOfMonthWarning', () => {
      it('returns false if dayOfMonth is 27', () => {
        const wrapper = shallowMount(ChecklistMonthlyTriggerConditionsBlock, {
          global: { plugins: [createPinia()] },
          props: {
            ...defaultProps,
            requirements: {
              ...defaultProps.requirements,
              dayOfMonth: 27,
            },
          },
        });

        expect(wrapper.vm.showDayOfMonthWarning).toBe(false);
      });

      it('returns true if dayOfMonth is more than 28', () => {
        const wrapper = shallowMount(ChecklistMonthlyTriggerConditionsBlock, {
          global: { plugins: [createPinia()] },
          props: {
            ...defaultProps,
            requirements: {
              ...defaultProps.requirements,
              dayOfMonth: 30,
            },
          },
        });

        expect(wrapper.vm.showDayOfMonthWarning).toBe(true);
      });
    });

    describe('showDayOfMonthMessage', () => {
      it('returns false if hasDayOfMonthError is false and dayOfMonth is not between 28 and 32', () => {
        const wrapper = shallowMount(ChecklistMonthlyTriggerConditionsBlock, {
          global: { plugins: [createPinia()] },
          props: {
            ...defaultProps,
            requirements: {
              ...defaultProps.requirements,
              dayOfMonth: 15,
            },
            hasDayOfMonthError: false,
          },
        });

        expect(wrapper.vm.showDayOfMonthMessage).toBe(false);
      });

      it('returns true if hasDayOfMonthError is true', () => {
        const wrapper = shallowMount(ChecklistMonthlyTriggerConditionsBlock, {
          global: { plugins: [createPinia()] },
          props: {
            ...defaultProps,
            requirements: {
              ...defaultProps.requirements,
              dayOfMonth: null,
            },
            hasDayOfMonthError: true,
          },
        });

        expect(wrapper.vm.showDayOfMonthMessage).toBe(true);
      });

      it('returns true if dayOfMonth is 30', () => {
        const wrapper = shallowMount(ChecklistMonthlyTriggerConditionsBlock, {
          global: { plugins: [createPinia()] },
          props: {
            ...defaultProps,
            requirements: {
              ...defaultProps.requirements,
              dayOfMonth: 30,
            },
            hasDayOfMonthError: false,
          },
        });

        expect(wrapper.vm.showDayOfMonthMessage).toBe(true);
      });
    });

    describe('dayOfMonthMessage', () => {
      it('returns error message if hasDayOfMonthError is true', () => {
        const wrapper = shallowMount(ChecklistMonthlyTriggerConditionsBlock, {
          global: { plugins: [createPinia()] },
          props: {
            ...defaultProps,
            requirements: {
              ...defaultProps.requirements,
              dayOfMonth: null,
            },
            hasDayOfMonthError: true,
          },
        });

        expect(wrapper.vm.dayOfMonthMessage).toBe('Value must be between {min} and {max}');
      });

      it('returns warning message if hasDayOfMonthError is false and dayOfMonth is 30', () => {
        const wrapper = shallowMount(ChecklistMonthlyTriggerConditionsBlock, {
          global: { plugins: [createPinia()] },
          props: {
            ...defaultProps,
            requirements: {
              ...defaultProps.requirements,
              dayOfMonth: 30,
            },
            hasDayOfMonthError: false,
          },
        });

        expect(wrapper.vm.dayOfMonthMessage).toBe('Not all months have {value} days');
      });

      it('returns empty string if hasDayOfMonthError is false and dayOfMonth is not between 28 and 32', () => {
        const wrapper = shallowMount(ChecklistMonthlyTriggerConditionsBlock, {
          global: { plugins: [createPinia()] },
          props: {
            ...defaultProps,
            requirements: {
              ...defaultProps.requirements,
              dayOfMonth: 15,
            },
            hasDayOfMonthError: false,
          },
        });

        expect(wrapper.vm.dayOfMonthMessage).toBe('');
      });
    });
  });
});
