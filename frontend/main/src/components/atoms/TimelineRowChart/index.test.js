import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import index from './index.vue';

const createPinia = (overrides = {}) => createTestingPinia({
  createSpy: vi.fn,
  initialState: {
    factoryOverviewConfig: {
      rollingTimelines: {},
      loading: [],
      loadingStations: {},
      ...overrides,
    },
  },
});

const propsDefault = {
  xScale: (val) => val || {},
  zoneId: 'string',
  stationId: 1,
  tooltipHTMLFunc: (val) => val || {},
};

describe('TimelineRowChart', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders', () => {
    const wrapper = shallowMount(index, {
      global: {
        plugins: [createPinia()],
        mocks: { $t: (msg) => msg },
        stubs: ['router-link', 'router-view'],
      },
      props: { ...propsDefault },
    });
    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly', () => {
    const wrapper = shallowMount(index, {
      global: {
        plugins: [createPinia()],
        mocks: { $t: (msg) => msg },
        stubs: ['router-link', 'router-view'],
      },
      props: { ...propsDefault },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly when loading', () => {
    const wrapper = shallowMount(index, {
      global: {
        plugins: [createPinia({ loading: ['loading'] })],
        mocks: { $t: (msg) => msg },
        stubs: ['router-link', 'router-view'],
      },
      props: { ...propsDefault },
    });
    expect(wrapper.element).toMatchSnapshot();
  });
});
