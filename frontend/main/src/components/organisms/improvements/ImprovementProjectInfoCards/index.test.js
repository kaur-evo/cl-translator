import { shallowMount } from '@vue/test-utils';

import index from './index.vue';

import createGlobal from '@/helpers/createGlobal';
import { REDUCE_TO_TIME, PER_DAY } from '@/constants/improvementsDataTrackingTypes';

const global = createGlobal({
  piniaOptions: {
    initialState: {
      genericDialog: {},
      improvementsProject: {},
    },
  },
});

const createWrapper = (options) => shallowMount(index, {
  global: { ...global },
  ...options,
});

const propsDefault = {
  project: {
    baselineStartDate: '2020-01-01',
    baselineEndDate: '2020-01-31',
    startDate: '2020-02-01',
    endDate: '2020-02-29',
    targetType: REDUCE_TO_TIME,
    periodType: PER_DAY,
    id: 234,
    ratePerHour: 34,
    currency: 'eur',
  },
  canEdit: true,
  stats: {
    initialDailyAverage: 1200,
    targetDailyAverage: 600,
    currentDailyAverage: 1000,
    last7DaysPeriodAverage: 999,
    totalTimeSaved: 123,
  },
};

describe('ImprovementProjectInfoCards', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders', () => {
    const wrapper = createWrapper({
      props: { ...propsDefault },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly', () => {
    const wrapper = createWrapper({
      props: { ...propsDefault },
    });

    expect(wrapper.element).toMatchSnapshot();
  });
});
