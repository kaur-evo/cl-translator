import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { addDays, subDays } from 'date-fns';

import ImprovementsProjectCard from './index.vue';

import { REDUCE_BY_PCT } from '@/constants/improvementsDataTrackingTypes';
import { NO_TRACKING_DATA } from '@/constants/improvementsEventTypes';

const pinia = createTestingPinia();

const defaultPropsData = {
  project: {
    name: 'testproject',
    change: 0,
    eventType: '',
    targetType: '',
    currentAverage: 0,
    initialDailyAverage: 0,
  },
  team: [],
  actions: [],
  isFinished: false,
  isOverdue: false,
  timeValHeader: '',
  timeVal: '',
};

describe('ImprovementsProjectCard', () => {
  it('renders correctly', () => {
    const wrapper = shallowMount(ImprovementsProjectCard, {
      props: {
        ...defaultPropsData,
        project: {
          name: 'testproject',
          change: 0.4,
          eventType: '',
          targetType: REDUCE_BY_PCT,
          currentAverage: 5,
          initialDailyAverage: 3,
          endDate: addDays(new Date(), 12),
        },
        team: [{ fullName: 'full name', userId: 'test@test' }],
        actions: [
          { id: 1, completed: false },
          { id: 2, completed: true },
          { id: 3, completed: false },
        ],
      },
      global: { plugins: [pinia] },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  it('shows project name', () => {
    const wrapper = shallowMount(ImprovementsProjectCard, {
      props: { ...defaultPropsData },
      global: { plugins: [pinia] },
    });
    expect(wrapper.find('#project-name').isVisible()).toBe(true);
    expect(wrapper.find('#project-name').text()).toBe('testproject');
  });

  it('doesnt show users, when team array is empty', () => {
    const wrapper = shallowMount(ImprovementsProjectCard, {
      props: { ...defaultPropsData },
      global: { plugins: [pinia] },
    });
    expect(wrapper.find('#project-users').isVisible()).toBe(true);
    expect(wrapper.find('#project-users').text()).toBe('');
  });

  it('shows users, when team array is not empty', () => {
    const wrapper = shallowMount(ImprovementsProjectCard, {
      props: { ...defaultPropsData, team: [{ fullName: 'full name', userId: 'test@test' }] },
      global: { plugins: [pinia] },
    });
    expect(wrapper.find('#project-users').isVisible()).toBe(true);
    expect(wrapper.find('#project-users').text()).toBe('full name');
  });

  it('shows project finished icon', () => {
    const wrapper = shallowMount(ImprovementsProjectCard, {
      props: { ...defaultPropsData, isFinished: true },
      global: { plugins: [pinia] },
    });
    expect(wrapper.find('#finished-icon').isVisible()).toBe(true);
  });

  it('shows project overdue icon', () => {
    const wrapper = shallowMount(ImprovementsProjectCard, {
      props: { ...defaultPropsData, isOverdue: true },
      global: { plugins: [pinia] },
    });
    expect(wrapper.find('#overdue-icon').isVisible()).toBe(true);
  });

  it('shows project change value, when project "eventType" is not equal to "NO_TRACKING_DATA",', () => {
    const wrapper = shallowMount(ImprovementsProjectCard, {
      props: {
        ...defaultPropsData,
        project: {
          change: 0.3,
        },
      },
      global: { plugins: [pinia] },
    });
    expect(wrapper.find('#change-value').isVisible()).toBe(true);
    expect(wrapper.find('#change-value').text()).toBe('30%');
  });

  it('shows project baseline and current average values in x/day format, when project "eventType" is not equal to "NO_TRACKING_DATA"', () => {
    const wrapper = shallowMount(ImprovementsProjectCard, {
      props: {
        ...defaultPropsData,
        project: {
          initialDailyAverage: 3,
          currentAverage: 5,
        },
      },
      global: { plugins: [pinia] },
    });
    expect(wrapper.find('#baseline-average-value').isVisible()).toBe(true);
    expect(wrapper.find('#baseline-average-value').text()).toBe('3/day');
    expect(wrapper.find('#current-average-value').isVisible()).toBe(true);
    expect(wrapper.find('#current-average-value').text()).toBe('5/day');
  });

  it('shows project baseline and current average values in "x m y s" format, when project "eventType" is not equal to "NO_TRACKING_DATA" and project "targetType" is "REDUCE_BY_PCT"', () => {
    const wrapper = shallowMount(ImprovementsProjectCard, {
      props: {
        ...defaultPropsData,
        project: {
          initialDailyAverage: 265,
          currentAverage: 300,
          targetType: REDUCE_BY_PCT,
        },
      },
      global: { plugins: [pinia] },
    });
    expect(wrapper.find('#baseline-average-value').isVisible()).toBe(true);
    expect(wrapper.find('#baseline-average-value').text()).toBe('4m 25s');
    expect(wrapper.find('#current-average-value').isVisible()).toBe(true);
    expect(wrapper.find('#current-average-value').text()).toBe('5m 0s');
  });

  test('that loading states are visible, when project change, baseline average and current average have "loading" value', () => {
    const wrapper = shallowMount(ImprovementsProjectCard, {
      props: {
        ...defaultPropsData,
        project: {
          change: 'loading',
          initialDailyAverage: 'loading',
          currentAverage: 'loading',
        },
      },
      global: { plugins: [pinia] },
    });
    expect(wrapper.find('#loading-circle').isVisible()).toBe(true);
    expect(wrapper.find('#baseline-avg-loading-state').isVisible()).toBe(true);
    expect(wrapper.find('#current-avg-loading-state').isVisible()).toBe(true);
  });

  it('is not showing project change, baseline average and current average values, when project "eventType" has "NO_TRACKING_DATA" value', () => {
    const wrapper = shallowMount(ImprovementsProjectCard, {
      props: {
        ...defaultPropsData,
        project: {
          eventType: NO_TRACKING_DATA,
        },
      },
      global: { plugins: [pinia] },
    });
    expect(wrapper.find('#change-value').exists()).toBe(false);
    expect(wrapper.find('#baseline-average-value').exists()).toBe(false);
    expect(wrapper.find('#current-average-value').exists()).toBe(false);
  });

  test('that projects actions value is 0/0, when there arent any actions', () => {
    const wrapper = shallowMount(ImprovementsProjectCard, {
      props: { ...defaultPropsData },
      global: { plugins: [pinia] },
    });
    expect(wrapper.find('#actions-value').isVisible()).toBe(true);
    expect(wrapper.find('#actions-value').text()).toBe('0/0');
  });

  test('that projects actions value is 0/3, when there are 3 actions, but none of these is completed', () => {
    const wrapper = shallowMount(ImprovementsProjectCard, {
      props: {
        ...defaultPropsData,
        actions: [
          { id: 1, completed: false },
          { id: 2, completed: false },
          { id: 3, completed: false },
        ],
      },
      global: { plugins: [pinia] },
    });
    expect(wrapper.find('#actions-value').isVisible()).toBe(true);
    expect(wrapper.find('#actions-value').text()).toBe('0/3');
  });

  test('that projects actions value is 2/3, when there are 3 actions and two of these are completed', () => {
    const wrapper = shallowMount(ImprovementsProjectCard, {
      props: {
        ...defaultPropsData,
        actions: [
          { id: 1, completed: true },
          { id: 2, completed: false },
          { id: 3, completed: true },
        ],
      },
      global: { plugins: [pinia] },
    });
    expect(wrapper.find('#actions-value').isVisible()).toBe(true);
    expect(wrapper.find('#actions-value').text()).toBe('2/3');
  });

  test('that actions progress bar is primary, when project is not overdue or finished', () => {
    const wrapper = shallowMount(ImprovementsProjectCard, {
      props: { ...defaultPropsData },
      global: { plugins: [pinia] },
    });
    expect(wrapper.vm.getProgressBarColor).toBe('primary');
  });

  test('that actions progress bar is orange, when project is overdue', () => {
    const wrapper = shallowMount(ImprovementsProjectCard, {
      props: { ...defaultPropsData, isOverdue: true },
      global: { plugins: [pinia] },
    });
    expect(wrapper.vm.getProgressBarColor).toBe('secondary');
  });

  test('that actions progress bar is grey, when project is finished', () => {
    const wrapper = shallowMount(ImprovementsProjectCard, {
      props: { ...defaultPropsData, isFinished: true },
      global: { plugins: [pinia] },
    });
    expect(wrapper.vm.getProgressBarColor).toBe('secondary-dark');
  });

  test('that Mr Evocon image is visible', () => {
    const wrapper = shallowMount(ImprovementsProjectCard, {
      props: {
        ...defaultPropsData,
        project: {
          eventType: NO_TRACKING_DATA,
        },
      },
      global: { plugins: [pinia] },
    });
    expect(wrapper.find('#mr-evocon-img').isVisible()).toBe(true);
  });

  test('that time section additional info says that project is 10 days overdue, when project is not finished and project end date was 10 days ago', () => {
    const wrapper = shallowMount(ImprovementsProjectCard, {
      props: {
        ...defaultPropsData,
        project: {
          endDate: subDays(new Date(), 10),
        },
        isOverdue: true,
      },
      global: { plugins: [pinia] },
    });
    expect(wrapper.find('#project-time-additional-info').isVisible()).toBe(true);
    expect(wrapper.find('#project-time-additional-info').text()).toBe('10 days overdue');
  });

  test('that time section additional info says that project is finished 8 days ago, when project is finished and project end date was 8 days ago', () => {
    const wrapper = shallowMount(ImprovementsProjectCard, {
      props: {
        ...defaultPropsData,
        project: {
          endDate: subDays(new Date(), 8),
        },
        isFinished: true,
      },
      global: { plugins: [pinia] },
    });
    expect(wrapper.find('#project-time-additional-info').isVisible()).toBe(true);
    expect(wrapper.find('#project-time-additional-info').text()).toBe('8 days ago');
  });

  test('that time section additional info says that project starts in 5 days, when project start date is in 5 days', () => {
    const wrapper = shallowMount(ImprovementsProjectCard, {
      props: {
        ...defaultPropsData,
        project: {
          startDate: addDays(new Date(), 5),
        },
      },
      global: { plugins: [pinia] },
    });
    expect(wrapper.find('#project-time-additional-info').isVisible()).toBe(true);
    expect(wrapper.find('#project-time-additional-info').text()).toBe('Starts in 5 days');
  });

  test('that time section additional info says that its 12 days left until project ends, when project end date is in 12 days', () => {
    const wrapper = shallowMount(ImprovementsProjectCard, {
      props: {
        ...defaultPropsData,
        project: {
          endDate: addDays(new Date(), 12),
        },
      },
      global: { plugins: [pinia] },
    });
    expect(wrapper.find('#project-time-additional-info').isVisible()).toBe(true);
    expect(wrapper.find('#project-time-additional-info').text()).toBe('12 days left');
  });

  test('that icon type is "overdue" and icon has orange color, when project is not finished and project end date was 10 days ago', () => {
    const wrapper = shallowMount(ImprovementsProjectCard, {
      props: {
        ...defaultPropsData,
        project: {
          endDate: subDays(new Date(), 10),
        },
        isOverdue: true,
      },
      global: { plugins: [pinia] },
    });
    expect(wrapper.vm.getIconColor).toBe('secondary');
    expect(wrapper.vm.getIconType).toBe('overdue');
  });

  test('that icon type is "finished" and icon has dark gray color, when project is finished and project end date was 8 days ago', () => {
    const wrapper = shallowMount(ImprovementsProjectCard, {
      props: {
        ...defaultPropsData,
        project: {
          endDate: subDays(new Date(), 8),
        },
        isFinished: true,
      },
      global: { plugins: [pinia] },
    });
    expect(wrapper.vm.getIconColor).toBe('white');
    expect(wrapper.vm.getIconType).toBe('finished');
  });

  test('that icon type is "upcoming" and icon has dark gray color, when project start date is in 10 days', () => {
    const wrapper = shallowMount(ImprovementsProjectCard, {
      props: {
        ...defaultPropsData,
        project: {
          startDate: addDays(new Date(), 10),
        },
      },
      global: { plugins: [pinia] },
    });
    expect(wrapper.vm.getIconColor).toBe('white');
    expect(wrapper.vm.getIconType).toBe('upcoming');
  });

  test('that icon type is "ongoing" and icon has primary color,  when project end date is in 12 days', () => {
    const wrapper = shallowMount(ImprovementsProjectCard, {
      props: {
        ...defaultPropsData,
        project: {
          endDate: addDays(new Date(), 12),
        },
      },
      global: { plugins: [pinia] },
    });
    expect(wrapper.vm.getIconColor).toBe('primary');
    expect(wrapper.vm.getIconType).toBe('ongoing');
  });
});
