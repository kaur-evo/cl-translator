import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import index from './index.vue';

const createPinia = (overrides = {}) => createTestingPinia({
  createSpy: vi.fn,
  stubActions: false,
  initialState: {
    routeModule: {
      query: {
        name: 'test name',
        description: 'test description',
      },
    },
    ...overrides,
  },
});

describe('ReportsHeaderTitle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders', () => {
    const wrapper = mount(index, {
      global: {
        plugins: [createPinia()],
      },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly', () => {
    const wrapper = mount(index, {
      global: {
        plugins: [createPinia()],
      },
    });

    expect(wrapper.element).toMatchSnapshot();
  });
});
