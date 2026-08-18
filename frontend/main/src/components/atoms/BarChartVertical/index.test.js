import { shallowMount } from '@vue/test-utils';

import index from './index.vue';

import createGlobal from '@/helpers/createGlobal';

vi.mock('@/helpers/text/randStr', () => ({
  default: vi.fn((val) => val),
  __esModule: true,
}));

const global = createGlobal();

const createWrapper = (options) => shallowMount(index, {
  global: { ...global },
  ...options,
});

const propsDefault = {
  i: 'string',
  chartData: [],
  targetLineEnabled: true,
  targetLineDataObj: {},
  updateTrigger: 0,
  dataType: 'abs',
  xAxisLabel: 'string',
  trendLineEnabled: true,
  trendLineDataObj: {
    y1: 0,
    y2: 0,
    value: 'trendLineText',
  },
  comparisonBarsEnabled: true,
  comparisonBarsData: [],
  areaHighlightsEnabled: false,
  tooltipHTMLFunc: () => {},
};

describe('BarChartVertical', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.SVGElement.prototype.getBBox = () => ({
      x: 0,
      y: 0,
      width: 30,
    });
  });
  afterEach(() => {
    delete window.SVGElement.prototype.getBBox;
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

  it('renders correctly with areaHighlightsEnabled', () => {
    const wrapper = createWrapper({
      props: { ...propsDefault, areaHighlightsEnabled: true },
    });

    expect(wrapper.element).toMatchSnapshot();
  });
});
