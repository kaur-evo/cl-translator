/* eslint-disable no-undef */
import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import index from './index.vue';

const route = {
  $route: {
    query: {
      rows: 2,
      cols: 2,
      views: JSON.stringify([
        ['', ''],
        ['', ''],
      ]),
    },
  },
};

const createPinia = (overrides = {}) => createTestingPinia({
  createSpy: vi.fn,
  stubActions: false,
  initialState: {
    station: { stationsMap: {}, ...overrides },
  },
});

const createWrapper = (options) => shallowMount(index, {
  global: {
    plugins: [createPinia()],
    mocks: { ...route },
    stubs: ['router-link', 'router-view'],
  },
  ...options,
});

const propsDefault = {};

describe('SplitView', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    process.env = { VITE_VUE_APP_BASE_URL: 'baseurl' };
  });
  afterAll(() => {
    process.env = OLD_ENV; // Restore old environment
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
