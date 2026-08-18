import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import index from './index.vue';

const createPinia = () => createTestingPinia({
  createSpy: vi.fn,
  initialState: {
    filterbar: {
      requestFilterState: { groupBy: [] },
      currentFilterState: { groupBy: [] },
    },
    profile: { currentUser: {} },
    reportsConfig: { groupBy: [] },
  },
});

const createWrapper = (options) => shallowMount(index, {
  global: { plugins: [createPinia()] },
  ...options,
});

const propsDefault = {};

describe('ReportsViewOptionsForm', () => {
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
