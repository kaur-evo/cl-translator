import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import HourChart from './index.vue';

const router = {
  $router: {
    push: vi.fn(),
  },
  $route: {
    query: {},
  },
};

const createWrapper = ({ props = {} } = {}) => {
  const pinia = createTestingPinia({ createSpy: vi.fn });

  return shallowMount(HourChart, {
    global: {
      plugins: [pinia],
      mocks: { ...router },
      stubs: ['router-link', 'router-view'],
    },
    props,
  });
};

const propsDefault = {
  comments: new Map(),
  shiftHours: [],
  requireOperator: true,
};

describe('HourChart', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders', () => {
    const wrapper = createWrapper({ props: propsDefault });

    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly', () => {
    const wrapper = createWrapper({ props: propsDefault });

    expect(wrapper.element).toMatchSnapshot();
  });
});
