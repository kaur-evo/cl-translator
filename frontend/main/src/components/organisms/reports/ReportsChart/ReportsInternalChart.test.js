import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import ReportsChart from './ReportsInternalChart.vue';

const createPinia = () => createTestingPinia({
  createSpy: vi.fn,
  initialState: {
    reportsConfig: {
      dateRange: [],
      calculatedData: [],
      isGeneratingPdf: false,
      totals: {},
      trendlineData: null,
    },
    profile: { currentUser: { firstDayOfWeek: 1 } },
    configuration: { configuration: { disableTrendline: false } },
    filterbar: { requestFilterState: { orderDir: [] } },
  },
});

const createWrapper = (options = {}) => shallowMount(ReportsChart, {
  global: { plugins: [createPinia()] },
  props: options.props,
});

const propsDefault = {
  isSideMenuOpen: true,
  totals: {},
};
let tout;
describe('ReportsChart', () => {
  beforeEach(() => {
    tout = globalThis.setTimeout;
    globalThis.setTimeout = (fn) => fn();
  });
  afterEach(() => {
    globalThis.setTimeout = tout;
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

  test('that isGeneratingPdf watcher sets isGeneratingPdf chart property and calls updateBottomAxis', async () => {
    vi.useFakeTimers();
    const wrapper = createWrapper({
      props: { ...propsDefault },
    });

    vi.advanceTimersByTime(1000);

    const updateBottomAxisSpy = vi.spyOn(wrapper.vm.chart, 'updateBottomAxis');
    expect(wrapper.vm.chart.isGeneratingPdf).toBeFalsy();
    expect(updateBottomAxisSpy).toHaveBeenCalledTimes(0);

    wrapper.vm.$options.watch.isGeneratingPdf.call(wrapper.vm, true);

    expect(wrapper.vm.chart.isGeneratingPdf).toBe(true);
    expect(updateBottomAxisSpy).toHaveBeenCalledTimes(1);

    vi.useRealTimers();
  });

  test('that trendlineData watcher sets TrendlineData and calls chart.updatetrendline', async () => {
    vi.useFakeTimers();
    const wrapper = createWrapper({
      props: { ...propsDefault },
    });

    vi.advanceTimersByTime(1000);

    const updateTrendlineSpy = vi.spyOn(wrapper.vm.chart, 'updateTrendline');
    expect(wrapper.vm.trendlineData).toEqual(null);
    expect(updateTrendlineSpy).toHaveBeenCalledTimes(0);

    wrapper.vm.$options.watch.trendlineData.call(wrapper.vm, [1, 2, 3]);

    expect(wrapper.vm.chart.trendlineData).toEqual([1, 2, 3]);
    expect(updateTrendlineSpy).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });
});
