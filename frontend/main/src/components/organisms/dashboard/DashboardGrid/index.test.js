import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import index from './index.vue';

const createWrapper = (options) => shallowMount(index, {
  global: {
    plugins: [
      createTestingPinia({
        createSpy: vi.fn,
        initialState: {
          dashboardConfig: {
            currentPageId: null,
            currentPageWidgets: [],
            loading: [],
          },
          device: {
            isMobileView: false,
          },
        },
      }),
    ],
  },
  ...options,
});

const propsDefault = {};

describe('DashboardGrid', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders', () => {
    const wrapper = createWrapper({
      props: { ...propsDefault },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly', async () => {
    const wrapper = createWrapper({
      props: { ...propsDefault },
    });
    expect(wrapper.element).toMatchSnapshot();
  });
});
