import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import index from './index.vue';

const createPinia = (overrides = {}) => createTestingPinia({
  createSpy: vi.fn,
  stubActions: false,
  initialState: {
    device: { screen: { width: 0, height: 0 }, ...(overrides.device || {}) },
    reportsConfig: { dateRange: [], ...(overrides.reportsConfig || {}) },
  },
});

const createWrapper = (options = {}) => shallowMount(index, {
  global: { plugins: [createPinia(options.piniaOverrides)] },
  props: options.props,
});

const propsDefault = {
  isSideMenuOpen: true,
  totals: {},
};

describe('ReportsChart', () => {
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
