import { shallowMount } from '@vue/test-utils';

import ImprovementsChart from './ImprovementsChart.vue';

import createGlobal from '@/helpers/createGlobal';

const global = createGlobal();

const createWrapper = (options) => shallowMount(ImprovementsChart, {
  global: { ...global },
  ...options,
});

const propsDefault = {
  data: [],
  project: {},
  stats: { currentData: [] },
  screenWidth: 0,
  targetVal: 0,
  baselineAverage: 0,
  chartYKey: 'duration',
  chartColors: {},
  isPerStopChart: true,
  isProjectDataMeasuredByTime: true,
  chartMaxVal: 0,
  tickInterval: 0,
  allDates: [],
  completedActions: [],
  solutions: [],
  barTooltipHTMLFunc: () => {},
  averageTooltipHTMLFunc: () => {},
  measureTooltipHTMLFunc: () => {},
};

describe('ImprovementsChart', () => {
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
