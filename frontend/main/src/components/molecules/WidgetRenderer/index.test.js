import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import WidgetRenderer from './index.vue';

import performanceWidgetType from '@/constants/performanceWidgetType';

vi.mock('@/components/organisms/shiftview/ShiftviewPerformanceWidget/index.vue', () => ({
  default: { name: 'PerformanceWidget', template: '<div>Performance</div>' },
}));

vi.mock('@/components/organisms/shiftview/ShiftviewOeeWidget/index.vue', () => ({
  default: { name: 'OEEWidget', template: '<div>OEE</div>' },
}));

vi.mock('@/components/organisms/shiftview/ShiftviewCustomChartWidget/index.vue', () => ({
  default: { name: 'ShiftviewCustomChartWidget', template: '<div>Custom Chart</div>' },
}));

vi.mock('@/components/organisms/shiftview/ShiftviewMeasuresWidget/index.vue', () => ({
  default: { name: 'MeasuresWidget', template: '<div>Measures</div>' },
}));

const createPinia = () => createTestingPinia({
  createSpy: vi.fn,
  initialState: {
    userPreferences: { viewSettings: { performanceWidgetType: performanceWidgetType.UNIT_PER_MINUTE } },
  },
});

describe('WidgetRenderer', () => {
  it('renders correctly with performance widget', () => {
    const wrapper = shallowMount(WidgetRenderer, {
      global: { plugins: [createPinia()] },
      props: {
        widget: { component: 'performance-widget', config: {} },
      },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly with oee widget', () => {
    const wrapper = shallowMount(WidgetRenderer, {
      global: { plugins: [createPinia()] },
      props: {
        widget: { component: 'OEE-widget', config: {} },
      },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly with measures widget', () => {
    const wrapper = shallowMount(WidgetRenderer, {
      global: { plugins: [createPinia()] },
      props: {
        widget: { component: 'measure-widget', config: {} },
      },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly with custom chart widget', () => {
    const wrapper = shallowMount(WidgetRenderer, {
      global: { plugins: [createPinia()] },
      props: {
        widget: { component: 'shiftview-custom-chart-widget', config: {} },
      },
    });

    expect(wrapper.element).toMatchSnapshot();
  });
});
